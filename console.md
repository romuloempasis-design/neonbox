NEONBOX PROJECT — CONTINUATION PROMPT

We are building NEONBOX, a browser-based handheld game console / game platform.

PROJECT GOAL
Build a standalone browser console where the console/OS is separate from individual games. Other developers should be able to create games for Neonbox without modifying the console core.

REPOSITORY
GitHub:
https://github.com/romuloempasis-design/neonbox

CURRENT STATUS
We are currently focusing on the console foundation.

Console foundation is considered complete enough for now. Do NOT keep adding random console features. We should now build the first real game and only return to the console/API when the game exposes a real missing requirement.

CURRENT VERSION
Neonbox console foundation: v0.2.0

CURRENT FILE STRUCTURE

neonbox/
├── index.html
├── neonbox.js
├── api.md
├── README.md
└── games/
    ├── games.json
    ├── test/
    │   └── test.js
    └── tetris/
        └── tetris.js

CURRENT CONSOLE

index.html contains:
- Physical handheld shell
- Canvas display
- D-pad
- A button
- B button
- SELECT button
- START button
- Touch/pointer controls
- CSS for the physical console

IMPORTANT:
The Neonbox OS/game display is rendered INSIDE the canvas.

The canvas is:

<canvas id="neonbox-screen"></canvas>

Do not put Neonbox OS branding, game UI, menus, scores, etc. as selectable HTML text outside the canvas.

The physical controls can remain HTML buttons because they need touch interaction.

NEONBOX BRANDING

The canvas should display branding such as:

NEONBOX
NEONBOX OS • GAME PLATFORM

The console should be branded NEONBOX, not Neon Tetris.

CONSOLE ARCHITECTURE

The console owns:
- Canvas
- Controller input routing
- Game lifecycle
- Game library
- External game loading
- Storage
- Audio
- Vibration
- System menu

Games own:
- Game rendering
- Game logic
- Game-specific input behavior
- Game-specific UI
- Game state

BUTTON OWNERSHIP

Normal inputs belong to the game:

D-PAD → Game
A → Game
B → Game
START → Game
SELECT → Game

SELECT MUST NOT AUTOMATICALLY EXIT A GAME.

SYSTEM MENU

Neonbox has a system-level escape combination:

START + SELECT
        ↓
Neonbox System Menu

System menu currently contains:

RESUME
RESTART
EXIT TO LIBRARY

B or SELECT can close the system menu.

The purpose is to keep SELECT available for games.

For example, Tetris can use:

SELECT → for future update
START → Pause

while:

START + SELECT → Neonbox system menu

CURRENT neonbox.js

The current console JS provides approximately:

Neonbox.init()
Neonbox.registerGame(game)
Neonbox.loadGame(url)
Neonbox.launch(id)
Neonbox.launchURL(url,id)
Neonbox.stop()
Neonbox.loadLibrary()
Neonbox.launchLibraryGame(id)
Neonbox.navigateLibrary(direction)
Neonbox.sendInput(button)

System:
Neonbox.openSystemMenu()
Neonbox.closeSystemMenu()
Neonbox.systemAction()

Storage:
Neonbox.save(key,value)
Neonbox.load(key,fallback)
Neonbox.removeSave(key)

Utilities:
Neonbox.beep(...)
Neonbox.vibrate(...)

GAME API

Games should follow this general architecture:

Neonbox.registerGame({
  id:"example",
  title:"Example Game",
  author:"Developer",
  version:"1.0.0",

  start(api){
    // initialize game
  },

  update(dt){
    // game logic
  },

  input(button){
    // game input
  },

  render(ctx,canvas){
    // draw game
  },

  stop(){
    // cleanup
  }
});

Game lifecycle:

start(api)
    ↓
update(dt)
    ↓
input(button)
    ↓
render(ctx,canvas)
    ↓
stop()

GAME LIBRARY

games/games.json defines available games.

Example:

{
  "version":"1.0",
  "games":[
    {
      "id":"tetris",
      "title":"Neonbox Tetris",
      "author":"Neonbox",
      "version":"0.1.0",
      "script":"games/tetris/tetris.js"
    }
  ]
}

EXTERNAL GAME CONCEPT

Games are separate JavaScript files.

The console loads the game script and the game registers itself through the Neonbox API.

The long-term goal is that third-party developers can make Neonbox games independently.

FIRST REAL GAME

The first real game is TETRIS.

We are now moving from console development to Tetris development.

TETRIS DEVELOPMENT ORDER

Build Tetris incrementally:

1. Canvas/game UI
2. Playfield
3. Tetromino definitions
4. Falling piece
5. Left/right movement
6. Soft drop
7. Rotation
8. Collision detection
9. Piece locking
10. Line clearing
11. Score
12. Level
13. Next piece
14. Hold piece
15. Pause
16. Game over
17. Restart
18. Neonbox visual polish

TETRIS CONTROLS

UP = Hard Drop
LEFT = Move Left + Repeat
RIGHT = Move Right + Repeat
DOWN = Soft Drop + Repeat
A = Rotate
B = Hold
SELECT = Reserved for future development
START = Pause / Restart

START + SELECT → Neonbox system menu

IMPORTANT DEVELOPMENT RULE

Do NOT immediately add more console features.

Build Tetris against the existing API.

If Tetris genuinely requires an API capability that does not exist, identify the missing capability and then update the console/API.

The game should not directly manipulate Neonbox internals.

CANVAS RULE

Games render into the Neonbox canvas.

Do not create separate HTML UI for games unless there is a strong architectural reason.

Prefer:

render(ctx,canvas)

for all game visuals.

README STATUS

README currently describes Neonbox as:

Neonbox OS • Game Platform

Current status:
Console Foundation / v0.2.0

Console foundation:
- Canvas display
- Neonbox handheld interface
- D-pad
- A/B
- START/SELECT
- Touch controls
- Keyboard controls
- Game library
- External JS game loading
- Game registration
- Game lifecycle
- Input API
- Local save/load
- Audio
- Vibration
- System menu

DEVELOPMENT STYLE

Use compact code when requested.

When providing code:
- Give complete files when asked for "full code".
- Do not give partial snippets if the user explicitly asks for a full file.
- Preserve existing architecture unless there is a clear reason to change it.
- Explain where each file belongs.
- Keep game code separate from console code.
- Avoid unnecessary dependencies.

CURRENT NEXT STEP

STOP CONSOLE FEATURE DEVELOPMENT FOR NOW.

NEXT:
Build the first version of:

games/tetris/tetris.js

Start with the Tetris canvas UI and playfield, then progressively implement gameplay.

The goal is to test the Neonbox API with a real game before expanding the platform.