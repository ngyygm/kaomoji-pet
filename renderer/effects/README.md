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

旧内置特效可能还使用 `startChannel` 兼容字段。新特效不要使用它。
