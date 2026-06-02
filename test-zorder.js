// Test z-order behavior on Windows
const { app, BrowserWindow } = require('electron');

app.whenReady().then(() => {
  const w1 = new BrowserWindow({ width: 200, height: 100, title: 'MAIN', alwaysOnTop: true, transparent: true, frame: false, show: false });
  const w2 = new BrowserWindow({ width: 300, height: 200, title: 'EFFECT', alwaysOnTop: true, transparent: true, frame: false, show: false });

  w1.show();
  w2.show();

  console.log('Step 1: Both created with alwaysOnTop:true');
  console.log('  w1.isAlwaysOnTop:', w1.isAlwaysOnTop());
  console.log('  w2.isAlwaysOnTop:', w2.isAlwaysOnTop());

  // Try to raise w1 above w2
  w1.setAlwaysOnTop(true, 'screen-saver');
  w1.moveTop();

  console.log('Step 2: w1 set to screen-saver + moveTop');
  console.log('  w1.isAlwaysOnTop:', w1.isAlwaysOnTop());

  // Check if we can get the HWND to verify z-order
  try {
    const hwnd1 = w1.getNativeWindowHandle();
    const hwnd2 = w2.getNativeWindowHandle();
    console.log('  w1 hwnd:', hwnd1.toString('hex'));
    console.log('  w2 hwnd:', hwnd2.toString('hex'));
  } catch(e) {
    console.log('  hwnd error:', e.message);
  }

  // Use GetWindow via ffi or just check if moveTop actually worked
  // by checking if w2 is still "above" w1
  // Unfortunately Electron doesn't expose z-order directly

  // Let's try another approach: make effect NOT alwaysOnTop
  w2.setAlwaysOnTop(false);
  console.log('Step 3: w2 (effect) setAlwaysOnTop(false)');
  console.log('  w2.isAlwaysOnTop:', w2.isAlwaysOnTop());
  console.log('  w1.isAlwaysOnTop:', w1.isAlwaysOnTop());
  console.log('  => w1 (topmost) should be above w2 (normal)');

  setTimeout(() => {
    w1.close();
    w2.close();
    app.quit();
  }, 1000);
});
