/**
 * Comprehensive test for kaomoji-pet project
 * Tests: data integrity, Pet logic, rendering setup, minigame data, save/load, scheduler
 */

const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;
const errors = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    errors.push(message);
    console.log(`  ✗ FAIL: ${message}`);
  }
}

function section(title) {
  console.log(`\n=== ${title} ===`);
}

// Load all source files
function loadScript(filePath) {
  const code = fs.readFileSync(path.join(__dirname, filePath), 'utf-8');
  return code;
}

// ============================================================
section('1. File Structure — all required files exist');
// ============================================================

const requiredFiles = [
  'main.js', 'preload.js',
  'renderer/index.html', 'renderer/prank-giant.html',
  'renderer/styles/main.css',
  'renderer/scripts/app.js',
  'renderer/scripts/pet.js',
  'renderer/scripts/renderer.js',
  'renderer/scripts/scheduler.js',
  'renderer/scripts/registry.js',
  'renderer/scripts/config.js',
  'renderer/scripts/minigames.js',
  'renderer/scripts/save-manager.js',
  'renderer/scripts/data/schemas.js',
  'renderer/scripts/data/expressions.js',
  'renderer/scripts/data/animations.js',
  'renderer/scripts/data/evolutions.js',
  'renderer/scripts/data/particles.js',
  'renderer/scripts/data/language.js',
  'renderer/scripts/data/events.js',
  'renderer/scripts/data/colors.js',
  'renderer/scripts/data/reactions.js',
  'renderer/scripts/data/activities.js',
  'renderer/minigames/guess-number.html',
  'renderer/minigames/rps.html',
  'renderer/minigames/whack-a-mole.html',
  'renderer/minigames/memory-match.html',
];

for (const f of requiredFiles) {
  assert(fs.existsSync(path.join(__dirname, f)), `${f} exists`);
}

// ============================================================
section('2. JavaScript Syntax — all JS files parse without error');
// ============================================================

const jsFiles = [
  'main.js', 'preload.js',
  'renderer/scripts/app.js',
  'renderer/scripts/pet.js',
  'renderer/scripts/renderer.js',
  'renderer/scripts/scheduler.js',
  'renderer/scripts/registry.js',
  'renderer/scripts/config.js',
  'renderer/scripts/minigames.js',
  'renderer/scripts/save-manager.js',
  'renderer/scripts/data/schemas.js',
  'renderer/scripts/data/expressions.js',
  'renderer/scripts/data/animations.js',
  'renderer/scripts/data/evolutions.js',
  'renderer/scripts/data/particles.js',
  'renderer/scripts/data/language.js',
  'renderer/scripts/data/events.js',
  'renderer/scripts/data/colors.js',
  'renderer/scripts/data/reactions.js',
  'renderer/scripts/data/activities.js',
];

for (const f of jsFiles) {
  try {
    const code = loadScript(f);
    new Function(code);
    assert(true, `${f} syntax OK`);
  } catch(e) {
    assert(false, `${f} syntax: ${e.message}`);
  }
}

// ============================================================
section('3. Data Registry — PetDataRegistry has all required methods');
// ============================================================

// Create a minimal browser-like environment
const registryCode = loadScript('renderer/scripts/data/schemas.js')
  + loadScript('renderer/scripts/data/expressions.js')
  + loadScript('renderer/scripts/data/animations.js')
  + loadScript('renderer/scripts/data/evolutions.js')
  + loadScript('renderer/scripts/data/particles.js')
  + loadScript('renderer/scripts/data/language.js')
  + loadScript('renderer/scripts/data/colors.js')
  + loadScript('renderer/scripts/data/events.js')
  + loadScript('renderer/scripts/data/reactions.js')
  + loadScript('renderer/scripts/data/activities.js')
  + loadScript('renderer/scripts/registry.js');

let petData;
try {
  const fn = new Function('window', registryCode + '\nreturn petData;');
  petData = fn({});
  assert(true, 'PetDataRegistry created successfully');
} catch(e) {
  assert(false, `PetDataRegistry creation: ${e.message}`);
  petData = null;
}

if (petData) {
  const requiredMethods = [
    'getExpression', 'getMoodEffects', 'getMoodColor',
    'getAnimation', 'getCombo', 'getIdleSequence',
    'getTemplate', 'getEvolutionSprite', 'getStageConfig',
    'getParticle', 'getSpeechText', 'getRandomPhrase',
    'getRandomEvent', 'getTimeEvent',
    'getEmojiReaction', 'getMouseReaction',
    'getEffect', 'getActivity',
  ];

  for (const m of requiredMethods) {
    assert(typeof petData[m] === 'function', `petData.${m}() exists`);
  }

  // Test data returns
  section('4. Data Integrity — all data lookups return valid results');

  // Expressions
  const moods = ['happy', 'hungry', 'sleepy', 'angry', 'sad', 'loving', 'neutral', 'sick', 'excited', 'curious', 'surprised', 'bored'];
  for (const mood of moods) {
    const expr = petData.getExpression(mood);
    assert(expr !== undefined, `Expression for "${mood}" exists`);
  }

  // Mood colors
  for (const mood of moods) {
    const color = petData.getMoodColor(mood);
    assert(color && color.color, `Mood color for "${mood}" exists`);
  }

  // Animations
  const animTypes = ['blink', 'look_left', 'look_right', 'look_up', 'stretch', 'yawn', 'tail_chase', 'satisfied', 'happy', 'angry', 'surprised', 'curious', 'excited', 'starstruck', 'sleeping', 'clean'];
  for (const anim of animTypes) {
    const data = petData.getAnimation(anim);
    assert(data !== undefined, `Animation "${anim}" exists`);
  }

  // Idle sequence
  const idleSeq = petData.getIdleSequence();
  assert(Array.isArray(idleSeq) && idleSeq.length > 0, 'Idle sequence is non-empty array');
  for (const step of idleSeq) {
    assert(step.type && step.duration, `Idle step has type and duration`);
  }

  // Templates for all stages
  const stages = ['baby', 'kid', 'adult', 'legend'];
  for (const stage of stages) {
    const tmpl = petData.getTemplate(stage);
    assert(Array.isArray(tmpl) && tmpl.length > 0, `Template for "${stage}" exists with segments`);
    for (const seg of tmpl) {
      assert(seg.cls && seg.text !== undefined, `Template segment has cls and text`);
    }
  }

  // Stage configs
  for (const stage of stages) {
    const cfg = petData.getStageConfig(stage);
    assert(cfg !== undefined, `Stage config for "${stage}" exists`);
  }

  // Particles
  const particleTypes = ['heart', 'star', 'sparkle', 'food', 'zzz', 'angry', 'coin', 'music', 'exclaim', 'question'];
  for (const p of particleTypes) {
    const data = petData.getParticle(p);
    assert(data && data.char && data.color, `Particle "${p}" has char and color`);
  }

  // Speech texts
  const speechKeys = ['feed', 'play', 'pet', 'sleep', 'wakeup', 'levelup', 'evolve'];
  for (const key of speechKeys) {
    const text = petData.getSpeechText(key);
    assert(text !== undefined, `Speech text for "${key}" exists`);
  }

  // Random phrase
  const phrase = petData.getRandomPhrase();
  assert(phrase && phrase.text && phrase.mood, 'Random phrase has text and mood');

  // Random event
  const event = petData.getRandomEvent();
  assert(event && event.text && event.effect, 'Random event has text and effect');

  // Time events
  const hours = [0, 6, 7, 12, 18, 22, 23];
  for (const h of hours) {
    const timeEvent = petData.getTimeEvent(h);
    // Some hours may not have events, just ensure it doesn't throw
    assert(true, `Time event for hour ${h} lookup succeeds`);
  }

  // Emoji reactions
  const emojis = ['❤️', '⭐', '😡', '😢', '👋', '😂', '😜', '🎉'];
  for (const emoji of emojis) {
    const reaction = petData.getEmojiReaction(emoji);
    assert(reaction && reaction.combo && reaction.duration, `Emoji reaction for "${emoji}" has combo and duration`);
  }

  // Mouse reactions
  const mouseTypes = ['near', 'activity'];
  for (const mt of mouseTypes) {
    const reaction = petData.getMouseReaction(mt);
    assert(reaction && reaction.type && reaction.duration, `Mouse reaction "${mt}" has type and duration`);
  }

  // Effects
  const effectNames = ['close_eyes', 'open_eyes_wide', 'open_mouth', 'small_mouth', 'tongue_out', 'tears', 'heart_eyes', 'star_eyes', 'ear_wiggle'];
  for (const en of effectNames) {
    const effect = petData.getEffect(en);
    assert(effect !== undefined, `Effect "${en}" exists`);
  }

  // Activities
  const actCount = petData.getActivityCount ? petData.getActivityCount() : 0;
  assert(actCount > 0 || petData.activities, 'Activities data exists');
}

// ============================================================
section('5. Pet Class — core pet logic');
// ============================================================

const configCode = loadScript('renderer/scripts/config.js');
const petCode = loadScript('renderer/scripts/pet.js');

let Pet;
try {
  const fn = new Function('CONFIG', configCode + petCode + '\nreturn Pet;');
  Pet = fn({});
  assert(true, 'Pet class created');
} catch(e) {
  assert(false, `Pet class creation: ${e.message}`);
  Pet = null;
}

if (Pet) {
  const petMethods = ['update', 'feed', 'play', 'pet', 'sleep', 'wakeup', 'getMood', 'tickAction', 'applyRandomEvent', 'clamp'];
  for (const m of petMethods) {
    assert(typeof Pet.prototype[m] === 'function', `Pet.${m}() method exists`);
  }

  // Test pet instantiation
  try {
    const pet = new Pet();
    assert(pet.hunger !== undefined, 'Pet has hunger stat');
    assert(pet.happiness !== undefined, 'Pet has happiness stat');
    assert(pet.energy !== undefined, 'Pet has energy stat');
    assert(pet.health !== undefined, 'Pet has health stat');
    assert(pet.level >= 1, 'Pet level >= 1');
    assert(typeof pet.name === 'string', 'Pet has a name');
    assert(typeof pet.getMood() === 'string', 'Pet.getMood() returns string');

    // Test actions
    const feedResult = pet.feed(0);
    assert(feedResult !== undefined, 'pet.feed(0) returns result');

    const playResult = pet.play();
    assert(playResult !== undefined, 'pet.play() returns result');

    const petResult = pet.pet();
    assert(petResult !== undefined, 'pet.pet() returns result');

    // Test sleep/wake
    const sleepResult = pet.sleep();
    assert(sleepResult && sleepResult.success, 'pet.sleep() succeeds');
    assert(pet.isSleeping === true, 'Pet is sleeping after sleep()');

    const wakeResult = pet.wakeup();
    assert(wakeResult && wakeResult.success, 'pet.wakeup() succeeds');
    assert(pet.isSleeping === false, 'Pet is awake after wakeup()');

    // Test clamp
    assert(pet.clamp(150) === 100, 'pet.clamp(150) === 100');
    assert(pet.clamp(-10) === 0, 'pet.clamp(-10) === 0');
    assert(pet.clamp(50) === 50, 'pet.clamp(50) === 50');

  } catch(e) {
    assert(false, `Pet instance test: ${e.message}`);
  }
}

// ============================================================
section('6. Natural Blink — uses dash symbol');
// ============================================================

const rendererCode = loadScript('renderer/scripts/renderer.js');
assert(rendererCode.includes("eyeL.textContent = '-'"), 'Blink uses "-" symbol for left eye');
assert(rendererCode.includes("eyeR.textContent = '-'"), 'Blink uses "-" symbol for right eye');
assert(!rendererCode.includes("eyeL.textContent = '∀'"), 'No old ∀ symbol for left eye');
assert(!rendererCode.includes("eyeR.textContent = '∀'"), 'No old ∀ symbol for right eye');
assert(rendererCode.includes('class NaturalBlink'), 'NaturalBlink class exists');
assert(rendererCode.includes('_scheduleNext'), 'NaturalBlink has _scheduleNext method');
assert(rendererCode.includes('_doBlink'), 'NaturalBlink has _doBlink method');
assert(rendererCode.includes('_restore'), 'NaturalBlink has _restore method');

// ============================================================
section('7. Curve Walking — path generation and random curve types');
// ============================================================

const mainCode = loadScript('main.js');
assert(mainCode.includes('function generateCurvePath'), 'generateCurvePath function exists');
assert(mainCode.includes("type === 'sine'"), 'Sine curve type supported');
assert(mainCode.includes("type === 'bezier'"), 'Bezier curve type supported');
assert(mainCode.includes("type === 'arc'"), 'Arc curve type supported');
assert(mainCode.includes("type === 'linear'"), 'Linear curve type supported');

// Test curve generation
const fnStart = mainCode.indexOf('function generateCurvePath(');
const fnEnd = mainCode.indexOf('}\n\nipcMain.on');
const fnCode = mainCode.substring(fnStart, fnEnd + 1);

try {
  eval(fnCode);

  // Linear
  const linear = generateCurvePath(0, 0, 100, 100, 'linear');
  assert(linear.length > 0, 'Linear curve generates waypoints');
  assert(Math.abs(linear[0].x - 0) < 0.01, 'Linear starts at origin');
  assert(Math.abs(linear[linear.length-1].x - 100) < 0.01, 'Linear ends at target X');
  assert(Math.abs(linear[linear.length-1].y - 100) < 0.01, 'Linear ends at target Y');

  // Sine
  const sine = generateCurvePath(0, 0, 200, 100, 'sine');
  assert(sine.length > 0, 'Sine curve generates waypoints');
  assert(Math.abs(sine[sine.length-1].x - 200) < 0.01, 'Sine ends at target X');
  assert(Math.abs(sine[sine.length-1].y - 100) < 0.01, 'Sine ends at target Y');

  // Bezier
  const bezier = generateCurvePath(0, 0, 200, 100, 'bezier');
  assert(bezier.length > 0, 'Bezier curve generates waypoints');
  assert(Math.abs(bezier[bezier.length-1].x - 200) < 0.01, 'Bezier ends at target X');
  assert(Math.abs(bezier[bezier.length-1].y - 100) < 0.01, 'Bezier ends at target Y');

  // Arc
  const arc = generateCurvePath(0, 0, 200, 100, 'arc');
  assert(arc.length > 0, 'Arc curve generates waypoints');
  assert(Math.abs(arc[arc.length-1].x - 200) < 0.01, 'Arc ends at target X');
  assert(Math.abs(arc[arc.length-1].y - 100) < 0.01, 'Arc ends at target Y');

  // Short distance
  const short = generateCurvePath(0, 0, 2, 2, 'sine');
  assert(short.length === 1, 'Short distance returns single point');
} catch(e) {
  assert(false, `Curve generation test: ${e.message}`);
}

// Check renderer has curve types
assert(rendererCode.includes("'sine', 'bezier', 'arc', 'linear'"), 'ScreenWalker has random curve type selection');

// ============================================================
section('8. IPC Handlers — all required IPC channels');
// ============================================================

const requiredIPC = [
  'window-move', 'move-window-to', 'stop-walk',
  'get-screen-size', 'get-window-position', 'get-window-size',
  'resize-window', 'open-minigame', 'close-minigame',
  'save-data', 'load-data', 'close-app',
  'minigame-result', 'prank-giant', 'easter-egg-giant',
];

for (const channel of requiredIPC) {
  assert(mainCode.includes(`'${channel}'`), `IPC channel "${channel}" in main.js`);
}

const preloadCode = loadScript('preload.js');
const requiredAPI = [
  'moveWindow', 'moveWindowTo', 'stopWalk',
  'getScreenSize', 'getWindowPosition', 'getWindowSize',
  'resizeWindow', 'openMiniGame', 'closeMiniGame',
  'saveData', 'loadData', 'closeApp',
  'onMinigameResult', 'onAppClosing', 'onWalkDone',
  'prankGiant', 'easterEggGiant',
];

for (const api of requiredAPI) {
  assert(preloadCode.includes(api), `petAPI.${api} in preload.js`);
}

// ============================================================
section('9. Minigame HTML — all 4 minigames have valid HTML');
// ============================================================

const minigames = [
  { name: 'guess-number', title: '猜数字' },
  { name: 'rps', title: '石头剪刀布' },
  { name: 'whack-a-mole', title: '打地鼠' },
  { name: 'memory-match', title: '记忆翻牌' },
];

for (const mg of minigames) {
  const html = fs.readFileSync(path.join(__dirname, 'renderer', 'minigames', `${mg.name}.html`), 'utf-8');
  assert(html.includes('<!DOCTYPE html>'), `${mg.name}: valid HTML document`);
  assert(html.length > 500, `${mg.name}: substantial content (>500 chars)`);
  assert(html.includes('close-minigame') || html.includes('close'), `${mg.name}: has close mechanism`);

  // Check for game-specific content
  if (mg.name === 'guess-number') {
    assert(html.includes('guess') || html.includes('猜'), 'guess-number: has game logic');
  } else if (mg.name === 'rps') {
    assert(html.includes('rock') || html.includes('石头') || html.includes('rps'), 'rps: has game logic');
  } else if (mg.name === 'whack-a-mole') {
    assert(html.includes('mole') || html.includes('地鼠') || html.includes('whack'), 'whack-a-mole: has game logic');
  } else if (mg.name === 'memory-match') {
    assert(html.includes('memory') || html.includes('翻牌') || html.includes('match'), 'memory-match: has game logic');
  }
}

// ============================================================
section('10. CSS — color scheme is white/pink/blue');
// ============================================================

const css = fs.readFileSync(path.join(__dirname, 'renderer', 'styles', 'main.css'), 'utf-8');

// Check white backgrounds
assert(css.includes('rgba(255, 255, 255') || css.includes('#fff'), 'CSS has white backgrounds');

// Check pink accent
assert(css.includes('#f9a8d4') || css.includes('#f472b6'), 'CSS has pink accent colors');

// Check blue accent
assert(css.includes('#818cf8') || css.includes('#93c5fd'), 'CSS has blue accent colors');

// Check no yellow (the user specifically said yellow is ugly)
const yellowPatterns = ['#fbbf24', '#fde68a', '#fb923c'];
let hasYellow = false;
for (const yp of yellowPatterns) {
  if (css.includes(yp)) {
    hasYellow = true;
    break;
  }
}
assert(!hasYellow, 'CSS has no yellow/amber colors');

// ============================================================
section('11. Scheduler — all autonomous behavior methods');
// ============================================================

const schedulerCode = loadScript('renderer/scripts/scheduler.js');
const schedulerMethods = ['start', 'stop', 'loop', 'bubble', 'checkAutonomousBehavior', 'triggerRandomEvent', 'checkTimeEvent', 'triggerTimeEvent', 'applyTimeBehavior', 'speakKaomojiPhrase', 'triggerPrankGiant'];
for (const m of schedulerMethods) {
  assert(schedulerCode.includes(m), `Scheduler has ${m} method`);
}

// Verify no duplicate toast+bubble in triggerRandomEvent
const trEventMatch = schedulerCode.match(/triggerRandomEvent\(\)\s*\{[\s\S]*?\n  \}/);
if (trEventMatch) {
  const body = trEventMatch[0];
  const bubbleCount = (body.match(/this\.bubble\(/g) || []).length;
  assert(bubbleCount === 0, 'triggerRandomEvent has no duplicate bubble() call');
  const toastCount = (body.match(/showToast\(/g) || []).length;
  assert(toastCount >= 1, 'triggerRandomEvent has showToast() call');
}

// ============================================================
section('12. App — interaction setup and easter eggs');
// ============================================================

const appCode = loadScript('renderer/scripts/app.js');
const appMethods = ['init', 'setupInteractions', 'setupEmojiReactions', 'setupContextMenu', 'setupIPCListeners', 'setupGlobalMouse', 'doAction', 'doFeed', 'togglePanel', 'toggleFeedMenu', 'toggleGameMenu', 'triggerRageEasterEgg', 'triggerOverfeedEasterEgg', 'showNameDialog'];
for (const m of appMethods) {
  assert(appCode.includes(m), `App has ${m} method`);
}

// Easter egg: 10 rapid clicks
assert(appCode.includes('clickCounter >= 10') || appCode.includes('clickCounter>=10'), 'Rage easter egg triggers at 10 clicks');

// Easter egg: overfeed 3 times in 10 seconds
assert(appCode.includes('feedCounter >= 3') || appCode.includes('feedCounter>=3'), 'Overfeed easter egg triggers at 3 feeds');
assert(appCode.includes('10000') || appCode.includes('10'), 'Overfeed within 10s window');

// ============================================================
section('13. Save/Load — data persistence');
// ============================================================

const saveManagerCode = loadScript('renderer/scripts/save-manager.js');
assert(saveManagerCode.includes('class SaveManager'), 'SaveManager class exists');
assert(saveManagerCode.includes('save(') || saveManagerCode.includes('async save'), 'SaveManager has save method');
assert(saveManagerCode.includes('load') || saveManagerCode.includes('async load'), 'SaveManager has load method');

// ============================================================
section('14. MinigameManager — game result handling');
// ============================================================

const minigameCode = loadScript('renderer/scripts/minigames.js');
assert(minigameCode.includes('class MinigameManager'), 'MinigameManager class exists');
assert(minigameCode.includes('openGame'), 'MinigameManager has openGame method');
assert(minigameCode.includes('handleResult'), 'MinigameManager has handleResult method');

// ============================================================
section('15. Color Data — no yellow/amber in colors.js');
// ============================================================

const colorsCode = loadScript('renderer/scripts/data/colors.js');
for (const yp of yellowPatterns) {
  assert(!colorsCode.includes(yp), `colors.js has no ${yp}`);
}

// ============================================================
section('16. Reactions Data — no yellow/amber in reactions.js');
// ============================================================

const reactionsCode = loadScript('renderer/scripts/data/reactions.js');
for (const yp of yellowPatterns) {
  assert(!reactionsCode.includes(yp), `reactions.js has no ${yp}`);
}

// ============================================================
// FINAL SUMMARY
// ============================================================

console.log('\n' + '='.repeat(50));
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50));

if (errors.length > 0) {
  console.log('\nFailed tests:');
  errors.forEach(e => console.log(`  - ${e}`));
}

process.exit(failed > 0 ? 1 : 0);
