/**
 * 语音与文字系统 — 语音气泡、颜文字词汇、状态台词
 * 合并自 language.js + speech-states.js
 */

// === 心情气泡文本 ===

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

// === 状态台词（按系统状态/场景分类）===

const STATE_SPEECH = {
  cpu_busy: {
    description: 'CPU使用率高：小猫觉得电脑很忙',
    lines: ['电脑在努力转脑筋。', '好忙好忙。', '我感觉桌面有点热。']
  },
  memory_full: {
    description: '内存占用高：脑袋被塞满了',
    lines: ['脑袋满满的。', '好多东西挤在一起。', '要慢慢来喵。']
  },
  battery_low: {
    description: '电量低：小猫觉得困/饿',
    lines: ['电量也困了。', '我们是不是都该休息一下？', '要充电啦，我也有点没精神。']
  },
  charging: {
    description: '充电中：恢复精神',
    lines: ['补充能量中。', '慢慢亮起来了喵。']
  },
  user_typing: {
    description: '用户持续打字：安静陪伴',
    lines: ['你在认真工作。', '我安静陪你。', '手指辛苦了。']
  },
  user_idle_long: {
    description: '用户长时间无操作：孤独/等待',
    lines: ['你去哪里啦？', '我先睡一会儿。', '回来记得摸摸我。']
  },
  user_returned: {
    description: '用户回来了',
    lines: ['你回来啦。']
  },
  long_companion: {
    description: '长时间陪伴',
    lines: ['我今天陪你很久啦。', '我们已经待在一起好久。', '你忙的时候，我也在旁边。']
  },
  goodnight: {
    description: '深夜晚安',
    lines: ['晚安...', '我们也该休息了。', '明天见喵。']
  },
  morning_greeting: {
    description: '早晨问候',
    lines: ['早上好！', '新的一天开始啦。', '今天也要加油喵。']
  },
  happy_idle: {
    description: '开心空闲',
    lines: ['今天心情不错~', '喵~', '嗯...好舒服。', '(*^▽^*)', 'ヾ(◍°∇°◍)ﾉﾞ', '(ﾉ´▽｀)ﾉ♪', '(≧∀≦)♪', 'o(*￣▽￣*)o']
  },
  stressed_concern: {
    description: '压力大时关心',
    lines: ['记得休息一下。', '不要太累哦。', '我在陪着你。', 'ᕦ(･ㅂ･)ᕤ 加油', '٩( \'ω\' )و 冲鸭', '( • ̀ω•́ )✧ 一定行', 'Fight!!(ｏ^-^)尸~\'\'☆ミ☆ミ']
  },
  curious: {
    description: '好奇',
    lines: ['嗯？', '那是什么？', '让我看看。']
  },
  affection: {
    description: '亲近/贴贴',
    lines: ['喵呜~好舒服', '再摸摸我...', '最喜欢你了。', '(๑′ᴗ‵๑)Ｉ Lᵒᵛᵉᵧₒᵤ❤', '(づ｡◕ᴗᴗ◕｡)づ 抱抱', '(ღ˘⌣˘ღ) 么么哒', '(*^o^)人(^o^*)']
  },
  drowsy: {
    description: '犯困',
    lines: ['好困...', '有点迷糊。', '午后犯困了喵。', '眼皮好重。', '打个大哈欠~']
  },
  shy: {
    description: '害羞',
    lines: ['不要一直看着我啦。', '有点害羞...', '你看着我，我不好意思了。', '脸红红。', '(*/ω＼*)', '|ू･ω･` )', '(〃\'▽\'〃)', '(灬°ω°灬)']
  },
  confused: {
    description: '困惑',
    lines: ['嗯...？', '这是怎么回事？', '搞不懂喵。', '好复杂。', '我在努力理解。']
  },
  worried: {
    description: '担心',
    lines: ['你还好吗？', '感觉不太对。', '有点担心你。', '需要休息一下吗？']
  },
  smug: {
    description: '得意',
    lines: ['哼哼~', '看我的！', '厉害吧~', '这点小事难不倒我。', 'ψ(｀∇´)ψ', '(￣▽￣)~*', 'd=====(￣▽￣*)b']
  }
};

// === 颜语言词汇库 ===

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

// === 便捷函数 ===

function getStateSpeechLines(stateKey) {
  const entry = STATE_SPEECH[stateKey];
  if (!entry) return ['...'];
  return entry.lines;
}

function pickRandomSpeech(stateKey) {
  const lines = getStateSpeechLines(stateKey);
  return lines[Math.floor(Math.random() * lines.length)];
}
