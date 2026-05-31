(function () {
  const DEFAULT_OPTIONS = {
    targetFps: 60,
    adaptiveQuality: true,
    minQuality: 0.45,
    logEveryMs: 2500
  };

  const TIER_QUALITY = {
    high: 1,
    medium: 0.78,
    low: 0.58
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getWebGLInfo() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return { supported: false, renderer: '', vendor: '' };
      const debug = gl.getExtension('WEBGL_debug_renderer_info');
      return {
        supported: true,
        renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
        vendor: debug ? gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR)
      };
    } catch (err) {
      return { supported: false, renderer: '', vendor: '' };
    }
  }

  function detectPerformanceTier(extra = {}) {
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    const webgl = extra.webgl || getWebGLInfo();
    const hasGpuApi = !!navigator.gpu;
    const renderer = `${webgl.renderer || ''} ${webgl.vendor || ''}`.toLowerCase();
    const weakGpu = /basic render|software|swiftshader|microsoft basic|llvmpipe/.test(renderer);
    const strongGpu = /nvidia|geforce|rtx|gtx|radeon|rx |arc|iris|uhd|apple/.test(renderer);

    let score = 0;
    if (cores >= 8) score += 2;
    else if (cores >= 4) score += 1;
    if (memory >= 8) score += 2;
    else if (memory >= 4) score += 1;
    if (webgl.supported) score += 1;
    if (hasGpuApi || strongGpu) score += 1;
    if (weakGpu) score -= 3;

    let tier = 'medium';
    if (score >= 5) tier = 'high';
    if (score <= 1) tier = 'low';
    return { tier, quality: TIER_QUALITY[tier], cores, memory, hasGpuApi, webgl };
  }

  class ObjectPool {
    constructor(create, reset) {
      this.create = create;
      this.reset = reset || (() => {});
      this.free = [];
    }

    acquire() {
      return this.free.pop() || this.create();
    }

    release(item) {
      this.reset(item);
      this.free.push(item);
    }
  }

  function createRuntime(options = {}) {
    const config = { ...DEFAULT_OPTIONS, ...options };
    const detected = detectPerformanceTier();
    const state = {
      tier: detected.tier,
      quality: clamp(TIER_QUALITY[detected.tier], config.minQuality, 1),
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

    try {
      const electron = window.require && window.require('electron');
      if (electron?.ipcRenderer) {
        electron.ipcRenderer.invoke('gpu:status').then(status => {
          state.gpu = status;
        }).catch(() => {});
      }
    } catch (err) {}

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

        callback(now, state);
        if (!state.running) return;

        if (config.logEveryMs && now - state.lastLogAt > config.logEveryMs) {
          state.lastLogAt = now;
          console.log(`[effect:${config.id || 'unknown'}] fps=${state.avgFps.toFixed(1)} min=${state.minFps.toFixed(1)} quality=${state.quality.toFixed(2)} tier=${state.tier}`);
        }

        requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }

    function stop() {
      state.running = false;
    }

    function scaleCount(count, min = 1) {
      return Math.max(min, Math.round(count * state.quality));
    }

    function chance(probability) {
      return Math.random() < probability * state.quality;
    }

    return { state, config, detected, requestEffectFrame, stop, scaleCount, chance };
  }

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

  window.EffectRuntime = {
    createRuntime,
    createHiDpiCanvas,
    detectPerformanceTier,
    ObjectPool,
    clamp
  };
})();
