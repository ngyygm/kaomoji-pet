const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('petAPI', {
  moveWindow: (deltaX, deltaY) => ipcRenderer.send('window-move', { deltaX, deltaY }),
  setWindowPosition: (x, y) => ipcRenderer.send('set-window-position', { x, y }),
  moveWindowTo: (targetX, targetY, curveType) => ipcRenderer.send('move-window-to', { targetX, targetY, curveType }),
  stopWalk: () => ipcRenderer.send('stop-walk'),
  getScreenSize: () => ipcRenderer.invoke('get-screen-size'),
  getWindowPosition: () => ipcRenderer.invoke('get-window-position'),
  getWindowSize: () => ipcRenderer.invoke('get-window-size'),
  resizeWindow: (width, height) => ipcRenderer.send('resize-window', { width, height }),
  setIgnoreMouseEvents: (ignore, options) => ipcRenderer.send('set-ignore-mouse', { ignore, options }),
  saveData: (data) => ipcRenderer.send('save-data', data),
  loadData: () => ipcRenderer.invoke('load-data'),
  closeApp: () => ipcRenderer.send('close-app'),
  onAppClosing: (callback) => ipcRenderer.on('app-closing', () => callback()),
  onGlobalMouse: (callback) => ipcRenderer.on('global-mouse', (event, data) => callback(data)),
  onSystemMetrics: (callback) => ipcRenderer.on('system-metrics', (event, data) => callback(data)),
  onWalkDone: (callback) => ipcRenderer.on('walk-done', () => callback()),
  prankGiant: (kaomoji, duration) => ipcRenderer.send('prank-giant', { kaomoji, duration }),
  getGpuStatus: () => ipcRenderer.invoke('gpu:status'),
  listBigEffects: () => ipcRenderer.invoke('big-effects:list'),
  runBigEffect: (id, params) => ipcRenderer.invoke('big-effects:run', { id, params }),
  showRenameDialog: (currentName) => ipcRenderer.invoke('show-rename-dialog', currentName),
  onMouseStateReset: (callback) => ipcRenderer.on('mouse-state-reset', (event, data) => callback(data)),
  onEffectHitTest: (callback) => ipcRenderer.on('effect-hit-test', (event, data) => callback(data))
});
