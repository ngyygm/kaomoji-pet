const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('petAPI', {
  moveWindow: (deltaX, deltaY) => ipcRenderer.send('window-move', { deltaX, deltaY }),
  setWindowPosition: (x, y) => ipcRenderer.send('set-window-position', { x, y }),
  moveWindowTo: (targetX, targetY, curveType) => ipcRenderer.send('move-window-to', { targetX, targetY, curveType }),
  stopWalk: () => ipcRenderer.send('stop-walk'),
  getScreenSize: () => ipcRenderer.invoke('get-screen-size'),
  getWindowPosition: () => ipcRenderer.invoke('get-window-position'),
  getWindowSize: () => ipcRenderer.invoke('get-window-size'),
  resizeWindow: (width, height, expandUp) => ipcRenderer.send('resize-window', { width, height, expandUp }),
  setIgnoreMouseEvents: (ignore, options) => ipcRenderer.send('set-ignore-mouse', { ignore, options }),
  saveData: (data) => ipcRenderer.send('save-data', data),
  loadData: () => ipcRenderer.invoke('load-data'),
  closeApp: () => ipcRenderer.send('close-app'),
  onAppClosing: (callback) => ipcRenderer.on('app-closing', () => callback()),
  onGlobalMouse: (callback) => ipcRenderer.on('global-mouse', (event, data) => callback(data)),
  onSystemMetrics: (callback) => ipcRenderer.on('system-metrics', (event, data) => callback(data)),
  onWalkDone: (callback) => ipcRenderer.on('walk-done', () => callback()),
  prankGiant: (kaomoji, duration) => ipcRenderer.send('prank-giant', { kaomoji, duration }),
  easterEggGiant: (kaomoji, color, duration) => ipcRenderer.send('easter-egg-giant', { kaomoji, color, duration }),
  triggerCareRain: (messages, duration, opacity) => ipcRenderer.send('care-rain', { messages, duration, opacity }),
  showRenameDialog: (currentName) => ipcRenderer.invoke('show-rename-dialog', currentName)
});
