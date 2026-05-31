# 大特效目录规范

每个大特效是 `renderer/effects/<effect-id>/` 下的一个独立文件夹。系统启动时自动扫描所有包含 `effect.json` 的子目录，跳过 `_` 开头的模板/工具目录。

最小结构：

```text
my-effect/
  effect.json
  index.html
```

可选结构：

```text
my-effect/
  README.md
  assets/
  scripts/
  styles/
```

`effect.json` 常用字段：

```json
{
  "id": "my-effect",
  "name": "我的大特效",
  "emoji": "✨",
  "entry": "index.html",
  "duration": 5000,
  "performance": {
    "renderer": "canvas",
    "adaptiveQuality": true,
    "maxParticles": 200,
    "targetFps": 60,
    "minQuality": 0.6
  },
  "window": {
    "type": "fullscreen-transparent",
    "clickThrough": true,
    "focusable": false,
    "alwaysOnTop": true
  },
  "pet": {
    "animation": "happy",
    "animationDuration": 3000,
    "particles": null
  },
  "params": {
    "duration": { "type": "number", "default": 5000 }
  },
  "enabled": true
}
```

新特效的 `index.html` 应监听：

```js
ipcRenderer.on('effect:start', (event, { id, duration, params }) => {
  // 启动动画
});
```

推荐在新特效中使用共享运行时：

```html
<script src="../_shared/effect-runtime.js"></script>
```

```js
const runtime = EffectRuntime.createRuntime({
  id: 'my-effect',
  adaptiveQuality: true,
  minQuality: 0.6,
  targetFps: 60
});
const { ctx } = EffectRuntime.createHiDpiCanvas(document.getElementById('fx'));

runtime.requestEffectFrame((now, state) => {
  // state.quality 会在掉帧时下降；主视觉保持，优先减少尾迹、尘土、闪光等装饰。
});
```

`performance.renderer` 可选值：

- `canvas`：优先使用一个 canvas 批量绘制粒子、弹幕、星光。
- `hybrid`：主体用 DOM，装饰粒子用 canvas 或对象池。
- `dom`：只适合少量、长生命周期元素，不建议大量创建/销毁短命粒子。

`adaptiveQuality` 默认建议开启。低帧率时应降低装饰密度、尾迹频率、阴影强度，而不是改变主动画路径、节奏或持续时间。

旧内置特效可能还使用 `startChannel` 兼容字段。新特效不要使用它。
