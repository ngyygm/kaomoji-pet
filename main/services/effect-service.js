const { BrowserWindow, screen } = require('electron');
const fs = require('fs');
const path = require('path');
const { configureChromelessWindow } = require('./window-service');

class EffectService {
  constructor({ windowService, logger }) {
    this.windowService = windowService;
    this.logger = logger;
    this.effectsDir = path.join(__dirname, '..', '..', 'renderer', 'effects');
    this.activeEffectWindows = new Map();
    this.maxConcurrentEffects = 2;
  }

  readJsonFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  getDefaultParams(effect) {
    const defaults = {};
    const schema = effect.params || {};
    for (const [key, def] of Object.entries(schema)) {
      if (def && Object.prototype.hasOwnProperty.call(def, 'default')) defaults[key] = def.default;
    }
    return { ...defaults, ...(effect.defaultParams || {}) };
  }

  loadEffects() {
    if (!fs.existsSync(this.effectsDir)) return [];

    return fs.readdirSync(this.effectsDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('_'))
      .map(entry => this.loadEffect(entry.name))
      .filter(Boolean)
      .sort((a, b) => (a.order || 0) - (b.order || 0) || a.id.localeCompare(b.id));
  }

  loadEffect(name) {
    const dir = path.join(this.effectsDir, name);
    const manifestPath = path.join(dir, 'effect.json');
    if (!fs.existsSync(manifestPath)) return null;

    try {
      const manifest = this.readJsonFile(manifestPath);
      if (!manifest || manifest.enabled === false) return null;

      const entry = manifest.entry || 'index.html';
      const entryPath = path.join(dir, entry);
      if (!fs.existsSync(entryPath)) return null;

      return {
        ...manifest,
        id: manifest.id || name,
        entry,
        dir,
        entryPath
      };
    } catch (err) {
      this.logger.write('ipc-error', 'main', null, {
        ipc: 'effects:list',
        message: err.message,
        manifestPath
      });
      return null;
    }
  }

  listSummaries() {
    const effects = this.loadEffects().map(effect => ({
      id: effect.id,
      name: effect.name || effect.id,
      emoji: effect.emoji || '*',
      version: effect.version || '1.0.0',
      description: effect.description || '',
      duration: effect.duration || this.getDefaultParams(effect).duration || 4000,
      performance: effect.performance || null,
      params: effect.params || {},
      pet: effect.pet || {},
      petAnimation: effect.pet?.animation || effect.petAnimation || null,
      petAnimDuration: effect.pet?.animationDuration || effect.petAnimDuration || 3000,
      petParticles: effect.pet?.particles || effect.petParticles || null
    }));

    this.logger.write('effect:list', 'main', null, {
      count: effects.length,
      ids: effects.map(effect => effect.id)
    });
    return effects;
  }

  run(effectId, params = {}) {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    if (!width || !height) return { success: false, error: 'Screen is unavailable' };

    const effect = this.loadEffects().find(item => item.id === effectId);
    if (!effect) return { success: false, error: `Unknown effect: ${effectId}` };

    const defaults = this.getDefaultParams(effect);
    const resolvedParams = { ...defaults, ...(params || {}) };
    resolvedParams.duration = Number(resolvedParams.duration || effect.duration || 4000);

    this.logger.write('effect:start-request', 'main', null, { id: effect.id, params: resolvedParams });
    this.closeExisting(effect.id, 'replace');
    this.closeOldestIfNeeded();

    const win = this.createEffectWindow(effect, resolvedParams);
    this.activeEffectWindows.set(effect.id, win);

    const closeAfter = Number(effect.closeAfterMs || (resolvedParams.duration + (effect.closeBufferMs ?? 3000)));
    setTimeout(() => {
      if (!win.isDestroyed()) win.close();
    }, closeAfter);

    return { success: true, id: effect.id, closeAfter };
  }

  closeExisting(effectId, reason) {
    const existing = this.activeEffectWindows.get(effectId);
    if (existing && !existing.isDestroyed()) {
      this.logger.write('effect:closing-existing', 'main', null, { id: effectId, reason });
      existing.close();
    }
    this.activeEffectWindows.delete(effectId);
  }

  closeOldestIfNeeded() {
    if (this.activeEffectWindows.size < this.maxConcurrentEffects) return;
    const [oldestId, oldestWin] = this.activeEffectWindows.entries().next().value;
    this.activeEffectWindows.delete(oldestId);
    this.logger.write('effect:closing-oldest', 'main', null, { id: oldestId });
    if (oldestWin && !oldestWin.isDestroyed()) oldestWin.close();
  }

  createEffectWindow(effect, resolvedParams) {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const winConfig = effect.window || {};
    const mainWindow = this.windowService.getWindow();

    const effectWin = new BrowserWindow({
      title: ' ',
      width,
      height,
      x: 0,
      y: 0,
      transparent: true,
      frame: false,
      titleBarStyle: 'hidden',
      alwaysOnTop: winConfig.alwaysOnTop !== false,
      resizable: false,
      focusable: false,
      skipTaskbar: true,
      autoHideMenuBar: true,
      hasShadow: false,
      backgroundColor: '#00000000',
      parent: mainWindow || undefined,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        backgroundThrottling: false
      }
    });

    configureChromelessWindow(effectWin);
    effectWin.setIgnoreMouseEvents(true, { forward: true });
    this.logger.write('effect:window-created', 'main', null, {
      id: effect.id,
      clickThrough: true,
      activeCount: this.activeEffectWindows.size + 1
    });
    this.windowService.send('effects:started', { id: effect.id, params: resolvedParams });

    effectWin.loadFile(effect.entryPath);
    effectWin.webContents.on('did-finish-load', () => {
      const payload = {
        id: effect.id,
        duration: resolvedParams.duration,
        params: resolvedParams
      };
      effectWin.setIgnoreMouseEvents(true, { forward: true });
      effectWin.webContents.send('effect:start', payload);
      if (effect.startChannel) effectWin.webContents.send(effect.startChannel, resolvedParams);
    });

    effectWin.on('closed', () => {
      if (this.activeEffectWindows.get(effect.id) === effectWin) this.activeEffectWindows.delete(effect.id);
      this.logger.write('effect:closed', 'main', null, {
        id: effect.id,
        activeCount: this.activeEffectWindows.size
      });
      this.windowService.send('effects:closed', { id: effect.id, activeCount: this.activeEffectWindows.size });
    });

    return effectWin;
  }
}

module.exports = { EffectService };
