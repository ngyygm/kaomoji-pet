const { ipcMain } = require('electron');

class MovementService {
  constructor({ windowService, logger }) {
    this.windowService = windowService;
    this.logger = logger;
    this.moveTimer = null;
  }

  registerIpc() {
    ipcMain.handle('window:moveTo', (_, payload) => this.moveTo(payload || {}));
    ipcMain.handle('window:stopMovement', (_, payload) => {
      this.stop(payload?.reason || 'ipc');
      return { success: true };
    });
  }

  stop(reason = 'window:stopMovement') {
    if (this.moveTimer) {
      clearInterval(this.moveTimer);
      this.moveTimer = null;
    }
    this.logger.write('walk-stop', 'main', null, { reason });
    this.windowService.send('window:movement-stopped', { reason });
  }

  moveTo({ targetX, targetY, curveType }) {
    const win = this.windowService.getWindow();
    if (!win) return { success: false, error: 'Main window is unavailable' };

    if (typeof targetX !== 'number' || typeof targetY !== 'number') {
      return { success: false, error: 'Invalid target position' };
    }

    this.stop('move-replace');

    if (typeof curveType === 'number' && curveType > 100) {
      this.windowService.setPosition(targetX, targetY);
      this.windowService.send('window:movement-done', { x: Math.round(targetX), y: Math.round(targetY) });
      return { success: true };
    }

    const [startX, startY] = win.getPosition();
    const waypoints = this.generateCurvePath(startX, startY, targetX, targetY, curveType);
    let index = 0;

    this.logger.write('movement:start', 'main', null, {
      startX, startY,
      targetX: Math.round(targetX), targetY: Math.round(targetY),
      curveType: curveType || 'linear'
    });

    this.moveTimer = setInterval(() => {
      const currentWin = this.windowService.getWindow();
      if (!currentWin) { this.stop('window-gone'); return; }

      index += Math.random() < 0.6 ? 1 : 2;

      if (index >= waypoints.length) {
        this.windowService.setPosition(targetX, targetY);
        clearInterval(this.moveTimer);
        this.moveTimer = null;
        this.logger.write('movement:done', 'main', null, { x: Math.round(targetX), y: Math.round(targetY) });
        this.windowService.send('window:movement-done', { x: Math.round(targetX), y: Math.round(targetY) });
        return;
      }

      const point = waypoints[index];
      this.windowService.setPosition(point.x, point.y);
    }, 30);

    return { success: true };
  }

  generateCurvePath(sx, sy, tx, ty, type) {
    const points = [];
    const dx = tx - sx;
    const dy = ty - sy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(40, Math.ceil(dist / 2));

    if (dist < 5) return [{ x: tx, y: ty }];

    // Perpendicular vector for curve offsets
    const nx = dx / dist;
    const ny = dy / dist;
    const perpX = -ny;
    const perpY = nx;

    if (!type || type === 'linear') {
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        points.push({ x: sx + dx * t, y: sy + dy * t });
      }
      return points;
    }

    if (type === 'sine') {
      const amplitude = 25 + Math.random() * 50;
      const frequency = 1.5 + Math.random() * 2.5;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const envelope = Math.sin(t * Math.PI);
        const offset = Math.sin(t * Math.PI * frequency) * amplitude * envelope;
        points.push({ x: sx + dx * t + perpX * offset, y: sy + dy * t + perpY * offset });
      }
      return points;
    }

    // Fallback to linear for unknown curve types
    return this.generateCurvePath(sx, sy, tx, ty, 'linear');
  }
}

module.exports = { MovementService };
