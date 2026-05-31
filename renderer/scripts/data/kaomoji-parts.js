/**
 * 颜文字部件库 — 从 ~390 个颜文字中提取的原子组件
 *
 * 每种部件按 key 索引，value 为实际字符
 * eyes/arms/bounds/deco: [left, right]
 * mouths: string
 */

const KAOMOJI_PARTS = {

  // === 眼睛 ===
  // [left_char, right_char]
  eyes: {
    // 中性/基础
    dot:       ['·', '·'],
    blank:     [' ', ' '],
    // 开心系列
    happy:     ['^', '^'],
    caret:     ['^', '^'],
    grin:      ['≧', '≧'],
    vline:     ['￣', '￣'],
    dash:      ['-', '-'],
    content:   ['~', '~'],
    sparkle:   ['✧', '✧'],
    star:      ['★', '★'],
    star2:     ['☆', '☆'],
    round:     ['●', '●'],
    dotround:  ['◉', '◉'],
    cute:      ['◕', '◕'],
    wide:      ['⊙', '⊙'],
    big:       ['O', 'O'],
    flower:    ['✿', '✿'],
    bloom:     ['❁', '❁'],
    dot2:      ['•', '•'],
    ring:      ['○', '○'],
    cross:     ['×', '×'],
    smug:      ['¬', '¬'],
    curoust:   ['°', '°'],
    // 悲伤系列
    teary:     [';', 'T'],
    tear2:     ['T', 'T'],
    cry:       ['╥', '╥'],
    cry2:      ['ಥ', 'ಥ'],
    sad:       [';', ';'],
    down:      ['﹏', '﹏'],
   忧:         ['⊙', '⊙'],
    dark:      ['◢', '◣'],
    worried:   ['・', '・'],
    sweat:     [';', '·'],
    // 生气系列
    glare:     ['>', '<'],
    rage:      ['▼', '▼'],
    rage2:     ['皿', ''],   // 不对称特殊
    furious:   ['╬', '╬'],
    face:      ['艹', '艹'],
    angry:     ['\"', '\"'],
    flat:      ['─', '─'],
    // 惊讶
    surprised: ['O', 'O'],
    shock:     ['ﾟ', 'ﾟ'],
    shock2:    ['Д', 'Д'],
    blank2:    ['□', '□'],
    // 可爱系列
    blush:     ['灬', '灬'],
    cat:       ['Φ', 'Φ'],
    cat2:      ['Ő', 'Ő'],
    tiny:      ['ิ', 'ิ'],   // 泰语字符
    baby:      ['╹', '╹'],
    sleepy:    ['-', '-'],
    sleep:     ['─', '─'],
    confused:  ['?', '?'],
    // 非对称（眨眼/特殊）
    wink_r:    ['^', '-'],
    wink_l:    ['-', '^'],
    wink2_r:   ['^', '−'],
    wink2_l:   ['−', '^'],
    peek:      ['·', '<'],
    peek_l:    ['>', '·'],
    look_l:    ['·', '⟩'],
    look_r:    ['⟨', '·'],
    wink_star: ['☆', '-'],
    wink3:     ['＾', '−'],
    // 混合
    mix_ht:    ['>', 'T'],
    mix_oc:    ['○', '●'],
    mix_oc2:   ['●', '○'],
    mix_cs:    ['✧', '★'],
  },

  // === 嘴巴 ===
  mouths: {
    // 可爱/中性
    omega:    'ω',
    cat:      '3',
    tiny:     'ᴗ',
    blush2:   '∇',
    dot3:     '•',
    // 开心
    smile:    '▽',
    grin:     '∀',
    cheer:    '▽',
    vsmile:   '︶',
    crescent: '◡',
    music:    '♪',
    peace:    'v',
    wide:     '∀',
    wai:      'ワ',
    triangle: '∇',
    // 悲伤
    cry:      '﹏',
    frown:    '︿',
    wavy:     '≈',
    flat:     '─',
    down:     'д',
    small:    'o',
    sigh:     'へ',
    tonguet:  'ρ',
    pout:     '∪',
    // 生气
    rage:     '皿',
    scream:   '口',
    angry:    'Д',
    furious:  'へ',
   怒:        'ω',
    // 惊讶
    open:     'O',
    shock:    '▽',
    big:      '▽',
    surprise: 'o',
    // 困倦
    yawn:     'o',
    sleep:    'ω',
    // 特殊
    star:     '★',
    note:     '♪',
    blush3:   '灬',
    cap:      '∩',
    zero:     '0',
    U:        'U',
    xi:       '夕',
  },

  // === 手臂 ===
  // [left_str, right_str]
  arms: {
    none:     ['', ''],
    // 欢呼/举手
    cheer:    ['ヽ', 'ﾉ'],
    cheer2:   ['ヾ', 'ﾉ'],
    cheer3:   ['ヽ', 'ﾉ'],
    cheer_w:  ['ヾ', 'ﾉﾞ'],
    cheer_d:  ['ヾ', 'ﾉﾞ'],
    // 抱/环绕
    hug:      ['o', 'o'],
    hug2:     ['Ｏ', 'Ｏ'],
    hug3:     ['(*', '*)'],
    // 竖拇指/评价
    thumb_l:  ['d=', ''],
    thumb_r:  ['', 'b'],
    thumbs:   ['d=', 'b'],
    ok:       ['o(', ')o'],
    // 指向/攻击
    point:    ['凸', ''],
    point2:   ['', '凸'],
    grab:     ['σ', 'σ'],
    grab2:    ['σ', ''],
    // 张开
    spread:   ['＼', '/'],
    spread2:  ['\\', '/'],
    spread3:  ['/', '\\'],
    // 挥手
    wave_l:   ['ψ', ''],
    wave_r:   ['', 'Ψ'],
    wave:     ['ψ', 'Ψ'],
    // 持物
    hold:     ['φ', '♪'],
    pen:      ['φ', ''],
    // 拳/力量
    fist_l:   ['o(', ''],
    fist_r:   ['', ')o'],
    power:    ['ᕙ', 'ᕗ'],
    fight:    ['(ง', 'ง)'],
    punch:    ['(ง', ')ง'],
    cast:     ['╰(', ')╯'],
    toss:     ['(╯', ')╯'],
    shield:   ['ᕦ(', ')ᕤ'],
    dance:    ['└(', ')┘'],
    grabby:   ['ლ(', 'ლ)'],
    cheer_up: ['٩(', ')و'],
    wing:     ['ʚ', 'ɞ'],
    // 抱歉/投降
    bow:      ['m(_', '_)m'],
    surrender:['(´', '`)', ],
    // 特殊
    run:      ['─=≡Σ', ''],
    run2:     ['ε = =', ''],
    fish:     ['', '><』'],
    flip:     ['(╯', '╯'],
    push:     ['∑', ''],
    clap:     ['ヽ(', ')ﾉ'],
    stretch:  ['╭(', ')╯'],
    hug_wall: ['щ(', 'щ)'],
  },

  // === 边界 ===
  bounds: {
    paren:    ['(', ')'],
    paren2:   ['（', '）'],
    angle:    ['<', '>'],
    angle2:   ['＜', '＞'],
    square:   ['[', ']'],
    none:     ['', ''],
    brace:    ['{', '}'],
    // 特殊（有时边界被手臂替代）
    wave_l:   ['~', ')'],
    wave_r:   ['(', '~'],
    flower:   ['❁', '❁'],
    deco_r:   ['✧', '✧'],
  },

  // === 装饰 ===
  // [left_str, right_str]
  deco: {
    none:     ['', ''],
    star:     ['☆', '☆'],
    stars:    ['★', '★'],
    sparkle:  ['✧', '✧'],
    sparkle2: ['✧', '✧*｡'],
    heart:    ['♡', '♡'],
    hearts:   ['♥', '♥'],
    flower:   ['❁', '✿'],
    flower2:  ['❀', '❀'],
    music:    ['♪', '♪'],
    note:     ['♫', '♫'],
    wave:     ['~', '~'],
    wave2:    ['~~', '~~'],
    spark3:   ['✺◟', '◞✺'],
    glow:     ['✧*｡', '*✧'],
    glow2:    ['✧⁺⸜', '⸝⁺✧'],
    check:    ['✓', '✓'],
    crown:    ['♛', '♛'],
    fire:     ['🔥', '🔥'],
    star_trail: ['', '☆ﾟ*'],
  }
};

/**
 * 预设表情 — 直接引用 KAOMOJI_PARTS 的 key 组合
 * resolver 会将这些展开为实际的段位替换映射
 */
const PRESET_EXPRESSIONS = {
  // === 开心 ===
  happy_smile:     { eyes: 'happy',   mouth: 'smile',  arms: 'none',  bounds: 'paren', deco: 'none' },
  happy_cheer:     { eyes: 'happy',   mouth: 'grin',   arms: 'cheer', bounds: 'paren', deco: 'none' },
  happy_big:       { eyes: 'round',   mouth: 'grin',   arms: 'cheer2',bounds: 'paren', deco: 'none' },
  happy_star:      { eyes: 'star',    mouth: 'smile',  arms: 'none',  bounds: 'paren', deco: 'none' },
  happy_v:         { eyes: 'vline',   mouth: 'smile',  arms: 'none',  bounds: 'paren', deco: 'none' },
  happy_wave:      { eyes: 'vline',   mouth: 'smile',  arms: 'none',  bounds: 'paren', deco: 'none' },
  happy_excited:   { eyes: 'grin',    mouth: 'wide',   arms: 'cheer', bounds: 'paren', deco: 'sparkle' },
  happy_proud:     { eyes: 'grin',    mouth: 'music',  arms: 'hold',  bounds: 'paren', deco: 'none' },
  happy_cute:      { eyes: 'cute',    mouth: 'tiny',   arms: 'none',  bounds: 'paren', deco: 'none' },
  happy_sparkle:   { eyes: 'sparkle', mouth: 'crescent',arms: 'none', bounds: 'paren', deco: 'sparkle' },
  happy_wai:       { eyes: 'grin',    mouth: 'wai',    arms: 'spread',bounds: 'paren', deco: 'none' },
  happy_ok:        { eyes: 'happy',   mouth: 'smile',  arms: 'thumbs',bounds: 'paren', deco: 'none' },
  happy_clap:      { eyes: 'happy',   mouth: 'smile',  arms: 'clap',  bounds: 'paren', deco: 'music' },
  happy_yay:       { eyes: 'grin',    mouth: 'grin',   arms: 'cheer3',bounds: 'paren', deco: 'star' },
  happy_dance:     { eyes: 'happy',   mouth: 'grin',   arms: 'dance', bounds: 'paren', deco: 'note' },
  happy_launch:    { eyes: 'sparkle', mouth: 'smile',  arms: 'cheer_up', bounds: 'paren', deco: 'sparkle' },

  // === 喜爱 ===
  love:            { eyes: 'content', mouth: 'omega',  arms: 'hug',   bounds: 'paren', deco: 'none' },
  love_eyes:       { eyes: 'star',    mouth: 'cat',    arms: 'none',  bounds: 'paren', deco: 'none' },
  love_hug:        { eyes: 'content', mouth: 'cat',    arms: 'hug2',  bounds: 'paren', deco: 'hearts' },
  love_big:        { eyes: 'round',   mouth: 'tiny',   arms: 'hug',   bounds: 'paren', deco: 'heart' },
  love_hearts:     { eyes: 'flower',  mouth: 'crescent',arms:'none',  bounds: 'paren', deco: 'none' },
  love_shy:        { eyes: 'dot2',    mouth: 'tiny',   arms: 'none',  bounds: 'paren', deco: 'none' },
  love_reach:      { eyes: 'content', mouth: 'cat',    arms: 'grabby', bounds: 'paren', deco: 'heart' },

  // === 伤心 ===
  sad:             { eyes: 'sad',     mouth: 'frown',  arms: 'none',  bounds: 'paren', deco: 'none' },
  sad_cry:         { eyes: 'teary',   mouth: 'cry',    arms: 'hug',   bounds: 'paren', deco: 'none' },
  sad_cry2:        { eyes: 'cry',     mouth: 'cry',    arms: 'none',  bounds: 'paren', deco: 'none' },
  sad_tears:       { eyes: 'cry2',    mouth: 'flat',   arms: 'none',  bounds: 'paren', deco: 'none' },
  sad_bow:         { eyes: 'dash',    mouth: 'flat',   arms: 'none',  bounds: 'paren', deco: 'none' },
  sad_down:        { eyes: 'flat',    mouth: 'down',   arms: 'none',  bounds: 'paren', deco: 'none' },
  sad_sigh:        { eyes: 'sad',     mouth: 'sigh',   arms: 'none',  bounds: 'paren', deco: 'none' },
  sad_worried:     { eyes: 'worried', mouth: 'frown',  arms: 'none',  bounds: 'paren', deco: 'none' },
  sad_defeated:    { eyes: 'flat',    mouth: 'flat',   arms: 'none',  bounds: 'paren', deco: 'none' },
  sad_surrender:   { eyes: 'content', mouth: 'flat',   arms: 'none',  bounds: 'paren', deco: 'none' },

  // === 生气 ===
  angry:           { eyes: 'glare',   mouth: 'rage',   arms: 'none',  bounds: 'paren', deco: 'none' },
  angry_rage:      { eyes: 'rage',    mouth: 'rage',   arms: 'point', bounds: 'paren', deco: 'none' },
  angry_yell:      { eyes: 'furious', mouth: 'scream', arms: 'cheer', bounds: 'paren', deco: 'none' },
  angry_furious:   { eyes: 'dark',    mouth: 'angry',  arms: 'none',  bounds: 'paren', deco: 'none' },
  angry_point:     { eyes: 'glare',   mouth: 'rage',   arms: 'grab2', bounds: 'paren', deco: 'none' },
  angry_flip:      { eyes: 'shock',   mouth: 'rage',   arms: 'flip',  bounds: 'paren', deco: 'none' },
  angry_fight:     { eyes: 'glare',   mouth: 'rage',   arms: 'fight', bounds: 'paren', deco: 'none' },
  angry_punch:     { eyes: 'rage',    mouth: 'scream', arms: 'punch', bounds: 'paren', deco: 'fire' },
  angry_throw:     { eyes: 'furious', mouth: 'rage',   arms: 'toss',  bounds: 'paren', deco: 'none' },

  // === 惊讶 ===
  surprised:       { eyes: 'wide',    mouth: 'open',   arms: 'none',  bounds: 'paren', deco: 'none' },
  shocked:         { eyes: 'big',     mouth: 'shock',  arms: 'spread',bounds: 'paren', deco: 'none' },
  surprised_star:  { eyes: 'star',    mouth: 'open',   arms: 'none',  bounds: 'paren', deco: 'sparkle' },
  shocked_big:     { eyes: 'wide',    mouth: 'scream', arms: 'spread',bounds: 'paren', deco: 'none' },
  surprised_what:  { eyes: 'shock',   mouth: 'down',   arms: 'none',  bounds: 'paren', deco: 'none' },
  surprised_shield:{ eyes: 'wide',    mouth: 'open',   arms: 'shield',bounds: 'paren', deco: 'sparkle' },

  // === 可爱/卖萌 ===
  cute:            { eyes: 'dot',     mouth: 'omega',  arms: 'none',  bounds: 'paren', deco: 'none' },
  cute_cat:        { eyes: 'cute',    mouth: 'cat',    arms: 'none',  bounds: 'paren', deco: 'none' },
  cute_blush:      { eyes: 'blush',   mouth: 'omega',  arms: 'none',  bounds: 'paren', deco: 'none' },
  cute_cat2:       { eyes: 'cat',     mouth: 'omega',  arms: 'none',  bounds: 'paren', deco: 'none' },
  cute_shy:        { eyes: 'baby',    mouth: 'tiny',   arms: 'none',  bounds: 'paren', deco: 'none' },
  cute_hug:        { eyes: 'cute',    mouth: 'tiny',   arms: 'hug',   bounds: 'paren', deco: 'heart' },
  cute_paw:        { eyes: 'dot2',    mouth: 'cat',    arms: 'none',  bounds: 'paren', deco: 'none' },
  cute_bloom:      { eyes: 'flower',  mouth: 'tiny',   arms: 'none',  bounds: 'paren', deco: 'flower' },
  cute_star:       { eyes: 'sparkle', mouth: 'tiny',   arms: 'none',  bounds: 'paren', deco: 'star' },
  cute_dote:       { eyes: 'baby',    mouth: 'cat',    arms: 'none',  bounds: 'paren', deco: 'none' },
  cute_flap:       { eyes: 'cute',    mouth: 'tiny',   arms: 'wing',  bounds: 'paren', deco: 'sparkle' },

  // === 眨眼 ===
  wink:            { eyes: 'wink_r',  mouth: 'omega',  arms: 'none',  bounds: 'paren', deco: 'none' },
  wink_cheeky:     { eyes: 'wink_r',  mouth: 'cat',    arms: 'none',  bounds: 'paren', deco: 'star' },
  wink_star:       { eyes: 'wink_star',mouth: 'tiny',  arms: 'none',  bounds: 'paren', deco: 'none' },
  wink_wave:       { eyes: 'wink_r',  mouth: 'smile',  arms: 'cheer', bounds: 'paren', deco: 'none' },
  wink_cute:       { eyes: 'wink2_r', mouth: 'cat',    arms: 'none',  bounds: 'paren', deco: 'star' },
  wink_playful:    { eyes: 'wink_r',  mouth: 'cat',    arms: 'grab',  bounds: 'paren', deco: 'none' },

  // === 困倦 ===
  sleepy:          { eyes: 'dash',    mouth: 'yawn',   arms: 'none',  bounds: 'paren', deco: 'none' },
  sleeping:        { eyes: 'sleep',   mouth: 'flat',   arms: 'none',  bounds: 'paren', deco: 'none' },
  drowsy:          { eyes: 'flat',    mouth: 'yawn',   arms: 'none',  bounds: 'paren', deco: 'none' },

  // === 得意 ===
  smug:            { eyes: 'smug',    mouth: 'cat',    arms: 'none',  bounds: 'paren', deco: 'none' },
  smug_cool:       { eyes: 'vline',   mouth: 'smile',  arms: 'none',  bounds: 'paren', deco: 'none' },
  smug_star:       { eyes: 'smug',    mouth: 'cat',    arms: 'none',  bounds: 'paren', deco: 'star' },

  // === 中性 ===
  neutral:         { eyes: 'dot',     mouth: 'omega',  arms: 'none',  bounds: 'paren', deco: 'none' },
  normal:          { eyes: 'vline',   mouth: 'vsmile', arms: 'none',  bounds: 'paren', deco: 'none' },
  curious:         { eyes: 'curoust', mouth: 'omega',  arms: 'none',  bounds: 'paren', deco: 'none' },
  confused:        { eyes: 'confused',mouth: 'wavy',   arms: 'none',  bounds: 'paren', deco: 'none' },
};

/**
 * 心情 → 预设映射
 * 每个心情对应多个预设，运行时随机选一个
 */
const MOOD_PRESETS = {
  happy:      ['happy_cheer', 'happy_smile', 'happy_big', 'happy_excited', 'happy_v', 'happy_dance', 'happy_launch'],
  love:       ['love', 'love_eyes', 'love_hug', 'love_big', 'love_hearts', 'love_reach'],
  sad:        ['sad_cry', 'sad', 'sad_cry2', 'sad_tears', 'sad_sigh'],
  angry:      ['angry', 'angry_rage', 'angry_yell', 'angry_furious', 'angry_fight', 'angry_punch', 'angry_throw'],
  surprised:  ['surprised', 'shocked', 'surprised_star', 'shocked_big', 'surprised_shield'],
  playing:    ['wink_playful', 'happy_cheer', 'happy_ok', 'wink_wave', 'happy_dance', 'cute_flap'],
  hungry:     ['cute_cat', 'sad_down', 'cute'],
  sleepy:     ['sleepy', 'drowsy'],
  sleeping:   ['sleeping'],
  normal:     ['neutral', 'normal'],
  greeting:   ['happy_wave', 'happy_v', 'happy_smile', 'happy_yay', 'happy_launch'],
  satisfied:  ['happy_cute', 'smug', 'happy_smile'],
  curious:    ['curious', 'confused', 'cute_cat'],
  alert:      ['surprised', 'surprised_what'],
  stressed:   ['sad_surrender', 'sad_defeated', 'confused'],
  drowsy:     ['drowsy', 'sleepy'],
  eating:     ['happy_smile', 'cute_cat'],
  levelup:    ['happy_excited', 'happy_yay', 'happy_big'],
  evolve:     ['happy_excited', 'happy_star'],
  walking:    ['happy_v'],
  blink:      [],
  look_left:  [],
  look_right: [],
  look_up:    [],
  stretch:    ['happy_cute'],
  clean:      ['happy_smile'],
  tail_chase: ['surprised'],
  yawn:       ['drowsy'],
  shy:        ['cute_shy', 'love_shy'],
  confused:   ['confused'],
  worried:    ['sad_worried', 'sad_defeated'],
  smug:       ['smug', 'smug_cool', 'smug_star'],
  winking:    ['wink', 'wink_cheeky'],
};

/**
 * 解析器：将预设名展开为段位替换映射
 * @param {string} presetName - PRESET_EXPRESSIONS 中的 key
 * @returns {object} { 'seg-eye-l': char, 'seg-mouth': char, ... }
 */
function resolvePreset(presetName) {
  const preset = PRESET_EXPRESSIONS[presetName];
  if (!preset) return null;

  const eyes = KAOMOJI_PARTS.eyes[preset.eyes || 'dot'] || ['·', '·'];
  const mouth = KAOMOJI_PARTS.mouths[preset.mouth || 'omega'] || 'ω';
  const arms = KAOMOJI_PARTS.arms[preset.arms || 'none'] || ['', ''];
  const bounds = KAOMOJI_PARTS.bounds[preset.bounds || 'paren'] || ['(', ')'];
  const deco = KAOMOJI_PARTS.deco[preset.deco || 'none'] || ['', ''];

  return {
    'seg-deco-l':   deco[0],
    'seg-arm-l':    arms[0],
    'seg-bound-l':  bounds[0],
    'seg-eye-l':    eyes[0],
    'seg-mouth':    mouth,
    'seg-eye-r':    eyes[1],
    'seg-bound-r':  bounds[1],
    'seg-arm-r':    arms[1],
    'seg-deco-r':   deco[1],
  };
}

/**
 * 根据心情随机选一个预设并解析
 * @param {string} mood
 * @returns {object|null} 段位映射，或 null（无对应预设）
 */
function resolveMoodPreset(mood) {
  const candidates = MOOD_PRESETS[mood];
  if (!candidates || candidates.length === 0) return null;
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  return resolvePreset(pick);
}
