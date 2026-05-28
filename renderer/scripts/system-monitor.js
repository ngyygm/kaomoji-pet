class SystemMonitor {
  constructor() {
    this.data = {
      cpu: 0,
      memoryPercent: 0,
      batteryLevel: 100,
      isCharging: true,
      idleSeconds: 0,
      mouseSpeed: 0,
      mouseNearPet: false,
      timeOfDay: 'afternoon',
      isUserActive: true
    };
    this._smoothAlpha = 0.3;
  }

  start() {
    window.petAPI.onSystemMetrics((metrics) => {
      this._update(metrics);
    });
    window.petAPI.onGlobalMouse((mouseData) => {
      this.data.mouseSpeed = mouseData.speed || 0;
      const dx = mouseData.relX - mouseData.winCenterX;
      const dy = mouseData.relY - mouseData.winCenterY;
      this.data.mouseNearPet = Math.sqrt(dx * dx + dy * dy) < 150;
    });
  }

  _update(raw) {
    this.data.cpu = this._lerp(this.data.cpu, raw.cpu, this._smoothAlpha);
    this.data.memoryPercent = this._lerp(this.data.memoryPercent, raw.memoryPercent, this._smoothAlpha);
    this.data.batteryLevel = raw.batteryLevel;
    this.data.isCharging = raw.isCharging;
    this.data.idleSeconds = raw.idleSeconds;
    this.data.isUserActive = raw.idleSeconds < 60;
    this.data.timeOfDay = this._computeTimeOfDay();
  }

  _lerp(current, target, alpha) {
    return current + (target - current) * alpha;
  }

  _computeTimeOfDay() {
    const h = new Date().getHours();
    if (h >= 6 && h < 12) return 'morning';
    if (h >= 12 && h < 18) return 'afternoon';
    if (h >= 18 && h < 22) return 'evening';
    return 'late_night';
  }

  getSnapshot() {
    return { ...this.data, hour: new Date().getHours() };
  }
}
