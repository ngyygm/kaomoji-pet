const { powerMonitor, ipcMain, screen } = require('electron');
const os = require('os');

class SystemService {
  constructor({ windowService, logger }) {
    this.windowService = windowService;
    this.logger = logger;
    this.mouseTimer = null;
    this.metricsTimer = null;
    this.isCharging = true;
    this.cpuSamples = [];
    this.lastMouse = { x: 0, y: 0 };
    this.snapshot = {
      cpu: 0,
      memoryPercent: 0,
      batteryLevel: 100,
      isCharging: true,
      idleSeconds: 0
    };
  }

  registerIpc() {
    ipcMain.handle('system:getSnapshot', () => ({ ...this.snapshot }));
  }

  start() {
    this.startMouseSampling();
    this.startMetricsSampling();
    this.bindPowerEvents();
  }

  stop() {
    if (this.mouseTimer) { clearInterval(this.mouseTimer); this.mouseTimer = null; }
    if (this.metricsTimer) { clearInterval(this.metricsTimer); this.metricsTimer = null; }
  }

  startMouseSampling() {
    this.mouseTimer = setInterval(() => {
      const win = this.windowService.getWindow();
      if (!win) return;

      const point = screen.getCursorScreenPoint();
      const bounds = win.getBounds();

      // Only send relX/relY — the only fields the renderer consumes
      this.windowService.send('system:global-mouse', {
        relX: point.x - bounds.x,
        relY: point.y - bounds.y,
        winCenterX: bounds.width / 2,
        winCenterY: bounds.height / 2,
        speed: Math.sqrt(
          Math.pow(point.x - this.lastMouse.x, 2) + Math.pow(point.y - this.lastMouse.y, 2)
        )
      });
      this.lastMouse = point;
    }, 200);
  }

  startMetricsSampling() {
    let previousCpu = this.getCpuUsage();

    this.metricsTimer = setInterval(async () => {
      const currentCpu = this.getCpuUsage();
      const idleDiff = currentCpu.idle - previousCpu.idle;
      const totalDiff = currentCpu.total - previousCpu.total;
      const cpuPercent = totalDiff > 0 ? 1 - idleDiff / totalDiff : 0;
      previousCpu = currentCpu;

      this.cpuSamples.push(cpuPercent);
      if (this.cpuSamples.length > 3) this.cpuSamples.shift();
      const cpu = this.cpuSamples.reduce((sum, item) => sum + item, 0) / this.cpuSamples.length;

      const memInfo = process.getSystemMemoryInfo();
      const memoryPercent = memInfo.total > 0 ? (memInfo.total - memInfo.free) / memInfo.total : 0;

      this.snapshot = {
        cpu,
        memoryPercent,
        batteryLevel: await this.getBatteryLevel(),
        isCharging: this.isCharging,
        idleSeconds: this.getIdleSeconds()
      };
      this.windowService.send('system:metrics', this.snapshot);
    }, 5000);
  }

  getCpuUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    for (const cpu of cpus) {
      for (const type in cpu.times) totalTick += cpu.times[type];
      totalIdle += cpu.times.idle;
    }
    return { idle: totalIdle, total: totalTick };
  }

  async getBatteryLevel() {
    try {
      const state = await powerMonitor.getSystemBatteryState();
      if (typeof state.percent === 'number') return state.percent;
    } catch (_) {}
    return 100;
  }

  getIdleSeconds() {
    try { return powerMonitor.getSystemIdleTime(); } catch (_) { return 0; }
  }

  bindPowerEvents() {
    try {
      powerMonitor.on('on-battery', () => { this.isCharging = false; });
      powerMonitor.on('on-ac', () => { this.isCharging = true; });
    } catch (_) {}
  }
}

module.exports = { SystemService };
