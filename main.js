const { app, Menu, powerMonitor } = require('electron');
const { Logger } = require('./main/services/logger');
const { WindowService } = require('./main/services/window-service');
const { MovementService } = require('./main/services/movement-service');
const { EffectService } = require('./main/services/effect-service');
const { SystemService } = require('./main/services/system-service');
const { SaveService } = require('./main/services/save-service');
const { IpcRouter } = require('./main/services/ipc-router');

let logger = null;
let windowService = null;
let movementService = null;
let effectService = null;
let systemService = null;
let saveService = null;
let ipcRouter = null;

function createServices() {
  logger = new Logger(app);
  windowService = new WindowService({ logger });
  movementService = new MovementService({ windowService, logger });
  effectService = new EffectService({ windowService, logger });
  systemService = new SystemService({ windowService, logger });
  saveService = new SaveService({ app, logger });
  ipcRouter = new IpcRouter({
    app,
    logger,
    windowService,
    movementService,
    effectService,
    systemService,
    saveService
  });
}

function startApp() {
  Menu.setApplicationMenu(null);
  createServices();
  ipcRouter.register();
  windowService.createMainWindow();
  systemService.start();
}

app.whenReady().then(startApp);

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
} catch (_) {
  // powerMonitor may be unavailable in a few Electron startup states.
}

app.on('window-all-closed', () => {
  movementService?.stop('window-all-closed');
  systemService?.stop();
  app.quit();
});

app.on('before-quit', () => {
  movementService?.stop('before-quit');
  systemService?.stop();
  windowService?.send('app:closing');
});
