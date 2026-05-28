/**
 * Emoji 反应 — 点击 emoji 按钮触发的反应
 *
 * Schema:
 *   combo:     string — 表情组合名（必须在 EXPRESSION_COMBOS 中）
 *   particles: string — 粒子类型（必须在 PARTICLES 中）
 *   duration:  number — 持续时间 (ms)
 */
const EMOJI_REACTIONS = {
  '❤️': { combo: 'love', particles: 'heart', duration: 3000,
    burst: { symbol: '♡', color: '#f9a8d4', count: 12, flashColor: 'rgba(249,168,212,0.3)' } },
  '⭐': { combo: 'starstruck', particles: 'star', duration: 3000,
    burst: { symbol: '✧', color: '#93c5fd', count: 10, flashColor: 'rgba(147,197,253,0.25)' } },
  '😡': { combo: 'angry', particles: 'angry', duration: 2500,
    burst: { symbol: '💢', color: '#f87171', count: 8, flashColor: 'rgba(248,113,113,0.25)' } },
  '😢': { combo: 'crying', particles: 'food', duration: 3000,
    burst: { symbol: '💧', color: '#93c5fd', count: 10, flashColor: 'rgba(147,197,253,0.2)' } },
  '👋': { combo: 'waving', particles: 'sparkle', duration: 2500,
    burst: { symbol: '✨', color: '#c4b5fd', count: 8, flashColor: 'rgba(196,181,253,0.2)' } },
  '😂': { combo: 'laughing', particles: 'note', duration: 2500,
    burst: { symbol: '♪', color: '#a78bfa', count: 10, flashColor: 'rgba(167,139,250,0.25)' } },
  '😜': { combo: 'playful', particles: 'heart', duration: 2500,
    burst: { symbol: '♡', color: '#fb923c', count: 8, flashColor: 'rgba(251,146,60,0.2)' } },
  '🎉': { combo: 'excited', particles: 'sparkle', duration: 3000,
    burst: { symbol: '🎉', color: '#c4b5fd', count: 14, flashColor: 'rgba(196,181,253,0.3)' } }
};

/**
 * 鼠标反应 — 鼠标靠近/活动时触发的反应
 *
 * Schema per entry:
 *   type:      string — 动画名
 *   duration:  number — 持续时间 (ms)
 *   bubble:    ?string — 气泡文字（null = 不显示）
 *   particles: ?string — 粒子类型
 */
const MOUSE_REACTIONS = {
  near: [
    { type: 'surprised', duration: 2000, bubble: '！？', particles: 'exclaim' },
    { type: 'curious', duration: 3000, bubble: '嗯？', particles: 'question' },
    { type: 'alert', duration: 2000, bubble: null }
  ],
  activity: [
    { type: 'look_left', duration: 2000, bubble: null },
    { type: 'look_right', duration: 2000, bubble: null },
    { type: 'look_up', duration: 2000, bubble: null },
    { type: 'alert', duration: 1500, bubble: '...' }
  ]
};
