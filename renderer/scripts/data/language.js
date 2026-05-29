/**
 * 语音气泡文本库 — 按心情/场景分类
 *
 * Schema:
 *   description: string   — 分类说明
 *   lines:       string[] — 随机选一条显示
 */
const SPEECH_BUBBLES = {
  hungry:   { description: '饿了的时候说的话', lines: ['好饿...给我小鱼🐟', '肚子咕咕叫了...', '想吃鱼！'] },
  sleepy:   { description: '困了的时候说的话', lines: ['好困...想睡觉...', '打哈欠~', '眼皮好重...'] },
  bored:    { description: '无聊的时候说的话', lines: ['好无聊啊...', '陪我玩嘛！', '嗯...干点什么呢'] },
  happy:    { description: '开心的时候说的话', lines: ['喵~好开心！', '今天心情不错~', '幸福！'] },
  sad:      { description: '不开心的时候说的话', lines: ['呜呜...', '不开心...', '陪我一下好不好'] },
  greeting: { description: '打招呼的时候说的话', lines: ['你回来啦！', '喵~', '想你了！'] },
  levelup:  { description: '升级的时候说的话', lines: ['升级了！太棒了！', '我变强了！', '耶！升了一级！'] },
  pet:      { description: '被摸头的时候说的话', lines: ['喵呜~', '好舒服~', '再摸摸~'] },
  feed:     { description: '被喂食的时候说的话', lines: ['好吃！', '谢谢投喂！', '鱼鱼真好吃~'] },
  play:     { description: '玩耍的时候说的话', lines: ['好好玩！', '再来一次！', '太开心了！'] },
  evolve:   { description: '进化的时候说的话', lines: ['我进化了！', '感觉不一样了！', '新的力量觉醒了！'] }
};

/**
 * 颜语言密码系统
 */
const KAOMOJI_CIPHER = {
  encode: {
    'A':'ヮ', 'B':'Ψ', 'C':'ς', 'D':'∂', 'E':'ε', 'F':'ƒ', 'G':'ζ',
    'H':'Ξ', 'I':'ι', 'J':'φ', 'K':'κ', 'L':'λ', 'M':'μ', 'N':'ν',
    'O':'θ', 'P':'π', 'Q':'χ', 'R':'ρ', 'S':'σ', 'T':'τ', 'U':'υ',
    'V':'∆', 'W':'ω', 'X':'ξ', 'Y':'ψ', 'Z':'ζ',
    ' ':'・', '!':'！', '?':'？', '.':'。', ',':'、'
  }
};
KAOMOJI_CIPHER.decode = {};
for (const [k, v] of Object.entries(KAOMOJI_CIPHER.encode)) {
  KAOMOJI_CIPHER.decode[v] = k;
}

function encodeKaomojiText(text) {
  return text.split('').map(ch => {
    return KAOMOJI_CIPHER.encode[ch.toUpperCase()] || ch;
  }).join('');
}

function decodeKaomojiText(encoded) {
  return encoded.split('').map(ch => {
    return KAOMOJI_CIPHER.decode[ch] || ch;
  }).join('');
}

/**
 * 颜语言词汇库
 *
 * Schema:
 *   text:       string — 英文原文（会被编码显示）
 *   mood:       string — 说话时的表情
 *   category:   string — 语义分类
 *   description: string — 中文寓意
 */
const KAOMOJI_PHRASES = [
  { text: 'HI', mood: 'greeting', category: 'greeting', description: '打招呼' },
  { text: 'LOVE YOU', mood: 'love', category: 'emotion', description: '表达喜爱' },
  { text: 'HUNGRY', mood: 'hungry', category: 'need', description: '表达饿了' },
  { text: 'PLAY WITH ME', mood: 'playing', category: 'request', description: '请求玩耍' },
  { text: 'SLEEPY', mood: 'sleepy', category: 'state', description: '表达困了' },
  { text: 'HAPPY', mood: 'happy', category: 'emotion', description: '表达开心' },
  { text: 'SAD', mood: 'sad', category: 'emotion', description: '表达难过' },
  { text: 'THANK YOU', mood: 'happy', category: 'greeting', description: '表示感谢' },
  { text: 'HELLO', mood: 'greeting', category: 'greeting', description: '打招呼' },
  { text: 'BYE', mood: 'normal', category: 'greeting', description: '告别' },
  { text: 'GOOD', mood: 'happy', category: 'emotion', description: '表达好' },
  { text: 'WOW', mood: 'surprised', category: 'emotion', description: '表达惊讶' },
  { text: 'NO', mood: 'angry', category: 'emotion', description: '表达拒绝' },
  { text: 'YES', mood: 'happy', category: 'emotion', description: '表达同意' },
  { text: 'MEOW', mood: 'normal', category: 'sound', description: '猫叫' },
  { text: 'MORNING', mood: 'greeting', category: 'greeting', description: '早安' },
  { text: 'NIGHT', mood: 'sleepy', category: 'greeting', description: '晚安' },
  { text: 'NICE', mood: 'happy', category: 'emotion', description: '表达不错' },
  { text: 'FUN', mood: 'playing', category: 'emotion', description: '表达好玩' },
  { text: 'FOOD', mood: 'hungry', category: 'need', description: '表达想吃东西' }
];

// Full kaomoji phrases — randomly picked from KAOMOJI_BY_MOOD when speak_kaomoji triggers
if (typeof KAOMOJI_BY_MOOD !== 'undefined') {
  const moodMap = {
    happy: 'happy', love: 'love', hungry: 'cute', sleepy: 'sleepy',
    angry: 'angry', sad: 'sad', surprised: 'surprised', playing: 'wink',
    greeting: 'happy', normal: 'cute', curious: 'cute', confused: 'sad',
    stressed: 'scared', drowsy: 'sleepy', shy: 'shy', smug: 'cool'
  };

  function pickRandomKaomoji(mood) {
    const category = moodMap[mood] || 'cute';
    const pool = KAOMOJI_BY_MOOD[category] || KAOMOJI_BY_MOOD.cute;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function pickRandomKaomojiPhrase(mood) {
    if (typeof KAOMOJI_PHRASES_ZH === 'undefined') return null;
    const category = moodMap[mood] || 'happy';
    const pool = KAOMOJI_PHRASES_ZH[category] || KAOMOJI_PHRASES_ZH.happy;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
