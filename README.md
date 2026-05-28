# kaomoji-pet 🐱

A kaomoji desktop pet that lives on your screen and reacts to your computer's state.

一只住在屏幕上的颜文字桌宠，会根据电脑的状态表现出不同的表情和行为。

## Features / 特性

- **Hidden State System** — The pet senses time, CPU usage, memory, battery, mouse/keyboard activity, and more to drive its mood and behavior
- **Dynamic Expressions** — Kaomoji like `( ˘ ω ˘ )`, `( = ω = )`, `( > ω < )` change based on hidden internal states
- **Rich Behaviors** — Sleeping, working with you, getting curious about the mouse, being mischievous
- **Particle Effects** — Emotion-driven visual particles
- **Care System** — Click to interact, pet it to increase warmth
- **Prank Mode** — Long-time companionship may trigger surprise events

## Quick Start for Windows Users / Windows 用户直接使用

如果你是 Windows 用户，不需要安装 Node.js 或任何开发环境，直接下载即可使用：

1. 前往 [Releases 页面](https://github.com/ngyygm/kaomoji-pet/releases)
2. 下载最新的 `kaomoji-pet-win32-x64.zip`
3. 解压到任意文件夹
4. 双击 `kaomoji-pet.exe` 即可运行

> 桌宠会在屏幕上以小窗口形式出现，你可以用鼠标拖动它。右键可退出。

## Development / 开发

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Build for Windows
npm run build:win
```

## Design Document / 设计文档

See [BLUEPRINT.md](BLUEPRINT.md) for the full design spec of the hidden state system, behavior engine, and interaction model.

详见 [BLUEPRINT.md](BLUEPRINT.md)，包含隐藏状态系统、行为引擎、交互模型等完整设计文档。

## Tech Stack / 技术栈

- Electron — Desktop application framework
- Vanilla JS — Lightweight, no framework overhead

## License

MIT
