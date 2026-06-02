const { BrowserWindow, screen } = require('electron');
const path = require('path');

function toWindowCoord(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function configureChromelessWindow(win) {
  if (typeof win.setAutoHideMenuBar === 'function') win.setAutoHideMenuBar(true);
  win.setMenuBarVisibility(false);
  if (typeof win.setMenu === 'function') win.setMenu(null);
}

class WindowService {
  constructor({ logger }) {
    this.logger = logger;
    this.mainWindow = null;
    this._heartbeatTimer = null;
  }

  createMainWindow() {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

    this.mainWindow = new BrowserWindow({
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
        preload: path.join(__dirname, '..', '..', 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        backgroundThrottling: false
      }
    });

    configureChromelessWindow(this.mainWindow);
    // Always capture mouse events — left-click must never break.
    // Trade-off: transparent areas also capture, but the window is small (350×260).
    this.mainWindow.setIgnoreMouseEvents(false);
    this.mainWindow.loadFile(path.join(__dirname, '..', '..', 'renderer', 'index.html'));
    this.mainWindow.setVisibleOnAllWorkspaces(true);

    this.mainWindow.once('ready-to-show', () => {
      if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
      this.mainWindow.show();
      this.startHeartbeat();
      this.logger.write('app-ready', 'main', this.getState());
    });

    this.mainWindow.on('closed', () => {
      this.stopHeartbeat();
      this.logger.write('window-closed', 'main');
      this.mainWindow = null;
    });

    this.logger.write('window-created', 'main', this.getState(), { capture: true });
    return this.mainWindow;
  }

  getWindow() {
    return this.mainWindow && !this.mainWindow.isDestroyed() ? this.mainWindow : null;
  }

  getState() {
    const win = this.getWindow();
    if (!win) return { exists: false };
    const bounds = win.getBounds();
    return {
      exists: true,
      bounds,
      alwaysOnTop: true,
      mouseCapture: true
    };
  }

  send(channel, payload) {
    const win = this.getWindow();
    if (!win) return;
    win.webContents.send(channel, payload);
  }

  setPosition(x, y) {
    const win = this.getWindow();
    const safeX = toWindowCoord(x);
    const safeY = toWindowCoord(y);
    if (!win || safeX === null || safeY === null) return false;

    try {
      win.setIgnoreMouseEvents(false);
      win.setPosition(safeX, safeY);
      return true;
    } catch (err) {
      this.logger.write('ipc-error', 'main', null, {
        ipc: 'window:setPosition',
        message: err.message,
        x: safeX,
        y: safeY
      });
      return false;
    }
  }

  setSize(width, height) {
    const win = this.getWindow();
    const safeWidth = toWindowCoord(width);
    const safeHeight = toWindowCoord(height);
    if (!win || safeWidth === null || safeHeight === null) return false;

    try {
      win.setSize(Math.max(1, safeWidth), Math.max(1, safeHeight));
      return true;
    } catch (err) {
      this.logger.write('ipc-error', 'main', null, {
        ipc: 'window:setSize',
        message: err.message,
        width: safeWidth,
        height: safeHeight
      });
      return false;
    }
  }

  /**
   * Periodically re-assert critical window properties.
   * Windows 10 DWM can stop delivering WM_LBUTTONDOWN to
   * WS_EX_LAYERED (transparent) alwaysOnTop windows after
   * minutes of idle — while WM_MOUSEMOVE and WM_RBUTTONDOWN
   * continue to work.  Toggling the flag forces DWM to
   * refresh its internal hit-test cache; a simple re-set
   * of the same value does NOT.
   */
  startHeartbeat() {
    this.stopHeartbeat();
    this._heartbeatTimer = setInterval(() => {
      const win = this.getWindow();
      if (!win) return;
      // Toggle: true then false forces a state transition
      // that DWM actually processes. Setting the same value
      // is a no-op at the OS level.
      win.setIgnoreMouseEvents(true);
      win.setIgnoreMouseEvents(false);
      win.setAlwaysOnTop(true);
    }, 10_000);
  }

  stopHeartbeat() {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
  }

  closeApp(app) {
    const win = this.getWindow();
    if (win) win.webContents.send('app:closing');
    if (win) win.close();
    app.quit();
  }
}

module.exports = { WindowService, configureChromelessWindow };
