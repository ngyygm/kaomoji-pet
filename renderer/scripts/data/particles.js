/**
 * 粒子特效定义 — 飘浮在宠物附近的视觉粒子
 *
 * Schema:
 *   char:     string — 显示字符
 *   color:    string — CSS 颜色
 *   duration: number — 存活时间（ms）
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
