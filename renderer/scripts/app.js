class App {
  constructor() {
    this.petState = null;
    this.renderer = null;
    this.systemMonitor = null;
    this.hiddenState = null;
    this.behaviorEngine = null;
    this.gameLoop = null;
    this.saveManager = new SaveManager();
    this.clickCounter = 0;
    this.clickTimer = null;
  }

  async init() {
    const { petState, hiddenState, isNew } = await this.saveManager.loadFull();
    this.petState = petState;

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

  setupInteractions() {
    const petDisplay = document.getElementById('pet-display');

    // Double click = pet (slow click)
    petDisplay.addEventListener('dblclick', () => this.doPet());

    // Rapid click combo on kaomoji + manual drag
    const comboEl = document.createElement('span');
    comboEl.id = 'combo-count';
    kaomoji.style.position = 'relative';
    kaomoji.appendChild(comboEl);

    let dragStartPos = null;
    let dragWindowPos = null;
    let isDragging = false;

    kaomoji.addEventListener('mousedown', (e) => {
      dragStartPos = { x: e.screenX, y: e.screenY };
      isDragging = false;

      window.petAPI.getWindowPosition().then(pos => {
        dragWindowPos = pos;
      });

      const onMouseMove = (me) => {
        if (!dragStartPos || !dragWindowPos) return;
        const dx = me.screenX - dragStartPos.x;
        const dy = me.screenY - dragStartPos.y;
        if (!isDragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
          isDragging = true;
        }
        if (isDragging) {
          window.petAPI.setWindowPosition(dragWindowPos.x + dx, dragWindowPos.y + dy);
        }
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        if (!isDragging) {
          // It was a click, not a drag
          this.clickCounter++;
          if (this.clickTimer) clearTimeout(this.clickTimer);
          this.clickTimer = setTimeout(() => {
            this.clickCounter = 0;
            comboEl.classList.remove('visible');
          }, 3000);

          comboEl.textContent = this.clickCounter;
          comboEl.classList.remove('visible');
          void comboEl.offsetWidth;
          comboEl.classList.add('visible');

          if (this.clickCounter >= 10) {
            this.behaviorEngine.triggerBigEffect();
          }
        }

        dragStartPos = null;
        dragWindowPos = null;
        isDragging = false;
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    // Close menus on click outside
    document.addEventListener('click', () => this.hideContextMenu());
  }

  setupContextMenu() {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const menu = document.getElementById('context-menu');
      menu.style.left = e.clientX + 'px';
      menu.style.top = e.clientY + 'px';
      menu.classList.remove('hidden');
    });

    document.querySelectorAll('.ctx-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideContextMenu();
        const action = item.dataset.ctx;
        if (action === 'rename') this.showNameDialog();
        else if (action === 'save') {
          this.saveManager.saveFull(this.petState, this.hiddenState.getState());
          this.renderer.showToast('存档成功！', 'success');
        }
        else if (action === 'exit') window.petAPI.closeApp();
      });
    });
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

  _debugLog(msg) {
    // debug disabled
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
  const app = new App();
  app.init();

  // Hit-test: only capture mouse on non-transparent pixels
  document.body.addEventListener('mousemove', (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const interactive = el && (
      el.id === 'kaomoji' ||
      el.id === 'pet-display' ||
      el.id === 'pet-container' ||
      el.closest('#context-menu') ||
      el.closest('#speech-bubble') ||
      el.closest('#bottom-section')
    );
    window.petAPI.setIgnoreMouseEvents(!interactive, { forward: true });
  });
});
