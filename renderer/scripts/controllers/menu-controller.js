class MenuController {
  constructor({ logger, actionController, saveManager, renderer, petState, hiddenState }) {
    this.logger = logger;
    this.actionController = actionController;
    this.saveManager = saveManager;
    this.renderer = renderer;
    this.petState = petState;
    this.hiddenState = hiddenState;
    this.menuEl = document.getElementById('context-menu');

    this.onContextMenu = this.onContextMenu.bind(this);
    this.onMenuClick = this.onMenuClick.bind(this);
  }

  init() {
    this.renderMain();
    document.addEventListener('contextmenu', this.onContextMenu);
    this.menuEl.addEventListener('click', this.onMenuClick);
  }

  async onContextMenu(e) {
    e.preventDefault();
    this.renderMain();
    this.open(e.clientX, e.clientY);
  }

  open(x, y) {
    this.menuEl.classList.remove('hidden');
    this.menuEl.style.left = `${x}px`;
    this.menuEl.style.top = `${y}px`;
    this.keepInBounds();
    this.actionController.onMenuOpen({ x, y });
  }

  close(reason = 'menu-close') {
    this.menuEl.classList.add('hidden');
    this.actionController.onMenuClose(reason);
    // Return focus to previously active window.
    window.petAPI.blurWindow();
  }

  async onMenuClick(e) {
    const item = e.target.closest('.ctx-item');
    if (!item || item.classList.contains('ctx-disabled')) return;

    e.preventDefault();
    e.stopPropagation();

    const action = item.dataset.ctx;
    const effectId = item.dataset.effectId || null;
    this.logger.write('menu:click', this.actionController.getState(), { action, effectId });

    if (action === 'big-effects') {
      await this.renderEffects();
      this.keepInBounds();
      return;
    }

    if (action === 'effects-back') {
      this.renderMain();
      this.keepInBounds();
      return;
    }

    this.close(`menu-action:${action}`);

    if (action === 'effect-trigger') {
      await this.actionController.runBigEffect(effectId, {}, 'menu');
      return;
    }

    if (action === 'rename') {
      await this.renamePet();
      return;
    }

    if (action === 'save') {
      this.saveManager.saveFull(this.petState, this.hiddenState.getState());
      this.renderer.showToast('存档成功！', 'success');
      return;
    }

    if (action === 'exit') window.petAPI.closeApp();
  }

  renderMain() {
    this.menuEl.innerHTML = `
      <div class="ctx-item" data-ctx="rename">改名</div>
      <div class="ctx-separator"></div>
      <div class="ctx-item" data-ctx="big-effects">* 大特效 ▸</div>
      <div class="ctx-separator"></div>
      <div class="ctx-item" data-ctx="save">存档</div>
      <div class="ctx-item ctx-danger" data-ctx="exit">退出</div>
    `;
  }

  async renderEffects() {
    const effects = await this.actionController.loadEffects();
    const effectItems = effects.map(effect =>
      `<div class="ctx-item" data-ctx="effect-trigger" data-effect-id="${effect.id}">${effect.emoji} ${effect.name}</div>`
    ).join('');

    this.menuEl.innerHTML = `
      <div class="ctx-item ctx-back" data-ctx="effects-back">← 返回</div>
      <div class="ctx-header">大特效</div>
      ${effectItems || '<div class="ctx-item ctx-disabled">暂无特效</div>'}
    `;
  }

  keepInBounds() {
    const rect = this.menuEl.getBoundingClientRect();
    const pad = 4;
    let left = rect.left;
    let top = rect.top;

    if (rect.right > window.innerWidth - pad) {
      left = Math.max(pad, window.innerWidth - rect.width - pad);
    }
    if (rect.bottom > window.innerHeight - pad) {
      top = Math.max(pad, window.innerHeight - rect.height - pad);
    }

    this.menuEl.style.left = `${Math.round(left)}px`;
    this.menuEl.style.top = `${Math.round(top)}px`;
  }

  async renamePet() {
    const name = await window.petAPI.showRenameDialog(this.petState.name);
    if (!name) return;
    this.petState.name = name;
    this.renderer.showBubble(`我叫${name}！喵~`, 3000);
    this.renderer.spawnParticles('heart', 5);
    this.saveManager.saveFull(this.petState, this.hiddenState.getState());
  }
}
