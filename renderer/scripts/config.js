const CONFIG = {
  TICK_INTERVAL: 1000,
  BEHAVIOR_CHECK_INTERVAL: 8000,
  SYSTEM_MONITOR_INTERVAL: 5000,
  HIDDEN_STATE_TICK_INTERVAL: 3000,
  AUTO_SAVE_INTERVAL: 60000,
  BUBBLE_COOLDOWN: 30000,
  RANDOM_BIG_EFFECT_MIN_INTERVAL: 30 * 60 * 1000,
  RANDOM_BIG_EFFECT_MAX_INTERVAL: 45 * 60 * 1000,
  SMOOTHING_ALPHA: 0.3,

  COLORS: {
    STAT_HIGH: '#86efac',
    STAT_MID: '#93c5fd',
    STAT_LOW: '#fda4af',
    BG: 'rgba(255, 255, 255, 0.92)',
    TEXT: '#444',
    TEXT_DIM: '#888',
    ACCENT: '#f9a8d4'
  },

  FONTS: {
    KAOMOJI: '"Segoe UI Emoji", "Apple Color Emoji", sans-serif',
    UI: '"Segoe UI", sans-serif'
  },

  EASTER_EGG_COOLDOWNS: {
    barrage: 3600000,
    giant_face: 1800000,
    care_rain: 2700000,
    patrol: 1200000,
    peek: 900000,
    affection: 1500000,
    goodnight: 7200000,
    notes: 2400000,
    fireworks: 86400000
  }
};
