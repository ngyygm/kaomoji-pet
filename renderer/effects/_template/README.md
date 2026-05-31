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

模板默认使用 `../_shared/effect-runtime.js`。优先用 canvas 批量绘制短命粒子；如果必须用 DOM，请复用节点或只创建少量长生命周期元素。

`runtime.state.quality` 会根据实际 FPS 自动下降。低档位下建议只减少尾迹、闪光、尘土、次级粒子，不要改变主动画路径和时长。
