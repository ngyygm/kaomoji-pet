class MovementController {
  constructor({ logger, renderer }) {
    this.logger = logger;
    this.renderer = renderer;
    this.isWalking = false;
    this.userCooldownUntil = 0;

    window.petAPI.onMovementDone?.((payload) => this.onMovementDone(payload));
    window.petAPI.onMovementStopped?.((payload) => this.onMovementStopped(payload));
  }

  getState() {
    return {
      isWalking: this.isWalking,
      userCooldownMs: Math.max(0, this.userCooldownUntil - Date.now())
    };
  }

  setUserCooldown(duration = 1500) {
    this.userCooldownUntil = Date.now() + duration;
  }

  canAutoMove() {
    return Date.now() >= this.userCooldownUntil && !this.isWalking;
  }

  async walkToRandomPosition(reason = 'auto') {
    if (!this.canAutoMove()) {
      this.logger.write('movement:rejected', this.getState(), { reason });
      return false;
    }

    const screen = await window.petAPI.getScreenSize();
    const winSize = await window.petAPI.getWindowSize();
    if (!screen || !winSize) return false;

    const padding = 20;
    const targetX = padding + Math.random() * (screen.width - winSize.width - padding * 2);
    const targetY = padding + Math.random() * (screen.height - winSize.height - padding * 2);
    const curveTypes = ['sine', 'bezier', 'arc', 'linear', 'sine', 'bezier'];
    const curveType = curveTypes[Math.floor(Math.random() * curveTypes.length)];

    this.isWalking = true;
    this.logger.write('movement:request', this.getState(), {
      reason,
      targetX: Math.round(targetX),
      targetY: Math.round(targetY),
      curveType
    });

    const result = await window.petAPI.moveWindowTo(Math.round(targetX), Math.round(targetY), curveType);
    if (result?.success === false) {
      this.isWalking = false;
      this.logger.write('ipc-error', this.getState(), {
        ipc: 'window:moveTo',
        message: result.error
      });
      return false;
    }

    return true;
  }

  async jumpToRandomPosition(reason = 'jump') {
    const screen = await window.petAPI.getScreenSize();
    const winSize = await window.petAPI.getWindowSize();
    if (!screen || !winSize) return false;

    this.cancelForUser(`${reason}:pre-stop`);
    this.renderer.playJumpDisappear();
    await new Promise(resolve => setTimeout(resolve, 350));

    const padding = 50;
    const targetX = padding + Math.random() * (screen.width - winSize.width - padding * 2);
    const targetY = padding + Math.random() * (screen.height - winSize.height - padding * 2);
    await window.petAPI.moveWindowTo(Math.round(targetX), Math.round(targetY), 9999);

    await new Promise(resolve => setTimeout(resolve, 50));
    this.renderer.playJumpAppear();
    return true;
  }

  cancelForUser(reason = 'user') {
    this.isWalking = false;
    this.setUserCooldown();
    this.renderer.stopWalking?.();
    if (this.renderer.currentAnimation === 'walking') this.renderer.clearAnimationOverride();
    window.petAPI.stopMovement?.(reason);
    this.logger.write('walk-stop', this.getState(), { reason });
  }

  onMovementDone(payload) {
    this.isWalking = false;
    this.logger.write('movement:done-sync', this.getState(), payload || null);
  }

  onMovementStopped(payload) {
    this.isWalking = false;
    this.logger.write('movement:stopped-sync', this.getState(), payload || null);
  }
}
