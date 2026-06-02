const { app, Menu, ipcMain, BrowserWindow, screen, powerMonitor } = require('electron');
const path = require('path');
const { TrayService } = require('./services/tray-service');

// GPU acceleration — Chromium will auto-fallback to software rendering if no GPU
// These MUST be set before app.whenReady()
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
const { Logger } = require('./services/logger');
const { WindowService } = require('./services/window-service');
const { MovementService } = require('./services/movement-service');
const { EffectService } = require('./services/effect-service');
const { SystemService } = require('./services/system-service');
const { SaveService } = require('./services/save-service');

let logger, windowService, movementService, effectService, systemService, saveService, trayService;

app.whenReady().then(() => {
  // Fix GPU shader cache permission error on Windows
  try { app.setPath('gpuCache', path.join(app.getPath('userData'), 'GPUCache')); } catch (_) {}

  Menu.setApplicationMenu(null);

  logger = new Logger(app);
  windowService = new WindowService({ logger });
  movementService = new MovementService({ windowService, logger });
  effectService = new EffectService({ windowService, logger });
  systemService = new SystemService({ windowService, logger });
  saveService = new SaveService({ app, logger });
  trayService = new TrayService({ windowService, movementService, systemService, saveService, logger });
  trayService.setRenameFn(showRenameDialog);

  // Register IPC handlers — each service owns its own channels
  windowService.registerIpc();
  movementService.registerIpc();
  effectService.registerIpc();
  systemService.registerIpc();
  saveService.registerIpc();
  registerGlobalIpc();

  windowService.createMainWindow();
  trayService.createTray();
  systemService.start();
  logger.write('ipc-ready', 'main');
});

/** Global IPC handlers that don't belong to a single service */
function registerGlobalIpc() {
  ipcMain.on('log:write', (_, payload) => {
    logger.write(payload?.event || 'renderer-log', payload?.source || 'renderer', payload?.state || null, payload?.details || null);
  });

  ipcMain.on('app:close', () => {
    trayService.isQuitting = true; // 渲染进程退出也要真正退出
    movementService.stop('app-close');
    systemService.stop();
    windowService.closeApp(app);
  });

  ipcMain.handle('dialog:rename', (_, currentName) => showRenameDialog(currentName));

  ipcMain.handle('gpu:status', () => ({
    featureStatus: app.getGPUFeatureStatus(),
    appMetrics: app.getAppMetrics()
  }));
}

function showRenameDialog(currentName) {
  return new Promise((resolve) => {
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
    const rw = 280, rh = 140;
    const rx = Math.round((sw - rw) / 2);
    const ry = Math.round((sh - rh) / 2);

    const renameWin = new BrowserWindow({
      title: ' ', width: rw, height: rh, x: rx, y: ry,
      frame: false, transparent: true,
      resizable: false, alwaysOnTop: true, skipTaskbar: true,
      hasShadow: false,
      backgroundColor: '#00000000', focusable: true, show: false,
      webPreferences: { nodeIntegration: true, contextIsolation: false }
    });

    renameWin.removeMenu();
    renameWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:rgba(255,255,255,0.95); border-radius:14px; padding:18px 24px;
          font-family:'Segoe UI',sans-serif; box-shadow:0 4px 24px rgba(129,140,248,0.15); }
        h4 { color:#f472b6; margin-bottom:12px; font-size:14px; }
        input { width:100%; padding:6px 10px; border:1px solid rgba(200,180,210,0.3);
          border-radius:8px; font-size:14px; text-align:center; outline:none; color:#444; }
        input:focus { border-color:#818cf8; }
        .btns { display:flex; gap:8px; margin-top:10px; justify-content:center; }
        button { padding:5px 18px; border:none; border-radius:8px; font-size:13px; cursor:pointer; }
        .ok { background:linear-gradient(135deg,#818cf8,#f9a8d4); color:white; }
        .cancel { background:#eee; color:#666; }
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

    renameWin.once('ready-to-show', () => { renameWin.show(); renameWin.focus(); });
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

app.on('render-process-gone', (_, webContents, details) => {
  logger?.write('renderer-gone', 'main', null, details);
  const win = windowService?.getWindow();
  if (win) win.reload();
  else windowService?.createMainWindow();
});

try {
  powerMonitor.on('resume', () => {
    logger?.write('system:resume', 'main');
    if (!windowService?.getWindow()) windowService?.createMainWindow();
    systemService?.stop();
    systemService?.start();
  });
} catch (_) {}

app.on('window-all-closed', (e) => {
  movementService?.stop('window-all-closed');
  systemService?.stop();
  // 如果是托盘退出，则真正退出；否则只关闭窗口，保留托盘
  if (trayService?.getQuitting()) {
    app.quit();
  }
  // 否则保持托盘运行，不退出
});

app.on('before-quit', () => {
  movementService?.stop('before-quit');
  systemService?.stop();
  windowService?.send('app:closing');
  trayService?.destroy();
});
