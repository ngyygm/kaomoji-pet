/**
 * 颜文字模板 — 扩展格式支持手臂和装饰
 * 段位顺序: deco-l arm-l bound-l eye-l mouth eye-r bound-r arm-r deco-r
 * arm/deco 默认空串，不显示
 */
const KAOMOJI_TEMPLATES = {
  adult: [
    { text: '',  cls: 'seg-deco-l',  group: 'deco' },
    { text: '',  cls: 'seg-arm-l',   group: 'arm' },
    { text: '(', cls: 'seg-bound-l' },
    { text: '·', cls: 'seg-eye-l',   group: 'eye' },
    { text: 'ω', cls: 'seg-mouth',   group: 'mouth' },
    { text: '·', cls: 'seg-eye-r',   group: 'eye' },
    { text: ')', cls: 'seg-bound-r' },
    { text: '',  cls: 'seg-arm-r',   group: 'arm' },
    { text: '',  cls: 'seg-deco-r',  group: 'deco' }
  ]
};

const EVOLUTION_SPRITES = {
  adult: { default: '( · ω · )', happy: '( ^ ω ^ )', sad: '( ; ω ; )' }
};
