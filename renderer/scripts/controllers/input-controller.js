class InputController {
  constructor({ logger, actionController, menuController }) {
    this.logger = logger;
    this.actionController = actionController;
    this.menuController = menuController;
    this.kaomojiEl = document.getElementById('kaomoji');
    this.menuEl = document.getElementById('context-menu');
    this.dragStart = null;
    this.dragWindow = null;
    this.isDragging = false;

    this.onMouseDownCapture = this.onMouseDownCapture.bind(this);
    this.onDragMove = this.onDragMove.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  init() {
    document.addEventListener('mousedown', this.onMouseDownCapture, true);
  }

  getState() {
    return {
      dragging: Boolean(this.dragStart),
      isDragging: this.isDragging,
      action: this.actionController.getState()
    };
  }

  getTargetName(target) {
    if (!target) return null;
    return `${target.tagName}${target.id ? `#${target.id}` : ''}${target.className ? `.${String(target.className).replace(/\s+/g, '.')}` : ''}`;
  }

  getPetHit(x, y) {
    if (!this.kaomojiEl) return null;
    const rect = this.kaomojiEl.getBoundingClientRect();
    const padding = 24;
    if (
      rect.width > 0 &&
      rect.height > 0 &&
      x >= rect.left - padding &&
      x <= rect.right + padding &&
      y >= rect.top - padding &&
      y <= rect.bottom + padding
    ) {
      return {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom)
      };
    }
    return null;
  }

  classifyHit(e) {
    if (e.target?.closest?.('#context-menu')) return 'menu';
    if (e.target?.closest?.('#kaomoji')) return 'pet';
    if (this.getPetHit(e.clientX, e.clientY)) return 'pet-rect';
    return 'background';
  }

  onMouseDownCapture(e) {
    if (e.button !== 0) return;

    const hit = this.classifyHit(e);
    this.logger.write('input:left-down', this.getState(), {
      x: e.clientX,
      y: e.clientY,
      screenX: e.screenX,
      screenY: e.screenY,
      target: this.getTargetName(e.target),
      hit
    });

    if (hit === 'menu') return;

    if (this.actionController.menuOpen) {
      this.menuController.close('outside-left-down');
    }

    if (hit !== 'pet' && hit !== 'pet-rect') return;

    e.preventDefault();
    e.stopPropagation();
    this.startDragCandidate(e);
  }

  startDragCandidate(e) {
    this.actionController.onDragStart({ screenX: e.screenX, screenY: e.screenY });
    this.dragStart = { screenX: e.screenX, screenY: e.screenY };
    this.dragWindow = null;
    this.isDragging = false;
    document.addEventListener('mousemove', this.onDragMove);
    document.addEventListener('mouseup', this.onDragEnd);

    window.petAPI.getWindowPosition().then((pos) => {
      if (this.dragStart) this.dragWindow = pos;
    }).catch((err) => {
      this.logger.write('ipc-error', this.getState(), {
        ipc: 'window:getPosition',
        message: err.message
      });
    });
  }

  onDragMove(e) {
    if (!this.dragStart || !this.dragWindow) return;

    const dx = e.screenX - this.dragStart.screenX;
    const dy = e.screenY - this.dragStart.screenY;
    if (!this.isDragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) this.isDragging = true;

    if (!this.isDragging) return;

    const x = this.dragWindow.x + dx;
    const y = this.dragWindow.y + dy;
    window.petAPI.setWindowPosition(x, y);
    this.actionController.onDragMove({ dx, dy, x, y });
  }

  onDragEnd(e) {
    document.removeEventListener('mousemove', this.onDragMove);
    document.removeEventListener('mouseup', this.onDragEnd);

    const wasDragging = this.isDragging;
    this.actionController.onDragEnd({ wasDragging });
    if (!wasDragging) {
      this.actionController.recordPetClick({
        x: e.clientX,
        y: e.clientY,
        screenX: e.screenX,
        screenY: e.screenY
      });
    }

    this.dragStart = null;
    this.dragWindow = null;
    this.isDragging = false;

    // Return focus to previously active window.
    window.petAPI.blurWindow();
  }
}
