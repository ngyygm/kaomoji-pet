class App {
  constructor() {
    this.petState = null;
    this.renderer = null;
    this.systemMonitor = null;
    this.hiddenState = null;
    this.behaviorEngine = null;
    this.gameLoop = null;
    this.saveManager = new SaveManager();
    this.mouseManager = null;
    this.bigEffects = [];
  }

  async init() {
    const { petState, hiddenState, isNew } = await this.saveManager.loadFull();
    this.petState = petState;
    await this.loadBigEffects();

    this.renderer = new PetRenderer();
    this.systemMonitor = new SystemMonitor();
    this.hiddenState = new HiddenStateEngine(this.systemMonitor);
    if (hiddenState) this.hiddenState.loadState(hiddenState);

    const screenWalker = new ScreenWalker(this.renderer);
    this.behaviorEngine = new BehaviorEngine(this.hiddenState, this.renderer, petData, screenWalker);

    this.setupInteractions();
    this.setupContextMenu();
    this.setupIPCListeners();
    this.setupGlobalMouse();

    this.gameLoop = new GameLoop(
      this.renderer, this.systemMonitor, this.hiddenState,
      this.behaviorEngine, this.saveManager, this.petState
    );
    this.gameLoop.start();

    this.renderer.updateKaomoji('happy', 'adult');
    this.renderer.showBubble('喵~ 你好！', 4000);
    this.renderer.spawnParticles('sparkle', 3);
  }

  async loadBigEffects() {
    this.bigEffects = await window.petAPI.listBigEffects();
    BIG_EFFECTS = this.bigEffects;
    window.BIG_EFFECTS = this.bigEffects;
  }

  setupInteractions() {
    const petDisplay = document.getElementById('pet-display');

    // Double click = pet (slow click)
    petDisplay.addEventListener('dblclick', () => this.doPet());

    // Unified mouse manager: hit-test, drag, click combo, watchdog
    this.mouseManager = new MouseManager();
    this.mouseManager.init();
  }

  setupContextMenu() {
    const mainMenu = document.getElementById('context-menu');
    this.renderMainContextMenu();

    // --- Show main menu on right-click ---
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.hideContextMenu();
      this.renderMainContextMenu();
      this.positionContextMenu(e.clientX, e.clientY);
      mainMenu.classList.remove('hidden');
      this.keepContextMenuInBounds();
    });

    // --- Main menu item clicks ---
    mainMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.ctx-item');
      if (!item) return;
      e.stopPropagation();
      const action = item.dataset.ctx;

      if (action === 'big-effects') {
        this.renderEffectsContextMenu();
        this.keepContextMenuInBounds();
      } else if (action === 'effects-back') {
        this.renderMainContextMenu();
        this.keepContextMenuInBounds();
      } else if (action === 'effect-trigger') {
        this.hideContextMenu();
        this.triggerSelectedEffect(item.dataset.effectId);
      } else {
        this.hideContextMenu();
        if (action === 'rename') this.showNameDialog();
        else if (action === 'save') {
          this.saveManager.saveFull(this.petState, this.hiddenState.getState());
          this.renderer.showToast('存档成功！', 'success');
        }
        else if (action === 'exit') window.petAPI.closeApp();
      }
    });

    // --- Click outside closes menu ---
    document.addEventListener('click', () => this.hideContextMenu());
  }

  positionContextMenu(x, y) {
    const menu = document.getElementById('context-menu');
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
  }

  keepContextMenuInBounds() {
    const menu = document.getElementById('context-menu');
    const rect = menu.getBoundingClientRect();
    const pad = 4;
    let left = rect.left;
    let top = rect.top;

    if (rect.right > window.innerWidth - pad) {
      left = Math.max(pad, window.innerWidth - rect.width - pad);
    }
    if (rect.bottom > window.innerHeight - pad) {
      top = Math.max(pad, window.innerHeight - rect.height - pad);
    }

    menu.style.left = Math.round(left) + 'px';
    menu.style.top = Math.round(top) + 'px';
  }

  renderMainContextMenu() {
    const menu = document.getElementById('context-menu');
    menu.innerHTML = `
      <div class="ctx-item" data-ctx="rename">改名</div>
      <div class="ctx-separator"></div>
      <div class="ctx-item" data-ctx="big-effects">✨ 大特效 ▸</div>
      <div class="ctx-separator"></div>
      <div class="ctx-item" data-ctx="save">存档</div>
      <div class="ctx-item ctx-danger" data-ctx="exit">退出</div>
    `;
  }

  renderEffectsContextMenu() {
    const menu = document.getElementById('context-menu');
    const effects = this.bigEffects;
    const effectItems = effects.map(effect =>
      `<div class="ctx-item" data-ctx="effect-trigger" data-effect-id="${effect.id}">${effect.emoji} ${effect.name}</div>`
    ).join('');

    menu.innerHTML = `
      <div class="ctx-item ctx-back" data-ctx="effects-back">← 返回</div>
      <div class="ctx-header">✨ 大特效</div>
      ${effectItems || '<div class="ctx-item ctx-disabled">暂无特效</div>'}
    `;
  }

  triggerSelectedEffect(effectId) {
    const effect = this.bigEffects.find(e => e.id === effectId);
    if (!effect) return;

    window.petAPI.runBigEffect(effect.id);
    if (effect.petAnimation) {
      this.renderer.setAnimationOverride(effect.petAnimation, effect.petAnimDuration || 3000);
    }
    if (effect.petParticles) {
      this.renderer.spawnParticles(effect.petParticles[0], effect.petParticles[1]);
    }
  }

  setupIPCListeners() {
    window.petAPI.onAppClosing(() => {
      this.saveManager.saveFull(this.petState, this.hiddenState.getState());
    });
  }

  setupGlobalMouse() {
    window.petAPI.onGlobalMouse((data) => {
      if (this.renderer._isSleeping) return;
      this.renderer.handleGlobalMouse(data);
    });
    // Note: onMouseStateReset and onEffectHitTest are now registered
    // directly by MouseManager.init() — no forwarding needed here.
  }

  doPet() {
    this.hiddenState.recordInteraction('pet');
    this.renderer.spawnParticles('heart', 4);
    this.renderer.showBubble(pickRandomSpeech('affection'), 3000);
    this.renderer.setAnimationOverride('love', 2000);
  }

  hideContextMenu() {
    document.getElementById('context-menu').classList.add('hidden');
  }

  async showNameDialog() {
    const name = await window.petAPI.showRenameDialog(this.petState.name);
    if (name) {
      this.petState.name = name;
      this.renderer.showBubble(`我叫${name}！喵~`, 3000);
      this.renderer.spawnParticles('heart', 5);
      this.saveManager.saveFull(this.petState, this.hiddenState.getState());
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
