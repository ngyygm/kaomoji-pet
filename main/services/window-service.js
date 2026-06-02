const { BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

class WindowService {
  constructor({ logger }) {
    this.logger = logger;
    this.mainWindow = null;
  }

  registerIpc() {
    ipcMain.handle('window:getState', () => this.getState());
    ipcMain.handle('window:getPosition', () => {
      const win = this.getWindow();
      if (!win) return null;
      const [x, y] = win.getPosition();
      return { x, y };
    });
    ipcMain.handle('window:getSize', () => {
      const win = this.getWindow();
      if (!win) return null;
      const [width, height] = win.getSize();
      return { width, height };
    });
    ipcMain.handle('window:setPosition', (_, payload) => this.setPosition(payload?.x, payload?.y));
    ipcMain.handle('window:setSize', (_, payload) => this.setSize(payload?.width, payload?.height));
    ipcMain.handle('window:blur', () => this.blurWindow());
    ipcMain.handle('window:getScreenSize', () => {
      const { width, height } = screen.getPrimaryDisplay().workAreaSize;
      return { width, height };
    });
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
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      hasShadow: false,
      backgroundColor: '#00000000',
      focusable: false,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, '..', '..', 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        backgroundThrottling: false
      }
    });

    this.mainWindow.removeMenu();
    this.mainWindow.setIgnoreMouseEvents(false);
    this.mainWindow.loadFile(path.join(__dirname, '..', '..', 'renderer', 'index.html'));
    this.mainWindow.setVisibleOnAllWorkspaces(true);

    this.mainWindow.once('ready-to-show', () => {
      if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
      this.mainWindow.showInactive();
      this.logger.write('app-ready', 'main', this.getState());
    });

    // 窗口失焦时立即重置视觉状态，防止 Windows DWM 绘制标题栏
    this.mainWindow.on('blur', () => {
      if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
      this.mainWindow.showInactive();
    });

    // Windows: 拦截 WM_NCACTIVATE (0x0086)，在 DWM 层面重置视觉状态
    // focusable:false 下 Electron 的 blur 事件可能不触发，
    // 但 Windows 仍会发送 WM_NCACTIVATE 改变非客户区绘制
    if (process.platform === 'win32') {
      this.mainWindow.hookWindowMessage(0x0086, () => {
        setTimeout(() => {
          if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
          this.mainWindow.showInactive();
        }, 0);
      });
    }

    this.mainWindow.on('closed', () => {
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
    return { exists: true, bounds: win.getBounds() };
  }

  send(channel, payload) {
    const win = this.getWindow();
    if (!win) return;
    win.webContents.send(channel, payload);
  }

  setPosition(x, y) {
    const win = this.getWindow();
    if (!win) return false;
    try {
      win.setPosition(Math.round(x), Math.round(y));
      return true;
    } catch (err) {
      this.logger.write('ipc-error', 'main', null, { ipc: 'window:setPosition', message: err.message });
      return false;
    }
  }

  setSize(width, height) {
    const win = this.getWindow();
    if (!win) return false;
    try {
      win.setSize(Math.max(1, Math.round(width)), Math.max(1, Math.round(height)));
      return true;
    } catch (err) {
      this.logger.write('ipc-error', 'main', null, { ipc: 'window:setSize', message: err.message });
      return false;
    }
  }

  blurWindow() {
    const win = this.getWindow();
    if (win) win.showInactive();
  }

  closeApp(app) {
    const win = this.getWindow();
    if (win) win.webContents.send('app:closing');
    if (win) win.close();
    app.quit();
  }
}

module.exports = { WindowService };
