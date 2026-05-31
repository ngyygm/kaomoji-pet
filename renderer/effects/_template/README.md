# 大特效模板

复制 `_template` 文件夹到 `renderer/effects/<your-effect-id>`，修改 `effect.json` 和 `index.html`。

系统会在启动时扫描 `renderer/effects/*/effect.json`。新特效不需要改 `main.js`、`preload.js` 或菜单代码。

`index.html` 应监听统一事件：

```js
ipcRenderer.on('effect:start', (event, { id, duration, params }) => {
  // start animation
});
```

动画结束时可以调用 `window.close()`，主进程也会按 `duration` 自动兜底关闭窗口。
