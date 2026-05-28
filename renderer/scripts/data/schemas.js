/**
 * 部位定义 — 颜文字宠物身体部位分组
 * 每个部位对应 HTML span 的 CSS class
 */
const SEGMENT_GROUPS = {
  eye:   ['seg-eye-l', 'seg-eye-r'],
  mouth: ['seg-mouth'],
  arm:   ['seg-arm-l', 'seg-arm-r'],
  ear:   ['seg-ear-l', 'seg-ear-r'],
  deco:  ['seg-deco-l', 'seg-deco-r']
};

/**
 * 特效-部位兼容规则
 * 哪种 CSS 动画可以用在哪个部位组
 * 启动时会验证 EFFECTS 的 css 字段是否符合此规则
 */
const SEGMENT_ANIM_COMPAT = {
  pulse:   ['eye', 'mouth', 'arm', 'ear'],
  shake:   ['eye', 'mouth'],
  bounce:  ['mouth'],
  wave:    ['arm'],
  twitch:  ['ear'],
  drip:    ['eye'],
  sparkle: ['deco']
};

/**
 * 各进化阶段拥有的部位组
 * 特效作用于不存在的部位时自动跳过
 */
const STAGE_SEGMENTS = {
  baby:   ['arm', 'eye', 'mouth'],
  kid:    ['arm', 'ear', 'mouth'],
  adult:  ['arm', 'ear', 'eye', 'mouth'],
  legend: ['arm', 'ear', 'eye', 'mouth', 'deco']
};

/** 验证单个特效的 CSS 兼容性 */
function validateEffect(effectName, effectDef) {
  const warnings = [];
  if (!effectDef.css) return warnings;
  for (const [segClass, cssAnim] of Object.entries(effectDef.css)) {
    const group = Object.entries(SEGMENT_GROUPS).find(([_, cls]) => cls.includes(segClass))?.[0];
    if (!group) { warnings.push(`Effect "${effectName}": unknown segment "${segClass}"`); continue; }
    const allowed = SEGMENT_ANIM_COMPAT[cssAnim];
    if (allowed && !allowed.includes(group)) {
      warnings.push(`Effect "${effectName}": "${cssAnim}" not valid for ${group}`);
    }
  }
  return warnings;
}

/** 获取部位 class 对应的部位组名 */
function getSegmentGroup(segClass) {
  for (const [group, classes] of Object.entries(SEGMENT_GROUPS)) {
    if (classes.includes(segClass)) return group;
  }
  return null;
}
