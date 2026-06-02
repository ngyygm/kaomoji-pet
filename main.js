const { app, BrowserWindow, ipcMain, screen, powerMonitor, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

let mainWindow = null;
let mouseTracker = null;
let moveAnimTimer = null;
let lastPrankTime = 0;
let systemMonitorTimer = null;
let isCharging = true;
let cpuSamples = [];
const activeEffectWindows = new Map();
let mouseResetTimer = null;
let effectHitTestTimer = null;
const MAX_CONCURRENT_EFFECTS = 2;

function configureChromelessWindow(win) {
  if (typeof win.setAutoHideMenuBar === 'function') win.setAutoHideMenuBar(true);
  win.setMenuBarVisibility(false);
  if (typeof win.setMenu === 'function') win.setMenu(null);
}

function toWindowCoord(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  // Electron setPosition expects 32-bit signed integers
  if (rounded < -0x7FFFFFFF || rounded > 0x7FFFFFFF) return null;
  return rounded;
}

function setWindowPositionSafe(win, x, y) {
  if (!win || win.isDestroyed()) return false;
  const safeX = toWindowCoord(x);
  const safeY = toWindowCoord(y);
  if (safeX === null || safeY === null) return false;
  try {
    win.setPosition(safeX, safeY);
  } catch (err) {
    console.error('setPosition failed:', err.message, { x: safeX, y: safeY, rawX: x, rawY: y });
    return false;
  }
  return true;
}

function setWindowSizeSafe(win, width, height) {
  if (!win || win.isDestroyed()) return false;
  const safeWidth = toWindowCoord(width);
  const safeHeight = toWindowCoord(height);
  if (safeWidth === null || safeHeight === null) return false;
  win.setSize(Math.max(1, safeWidth), Math.max(1, safeHeight));
  return true;
}

const effectsDir = path.join(__dirname, 'renderer', 'effects');

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function getDefaultParams(effect) {
  const defaults = {};
  const schema = effect.params || {};
  for (const [key, def] of Object.entries(schema)) {
    if (def && Object.prototype.hasOwnProperty.call(def, 'default')) {
      defaults[key] = def.default;
    }
  }
  return { ...defaults, ...(effect.defaultParams || {}) };
}

function loadBigEffects() {
  if (!fs.existsSync(effectsDir)) return [];

  return fs.readdirSync(effectsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('_'))
    .map(entry => {
      const dir = path.join(effectsDir, entry.name);
      const manifestPath = path.join(dir, 'effect.json');
      if (!fs.existsSync(manifestPath)) return null;

      try {
        const manifest = readJsonFile(manifestPath);
        if (!manifest || manifest.enabled === false) return null;

        const entryFile = manifest.entry || 'index.html';
        const entryPath = path.join(dir, entryFile);
        if (!fs.existsSync(entryPath)) return null;

        return {
          ...manifest,
          id: manifest.id || entry.name,
          entry: entryFile,
          dir,
          entryPath
        };
      } catch (err) {
        console.error(`Failed to load effect manifest: ${manifestPath}`, err);
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => (a.order || 0) - (b.order || 0) || a.id.localeCompare(b.id));
}

function getBigEffectSummaries() {
  return loadBigEffects().map(effect => ({
    id: effect.id,
    name: effect.name || effect.id,
    emoji: effect.emoji || '✨',
    version: effect.version || '1.0.0',
    description: effect.description || '',
    duration: effect.duration || getDefaultParams(effect).duration || 4000,
    performance: effect.performance || null,
    params: effect.params || {},
    pet: effect.pet || {},
    petAnimation: effect.pet?.animation || effect.petAnimation || null,
    petAnimDuration: effect.pet?.animationDuration || effect.petAnimDuration || 3000,
    petParticles: effect.pet?.particles || effect.petParticles || null
  }));
}

function createEffectWindow(effect, resolvedParams) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const winConfig = effect.window || {};

  // CRITICAL: Effect window must NOT be alwaysOnTop on Windows.
  // On Windows, setIgnoreMouseEvents(true) + alwaysOnTop does NOT reliably
  // pass mouse events to windows below. The only reliable solution is to
  // make the main pet window (alwaysOnTop) sit ABOVE the effect window,
  // so the OS routes mouse events to the main window FIRST.
  // The effect is fullscreen-transparent, so its animation shows through
  // the main window's transparent areas.
  const effectWin = new BrowserWindow({
    title: ' ',
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    titleBarStyle: 'hidden',
    alwaysOnTop: false,
    resizable: false,
    focusable: false,
    skipTaskbar: true,
    autoHideMenuBar: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false
    }
  });

  configureChromelessWindow(effectWin);
  // setIgnoreMouseEvents(true) without {forward: true} — avoid low-level
  // hook conflicts with the main window.
  if (winConfig.clickThrough !== false) effectWin.setIgnoreMouseEvents(true);

  // Cancel any pending mouse reset — a new effect is starting
  if (mouseResetTimer) { clearTimeout(mouseResetTimer); mouseResetTimer = null; }

  // Force main window to capture ALL events during the effect.
  // Main window is alwaysOnTop, so it's above the effect window.
  // Mouse events reach main window first → kaomoji stays clickable.
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setIgnoreMouseEvents(false);
    mainWindow.moveTop();
    console.log('[EffectWindow] mainWindow forced to capture mode (ignoreMouseEvents=false)');
  }

  // Start polling cursor position for hit-test while effects are active
  startEffectHitTestPolling();

  // Notify renderer that effect is active — force capture mode
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('effect-active', true);
  }

  // Show effect window AFTER main window is raised, so z-order is correct
  effectWin.loadFile(effect.entryPath);
  effectWin.webContents.on('did-finish-load', () => {
    effectWin.showInactive(); // show without stealing focus
    const payload = {
      id: effect.id,
      duration: resolvedParams.duration,
      params: resolvedParams
    };
    effectWin.webContents.send('effect:start', payload);
    if (effect.startChannel) {
      effectWin.webContents.send(effect.startChannel, resolvedParams);
    }
    // Re-raise main window after effect window shows
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.moveTop();
    }
  });

  effectWin.on('closed', () => {
    if (activeEffectWindows.get(effect.id) === effectWin) {
      activeEffectWindows.delete(effect.id);
    }
    // Debounced reset: if multiple effects close in quick succession,
    // only trigger one reset after the last one settles.
    if (mouseResetTimer) clearTimeout(mouseResetTimer);
    mouseResetTimer = setTimeout(() => {
      mouseResetTimer = null;
      if (mainWindow && !mainWindow.isDestroyed()) {
        // Restore to normal hit-test mode
        mainWindow.setIgnoreMouseEvents(true, { forward: true });

        if (activeEffectWindows.size === 0) {
          stopEffectHitTestPolling();
          // Notify renderer that effects are done — resume normal hit-test
          mainWindow.webContents.send('effect-active', false);
        }

        // Send cursor position for synthetic hit-test
        try {
          const cursor = screen.getCursorScreenPoint();
          const bounds = mainWindow.getBounds();
          mainWindow.webContents.send('mouse-state-reset', {
            relX: cursor.x - bounds.x,
            relY: cursor.y - bounds.y
          });
        } catch (err) {
          // Send without coords — renderer will fall back to cached position
          mainWindow.webContents.send('mouse-state-reset', null);
        }
      }
    }, 100);
  });

  return effectWin;
}

function runBigEffect(effectId, params = {}) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  if (!width || !height) return { success: false, error: 'Screen off, skipping effect' };

  const effect = loadBigEffects().find(item => item.id === effectId);
  if (!effect) return { success: false, error: `Unknown big effect: ${effectId}` };

  const defaults = getDefaultParams(effect);
  const resolvedParams = {
    ...defaults,
    ...(params || {})
  };
  resolvedParams.duration = Number(resolvedParams.duration || effect.duration || 4000);

  const existing = activeEffectWindows.get(effect.id);
  if (existing && !existing.isDestroyed()) existing.close();

  // Cap concurrent effect windows to prevent OS-level mouse routing confusion
  if (activeEffectWindows.size >= MAX_CONCURRENT_EFFECTS) {
    const [oldestId, oldestWin] = activeEffectWindows.entries().next().value;
    if (oldestWin && !oldestWin.isDestroyed()) oldestWin.close();
  }

  const win = createEffectWindow(effect, resolvedParams);
  activeEffectWindows.set(effect.id, win);

  const closeAfter = Number(effect.closeAfterMs || (resolvedParams.duration + (effect.closeBufferMs ?? 3000)));
  setTimeout(() => {
    if (!win.isDestroyed()) win.close();
  }, closeAfter);

  return { success: true };
}

ipcMain.handle('gpu:status', () => ({
  featureStatus: app.getGPUFeatureStatus(),
  appMetrics: app.getAppMetrics()
}));

// Effect hit-test polling: while effect windows are active, periodically
// send cursor position to the renderer so it can do hit-testing even when
// OS-level mouse events don't properly route through effect windows.
function startEffectHitTestPolling() {
  if (effectHitTestTimer) return;
  effectHitTestTimer = setInterval(() => {
    if (activeEffectWindows.size === 0 || !mainWindow || mainWindow.isDestroyed()) {
      stopEffectHitTestPolling();
      return;
    }
    try {
      const cursor = screen.getCursorScreenPoint();
      const bounds = mainWindow.getBounds();
      mainWindow.webContents.send('effect-hit-test', {
        relX: cursor.x - bounds.x,
        relY: cursor.y - bounds.y
      });
    } catch (_) {}
  }, 150);
}

function stopEffectHitTestPolling() {
  if (effectHitTestTimer) {
    clearInterval(effectHitTestTimer);
    effectHitTestTimer = null;
  }
}

function createMainWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    title: ' ',
    width: 350,
    height: 260,
    x: screenWidth - 370,
    y: screenHeight - 310,
    transparent: true,
    frame: false,
    titleBarStyle: 'hidden',
    alwaysOnTop: true,
    skipTaskbar: true,
    autoHideMenuBar: true,
    resizable: false,
    hasShadow: false,
    backgroundColor: '#00000000',
    titleBarOverlay: false,
    focusable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  });

  configureChromelessWindow(mainWindow);
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.setVisibleOnAllWorkspaces(true);

  // Let transparent pixels pass through mouse clicks to windows below
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    stopMouseTracker();
    stopSystemMonitor();
    if (moveAnimTimer) { clearInterval(moveAnimTimer); moveAnimTimer = null; }
  });

  startMouseTracker();
}

function startMouseTracker() {
  let lastX = 0, lastY = 0;
  mouseTracker = setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      stopMouseTracker();
      return;
    }
    const point = screen.getCursorScreenPoint();
    const winBounds = mainWindow.getBounds();
    const relX = point.x - winBounds.x;
    const relY = point.y - winBounds.y;
    const distance = Math.sqrt(
      Math.pow(point.x - lastX, 2) + Math.pow(point.y - lastY, 2)
    );

    mainWindow.webContents.send('global-mouse', {
      screenX: point.x,
      screenY: point.y,
      relX,
      relY,
      winCenterX: winBounds.width / 2,
      winCenterY: winBounds.height / 2,
      speed: distance
    });

    lastX = point.x;
    lastY = point.y;
  }, 200);
}

function stopMouseTracker() {
  if (mouseTracker) {
    clearInterval(mouseTracker);
    mouseTracker = null;
  }
}

function getCpuUsage() {
  const cpus = os.cpus();
  let totalIdle = 0, totalTick = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  }
  return { idle: totalIdle, total: totalTick };
}

function startSystemMonitor() {
  let prevCpu = getCpuUsage();

  systemMonitorTimer = setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      stopSystemMonitor();
      return;
    }

    // CPU usage (smoothed over 3 samples)
    const currCpu = getCpuUsage();
    const idleDiff = currCpu.idle - prevCpu.idle;
    const totalDiff = currCpu.total - prevCpu.total;
    const cpuPercent = totalDiff > 0 ? 1 - idleDiff / totalDiff : 0;
    prevCpu = currCpu;
    cpuSamples.push(cpuPercent);
    if (cpuSamples.length > 3) cpuSamples.shift();
    const cpuSmooth = cpuSamples.reduce((a, b) => a + b, 0) / cpuSamples.length;

    // Memory
    const memInfo = process.getSystemMemoryInfo();
    const memPercent = memInfo.total > 0 ? (memInfo.total - memInfo.free) / memInfo.total : 0;

    // Battery (Windows WMIC fallback)
    let batteryLevel = 100;
    try {
      const output = execSync('wmic path win32_battery get EstimatedChargeRemaining', { timeout: 3000 }).toString();
      const match = output.match(/\d+/);
      if (match) batteryLevel = parseInt(match[0], 10);
    } catch (_) { /* no battery */ }

    // Idle time
    let idleSeconds = 0;
    try {
      idleSeconds = powerMonitor.getSystemIdleTime();
    } catch (_) { /* powerMonitor not ready */ }

    mainWindow.webContents.send('system-metrics', {
      cpu: cpuSmooth,
      memoryPercent: memPercent,
      batteryLevel,
      isCharging,
      idleSeconds
    });
  }, 5000);

  // Charging state
  try {
    powerMonitor.on('on-battery', () => { isCharging = false; });
    powerMonitor.on('on-ac', () => { isCharging = true; });
  } catch (_) {}
}

function stopSystemMonitor() {
  if (systemMonitorTimer) {
    clearInterval(systemMonitorTimer);
    systemMonitorTimer = null;
  }
}

// Ensure the window is within the current screen bounds.
// If it's off-screen (resolution change, monitor disconnect, resume from sleep),
// move it back to the bottom-right corner.
function ensureWindowOnScreen(win) {
  if (!win || win.isDestroyed()) return;
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  if (!width || !height) return;
  const [curX, curY] = win.getPosition();
  const [winW, winH] = win.getSize();
  const padding = 20;
  // Off-screen if completely outside the work area
  if (curX + winW < 0 || curY + winH < 0 || curX > width || curY > height) {
    setWindowPositionSafe(win, width - winW - padding, height - winH - padding);
  }
}

// === IPC Handlers ===

ipcMain.on('window-move', (event, { deltaX, deltaY }) => {
  if (mainWindow) {
    const [x, y] = mainWindow.getPosition();
    setWindowPositionSafe(mainWindow, x + deltaX, y + deltaY);
  }
});

ipcMain.on('set-window-position', (event, { x, y }) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    setWindowPositionSafe(mainWindow, x, y);
  }
});

// Smooth move window to target position with curved paths
function generateCurvePath(sx, sy, tx, ty, type) {
  const points = [];
  const dx = tx - sx, dy = ty - sy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Dynamic step count: ~2px per step for natural strolling pace
  const steps = Math.max(40, Math.ceil(dist / 2));

  if (dist < 5) {
    points.push({ x: tx, y: ty });
    return points;
  }

  const nx = dx / dist, ny = dy / dist;
  const perpX = -ny, perpY = nx;

  if (!type || type === 'linear') {
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      points.push({ x: sx + dx * t, y: sy + dy * t });
    }
  } else if (type === 'sine') {
    const amplitude = 25 + Math.random() * 50;
    const frequency = 1.5 + Math.random() * 2.5;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const envelope = Math.sin(t * Math.PI);
      const offset = Math.sin(t * Math.PI * frequency) * amplitude * envelope;
      points.push({
        x: sx + dx * t + perpX * offset,
        y: sy + dy * t + perpY * offset
      });
    }
  } else if (type === 'bezier') {
    const mx = (sx + tx) / 2, my = (sy + ty) / 2;
    const offset = (Math.random() > 0.5 ? 1 : -1) * (40 + Math.random() * 80);
    const cx = mx + perpX * offset;
    const cy = my + perpY * offset;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      points.push({
        x: (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cx + t * t * tx,
        y: (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cy + t * t * ty
      });
    }
  } else if (type === 'arc') {
    const bulge = (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.4);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const offset = Math.sin(t * Math.PI) * dist * bulge;
      points.push({
        x: sx + dx * t + perpX * offset,
        y: sy + dy * t + perpY * offset
      });
    }
  } else {
    // Fallback: linear
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      points.push({ x: sx + dx * t, y: sy + dy * t });
    }
  }

  return points;
}

ipcMain.on('move-window-to', (event, { targetX, targetY, curveType, step }) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (typeof targetX !== 'number' || typeof targetY !== 'number') return;
  if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) return;
  if (moveAnimTimer) { clearInterval(moveAnimTimer); moveAnimTimer = null; }

  // Handle legacy 'step' parameter for jump (large number = instant)
  if ((typeof step === 'number' && step > 100) || (typeof curveType === 'number' && curveType > 100)) {
    setWindowPositionSafe(mainWindow, targetX, targetY);
    mainWindow.webContents.send('walk-done');
    return;
  }

  const [startX, startY] = mainWindow.getPosition();
  const waypoints = generateCurvePath(startX, startY, targetX, targetY, curveType);
  let wpIndex = 0;

  moveAnimTimer = setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      clearInterval(moveAnimTimer);
      moveAnimTimer = null;
      return;
    }

    // Random but gentle speed: 1-2 steps per tick
    const speed = Math.random() < 0.6 ? 1 : 2;
    wpIndex += speed;

    if (wpIndex >= waypoints.length) {
      setWindowPositionSafe(mainWindow, targetX, targetY);
      clearInterval(moveAnimTimer);
      moveAnimTimer = null;
      mainWindow.webContents.send('walk-done');
      return;
    }

    const wp = waypoints[wpIndex];
    setWindowPositionSafe(mainWindow, wp.x, wp.y);
  }, 30);
});

// Stop walking
ipcMain.on('stop-walk', () => {
  if (moveAnimTimer) { clearInterval(moveAnimTimer); moveAnimTimer = null; }
});

// Get screen size
ipcMain.handle('get-screen-size', () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  return { width, height };
});

// Get window position
ipcMain.handle('get-window-position', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const [x, y] = mainWindow.getPosition();
    return { x, y };
  }
  return null;
});

// Get window size
ipcMain.handle('get-window-size', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const [w, h] = mainWindow.getSize();
    return { width: w, height: h };
  }
  return null;
});

ipcMain.on('resize-window', (event, { width, height }) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    setWindowSizeSafe(mainWindow, width, height);
  }
});

ipcMain.on('set-ignore-mouse', (event, { ignore, options }) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    console.log(`[MAIN] setIgnoreMouseEvents(${ignore}, ${JSON.stringify(options)})`);
    mainWindow.setIgnoreMouseEvents(ignore, options || {});
  }
});

// Debug: pipe renderer console.log to main process terminal
ipcMain.on('renderer-log', (event, msg) => {
  console.log(`[RENDERER] ${msg}`);
});

// Rename dialog — opens a separate small window so main window stays frameless
ipcMain.handle('show-rename-dialog', (event, currentName) => {
  return new Promise((resolve) => {
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
    const rw = 280, rh = 140;
    const rx = Math.round((sw - rw) / 2);
    const ry = Math.round((sh - rh) / 2);

    const renameWin = new BrowserWindow({
      title: ' ',
      width: rw, height: rh,
      x: rx, y: ry,
      frame: false,
      titleBarStyle: 'hidden',
      transparent: true,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      autoHideMenuBar: true,
      hasShadow: false,
      backgroundColor: '#00000000',
      focusable: true,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    renameWin.setMenuBarVisibility(false);
    renameWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
          background: rgba(255,255,255,0.95);
          border-radius: 14px;
          padding: 18px 24px;
          font-family: 'Segoe UI', sans-serif;
          box-shadow: 0 4px 24px rgba(129,140,248,0.15);
        }
        h4 { color: #f472b6; margin-bottom: 12px; font-size: 14px; }
        input {
          width: 100%; padding: 6px 10px; border: 1px solid rgba(200,180,210,0.3);
          border-radius: 8px; font-size: 14px; text-align: center; outline: none; color: #444;
        }
        input:focus { border-color: #818cf8; }
        .btns { display:flex; gap:8px; margin-top:10px; justify-content:center; }
        button {
          padding: 5px 18px; border: none; border-radius: 8px; font-size: 13px; cursor: pointer;
        }
        .ok { background: linear-gradient(135deg, #818cf8, #f9a8d4); color: white; }
        .cancel { background: #eee; color: #666; }
      </style>
      <h4>给猫猫取个名字</h4>
      <input id="name" value="${currentName || '小猫咪'}" maxlength="10" autofocus />
      <div class="btns">
        <button class="cancel" onclick="window.close()">取消</button>
        <button class="ok" id="ok">确定</button>
      </div>
      <script>
        const { ipcRenderer } = require('electron');
        document.getElementById('ok').onclick = () => {
          ipcRenderer.send('rename-result', document.getElementById('name').value.trim() || '小猫咪');
        };
        document.getElementById('name').addEventListener('keydown', e => {
          if (e.key === 'Enter') document.getElementById('ok').click();
          if (e.key === 'Escape') window.close();
        });
      </script>
    `)}`);

    renameWin.once('ready-to-show', () => {
      renameWin.show();
      renameWin.focus();
    });

    ipcMain.once('rename-result', (_, name) => {
      if (!renameWin.isDestroyed()) renameWin.close();
      resolve(name);
    });

    renameWin.on('closed', () => {
      ipcMain.removeAllListeners('rename-result');
      // Reset mouse state after rename dialog closes (it steals focus)
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setIgnoreMouseEvents(true, { forward: true });
        try {
          const cursor = screen.getCursorScreenPoint();
          const bounds = mainWindow.getBounds();
          mainWindow.webContents.send('mouse-state-reset', {
            relX: cursor.x - bounds.x,
            relY: cursor.y - bounds.y
          });
        } catch (err) {
          mainWindow.webContents.send('mouse-state-reset', null);
        }
      }
      resolve(null);
    });
  });
});

const saveDir = app.getPath('userData');

ipcMain.on('save-data', (event, data) => {
  const fs = require('fs');
  const savePath = path.join(saveDir, 'save.json');
  fs.mkdirSync(saveDir, { recursive: true });
  fs.writeFileSync(savePath, JSON.stringify(data, null, 2), 'utf-8');
  event.reply('save-result', { success: true });
});

ipcMain.handle('load-data', () => {
  const fs = require('fs');
  const savePath = path.join(saveDir, 'save.json');
  if (fs.existsSync(savePath)) {
    const raw = fs.readFileSync(savePath, 'utf-8');
    return JSON.parse(raw);
  }
  return null;
});

ipcMain.on('close-app', () => {
  stopMouseTracker();
  stopSystemMonitor();
  if (moveAnimTimer) { clearInterval(moveAnimTimer); moveAnimTimer = null; }
  if (mainWindow) mainWindow.close();
  app.quit();
});

ipcMain.handle('big-effects:list', () => getBigEffectSummaries());
ipcMain.handle('big-effects:run', (event, { id, params }) => runBigEffect(id, params));

// Compatibility bridges for older renderer actions.
ipcMain.on('prank-giant', (event, { kaomoji, duration }) => {
  const now = Date.now();
  if (now - lastPrankTime < 20 * 60 * 1000) return;
  lastPrankTime = now;
  runBigEffect('giant', { kaomoji: kaomoji || null, duration: duration || 4000 });
});

ipcMain.on('easter-egg-giant', (event, { kaomoji, color, duration, mode }) => {
  const effectId = mode === 'billiard' ? 'billiard' : 'giant';
  runBigEffect(effectId, { kaomoji: kaomoji || null, color: color || null, mode: mode || null, duration: duration || 3500 });
});

ipcMain.on('care-rain', (event, { messages, duration, opacity }) => {
  runBigEffect('care-rain', { messages, duration: duration || 8000, opacity: opacity || 0.7 });
});

ipcMain.on('parade', (event, { duration }) => runBigEffect('parade', { duration }));
ipcMain.on('invaders', (event, { duration }) => runBigEffect('invaders', { duration }));
ipcMain.on('bullet-waltz', (event, { duration }) => runBigEffect('bullet-waltz', { duration }));
ipcMain.on('tornado', (event, { duration }) => runBigEffect('tornado', { duration }));
ipcMain.on('fireworks', (event, { duration }) => runBigEffect('fireworks', { duration }));

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createMainWindow();
  startSystemMonitor();

  // === AUTO TEST MODE ===
  // Trigger a big effect after 6 seconds, then check state
  if (process.argv.includes('--test-mouse')) {
    console.log('\n=== MOUSE TEST MODE ===');
    console.log('Will auto-trigger big effect in 6 seconds...');

    setTimeout(() => {
      console.log('[TEST] Triggering big effect "giant"...');
      const result = runBigEffect('giant', { duration: 3000 });
      console.log('[TEST] runBigEffect result:', result);

      // After 1 second, check the state
      setTimeout(() => {
        console.log('[TEST] === STATE CHECK AFTER EFFECT START ===');
        console.log('[TEST] activeEffectWindows:', activeEffectWindows.size);
        if (mainWindow && !mainWindow.isDestroyed()) {
          console.log('[TEST] mainWindow.isAlwaysOnTop():', mainWindow.isAlwaysOnTop());
        }

        // After effect should be done (3s + 3s buffer = 6s), check again
        setTimeout(() => {
          console.log('[TEST] === STATE CHECK AFTER EFFECT SHOULD BE DONE ===');
          console.log('[TEST] activeEffectWindows:', activeEffectWindows.size);
          if (mainWindow && !mainWindow.isDestroyed()) {
            console.log('[TEST] mainWindow.isAlwaysOnTop():', mainWindow.isAlwaysOnTop());
          }
        }, 7000);
      }, 1000);
    }, 6000);
  }

  // Handle display changes: resolution change, monitor add/remove, remote desktop switch
  screen.on('display-metrics-changed', () => {
    if (moveAnimTimer) { clearInterval(moveAnimTimer); moveAnimTimer = null; }
    ensureWindowOnScreen(mainWindow);
  });

  screen.on('display-removed', () => {
    if (moveAnimTimer) { clearInterval(moveAnimTimer); moveAnimTimer = null; }
    ensureWindowOnScreen(mainWindow);
  });
});

// Crash recovery: recreate window if renderer crashes
app.on('render-process-gone', (_, webContents, details) => {
  console.error('Renderer crashed:', details.reason);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.reload();
  } else {
    createMainWindow();
  }
});

// Handle system suspend/resume
try {
  powerMonitor.on('suspend', () => {
    // Stop walk animation to prevent crash when screen returns {0,0}
    if (moveAnimTimer) { clearInterval(moveAnimTimer); moveAnimTimer = null; }
  });

  powerMonitor.on('resume', () => {
    // Stop any stale walk animation
    if (moveAnimTimer) { clearInterval(moveAnimTimer); moveAnimTimer = null; }

    if (!mainWindow || mainWindow.isDestroyed()) {
      createMainWindow();
    } else {
      ensureWindowOnScreen(mainWindow);
    }
    // Restart system monitor if it died
    if (!systemMonitorTimer) startSystemMonitor();
    if (!mouseTracker) startMouseTracker();
  });
} catch (_) {}

app.on('window-all-closed', () => {
  stopMouseTracker();
  stopSystemMonitor();
  app.quit();
});

app.on('before-quit', () => {
  stopMouseTracker();
  stopSystemMonitor();
  if (moveAnimTimer) { clearInterval(moveAnimTimer); moveAnimTimer = null; }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('app-closing');
  }
});
