const { screen } = require('electron');

class MovementService {
  constructor({ windowService, logger }) {
    this.windowService = windowService;
    this.logger = logger;
    this.moveTimer = null;
  }

  getScreenSize() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    return { width, height };
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
      startX,
      startY,
      targetX: Math.round(targetX),
      targetY: Math.round(targetY),
      curveType: curveType || 'linear'
    });

    this.moveTimer = setInterval(() => {
      const currentWin = this.windowService.getWindow();
      if (!currentWin) {
        this.stop('window-gone');
        return;
      }

      const speed = Math.random() < 0.6 ? 1 : 2;
      index += speed;

      if (index >= waypoints.length) {
        this.windowService.setPosition(targetX, targetY);
        clearInterval(this.moveTimer);
        this.moveTimer = null;
        this.logger.write('movement:done', 'main', null, {
          x: Math.round(targetX),
          y: Math.round(targetY)
        });
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

    if (type === 'bezier') {
      const mx = (sx + tx) / 2;
      const my = (sy + ty) / 2;
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
      return points;
    }

    if (type === 'arc') {
      const bulge = (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.4);
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const offset = Math.sin(t * Math.PI) * dist * bulge;
        points.push({ x: sx + dx * t + perpX * offset, y: sy + dy * t + perpY * offset });
      }
      return points;
    }

    return this.generateCurvePath(sx, sy, tx, ty, 'linear');
  }
}

module.exports = { MovementService };
