# 🐱 Kaomoji Pet / 颜文字桌宠 / 顔文字ペット

A cute, AI-driven desktop pet that lives on your screen as a kaomoji (Japanese text emoticon). It reacts to your computer's state — CPU load, memory usage, battery level, time of day, and your mouse activity — to express emotions, wander around, and even send you encouraging messages.

一只住在桌面上的颜文字猫咪桌宠。它会感知电脑状态（CPU、内存、电量、时间、鼠标活动），用表情、动作、说话来表达情绪，还能下"鼓励雨"陪你。

画面上に住む顔文字ネコのデスクトップペット。PCの状態（CPU、メモリ、バッテリー、時間、マウス活動）を感知し、表情や動き、セリフで感情を表現します。

---

## ✨ Features / 特性 / 機能

- 🐱 **Living Kaomoji** — `( · ω · )` that changes expressions based on mood
- 🧠 **Hidden State Engine** — 10 internal attributes (energy, mood, curiosity, sleepiness, stress, warmth, mischief, hunger, loneliness, focus sync) that evolve over time
- 🎭 **30+ Expressions** — Eyes, mouth, and body change to reflect the pet's emotional state
- 🚶 **Screen Walking** — The pet wanders across your screen with curved paths and natural pacing
- 💬 **Speech Bubbles** — Contextual dialogue based on system state and time of day
- 🌧️ **Care Rain** — 300 encouragement messages in 6 languages (中文, English, 日本語, Français, Deutsch, Русский) falling like rain when you're stressed
- 🎆 **Easter Eggs** — Rapid clicks trigger surprises (giant face, firework burst, barrage attack, affection burst)
- 🌙 **Time-aware** — Morning greetings, afternoon drowsiness, late-night sleepiness
- 🔋 **System-aware** — Reacts to CPU load, memory pressure, battery level, charging state
- 🖱️ **Mouse-aware** — Follows cursor, reacts when you approach, responds to your activity
- 💾 **Auto Save** — Pet state persists between sessions

---

## 📸 Screenshot

```
  ╭─────────────────────╮
  │    ( · ω · )        │
  │      小猫咪          │
  ╰─────────────────────╯
     ♥  ♡  ★  ✧        ← particles
  ┌─────────────────────┐
  │  记得休息一下。       │ ← speech bubble
  └─────────────────────┘
```

---

## 🚀 Quick Start / 快速开始 / クイックスタート

### Prerequisites / 前置条件 / 前提条件

- [Node.js](https://nodejs.org/) 18+

### Install & Run / 安装与运行 / インストールと実行

```bash
git clone https://github.com/ngyygm/kaomoji-pet.git
cd kaomoji-pet
npm install
npm start
```

### Build / 打包 / ビルド

```bash
npm run build
```

Output will be in `dist/kaomoji-pet-win32-x64/`. Copy the entire folder to another PC and double-click `kaomoji-pet.exe`.

打包产物在 `dist/kaomoji-pet-win32-x64/`，整个文件夹拷贝到别的电脑，双击 `kaomoji-pet.exe` 即可运行。

ビルド結果は `dist/kaomoji-pet-win32-x64/` に出力されます。フォルダ全体を別のPCにコピーして、`kaomoji-pet.exe` をダブルクリックして起動。

> ⚠️ On Windows, you may need to right-click the exe → Properties → check "Unblock" if the system blocks it.
>
> ⚠️ Windows で実行ファイルがブロックされる場合、右クリック → プロパティ → 「許可する」にチェック。

---

## 🎮 Interactions / 交互操作 / 操作方法

| Action / 操作 | Effect / 效果 / 効果 |
|---|---|
| **Double-click** kaomoji | Pet the cat (hearts + affection) / 摸摸头 / なでる |
| **Rapid click** 10+ times | Trigger big surprise effect / 触发大特效 / 大きなサプライズ |
| **Drag** kaomoji | Move window / 拖动窗口 / ウィンドウ移動 |
| **Right-click** | Context menu (rename, save, exit) / 右键菜单 / 右クリックメニュー |
| **Mouse nearby** | Pet notices and reacts / 宠物会注意到你 / ペットが気づく |

---

## 🏗️ Architecture / 架构 / アーキテクチャ

```
kaomoji-pet/
├── main.js                    # Electron main process / 主进程 / メインプロセス
├── preload.js                 # IPC bridge / IPC桥接 / IPCブリッジ
├── renderer/
│   ├── index.html             # Main UI / 主界面 / メインUI
│   ├── care-rain.html         # Encouragement overlay / 鼓励雨 / 鼓励の雨
│   ├── prank-giant.html       # Easter egg overlay / 彩蛋覆盖 / イースターエッグ
│   ├── styles/main.css        # Styles / 样式 / スタイル
│   └── scripts/
│       ├── app.js             # App entry / 应用入口 / アプリエントリ
│       ├── hidden-state.js    # Hidden state engine / 隐藏状态引擎 / 隠し状態エンジン
│       ├── behavior-engine.js # Behavior logic / 行为逻辑 / 行動ロジック
│       ├── renderer.js        # Kaomoji rendering / 渲染器 / レンダラー
│       ├── system-monitor.js  # System metrics / 系统监控 / システム監視
│       └── data/              # Expression/speech/particle definitions
│           ├── expressions.js
│           ├── animations.js
│           ├── speech-states.js
│           └── care-messages.js
└── package.json
```

---

## 🎭 Expressions / 表情 / 表現

The pet has a segmented kaomoji system: `( X ω X )` where `X` positions are dynamically replaced.

宠物采用分段颜文字系统：`( X ω X )`，其中 `X` 位置动态替换。

ペットはセグメント顔文字システムを採用：`( X ω X )` の `X` が動的に置換されます。

| Mood / 心情 / 気分 | Eyes / 眼睛 / 目 | Mouth / 嘴巴 / 口 |
|---|---|---|
| Happy / 开心 | `^` | `ω` |
| Love / 喜欢 | `♥` | `ω` |
| Sleepy / 困 | `-` | `ω` |
| Sleeping / 睡觉 | `─` | `ω` |
| Surprised / 惊讶 | `O` | `▽` |
| Sad / 难过 | `;` | `ω` |
| Angry / 生气 | `> <` | `ω` |
| Curious / 好奇 | `°` | `ω` |
| Confused / 困惑 | `?` | `≈` |
| Smug / 得意 | `¬` | `3` |
| Drowsy / 犯困 | `─` | `o` |
| Shy / 害羞 | `~` | `─` |

---

## 📜 License / 许可 / ライセンス

MIT
# kaomoji-pet
# kaomoji-pet
