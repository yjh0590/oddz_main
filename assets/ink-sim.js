// 먹물 화선지 테마: 물 먹은 종이 위에서 먹이 번지는 유체 흐름.
// 낮은 해상도 격자에서 속도장(u, v)과 먹 농도(d)를 계산한다(안정 유체 방식:
// 이류 → 소용돌이 보강 → 압력 투영). 누르면 먹이 떨어지고, 끌면 붓 자국이 흐른다.
// 움직임 줄이기 설정이면 미리 번진 먹 한 장만 그린다.
(() => {
  'use strict';
  const canvas = document.getElementById('ink');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CELL = innerWidth < 700 ? 7 : 6;
  let W, H, N, u, v, u0, v0, d, d0, p, div, curl, img;

  function resize() {
    W = Math.max(30, Math.ceil(innerWidth / CELL)); H = Math.max(24, Math.ceil(innerHeight / CELL)); N = W * H;
    canvas.width = W; canvas.height = H;
    u = new Float32Array(N); v = new Float32Array(N); u0 = new Float32Array(N); v0 = new Float32Array(N);
    d = new Float32Array(N); d0 = new Float32Array(N); p = new Float32Array(N); div = new Float32Array(N); curl = new Float32Array(N);
    img = ctx.createImageData(W, H);
  }

  // 격자 값 f를 (x, y)에서 쌍선형 보간
  function sample(f, x, y) {
    x = Math.max(0, Math.min(W - 1.001, x)); y = Math.max(0, Math.min(H - 1.001, y));
    const i = x | 0, j = y | 0, s = x - i, t = y - j, k = j * W + i;
    return (f[k] * (1 - s) + f[k + 1] * s) * (1 - t) + (f[k + W] * (1 - s) + f[k + W + 1] * s) * t;
  }
  function advect(dst, src, dt) {
    for (let y = 1; y < H - 1; y++) for (let x = 1, k = y * W + 1; x < W - 1; x++, k++) {
      dst[k] = sample(src, x - dt * u[k], y - dt * v[k]);
    }
  }
  function project() {
    for (let y = 1; y < H - 1; y++) for (let x = 1, k = y * W + 1; x < W - 1; x++, k++) {
      div[k] = -0.5 * (u[k + 1] - u[k - 1] + v[k + W] - v[k - W]); p[k] = 0;
    }
    for (let it = 0; it < 14; it++) {
      for (let y = 1; y < H - 1; y++) for (let x = 1, k = y * W + 1; x < W - 1; x++, k++) {
        p[k] = (div[k] + p[k - 1] + p[k + 1] + p[k - W] + p[k + W]) * 0.25;
      }
    }
    for (let y = 1; y < H - 1; y++) for (let x = 1, k = y * W + 1; x < W - 1; x++, k++) {
      u[k] -= 0.5 * (p[k + 1] - p[k - 1]); v[k] -= 0.5 * (p[k + W] - p[k - W]);
    }
  }
  // 소용돌이 보강: 먹이 말려 들어가는 결을 살린다
  function vorticity(eps) {
    for (let y = 1; y < H - 1; y++) for (let x = 1, k = y * W + 1; x < W - 1; x++, k++) {
      curl[k] = (v[k + 1] - v[k - 1] - u[k + W] + u[k - W]) * 0.5;
    }
    for (let y = 2; y < H - 2; y++) for (let x = 2, k = y * W + 2; x < W - 2; x++, k++) {
      const gx = Math.abs(curl[k + 1]) - Math.abs(curl[k - 1]), gy = Math.abs(curl[k + W]) - Math.abs(curl[k - W]);
      const len = Math.hypot(gx, gy) + 1e-5;
      u[k] += eps * (gy / len) * curl[k]; v[k] -= eps * (gx / len) * curl[k];
    }
  }
  function step() {
    vorticity(0.12);
    u0.set(u); v0.set(v); advect(u, u0, 1); advect(v, v0, 1);
    for (let k = 0; k < N; k++) { u[k] *= 0.985; v[k] *= 0.985; }
    project();
    d0.set(d); advect(d, d0, 1);
    for (let k = 0; k < N; k++) d[k] *= 0.9993;    // 아주 천천히 말라 옅어진다
  }

  // 먹 떨어뜨리기: (cx, cy)는 화면 좌표, 바깥으로 퍼지는 속도를 함께 준다
  function drop(cx, cy, r, amount, push) {
    const gx = cx / CELL, gy = cy / CELL;
    for (let y = Math.max(1, (gy - r) | 0); y < Math.min(H - 1, gy + r + 1); y++) {
      for (let x = Math.max(1, (gx - r) | 0); x < Math.min(W - 1, gx + r + 1); x++) {
        const dx = x - gx, dy = y - gy, dist = Math.hypot(dx, dy);
        if (dist > r) continue;
        const f = 1 - dist / r, k = y * W + x;
        d[k] = Math.min(4, d[k] + amount * f);
        if (dist > 0.01) { u[k] += push * f * dx / dist; v[k] += push * f * dy / dist; }
      }
    }
  }
  function stroke(cx, cy, vx, vy, amount) {
    const gx = cx / CELL, gy = cy / CELL, r = 2.4;
    for (let y = Math.max(1, (gy - r) | 0); y < Math.min(H - 1, gy + r + 1); y++) {
      for (let x = Math.max(1, (gx - r) | 0); x < Math.min(W - 1, gx + r + 1); x++) {
        const f = Math.max(0, 1 - Math.hypot(x - gx, y - gy) / r), k = y * W + x;
        d[k] = Math.min(4, d[k] + amount * f); u[k] += vx * f; v[k] += vy * f;
      }
    }
  }

  // 그리기: 옅은 먹(담묵)은 푸른 회색, 짙은 먹(농묵)은 검정에 가깝게
  function render() {
    const data = img.data;
    for (let k = 0; k < N; k++) {
      const c = Math.min(1, d[k] * 0.55), o = k * 4;
      data[o] = 92 - 70 * c; data[o + 1] = 96 - 72 * c; data[o + 2] = 104 - 76 * c;
      data[o + 3] = Math.min(240, c * 300);
    }
    ctx.putImageData(img, 0, 0);
  }

  // 처음 화면: 큰 먹 한 방울과 붓 한 획이 이미 번져 있다
  function seed() {
    // 글자가 적은 가장자리에 떨어뜨린다
    drop(innerWidth * 0.93, innerHeight * 0.14, 7, 3.2, 1.6);
    drop(innerWidth * 0.04, innerHeight * 0.95, 6, 2.6, 1.3);
    for (let i = 0; i < 26; i++) stroke(innerWidth * (0.52 + i * 0.016), innerHeight * (0.97 - Math.sin(i / 8) * 0.04), 1.4, -0.2, 0.5);
    for (let i = 0; i < 70; i++) step();
  }

  resize(); seed(); render();
  addEventListener('resize', () => { resize(); seed(); render(); });
  if (still) return;

  let down = false, lx = 0, ly = 0;
  const interactive = (t) => t.closest && t.closest('a, button, input, summary, select, textarea, label');
  addEventListener('pointerdown', (e) => {
    if (e.button > 0 || interactive(e.target)) return;
    down = true; lx = e.clientX; ly = e.clientY;
    drop(e.clientX, e.clientY, 4 + Math.random() * 2, 2.6, 1.8);
  }, { passive: true });
  addEventListener('pointerup', () => { down = false; });
  addEventListener('pointercancel', () => { down = false; });
  addEventListener('pointermove', (e) => {
    const vx = (e.clientX - lx) / CELL, vy = (e.clientY - ly) / CELL; lx = e.clientX; ly = e.clientY;
    if (down) stroke(e.clientX, e.clientY, vx * 0.6, vy * 0.6, 0.9);       // 붓 자국
    else if (e.pointerType === 'mouse') stroke(e.clientX, e.clientY, vx * 0.25, vy * 0.25, 0); // 물만 휘젓기
  }, { passive: true });

  let last = 0, nextDrop = performance.now() + 3500;
  function frame(now) {
    if (now >= nextDrop) {
      drop(Math.random() * innerWidth, Math.random() * innerHeight, 3 + Math.random() * 3, 1.6, 1.2);
      nextDrop = now + 4000 + Math.random() * 4000;
    }
    if (now - last > 33) { step(); render(); last = now; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
