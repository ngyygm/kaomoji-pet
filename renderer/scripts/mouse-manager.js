/**
 * MouseManager — 统一鼠标交互管理器
 *
 * 集中管理 hit-test、拖拽、点击连击、combo 计数器、watchdog 恢复机制。
 * 所有鼠标事件状态管理在一个地方，特效窗口创建/销毁不会导致交互卡死。
 *
 * 关键设计：
 * - 主进程轮询光标位置 → 渲染进程做 elementFromPoint 判定
 * - 不依赖 screen.getCursorScreenPoint() 换算（避免 DPI 缩放坐标不匹配）
 * - 特效窗口活跃时也能正常交互
 */
class MouseManager {
  constructor() {
    // DOM references
    this._kaomojiEl = null;
    this._comboEl = null;

    // Drag state
    this._dragStartPos = null;
    this._dragWindowPos = null;
    this._isDragging = false;

    // Click combo state
    this._clickCounter = 0;
    this._clickTimer = null;

    // Hit-test state tracking
    this._lastHitTestIgnore = true; // sync with mainWindow's initial state

    // Watchdog
    this._watchdogTimer = null;
    this._watchdogInterval = 1500;  // check every 1.5s

    // Last known cursor position (from global-mouse tracker, DPI-safe)
    this._lastCursorRelX = -1;
    this._lastCursorRelY = -1;

    // Bound handlers (for proper removeEventListener)
    this._boundMouseDown = this._onMouseDown.bind(this);
    this._boundDragMove = this._onDragMove.bind(this);
    this._boundDragEnd = this._onDragEnd.bind(this);
    this._boundBodyMouseMove = this._onBodyMouseMove.bind(this);
    this._boundWatchdog = this._watchdogTick.bind(this);
  }

  init() {
    this._kaomojiEl = document.getElementById('kaomoji');
    this._comboEl = document.getElementById('combo-count');

    if (!this._kaomojiEl) {
      console.error('[MouseManager] #kaomoji element not found');
      return;
    }

    // Drag / click: mousedown on kaomoji
    this._kaomojiEl.addEventListener('mousedown', this._boundMouseDown);

    // Hit-test: mousemove on body to toggle ignoreMouseEvents
    document.body.addEventListener('mousemove', this._boundBodyMouseMove);

    // Watchdog: periodic health check
    this._watchdogTimer = setInterval(this._boundWatchdog, this._watchdogInterval);

    // Receive cursor-position updates from global mouse tracker (DPI-safe)
    if (window.petAPI && window.petAPI.onGlobalMouse) {
      window.petAPI.onGlobalMouse((data) => {
        this._lastCursorRelX = data.relX;
        this._lastCursorRelY = data.relY;
      });
    }

    // Receive cursor position from main process effect-hit-test polling
    if (window.petAPI && window.petAPI.onEffectHitTest) {
      window.petAPI.onEffectHitTest((data) => {
        if (data && typeof data.relX === 'number') {
          this._runSyntheticHitTest(data.relX, data.relY);
        }
      });
    }

    // Receive mouse state reset from main process after effect window closes
    if (window.petAPI && window.petAPI.onMouseStateReset) {
      window.petAPI.onMouseStateReset((data) => {
        this.onEffectWindowClosed(data);
      });
    }

    console.log('[MouseManager] initialized');
  }

  // ==================== Hit-Test ====================

  _onBodyMouseMove(e) {
    // Update last known position from actual mouse event
    this._lastCursorRelX = e.clientX;
    this._lastCursorRelY = e.clientY;

    // Suppress hit-test during active drag/click — don't let it toggle
    // ignoreMouseEvents while the user is interacting with the pet
    if (this._dragStartPos) return;

    this._doHitTest(e.clientX, e.clientY);
  }

  /**
   * Core hit-test logic. Checks if (x,y) is over an interactive element
   * and toggles ignoreMouseEvents accordingly.
   */
  _doHitTest(x, y) {
    const el = document.elementFromPoint(x, y);
    const interactive = el && (
      el.closest('#kaomoji') ||
      el.closest('#context-menu') ||
      el.closest('#speech-bubble') ||
      el.closest('#bottom-section') ||
      el.closest('#combo-count')
    );

    const shouldIgnore = !interactive;

    // Only send IPC when state actually changes (reduces noise)
    if (this._lastHitTestIgnore !== shouldIgnore) {
      this._lastHitTestIgnore = shouldIgnore;
      window.petAPI.setIgnoreMouseEvents(shouldIgnore, { forward: true });
    }
  }

  // ==================== Drag & Click ====================

  _onMouseDown(e) {
    this._dragStartPos = { x: e.screenX, y: e.screenY };
    this._isDragging = false;

    window.petAPI.getWindowPosition().then(pos => {
      this._dragWindowPos = pos;
    });

    // Force window to capture events during drag/click interaction
    if (this._lastHitTestIgnore !== false) {
      this._lastHitTestIgnore = false;
      window.petAPI.setIgnoreMouseEvents(false, { forward: true });
    }

    document.addEventListener('mousemove', this._boundDragMove);
    document.addEventListener('mouseup', this._boundDragEnd);
  }

  _onDragMove(e) {
    if (!this._dragStartPos || !this._dragWindowPos) return;

    const dx = e.screenX - this._dragStartPos.x;
    const dy = e.screenY - this._dragStartPos.y;

    if (!this._isDragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      this._isDragging = true;
    }

    if (this._isDragging) {
      window.petAPI.setWindowPosition(
        this._dragWindowPos.x + dx,
        this._dragWindowPos.y + dy
      );
    }
  }

  _onDragEnd(e) {
    document.removeEventListener('mousemove', this._boundDragMove);
    document.removeEventListener('mouseup', this._boundDragEnd);

    if (!this._isDragging) {
      this._recordClick();
    }

    // Reset drag state
    this._dragStartPos = null;
    this._dragWindowPos = null;
    this._isDragging = false;
  }

  // ==================== Click Combo ====================

  _recordClick() {
    this._clickCounter++;

    if (this._clickTimer) clearTimeout(this._clickTimer);
    this._clickTimer = setTimeout(() => {
      this._clickCounter = 0;
      if (this._comboEl) this._comboEl.classList.remove('visible');
    }, 3000);

    if (this._comboEl) {
      this._comboEl.textContent = this._clickCounter;
      this._comboEl.classList.remove('visible');
      void this._comboEl.offsetWidth; // force reflow for animation restart
      this._comboEl.classList.add('visible');
    }

    if (this._clickCounter >= 10) {
      // Access behavior engine through the global app instance
      if (typeof app !== 'undefined' && app.behaviorEngine) {
        app.behaviorEngine.triggerBigEffect();
      }
    }
  }

  // ==================== Watchdog / Recovery ====================

  _watchdogTick() {
    // If we have a valid last cursor position, do a periodic hit-test.
    // This recovers from ALL failure modes:
    // - effect window close while cursor stationary
    // - OS-level event routing confusion
    // - DPI coordinate mismatch
    // - state desync after rapid effects
    if (this._lastCursorRelX >= 0 && !this._dragStartPos) {
      this._doHitTest(this._lastCursorRelX, this._lastCursorRelY);
    }
  }

  /**
   * Called when main process signals an effect window has closed.
   * Uses the last known cursor position from global-mouse tracker
   * (which is already in CSS/DIP coordinates — no DPI conversion needed).
   */
  onEffectWindowClosed(data) {
    // Reset to safe pass-through state first
    if (this._lastHitTestIgnore !== true) {
      this._lastHitTestIgnore = true;
      window.petAPI.setIgnoreMouseEvents(true, { forward: true });
    }

    // Try data coordinates first (from main process), fall back to cached position
    let x, y;
    if (data && typeof data.relX === 'number' && typeof data.relY === 'number') {
      x = data.relX;
      y = data.relY;
    } else if (this._lastCursorRelX >= 0) {
      x = this._lastCursorRelX;
      y = this._lastCursorRelY;
    }

    if (typeof x === 'number') {
      this._doHitTest(x, y);
    }
  }

  /**
   * Perform a hit-test at the given coordinates.
   * If the cursor is over an interactive element, capture events immediately.
   */
  _runSyntheticHitTest(x, y) {
    if (this._dragStartPos) return;
    this._doHitTest(x, y);
  }

  // ==================== Cleanup ====================

  destroy() {
    if (this._watchdogTimer) {
      clearInterval(this._watchdogTimer);
      this._watchdogTimer = null;
    }
    if (this._kaomojiEl) {
      this._kaomojiEl.removeEventListener('mousedown', this._boundMouseDown);
    }
    document.removeEventListener('mousemove', this._boundDragMove);
    document.removeEventListener('mouseup', this._boundDragEnd);
    document.body.removeEventListener('mousemove', this._boundBodyMouseMove);
    if (this._clickTimer) clearTimeout(this._clickTimer);
  }
}
