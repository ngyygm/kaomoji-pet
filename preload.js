const { contextBridge, ipcRenderer } = require('electron');

function on(channel, callback) {
  ipcRenderer.on(channel, (event, data) => callback(data));
}

contextBridge.exposeInMainWorld('petAPI', {
  getWindowState: () => ipcRenderer.invoke('window:getState'),
  getScreenSize: () => ipcRenderer.invoke('window:getScreenSize'),
  getWindowPosition: () => ipcRenderer.invoke('window:getPosition'),
  getWindowSize: () => ipcRenderer.invoke('window:getSize'),
  setWindowPosition: (x, y) => ipcRenderer.invoke('window:setPosition', { x, y }),
  resizeWindow: (width, height) => ipcRenderer.invoke('window:setSize', { width, height }),
  moveWindowTo: (targetX, targetY, curveType) => ipcRenderer.invoke('window:moveTo', { targetX, targetY, curveType }),
  stopMovement: (reason) => ipcRenderer.invoke('window:stopMovement', { reason }),

  getSystemSnapshot: () => ipcRenderer.invoke('system:getSnapshot'),
  onSystemMetrics: (callback) => on('system:metrics', callback),
  onGlobalMouse: (callback) => on('system:global-mouse', callback),
  onMovementDone: (callback) => on('window:movement-done', callback),
  onMovementStopped: (callback) => on('window:movement-stopped', callback),

  listBigEffects: () => ipcRenderer.invoke('effects:list'),
  runBigEffect: (id, params) => ipcRenderer.invoke('effects:run', { id, params }),
  onEffectStarted: (callback) => on('effects:started', callback),
  onEffectClosed: (callback) => on('effects:closed', callback),

  saveData: (data) => ipcRenderer.invoke('save:write', data),
  loadData: () => ipcRenderer.invoke('save:load'),
  logInteraction: (event, payload = {}) => ipcRenderer.send('log:write', {
    event,
    source: payload.source || 'renderer',
    state: payload.state || null,
    details: payload.details || null
  }),
  closeApp: () => ipcRenderer.send('app:close'),
  onAppClosing: (callback) => on('app:closing', callback),
  showRenameDialog: (currentName) => ipcRenderer.invoke('dialog:rename', currentName),
  getGpuStatus: () => ipcRenderer.invoke('gpu:status'),

  // Compatibility aliases while renderer modules are being migrated.
  stopWalk: () => ipcRenderer.invoke('window:stopMovement', { reason: 'legacy-stopWalk' }),
  onWalkDone: (callback) => on('window:movement-done', callback),
  moveWindow: (deltaX, deltaY) => {
    ipcRenderer.invoke('window:getPosition').then((pos) => {
      if (!pos) return;
      ipcRenderer.invoke('window:setPosition', { x: pos.x + deltaX, y: pos.y + deltaY });
    });
  }
});
