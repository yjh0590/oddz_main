// 바람 부는 깃발 테마: 화면 위에 걸린 줄무늬 천과, 줄에 매달린 현황판.
// - 천: 3차원 점(x, y, z)을 막대 제약으로 이은 베를레 천. 윗줄은 몇 군데만 집게로 집혀 처지고,
//   바람이 앞뒤(z)로 밀어 펄럭인다. 각 칸의 기울기로 빛을 계산해 주름을 그린다.
//   천을 잡아당기면 늘어났다가 놓으면 출렁이며 돌아간다.
// - 현황판: 위쪽 가운데를 축으로 바람에 흔들리고, 잡아끌면 기울었다가 스프링처럼 돌아온다.
(() => {
  'use strict';
  const canvas = document.getElementById('cloth');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLS = 40, ROWS = 9;
  const STRIPES = [[44, 62, 107], [239, 232, 219], [239, 232, 219], [181, 69, 47], [239, 232, 219], [239, 232, 219]];
  let W, H, pts, cons, sx, sy, grab = null, wind = 0;

  function build() {
    W = innerWidth; H = innerHeight; const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const width = W + 40, height = Math.min(H * 0.24, 230);
    sx = width / (COLS - 1); sy = height / (ROWS - 1);
    pts = []; cons = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const x = -20 + c * sx, y = -6 + r * sy;
      pts.push({ x, y, z: 0, px: x, py: y, pz: 0, pin: r === 0 && c % 6 === 0 ? { x, y } : null });
    }
    // 집게 사이의 윗줄은 살짝 늘어지게 짧게 이어 처짐을 만든다
    const link = (a, b, len, k) => cons.push({ a, b, len, k });
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      if (c < COLS - 1) link(i, i + 1, sx * (r === 0 ? 0.985 : 1), 1);
      if (r < ROWS - 1) link(i, i + COLS, sy, 1);
      if (c < COLS - 1 && r < ROWS - 1) link(i, i + COLS + 1, Math.hypot(sx, sy), 0.4);
    }
    for (let k = 0; k < 80; k++) step(0);
  }

  function step(t) {
    wind = 0.5 + 0.5 * Math.sin(t * 0.0007) * Math.sin(t * 0.00031 + 2);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (p.pin) { p.x = p.pin.x; p.y = p.pin.y; p.z = 0; continue; }
      const c = i % COLS, r = (i / COLS) | 0;
      const gust = wind * (0.5 + 0.5 * Math.sin(c * 0.45 - t * 0.004 + r * 0.3));
      const vx = (p.x - p.px) * 0.985, vy = (p.y - p.py) * 0.985, vz = (p.z - p.pz) * 0.97;
      p.px = p.x; p.py = p.y; p.pz = p.z;
      p.x += vx + gust * 0.12; p.y += vy + 0.35; p.z += vz + gust * 0.9 * (r / ROWS);
    }
    if (grab) { const p = pts[grab.i]; p.x = grab.x; p.y = grab.y; p.z = 0; }
    for (let it = 0; it < 4; it++) {
      for (const s of cons) {
        const a = pts[s.a], b = pts[s.b];
        const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z, d = Math.hypot(dx, dy, dz) || 1;
        // 천이라 조금 늘어날 수 있다(k < 1이면 더 잘 늘어남)
        const diff = (d - s.len) / d * 0.5 * s.k * (d > s.len ? 0.9 : 0.5);
        const ox = dx * diff, oy = dy * diff, oz = dz * diff;
        if (!a.pin && !(grab && grab.i === s.a)) { a.x += ox; a.y += oy; a.z += oz; }
        if (!b.pin && !(grab && grab.i === s.b)) { b.x -= ox; b.y -= oy; b.z -= oz; }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let r = 0; r < ROWS - 1; r++) for (let c = 0; c < COLS - 1; c++) {
      const a = pts[r * COLS + c], b = pts[r * COLS + c + 1], d = pts[(r + 1) * COLS + c], e = pts[(r + 1) * COLS + c + 1];
      // 법선(두 대각선의 외적)으로 빛 세기
      const ux = e.x - a.x, uy = e.y - a.y, uz = e.z - a.z, vx = d.x - b.x, vy = d.y - b.y, vz = d.z - b.z;
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, nl = Math.hypot(nx, ny, nz) || 1;
      const light = Math.max(0.35, Math.min(1.12, 0.62 + (nx * -0.35 + ny * -0.55 + nz * 0.75) / nl * 0.55));
      const col = STRIPES[c % STRIPES.length];
      ctx.fillStyle = `rgb(${col[0] * light | 0},${col[1] * light | 0},${col[2] * light | 0})`;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(e.x, e.y); ctx.lineTo(d.x, d.y); ctx.closePath();
      ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.8; ctx.stroke();
    }
    // 아래 단: 바느질선
    ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(239,232,219,.7)'; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let c = 0; c < COLS; c++) { const p = pts[(ROWS - 2) * COLS + c]; const q = pts[(ROWS - 1) * COLS + c]; const x = p.x + (q.x - p.x) * 0.6, y = p.y + (q.y - p.y) * 0.6; c ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.setLineDash([]);
    // 줄과 집게
    ctx.strokeStyle = '#6b5a45'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(W, -4); ctx.stroke();
    for (const p of pts) if (p.pin) { ctx.fillStyle = '#8a6a3f'; ctx.fillRect(p.x - 3, -6, 6, 16); ctx.fillStyle = '#5a4428'; ctx.fillRect(p.x - 3, 3, 6, 2); }
  }

  // ---------- 매달린 현황판 ----------
  const board = () => document.querySelector('.hero-board');
  let angle = 0, av = 0, stretch = 0, sv = 0, drag = null;
  function swing(t) {
    const b = board(); if (!b) return;
    const target = drag ? drag.angle : wind * 1.6 * Math.sin(t * 0.0012);
    const tStretch = drag ? drag.stretch : 0;
    av = (av + (target - angle) * 0.06) * 0.9; angle += av;
    sv = (sv + (tStretch - stretch) * 0.12) * 0.78; stretch += sv;
    b.style.transform = `rotate(${angle.toFixed(3)}deg) scaleY(${(1 + stretch).toFixed(4)})`;
  }

  build(); draw();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); draw(); }, 200); });
  if (still) return;

  const interactive = (t) => t.closest && t.closest('a, button, input, summary, select, textarea, label');
  addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    const b = board();
    if (b && b.contains(e.target) && !interactive(e.target)) {
      const r = b.getBoundingClientRect();
      drag = { ox: e.clientX, oy: e.clientY, cx: r.left + r.width / 2, top: r.top, angle: 0, stretch: 0 };
      b.setPointerCapture?.(e.pointerId); return;
    }
    if (interactive(e.target)) return;
    let best = -1, bd = 60;
    // 천은 페이지 맨 위에 붙어 있어 페이지 좌표로 잡는다
    for (let i = COLS; i < pts.length; i++) { const d = Math.hypot(pts[i].x - e.pageX, pts[i].y - e.pageY); if (d < bd) { bd = d; best = i; } }
    if (best >= 0) grab = { i: best, x: e.pageX, y: e.pageY };
  });
  addEventListener('pointermove', (e) => {
    if (grab) { grab.x = e.pageX; grab.y = e.pageY; }
    if (drag) {
      drag.angle = Math.max(-14, Math.min(14, (e.clientX - drag.ox) * -0.08));
      drag.stretch = Math.max(-0.02, Math.min(0.08, (e.clientY - drag.oy) / 900));
    }
  }, { passive: true });
  const release = () => { grab = null; drag = null; };
  addEventListener('pointerup', release); addEventListener('pointercancel', release);

  let last = 0;
  function frame(now) {
    if (now - last > 30) { step(now); draw(); last = now; }
    swing(now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
