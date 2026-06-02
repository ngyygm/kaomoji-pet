/**
 * 视觉配置 — 粒子特效定义 + 心情颜色映射
 * 合并自 particles.js + colors.js
 */

const PARTICLES = {
  heart:    { description: '爱心：表达喜爱', char: '♡', color: '#f9a8d4', duration: 2000 },
  star:     { description: '星星：表达闪耀', char: '✧', color: '#fde68a', duration: 1500 },
  note:     { description: '音符：表达音乐、唱歌', char: '♪', color: '#a78bfa', duration: 2000 },
  food:     { description: '食物：表达吃鱼', char: '🐟', color: '#93c5fd', duration: 1800 },
  coin:     { description: '金币：表达获得奖励', char: '🪙', color: '#fbbf24', duration: 2000 },
  zzz:      { description: '睡眠符号：表达睡觉', char: 'z', color: '#a0a0b0', duration: 2500 },
  sparkle:  { description: '闪光：表达特殊效果', char: '✨', color: '#fde68a', duration: 1500 },
  angry:    { description: '愤怒符号：表达生气', char: '💢', color: '#f87171', duration: 1200 },
  exclaim:  { description: '感叹号：表达惊讶', char: '!', color: '#fbbf24', duration: 1200 },
  question: { description: '问号：表达疑惑', char: '?', color: '#60a5fa', duration: 1500 }
};

const MOOD_COLORS = {
  happy:     { color: '#f9a8d4', shadow: 'rgba(249,168,212,0.5)' },
  normal:    { color: '#f9a8d4', shadow: 'rgba(249,168,212,0.4)' },
  hungry:    { color: '#c4b5fd', shadow: 'rgba(196,181,253,0.5)' },
  sleepy:    { color: '#a0a0b0', shadow: 'rgba(160,160,176,0.3)' },
  sleeping:  { color: '#a0a0b0', shadow: 'rgba(160,160,176,0.3)' },
  angry:     { color: '#f87171', shadow: 'rgba(248,113,113,0.5)' },
  sad:       { color: '#60a5fa', shadow: 'rgba(96,165,250,0.4)' },
  love:      { color: '#f472b6', shadow: 'rgba(244,114,182,0.5)' },
  eating:    { color: '#86efac', shadow: 'rgba(134,239,172,0.4)' },
  playing:   { color: '#818cf8', shadow: 'rgba(129,140,248,0.5)' },
  surprised: { color: '#e879f9', shadow: 'rgba(232,121,249,0.5)' },
  greeting:  { color: '#93c5fd', shadow: 'rgba(147,197,253,0.5)' },
  walking:   { color: '#f9a8d4', shadow: 'rgba(249,168,212,0.4)' },
  satisfied: { color: '#a78bfa', shadow: 'rgba(167,139,250,0.4)' },
  curious:   { color: '#93c5fd', shadow: 'rgba(147,197,253,0.4)' },
  alert:     { color: '#fda4af', shadow: 'rgba(253,164,175,0.5)' },
  stressed:  { color: '#f87171', shadow: 'rgba(248,113,113,0.4)' },
  drowsy:    { color: '#b0b0c0', shadow: 'rgba(176,176,192,0.3)' },
  confused:  { color: '#c4b5fd', shadow: 'rgba(196,181,253,0.4)' }
};
