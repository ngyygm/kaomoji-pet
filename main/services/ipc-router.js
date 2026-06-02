const { BrowserWindow, ipcMain, screen } = require('electron');

class IpcRouter {
  constructor({ app, logger, windowService, movementService, effectService, systemService, saveService }) {
    this.app = app;
    this.logger = logger;
    this.windowService = windowService;
    this.movementService = movementService;
    this.effectService = effectService;
    this.systemService = systemService;
    this.saveService = saveService;
  }

  register() {
    ipcMain.handle('window:getState', () => this.windowService.getState());
    ipcMain.handle('window:getScreenSize', () => this.movementService.getScreenSize());
    ipcMain.handle('window:getPosition', () => {
      const win = this.windowService.getWindow();
      if (!win) return null;
      const [x, y] = win.getPosition();
      return { x, y };
    });
    ipcMain.handle('window:getSize', () => {
      const win = this.windowService.getWindow();
      if (!win) return null;
      const [width, height] = win.getSize();
      return { width, height };
    });
    ipcMain.handle('window:setPosition', (_, payload) => this.windowService.setPosition(payload?.x, payload?.y));
    ipcMain.handle('window:setSize', (_, payload) => this.windowService.setSize(payload?.width, payload?.height));
    ipcMain.handle('window:moveTo', (_, payload) => this.movementService.moveTo(payload || {}));
    ipcMain.handle('window:stopMovement', (_, payload) => {
      this.movementService.stop(payload?.reason || 'ipc');
      return { success: true };
    });

    ipcMain.handle('system:getSnapshot', () => this.systemService.getSnapshot());
    ipcMain.handle('effects:list', () => this.effectService.listSummaries());
    ipcMain.handle('effects:run', (_, payload) => this.effectService.run(payload?.id, payload?.params || {}));
    ipcMain.handle('save:load', () => this.saveService.load());
    ipcMain.handle('save:write', (_, data) => this.saveService.write(data));
    ipcMain.on('log:write', (_, payload) => {
      this.logger.write(payload?.event || 'renderer-log', payload?.source || 'renderer', payload?.state || null, payload?.details || null);
    });
    ipcMain.on('app:close', () => {
      this.movementService.stop('app-close');
      this.systemService.stop();
      this.windowService.closeApp(this.app);
    });

    ipcMain.handle('dialog:rename', (_, currentName) => this.showRenameDialog(currentName));
    ipcMain.handle('gpu:status', () => ({
      featureStatus: this.app.getGPUFeatureStatus(),
      appMetrics: this.app.getAppMetrics()
    }));

    this.logger.write('ipc-ready', 'main');
  }

  showRenameDialog(currentName) {
    return new Promise((resolve) => {
      const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
      const rw = 280;
      const rh = 140;
      const rx = Math.round((sw - rw) / 2);
      const ry = Math.round((sh - rh) / 2);

      const renameWin = new BrowserWindow({
        title: ' ',
        width: rw,
        height: rh,
        x: rx,
        y: ry,
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
            ipcRenderer.send('dialog:rename-result', document.getElementById('name').value.trim() || '小猫咪');
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

      ipcMain.once('dialog:rename-result', (_, name) => {
        if (!renameWin.isDestroyed()) renameWin.close();
        resolve(name);
      });

      renameWin.on('closed', () => {
        ipcMain.removeAllListeners('dialog:rename-result');
        resolve(null);
      });
    });
  }
}

module.exports = { IpcRouter };
