const { app, BrowserWindow, ipcMain, screen, powerMonitor } = require('electron');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

let mainWindow = null;
let mouseTracker = null;
let moveAnimTimer = null;
let lastPrankTime = 0;
let systemMonitorTimer = null;
let isCharging = true;
let cpuSamples = [];

function createMainWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 260,
    height: 260,
    x: screenWidth - 280,
    y: screenHeight - 310,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    backgroundColor: '#00000000',
    titleBarOverlay: false,
    focusable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

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

// === IPC Handlers ===

ipcMain.on('window-move', (event, { deltaX, deltaY }) => {
  if (mainWindow) {
    const [x, y] = mainWindow.getPosition();
    mainWindow.setPosition(x + deltaX, y + deltaY);
  }
});

ipcMain.on('set-window-position', (event, { x, y }) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setPosition(Math.round(x), Math.round(y));
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
  if (typeof targetX !== 'number' || typeof targetY !== 'number' || isNaN(targetX) || isNaN(targetY)) return;
  if (moveAnimTimer) { clearInterval(moveAnimTimer); moveAnimTimer = null; }

  // Handle legacy 'step' parameter for jump (large number = instant)
  if ((typeof step === 'number' && step > 100) || (typeof curveType === 'number' && curveType > 100)) {
    mainWindow.setPosition(Math.round(targetX), Math.round(targetY));
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
      mainWindow.setPosition(targetX, targetY);
      clearInterval(moveAnimTimer);
      moveAnimTimer = null;
      mainWindow.webContents.send('walk-done');
      return;
    }

    const wp = waypoints[wpIndex];
    mainWindow.setPosition(Math.round(wp.x), Math.round(wp.y));
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

ipcMain.on('resize-window', (event, { width, height, expandUp }) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (expandUp) {
      // Expand upward: keep bottom edge fixed, grow window upward
      const [oldW, oldH] = mainWindow.getSize();
      const [x, y] = mainWindow.getPosition();
      const newH = Math.round(height);
      const dy = newH - oldH;
      mainWindow.setBounds({ x, y: y - dy, width: Math.round(width), height: newH });
    } else {
      mainWindow.setSize(Math.round(width), Math.round(height));
    }
  }
});

ipcMain.on('set-ignore-mouse', (event, { ignore, options }) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setIgnoreMouseEvents(ignore, options || {});
  }
});

// Rename dialog — opens a separate small window so main window stays frameless
ipcMain.handle('show-rename-dialog', (event, currentName) => {
  return new Promise((resolve) => {
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
    const rw = 280, rh = 140;
    const rx = Math.round((sw - rw) / 2);
    const ry = Math.round((sh - rh) / 2);

    const renameWin = new BrowserWindow({
      width: rw, height: rh,
      x: rx, y: ry,
      frame: false,
      transparent: true,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      hasShadow: true,
      backgroundColor: '#00000000',
      focusable: true,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

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

// === Giant kaomoji overlay (merged prank + easter egg) ===
function showGiantKaomoji(kaomoji, color, duration, mode) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const prankWin = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    focusable: false,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  prankWin.setIgnoreMouseEvents(true);
  prankWin.loadFile(path.join(__dirname, 'renderer', 'prank-giant.html'));

  prankWin.webContents.on('did-finish-load', () => {
    prankWin.webContents.send('show-giant', {
      kaomoji: kaomoji || null,
      color: color || null,
      mode: mode || null
    });
  });

  const d = duration || 3500;
  setTimeout(() => {
    if (!prankWin.isDestroyed()) prankWin.close();
  }, d);
}

// Auto-triggered by easter egg system (with cooldown)
ipcMain.on('prank-giant', (event, { kaomoji, duration }) => {
  const now = Date.now();
  if (now - lastPrankTime < 20 * 60 * 1000) return;
  lastPrankTime = now;
  showGiantKaomoji(kaomoji, null, duration || 4000);
});

// Triggered by user interaction (no cooldown)
ipcMain.on('easter-egg-giant', (event, { kaomoji, color, duration, mode }) => {
  showGiantKaomoji(kaomoji, color, duration || 3500, mode);
});

// === Care Rain: floating encouragement overlay ===
let careRainWin = null;

ipcMain.on('care-rain', (event, { messages, duration, opacity }) => {
  // Close existing care rain window if still open
  if (careRainWin && !careRainWin.isDestroyed()) {
    careRainWin.close();
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  careRainWin = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    focusable: false,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  careRainWin.setIgnoreMouseEvents(true);
  careRainWin.loadFile(path.join(__dirname, 'renderer', 'care-rain.html'));

  careRainWin.webContents.on('did-finish-load', () => {
    careRainWin.webContents.send('show-care-rain', {
      messages: messages || ['记得休息一下。', '慢慢来。', '我在陪着你。'],
      duration: duration || 8000,
      opacity: opacity || 0.7
    });
  });

  // Safety timeout: close after 25s even if self-close fails
  setTimeout(() => {
    if (careRainWin && !careRainWin.isDestroyed()) careRainWin.close();
  }, 25000);
});

app.whenReady().then(() => {
  createMainWindow();
  startSystemMonitor();
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
  powerMonitor.on('resume', () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      createMainWindow();
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
