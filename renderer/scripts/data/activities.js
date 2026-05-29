/**
 * 预设活动 — 由多个原子操作编排而成的行为序列
 *
 * Schema per activity:
 *   description: string     — 活动描述
 *   trigger:     object     — 触发条件
 *     cooldown:   number     — 冷却时间 (ms)
 *     minHunger:  ?number    — 最低饱食度（低于此值才触发）
 *     maxEnergy:  ?number    — 最高精力（低于此值才触发）
 *     minHappiness: ?number  — 最低心情
 *   probability: number     — 被随机选中时的概率权重
 *   steps:       object[]   — 按序执行的步骤列表
 *
 * Schema per step:
 *   delay:   number — 相对于活动开始的延迟时间 (ms)
 *   action:  string — 操作类型
 *   params:  object — 操作参数
 *
 * Action types:
 *   animation      — 播放帧动画 { name, duration }
 *   bubble         — 显示气泡 { text | moodKey, duration }
 *   particles      — 发射粒子 { type, count }
 *   expression     — 应用表情组合 { name, duration }
 *   idleStop       — 停止待机循环
 *   idleStart      — 恢复待机循环
 *   sleep          — 进入睡眠
 *   walk           — 屏幕随机走动
 *   jump           — 屏幕随机闪现
 *   toast          — 显示 Toast 通知 { text, type }
 *   kaomojiPhrase  — 显示颜语言 { duration }
 *   prank          — 全屏搞怪 { duration }
 *   statEffect     — 修改属性 { stat: delta }
 */
const ACTIVITIES = {
  // === 自主行为（scheduler 随机触发） ===

  hungry_plea: {
    description: '饿了求助：肚子饿了时发出求食信号',
    trigger: { minHunger: 25 },
    probability: 0.50,
    steps: [
      { delay: 0,    action: 'idleStop' },
      { delay: 0,    action: 'animation', params: { name: 'hungry', duration: 4000 } },
      { delay: 0,    action: 'bubble', params: { moodKey: 'hungry', duration: 4000 } },
      { delay: 0,    action: 'particles', params: { type: 'food', count: 2 } },
      { delay: 5000, action: 'idleStart' }
    ]
  },

  sleepy_drowse: {
    description: '困倦打盹：精力不足时打哈欠犯困',
    trigger: { maxEnergy: 20 },
    probability: 0.40,
    steps: [
      { delay: 0,    action: 'idleStop' },
      { delay: 0,    action: 'animation', params: { name: 'sleepy', duration: 4000 } },
      { delay: 0,    action: 'bubble', params: { moodKey: 'sleepy', duration: 4000 } },
      { delay: 5000, action: 'idleStart' }
    ]
  },

  sleepy_faint: {
    description: '困倒睡着：精力极低时直接睡着',
    trigger: { maxEnergy: 10 },
    probability: 0.20,
    steps: [
      { delay: 0,    action: 'idleStop' },
      { delay: 0,    action: 'bubble', params: { text: '太困了...先睡一会儿', duration: 3000 } },
      { delay: 1000, action: 'sleep' },
      { delay: 1000, action: 'animation', params: { name: 'sleeping', duration: 0 } }
    ]
  },

  screen_walk: {
    description: '屏幕散步：走到屏幕上随机位置',
    trigger: { cooldown: 300000 },
    probability: 0.12,
    steps: [
      { delay: 0,     action: 'idleStop' },
      { delay: 0,     action: 'animation', params: { name: 'walking', duration: 15000 } },
      { delay: 0,     action: 'walk' },
      { delay: 0,     action: 'bubble', params: { text: '出去走走~', duration: 4000 } },
      { delay: 15000, action: 'animation', params: { name: 'satisfied', duration: 2000 } },
      { delay: 17000, action: 'idleStart' }
    ]
  },

  jump_teleport: {
    description: '闪现瞬移：突然消失出现在别处',
    trigger: { cooldown: 300000 },
    probability: 0.05,
    steps: [
      { delay: 0,    action: 'idleStop' },
      { delay: 0,    action: 'jump' },
      { delay: 0,    action: 'bubble', params: { text: '瞬移！', duration: 2500 } },
      { delay: 500,  action: 'animation', params: { name: 'surprised', duration: 2000 } },
      { delay: 3000, action: 'idleStart' }
    ]
  },

  greet: {
    description: '打招呼：向用户表示友好',
    trigger: {},
    probability: 0.08,
    steps: [
      { delay: 0,    action: 'idleStop' },
      { delay: 0,    action: 'bubble', params: { moodKey: 'greeting', duration: 4000 } },
      { delay: 0,    action: 'particles', params: { type: 'heart', count: 2 } },
      { delay: 0,    action: 'animation', params: { name: 'greeting', duration: 3000 } },
      { delay: 4000, action: 'idleStart' }
    ]
  },

  sing: {
    description: '唱歌：哼起歌来，飘出音符',
    trigger: {},
    probability: 0.08,
    steps: [
      { delay: 0,    action: 'idleStop' },
      { delay: 0,    action: 'bubble', params: { text: '喵~♪', duration: 3000 } },
      { delay: 0,    action: 'particles', params: { type: 'note', count: 3 } },
      { delay: 0,    action: 'animation', params: { name: 'satisfied', duration: 3000 } },
      { delay: 4000, action: 'idleStart' }
    ]
  },

  speak_kaomoji: {
    description: '说颜语言：用颜语言密码说一句话',
    trigger: {},
    probability: 0.08,
    steps: [
      { delay: 0,    action: 'idleStop' },
      { delay: 0,    action: 'kaomojiPhrase', params: { duration: 5000 } },
      { delay: 0,    action: 'particles', params: { type: 'sparkle', count: 2 } },
      { delay: 5000, action: 'idleStart' }
    ]
  },

  kaomoji_react: {
    description: '颜文字反应：随机弹出颜文字表达心情',
    trigger: {},
    probability: 0.10,
    steps: [
      { delay: 0,    action: 'idleStop' },
      { delay: 0,    action: 'kaomojiReact', params: { duration: 4000 } },
      { delay: 0,    action: 'particles', params: { type: 'sparkle', count: 1 } },
      { delay: 4500, action: 'idleStart' }
    ]
  },

  prank_giant: {
    description: '全屏捣蛋：放大颜文字占满屏幕（稀有）',
    trigger: { cooldown: 1800000, minHappiness: 60 },
    probability: 0.02,
    steps: [
      { delay: 0,    action: 'idleStop' },
      { delay: 0,    action: 'prank', params: { duration: 3000 } },
      { delay: 0,    action: 'bubble', params: { text: '嘿嘿~', duration: 2000 } },
      { delay: 4000, action: 'idleStart' }
    ]
  },

  sad_mope: {
    description: '难过发呆：心情低落时默默难过',
    trigger: { minHappiness: 25 },
    probability: 0.15,
    steps: [
      { delay: 0,    action: 'idleStop' },
      { delay: 0,    action: 'animation', params: { name: 'sad', duration: 4000 } },
      { delay: 0,    action: 'bubble', params: { moodKey: 'sad', duration: 4000 } },
      { delay: 5000, action: 'idleStart' }
    ]
  },

  late_night_sleep: {
    description: '深夜自睡：深夜精力不足时自动睡觉',
    trigger: { maxEnergy: 40, hours: [0, 1, 2, 3, 4, 5] },
    probability: 0.30,
    steps: [
      { delay: 0,    action: 'idleStop' },
      { delay: 0,    action: 'bubble', params: { text: '太晚了...先睡了', duration: 3000 } },
      { delay: 1000, action: 'sleep' },
      { delay: 1000, action: 'animation', params: { name: 'sleeping', duration: 0 } }
    ]
  },

  // === 用户交互行为（由 app.js 触发） ===

  action_pet: {
    description: '摸头：用户双击颜文字摸头',
    trigger: {},
    probability: 0,
    steps: [
      { delay: 0,    action: 'idleStop' },
      { delay: 0,    action: 'animation', params: { name: 'happy', duration: 2500 } },
      { delay: 0,    action: 'bubble', params: { moodKey: 'pet', duration: 2500 } },
      { delay: 0,    action: 'particles', params: { type: 'heart', count: 4 } },
      { delay: 3000, action: 'idleStart' }
    ]
  },

  action_feed: {
    description: '喂食：用户喂小鱼干',
    trigger: {},
    probability: 0,
    steps: [
      { delay: 0,    action: 'idleStop' },
      { delay: 0,    action: 'animation', params: { name: 'eating', duration: 2500 } },
      { delay: 0,    action: 'bubble', params: { moodKey: 'feed', duration: 2500 } },
      { delay: 0,    action: 'particles', params: { type: 'food', count: 3 } },
      { delay: 0,    action: 'particles', params: { type: 'heart', count: 2 } },
      { delay: 3000, action: 'idleStart' }
    ]
  },

  action_play: {
    description: '玩耍：用户发起玩耍',
    trigger: {},
    probability: 0,
    steps: [
      { delay: 0,    action: 'idleStop' },
      { delay: 0,    action: 'animation', params: { name: 'playing', duration: 2500 } },
      { delay: 0,    action: 'bubble', params: { moodKey: 'play', duration: 2500 } },
      { delay: 0,    action: 'particles', params: { type: 'star', count: 4 } },
      { delay: 3000, action: 'idleStart' }
    ]
  },

  action_sleep: {
    description: '睡觉：用户让宠物睡觉',
    trigger: {},
    probability: 0,
    steps: [
      { delay: 0,    action: 'idleStop' },
      { delay: 0,    action: 'bubble', params: { text: '晚安...', duration: 2000 } },
      { delay: 0,    action: 'particles', params: { type: 'zzz', count: 3 } },
      { delay: 500,  action: 'sleep' },
      { delay: 500,  action: 'animation', params: { name: 'sleeping', duration: 0 } }
    ]
  },

  action_wakeup: {
    description: '叫醒：用户唤醒宠物',
    trigger: {},
    probability: 0,
    steps: [
      { delay: 0,    action: 'idleStop' },
      { delay: 0,    action: 'animation', params: { name: 'surprised', duration: 2000 } },
      { delay: 0,    action: 'bubble', params: { moodKey: 'greeting', duration: 2500 } },
      { delay: 0,    action: 'particles', params: { type: 'sparkle', count: 3 } },
      { delay: 3000, action: 'idleStart' }
    ]
  },

  action_levelup: {
    description: '升级效果：等级提升时的庆祝',
    trigger: {},
    probability: 0,
    steps: [
      { delay: 0,    action: 'idleStop' },
      { delay: 0,    action: 'expression', params: { name: 'starstruck', duration: 3000 } },
      { delay: 0,    action: 'particles', params: { type: 'sparkle', count: 8 } },
      { delay: 0,    action: 'particles', params: { type: 'star', count: 5 } },
      { delay: 0,    action: 'toast', params: { text: '升级了！太棒了！', type: 'special' } },
      { delay: 4000, action: 'idleStart' }
    ]
  },

  action_evolve: {
    description: '进化效果：进化时的华丽变身',
    trigger: {},
    probability: 0,
    steps: [
      { delay: 0,    action: 'idleStop' },
      { delay: 0,    action: 'expression', params: { name: 'excited', duration: 3000 } },
      { delay: 0,    action: 'particles', params: { type: 'sparkle', count: 12 } },
      { delay: 0,    action: 'particles', params: { type: 'star', count: 8 } },
      { delay: 0,    action: 'toast', params: { text: '宠物进化了！新的形态！', type: 'special' } },
      { delay: 4000, action: 'idleStart' }
    ]
  }
};
