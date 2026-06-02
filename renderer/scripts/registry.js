/**
 * PetDataRegistry — 统一数据注册表
 * 所有数据文件的唯一查找入口，消费方通过 petData.xxx() 访问
 */
class PetDataRegistry {
  load() {
    this._effects = typeof EFFECTS !== 'undefined' ? EFFECTS : {};
    this._combos = typeof EXPRESSION_COMBOS !== 'undefined' ? EXPRESSION_COMBOS : {};
    this._moodExpressions = typeof MOOD_EXPRESSIONS !== 'undefined' ? MOOD_EXPRESSIONS : {};
    this._animations = typeof ANIMATIONS !== 'undefined' ? ANIMATIONS : {};
    this._idleSequence = typeof IDLE_SEQUENCE !== 'undefined' ? IDLE_SEQUENCE : [];
    this._cssClasses = typeof CSS_ANIMATION_CLASSES !== 'undefined' ? CSS_ANIMATION_CLASSES : {};
    this._templates = typeof KAOMOJI_TEMPLATES !== 'undefined' ? KAOMOJI_TEMPLATES : {};
    this._sprites = typeof EVOLUTION_SPRITES !== 'undefined' ? EVOLUTION_SPRITES : {};
    this._particles = typeof PARTICLES !== 'undefined' ? PARTICLES : {};
    this._speech = typeof SPEECH_BUBBLES !== 'undefined' ? SPEECH_BUBBLES : {};
    this._phrases = typeof KAOMOJI_PHRASES !== 'undefined' ? KAOMOJI_PHRASES : [];
    this._colors = typeof MOOD_COLORS !== 'undefined' ? MOOD_COLORS : {};
    this._timeEvents = typeof TIME_EVENTS !== 'undefined' ? TIME_EVENTS : [];
    this._randomEvents = typeof RANDOM_EVENTS !== 'undefined' ? RANDOM_EVENTS : [];
    this._emojiReactions = typeof EMOJI_REACTIONS !== 'undefined' ? EMOJI_REACTIONS : {};
    this._mouseReactions = typeof MOUSE_REACTIONS !== 'undefined' ? MOUSE_REACTIONS : {};
    this._activities = typeof ACTIVITIES !== 'undefined' ? ACTIVITIES : {};
    this._stageSegments = typeof STAGE_SEGMENTS !== 'undefined' ? STAGE_SEGMENTS : {};
    this._segmentGroups = typeof SEGMENT_GROUPS !== 'undefined' ? SEGMENT_GROUPS : {};
    this._kaomojiByMood = typeof KAOMOJI_BY_MOOD !== 'undefined' ? KAOMOJI_BY_MOOD : {};
    this._kaomojiPhrasesZh = typeof KAOMOJI_PHRASES_ZH !== 'undefined' ? KAOMOJI_PHRASES_ZH : {};
  }

  // --- Effects ---

  getEffect(name) {
    return this._effects[name] || null;
  }

  getCombo(name) {
    return this._combos[name] || null;
  }

  getMoodEffects(mood) {
    return this._moodExpressions[mood] || [];
  }

  // --- Animations ---

  getAnimation(name) {
    return this._animations[name] || null;
  }

  getIdleSequence() {
    return this._idleSequence;
  }

  getCssClass(name) {
    return this._cssClasses[name] || null;
  }

  // --- Templates & Sprites ---

  getTemplate(stage) {
    return this._templates[stage] || this._templates.adult;
  }

  getEvolutionSprite(stage, mood = 'default') {
    return this._sprites[stage]?.[mood] || this._sprites.adult.default;
  }

  // --- Particles ---

  getParticle(type) {
    return this._particles[type] || null;
  }

  // --- Language ---

  getSpeechText(moodKey) {
    const entry = this._speech[moodKey];
    if (!entry) return null;
    const lines = entry.lines || entry;
    return lines[Math.floor(Math.random() * lines.length)];
  }

  getRandomPhrase(category) {
    let pool = this._phrases;
    if (category) {
      pool = pool.filter(p => p.category === category);
    }
    if (pool.length === 0) pool = this._phrases;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  getRandomKaomoji(mood) {
    const moodMap = {
      happy: 'happy', love: 'love', hungry: 'cute', sleepy: 'sleepy',
      angry: 'angry', sad: 'sad', surprised: 'surprised', playing: 'wink',
      greeting: 'happy', normal: 'cute', curious: 'cute', confused: 'sad',
      stressed: 'scared', drowsy: 'sleepy', shy: 'shy', smug: 'cool',
      satisfied: 'happy', alert: 'surprised', crying: 'sad', love: 'love'
    };
    const category = moodMap[mood] || 'cute';
    const pool = this._kaomojiByMood[category] || this._kaomojiByMood.cute || [];
    if (pool.length === 0) return '(・ω・)';
    return pool[Math.floor(Math.random() * pool.length)];
  }

  getRandomKaomojiPhrase(mood) {
    const moodMap = {
      happy: 'happy', love: 'love', hungry: 'cute', sleepy: 'sleepy',
      angry: 'angry', sad: 'sad', surprised: 'surprised', playing: 'wink',
      greeting: 'happy', normal: 'happy', curious: 'surprised',
      stressed: 'encourage', drowsy: 'sleepy', shy: 'shy', smug: 'cool'
    };
    const category = moodMap[mood] || 'happy';
    const pool = this._kaomojiPhrasesZh[category] || this._kaomojiPhrasesZh.happy || [];
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // --- Colors ---

  getMoodColor(mood) {
    return this._colors[mood] || this._colors.normal;
  }

  // --- Events ---

  getTimeEvent(hour) {
    return this._timeEvents.find(e => e.hour === hour) || null;
  }

  getRandomEvent() {
    const idx = Math.floor(Math.random() * this._randomEvents.length);
    return this._randomEvents[idx];
  }

  // --- Reactions ---

  getEmojiReaction(emoji) {
    return this._emojiReactions[emoji] || null;
  }

  getMouseReaction(category) {
    const pool = this._mouseReactions[category];
    if (!pool) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // --- Activities ---

  getActivity(name) {
    return this._activities[name] || null;
  }

  getEligibleActivities(pet) {
    const now = Date.now();
    return Object.entries(this._activities).filter(([id, act]) => {
      if (act.probability <= 0) return false;
      const t = act.trigger;
      if (t.cooldown && now - (pet._activityCooldowns?.[id] || 0) < t.cooldown) return false;
      if (t.minHunger != null && pet.hunger >= t.minHunger) return false;
      if (t.maxEnergy != null && pet.energy > t.maxEnergy) return false;
      if (t.minHappiness != null && pet.happiness < t.minHappiness) return false;
      if (t.hours && !t.hours.includes(new Date().getHours())) return false;
      return true;
    });
  }

  // --- Validation ---

  validate() {
    const warnings = [];

    // Validate effect CSS compatibility
    for (const [name, effect] of Object.entries(this._effects)) {
      if (effect.css) {
        for (const [segClass, cssAnim] of Object.entries(effect.css)) {
          const group = getSegmentGroup(segClass);
          if (!group) {
            warnings.push(`Effect "${name}": unknown segment "${segClass}"`);
            continue;
          }
          const allowed = SEGMENT_ANIM_COMPAT[cssAnim];
          if (allowed && !allowed.includes(group)) {
            warnings.push(`Effect "${name}": "${cssAnim}" not valid for ${group}`);
          }
        }
      }
    }

    // Validate combo effects exist
    for (const [combo, def] of Object.entries(this._combos)) {
      const effects = def.effects || def;
      for (const e of effects) {
        if (!this._effects[e]) {
          warnings.push(`Combo "${combo}": references unknown effect "${e}"`);
        }
      }
    }

    // Validate mood expressions reference valid effects
    for (const [mood, effects] of Object.entries(this._moodExpressions)) {
      for (const e of effects) {
        if (!this._effects[e]) {
          warnings.push(`Mood "${mood}": references unknown effect "${e}"`);
        }
      }
    }

    // Validate activities reference valid animations
    for (const [name, activity] of Object.entries(this._activities)) {
      for (const step of activity.steps) {
        if (step.action === 'animation' && step.params?.name) {
          if (!this._animations[step.params.name]) {
            warnings.push(`Activity "${name}": references unknown animation "${step.params.name}"`);
          }
        }
        if (step.action === 'expression' && step.params?.name) {
          if (!this._combos[step.params.name]) {
            warnings.push(`Activity "${name}": references unknown combo "${step.params.name}"`);
          }
        }
        if (step.action === 'particles' && step.params?.type) {
          if (!this._particles[step.params.type]) {
            warnings.push(`Activity "${name}": references unknown particle "${step.params.type}"`);
          }
        }
      }
    }

    if (warnings.length > 0) {
      console.warn('[PetDataRegistry] Validation warnings:');
      warnings.forEach(w => console.warn('  - ' + w));
    } else {
      console.log('[PetDataRegistry] All data validated OK');
    }

    return warnings;
  }
}

/**
 * ActivityRunner — 执行预设活动步骤
 * 接收 registry + renderer + pet + actionController，按步骤编排执行
 */
class ActivityRunner {
  constructor(registry, renderer, pet, actionController) {
    this.registry = registry;
    this.renderer = renderer;
    this.pet = pet;
    this.actionController = actionController;
    this._activeTimers = [];
  }

  execute(activityId) {
    const activity = this.registry.getActivity(activityId);
    if (!activity) return false;

    // Clear previous timers
    this._clearTimers();

    // Schedule all steps
    for (const step of activity.steps) {
      if (step.delay === 0) {
        this._runStep(step);
      } else {
        const timer = setTimeout(() => this._runStep(step), step.delay);
        this._activeTimers.push(timer);
      }
    }

    // Set cooldown
    if (activity.trigger.cooldown) {
      if (!this.pet._activityCooldowns) this.pet._activityCooldowns = {};
      this.pet._activityCooldowns[activityId] = Date.now();
    }

    return true;
  }

  _runStep(step) {
    const { action, params } = step;
    switch (action) {
      case 'animation':
        this.renderer.setAnimationOverride(params.name, params.duration);
        break;

      case 'expression':
        this.renderer.setAnimationOverride(params.name, params.duration);
        break;

      case 'bubble':
        if (params.moodKey) {
          const text = this.registry.getSpeechText(params.moodKey);
          if (text) this.renderer.showBubble(text, params.duration || 3000);
        } else if (params.text) {
          this.renderer.showBubble(params.text, params.duration || 3000);
        }
        break;

      case 'particles':
        this.renderer.spawnParticles(params.type, params.count || 3);
        break;

      case 'idleStop':
        this.renderer.idleController.stop();
        break;

      case 'idleStart':
        this.renderer.idleController.start();
        break;

      case 'sleep':
        this.pet.sleep();
        break;

      case 'walk':
        this.actionController?.requestWalk('activity:walk');
        break;

      case 'jump':
        this.actionController?.movementController?.jumpToRandomPosition('activity:jump');
        break;

      case 'toast':
        this.renderer.showToast(params.text, params.type || 'info', params.duration || 3000);
        break;

      case 'kaomojiPhrase': {
        const phrase = this.registry.getRandomPhrase();
        this.renderer.showKaomojiBubble(phrase, params.duration || 5000);
        this.renderer.setAnimationOverride(phrase.mood, 3000);
        break;
      }

      case 'kaomojiReact': {
        const mood = params.mood || 'happy';
        const usePhrase = Math.random() > 0.5;
        if (usePhrase) {
          const zhPhrase = this.registry.getRandomKaomojiPhrase(mood);
          if (zhPhrase) {
            this.renderer.showBubble(zhPhrase, params.duration || 4000);
          } else {
            const km = this.registry.getRandomKaomoji(mood);
            this.renderer.showBubble(km, params.duration || 4000);
          }
        } else {
          const km = this.registry.getRandomKaomoji(mood);
          this.renderer.showBubble(km, params.duration || 4000);
        }
        this.renderer.setAnimationOverride(mood, 3000);
        break;
      }

      case 'prank': {
        const stage = this.pet.stage || 'adult';
        const kaomoji = this.registry.getEvolutionSprite(stage, 'default');
        this.actionController?.runBigEffect('giant', { kaomoji, duration: params.duration || 3000 }, 'activity:prank');
        break;
      }

      case 'statEffect':
        for (const [stat, delta] of Object.entries(params)) {
          if (this.pet[stat] !== undefined) {
            this.pet[stat] = this.pet.clamp(this.pet[stat] + delta);
          }
        }
        break;
    }
  }

  executeRandomBehavior() {
    if (this.pet.isSleeping) return false;
    if (this.pet.currentAction) return false;

    const eligible = this.registry.getEligibleActivities(this.pet);
    if (eligible.length === 0) return false;

    const roll = Math.random();
    let cumulative = 0;
    for (const [id, act] of eligible) {
      cumulative += act.probability;
      if (roll < cumulative) {
        return this.execute(id);
      }
    }

    return false;
  }

  _clearTimers() {
    for (const t of this._activeTimers) clearTimeout(t);
    this._activeTimers = [];
  }
}

// Global singleton
const petData = new PetDataRegistry();
petData.load();
petData.validate();
