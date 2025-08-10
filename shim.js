// Minimal p5.js-like shim for canvas, input, and loop
let canvas, ctx;
let mouseX = 0, mouseY = 0;
let startMouseX = 0, startMouseY = 0;
const keysDown = new Set();

function createCanvas(width, height) {
  canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#000';
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

window.addEventListener('keydown', (e) => {
  keysDown.add(e.keyCode || e.which);
});
window.addEventListener('keyup', (e) => {
  keysDown.delete(e.keyCode || e.which);
});

window.addEventListener('mousemove', (e) => {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

window.addEventListener('mousedown', () => {
  if (typeof window.mousePressed === 'function') {
    window.mousePressed();
  }
});

window.addEventListener('load', () => {
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


