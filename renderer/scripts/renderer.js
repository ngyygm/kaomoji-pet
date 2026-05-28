class PetRenderer {
  constructor() {
    this.kaomojiEl = document.getElementById('kaomoji');
    this.particlesEl = document.getElementById('particles-container');
    this.bubbleEl = document.getElementById('speech-bubble');
    this.bubbleTextEl = document.getElementById('bubble-text');
    this.bubbleDecodeBtn = document.getElementById('bubble-decode-btn');
    this.bubbleOriginal = document.getElementById('bubble-original');

    this.currentAnimation = null;
    this.animFrameIndex = 0;
    this.animTimer = null;
    this.overrideTimer = null;
    this.bubbleTimer = null;
    this._lastBubbleTime = 0;
    this.walkOffset = 0;
    this.walkDirection = 1;
    this.isWalking = false;
    this.currentStage = 'adult';

    // Idle animation system
    this.idleController = new IdleAnimationController(this);
    this.naturalBlink = new NaturalBlink(this);

    // Mouse tracking state
    this.lastMouseSpeed = 0;
    this.mouseNearPet = false;
    this.lastNearReaction = 0;
    this.lastActivityReaction = 0;

    // Segment effect timer
    this.effectTimer = null;
    this._transitionCleanup = null;
    this._pendingCssClass = null;
    this._resizeDebounce = null;
    this._isSleeping = false;
  }

  // === Expression Transition (Scale-Fade-Morph) ===

  transitionToContent(updateFn) {
    if (this.isWalking) { updateFn(); return; }

    const el = this.kaomojiEl;
    const oldRect = el.getBoundingClientRect();

    if (oldRect.width < 1 || oldRect.height < 1) {
      updateFn();
      return;
    }

    // Clear any existing CSS animation class to avoid transform conflict
    this.kaomojiEl.className = '';

    const oldWidth = oldRect.width;
    const oldHeight = oldRect.height;

    // Disable transition, apply new content
    el.style.transition = 'none';
    updateFn();

    // Measure new dimensions
    const newRect = el.getBoundingClientRect();
    const newWidth = newRect.width;
    const newHeight = newRect.height;

    if (Math.abs(newWidth - oldWidth) < 3 && Math.abs(newHeight - oldHeight) < 3) {
      el.style.transition = '';
      if (this._pendingCssClass) {
        el.classList.add(this._pendingCssClass);
        this._pendingCssClass = null;
      }
      return;
    }

    // Apply reverse scale so new content visually matches old size
    const scaleX = oldWidth / Math.max(1, newWidth);
    const scaleY = oldHeight / Math.max(1, newHeight);
    el.style.transform = `scale(${scaleX}, ${scaleY})`;
    el.style.opacity = '0.7';

    // Force reflow then animate to natural size
    el.offsetHeight;
    el.style.transition = 'opacity 0.3s ease, transform 0.3s ease-out, color 1.5s ease, text-shadow 1.5s ease';
    el.style.transform = 'scale(1)';
    el.style.opacity = '1';

    if (this._transitionCleanup) clearTimeout(this._transitionCleanup);
    this._transitionCleanup = setTimeout(() => {
      el.style.transform = '';
      el.style.transition = '';
      if (this._pendingCssClass) {
        el.classList.add(this._pendingCssClass);
        this._pendingCssClass = null;
      }
    }, 320);
  }

  // === Window Auto-Resize ===

  measureAndResize() {
    if (this._resizeDebounce) clearTimeout(this._resizeDebounce);
    this._resizeDebounce = setTimeout(() => {
      requestAnimationFrame(() => {
        const kaomojiRect = this.kaomojiEl.getBoundingClientRect();
        const bottomSection = document.getElementById('bottom-section');
        const containerRect = document.getElementById('pet-container').getBoundingClientRect();

        const contentWidth = Math.max(260, Math.ceil(kaomojiRect.width) + 60);

        let contentHeight = kaomojiRect.bottom + 20;
        if (bottomSection && bottomSection.classList.contains('visible')) {
          const bottomRect = bottomSection.getBoundingClientRect();
          contentHeight = bottomRect.bottom + 10;
        }
        contentHeight = Math.max(230, Math.ceil(contentHeight));

        window.petAPI.resizeWindow(contentWidth, contentHeight);
      });
    }, 200);
  }

  renderSegmentedKaomoji(stage) {
    this.currentStage = stage;
    if (this.naturalBlink) this.naturalBlink.blinking = false;
    const template = petData.getTemplate(stage);
    const html = template.map(seg =>
      `<span class="${seg.cls}">${seg.text}</span>`
    ).join('');
    this.kaomojiEl.innerHTML = html;
    this.measureAndResize();
  }

  applyEffect(effectName) {
    const effect = petData.getEffect(effectName);
    if (!effect) return;

    if (effect.replace) {
      for (const [cls, newText] of Object.entries(effect.replace)) {
        const el = this.kaomojiEl.querySelector('.' + cls);
        if (el) {
          el.textContent = newText;
          el.style.display = 'inline-block';
        }
      }
    }

    if (effect.css) {
      for (const [cls, animCls] of Object.entries(effect.css)) {
        const el = this.kaomojiEl.querySelector('.' + cls);
        if (el) el.classList.add(animCls);
      }
    }

    if (effect.particles) {
      this.spawnParticles(effect.particles, 3);
    }
  }

  applyCombo(comboName, duration = 3000) {
    this.transitionToContent(() => {
      this.renderSegmentedKaomoji(this.currentStage);
      const combo = petData.getCombo(comboName);
      if (!combo) return;
      const effectList = combo.effects || combo;
      for (const e of effectList) {
        this.applyEffect(e);
      }
    });

    if (this.effectTimer) clearTimeout(this.effectTimer);
    this.effectTimer = setTimeout(() => {
      this.renderSegmentedKaomoji(this.currentStage);
    }, duration);
  }

  resetSegments() {
    this.renderSegmentedKaomoji(this.currentStage);
  }

  // === Core Kaomoji Display ===

  applyMoodColor(mood) {
    const mc = petData.getMoodColor(mood);
    // Slight hue jitter for variety
    const hShift = Math.round(Math.random() * 10 - 5);
    this.kaomojiEl.style.color = mc.color;
    this.kaomojiEl.style.textShadow = `0 0 20px ${mc.shadow}`;
  }

  updateKaomoji(mood, stage) {
    if (this.idleController.override) return;

    this.transitionToContent(() => {
      this.renderSegmentedKaomoji(stage);
      const moodEffects = petData.getMoodEffects(mood);
      for (const e of moodEffects) {
        this.applyEffect(e);
      }
    });

    this.applyMoodColor(mood);
    this.currentAnimation = mood;
  }

  setAnimationOverride(animType, duration) {
    if (this.animTimer) { clearInterval(this.animTimer); this.animTimer = null; }
    if (this.effectTimer) { clearTimeout(this.effectTimer); this.effectTimer = null; }
    if (this.overrideTimer) { clearTimeout(this.overrideTimer); this.overrideTimer = null; }

    this.currentAnimation = animType;
    this.idleController.override = true;
    this.applyMoodColor(animType);
    this._pendingCssClass = null;

    // Always use segmented system — reset template, then apply effects
    this.transitionToContent(() => {
      this.renderSegmentedKaomoji(this.currentStage);
      const combo = petData.getCombo(animType);
      if (combo) {
        const effectList = combo.effects || combo;
        for (const e of effectList) {
          this.applyEffect(e);
        }
      } else {
        const moodEffects = petData.getMoodEffects(animType);
        for (const e of moodEffects) {
          this.applyEffect(e);
        }
      }
    });

    // Apply CSS animation class
    const animData = petData.getAnimation(animType);
    if (animData?.cssClass) {
      this._pendingCssClass = animData.cssClass;
    }

    if (duration > 0) {
      this.overrideTimer = setTimeout(() => this.clearAnimationOverride(), duration);
    }
  }

  clearAnimationOverride() {
    if (this.animTimer) { clearInterval(this.animTimer); this.animTimer = null; }
    if (this.effectTimer) { clearTimeout(this.effectTimer); this.effectTimer = null; }
    this.overrideTimer = null;

    this.idleController.override = false;
    this.currentAnimation = null;
    this.renderSegmentedKaomoji(this.currentStage);
    this.measureAndResize();
  }

  // === Bubble & Particles ===

  showBubble(text, duration = 4000) {
    const now = Date.now();
    if (now - this._lastBubbleTime < 3000) return;
    this._lastBubbleTime = now;

    if (this.bubbleTimer) clearTimeout(this.bubbleTimer);

    this.bubbleEl.className = '';
    this.bubbleEl.classList.remove('hidden');
    this.bubbleTextEl.textContent = text;
    this.bubbleDecodeBtn.classList.add('hidden');
    this.bubbleOriginal.textContent = '';
    this.bubbleOriginal.style.display = 'none';

    this.bubbleTimer = setTimeout(() => {
      this.bubbleEl.classList.add('hidden');
    }, duration);
  }

  showKaomojiBubble(phrase, duration = 4000) {
    if (this.bubbleTimer) clearTimeout(this.bubbleTimer);

    const encoded = encodeKaomojiText(phrase.text);

    this.bubbleEl.className = 'km-code';
    this.bubbleEl.classList.remove('hidden');
    this.bubbleTextEl.textContent = `「${encoded}」`;
    this.bubbleDecodeBtn.classList.remove('hidden');
    this.bubbleOriginal.textContent = `→ ${phrase.text}`;
    this.bubbleOriginal.style.display = 'none';
    this.bubbleEl.classList.remove('decoded');

    // Decode button click handler
    this.bubbleDecodeBtn.onclick = () => {
      this.bubbleEl.classList.toggle('decoded');
      this.bubbleOriginal.style.display = this.bubbleEl.classList.contains('decoded') ? 'block' : 'none';
    };

    this.bubbleTimer = setTimeout(() => {
      this.bubbleEl.classList.add('hidden');
      this.bubbleEl.classList.remove('km-code', 'decoded');
    }, duration);
  }

  spawnParticles(type, count = 3) {
    const particleDef = petData.getParticle(type);
    if (!particleDef) return;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el = document.createElement('span');
        el.className = 'particle';
        el.textContent = particleDef.char;
        el.style.color = particleDef.color;
        el.style.setProperty('--duration', particleDef.duration + 'ms');
        el.style.setProperty('--drift', (Math.random() * 40 - 20) + 'px');
        el.style.left = (30 + Math.random() * 220) + 'px';
        el.style.top = (20 + Math.random() * 80) + 'px';
        el.style.fontSize = (14 + Math.random() * 8) + 'px';
        el.style.animationDelay = (i * 100) + 'ms';
        this.particlesEl.appendChild(el);
        setTimeout(() => el.remove(), particleDef.duration + 500);
      }, i * 150);
    }
  }

  showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  }

  // === Walking ===

  startWalking() { this.isWalking = true; }

  stopWalking() {
    this.isWalking = false;
    this.walkOffset = 0;
    this.kaomojiEl.style.transform = '';
  }

  updateWalking() {
    if (!this.isWalking) return;
    this.walkOffset += this.walkDirection * 2;
    if (Math.abs(this.walkOffset) > 40) this.walkDirection *= -1;
    this.kaomojiEl.style.transform = `translateX(${this.walkOffset}px)`;
  }

  // === Jump Animation ===

  playJumpDisappear() {
    this.kaomojiEl.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    this.kaomojiEl.style.transform = 'scale(0)';
    this.kaomojiEl.style.opacity = '0';
    this.spawnParticles('sparkle', 5);
  }

  playJumpAppear() {
    this.kaomojiEl.style.transform = 'scale(1.3)';
    this.kaomojiEl.style.opacity = '1';
    setTimeout(() => {
      this.kaomojiEl.style.transform = 'scale(1)';
    }, 200);
    this.spawnParticles('sparkle', 5);
  }

  // === Emoji Reaction ===

  handleEmojiReaction(emoji) {
    const reaction = petData.getEmojiReaction(emoji);
    if (!reaction) return;

    this.setAnimationOverride(reaction.combo, reaction.duration);
    if (reaction.particles) {
      this.spawnParticles(reaction.particles, 5);
    }
    if (reaction.burst) {
      this.spawnRadialBurst(reaction.burst);
      this.triggerScreenFlash(reaction.burst.flashColor);
    }
    this.idleController.resetIdle();
  }

  spawnRadialBurst(config) {
    const kaomojiRect = this.kaomojiEl.getBoundingClientRect();
    const containerRect = document.getElementById('pet-container').getBoundingClientRect();
    const cx = kaomojiRect.left - containerRect.left + kaomojiRect.width / 2;
    const cy = kaomojiRect.top - containerRect.top + kaomojiRect.height / 2;

    for (let i = 0; i < config.count; i++) {
      const el = document.createElement('span');
      el.className = 'burst-particle';
      el.textContent = config.symbol;
      el.style.color = config.color;

      const angle = (Math.PI * 2 / config.count) * i + (Math.random() - 0.5) * 0.5;
      const distance = 80 + Math.random() * 120;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      el.style.left = cx + 'px';
      el.style.top = cy + 'px';
      el.style.setProperty('--tx', tx + 'px');
      el.style.setProperty('--ty', ty + 'px');
      el.style.fontSize = (16 + Math.random() * 10) + 'px';
      el.style.animationDelay = (i * 30) + 'ms';

      this.particlesEl.appendChild(el);
      setTimeout(() => el.remove(), 1500);
    }
  }

  triggerScreenFlash(color) {
    let flash = document.getElementById('screen-flash');
    if (!flash) {
      flash = document.createElement('div');
      flash.id = 'screen-flash';
      document.getElementById('pet-container').appendChild(flash);
    }
    flash.style.background = color;
    flash.style.animation = 'none';
    flash.offsetHeight;
    flash.style.animation = '';
    clearTimeout(this._flashTimer);
    this._flashTimer = setTimeout(() => {
      flash.remove();
    }, 500);
  }

  // === Global Mouse Response ===

  handleGlobalMouse(data) {
    const { relX, relY, winCenterX, winCenterY, speed } = data;
    const now = Date.now();

    const dx = relX - winCenterX;
    const dy = relY - winCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const wasNear = this.mouseNearPet;
    this.mouseNearPet = distance < 200;

    if (this.mouseNearPet && !wasNear && now - this.lastNearReaction > 8000) {
      this.lastNearReaction = now;
      this.onMouseApproach(dx, dy);
      return;
    }

    if (speed > 50 && now - this.lastActivityReaction > 12000) {
      this.lastActivityReaction = now;
      this.onMouseActivity(dx, dy);
      return;
    }

    if (this.mouseNearPet && speed < 5 && !this.idleController.override && now - this.lastActivityReaction > 15000) {
      this.lastActivityReaction = now;
      this.lookAtDirection(dx, dy);
    }
  }

  onMouseApproach(dx, dy) {
    if (this.idleController.override) return;
    const reaction = petData.getMouseReaction('near');
    this.setAnimationOverride(reaction.type, reaction.duration);
    if (reaction.bubble) {
      this.showBubble(reaction.bubble, reaction.duration);
    }
    if (reaction.type === 'surprised') {
      this.spawnParticles('exclaim', 2);
    } else if (reaction.type === 'curious') {
      this.spawnParticles('question', 2);
    }
    this.idleController.resetIdle();
  }

  onMouseActivity(dx, dy) {
    if (this.idleController.override) return;
    const reaction = petData.getMouseReaction('activity');
    this.setAnimationOverride(reaction.type, reaction.duration);
    if (reaction.bubble) {
      this.showBubble(reaction.bubble, reaction.duration);
    }
    this.idleController.resetIdle();
  }

  lookAtDirection(dx, dy) {
    if (this.idleController.override) return;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (absDx > absDy) {
      this.setAnimationOverride(dx < 0 ? 'look_left' : 'look_right', 2500);
    } else if (dy < 0) {
      this.setAnimationOverride('look_up', 2500);
    }
    this.idleController.resetIdle();
  }
}

// === Idle Animation Controller ===

class IdleAnimationController {
  constructor(renderer) {
    this.renderer = renderer;
    this.sequenceIndex = 0;
    this.override = false;
    this.timer = null;
    this.active = false;
  }

  start() {
    this.active = true;
    this.sequenceIndex = 0;
    this.runNext();
  }

  stop() {
    this.active = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  resetIdle() {
    this.sequenceIndex = 0;
    if (this.timer) clearTimeout(this.timer);
    setTimeout(() => {
      if (this.active && !this.override) {
        this.runNext();
      }
    }, 3000);
  }

  runNext() {
    if (!this.active) return;

    const step = petData.getIdleSequence()[this.sequenceIndex % petData.getIdleSequence().length];

    if (step.type === 'pause') {
      this.override = false;
      this.timer = setTimeout(() => {
        this.sequenceIndex++;
        this.runNext();
      }, step.duration);
    } else {
      if (petData.getAnimation(step.type)) {
        this.override = true;
        this.renderer.setAnimationOverride(step.type, step.duration);
        this.timer = setTimeout(() => {
          this.sequenceIndex++;
          this.runNext();
        }, step.duration);
      } else {
        this.sequenceIndex++;
        this.runNext();
      }
    }
  }

  isIdle() {
    return this.active && !this.override;
  }
}

// === Natural Blink — random-interval blink independent of idle sequence ===

class NaturalBlink {
  constructor(renderer) {
    this.renderer = renderer;
    this.timer = null;
    this.active = false;
    this.blinking = false;
    this._savedEyes = {};
  }

  start() {
    this.active = true;
    this._scheduleNext();
  }

  stop() {
    this.active = false;
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    if (this.blinking) this._restore();
  }

  _scheduleNext() {
    if (!this.active) return;
    // Random interval 2.5s - 5.5s, mimicking natural blink rhythm
    const delay = 2500 + Math.random() * 3000;
    this.timer = setTimeout(() => this._doBlink(), delay);
  }

  _doBlink() {
    if (!this.active) return;
    // Don't blink if animation override is active
    if (this.renderer.idleController.override) {
      this._scheduleNext();
      return;
    }
    const el = this.renderer.kaomojiEl;
    const eyeL = el.querySelector('.seg-eye-l');
    const eyeR = el.querySelector('.seg-eye-r');
    if (!eyeL || !eyeR) { this._scheduleNext(); return; }

    this.blinking = true;
    this._savedEyes = { l: eyeL.textContent, r: eyeR.textContent };

    // Close eyes
    eyeL.textContent = '-';
    eyeR.textContent = '-';

    // Open eyes after 120-180ms (quick blink)
    const closedTime = 120 + Math.random() * 60;
    this.timer = setTimeout(() => {
      this._restore();
      // Occasionally double-blink (10% chance)
      if (Math.random() < 0.1) {
        this.timer = setTimeout(() => this._doBlink(), 200 + Math.random() * 150);
      } else {
        this._scheduleNext();
      }
    }, closedTime);
  }

  _restore() {
    if (!this.blinking) return;
    this.blinking = false;
    const el = this.renderer.kaomojiEl;
    const eyeL = el.querySelector('.seg-eye-l');
    const eyeR = el.querySelector('.seg-eye-r');
    if (eyeL && this._savedEyes.l) eyeL.textContent = this._savedEyes.l;
    if (eyeR && this._savedEyes.r) eyeR.textContent = this._savedEyes.r;
  }
}

// === Screen Walker — manages walking across the screen ===

class ScreenWalker {
  constructor(renderer) {
    this.renderer = renderer;
    this.isWalking = false;
    this.walkDoneCallback = null;

    window.petAPI.onWalkDone(() => {
      this.isWalking = false;
      if (this.walkDoneCallback) this.walkDoneCallback();
    });
  }

  async walkToRandomPosition() {
    if (this.isWalking) return;

    const screen = await window.petAPI.getScreenSize();
    const winSize = await window.petAPI.getWindowSize();
    if (!screen || !winSize) return;

    const padding = 20;
    const targetX = padding + Math.random() * (screen.width - winSize.width - padding * 2);
    const targetY = padding + Math.random() * (screen.height - winSize.height - padding * 2);

    const curveTypes = ['sine', 'bezier', 'arc', 'linear', 'sine', 'bezier'];
    const curveType = curveTypes[Math.floor(Math.random() * curveTypes.length)];

    this.isWalking = true;
    window.petAPI.moveWindowTo(Math.round(targetX), Math.round(targetY), curveType);
  }

  async jumpToRandomPosition() {
    const screen = await window.petAPI.getScreenSize();
    const winSize = await window.petAPI.getWindowSize();
    if (!screen || !winSize) return;

    // Play disappear animation
    this.renderer.playJumpDisappear();

    await new Promise(r => setTimeout(r, 350));

    const padding = 50;
    const targetX = padding + Math.random() * (screen.width - winSize.width - padding * 2);
    const targetY = padding + Math.random() * (screen.height - winSize.height - padding * 2);

    // Move window instantly
    window.petAPI.stopWalk();
    window.petAPI.moveWindowTo(Math.round(targetX), Math.round(targetY), 9999);

    await new Promise(r => setTimeout(r, 50));

    // Play appear animation
    this.renderer.playJumpAppear();
  }
}
