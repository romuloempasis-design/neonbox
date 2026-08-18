# NEONBOX TETRIS

## PROJECT

Neonbox is a browser-based handheld game console platform. The console is separate from individual games. Games are loaded as independent JavaScript files through the Neonbox Game API.

Repository:
https://github.com/romuloempasis-design/neonbox

Tetris is the first official Neonbox game.

## ARCHITECTURE

- Neonbox OS/console remains separate from games.
- Tetris remains an independent game.
- Do not put Tetris-specific logic into the console.
- Use the Neonbox Game API for console functionality.
- Future developers must be able to create games using the same API.
- Avoid breaking existing games or console behavior.
- Prefer reusable API improvements over game-specific hacks.

## CURRENT VERSION

Tetris v0.4.0

## FEATURES

- Neonbox Tetris title/start screen
- 10x20 board
- Seven tetrominoes: I, O, T, S, Z, J, L
- 7-bag randomizer
- Piece rotation
- Basic wall kicks
- Left/right movement
- Soft drop
- Hard drop
- Ghost piece
- Hold piece
- Next piece
- Score
- High score
- Lines
- Levels
- Increasing drop speed
- Line clearing
- Pause
- Game over
- Restart
- Neon visual styling
- Screen shake
- Sound/vibration API integration
- Neonbox title/header
- Separate game registration
- More visible ghost piece

## CONTROLS

UP = Hard Drop
LEFT = Move Left + Repeat
RIGHT = Move Right + Repeat
DOWN = Soft Drop + Repeat
A = Rotate
B = Hold
SELECT = Reserved for future development
START = Pause / Restart

IMPORTANT:

SELECT is NOT an exit button.

The Neonbox console may reserve START + SELECT as the system/menu combination.

Tetris must not interpret SELECT as an exit command.

## V0.4 CONTROLLER/GAME FEEL

Primary goal:

Implement reusable held-button/repeat input through the Neonbox Game API.

Required behavior:

- LEFT moves immediately on press.
- RIGHT moves immediately on press.
- DOWN soft-drops immediately on press.
- Holding LEFT repeatedly moves left.
- Holding RIGHT repeatedly moves right.
- Holding DOWN repeatedly soft-drops.
- Initial action occurs immediately.
- Repeat begins after a configurable delay.
- Repeat uses a configurable interval.
- Releasing immediately stops repetition.
- A remains a single-action button.
- B remains a single-action button.
- SELECT remains a single-action/reserved button.
- START remains a single-action button.
- Touch and physical/controller input use the same input system.

Suggested API:

Neonbox.input.onPress(...)
Neonbox.input.onRelease(...)
Neonbox.input.isDown(...)
Neonbox.input.setRepeat(...)

Before changing the API, inspect the existing Neonbox API.

Do not blindly replace existing input behavior.

Preserve backwards compatibility.

## INPUT ARCHITECTURE

Held-button/repeat functionality belongs in the Neonbox API because it is useful to future games.

Do NOT implement a Tetris-specific keyboard/touch repeat loop.

The console/API should normalize physical and touch/controller input into the same button state.

Tetris should only consume the resulting Neonbox input events/state.

## API CHANGE RULE

When changing the Neonbox API:

1. Update neonbox.js
2. Update api.md
3. Update README.md if relevant
4. Update games/tetris/tetris.js
5. Preserve existing API behavior
6. Do not break existing games

When changing Tetris only:

1. Update games/tetris/tetris.js
2. Update games/games.json version

## DEVELOPMENT ORDER

1. Held-button/repeat controls
2. Better lock delay
3. More accurate wall kicks
4. Combo system
5. Back-to-back Tetris bonus
6. T-spin detection
7. Line-clear animation
8. Level-up feedback
9. Better sound effects
10. Game-over animation
11. High-score celebration
12. Final responsive/mobile polish

## LINE CLEAR

Completed lines must be detected reliably.

Line clearing must never leave partially cleared rows.

When implementing the final line-clear animation:

1. Detect all completed rows.
2. Preserve their indexes.
3. Animate the exact completed rows.
4. Prevent piece movement during the animation.
5. Remove completed rows after the animation.
6. Collapse the board.
7. Spawn the next piece.
8. Update score, lines and level correctly.

## UI STYLE

- Dark futuristic handheld display
- Neon cyan
- Neon magenta
- Electric blue
- Bright colored tetrominoes
- CRT/arcade-inspired appearance
- No browser UI inside the game
- Everything rendered inside the game canvas
- Avoid selectable HTML text
- Optimized for mobile portrait screens

## CODE STYLE

- Compact JavaScript
- No unnecessary dependencies
- No frameworks
- Self-contained game logic
- Use Neonbox API for system functionality
- Keep code readable
- Full replacement files for major changes
- Never provide incomplete files when FULL CODE is requested

## FILE STRUCTURE

neonbox/
├── index.html
├── neonbox.js
├── neonbox.css
├── api.md
├── README.md
└── games/
    ├── games.json
    └── tetris/
        └── tetris.js

## GAME MANIFEST

games/games.json

{
  "id":"tetris",
  "title":"Neonbox Tetris",
  "author":"Neonbox",
  "version":"0.4.0",
  "script":"games/tetris/tetris.js"
}

## TESTING

Test all changes on:

- Desktop keyboard
- Touch controls
- Mobile portrait
- Small screens
- Start screen
- Pause
- Restart
- Hold
- Next piece
- Game over
- High score
- Line clearing
- Level progression
- Held LEFT
- Held RIGHT
- Held DOWN
- Release behavior
- START + SELECT system menu behavior

## DO NOT

- Merge Tetris into index.html
- Make Tetris the console
- Use SELECT as an exit button
- Add browser alert()
- Add unnecessary libraries
- Break the Neonbox API
- Create Tetris-only solutions for reusable functionality
- Replace existing files with incomplete snippets
- Remove existing API behavior without compatibility support

## DEVELOPMENT COMMANDS

When the user says NEXT:

Continue with the next feature in the development order.

When the user says FULL CODE:

Provide the complete contents of every file that must be replaced, clearly labeled by filename.

When the user says COMPACT MODE:

Keep explanations short and prioritize complete, directly usable code.

When changing architecture:

Explain why the architecture change is necessary before implementing it.