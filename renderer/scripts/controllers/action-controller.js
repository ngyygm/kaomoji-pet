class ActionController {
  constructor({ logger, renderer, hiddenState, movementController, effectController }) {
    this.logger = logger;
    this.renderer = renderer;
    this.hiddenState = hiddenState;
    this.movementController = movementController;
    this.effectController = effectController;
    this.inputMode = 'idle';
    this.menuOpen = false;
    this.clickCount = 0;
    this.clickTimer = null;
    this.lastPetClickAt = 0;
    this.comboEl = document.getElementById('combo-count');
  }

  getState() {
    return {
      inputMode: this.inputMode,
      menuOpen: this.menuOpen,
      clickCount: this.clickCount,
      movement: this.movementController.getState(),
      effects: this.effectController.getState()
    };
  }

  setInputMode(mode, reason) {
    if (this.inputMode === mode) return;
    const previous = this.inputMode;
    this.inputMode = mode;
    this.logger.write('input:mode-change', this.getState(), { previous, mode, reason });
  }

  onMenuOpen(details) {
    this.menuOpen = true;
    this.setInputMode('menu', 'menu-open');
    this.logger.write('menu:open', this.getState(), details || null);
  }

  onMenuClose(reason = 'menu-close') {
    if (!this.menuOpen) return;
    this.menuOpen = false;
    if (this.inputMode === 'menu') this.setInputMode('idle', reason);
    this.logger.write('menu:close', this.getState(), { reason });
  }

  onDragStart(details) {
    this.movementController.cancelForUser('drag:start');
    this.setInputMode('dragging', 'drag-start');
    this.logger.write('drag:start', this.getState(), details || null);
  }

  onDragMove(details) {
    this.logger.write('drag:move', this.getState(), details || null);
  }

  onDragEnd(details) {
    this.logger.write('drag:end', this.getState(), details || null);
    if (this.inputMode === 'dragging') this.setInputMode('idle', 'drag-end');
    this.movementController.setUserCooldown();
  }

  recordPetClick(details = null) {
    this.hiddenState.recordInteraction('click');
    this.logger.write('pet:click', this.getState(), details);

    const now = Date.now();
    if (now - this.lastPetClickAt < 450) this.doPet();
    this.lastPetClickAt = now;

    this.clickCount += 1;
    if (this.clickTimer) clearTimeout(this.clickTimer);
    this.clickTimer = setTimeout(() => this.resetCombo('timeout'), 3000);

    if (this.comboEl) {
      this.comboEl.textContent = this.clickCount;
      this.comboEl.classList.remove('visible');
      void this.comboEl.offsetWidth;
      this.comboEl.classList.add('visible');
    }

    this.logger.write('combo-click', this.getState(), { count: this.clickCount });
    if (this.clickCount >= 10) {
      this.logger.write('combo-big-effect', this.getState(), { count: this.clickCount });
      this.resetCombo('trigger-big-effect');
      this.triggerRandomBigEffect('combo');
    }
  }

  resetCombo(reason) {
    this.clickCount = 0;
    this.comboEl?.classList.remove('visible');
    if (this.clickTimer) {
      clearTimeout(this.clickTimer);
      this.clickTimer = null;
    }
    this.logger.write('combo-reset', this.getState(), { reason });
  }

  doPet() {
    this.hiddenState.recordInteraction('pet');
    this.renderer.spawnParticles('heart', 4);
    this.renderer.showBubble(pickRandomSpeech('affection'), 3000);
    this.renderer.setAnimationOverride('love', 2000);
  }

  canRunAutoAction(reason) {
    const allowed = !this.menuOpen && this.inputMode === 'idle' && this.movementController.canAutoMove();
    if (!allowed) this.logger.write('action:rejected', this.getState(), { reason });
    return allowed;
  }

  async requestWalk(reason = 'auto') {
    if (!this.canRunAutoAction(reason)) return false;
    return this.movementController.walkToRandomPosition(reason);
  }

  stopMovementForUser(reason = 'user') {
    this.movementController.cancelForUser(reason);
  }

  async runBigEffect(effectOrId, params = {}, source = 'manual') {
    return this.effectController.run(effectOrId, params, source);
  }

  async triggerRandomBigEffect(source = 'random') {
    const effects = await this.effectController.loadEffects();
    const available = effects.filter(effect => effect && effect.id);
    if (!available.length) return false;

    const effect = available[Math.floor(Math.random() * available.length)];
    this.logger.write('effect:random-pick', this.getState(), {
      source,
      id: effect.id,
      count: available.length,
      ids: available.map(item => item.id)
    });
    await this.runBigEffect(effect, {}, source);
    return true;
  }
}
