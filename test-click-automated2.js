// Automated click test with reliable PowerShell SendInput
const { app, BrowserWindow, screen } = require('electron');
const { execSync } = require('child_process');

function clickAt(x, y) {
  // Use SendInput with absolute normalized coordinates
  const ps = `
    Add-Type @"
      using System;
      using System.Runtime.InteropServices;
      public class Mouse {
        [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
        [DllImport("user32.dll")] public static extern uint SendInput(uint n, INPUT[] p, int size);
        [StructLayout(LayoutKind.Sequential)] public struct INPUT { public uint type; public MOUSEINPUT mi; }
        [StructLayout(LayoutKind.Sequential)] public struct MOUSEINPUT {
          public int dx, dy; public uint mouseData, dwFlags, time; public IntPtr dwExtraInfo;
        }
        public static void Click(int x, int y) {
          SetCursorPos(x, y);
          System.Threading.Thread.Sleep(100);
          INPUT[] inp = new INPUT[2];
          inp[0].type = 0; inp[0].mi.dwFlags = 0x0002;
          inp[1].type = 0; inp[1].mi.dwFlags = 0x0004;
          SendInput(2, inp, Marshal.SizeOf(typeof(INPUT)));
        }
      }
"@ -ReferencedAssemblies System.Windows.Forms
    [Mouse]::Click(${x}, ${y})
  `;
  try {
    execSync(`powershell -Command "${ps.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, { timeout: 8000 });
  } catch (e) {
    console.log('[ERROR] click failed:', e.message.substring(0, 100));
  }
}

let clicks = {};
const { ipcMain } = require('electron');

app.whenReady().then(async () => {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  console.log(`Screen: ${sw}x${sh}`);

  // Helper to create a clickable window
  function makeWin(name, x, y, w, h, bg) {
    const win = new BrowserWindow({
      width: w, height: h, x, y,
      alwaysOnTop: true, transparent: true, frame: false,
      backgroundColor: '#00000000',
      webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
      <body style="background:${bg};display:flex;align-items:center;justify-content:center;height:100vh;font:16px sans-serif;">
        <div>${name}</div>
      </body>
      <script>
        document.addEventListener('click', () => require('electron').ipcRenderer.send('click-${name}'));
        document.addEventListener('mousedown', () => require('electron').ipcRenderer.send('click-${name}'));
      </script>
    `)}`);
    clicks[name] = 0;
    ipcMain.on(`click-${name}`, () => {
      clicks[name]++;
      console.log(`  -> ${name} click #${clicks[name]}`);
    });
    return win;
  }

  // TEST 1: Single window, no effect — baseline
  console.log('\n=== TEST 1: Baseline — single window, ignoreMouseEvents(false) ===');
  const w1 = makeWin('w1', 100, 100, 300, 200, 'rgba(255,200,200,0.9)');
  w1.setIgnoreMouseEvents(false);
  await new Promise(r => setTimeout(r, 1500));
  console.log('Clicking at center of w1 (250, 200)...');
  clickAt(250, 200);
  await new Promise(r => setTimeout(r, 1000));
  console.log(`RESULT: w1 clicks = ${clicks.w1}`);

  // TEST 2: Effect window on top
  console.log('\n=== TEST 2: Effect window on top, w1 ignoreMouseEvents(false) ===');
  const w2 = new BrowserWindow({
    width: sw, height: sh, x: 0, y: 0,
    alwaysOnTop: true, transparent: true, frame: false,
    backgroundColor: '#00000000',
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  w2.setIgnoreMouseEvents(true);
  w2.loadURL('data:text/html;charset=utf-8,<body style="background:transparent;"></body>');
  await new Promise(r => setTimeout(r, 500));
  w1.setIgnoreMouseEvents(false);
  await new Promise(r => setTimeout(r, 200));
  console.log('Clicking at center of w1 (250, 200) with effect on top...');
  clickAt(250, 200);
  await new Promise(r => setTimeout(r, 1000));
  console.log(`RESULT: w1 clicks = ${clicks.w1}`);

  // TEST 3: moveTop on w1
  console.log('\n=== TEST 3: w1.moveTop() ===');
  w1.moveTop();
  await new Promise(r => setTimeout(r, 300));
  clickAt(250, 200);
  await new Promise(r => setTimeout(r, 1000));
  console.log(`RESULT: w1 clicks = ${clicks.w1}`);

  // TEST 4: w1 created AFTER w2 (naturally on top)
  console.log('\n=== TEST 4: New window created AFTER effect ===');
  const w3 = makeWin('w3', 100, 100, 300, 200, 'rgba(200,255,200,0.9)');
  w3.setIgnoreMouseEvents(false);
  await new Promise(r => setTimeout(r, 500));
  console.log('Clicking at center of w3 (250, 200)...');
  clickAt(250, 200);
  await new Promise(r => setTimeout(r, 1000));
  console.log(`RESULT: w3 clicks = ${clicks.w3}`);

  // Summary
  console.log('\n========== SUMMARY ==========');
  console.log(`Test 1 (single window):         ${clicks.w1 >= 1 ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`Test 2 (effect on top):          ${clicks.w1 >= 2 ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`Test 3 (moveTop):                ${clicks.w1 >= 3 ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`Test 4 (created after effect):   ${clicks.w3 >= 1 ? 'PASS ✓' : 'FAIL ✗'}`);

  if (clicks.w1 === 0) {
    console.log('\nNOTE: All tests show 0 clicks — the PowerShell SendInput simulation');
    console.log('may not work in this environment (RDP/remote). Need manual testing.');
  }

  setTimeout(() => { w1.close(); w2.close(); w3.close(); app.quit(); }, 1000);
});
