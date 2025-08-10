// Minimal p5.js-like shim for canvas, input, and loop
let canvas, ctx;
let mouseX = 0, mouseY = 0;
let startMouseX = 0, startMouseY = 0;
let mouseDX = 0, mouseDY = 0; // accumulated deltas when pointer-locked
const keysDown = new Set();
let overlayEl;
let isPointerLocked = false;
// Touch controls
let moveTouchId = null, moveStartX = 0, moveStartY = 0;
let moveVecX = 0, moveVecY = 0; // normalized -1..1
let lookTouchId = null, lookPrevX = 0, lookPrevY = 0;
let touchLookDX = 0, touchLookDY = 0; // accumulate like pointer-lock
let pauseBtn;

function createCanvas(width, height) {
  canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  canvas.style.position = 'fixed';
  canvas.style.left = '0';
  canvas.style.top = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.touchAction = 'none'; // prevent browser gestures
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#000';
  resizeCanvasToWindow();
}

function resizeCanvasToWindow() {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const w = Math.floor(window.innerWidth * dpr);
  const h = Math.floor(window.innerHeight * dpr);
  canvas.width = w;
  canvas.height = h;
  // update globals driving projection
  if (typeof screenWidth !== 'undefined') {
    screenWidth = w;
  }
  if (typeof screenHight !== 'undefined') {
    screenHight = h;
  }
  if (typeof fovAngle !== 'undefined') {
    fov = Math.tan(fovAngle/2) * screenWidth / 2;
  }
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

let fillEnabled = true;
let currentFillStyle = 'rgb(0,0,0)';

function noFill() {
  fillEnabled = false;
}

function fill(r, g, b, a) {
  fillEnabled = true;
  if (arguments.length === 1) {
    const v = Math.max(0, Math.min(255, r|0));
    currentFillStyle = `rgb(${v},${v},${v})`;
  } else {
    const rr = Math.max(0, Math.min(255, r|0));
    const gg = Math.max(0, Math.min(255, g|0));
    const bb = Math.max(0, Math.min(255, b|0));
    if (typeof a === 'number') {
      const aa = Math.max(0, Math.min(255, a)) / 255;
      currentFillStyle = `rgba(${rr},${gg},${bb},${aa})`;
    } else {
      currentFillStyle = `rgb(${rr},${gg},${bb})`;
    }
  }
}

function triangle(x1, y1, x2, y2, x3, y3) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  if (fillEnabled) {
    ctx.fillStyle = currentFillStyle;
    ctx.fill();
  }
  ctx.stroke();
}

function clear() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function print(...args) {
  console.log(...args);
}

function keyIsDown(code) {
  return keysDown.has(code);
}

const RIGHT_ARROW = 39;
const LEFT_ARROW = 37;
const UP_ARROW = 38;
const DOWN_ARROW = 40;
const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;
const KEY_D = 68;

window.addEventListener('keydown', (e) => {
  keysDown.add(e.keyCode || e.which);
});
window.addEventListener('keyup', (e) => {
  keysDown.delete(e.keyCode || e.which);
});

window.addEventListener('mousemove', (e) => {
  if (!canvas) return;
  if (isPointerLocked) {
    mouseDX += e.movementX || 0;
    mouseDY += e.movementY || 0;
  } else {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }
});

function requestLock() {
  if (!canvas) return;
  if (document.pointerLockElement === canvas) return;
  canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
  canvas.requestPointerLock();
}

window.addEventListener('mousedown', () => {
  requestLock();
  if (typeof window.mousePressed === 'function') {
    window.mousePressed();
  }
});

function onPointerLockChange() {
  isPointerLocked = (document.pointerLockElement === canvas);
  if (isPointerLocked) {
    hideOverlay();
    canvas.style.filter = '';
  } else {
    showOverlay();
    canvas.style.filter = 'blur(6px)';
  }
}

function onPointerLockError() {
  // If locking fails, show overlay so user can try again
  showOverlay();
}

document.addEventListener('pointerlockchange', onPointerLockChange);
document.addEventListener('mozpointerlockchange', onPointerLockChange);
document.addEventListener('pointerlockerror', onPointerLockError);
document.addEventListener('mozpointerlockerror', onPointerLockError);

window.addEventListener('resize', resizeCanvasToWindow);

window.addEventListener('keydown', (e) => {
  // Handle escape to exit lock and show overlay
  const code = e.keyCode || e.which;
  if (code === 27) {
    if (document.pointerLockElement === canvas) {
      document.exitPointerLock();
    }
  }
});

window.addEventListener('load', () => {
  // Build overlay with instructions
  overlayEl = document.createElement('div');
  overlayEl.style.position = 'fixed';
  overlayEl.style.inset = '0';
  overlayEl.style.display = 'flex';
  overlayEl.style.alignItems = 'center';
  overlayEl.style.justifyContent = 'center';
  overlayEl.style.background = 'rgba(0,0,0,0.45)';
  overlayEl.style.color = 'white';
  overlayEl.style.zIndex = '10';
  overlayEl.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  overlayEl.style.textAlign = 'center';
  overlayEl.style.padding = '24px';
  const panel = document.createElement('div');
  panel.style.maxWidth = '720px';
  panel.style.backdropFilter = 'blur(6px)';
  panel.style.background = 'rgba(0,0,0,0.35)';
  panel.style.border = '1px solid rgba(255,255,255,0.15)';
  panel.style.borderRadius = '12px';
  panel.style.padding = '24px 28px';
  panel.innerHTML = '<h2 style="margin:0 0 8px 0;font-weight:600;">3D Engine</h2>' +
    '<div style="opacity:0.9;font-size:14px;line-height:1.5">' +
    'Click to resume. Press Esc to pause and show this menu.<br/>' +
    'WASD or Arrow keys to move. Move mouse to look around.<br/>' +
    'On touch: drag left to move, drag right to look.' +
    '</div>';
  overlayEl.appendChild(panel);
  overlayEl.addEventListener('click', () => {
    // Try pointer lock; if not available, just hide overlay
    try { requestLock(); } catch (_) {}
    hideOverlay();
    canvas.style.filter = '';
  });
  document.body.appendChild(overlayEl);

  // Pause button for mobile/desktop
  pauseBtn = document.createElement('button');
  pauseBtn.textContent = 'Pause';
  pauseBtn.style.position = 'fixed';
  pauseBtn.style.top = '12px';
  pauseBtn.style.right = '12px';
  pauseBtn.style.zIndex = '11';
  pauseBtn.style.padding = '8px 12px';
  pauseBtn.style.borderRadius = '8px';
  pauseBtn.style.border = '1px solid rgba(255,255,255,0.2)';
  pauseBtn.style.background = 'rgba(0,0,0,0.4)';
  pauseBtn.style.color = 'white';
  pauseBtn.style.fontFamily = 'inherit';
  pauseBtn.style.cursor = 'pointer';
  pauseBtn.addEventListener('click', () => {
    showOverlay();
    canvas.style.filter = 'blur(6px)';
    if (document.pointerLockElement === canvas) {
      document.exitPointerLock();
    }
  });
  document.body.appendChild(pauseBtn);

  if (typeof window.setup === 'function') {
    window.setup();
  }
  const loop = () => {
    if (typeof window.draw === 'function') {
      window.draw();
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
});

function showOverlay() {
  if (overlayEl) overlayEl.style.display = 'flex';
}
function hideOverlay() {
  if (overlayEl) overlayEl.style.display = 'none';
}

// Expose menu visibility check
window.isMenuVisible = function() {
  return overlayEl && overlayEl.style.display !== 'none';
}

// Touch controls
function handleTouchStart(e) {
  if (!canvas) return;
  e.preventDefault();
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i];
    const rect = canvas.getBoundingClientRect();
    const x = t.clientX - rect.left;
    const y = t.clientY - rect.top;
    const isLeft = x < rect.width / 2;
    if (isLeft && moveTouchId === null) {
      moveTouchId = t.identifier;
      moveStartX = x;
      moveStartY = y;
      moveVecX = 0; moveVecY = 0;
    } else if (!isLeft && lookTouchId === null) {
      lookTouchId = t.identifier;
      lookPrevX = x;
      lookPrevY = y;
    }
  }
}

function handleTouchMove(e) {
  if (!canvas) return;
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i];
    const x = t.clientX - rect.left;
    const y = t.clientY - rect.top;
    if (t.identifier === moveTouchId) {
      const dx = x - moveStartX;
      const dy = y - moveStartY;
      const radius = 60; // pixels for full deflection
      moveVecX = Math.max(-1, Math.min(1, dx / radius));
      moveVecY = Math.max(-1, Math.min(1, dy / radius));
    }
    if (t.identifier === lookTouchId) {
      touchLookDX += (x - lookPrevX);
      touchLookDY += (y - lookPrevY);
      lookPrevX = x;
      lookPrevY = y;
    }
  }
}

function handleTouchEnd(e) {
  if (!canvas) return;
  e.preventDefault();
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i];
    if (t.identifier === moveTouchId) {
      moveTouchId = null;
      moveVecX = 0; moveVecY = 0;
    }
    if (t.identifier === lookTouchId) {
      lookTouchId = null;
    }
  }
}

canvas?.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas?.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas?.addEventListener('touchend', handleTouchEnd, { passive: false });
canvas?.addEventListener('touchcancel', handleTouchEnd, { passive: false });


