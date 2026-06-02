/**
 * Quick test: Start the electron app, capture main process logs,
 * then after a delay check if mouse interaction is working.
 * This runs the app and monitors the setIgnoreMouseEvents calls.
 */
const { spawn } = require('child_process');
const path = require('path');

const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
const appPath = __dirname;

const proc = spawn(electronPath, [appPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, ELECTRON_ENABLE_LOGGING: '1' }
});

let logLines = [];
let ignoreStateChanges = [];

proc.stdout.on('data', (data) => {
  const text = data.toString();
  process.stdout.write(text);
  logLines.push(text);

  // Track setIgnoreMouseEvents calls
  const match = text.match(/\[MAIN\] setIgnoreMouseEvents\((true|false)/);
  if (match) {
    ignoreStateChanges.push({ time: Date.now(), ignore: match[1] === 'true' });
  }
});

proc.stderr.on('data', (data) => {
  const text = data.toString();
  // Filter out noise
  if (!text.includes('cache_util_win') && !text.includes('disk_cache') && !text.includes('gpu_disk_cache')) {
    process.stderr.write(text);
    logLines.push(text);
  }
});

proc.on('close', (code) => {
  console.log(`\n\n=== TEST SUMMARY ===`);
  console.log(`Process exited with code: ${code}`);
  console.log(`\nIgnore state changes (${ignoreStateChanges.length}):`);
  ignoreStateChanges.forEach((c, i) => {
    console.log(`  ${i + 1}. ignore=${c.ignore}`);
  });
});

// Kill after 30 seconds
setTimeout(() => {
  console.log('\n\n=== 30s timeout, killing app ===');
  proc.kill();
}, 30000);
