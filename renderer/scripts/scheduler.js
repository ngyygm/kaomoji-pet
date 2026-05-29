class GameLoop {
  constructor(renderer, systemMonitor, hiddenState, behaviorEngine, saveManager, petState) {
    this.renderer = renderer;
    this.systemMonitor = systemMonitor;
    this.hiddenState = hiddenState;
    this.behaviorEngine = behaviorEngine;
    this.saveManager = saveManager;
    this.petState = petState;
    this.isRunning = false;
    this.lastTick = Date.now();
    this.lastAutoSave = Date.now();
  }

  start() {
    this.isRunning = true;
    this.systemMonitor.start();
    this.hiddenState.start();
    this.behaviorEngine.start();
    this.renderer.idleController.start();
    this.renderer.naturalBlink.start();
    this._loop();
  }

  stop() {
    this.isRunning = false;
    this.hiddenState.stop();
    this.behaviorEngine.stop();
    this.renderer.idleController.stop();
    this.renderer.naturalBlink.stop();
  }

  _loop() {
    if (!this.isRunning) return;

    const now = Date.now();
    this.lastTick = now;

    // Auto-save every 60s
    if (now - this.lastAutoSave >= CONFIG.AUTO_SAVE_INTERVAL) {
      this.lastAutoSave = now;
      this.saveManager.saveFull(this.petState, this.hiddenState.getState());
    }

    // Micro-expression tick (Layer 2) — only during idle, no full expression refresh
    if (!this.renderer.idleController.override && !this.renderer.isFullExpression) {
      this.renderer.microExpressionTick();
    }

    // Update pet name display
    const petNameEl = document.getElementById('pet-name');
    if (petNameEl) petNameEl.textContent = this.petState.name;

    setTimeout(() => this._loop(), CONFIG.TICK_INTERVAL);
  }
}
