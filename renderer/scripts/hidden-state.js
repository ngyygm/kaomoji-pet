function clamp01(v) { return Math.max(0, Math.min(1, v)); }
function lerp(current, target, rate) { return current + (target - current) * rate; }

class HiddenStateEngine {
  constructor(systemMonitor) {
    this.monitor = systemMonitor;
    this.state = {
      energy: 0.7,
      mood: 0.6,
      curiosity: 0.5,
      sleepiness: 0.1,
      stress: 0.1,
      warmth: 0.3,
      mischief: 0.2,
      hunger: 0.2,
      loneliness: 0.1,
      focusSync: 0.0
    };
    this._sessionStart = Date.now();
    this._lastUserInteraction = Date.now();
    this._lastPetTime = 0;
    this._prevFocusSync = 0;
    this._tickInterval = null;
  }

  start() {
    this._tickInterval = setInterval(() => this._tick(), 3000);
  }

  stop() {
    if (this._tickInterval) { clearInterval(this._tickInterval); this._tickInterval = null; }
  }

  recordInteraction(type) {
    this._lastUserInteraction = Date.now();
    if (type === 'pet') {
      this._lastPetTime = Date.now();
      this.state.warmth = clamp01(this.state.warmth + 0.06);
      this.state.mischief = clamp01(this.state.mischief + 0.04);
    } else if (type === 'click') {
      this.state.warmth = clamp01(this.state.warmth + 0.02);
      this.state.mischief = clamp01(this.state.mischief + 0.02);
    }
    this.state.loneliness = clamp01(this.state.loneliness - 0.15);
    this.state.mood = clamp01(this.state.mood + 0.03);
  }

  _tick() {
    const sys = this.monitor.getSnapshot();
    const hour = sys.hour;
    const sessionMin = (Date.now() - this._sessionStart) / 60000;
    const idleMin = sys.idleSeconds / 60;

    // Energy: time of day + charging + idle drain
    let energyTarget = 0.6;
    if (hour >= 6 && hour < 10) energyTarget = 0.8;
    else if (hour >= 22 || hour < 2) energyTarget = 0.35;
    else if (hour >= 2 && hour < 6) energyTarget = 0.2;
    if (sys.isCharging) energyTarget = Math.min(1, energyTarget + 0.2);
    if (idleMin > 30) energyTarget = Math.min(1, energyTarget + 0.1);
    this.state.energy = lerp(this.state.energy, energyTarget, 0.04);

    // Sleepiness: late night + idle + low battery
    let sleepTarget = 0.1;
    if (hour >= 0 && hour < 5) sleepTarget = 0.7 + (5 - hour) * 0.05;
    else if (hour >= 5 && hour < 7) sleepTarget = 0.4;
    else if (hour >= 22) sleepTarget = 0.4 + (hour - 22) * 0.15;
    if (idleMin > 10) sleepTarget += 0.15;
    if (idleMin > 30) sleepTarget += 0.15;
    if (sys.batteryLevel < 20) sleepTarget += 0.2;
    this.state.sleepiness = lerp(this.state.sleepiness, clamp01(sleepTarget), 0.04);

    // Stress: CPU + memory + sustained activity
    let stressTarget = 0.1;
    if (sys.cpu > 0.7) stressTarget += 0.4;
    else if (sys.cpu > 0.5) stressTarget += 0.2;
    if (sys.memoryPercent > 0.8) stressTarget += 0.3;
    else if (sys.memoryPercent > 0.65) stressTarget += 0.15;
    this.state.stress = lerp(this.state.stress, clamp01(stressTarget), 0.03);

    // Warmth: slowly decays, grows with time and interactions
    let warmthTarget = 0.2;
    if (sessionMin > 60) warmthTarget += 0.1;
    if (sessionMin > 180) warmthTarget += 0.1;
    if (sessionMin > 360) warmthTarget += 0.1;
    const timeSincePet = (Date.now() - this._lastPetTime) / 60000;
    if (timeSincePet < 5) warmthTarget += 0.2;
    this.state.warmth = lerp(this.state.warmth, clamp01(warmthTarget), 0.02);

    // Loneliness: rises with idle time, resets on interaction
    let loneTarget = 0;
    if (idleMin > 5) loneTarget = 0.2;
    if (idleMin > 15) loneTarget = 0.4;
    if (idleMin > 30) loneTarget = 0.6;
    if (idleMin > 60) loneTarget = 0.8;
    this.state.loneliness = lerp(this.state.loneliness, loneTarget, 0.04);

    // FocusSync: rises when user is active (low idle), drops when idle
    const timeSinceInteraction = (Date.now() - this._lastUserInteraction) / 60000;
    let focusTarget = 0;
    if (sys.isUserActive && timeSinceInteraction < 2) focusTarget = 0.6;
    if (sys.mouseSpeed > 10 && timeSinceInteraction < 1) focusTarget = 0.8;
    // High CPU with active user suggests intensive work
    if (sys.cpu > 0.3 && sys.isUserActive) focusTarget = Math.max(focusTarget, 0.5);
    this._prevFocusSync = this.state.focusSync;
    this.state.focusSync = lerp(this.state.focusSync, clamp01(focusTarget), 0.05);

    // Curiosity: high when mouse is near or user is away briefly
    let curTarget = 0.3;
    if (sys.mouseNearPet) curTarget = 0.7;
    if (idleMin > 5 && idleMin < 30) curTarget = 0.6;
    this.state.curiosity = lerp(this.state.curiosity, clamp01(curTarget), 0.05);

    // Mischief: long session + good mood + low focus
    let misTarget = 0.1;
    if (sessionMin > 120) misTarget += 0.2;
    if (this.state.mood > 0.6) misTarget += 0.1;
    if (this.state.focusSync < 0.3) misTarget += 0.1;
    if (this.state.warmth > 0.5) misTarget += 0.1;
    if (idleMin > 10) misTarget += 0.1;
    this.state.mischief = lerp(this.state.mischief, clamp01(misTarget), 0.02);

    // Hunger: low battery + long runtime + system pressure
    let hungTarget = 0.1;
    if (sys.batteryLevel < 20 && !sys.isCharging) hungTarget += 0.4;
    else if (sys.batteryLevel < 50 && !sys.isCharging) hungTarget += 0.15;
    if (sessionMin > 240) hungTarget += 0.1;
    if (this.state.stress > 0.5) hungTarget += 0.15;
    this.state.hunger = lerp(this.state.hunger, clamp01(hungTarget), 0.03);

    // Mood: combination of warmth, low stress, interactions
    let moodTarget = 0.5;
    moodTarget += this.state.warmth * 0.2;
    moodTarget -= this.state.stress * 0.3;
    moodTarget -= this.state.loneliness * 0.15;
    if (sys.isCharging) moodTarget += 0.05;
    if (hour >= 6 && hour < 10) moodTarget += 0.1;
    this.state.mood = lerp(this.state.mood, clamp01(moodTarget), 0.04);
  }

  getState() { return { ...this.state }; }

  getDominantMood() {
    const s = this.state;
    if (s.sleepiness > 0.8) return 'sleeping';
    if (s.sleepiness > 0.6) return 'sleepy';
    if (s.energy < 0.3 && s.sleepiness > 0.3) return 'drowsy';
    if (s.stress > 0.7) return 'alert';
    if (s.stress > 0.5) return 'stressed';
    if (s.loneliness > 0.6) return 'sad';
    if (s.hunger > 0.6) return 'hungry';
    if (s.warmth > 0.6 && s.mood > 0.6) return 'love';
    if (s.warmth > 0.4 && s.mood > 0.3 && s.mood < 0.6) return 'shy';
    if (s.curiosity > 0.5 && s.stress > 0.3 && s.focusSync > 0.3) return 'confused';
    if (s.focusSync > 0.5) return 'normal';
    if (s.mood > 0.7) return 'happy';
    if (s.mood < 0.3) return 'sad';
    if (s.curiosity > 0.6) return 'curious';
    return 'normal';
  }

  isFocusSyncDropping() {
    return this._prevFocusSync > this.state.focusSync + 0.1;
  }

  getSessionMinutes() {
    return (Date.now() - this._sessionStart) / 60000;
  }

  loadState(snapshot) {
    if (snapshot) {
      for (const key of Object.keys(this.state)) {
        if (typeof snapshot[key] === 'number') {
          this.state[key] = clamp01(snapshot[key]);
        }
      }
    }
  }
}
