(function () {
  const DEFAULT_OPTIONS = {
    targetFps: 60,
    adaptiveQuality: true,
    minQuality: 0.45,
    logEveryMs: 2500
  };

  const TIER_QUALITY = { high: 1, medium: 0.78, low: 0.58 };

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // === GPU Detection ===

  function getWebGLInfo() {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) return { supported: false, renderer: '', vendor: '' };
      const d = gl.getExtension('WEBGL_debug_renderer_info');
      return {
        supported: true,
        renderer: d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
        vendor: d ? gl.getParameter(d.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR)
      };
    } catch (_) { return { supported: false, renderer: '', vendor: '' }; }
  }

  const WEAK_GPU = /basic render|software|swiftshader|microsoft basic|llvmpipe|mesa/;
  const STRONG_GPU = /nvidia|geforce|rtx|gtx|radeon|rx |arc|iris|uhd|apple|m1|m2|m3|m4/;

  function detectPerformanceTier() {
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    const webgl = getWebGLInfo();
    const hasGpuApi = !!navigator.gpu;
    const rendererStr = `${webgl.renderer || ''} ${webgl.vendor || ''}`.toLowerCase();
    const isWeakGpu = WEAK_GPU.test(rendererStr);
    const isStrongGpu = STRONG_GPU.test(rendererStr);

    // Binary GPU decision
    let hasGPU = false;
    if (hasGpuApi) hasGPU = true;                     // WebGPU API = real GPU
    else if (webgl.supported && !isWeakGpu) hasGPU = true;  // WebGL + not software = real GPU
    // else: no WebGL or software renderer → no GPU

    // Performance tier for quality scaling
    let score = 0;
    if (cores >= 8) score += 2; else if (cores >= 4) score += 1;
    if (memory >= 8) score += 2; else if (memory >= 4) score += 1;
    if (webgl.supported) score += 1;
    if (hasGpuApi || isStrongGpu) score += 1;
    if (isWeakGpu) score -= 3;

    let tier = 'medium';
    if (score >= 5) tier = 'high';
    if (score <= 1) tier = 'low';

    return { tier, quality: TIER_QUALITY[tier], cores, memory, hasGpuApi, webgl, hasGPU, rendererStr };
  }

  // === Object Pool ===

  class ObjectPool {
    constructor(create, reset) {
      this.create = create;
      this.reset = reset || (() => {});
      this.free = [];
    }
    acquire() { return this.free.pop() || this.create(); }
    release(item) { this.reset(item); this.free.push(item); }
  }

  // === Pre-rendered Glow Cache (for CPU mode) ===

  const glowCache = new Map();

  function preRenderGlow(size, color) {
    const s = Math.max(4, Math.ceil(size));
    const c = document.createElement('canvas');
    c.width = s; c.height = s;
    const ctx = c.getContext('2d');
    const r = s / 2;
    const grad = ctx.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, color);
    grad.addColorStop(0.4, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s, s);
    return c;
  }

  function getGlowImage(size, color) {
    const key = `${Math.round(size)}_${color}`;
    let img = glowCache.get(key);
    if (!img) {
      img = preRenderGlow(size, color);
      glowCache.set(key, img);
    }
    return img;
  }

  // === Text Sprite Cache ===
  // Pre-renders each (char, fontSize, color) combo onto an offscreen canvas,
  // so we use fast drawImage() instead of slow fillText() every frame.

  const textSpriteCache = new Map();
  const MAX_TEXT_SPRITES = 3000;

  function getTextSprite(char, fontSize, color) {
    const key = `${char}_${fontSize}_${color}`;
    let sprite = textSpriteCache.get(key);
    if (sprite) return sprite;

    if (textSpriteCache.size >= MAX_TEXT_SPRITES) {
      const oldest = textSpriteCache.keys().next().value;
      textSpriteCache.delete(oldest);
    }

    const font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;

    // Measure text dimensions
    const tmpC = document.createElement('canvas');
    tmpC.width = 1; tmpC.height = 1;
    const tc = tmpC.getContext('2d');
    tc.font = font;
    const m = tc.measureText(char);
    const w = Math.ceil(m.width) + 4;
    const h = Math.ceil(fontSize * 1.5) + 4;

    // Render character onto offscreen canvas (one-time cost)
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const sc = c.getContext('2d');
    sc.font = font;
    sc.textAlign = 'center';
    sc.textBaseline = 'middle';
    sc.fillStyle = color;
    sc.fillText(char, w / 2, h / 2);

    sprite = { canvas: c, w, h, hw: w / 2, hh: h / 2 };
    textSpriteCache.set(key, sprite);
    return sprite;
  }

  // === DOM Element Pool ===

  function createElementPool(tag, maxPool = 80) {
    const pool = [];
    function acquire(parent) {
      const el = pool.pop() || document.createElement(tag);
      if (parent && !el.parentNode) parent.appendChild(el);
      return el;
    }
    function release(el) {
      if (el.parentNode) el.parentNode.removeChild(el);
      el.className = '';
      el.style.cssText = '';
      if (pool.length < maxPool) pool.push(el);
    }
    return { acquire, release };
  }

  // === Create Runtime ===

  function createRuntime(options = {}) {
    const config = { ...DEFAULT_OPTIONS, ...options };
    const detected = detectPerformanceTier();
    const gpuMode = detected.hasGPU ? 'gpu' : 'cpu';

    const state = {
      tier: detected.tier,
      quality: clamp(TIER_QUALITY[detected.tier], config.minQuality, 1),
      gpuMode,
      hasGPU: detected.hasGPU,
      frame: 0,
      fps: 60,
      avgFps: 60,
      minFps: 60,
      dt: 16.7,
      running: false,
      startedAt: 0,
      lastFrameAt: 0,
      lastLogAt: 0,
      gpu: null,
      detected
    };

    console.log(`[EffectRuntime] GPU mode: ${gpuMode}, tier: ${detected.tier}, renderer: ${detected.rendererStr.slice(0, 60)}`);

    // Fetch Electron GPU status
    try {
      const electron = window.require && window.require('electron');
      if (electron?.ipcRenderer) {
        electron.ipcRenderer.invoke('gpu:status').then(s => { state.gpu = s; }).catch(() => {});
      }
    } catch (_) {}

    const targetFrameTime = 1000 / config.targetFps;

    // === Adaptive Quality ===

    function adjustQuality() {
      if (!config.adaptiveQuality || state.frame < 45) return;
      const target = config.targetFps;
      if (state.avgFps < target * 0.72) {
        state.quality = clamp(state.quality - 0.035, config.minQuality, 1);
        state.tier = state.quality < 0.62 ? 'low' : 'medium';
      } else if (state.avgFps > target * 0.92 && state.quality < TIER_QUALITY[detected.tier]) {
        state.quality = clamp(state.quality + 0.015, config.minQuality, TIER_QUALITY[detected.tier]);
      }
    }

    // === rAF Loop with Frame Skip ===

    function requestEffectFrame(callback) {
      state.running = true;
      state.startedAt = performance.now();
      state.lastFrameAt = state.startedAt;
      state.lastLogAt = state.startedAt;

      function tick(now) {
        if (!state.running) return;
        state.dt = Math.min(50, Math.max(1, now - state.lastFrameAt));
        state.lastFrameAt = now;
        state.frame++;

        const instantFps = 1000 / state.dt;
        state.fps = instantFps;
        state.avgFps = state.avgFps * 0.94 + instantFps * 0.06;
        state.minFps = Math.min(state.minFps, instantFps);
        adjustQuality();

        // Frame skip: if way behind, tell callback to skip rendering
        const skipRender = state.dt > targetFrameTime * 2.5 && state.avgFps < config.targetFps * 0.5;
        callback(now, state, skipRender);
        if (!state.running) return;

        if (config.logEveryMs && now - state.lastLogAt > config.logEveryMs) {
          state.lastLogAt = now;
          console.log(`[effect:${config.id || '?'}] fps=${state.avgFps.toFixed(1)} min=${state.minFps.toFixed(1)} quality=${state.quality.toFixed(2)} mode=${state.gpuMode}`);
        }

        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    function stop() { state.running = false; }

    function scaleCount(count, min = 1) {
      return Math.max(min, Math.round(count * state.quality));
    }

    function chance(probability) {
      return Math.random() < probability * state.quality;
    }

    // === drawDot: GPU path (shadowBlur) vs CPU path (pre-rendered glow) ===

    function drawDot(ctx, x, y, size, color, alpha, blur) {
      ctx.globalAlpha = alpha;
      if (state.gpuMode === 'gpu') {
        // GPU path: shadowBlur is OK — GPU compositor handles it
        ctx.shadowBlur = blur * state.quality;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        // CPU path: pre-rendered glow texture — no shadowBlur
        const glowSize = Math.ceil((size + blur * state.quality) * 2);
        const img = getGlowImage(glowSize, color);
        ctx.drawImage(img, x - glowSize / 2, y - glowSize / 2);
      }
      ctx.globalAlpha = 1;
    }

    // === drawGlowText: sprite-cached text rendering (no separate glow layer) ===

    function drawGlowText(ctx, text, x, y, font, color, alpha, blur) {
      const fontSize = parseInt(font) || 12;
      const sprite = getTextSprite(text, fontSize, color);

      // Single drawImage — no separate glow bitmap, half the draw calls
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite.canvas, x - sprite.hw, y - sprite.hh);
      ctx.globalAlpha = 1;
    }

    return {
      state, config, detected,
      requestEffectFrame, stop, scaleCount, chance,
      drawDot, drawGlowText
    };
  }

  // === HiDPI Canvas ===

  function createHiDpiCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    return { canvas, ctx, ratio, resize };
  }

  // === Swap-and-Pop (O(1) array removal) ===

  function removeAt(arr, i) {
    if (i < 0 || i >= arr.length) return;
    arr[i] = arr[arr.length - 1];
    arr.pop();
  }

  // === Exports ===

  window.EffectRuntime = {
    createRuntime,
    createHiDpiCanvas,
    detectPerformanceTier,
    ObjectPool,
    createElementPool,
    removeAt,
    clamp
  };
})();
