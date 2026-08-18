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

Tetris v0.5.2

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
- Hold limited to once per spawned piece
- Next piece
- Score
- High score persistence
- Lines
- Levels
- Increasing drop speed
- Reliable line detection
- Immediate completed-row removal
- Line-clear flash effect
- Board collapse after line clear
- Lock delay
- Lock-delay reset on movement
- Limited lock-delay resets
- Pause
- Game over
- Restart
- Neon visual styling
- Screen shake
- Sound API integration
- Vibration API integration
- Neonbox title/header
- Separate game registration
- Visible ghost piece
- Responsive canvas rendering
- Mobile-oriented portrait layout

## CONTROLS

UP = Hard Drop
LEFT = Move Left
RIGHT = Move Right
DOWN = Soft Drop
A = Rotate
B = Hold
SELECT = Reserved for future development
START = Pause / Restart

IMPORTANT:

SELECT is NOT an exit button.

The Neonbox console may reserve START + SELECT as the system/menu combination.

Tetris must not interpret SELECT as an exit command.

## CONTROLLER / GAME FEEL

Primary goal:

Provide responsive arcade-style Tetris controls while keeping reusable held-button/repeat behavior in the Neonbox API.

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
- SELECT remains a reserved button.
- START remains a single-action button.
- Touch and physical/controller input should use the same input system.

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

Current Tetris game input remains compatible with the Neonbox input(button) interface.

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
3. Update this tetris.md when gameplay behavior or architecture changes

## DEVELOPMENT ORDER

1. Held-button/repeat controls
2. More accurate wall kicks
3. Combo system
4. Back-to-back Tetris bonus
5. T-spin detection
6. Improved line-clear animation
7. Level-up feedback
8. Better sound effects
9. Game-over animation
10. High-score celebration
11. Final responsive/mobile polish

## LOCK DELAY

Tetris uses a lock-delay system.

Current behavior:

- A piece does not immediately lock when it touches the floor.
- Grounded pieces receive a short lock-delay window.
- Moving a grounded piece can reset the lock timer.
- Rotating a grounded piece can reset the lock timer.
- Lock-delay resets are limited to prevent infinite stalling.
- Hard drop locks the piece immediately.
- Soft drop remains responsive while grounded.

Lock-delay behavior should remain game-specific.

Reusable input timing belongs in the Neonbox API.

## HOLD SYSTEM

Hold behavior:

- B stores the current piece.
- If HOLD is empty, the current piece is stored and the next piece is spawned.
- If HOLD already contains a piece, the current and held pieces are swapped.
- A held piece is spawned from the top of the board.
- HOLD can only be used once per spawned piece.
- HOLD becomes available again when the next piece is spawned.
- HOLD cannot be used while paused.
- HOLD cannot be used during line-clear processing.
- HOLD cannot be used after game over.

The hold system must not allow repeated swapping of the same piece without spawning a new piece.

## LINE CLEAR

Completed lines must be detected reliably.

Line clearing must never leave stale completed rows in the active board state.

### Current implementation

When a piece locks:

1. Write the piece into the board.
2. Scan every board row.
3. Detect every completely filled row.
4. Store the indexes of all completed rows.
5. Update score, lines and level.
6. Remove the completed rows immediately from the board state.
7. Add empty rows at the top.
8. Start the visual line-clear flash.
9. Prevent gameplay while the flash is active.
10. After the flash finishes, spawn the next piece.

IMPORTANT:

The completed rows are removed from board immediately.

The flashRows array is now visual-only.

It must NOT be used to perform the actual board removal later.

This prevents stale completed rows from causing a phantom line clear when the next piece lands.

### LINE-CLEAR INVARIANTS

After lock() finishes its board update:

- board.length must equal rows.
- Every board row must contain exactly cols cells.
- No completed row should remain in the board after being detected.
- A subsequent piece must interact only with the already-collapsed board.
- A line may only clear when all cells in that row are actually occupied.

Never remove rows twice.

Never reuse stale flashRows to mutate the board.

## SCORING

Current line scoring:

- Single = 100 × level
- Double = 300 × level
- Triple = 500 × level
- Tetris = 800 × level

Hard drop:

- 2 points per dropped row

Soft drop:

- 1 point per dropped row

Level:

level = floor(lines / 10) + 1

Drop delay:

max(70ms, 800ms - ((level - 1) × 60ms))

Future scoring systems such as combos and back-to-back bonuses should be added without breaking the existing scoring behavior unless intentionally documented.

## GAME STATE

Tetris uses the following major states:

title
playing
paused
game over

Additional temporary gameplay state:

line-clear flash

During line-clear flash:

- Player movement is disabled.
- Rotation is disabled.
- Hold is disabled.
- Drop input is disabled.
- Automatic falling is disabled.
- Board state is already collapsed.
- The next piece is spawned only after the flash completes.

## SPAWN / GAME OVER

When spawning a piece:

1. Use next as the current piece.
2. Generate a new next piece.
3. Center the current piece.
4. Reset drop timer.
5. Reset lock timer.
6. Reset lock-delay reset count.
7. Restore HOLD availability.
8. Check for collision.

If the newly spawned piece immediately collides with the board:

- Set gameOver = true.
- Preserve the board.
- Save the high score.
- Do not spawn additional pieces.

## RANDOMIZER

Tetris uses a 7-bag randomizer.

The bag contains:

I
O
T
S
Z
J
L

Each bag is shuffled before pieces are consumed.

A new bag is generated only after the current bag is empty.

Do not replace this with unrestricted random piece selection unless intentionally redesigning the game.

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
- Compact HUD
- NEXT panel
- HOLD panel
- SCORE display
- HIGH SCORE display
- LINES display
- LEVEL display
- Ghost piece visualization
- Pause overlay
- Game-over overlay

## CODE STYLE

- Compact JavaScript
- No unnecessary dependencies
- No frameworks
- Self-contained game logic
- Use Neonbox API for system functionality
- Keep code readable
- Full replacement files for major changes
- Never provide incomplete files when FULL CODE is requested
- Avoid unnecessary abstraction inside the game
- Keep board mutation deterministic
- Prefer explicit state transitions over delayed implicit state changes

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
  "version":"0.5.2",
  "script":"games/tetris/tetris.js"
}

The manifest version must match the current Tetris version.

## TESTING

Test all changes on:

### Core gameplay

- Desktop keyboard
- Touch controls
- Mobile portrait
- Small screens
- Start screen
- Start game
- Pause
- Resume
- Restart
- Hold
- Next piece
- Game over
- High score
- Score
- Lines
- Level progression
- Increasing drop speed

### Movement

- LEFT
- RIGHT
- DOWN
- UP hard drop
- Rotation
- Wall kicks
- Ghost piece
- Grounded movement
- Lock delay
- Lock-delay reset
- Maximum lock-delay resets

### Hold

- Hold empty slot
- Swap with existing hold
- HOLD once per piece
- HOLD unavailable until next spawn
- HOLD while grounded
- HOLD during line-clear flash
- HOLD while paused
- HOLD after game over

### Line clearing

- Single line
- Double line
- Triple line
- Tetris
- Multiple rows cleared simultaneously
- Rows near the top
- Rows near the bottom
- Consecutive line clears
- Line clear followed immediately by hard drop
- Line clear followed by normal gravity
- No completed line must produce a clear
- Partial rows must never disappear
- Previously cleared rows must never clear again
- Board must remain exactly 20 rows after clearing
- Next piece must interact with the collapsed board correctly

### Input

- Held LEFT
- Held RIGHT
- Held DOWN
- Immediate initial action
- Repeat delay
- Repeat interval
- Release behavior
- A single action
- B single action
- SELECT reserved
- START single action
- START + SELECT system menu behavior

## LINE-CLEAR REGRESSION TEST

This test specifically protects against the previous phantom-clear bug.

Scenario:

1. Complete one or more lines.
2. Lock the piece.
3. Verify completed rows are immediately removed from board.
4. Verify empty rows are inserted at the top.
5. Wait for the flash animation.
6. Spawn the next piece.
7. Drop the next piece without completing another line.
8. Verify no line-clear event occurs.
9. Verify the board remains unchanged except for the newly locked piece.
10. Repeat with single, double, triple and Tetris clears.

Expected result:

A line can only clear when the current board actually contains a fully occupied row.

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
- Remove completed rows twice
- Keep completed rows in the active board during line-clear processing
- Use visual flashRows as the source of truth for board mutation
- Allow HOLD to be used repeatedly for the same spawned piece
- Allow gameplay input during line-clear flash
- Allow stale line-clear state to affect the next piece

## DEVELOPMENT COMMANDS

When the user says NEXT:

Continue with the next feature in the development order.

When the user says FULL CODE:

Provide the complete contents of every file that must be replaced, clearly labeled by filename.

When the user says COMPACT MODE:

Keep explanations short and prioritize complete, directly usable code.

When changing architecture:

Explain why the architecture change is necessary before implementing it.

When fixing a gameplay bug:

Prefer fixing the underlying state-management problem instead of adding visual or timing workarounds.

When updating Tetris behavior:

Update the version and relevant documentation.

## VERSION HISTORY

### v0.5.2

- Fixed phantom line clears.
- Completed rows are removed immediately after detection.
- flashRows is visual-only.
- Board is collapsed before the next piece can interact with it.
- Added lock delay.
- Added limited lock-delay resets.
- Improved grounded movement behavior.
- Improved spawn-state reset.
- Improved game-over handling.
- Preserved HOLD, NEXT, ghost piece and 7-bag behavior.

### v0.4.0

- Added/updated HOLD.
- Added NEXT piece.
- Added ghost piece.
- Added line clearing.
- Added scoring.
- Added levels.
- Added high score.
- Added pause/restart.
- Added neon arcade presentation.
- Added sound/vibration API integration.