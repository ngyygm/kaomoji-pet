# Bug 记录：窗口出现标题栏 & 特效播完后宠物不可点击

**日期：** 2026-06-03
**平台：** Windows 11 Pro (10.0.22631), Electron 35

---

## 问题现象

### Bug 1：窗口上方出现无字标题栏

桌面宠物主窗口和全屏特效窗口上方，会出现一条约 25px 高、灰蓝色、无文字的横条。
初始不显示，但在以下操作后出现：

- 点击宠物后松开鼠标
- 拖动宠物后松开鼠标
- 播放大特效期间点击其他窗口
- 点击其他任意窗口导致宠物窗口失焦

### Bug 2：大特效播完后宠物窗口不可点击（回归 bug）

在尝试修复 Bug 1 的过程中，移除 `win.blur()` 后出现：大特效播放完毕，宠物窗口无法再接收鼠标点击事件。

---

## 根本原因

### 核心根因：`win.blur()` 触发 Windows DWM 绘制标题栏

这是 Bug 1 的 **真正根因**。

Windows 窗口分为 **客户区**（网页内容）和 **非客户区**（标题栏、边框，由 Windows DWM 系统级绘制）。
`frame: false` 告诉 Electron 不创建原生窗口框，但 `win.blur()` 会向 Windows 发送
`WM_NCACTIVATE(FALSE)` 消息，DWM 收到后 **重新绘制非客户区**，于是标题栏出现。

触发链路：

```
用户点击宠物 → 松开鼠标 → input-controller 调用 blurWindow() → win.blur()
  → Windows 发送 WM_NCACTIVATE(FALSE)
    → DWM 重新绘制非客户区 → 标题栏出现（25px 灰蓝色横条）
```

同样，effect-service.js 中创建/关闭特效窗口时也调用了 `mainWindow.blur()`，
导致主窗口标题栏在特效相关操作中出现。

**关键认知：`showInactive()` 是 `blur()` 的安全替代品。**

| 操作 | 效果 | 副作用 |
|------|------|--------|
| `win.blur()` | 让窗口失焦 | ❌ 触发 `WM_NCACTIVATE(FALSE)` → DWM 画标题栏 |
| `win.showInactive()` | 以不激活方式重置窗口显示 | ✅ 不触发 `WM_NCACTIVATE`，不画标题栏 |

两者都能实现"让窗口不抢焦点"的目的，但 `showInactive()` 不会触发标题栏绘制。

### Bug 2 的根因：`blur()` 同时也在重置 `moveTop()` 后的窗口交互状态

`moveTop()` 将窗口提到最前（`SetWindowPos(HWND_TOP)`），在 `focusable: false` 的窗口上，
`moveTop()` 会将窗口置于一种中间状态（z-order 最高但未完成激活流程）。
此时 `blur()` 的作用不仅仅是移除焦点，还会 **重置窗口的交互状态**，
使其能正常接收鼠标事件。去掉 `blur()` 后，窗口卡在中间状态，无法点击。

**解决方法：用 `showInactive()` 替代 `blur()`——它同样能重置 `moveTop()` 后的窗口状态，
但不会触发标题栏。**

### 辅助因素：`titleBarStyle: 'hidden'` 与 `frame: false` 冲突

原始代码同时设置了 `frame: false` 和 `titleBarStyle: 'hidden'`。
在 Electron 35 中，`titleBarStyle` 在 Windows 上也被识别。
`titleBarStyle: 'hidden'` 的语义是"隐藏标题栏文字，但保留标题栏空间"，
与 `frame: false`（完全无边框）冲突，导致标题栏更频繁地出现。

---

## 尝试过的方案（失败）

| 方案 | 结果 | 原因 |
|------|------|------|
| `setMenuBarVisibility(false)` | ❌ 无效 | 菜单栏和标题栏是不同的东西 |
| `win.removeMenu()` | ❌ 无效 | 彻底删除菜单栏对象，但不影响标题栏 |
| `hookWindowMessage(0x0083, () => {})` | ❌ 无效 | Electron 的 hook 只添加监听器，不阻止默认处理 |
| `hookWindowMessage(0x0085/0x0086, () => {})` | ❌ 无效 | 同上，空回调不抑制默认行为 |
| `focusable: false` 但保留 `blur()` | ❌ 部分有效 | 普通交互 OK，但 `blur()` 仍触发标题栏 |
| 去掉 `blur()` | ❌ 导致 Bug 2 | `moveTop()` 后窗口卡住，不可点击 |

---

## 最终修复方案

### 修改原则

1. **所有 `win.blur()` 替换为 `win.showInactive()`** — 这是核心修复
2. **`focusable: false`** — 主窗口从不获取焦点，减少激活状态变化
3. **移除 `titleBarStyle: 'hidden'` / `titleBarOverlay`** — 避免与 `frame: false` 冲突
4. **`on('blur')` 监听 + `hookWindowMessage(0x0086)` 作为安全网** — 防止边缘情况

### 具体改动

#### 1. 主窗口 (`window-service.js`)

```diff
  this.mainWindow = new BrowserWindow({
-   titleBarStyle: 'hidden',
-   titleBarOverlay: false,
-   autoHideMenuBar: true,
-   focusable: true,
+   focusable: false,
    ...
  });

- this.mainWindow.setMenuBarVisibility(false);
+ this.mainWindow.removeMenu();

+ // 窗口失焦时立即重置视觉状态，防止 Windows DWM 绘制标题栏
+ this.mainWindow.on('blur', () => {
+   if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
+   this.mainWindow.showInactive();
+ });
+
+ // Windows: 拦截 WM_NCACTIVATE (0x0086)，在 DWM 层面重置视觉状态
+ if (process.platform === 'win32') {
+   this.mainWindow.hookWindowMessage(0x0086, () => {
+     setTimeout(() => {
+       if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
+       this.mainWindow.showInactive();
+     }, 0);
+   });
+ }

  // blurWindow() 方法改为 showInactive()，避免触发标题栏
- blurWindow() { if (win) win.blur(); }
+ blurWindow() { if (win) win.showInactive(); }
```

#### 2. 特效窗口 (`effect-service.js`)

```diff
  const effectWin = new BrowserWindow({
-   titleBarStyle: 'hidden',
-   autoHideMenuBar: true,
+   show: false,
    ...
  });

  effectWin.removeMenu();
  effectWin.setIgnoreMouseEvents(true);
+ effectWin.showInactive();
+
+ // 特效窗口失焦时也重置视觉状态
+ effectWin.on('blur', () => {
+   if (!effectWin.isDestroyed()) effectWin.showInactive();
+ });

- if (mainWindow) { mainWindow.moveTop(); mainWindow.blur(); }
+ if (mainWindow) { mainWindow.moveTop(); mainWindow.showInactive(); }

  effectWin.on('closed', () => {
-   if (win) { win.moveTop(); win.blur(); }
+   if (win) { win.moveTop(); win.showInactive(); }
  });
```

---

## 修复后的全场景验证

| 场景 | 修复前 | 修复后 |
|------|--------|--------|
| 点击宠物松开 | 出现标题栏 | ✅ 正常 |
| 拖动宠物松开 | 出现标题栏 | ✅ 正常 |
| 点击其他窗口 | 出现标题栏 | ✅ 正常 |
| 播放大特效 → 点击其他窗口 | 标题栏出现 | ✅ 正常 |
| 播放大特效 → 点回宠物 → 再点别的窗口 | 标题栏出现 | ✅ 正常 |
| 特效播完后点击宠物 | 正常 | ✅ 正常 |
| 右键菜单 | 正常 | ✅ 正常 |
| 改名对话框 | 正常 | ✅ 正常（独立窗口，不受影响）|

---

## 经验总结

> **Electron + Windows 的铁律：永远不要在透明无边框窗口上调用 `win.blur()`。**
> 用 `win.showInactive()` 替代。

`focusable: false` 仅阻止主窗口获取 **键盘焦点**，不影响鼠标事件的接收。
宠物窗口本身不需要键盘输入（改名对话框是独立窗口），因此无副作用。

`showInactive()` 能同时完成两件事：
1. 让窗口不抢焦点（原 `blur()` 的作用）
2. 重置 `moveTop()` 后的窗口交互状态（避免不可点击）

而且不会触发 `WM_NCACTIVATE(FALSE)`，所以不会导致 DWM 画标题栏。
