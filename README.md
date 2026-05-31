# Kaomoji Pet / 颜文字桌宠 / 顔文字ペット

A cute, AI-driven desktop pet that lives on your screen as a kaomoji (Japanese text emoticon). It reacts to your computer's state — CPU load, memory usage, battery level, time of day, and your mouse activity — to express emotions, wander around, and even send you encouraging messages.

一只住在桌面上的颜文字猫咪桌宠。它会感知电脑状态（CPU、内存、电量、时间、鼠标活动），用表情、动作、说话来表达情绪，还能下"鼓励雨"陪你。

画面上に住む顔文字ネコのデスクトップペット。PCの状態（CPU、メモリ、バッテリー、時間、マウス活動）を感知し、表情や動き、セリフで感情を表現します。

---

## Features / 特性 / 機能

- **Living Kaomoji** — `( · ω · )` that changes expressions based on mood
- **Hidden State Engine** — 10 internal attributes (energy, mood, curiosity, sleepiness, stress, warmth, mischief, hunger, loneliness, focus sync) that evolve over time
- **30+ Expressions** — Eyes, mouth, and body change to reflect the pet's emotional state
- **Screen Walking** — The pet wanders across your screen with curved paths and natural pacing
- **Speech Bubbles** — Contextual dialogue based on system state and time of day
- **Care Rain** — 300 encouragement messages in 6 languages (中文, English, 日本語, Français, Deutsch, Русский) falling like rain when you're stressed
- **Easter Eggs** — Rapid clicks trigger surprises (giant face, firework burst, barrage attack, affection burst)
- **Time-aware** — Morning greetings, afternoon drowsiness, late-night sleepiness
- **System-aware** — Reacts to CPU load, memory pressure, battery level, charging state
- **Mouse-aware** — Follows cursor, reacts when you approach, responds to your activity
- **Auto Save** — Pet state persists between sessions

---

## Quick Start for Windows Users / Windows 用户直接使用

如果你是 Windows 用户，不需要安装 Node.js 或任何开发环境，直接下载即可使用：

1. 前往 [Releases 页面](https://github.com/ngyygm/kaomoji-pet/releases)
2. 下载最新的 `kaomoji-pet-win32-x64.zip`
3. 解压到任意文件夹
4. 双击 `kaomoji-pet.exe` 即可运行

> 桌宠会在屏幕上以小窗口形式出现，你可以用鼠标拖动它。右键可退出。

---

## Development / 开发 / 開発

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Build for Windows
npm run build:win
```

Output will be in `dist/kaomoji-pet-win32-x64/`. Copy the entire folder to another PC and double-click `kaomoji-pet.exe`.

打包产物在 `dist/kaomoji-pet-win32-x64/`，整个文件夹拷贝到别的电脑，双击 `kaomoji-pet.exe` 即可运行。

ビルド結果は `dist/kaomoji-pet-win32-x64/` に出力されます。フォルダ全体を別のPCにコピーして、`kaomoji-pet.exe` をダブルクリックして起動。

---

## Interactions / 交互操作 / 操作方法

| Action | Effect |
|---|---|
| **Double-click** kaomoji | Pet the cat (hearts + affection) |
| **Rapid click** 10+ times | Trigger big surprise effect |
| **Drag** kaomoji | Move window |
| **Right-click** | Context menu (rename, save, exit) |
| **Mouse nearby** | Pet notices and reacts |

---

## Architecture / 架构

```
kaomoji-pet/
├── main.js                    # Electron main process
├── preload.js                 # IPC bridge
├── renderer/
│   ├── index.html             # Main UI
│   ├── effects/               # Drop-in big effect folders
│   │   ├── README.md          # Effect folder specification
│   │   ├── _template/         # Copy this to create a new effect
│   │   └── <effect-id>/       # effect.json + index.html + optional assets
│   ├── styles/main.css        # Styles
│   └── scripts/
│       ├── app.js             # App entry
│       ├── hidden-state.js    # Hidden state engine
│       ├── behavior-engine.js # Behavior logic
│       ├── renderer.js        # Kaomoji rendering
│       ├── system-monitor.js  # System metrics
│       └── data/              # Expression/speech/particle definitions
├── package.json
└── BLUEPRINT.md               # Full design document
```

---

## Expressions / 表情

The pet has a segmented kaomoji system: `( X ω X )` where `X` positions are dynamically replaced.

| Mood | Eyes | Mouth |
|---|---|---|
| Happy | `^` | `ω` |
| Love | `♥` | `ω` |
| Sleepy | `-` | `ω` |
| Sleeping | `─` | `ω` |
| Surprised | `O` | `▽` |
| Sad | `;` | `ω` |
| Angry | `> <` | `ω` |
| Curious | `°` | `ω` |
| Confused | `?` | `≈` |
| Smug | `¬` | `3` |
| Drowsy | `─` | `o` |
| Shy | `~` | `─` |

---

## Design Document / 设计文档

See [BLUEPRINT.md](BLUEPRINT.md) for the full design spec of the hidden state system, behavior engine, and interaction model.

详见 [BLUEPRINT.md](BLUEPRINT.md)，包含隐藏状态系统、行为引擎、交互模型等完整设计文档。

---

## Tech Stack / 技术栈

- **Electron** — Desktop application framework
- **Vanilla JS** — Lightweight, no framework overhead

## License

MIT
