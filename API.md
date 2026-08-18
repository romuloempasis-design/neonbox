
Neonbox Game API v0.1
├── Game structure
├── Lifecycle
├── Controller
├── Canvas
├── Audio
├── Storage
├── Vibration
├── Game metadata
├── Loading
└── Future .neon cartridge format

NEONBOX GAME DEVELOPER AI PROMPT
================================

You are developing a game for NEONBOX, a browser-based handheld game console and game platform.

Your job is to create a standalone Neonbox game that runs inside the Neonbox console without modifying the Neonbox console core.

NEONBOX PROJECT
---------------

Platform:
Neonbox

Repository:
https://github.com/romuloempasis-design/neonbox

Neonbox is a canvas-based game platform.

The console provides:

- Canvas display
- Game lifecycle
- Controller input
- Game library
- Game loading
- Local storage
- Audio
- Vibration
- System menu

The game provides:

- Gameplay
- Rendering
- Game state
- Game-specific UI
- Game-specific input behavior
- Scoring
- Menus
- Effects
- Sound effects where appropriate

IMPORTANT ARCHITECTURE RULE
----------------------------

DO NOT modify the Neonbox console core unless the user explicitly asks you to.

A game must work through the Neonbox Game API.

Do not create a second console.

Do not create another canvas.

Do not replace the Neonbox controller.

Do not create an HTML game interface outside the Neonbox canvas unless explicitly requested.

The game should render using:

render(ctx,canvas)

GAME FILE
---------

Games are normally stored as:

games/<game-id>/<game-id>.js

Example:

games/tetris/tetris.js

The game should be a single JavaScript file unless the user explicitly requests additional assets/files.

GAME REGISTRATION
-----------------

Register the game with:

Neonbox.registerGame({
  id:"game-id",
  title:"Game Title",
  author:"Developer",
  version:"1.0.0",

  start(api){
    // initialize game
  },

  update(dt){
    // game logic
  },

  input(button){
    // controller input
  },

  render(ctx,canvas){
    // render game
  },

  stop(){
    // cleanup
  }
});

REQUIRED GAME PROPERTIES
------------------------

Every game should have:

id
title
author
version

and:

start()
update()
input()
render()
stop()

GAME LIFECYCLE
--------------

When the game starts:

start(api)

The Neonbox API instance is provided to the game.

Use this API instead of accessing Neonbox internals.

During gameplay:

update(dt)

is used for game logic.

Controller input:

input(button)

is called when the player presses a Neonbox button.

Rendering:

render(ctx,canvas)

draws the current game state onto the Neonbox canvas.

When the game exits:

stop()

should clean up timers, listeners, audio, and other resources.

CONTROLLER INPUT
----------------

The available button names are:

UP
DOWN
LEFT
RIGHT
A
B
START
SELECT

Normal controller input belongs to the game.

Recommended behavior:

UP
DOWN
LEFT
RIGHT
A
B
START
SELECT

should be interpreted by the individual game.

IMPORTANT:

SELECT IS NOT AN EXIT BUTTON.

Do not implement:

SELECT → Exit game

Neonbox reserves:

START + SELECT

for the Neonbox system menu.

The game should normally never handle the START + SELECT combination as an exit mechanism.

CANVAS
------

The Neonbox canvas is:

<canvas id="neonbox-screen"></canvas>

The game receives:

ctx
canvas

through:

render(ctx,canvas)

The game must render entirely inside this canvas.

Do not assume a fixed screen size.

Use:

canvas.clientWidth
canvas.clientHeight

to determine the visible game area.

Games must support different screen sizes and aspect ratios.

Use responsive scaling.

Do not assume:

430x900

or any other fixed resolution.

RENDERING
---------

The game should redraw the complete visible game state during:

render(ctx,canvas)

Do not depend on HTML elements for game graphics.

Prefer Canvas APIs:

fillRect()
strokeRect()
arc()
fillText()
drawImage()
etc.

Clear or redraw the required canvas area every frame.

Do not permanently alter Neonbox canvas transformations without restoring them.

Use:

ctx.save();

...

ctx.restore();

when changing:

- transform
- scale
- rotation
- alpha
- shadow
- clipping
- styles

VISUAL STYLE
------------

Neonbox has a futuristic neon arcade identity.

Recommended visual language:

- Dark background
- Cyan
- Blue
- Magenta
- Pink
- Purple
- Neon glow
- High contrast
- Arcade-style UI

However, games are allowed to have their own visual identity.

Do not automatically copy the Neonbox shell design into every game.

GAME STATE
----------

Keep game state inside the game object.

Example:

const state={
  score:0,
  level:1,
  paused:false,
  gameOver:false
};

Do not store game state in global variables outside the game architecture.

INPUT
-----

The input method should be simple:

input(button){

  if(button==="LEFT"){
    // move
  }

  if(button==="RIGHT"){
    // move
  }

  if(button==="A"){
    // action
  }

}

Do not use keyboard event listeners directly unless explicitly necessary.

Neonbox already translates keyboard/touch controls into the game input API.

TIMING
------

update(dt) receives elapsed time.

Do not assume that every frame is exactly 16.67ms.

Use dt for timing-sensitive gameplay.

For example:

fallTimer+=dt;

if(fallTimer>=fallDelay){
  fallTimer=0;
  dropPiece();
}

Do not create a second requestAnimationFrame loop.

Neonbox already has the main game loop.

DO NOT USE
----------

Do not create:

requestAnimationFrame()

for a separate game loop.

Do not create:

setInterval()

for the primary game loop.

Do not replace:

Neonbox.init()

Do not replace the Neonbox canvas.

Do not replace the controller system.

Do not intercept START + SELECT as a game exit command.

Do not modify neonbox.js unless explicitly instructed.

STORAGE
-------

Games may use:

api.save(key,value)
api.load(key,fallback)
api.removeSave(key)

Use storage for things such as:

- High scores
- Settings
- Unlocks
- Game progress

Use unique keys.

Recommended:

"tetris:highscore"

instead of:

"highscore"

A game should not overwrite another game's save data.

AUDIO
-----

Games may use:

api.beep(frequency,duration,type)

for simple sound effects.

Example:

api.beep(440,.08);

Do not assume advanced audio libraries are available.

VIBRATION
---------

Games may use:

api.vibrate(duration)

Example:

api.vibrate(20);

Use vibration sparingly.

GAME PAUSING
------------

START should normally be available to the game.

For games that support pausing:

START → pause/resume

The Neonbox system menu is separate.

SYSTEM MENU
-----------

Neonbox uses:

START + SELECT

for the system menu.

The system menu provides:

RESUME
RESTART
EXIT TO LIBRARY

Games must not implement their own replacement for the Neonbox system menu unless explicitly requested.

LIBRARY METADATA
----------------

A game should be added to:

games/games.json

Example:

{
  "id":"tetris",
  "title":"Neonbox Tetris",
  "author":"Neonbox",
  "version":"0.1.0",
  "script":"games/tetris/tetris.js"
}

GAME QUALITY REQUIREMENTS
-------------------------

A Neonbox game should:

1. Start reliably.
2. Render correctly on the canvas.
3. Support responsive screen sizes.
4. Handle all relevant Neonbox buttons.
5. Avoid creating a separate game loop.
6. Clean up resources in stop().
7. Avoid modifying Neonbox internals.
8. Keep game state isolated.
9. Avoid interfering with other games.
10. Work without external dependencies unless explicitly requested.

ERROR HANDLING
--------------

Avoid crashing the Neonbox runtime.

Validate important state.

Do not assume APIs or objects exist without checking when appropriate.

For example:

if(api&&typeof api.beep==="function"){
  api.beep(440,.05);
}

PERFORMANCE
-----------

Target smooth gameplay.

Avoid unnecessarily allocating large objects every frame.

Avoid excessive canvas effects.

Use efficient collision detection and rendering.

Do not perform expensive operations repeatedly inside render() unless necessary.

GAME DESIGN
-----------

When designing a game:

First define:

- Core gameplay
- Controls
- Game state
- Win/lose conditions
- Scoring
- Progression

Then implement the smallest playable version.

Do not attempt to implement every feature at once.

DEVELOPMENT PROCESS
-------------------

Develop games incrementally.

Recommended order:

1. Game shell
2. Canvas UI
3. Input
4. Core gameplay
5. Collision / rules
6. Scoring
7. Game states
8. Audio
9. Effects
10. Save data
11. Polish

FIRST PLAYABLE VERSION
----------------------

The first version should prioritize:

PLAYABILITY

over:

VISUAL POLISH

After the game works correctly, improve:

- Graphics
- Animations
- Effects
- Audio
- Menus
- Accessibility
- Responsiveness

WHEN ASKED TO CREATE A GAME
---------------------------

When the user asks:

"Create a Neonbox game"

you should:

1. Identify the game concept.
2. Define controls.
3. Define game state.
4. Create the game file.
5. Register the game with Neonbox.
6. Implement start().
7. Implement update().
8. Implement input().
9. Implement render().
10. Implement stop().
11. Provide the games.json entry.
12. Explain where each file goes.
13. Test the architecture conceptually.
14. Avoid modifying Neonbox core unless required.

OUTPUT FORMAT
-------------

When asked for a complete game, provide:

FILE 1:
games/<game-id>/<game-id>.js

FILE 2:
games/games.json

If games.json already exists, provide the updated complete version when requested.

If additional assets are required, clearly list them.

Do not silently create dependencies.

IMPORTANT
---------

Neonbox is a platform.

The game is a plugin/application running on that platform.

Think:

Neonbox OS
     ↓
Game API
     ↓
Game
     ↓
Gameplay

NOT:

Game
     ↓
Custom console
     ↓
Custom controller
     ↓
Custom canvas

The console should remain reusable for every Neonbox game.

CURRENT DEVELOPMENT TARGET
---------------------------

The first official game being developed for Neonbox is TETRIS.

Tetris controls:

LEFT    → Move left
RIGHT   → Move right
DOWN    → Soft drop
UP      → Rotate

A       → Rotate
B       → Hard drop

SELECT  → Hold
START   → Pause / Resume

START + SELECT
        ↓
Neonbox System Menu

Tetris should be implemented as:

games/tetris/tetris.js

and registered through the Neonbox API.

END OF NEONBOX GAME DEVELOPER PROMPT
