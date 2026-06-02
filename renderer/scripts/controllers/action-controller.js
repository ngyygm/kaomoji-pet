class ActionController {
  constructor({ logger, renderer, hiddenState, movementController }) {
    this.logger = logger;
    this.renderer = renderer;
    this.hiddenState = hiddenState;
    this.movementController = movementController;
    this.inputMode = 'idle';
    this.menuOpen = false;
    this.clickCount = 0;
    this.clickTimer = null;
    this.lastPetClickAt = 0;
    this.comboEl = document.getElementById('combo-count');

    // Effect state (merged from EffectController)
    this.effects = [];
    this.activeEffects = new Set();

    window.petAPI.onEffectStarted?.((payload) => {
      if (payload?.id) this.activeEffects.add(payload.id);
      this.logger.write('effect:started-sync', this.getEffectState(), payload || null);
    });
    window.petAPI.onEffectClosed?.((payload) => {
      if (payload?.id) this.activeEffects.delete(payload.id);
      this.logger.write('effect:renderer-closed-sync', this.getEffectState(), payload || null);
    });
  }

  getState() {
    return {
      inputMode: this.inputMode,
      menuOpen: this.menuOpen,
      clickCount: this.clickCount,
      movement: this.movementController.getState(),
      effects: this.getEffectState()
    };
  }

  getEffectState() {
    return {
      activeEffects: Array.from(this.activeEffects),
      effectCount: this.effects.length
    };
  }

  // === Input Mode ===

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

  // === Click Combo & Pet ===

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
    if (this.clickTimer) { clearTimeout(this.clickTimer); this.clickTimer = null; }
    this.logger.write('combo-reset', this.getState(), { reason });
  }

  doPet() {
    this.hiddenState.recordInteraction('pet');
    this.renderer.spawnParticles('heart', 4);
    this.renderer.showBubble(pickRandomSpeech('affection'), 3000);
    this.renderer.setAnimationOverride('love', 2000);
  }

  // === Auto Actions ===

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

  // === Big Effects (merged from EffectController) ===

  async loadEffects() {
    this.effects = await window.petAPI.listBigEffects();
    this.logger.write('effect:list', this.getEffectState(), {
      count: this.effects.length,
      ids: this.effects.map(e => e.id)
    });
    return this.effects;
  }

  async getEffects() {
    if (!this.effects.length) return this.loadEffects();
    return this.effects;
  }

  async runBigEffect(effectOrId, params = {}, source = 'unknown') {
    const effects = await this.loadEffects();
    const effect = typeof effectOrId === 'string'
      ? effects.find(item => item.id === effectOrId) || { id: effectOrId }
      : effectOrId;

    if (!effect?.id) return { success: false, error: 'Missing effect id' };

    this.logger.write('effect:start-request', this.getEffectState(), { id: effect.id, source, params });

    let result;
    try {
      result = await window.petAPI.runBigEffect(effect.id, params);
    } catch (err) {
      this.logger.write('ipc-error', this.getEffectState(), { ipc: 'effects:run', id: effect.id, message: err.message });
      return { success: false, error: err.message };
    }

    if (result?.success === false) {
      this.logger.write('ipc-error', this.getEffectState(), { ipc: 'effects:run', id: effect.id, message: result.error });
      return result;
    }

    // Apply pet-side presentation
    if (effect.petAnimation) {
      this.renderer.setAnimationOverride(effect.petAnimation, effect.petAnimDuration || 3000);
    }
    if (effect.petParticles) {
      this.renderer.spawnParticles(effect.petParticles[0], effect.petParticles[1]);
    }

    return result || { success: true };
  }

  async triggerRandomBigEffect(source = 'random') {
    const effects = await this.loadEffects();
    const available = effects.filter(e => e && e.id);
    if (!available.length) return false;

    const effect = available[Math.floor(Math.random() * available.length)];
    this.logger.write('effect:random-pick', this.getState(), {
      source, id: effect.id, count: available.length, ids: available.map(e => e.id)
    });
    await this.runBigEffect(effect, {}, source);
    return true;
  }
}
