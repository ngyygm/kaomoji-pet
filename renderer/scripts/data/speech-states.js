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
    lines: ['今天心情不错~', '喵~', '嗯...好舒服。']
  },
  stressed_concern: {
    description: '压力大时关心',
    lines: ['记得休息一下。', '不要太累哦。', '我在陪着你。']
  },
  curious: {
    description: '好奇',
    lines: ['嗯？', '那是什么？', '让我看看。']
  },
  affection: {
    description: '亲近/贴贴',
    lines: ['喵呜~好舒服', '再摸摸我...', '最喜欢你了。']
  },
  drowsy: {
    description: '犯困',
    lines: ['好困...', '有点迷糊。', '午后犯困了喵。', '眼皮好重。', '打个大哈欠~']
  },
  shy: {
    description: '害羞',
    lines: ['不要一直看着我啦。', '有点害羞...', '你看着我，我不好意思了。', '脸红红。']
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
    lines: ['哼哼~', '看我的！', '厉害吧~', '这点小事难不倒我。']
  }
};

function getStateSpeechLines(stateKey) {
  const entry = STATE_SPEECH[stateKey];
  if (!entry) return ['...'];
  return entry.lines;
}

function pickRandomSpeech(stateKey) {
  const lines = getStateSpeechLines(stateKey);
  return lines[Math.floor(Math.random() * lines.length)];
}
