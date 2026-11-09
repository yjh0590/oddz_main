// 자석 실험대 테마: 자기장을 따라 줄지어 서는 철가루.
// 화면에 고르게 뿌린 철가루 하나하나가 주변 자석들이 만드는 쌍극자 자기장 방향으로 돌아선다.
// 자석: 커서(누르면 N·S가 바뀜), 현황판, 화면에 보이는 프로젝트 카드.
// 커서가 없을 때는 보이지 않는 자석 하나가 천천히 떠돌아 철가루가 계속 움직인다.
(() => {
  'use strict';
  const canvas = document.getElementById('field');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GAP = innerWidth < 700 ? 15 : 13;
  let W = 0, H = 0, fx, fy, fa, fs, fw, n = 0;
  let cursor = null, polarity = 1, flipAt = -1e9, sources = [];

  function resize() {
    W = innerWidth; H = innerHeight; const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = Math.ceil(W / GAP) + 1, rows = Math.ceil(H / GAP) + 1; n = cols * rows;
    fx = new Float32Array(n); fy = new Float32Array(n); fa = new Float32Array(n); fs = new Float32Array(n); fw = new Float32Array(n);
    for (let r = 0, i = 0; r < rows; r++) for (let c = 0; c < cols; c++, i++) {
      fx[i] = c * GAP + (Math.random() - 0.5) * GAP * 0.8; fy[i] = r * GAP + (Math.random() - 0.5) * GAP * 0.8;
      fa[i] = Math.random() * Math.PI; fw[i] = 0;
    }
  }

  // 자석 목록: {x, y, mx, my} (mx, my는 자기 모멘트)
  function collect(t) {
    sources = [];
    const board = document.querySelector('.hero-board');
    if (board) { const r = board.getBoundingClientRect(); if (r.bottom > 0 && r.top < H) sources.push({ x: r.left + r.width / 2, y: r.top + r.height / 2, mx: 0, my: -9e5 }); }
    for (const card of document.querySelectorAll('#work .oddz-project-card:not([hidden])')) {
      const r = card.getBoundingClientRect();
      if (r.bottom < -100 || r.top > H + 100 || !r.width) continue;
      sources.push({ x: r.left + 34, y: r.top + 34, mx: 2.2e5 * (card.dataset.stage === 'done' ? 1 : -1), my: 0 });
    }
    if (cursor) sources.push({ x: cursor.x, y: cursor.y, mx: 0, my: -1.6e6 * polarity });
    else sources.push({ x: W * (0.5 + 0.38 * Math.sin(t * 0.00021)), y: H * (0.5 + 0.34 * Math.sin(t * 0.00033 + 1)), mx: 7e5 * Math.cos(t * 0.0004), my: 7e5 * Math.sin(t * 0.0004) });
  }

  function update(t) {
    const kick = Math.max(0, 1 - (t - flipAt) / 500);
    for (let i = 0; i < n; i++) {
      let bx = 0, by = 0;
      for (const s of sources) {
        const rx = fx[i] - s.x, ry = fy[i] - s.y, r2 = rx * rx + ry * ry + 900, r = Math.sqrt(r2);
        const ux = rx / r, uy = ry / r, dot = s.mx * ux + s.my * uy, inv = 1 / (r2 * r);
        bx += (3 * dot * ux - s.mx) * inv; by += (3 * dot * uy - s.my) * inv;
      }
      const mag = Math.hypot(bx, by);
      fs[i] = Math.min(1, mag * 0.9);
      // 철가루는 방향만 있고 머리·꼬리가 없다: 각도를 π 단위로 맞춘다
      let diff = Math.atan2(by, bx) - fa[i];
      diff -= Math.round(diff / Math.PI) * Math.PI;
      fw[i] = fw[i] * 0.72 + diff * 0.16 * Math.min(1, 0.25 + fs[i] * 3) + (kick ? (Math.random() - 0.5) * kick * 0.9 : 0);
      fa[i] += fw[i];
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';
    // 세기에 따라 세 묶음으로 나눠 한 번에 그린다
    for (const [lo, hi, a, lw] of [[0, 0.15, 0.28, 1], [0.15, 0.5, 0.5, 1.3], [0.5, 1.01, 0.85, 1.6]]) {
      ctx.strokeStyle = `rgba(206,212,220,${a})`; ctx.lineWidth = lw; ctx.beginPath();
      for (let i = 0; i < n; i++) {
        if (fs[i] < lo || fs[i] >= hi) continue;
        const len = 2.5 + fs[i] * 6, cx = Math.cos(fa[i]) * len, cy = Math.sin(fa[i]) * len;
        ctx.moveTo(fx[i] - cx, fy[i] - cy); ctx.lineTo(fx[i] + cx, fy[i] + cy);
      }
      ctx.stroke();
    }
    if (cursor) {   // 커서 자석: 위아래 N·S 막대
      const top = polarity > 0 ? '#e0483b' : '#3b7be0', bot = polarity > 0 ? '#3b7be0' : '#e0483b';
      ctx.fillStyle = top; ctx.fillRect(cursor.x - 6, cursor.y - 18, 12, 18);
      ctx.fillStyle = bot; ctx.fillRect(cursor.x - 6, cursor.y, 12, 18);
      ctx.fillStyle = '#fff'; ctx.font = '700 9px "IBM Plex Mono",monospace'; ctx.textAlign = 'center';
      ctx.fillText(polarity > 0 ? 'N' : 'S', cursor.x, cursor.y - 6); ctx.fillText(polarity > 0 ? 'S' : 'N', cursor.x, cursor.y + 12);
    }
  }

  resize(); collect(0);
  for (let k = 0; k < 40; k++) update(0);
  draw();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); collect(performance.now()); for (let k = 0; k < 40; k++) update(0); draw(); }, 200); });
  if (still) return;

  addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') cursor = { x: e.clientX, y: e.clientY }; }, { passive: true });
  document.addEventListener('pointerleave', () => { cursor = null; });
  document.documentElement.addEventListener('mouseleave', () => { cursor = null; });
  addEventListener('pointerdown', (e) => {
    cursor = { x: e.clientX, y: e.clientY };
    if (!(e.target.closest && e.target.closest('a, button, input, summary, select, textarea, label'))) { polarity *= -1; flipAt = performance.now(); }
  }, { passive: true });
  addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') cursor = null; });

  let last = 0, tick = 0;
  function frame(now) {
    if (now - last > 33) {
      if (tick++ % 4 === 0) collect(now);
      update(now); draw(); last = now;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
