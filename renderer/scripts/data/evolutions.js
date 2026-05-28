/**
 * 颜文字模板 — 统一格式 ( X ω X )
 * 只有眼睛字符改变，整体宽度始终一致
 */
const KAOMOJI_TEMPLATES = {
  adult: [
    { text: '(', cls: 'seg-bound-l' },
    { text: '·', cls: 'seg-eye-l', group: 'eye' },
    { text: 'ω', cls: 'seg-mouth', group: 'mouth' },
    { text: '·', cls: 'seg-eye-r', group: 'eye' },
    { text: ')', cls: 'seg-bound-r' }
  ]
};

const EVOLUTION_SPRITES = {
  adult: { default: '( · ω · )', happy: '( ^ ω ^ )', sad: '( ; ω ; )' }
};
