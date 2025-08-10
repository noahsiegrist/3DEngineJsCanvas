# 3DEngineJsCanvas
This project explores how a simple 3D engine works using only the HTML5 Canvas API (no external rendering libraries).

## Features
- Pure JavaScript Canvas
- Full-screen rendering that adapts to window size and device pixel ratio
- Pointer lock for mouse look with a pause/escape overlay
- Keyboard and touch controls (desktop and mobile)

## Controls
### Desktop
- Click the canvas to start (enables pointer lock and hides the mouse)
- WASD or Arrow keys to move
- Move the mouse to look around
- Press Esc to pause: canvas blurs, the mouse returns, and instructions are shown

### Mobile
- Drag on the left half of the screen to move (up/down = forward/back, left/right = strafe)
- Drag on the right half to look around
- Use the Pause button (top-right) to show the menu/overlay

## Demo
Visit: https://3djs.netlify.app/

## Run locally
- Clone the repo and open `index.html` in a modern browser (no build step required)

## Project structure
- `config.js`: global settings (screen size, FOV, speeds)
- `shim.js`: minimal canvas/input loop, pointer lock, overlay, and touch handling
- `core.js`: core math and camera classes
- `objects.js`: renderable objects (cube, sphere, surface)
- `main.js`: scene setup and per-frame update/draw
