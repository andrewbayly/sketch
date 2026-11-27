// Blobs: soft-body blobs that roll around as you tilt the phone.
// Each blob is a ring of point masses (Verlet integration) held together by
// distance constraints along the rim plus an area ("pressure") constraint.

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

let W = 0, H = 0, DPR = 1;
const SUBSTEPS = 4;
const ITERATIONS = 6;
const N = 24;               // points per blob
const MAX_BLOBS = 12;
const G_STRENGTH = 2200;    // px / s^2 at full tilt

let gravity = { x: 0, y: 1 };      // unit-ish vector in screen space (y down)
let hasTilt = false;
const blobs = [];

// ---------- Blob ----------

class Blob {
  constructor(x, y, r, hue) {
    this.r = r;
    this.hue = hue;
    this.pts = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      this.pts.push({ x: px, y: py, px: px, py: py });
    }
    this.edge = 2 * r * Math.sin(Math.PI / N);
    this.skip = 2 * r * Math.sin((2 * Math.PI) / N);
    this.restArea = this.area();
    this.cx = x; this.cy = y;
    this.vx = 0; this.vy = 0;
    this.blink = Math.random() * 4;
    this.updateBounds();
  }

  area() {
    let a = 0;
    const p = this.pts;
    for (let i = 0; i < N; i++) {
      const q = p[i], s = p[(i + 1) % N];
      a += q.x * s.y - s.x * q.y;
    }
    return a / 2;
  }

  updateBounds() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of this.pts) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    this.minX = minX; this.minY = minY; this.maxX = maxX; this.maxY = maxY;
  }

  centroid() {
    let x = 0, y = 0;
    for (const p of this.pts) { x += p.x; y += p.y; }
    return { x: x / N, y: y / N };
  }

  contains(x, y) {
    if (x < this.minX || x > this.maxX || y < this.minY || y > this.maxY) return false;
    let inside = false;
    const p = this.pts;
    for (let i = 0, j = N - 1; i < N; j = i++) {
      const a = p[i], b = p[j];
      if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) {
        inside = !inside;
      }
    }
    return inside;
  }
}

// ---------- Physics ----------

function integrate(h) {
  const gx = gravity.x * G_STRENGTH * h * h;
  const gy = gravity.y * G_STRENGTH * h * h;
  const damping = 0.995;
  for (const b of blobs) {
    for (const p of b.pts) {
      if (p.held) continue;
      const vx = (p.x - p.px) * damping;
      const vy = (p.y - p.py) * damping;
      p.px = p.x; p.py = p.y;
      p.x += vx + gx;
      p.y += vy + gy;
    }
  }
}

function satisfyDistance(a, b, rest, k) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const d = Math.hypot(dx, dy) || 0.0001;
  const diff = ((d - rest) / d) * 0.5 * k;
  const ox = dx * diff, oy = dy * diff;
  if (!a.held) { a.x += ox; a.y += oy; }
  if (!b.held) { b.x -= ox; b.y -= oy; }
}

function shapeConstraints(b) {
  const p = b.pts;
  for (let i = 0; i < N; i++) {
    satisfyDistance(p[i], p[(i + 1) % N], b.edge, 1.0);
    satisfyDistance(p[i], p[(i + 2) % N], b.skip, 0.35);
  }
  // Pressure: push every rim point along its normal to restore the area.
  let perim = 0;
  for (let i = 0; i < N; i++) {
    const q = p[i], s = p[(i + 1) % N];
    perim += Math.hypot(s.x - q.x, s.y - q.y);
  }
  const dilation = ((b.restArea - b.area()) / perim) * 0.9;
  for (let i = 0; i < N; i++) {
    const prev = p[(i + N - 1) % N], next = p[(i + 1) % N];
    let nx = next.y - prev.y, ny = -(next.x - prev.x);
    const len = Math.hypot(nx, ny) || 1;
    nx /= len; ny /= len;
    const q = p[i];
    if (!q.held) { q.x += nx * dilation; q.y += ny * dilation; }
  }
}

function walls(b) {
  const pad = 2;
  const friction = 0.6;
  for (const p of b.pts) {
    if (p.x < pad) { p.x = pad; p.py = p.y - (p.y - p.py) * friction; }
    else if (p.x > W - pad) { p.x = W - pad; p.py = p.y - (p.y - p.py) * friction; }
    if (p.y < pad) { p.y = pad; p.px = p.x - (p.x - p.px) * friction; }
    else if (p.y > H - pad) { p.y = H - pad; p.px = p.x - (p.x - p.px) * friction; }
  }
}

// Push any rim point of one blob that sits inside another blob back out
// through the nearest edge, splitting the correction between both blobs.
function collide(a, b) {
  if (a.maxX < b.minX || b.maxX < a.minX || a.maxY < b.minY || b.maxY < a.minY) return;
  const bp = b.pts;
  for (const p of a.pts) {
    if (!b.contains(p.x, p.y)) continue;
    let best = Infinity, bi = 0, bt = 0, bcx = 0, bcy = 0;
    for (let i = 0; i < N; i++) {
      const e0 = bp[i], e1 = bp[(i + 1) % N];
      const ex = e1.x - e0.x, ey = e1.y - e0.y;
      const L2 = ex * ex + ey * ey || 0.0001;
      let t = ((p.x - e0.x) * ex + (p.y - e0.y) * ey) / L2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const cx = e0.x + ex * t, cy = e0.y + ey * t;
      const d = (cx - p.x) ** 2 + (cy - p.y) ** 2;
      if (d < best) { best = d; bi = i; bt = t; bcx = cx; bcy = cy; }
    }
    const dx = bcx - p.x, dy = bcy - p.y;
    const e0 = bp[bi], e1 = bp[(bi + 1) % N];
    if (!p.held) { p.x += dx * 0.5; p.y += dy * 0.5; }
    if (!e0.held) { e0.x -= dx * 0.5 * (1 - bt); e0.y -= dy * 0.5 * (1 - bt); }
    if (!e1.held) { e1.x -= dx * 0.5 * bt; e1.y -= dy * 0.5 * bt; }
  }
}

function step(dt) {
  const h = dt / SUBSTEPS;
  for (let s = 0; s < SUBSTEPS; s++) {
    applyDrag();
    integrate(h);
    for (let it = 0; it < ITERATIONS; it++) {
      for (const b of blobs) { shapeConstraints(b); walls(b); }
    }
    for (const b of blobs) b.updateBounds();
    for (let i = 0; i < blobs.length; i++) {
      for (let j = 0; j < blobs.length; j++) {
        if (i !== j) collide(blobs[i], blobs[j]);
      }
    }
    for (const b of blobs) walls(b);
  }
  for (const b of blobs) {
    b.updateBounds();
    const c = b.centroid();
    b.vx = b.vx * 0.8 + (c.x - b.cx) * 0.2;
    b.vy = b.vy * 0.8 + (c.y - b.cy) * 0.2;
    b.cx = c.x; b.cy = c.y;
    b.blink -= dt;
    if (b.blink < -0.12) b.blink = 2 + Math.random() * 4;
  }
}

// ---------- Drawing ----------

function drawBlob(b) {
  const p = b.pts;
  ctx.beginPath();
  const m0x = (p[N - 1].x + p[0].x) / 2, m0y = (p[N - 1].y + p[0].y) / 2;
  ctx.moveTo(m0x, m0y);
  for (let i = 0; i < N; i++) {
    const q = p[i], s = p[(i + 1) % N];
    ctx.quadraticCurveTo(q.x, q.y, (q.x + s.x) / 2, (q.y + s.y) / 2);
  }
  ctx.closePath();
  const grad = ctx.createRadialGradient(
    b.cx - b.r * 0.35, b.cy - b.r * 0.4, b.r * 0.1, b.cx, b.cy, b.r * 1.3);
  grad.addColorStop(0, `hsl(${b.hue}, 85%, 78%)`);
  grad.addColorStop(1, `hsl(${b.hue}, 70%, 52%)`);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = Math.max(2, b.r * 0.06);
  ctx.strokeStyle = `hsl(${b.hue}, 60%, 30%)`;
  ctx.stroke();

  // Face: "up" is the opposite of gravity, so faces stay upright as you tilt.
  const gl = Math.hypot(gravity.x, gravity.y) || 1;
  const ux = -gravity.x / gl, uy = -gravity.y / gl;
  const rx = -uy, ry = ux;
  const scale = Math.sqrt(Math.max(0.3, b.area() / b.restArea));
  const r = b.r * scale;
  const look = Math.min(1, Math.hypot(b.vx, b.vy) / 6);
  const la = Math.atan2(b.vy, b.vx);
  const lx = Math.cos(la) * look, ly = Math.sin(la) * look;

  for (const side of [-1, 1]) {
    const ex = b.cx + rx * side * r * 0.3 + ux * r * 0.18;
    const ey = b.cy + ry * side * r * 0.3 + uy * r * 0.18;
    if (b.blink < 0) {
      ctx.beginPath();
      ctx.moveTo(ex - rx * r * 0.13, ey - ry * r * 0.13);
      ctx.lineTo(ex + rx * r * 0.13, ey + ry * r * 0.13);
      ctx.lineWidth = Math.max(2, r * 0.05);
      ctx.strokeStyle = '#222';
      ctx.stroke();
      continue;
    }
    ctx.beginPath();
    ctx.arc(ex, ey, r * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex + lx * r * 0.07, ey + ly * r * 0.07, r * 0.075, 0, Math.PI * 2);
    ctx.fillStyle = '#222';
    ctx.fill();
  }
  // Mouth: opens into an "o" when moving fast.
  const mx = b.cx - ux * r * 0.2, my = b.cy - uy * r * 0.2;
  ctx.beginPath();
  if (look > 0.7) {
    ctx.arc(mx, my, r * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = '#3a1c1c';
    ctx.fill();
  } else {
    const ang = Math.atan2(-uy, -ux);
    ctx.arc(b.cx - ux * r * 0.05, b.cy - uy * r * 0.05, r * 0.16, ang - 0.7, ang + 0.7);
    ctx.lineWidth = Math.max(2, r * 0.045);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#222';
    ctx.stroke();
  }
}

function draw() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#111418';
  ctx.fillRect(0, 0, W, H);
  for (const b of blobs) drawBlob(b);
}

// ---------- Setup ----------

function resize() {
  DPR = window.devicePixelRatio || 1;
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = Math.round(W * DPR);
  canvas.height = Math.round(H * DPR);
}

function baseRadius() { return Math.min(W, H) * 0.11; }

function addBlob(x, y, r) {
  if (blobs.length >= MAX_BLOBS) blobs.shift();
  r = r || baseRadius() * (0.75 + Math.random() * 0.5);
  blobs.push(new Blob(x, y, r, Math.floor(Math.random() * 360)));
}

function seed() {
  const r = baseRadius();
  const spots = [[0.3, 0.25], [0.7, 0.25], [0.5, 0.45], [0.3, 0.65], [0.7, 0.65]];
  for (const [fx, fy] of spots) addBlob(W * fx, H * fy, r * (0.8 + Math.random() * 0.4));
}

// ---------- Tilt ----------

function screenAngle() {
  if (screen.orientation && typeof screen.orientation.angle === 'number') return screen.orientation.angle;
  return window.orientation || 0;
}

function onOrientation(e) {
  if (e.beta == null || e.gamma == null) return;
  hasTilt = true;
  const b = (e.beta * Math.PI) / 180, g = (e.gamma * Math.PI) / 180;
  // Gravity projected onto the screen, in device-portrait coordinates (y down).
  const sx = Math.sin(g) * Math.cos(b);
  const sy = Math.sin(b);
  // Rotate into the current screen orientation.
  const a = (screenAngle() * Math.PI) / 180;
  const tx = sx * Math.cos(a) + sy * Math.sin(a);
  const ty = -sx * Math.sin(a) + sy * Math.cos(a);
  gravity.x = gravity.x * 0.7 + tx * 0.3;
  gravity.y = gravity.y * 0.7 + ty * 0.3;
}

async function enableTilt() {
  try {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res !== 'granted') return;
    }
    window.addEventListener('deviceorientation', onOrientation);
  } catch (err) {
    // No tilt available: keep plain downward gravity (arrow keys still work).
  }
}

// Desktop fallback: arrow keys tilt the world.
let keyAngle = Math.PI / 2;
window.addEventListener('keydown', e => {
  if (hasTilt) return;
  if (e.key === 'ArrowLeft') keyAngle += 0.15;
  if (e.key === 'ArrowRight') keyAngle -= 0.15;
  if (e.key === 'ArrowUp') keyAngle = -Math.PI / 2;
  if (e.key === 'ArrowDown') keyAngle = Math.PI / 2;
  gravity.x = Math.cos(keyAngle); gravity.y = Math.sin(keyAngle);
});

// ---------- Touch: drag, fling, add, pop ----------

let drag = null;          // { blob, pts: [{p, ox, oy}], x, y, vx, vy, t }
let lastTap = { t: 0, blob: null };

function blobAt(x, y) {
  for (let i = blobs.length - 1; i >= 0; i--) if (blobs[i].contains(x, y)) return blobs[i];
  return null;
}

canvas.addEventListener('pointerdown', e => {
  const x = e.clientX, y = e.clientY;
  const b = blobAt(x, y);
  const now = performance.now();
  if (!b) {
    addBlob(x, y);
    return;
  }
  if (lastTap.blob === b && now - lastTap.t < 300) {
    blobs.splice(blobs.indexOf(b), 1);
    lastTap = { t: 0, blob: null };
    return;
  }
  lastTap = { t: now, blob: b };
  // Grab the rim points nearest the finger so the blob stays squishy.
  const sorted = b.pts
    .map(p => ({ p, d: (p.x - x) ** 2 + (p.y - y) ** 2 }))
    .sort((m, n) => m.d - n.d)
    .slice(0, 5);
  const held = sorted.map(({ p }) => ({ p, ox: p.x - x, oy: p.y - y }));
  for (const h of held) h.p.held = true;
  drag = { blob: b, pts: held, x, y, vx: 0, vy: 0, t: now };
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', e => {
  if (!drag) return;
  const now = performance.now();
  const dt = Math.max(1, now - drag.t) / 1000;
  const nx = e.clientX, ny = e.clientY;
  drag.vx = drag.vx * 0.5 + ((nx - drag.x) / dt) * 0.5;
  drag.vy = drag.vy * 0.5 + ((ny - drag.y) / dt) * 0.5;
  drag.x = nx; drag.y = ny; drag.t = now;
});

function release() {
  if (!drag) return;
  const h = 1 / 60 / SUBSTEPS;
  for (const { p } of drag.pts) {
    p.held = false;
    p.px = p.x - drag.vx * h;
    p.py = p.y - drag.vy * h;
  }
  drag = null;
}
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);

function applyDrag() {
  if (!drag) return;
  for (const h of drag.pts) {
    const tx = Math.min(W, Math.max(0, drag.x + h.ox));
    const ty = Math.min(H, Math.max(0, drag.y + h.oy));
    h.p.x = tx; h.p.y = ty; h.p.px = tx; h.p.py = ty;
  }
}

document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

// ---------- Main loop ----------

let last = 0;
function frame(t) {
  const dt = Math.min(1 / 30, (t - last) / 1000 || 1 / 60);
  last = t;
  step(dt);
  draw();
  requestAnimationFrame(frame);
}

resize();
window.addEventListener('resize', () => {
  resize();
  for (const b of blobs) for (const p of b.pts) {
    p.x = Math.min(W, p.x); p.y = Math.min(H, p.y);
    p.px = Math.min(W, p.px); p.py = Math.min(H, p.py);
  }
});
seed();
requestAnimationFrame(frame);

document.getElementById('start').addEventListener('click', async e => {
  e.currentTarget.style.display = 'none';
  await enableTilt();
}, { once: true });
