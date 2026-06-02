// Automated test: Use PowerShell to simulate real OS-level clicks
// and verify if the main window receives them when an effect window is on top.
const { app, BrowserWindow, screen } = require('electron');
const { exec } = require('child_process');

function simulateClick(x, y) {
  return new Promise((resolve) => {
    const ps = `
      Add-Type -AssemblyName System.Windows.Forms
      [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x}, ${y})
      Start-Sleep -Milliseconds 50
      Add-Type -MemberDefinition '[DllImport("user32.dll")] public static extern void mouse_event(uint f, uint dx, uint dy, uint c, uint i);' -Name U -Namespace W
      [W.U]::mouse_event(0x02, 0, 0, 0, 0)
      [W.U]::mouse_event(0x04, 0, 0, 0, 0)
    `;
    exec(`powershell -Command "${ps.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, { timeout: 5000 }, (err) => {
      resolve(!err);
    });
  });
}

let w1Clicks = 0;

app.whenReady().then(async () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // MAIN window: 300x200 at position (100, 100)
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
    <body style="background:rgba(255,200,200,0.9);display:flex;align-items:center;justify-content:center;height:100vh;">
      <h2>MAIN (w1)</h2>
    </body>
    <script>
      document.addEventListener('click', () => {
        require('electron').ipcRenderer.send('w1-click');
      });
    </script>
  `)}`);

  const { ipcMain } = require('electron');
  ipcMain.on('w1-click', () => {
    w1Clicks++;
    console.log(`[RESULT] w1 CLICK received! Total: ${w1Clicks}`);
  });

  await new Promise(r => setTimeout(r, 2000));

  // TEST 1: Click w1 WITHOUT effect window
  console.log('\n=== TEST 1: Click w1 WITHOUT effect window ===');
  w1.setIgnoreMouseEvents(false);
  await new Promise(r => setTimeout(r, 200));
  await simulateClick(250, 200);
  await new Promise(r => setTimeout(r, 500));
  console.log(`[RESULT] Test 1 clicks: ${w1Clicks} (expected: 1)`);

  // TEST 2: Create effect window ON TOP, then click w1
  console.log('\n=== TEST 2: Click w1 WITH effect window on top, w1 setIgnoreMouseEvents(false) ===');
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
  w2.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`<body style="background:transparent;"></body>`)}`);
  await new Promise(r => setTimeout(r, 500));

  // Ensure w1 captures
  w1.setIgnoreMouseEvents(false);
  await new Promise(r => setTimeout(r, 200));
  await simulateClick(250, 200);
  await new Promise(r => setTimeout(r, 500));
  console.log(`[RESULT] Test 2 clicks: ${w1Clicks} (expected: 2)`);

  // TEST 3: Try with moveTop
  console.log('\n=== TEST 3: Same but with w1.moveTop() ===');
  w1.moveTop();
  await new Promise(r => setTimeout(r, 200));
  await simulateClick(250, 200);
  await new Promise(r => setTimeout(r, 500));
  console.log(`[RESULT] Test 3 clicks: ${w1Clicks} (expected: 3)`);

  // TEST 4: Create w1 AFTER w2 (so w1 is naturally on top)
  console.log('\n=== TEST 4: w1 created AFTER w2 (naturally on top) ===');
  w1.close();
  const w1b = new BrowserWindow({
    width: 300, height: 200,
    x: 100, y: 100,
    alwaysOnTop: true,
    transparent: true,
    frame: false,
    backgroundColor: '#00000000',
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  let w1bClicks = 0;
  w1b.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
    <body style="background:rgba(200,255,200,0.9);display:flex;align-items:center;justify-content:center;height:100vh;">
      <h2>MAIN (w1b - created after w2)</h2>
    </body>
    <script>
      document.addEventListener('click', () => {
        require('electron').ipcRenderer.send('w1b-click');
      });
    </script>
  `)}`);
  ipcMain.on('w1b-click', () => {
    w1bClicks++;
    console.log(`[RESULT] w1b CLICK received! Total: ${w1bClicks}`);
  });
  await new Promise(r => setTimeout(r, 500));
  w1b.setIgnoreMouseEvents(false);
  await new Promise(r => setTimeout(r, 200));
  await simulateClick(250, 200);
  await new Promise(r => setTimeout(r, 500));
  console.log(`[RESULT] Test 4 clicks: ${w1bClicks} (expected: 1)`);

  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Test 1 (no effect window): ${w1Clicks >= 1 ? 'PASS' : 'FAIL'}`);
  console.log(`Test 2 (effect on top, ignore=false): ${w1Clicks >= 2 ? 'PASS' : 'FAIL'}`);
  console.log(`Test 3 (effect on top, moveTop): ${w1Clicks >= 3 ? 'PASS' : 'FAIL'}`);
  console.log(`Test 4 (main created after effect): ${w1bClicks >= 1 ? 'PASS' : 'FAIL'}`);

  setTimeout(() => { w2.close(); w1b.close(); app.quit(); }, 1000);
});
