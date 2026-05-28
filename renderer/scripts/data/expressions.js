/**
 * 原子特效 — 只改眼睛/嘴巴字符 + CSS 动画
 * 所有表情基于统一模板 ( X ω X )，只替换 X 的内容
 */
const EFFECTS = {
  // === Eye effects ===
  happy_eyes:     { description: '开心眼：^',       replace: { 'seg-eye-l': '^', 'seg-eye-r': '^' }, targetParts: ['eye'] },
  content_eyes:   { description: '满足眼：~',       replace: { 'seg-eye-l': '~', 'seg-eye-r': '~' }, targetParts: ['eye'] },
  sleepy_eyes:    { description: '困倦眼：-',       replace: { 'seg-eye-l': '-', 'seg-eye-r': '-' }, targetParts: ['eye'] },
  sleep_eyes:     { description: '睡觉眼：─',       replace: { 'seg-eye-l': '─', 'seg-eye-r': '─' }, targetParts: ['eye'] },
  surprised_eyes: { description: '惊讶眼：O',       replace: { 'seg-eye-l': 'O', 'seg-eye-r': 'O' }, css: { 'seg-eye-l': 'pulse', 'seg-eye-r': 'pulse' }, targetParts: ['eye'] },
  sad_eyes:       { description: '悲伤眼：;',      replace: { 'seg-eye-l': ';', 'seg-eye-r': ';' }, targetParts: ['eye'] },
  love_eyes:      { description: '爱心眼：♥',       replace: { 'seg-eye-l': '♥', 'seg-eye-r': '♥' }, css: { 'seg-eye-l': 'pulse', 'seg-eye-r': 'pulse' }, targetParts: ['eye'] },
  star_eyes:      { description: '星星眼：★',       replace: { 'seg-eye-l': '★', 'seg-eye-r': '★' }, css: { 'seg-eye-l': 'pulse', 'seg-eye-r': 'pulse' }, targetParts: ['eye'] },
  angry_eyes:     { description: '生气眼：><',      replace: { 'seg-eye-l': '>', 'seg-eye-r': '<' }, css: { 'seg-eye-l': 'shake', 'seg-eye-r': 'shake' }, targetParts: ['eye'] },
  shaky_eyes:     { description: '抖动眼',          css: { 'seg-eye-l': 'shake', 'seg-eye-r': 'shake' }, targetParts: ['eye'] },
  curious_eyes:   { description: '好奇眼：°',       replace: { 'seg-eye-l': '°', 'seg-eye-r': '°' }, targetParts: ['eye'] },
  confused_eyes:  { description: '困惑眼：?',       replace: { 'seg-eye-l': '?', 'seg-eye-r': '?' }, css: { 'seg-eye-l': 'shake', 'seg-eye-r': 'shake' }, targetParts: ['eye'] },
  half_closed:    { description: '半闭眼：─',      replace: { 'seg-eye-l': '─', 'seg-eye-r': '─' }, targetParts: ['eye'] },
  teary_eye:      { description: '泪眼：;+T',     replace: { 'seg-eye-l': ';', 'seg-eye-r': 'T' }, css: { 'seg-eye-r': 'drip' }, targetParts: ['eye'] },
  sweat_drop:     { description: '汗滴：紧张',      replace: { 'seg-eye-r': '💦' }, targetParts: ['eye'] },
  blink_eyes:     { description: '眨眼：-',         replace: { 'seg-eye-l': '-', 'seg-eye-r': '-' }, targetParts: ['eye'] },
  sparkle_eyes:   { description: '闪光眼：✧',       replace: { 'seg-eye-l': '✧', 'seg-eye-r': '✧' }, targetParts: ['eye'] },

  // Asymmetric look effects
  look_l:         { description: '向左看',          replace: { 'seg-eye-l': '·', 'seg-eye-r': '<' }, targetParts: ['eye'] },
  look_r:         { description: '向右看',          replace: { 'seg-eye-l': '>', 'seg-eye-r': '·' }, targetParts: ['eye'] },
  look_u:         { description: '向上看',          replace: { 'seg-eye-l': '·', 'seg-eye-r': '·' }, targetParts: ['eye'] },

  // === Mouth effects ===
  open_mouth:     { description: '张嘴：▽',         replace: { 'seg-mouth': '▽' }, css: { 'seg-mouth': 'bounce' }, targetParts: ['mouth'] },
  tongue_mouth:   { description: '吐舌：ρ',         replace: { 'seg-mouth': 'ρ' }, targetParts: ['mouth'] },
  yawn_mouth:     { description: '打哈欠：o',       replace: { 'seg-mouth': 'o' }, targetParts: ['mouth'] },
  flat_mouth:     { description: '平嘴：─',          replace: { 'seg-mouth': '─' }, targetParts: ['mouth'] },
  cat_mouth:      { description: '猫嘴：3',          replace: { 'seg-mouth': '3' }, targetParts: ['mouth'] },
  wavy_mouth:     { description: '波浪嘴：≈',        replace: { 'seg-mouth': '≈' }, targetParts: ['mouth'] },
  pout_mouth:     { description: '嘟嘴：∪',         replace: { 'seg-mouth': '∪' }, targetParts: ['mouth'] },

  // === New Eye effects ===
  wink_eye:       { description: '眨单眼：左开右闭', replace: { 'seg-eye-l': '·', 'seg-eye-r': '-' }, targetParts: ['eye'] },
  wide_eyes:      { description: '大眼：⊙',         replace: { 'seg-eye-l': '⊙', 'seg-eye-r': '⊙' }, css: { 'seg-eye-l': 'pulse', 'seg-eye-r': 'pulse' }, targetParts: ['eye'] },
  squint_eyes:    { description: '眯眼：×',         replace: { 'seg-eye-l': '×', 'seg-eye-r': '×' }, targetParts: ['eye'] },
  smug_eyes:      { description: '得意的眼：¬',      replace: { 'seg-eye-l': '¬', 'seg-eye-r': '¬' }, targetParts: ['eye'] },
  worried_eyes:   { description: '担心的眼：·',      replace: { 'seg-eye-l': '·', 'seg-eye-r': '·' }, targetParts: ['eye'] }
};

/**
 * 效果组合
 */
const EXPRESSION_COMBOS = {
  love:       { description: '喜爱：爱心眼',             effects: ['love_eyes'] },
  starstruck: { description: '追星：星星眼',             effects: ['star_eyes'] },
  angry:      { description: '愤怒：怒目',               effects: ['angry_eyes'] },
  crying:     { description: '哭泣：泪眼',               effects: ['teary_eye'] },
  laughing:   { description: '大笑：开心眼+张嘴',        effects: ['happy_eyes', 'open_mouth'] },
  playful:    { description: '调皮：满足眼+吐舌',        effects: ['content_eyes', 'tongue_mouth'] },
  excited:    { description: '兴奋：星星眼',             effects: ['star_eyes'] },
  surprised:  { description: '惊讶：大眼+张嘴',          effects: ['surprised_eyes', 'open_mouth'] },
  shy:        { description: '害羞：满足眼',             effects: ['content_eyes'] },
  stressed:   { description: '紧张：汗滴',               effects: ['sweat_drop'] },
  drowsy:     { description: '困倦：半闭眼',             effects: ['half_closed'] },
  confused:   { description: '困惑：问号眼',             effects: ['confused_eyes'] },
  winking:    { description: '眨眼调情',                 effects: ['wink_eye'] },
  amazed:     { description: '惊叹',                     effects: ['wide_eyes', 'open_mouth'] },
  smug:       { description: '得意',                     effects: ['smug_eyes', 'cat_mouth'] },
  uncertain:  { description: '不确定',                   effects: ['curious_eyes', 'wavy_mouth'] },
  sneaky:     { description: '偷笑猫',                   effects: ['content_eyes', 'cat_mouth'] },
  wholesome:  { description: '温暖猫',                   effects: ['love_eyes', 'cat_mouth'] },
  pouty:      { description: '嘟嘴不开心',               effects: ['sad_eyes', 'pout_mouth'] },
  shocked:    { description: '震惊',                     effects: ['wide_eyes', 'open_mouth'] },
  squinting:  { description: '眯眼怀疑',                 effects: ['squint_eyes', 'flat_mouth'] }
};

/**
 * 心情→特效映射
 */
const MOOD_EXPRESSIONS = {
  happy:      ['happy_eyes'],
  levelup:    ['star_eyes'],
  normal:     [],
  hungry:     ['shaky_eyes'],
  sleepy:     ['sleepy_eyes'],
  sleeping:   ['sleep_eyes'],
  angry:      ['angry_eyes'],
  sad:        ['sad_eyes'],
  love:       ['love_eyes'],
  eating:     ['happy_eyes', 'open_mouth'],
  playing:    ['star_eyes'],
  surprised:  ['surprised_eyes', 'open_mouth'],
  greeting:   ['happy_eyes'],
  walking:    [],
  satisfied:  ['content_eyes'],
  curious:    ['curious_eyes'],
  alert:      ['surprised_eyes'],
  evolve:     ['sparkle_eyes'],
  stressed:   ['sweat_drop'],

  // Idle sequence animation types
  blink:      ['blink_eyes'],
  look_left:  ['look_l'],
  look_right: ['look_r'],
  look_up:    ['look_u'],
  stretch:    ['content_eyes'],
  clean:      ['content_eyes'],
  tail_chase: ['surprised_eyes'],
  yawn:       ['sleepy_eyes', 'yawn_mouth'],

  // New mood-driven expressions
  drowsy:     ['half_closed', 'yawn_mouth'],
  shy:        ['content_eyes', 'flat_mouth'],
  confused:   ['confused_eyes', 'wavy_mouth'],
  worried:    ['worried_eyes', 'flat_mouth'],
  smug:       ['smug_eyes', 'cat_mouth'],
  winking:    ['wink_eye']
};
