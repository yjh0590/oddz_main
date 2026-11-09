// 물방울 수면 테마: 배경 물 표면 시뮬레이션과 물방울 반응.
// - 낮은 해상도 격자에서 물 높이(2단 파동 방정식)를 계산하고, 물결 기울기만큼
//   바닥의 빛 무늬(코스틱)를 굴절시켜 <canvas id="water">에 그린다.
// - 비가 오듯 가끔 작은 물방울이 떨어지고, 마우스를 움직이면 잔물결이 따라온다.
// - 수면을 누르면 큰 물방울이 튀고(.splash), 물결이 퍼지는 시간에 맞춰
//   가까운 카드·버튼에 .is-trembling을 붙여 떨리게 한다.
// 움직임 줄이기 설정이면 정지된 수면 한 장만 그린다.
(() => {
  'use strict';
  const canvas = document.getElementById('water');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CELL = innerWidth < 700 ? 5 : 4;      // 화면 몇 px를 격자 한 칸으로 볼지
  const DAMP = 0.982;                          // 물결이 잦아드는 정도
  const WAVE_PX_PER_MS = 0.32;                 // 떨림 지연 계산용 물결 속도(대략)
  let W = 0, H = 0, cur, prev, img, data, colX, rowY;

  function resize() {
    W = Math.max(40, Math.ceil(innerWidth / CELL));
    H = Math.max(30, Math.ceil(innerHeight / CELL));
    canvas.width = W; canvas.height = H;
    cur = new Float32Array(W * H); prev = new Float32Array(W * H);
    img = ctx.createImageData(W, H); data = img.data;
    colX = new Float32Array(W); rowY = new Float32Array(H);
  }

  // 물방울: (cx, cy)는 화면 좌표(px), r은 격자 칸 수
  function drop(cx, cy, r, strength) {
    const gx = Math.round(cx / CELL), gy = Math.round(cy / CELL);
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        const px = gx + x, py = gy + y, d = Math.hypot(x, y);
        if (px < 1 || py < 1 || px >= W - 1 || py >= H - 1 || d > r) continue;
        cur[py * W + px] += strength * (Math.cos(d / r * Math.PI) + 1) / 2;
      }
    }
  }

  function step() {
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1, i = y * W + 1; x < W - 1; x++, i++) {
        prev[i] = ((cur[i - 1] + cur[i + 1] + cur[i - W] + cur[i + W]) * 0.5 - prev[i]) * DAMP;
      }
    }
    const t = cur; cur = prev; prev = t;
  }

  // 바닥: 깊이 그라데이션 + 시간에 따라 흐르는 코스틱 그물
  function render(time) {
    const t = time * 0.00035;
    for (let x = 0; x < W; x++) colX[x] = Math.sin(x * 0.072 - t * 0.9);
    for (let y = 0; y < H; y++) rowY[y] = Math.sin(y * 0.094 + t * 0.7);
    for (let y = 0; y < H; y++) {
      for (let x = 0, i = y * W; x < W; x++, i++) {
        const dx = (x > 0 && x < W - 1) ? cur[i - 1] - cur[i + 1] : 0;
        const dy = (y > 0 && y < H - 1) ? cur[i - W] - cur[i + W] : 0;
        const sx = Math.min(W - 1, Math.max(0, x + dx * 1.6)) | 0;
        const sy = Math.min(H - 1, Math.max(0, y + dy * 1.6)) | 0;
        // 코스틱: 두 굽은 사인 물결이 만나는 자리가 밝은 선이 된다
        const w = Math.sin(sx * 0.11 + t * 1.1 + rowY[sy] * 1.4) + Math.sin(sy * 0.13 - t * 0.8 + colX[sx] * 1.3);
        let c = 1 - Math.abs(w) * 0.5; c = c * c; c = c * c; c = c * c;     // ^8: 가는 빛줄기
        const depth = sy / H;                                              // 아래로 갈수록 깊다
        const vign = 1 - Math.min(1, Math.hypot(sx / W - 0.5, sy / H - 0.42) * 1.15);
        const spec = Math.max(0, (dx - dy) * 0.9);                         // 물결 경사에 비친 하늘빛
        const o = i * 4;
        data[o]     = Math.min(255, 4 + 16 * (1 - depth) + 80 * c * vign + spec * 150);
        data[o + 1] = Math.min(255, 46 + 64 * (1 - depth) * vign + 118 * c * vign + spec * 180);
        data[o + 2] = Math.min(255, 70 + 66 * (1 - depth) * vign + 112 * c * vign + spec * 190);
        data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  // ---------- 물방울이 튈 때 주변이 떨림 ----------
  const shakeTargets = '.oddz-project-card:not([hidden]), .hero-board, .cta, .tag-label, .oddz-filter, main > .hero h1, .section-head h2, .ripple-hint';
  function trembleAround(cx, cy, power) {
    const reach = 380 + power * 260;
    for (const el of document.querySelectorAll(shakeTargets)) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight || !r.width) continue;
      const nx = Math.max(r.left, Math.min(cx, r.right)), ny = Math.max(r.top, Math.min(cy, r.bottom));
      const dist = Math.hypot(cx - nx, cy - ny);
      if (dist > reach) continue;
      const a = (1 - dist / reach) * (2.2 + power * 3.2);
      // Web Animations API로 따로 얹는다. 요소의 CSS 애니메이션(등장·떠다님)을 덮어쓰지 않는다.
      if (!el.animate) continue;
      el.animate([
        { translate: '0 0', rotate: '0deg' },
        { translate: `${a}px ${-a * 0.7}px`, rotate: `${a * 0.12}deg`, offset: 0.12 },
        { translate: `${-a * 0.85}px ${a * 0.55}px`, rotate: `${-a * 0.1}deg`, offset: 0.26 },
        { translate: `${a * 0.55}px ${-a * 0.35}px`, rotate: `${a * 0.06}deg`, offset: 0.42 },
        { translate: `${-a * 0.3}px ${a * 0.2}px`, rotate: '0deg', offset: 0.6 },
        { translate: `${a * 0.12}px 0px`, offset: 0.78 },
        { translate: '0 0', rotate: '0deg' }
      ], { duration: 900, delay: Math.round(dist / WAVE_PX_PER_MS), easing: 'cubic-bezier(.3,.6,.4,1)' });
    }
  }

  function splash(cx, cy) {
    const s = document.createElement('div');
    s.className = 'splash';
    s.style.left = cx + 'px'; s.style.top = cy + 'px';
    s.innerHTML = '<i class="ring"></i><i class="ring r2"></i>' + Array.from({ length: 7 }, (_, k) =>
      `<b style="--a:${(k * 360 / 7 + Math.random() * 20).toFixed(0)}deg;--d:${(26 + Math.random() * 26).toFixed(0)}px"></b>`).join('');
    document.body.append(s);
    setTimeout(() => s.remove(), 1100);
  }

  // 링크·버튼·입력칸을 누를 때는 그 동작을 방해하지 않고 물결만 일으킨다.
  addEventListener('pointerdown', (e) => {
    if (still || e.button > 0) return;
    drop(e.clientX, e.clientY, 5, 2.4);
    trembleAround(e.clientX, e.clientY, 1);
    if (!e.target.closest('input, textarea, select')) splash(e.clientX, e.clientY);
  }, { passive: true });

  let lastTrail = 0, slow = false;
  addEventListener('pointermove', (e) => {
    if (still || slow || e.pointerType !== 'mouse') return;
    const now = performance.now();
    if (now - lastTrail < 45) return;
    lastTrail = now;
    drop(e.clientX, e.clientY, 2, 0.35);
  }, { passive: true });

  resize();
  let resizeTimer;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });

  if (still) { render(0); return; }

  // 가끔 떨어지는 빗방울. 히어로 근처에 떨어지면 주변도 살짝 떨린다.
  let nextRain = performance.now() + 800;
  let last = 0, frameMs = 30, prevFrame = 0, gaps = 0, gapCount = 0;
  function frame(now) {
    // 화면 프레임 간격이 계속 길면(느린 기기) 물 계산을 15fps로 낮추고 잔물결 따라오기를 끈다.
    if (prevFrame && !slow) {
      gaps += now - prevFrame; gapCount++;
      if (gapCount === 90) { if (gaps / gapCount > 45) { slow = true; frameMs = 66; } gaps = 0; gapCount = 0; }
    }
    prevFrame = now;
    if (now >= nextRain) {
      const x = Math.random() * innerWidth, y = Math.random() * innerHeight;
      drop(x, y, 3, 0.9 + Math.random() * 0.8);
      if (Math.random() < 0.35) trembleAround(x, y, 0.25);
      nextRain = now + 900 + Math.random() * 1600;
    }
    if (now - last > frameMs) {       // 보통 약 30fps로 계산·그리기
      step(); step();
      render(now);
      last = now;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
