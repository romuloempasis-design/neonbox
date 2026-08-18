# Neonbox

**Neonbox OS • Game Platform**

Neonbox is an experimental handheld game platform built around a browser-based canvas console.

The goal is to create a small, portable game platform where games can be developed separately from the console itself.

## Current Status

**Development: Console Foundation / v0.2.0**

The current focus is building and stabilizing the Neonbox console before expanding the game library.

### Console

- Canvas-based display
- Neonbox handheld interface
- D-pad controls
- A / B buttons
- START / SELECT buttons
- Touch controls
- Keyboard controls
- Game library
- External JavaScript game loading
- Game registration API
- Game lifecycle API
- Input API
- Local save/load API
- Basic audio API
- Vibration API
- Neonbox system menu

## Architecture

```text
Neonbox
│
├── Console
│   ├── Canvas
│   ├── Controls
│   └── Neonbox OS
│
├── Game Library
│   └── games/games.json
│
├── Game API
│   ├── Lifecycle
│   ├── Input
│   ├── Storage
│   ├── Audio
│   └── Vibration
│
└── Games
    ├── Test
    └── Tetris