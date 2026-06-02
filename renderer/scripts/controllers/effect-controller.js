class EffectController {
  constructor({ logger, renderer }) {
    this.logger = logger;
    this.renderer = renderer;
    this.effects = [];
    this.activeEffects = new Set();

    window.petAPI.onEffectStarted?.((payload) => this.onEffectStarted(payload));
    window.petAPI.onEffectClosed?.((payload) => this.onEffectClosed(payload));
  }

  getState() {
    return {
      activeEffects: Array.from(this.activeEffects),
      effectCount: this.effects.length
    };
  }

  async loadEffects() {
    this.effects = await window.petAPI.listBigEffects();
    window.BIG_EFFECTS = this.effects;
    if (typeof BIG_EFFECTS !== 'undefined') BIG_EFFECTS = this.effects;
    this.logger.write('effect:list', this.getState(), {
      count: this.effects.length,
      ids: this.effects.map(effect => effect.id)
    });
    return this.effects;
  }

  async getEffects() {
    if (!this.effects.length) return this.loadEffects();
    return this.effects;
  }

  async run(effectOrId, params = {}, source = 'unknown') {
    const effects = await this.loadEffects();
    const effect = typeof effectOrId === 'string'
      ? effects.find(item => item.id === effectOrId) || { id: effectOrId }
      : effectOrId;

    if (!effect?.id) return { success: false, error: 'Missing effect id' };

    this.logger.write('effect:start-request', this.getState(), {
      id: effect.id,
      source,
      params
    });

    let result;
    try {
      result = await window.petAPI.runBigEffect(effect.id, params);
    } catch (err) {
      this.logger.write('ipc-error', this.getState(), {
        ipc: 'effects:run',
        id: effect.id,
        message: err.message
      });
      return { success: false, error: err.message };
    }

    if (result?.success === false) {
      this.logger.write('ipc-error', this.getState(), {
        ipc: 'effects:run',
        id: effect.id,
        message: result.error
      });
      return result;
    }

    this.applyPetPresentation(effect);
    return result || { success: true };
  }

  applyPetPresentation(effect) {
    if (effect.petAnimation) {
      this.renderer.setAnimationOverride(effect.petAnimation, effect.petAnimDuration || 3000);
    }
    if (effect.petParticles) {
      this.renderer.spawnParticles(effect.petParticles[0], effect.petParticles[1]);
    }
  }

  onEffectStarted(payload) {
    if (payload?.id) this.activeEffects.add(payload.id);
    this.logger.write('effect:started-sync', this.getState(), payload || null);
  }

  onEffectClosed(payload) {
    if (payload?.id) this.activeEffects.delete(payload.id);
    this.logger.write('effect:renderer-closed-sync', this.getState(), payload || null);
  }
}
