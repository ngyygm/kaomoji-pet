class BehaviorEngine {
  constructor(hiddenState, renderer, registry, screenWalker) {
    this.hiddenState = hiddenState;
    this.renderer = renderer;
    this.registry = registry;
    this.screenWalker = screenWalker;
    this._cooldowns = {};
    this._lastEasterEgg = {};
    this._lastBubbleTime = 0;
    this._lastActionTime = 0;
    this._tickInterval = null;
    this._wasUserIdle = false;
    this._prevHour = new Date().getHours();
    this._fxTimer = null;
  }

  start() {
    this._tickInterval = setInterval(() => this._tick(), 8000);
    this._scheduleNextFx();
  }

  stop() {
    if (this._tickInterval) { clearInterval(this._tickInterval); this._tickInterval = null; }
    if (this._fxTimer) { clearTimeout(this._fxTimer); this._fxTimer = null; }
  }

  _scheduleNextFx() {
    if (this._fxTimer) clearTimeout(this._fxTimer);
    const delay = (40 + Math.random() * 20) * 60 * 1000; // 40~60 min
    this._fxTimer = setTimeout(() => {
      this._triggerRandomFx();
      this._scheduleNextFx();
    }, delay);
  }

  _triggerRandomFx() {
    // Auto-discover all effects from registry
    if (typeof BIG_EFFECTS === 'undefined' || !BIG_EFFECTS.length) return;
    const effect = BIG_EFFECTS[Math.floor(Math.random() * BIG_EFFECTS.length)];
    window.petAPI.runBigEffect(effect.id);
    if (effect.petAnimation) {
      this.renderer.setAnimationOverride(effect.petAnimation, effect.petAnimDuration || 3000);
    }
    if (effect.petParticles) {
      this.renderer.spawnParticles(effect.petParticles[0], effect.petParticles[1]);
    }
  }

  _tick() {
    const state = this.hiddenState.getState();
    const sys = this.hiddenState.monitor.getSnapshot();
    const now = Date.now();

    // Detect user returned
    const isUserIdle = sys.idleSeconds > 120;
    if (this._wasUserIdle && !isUserIdle) {
      this._showBubble(pickRandomSpeech('user_returned'), 4000);
      this.hiddenState.recordInteraction('return');
    }
    this._wasUserIdle = isUserIdle;

    // New day detection (for fireworks)
    const currentHour = new Date().getHours();
    if (this._prevHour === 23 && currentHour === 0) {
      this._checkEasterEgg('fireworks', state, now);
    }
    this._prevHour = currentHour;

    // Maybe speak
    this._maybeSpeak(state, sys, now);

    // Maybe act
    this._maybeAct(state, sys, now);

    // Check easter eggs
    this._checkEasterEggs(state, sys, now);
  }

  _maybeSpeak(state, sys, now) {
    const minCooldown = state.focusSync > 0.6 ? 60000 : 30000;
    if (now - this._lastBubbleTime < minCooldown) return;

    // Determine what to say based on state
    let speechKey = null;
    const idleMin = sys.idleSeconds / 60;
    const hour = sys.hour;

    if (state.stress > 0.6 && sys.cpu > 0.6) {
      speechKey = sys.memoryPercent > 0.7 ? 'memory_full' : 'cpu_busy';
    } else if (state.focusSync > 0.5 && state.stress > 0.3) {
      speechKey = 'stressed_concern';
    } else if (state.energy < 0.3 && state.sleepiness > 0.3) {
      speechKey = 'drowsy';
    } else if (state.warmth > 0.4 && state.mood > 0.3 && state.mood < 0.6) {
      speechKey = 'shy';
    } else if (state.curiosity > 0.5 && state.stress > 0.3) {
      speechKey = 'confused';
    } else if (state.mischief > 0.5 && state.mood > 0.5) {
      speechKey = 'smug';
    } else if (idleMin > 15) {
      speechKey = 'user_idle_long';
    } else if (state.focusSync > 0.5) {
      speechKey = 'user_typing';
    } else if (state.warmth > 0.6 && state.mood > 0.5) {
      speechKey = 'affection';
    } else if (state.sleepiness > 0.6 && (hour >= 22 || hour < 6)) {
      speechKey = 'goodnight';
    } else if (state.hunger > 0.5 && sys.batteryLevel < 30) {
      speechKey = 'battery_low';
    } else if (sys.isCharging && state.hunger > 0.3) {
      speechKey = 'charging';
    } else if (state.curiosity > 0.6) {
      speechKey = 'curious';
    } else if (this.hiddenState.getSessionMinutes() > 180) {
      speechKey = 'long_companion';
    } else if (hour >= 6 && hour < 9 && state.mood > 0.5) {
      speechKey = 'morning_greeting';
    } else if (state.mood > 0.6) {
      speechKey = 'happy_idle';
    }

    if (speechKey && Math.random() < 0.4) {
      this._showBubble(pickRandomSpeech(speechKey), 4000);
    }
  }

  _maybeAct(state, sys, now) {
    if (now - this._lastActionTime < 20000) return;
    const idleMin = sys.idleSeconds / 60;
    const r = Math.random();

    // Sleep when very sleepy
    if (state.sleepiness > 0.8 && !this.renderer._isSleeping) {
      this._doAction('sleep');
      return;
    }

    // Wake up when energy recovers
    if (this.renderer._isSleeping && state.energy > 0.5) {
      this.renderer._isSleeping = false;
    }

    // === Walking: multiple triggers ===

    // Curious + idle: patrol walk (medium distance)
    if (state.curiosity > 0.4 && idleMin > 3 && r < 0.2) {
      this._doAction('walk');
      return;
    }

    // Happy + not focused: spontaneous stroll
    if (state.mood > 0.5 && state.focusSync < 0.4 && r < 0.08) {
      this._doAction('walk');
      return;
    }

    // Mischief-driven wandering: mischievous pet roams around
    if (state.mischief > 0.3 && state.focusSync < 0.3 && r < 0.06) {
      this._doAction('walk');
      return;
    }

    // Long idle: patrol to pass time
    if (idleMin > 10 && r < 0.15) {
      this._doAction('walk');
      return;
    }

    // === Look around ===
    if (state.curiosity > 0.5 && r < 0.12) {
      const anims = ['look_left', 'look_right', 'curious'];
      this.renderer.setAnimationOverride(anims[Math.floor(Math.random() * anims.length)], 3000);
      this._lastActionTime = now;
      return;
    }

    // === Greet / Sing ===
    if (state.mood > 0.7 && state.focusSync < 0.3 && r < 0.06) {
      this._doAction('greet');
      return;
    }

    if (state.mood > 0.8 && r < 0.04) {
      this._doAction('sing');
      return;
    }

    // === Smug: mischief + good mood ===
    if (state.mischief > 0.5 && state.mood > 0.5 && r < 0.08) {
      this._doAction('smug');
      return;
    }

    // === Confused look: stress + curiosity ===
    if (state.stress > 0.3 && state.curiosity > 0.5 && r < 0.1) {
      this._doAction('confused');
      return;
    }

    // === Random wink ===
    if (state.mood > 0.5 && r < 0.05) {
      this._doAction('wink');
    }
  }

  _doAction(type) {
    this._lastActionTime = Date.now();
    switch (type) {
      case 'walk':
        if (this.screenWalker) this.screenWalker.walkToRandomPosition();
        this.renderer.setAnimationOverride('walking', 6000);
        if (Math.random() < 0.3) {
          const walkLines = ['出去走走~', '散步散步。', '到处看看。', '遛弯去~', '探索新领地！'];
          this._showBubble(walkLines[Math.floor(Math.random() * walkLines.length)], 3000);
        }
        break;
      case 'sleep':
        this.renderer._isSleeping = true;
        this.renderer.setAnimationOverride('sleeping', 0);
        this.renderer.spawnParticles('zzz', 3);
        break;
      case 'greet':
        this.renderer.setAnimationOverride('greeting', 3000);
        break;
      case 'sing':
        this.renderer.setAnimationOverride('happy', 3000);
        this.renderer.spawnParticles('note', 4);
        break;
      case 'smug':
        this.renderer.setAnimationOverride('smug', 3000);
        if (Math.random() < 0.5) {
          this._showBubble(pickRandomSpeech('smug'), 3000);
        }
        break;
      case 'confused':
        this.renderer.setAnimationOverride('confused', 3000);
        break;
      case 'wink':
        this.renderer.setAnimationOverride('winking', 2000);
        if (Math.random() < 0.4) {
          this._showBubble('♡', 2000);
        }
        break;
    }
  }

  _showBubble(text, duration) {
    this._lastBubbleTime = Date.now();
    this.renderer.showBubble(text, duration || 4000);
  }

  _checkEasterEggs(state, sys, now) {
    const sessionMin = this.hiddenState.getSessionMinutes();
    const hour = sys.hour;
    const idleMin = sys.idleSeconds / 60;

    // Barrage attack: mischief>0.7, session>120min, night, stress>0.5
    if (state.mischief > 0.7 && sessionMin > 120 && (hour >= 22 || hour < 5) && state.stress > 0.5) {
      this._checkEasterEgg('barrage', state, now);
    }

    // Care rain: focusSync>0.5, stress>0.4
    if (state.focusSync > 0.5 && state.stress > 0.4) {
      this._checkEasterEgg('care_rain', state, now);
    }

    // Patrol: idle>15min, curiosity>0.5
    if (idleMin > 15 && state.curiosity > 0.5) {
      this._checkEasterEgg('patrol', state, now);
    }

    // Peek: loneliness>0.6, idle>30min
    if (state.loneliness > 0.6 && idleMin > 30) {
      this._checkEasterEgg('peek', state, now);
    }

    // Affection: warmth>0.7, recently petted
    if (state.warmth > 0.7 && (Date.now() - this.hiddenState._lastPetTime) < 60000) {
      this._checkEasterEgg('affection', state, now);
    }

    // Goodnight barrier: sleepiness>0.8, late night, battery<20%
    if (state.sleepiness > 0.8 && (hour >= 0 && hour < 5) && sys.batteryLevel < 20) {
      this._checkEasterEgg('goodnight', state, now);
    }

    // Notes: session>180min, focusSync dropping
    if (sessionMin > 180 && this.hiddenState.isFocusSyncDropping()) {
      this._checkEasterEgg('notes', state, now);
    }

    // Giant face: handled separately via rapid click in app.js
  }

  _checkEasterEgg(name, state, now) {
    const cooldowns = {
      barrage: 3600000,
      giant_face: 1800000,
      care_rain: 2700000,
      patrol: 1200000,
      peek: 900000,
      affection: 1500000,
      goodnight: 7200000,
      notes: 2400000,
      fireworks: 86400000
    };

    const cd = cooldowns[name] || 1800000;
    const lastTime = this._lastEasterEgg[name] || 0;
    if (now - lastTime < cd) return;

    // Probabilistic trigger (don't always fire when conditions are met)
    const prob = {
      barrage: 0.05, care_rain: 0.08, patrol: 0.1, peek: 0.12,
      affection: 0.15, goodnight: 0.1, notes: 0.08, fireworks: 0.8
    };
    if (Math.random() > (prob[name] || 0.05)) return;

    this._lastEasterEgg[name] = now;
    this._triggerEasterEgg(name, state);
  }

  _triggerEasterEgg(name, state) {
    switch (name) {
      case 'barrage':
        this._showBubble('发射弹幕！', 3000);
        this.renderer.spawnParticles('exclaim', 8);
        this.renderer.setAnimationOverride('surprised', 3000);
        break;
      case 'giant_face':
        window.petAPI.runBigEffect('giant', { duration: 4000 });
        break;
      case 'care_rain':
        this._showBubble(pickRandomSpeech('stressed_concern'), 4000);
        this.renderer.spawnParticles('heart', 5);
        window.petAPI.runBigEffect('care-rain', {
          messages: ['今天也辛苦啦。', '慢慢来。', '记得休息。', 'You are doing great.', 'おつかれさま。', '我在陪着你。'],
          duration: 8000,
          opacity: 0.65
        });
        break;
      case 'patrol':
        if (this.screenWalker) this.screenWalker.walkToRandomPosition();
        this.renderer.setAnimationOverride('walking', 8000);
        this._showBubble('巡视领地中~', 3000);
        break;
      case 'peek':
        this.renderer.setAnimationOverride('curious', 4000);
        this._showBubble(pickRandomSpeech('curious'), 3000);
        break;
      case 'affection':
        this.renderer.spawnParticles('heart', 6);
        this._showBubble(pickRandomSpeech('affection'), 4000);
        this.renderer.setAnimationOverride('love', 3000);
        break;
      case 'goodnight':
        this.renderer.setAnimationOverride('sleeping', 0);
        this.renderer.spawnParticles('zzz', 4);
        this._showBubble(pickRandomSpeech('goodnight'), 5000);
        this.renderer._isSleeping = true;
        break;
      case 'notes':
        this.renderer.spawnParticles('sparkle', 5);
        this._showBubble(pickRandomSpeech('long_companion'), 5000);
        break;
      case 'fireworks':
        window.petAPI.runBigEffect('fireworks', { duration: 12000 });
        this.renderer.spawnParticles('sparkle', 15);
        this.renderer.spawnParticles('star', 10);
        this._showBubble('新年快乐！', 5000);
        break;
    }
  }

  triggerRapidClick() {
    const state = this.hiddenState.getState();
    const now = Date.now();
    const lastTime = this._lastEasterEgg['giant_face'] || 0;
    if (now - lastTime < 300000) return; // 5 min cooldown

    this._lastEasterEgg['giant_face'] = now;

    // Different effects based on mischief level
    if (state.mischief > 0.4) {
      // Giant face effect picks a random kaomoji and uses the requested color.
      const colors = ['#f9a8d4', '#818cf8', '#f87171', '#86efac', '#fde68a', '#c084fc', '#fb923c', '#f472b6', '#a3e635'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      window.petAPI.runBigEffect('giant', { color, duration: 3500 });
      this.renderer.setAnimationOverride('surprised', 3000);
    } else {
      // Mini burst: particles + surprised expression even at low mischief
      this.renderer.spawnParticles('exclaim', 5);
      this.renderer.spawnParticles('star', 4);
      this.renderer.setAnimationOverride('surprised', 2500);
      this.renderer.showBubble('！！！', 2000);
    }
  }

  triggerBigEffect() {
    // 30% chance each time (called on every click after 10+ combo)
    if (Math.random() > 0.3) return;

    const effects = [
      () => {
        // Giant face effect picks a random kaomoji and uses the requested color.
        const colors = ['#f9a8d4', '#818cf8', '#f87171', '#86efac', '#fde68a', '#c084fc', '#fb923c', '#e879f9', '#67e8f9'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        window.petAPI.runBigEffect('giant', { color, duration: 3500 });
        this.renderer.setAnimationOverride('surprised', 3000);
      },
      () => {
        // Care rain
        window.petAPI.runBigEffect('care-rain', {
          messages: typeof CARE_MESSAGES !== 'undefined' ? CARE_MESSAGES : ['记得休息。', 'You are doing great.', 'おつかれさま。'],
          duration: 10000,
          opacity: 0.75
        });
        this.renderer.spawnParticles('heart', 6);
        this.renderer.setAnimationOverride('love', 3000);
        this._showBubble(pickRandomSpeech('stressed_concern'), 4000);
      },
      () => {
        // Firework burst
        this.renderer.spawnParticles('sparkle', 15);
        this.renderer.spawnParticles('star', 10);
        this.renderer.setAnimationOverride('happy', 3000);
        this._showBubble('好开心！', 3000);
        this.renderer.triggerScreenFlash('#fde68a');
      },
      () => {
        // Barrage attack
        this.renderer.spawnParticles('exclaim', 8);
        this.renderer.spawnParticles('star', 6);
        this.renderer.setAnimationOverride('surprised', 3000);
        this._showBubble('轰炸！！', 3000);
      },
      () => {
        // Affection burst + jump
        this.renderer.spawnParticles('heart', 10);
        this.renderer.setAnimationOverride('love', 3000);
        this._showBubble('最喜欢你了！', 4000);
        setTimeout(() => {
          if (this.screenWalker) this.screenWalker.jumpToRandomPosition();
        }, 1500);
      },
      () => {
        // Wholesome cat face
        this.renderer.spawnParticles('heart', 5);
        this.renderer.setAnimationOverride('wholesome', 3000);
        this._showBubble('喵呜~', 3000);
      },
      () => {
        // Sneaky cat face
        this.renderer.spawnParticles('sparkle', 4);
        this.renderer.setAnimationOverride('sneaky', 3000);
        this._showBubble('嘿嘿~', 3000);
      },
      () => {
        // Shocked/amazed
        this.renderer.spawnParticles('exclaim', 6);
        this.renderer.setAnimationOverride('amazed', 3000);
        this._showBubble('！！！', 2500);
      }
    ];

    effects[Math.floor(Math.random() * effects.length)]();
  }
}
