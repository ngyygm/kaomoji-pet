// Test: Can a window with setIgnoreMouseEvents(false) receive clicks
// when another window with setIgnoreMouseEvents(true) is on top of it?
const { app, BrowserWindow, screen } = require('electron');

app.whenReady().then(() => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // Window 1: Bottom window (simulates main pet window)
  const w1 = new BrowserWindow({
    width: 300, height: 200,
    x: 100, y: 100,
    alwaysOnTop: true,
    transparent: true,
    frame: false,
    backgroundColor: '#00000000',
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  w1.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
    <body style="background:rgba(255,200,200,0.9);display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
      <div>
        <h2>MAIN WINDOW (w1)</h2>
        <p>Clicks: <span id="clicks">0</span></p>
        <p>Mouse moves: <span id="moves">0</span></p>
        <p style="color:green;font-weight:bold" id="status">Waiting...</p>
      </div>
    </body>
    <script>
      let clicks = 0, moves = 0;
      document.addEventListener('click', () => {
        clicks++;
        document.getElementById('clicks').textContent = clicks;
        document.getElementById('status').textContent = 'CLICK RECEIVED!';
        document.getElementById('status').style.color = 'green';
        require('electron').ipcRenderer.send('test-log', 'w1 CLICK #' + clicks);
      });
      document.addEventListener('mousemove', () => {
        moves++;
        document.getElementById('moves').textContent = moves;
        if (moves % 10 === 0) require('electron').ipcRenderer.send('test-log', 'w1 mousemove #' + moves);
      });
    </script>
  `)}`);

  // Window 2: Fullscreen overlay (simulates effect window)
  const w2 = new BrowserWindow({
    width, height,
    x: 0, y: 0,
    alwaysOnTop: true,
    transparent: true,
    frame: false,
    backgroundColor: '#00000000',
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  w2.setIgnoreMouseEvents(true);
  w2.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
    <body style="background:transparent;">
      <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:rgba(129,140,248,0.3);font-size:48px;pointer-events:none;">
        EFFECT WINDOW (w2) - setIgnoreMouseEvents(true)
      </div>
    </body>
  `)}`);

  console.log('[TEST] w1 and w2 created');
  console.log('[TEST] w2 (effect) is fullscreen, alwaysOnTop, setIgnoreMouseEvents(true)');
  console.log('[TEST] w1 (main) is 300x200, alwaysOnTop');

  // Now try to make w1 capture events
  setTimeout(() => {
    w1.setIgnoreMouseEvents(false);
    console.log('[TEST] w1 setIgnoreMouseEvents(false) — should capture clicks now');
    console.log('[TEST] Try clicking on the pink rectangle!');
    console.log('[TEST] If clicks register, WS_EX_TRANSPARENT pass-through works on this system.');
    console.log('[TEST] If no clicks, the effect window is blocking events.');
  }, 2000);

  // Also try moveTop
  setTimeout(() => {
    w1.moveTop();
    console.log('[TEST] w1.moveTop() called — trying to put w1 above w2');
  }, 4000);

  // Log test results
  const { ipcMain } = require('electron');
  ipcMain.on('test-log', (_, msg) => {
    console.log('[TEST-EVENT] ' + msg);
  });

  // Auto-quit after 20s
  setTimeout(() => {
    console.log('[TEST] 20s timeout. Cleaning up.');
    w1.close();
    w2.close();
    app.quit();
  }, 20000);
});
