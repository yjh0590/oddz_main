// 사막 모래언덕 테마: 모래알 낙하 시뮬레이션.
// 화면 아래쪽에 사구가 쌓여 있고, 누르고 있으면 그 자리에서 모래가 쏟아진다.
// 모래알은 아래가 비면 떨어지고, 막히면 대각선으로 미끄러진다(안식각).
// 바람이 사구 꼭대기 모래를 날려 옮기고, 오른쪽 끝을 넘은 모래는 왼쪽에서 다시 떨어진다.
(() => {
  'use strict';
  const canvas = document.getElementById('sand');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CELL = innerWidth < 700 ? 5 : 4;
  const PALETTE = [[226, 178, 115], [217, 164, 99], [207, 152, 88], [232, 189, 128], [201, 141, 78], [220, 174, 108], [185, 122, 63], [238, 201, 146]];
  let W, H, grid, img, cap, count = 0, wind = 1;

  function resize() {
    W = Math.ceil(innerWidth / CELL); H = Math.ceil(innerHeight / CELL);
    canvas.width = W; canvas.height = H;
    grid = new Uint8Array(W * H); img = ctx.createImageData(W, H);
    cap = Math.round(W * H * 0.32);
    // 사구: 몇 개의 사인 물결을 겹친 높이. 깊이에 따라 지층 색이 바뀐다.
    const p1 = Math.random() * 6, p2 = Math.random() * 6; count = 0;
    for (let x = 0; x < W; x++) {
      const h = H * (0.13 + 0.06 * Math.sin(x / W * 5.2 + p1) + 0.035 * Math.sin(x / W * 13 + p2) + 0.02 * Math.sin(x / W * 31));
      for (let y = H - 1; y >= H - h; y--) {
        const depth = H - y, band = ((depth + Math.sin(x * 0.05) * 3) / 7 | 0) % 3;
        grid[y * W + x] = 1 + ((band * 2 + (Math.random() < 0.5 ? 0 : 1) + (Math.random() < 0.15 ? 4 : 0)) % PALETTE.length);
        count++;
      }
    }
    render();
  }

  let flip = false;
  function step() {
    flip = !flip;
    for (let y = H - 2; y >= 0; y--) {
      const row = y * W;
      for (let n = 0; n < W; n++) {
        const x = flip ? n : W - 1 - n, k = row + x, c = grid[k];
        if (!c) continue;
        const below = k + W;
        if (!grid[below]) { grid[below] = c; grid[k] = 0; continue; }
        const dir = Math.random() < 0.5 ? -1 : 1;
        if (x + dir >= 0 && x + dir < W && !grid[below + dir]) { grid[below + dir] = c; grid[k] = 0; continue; }
        if (x - dir >= 0 && x - dir < W && !grid[below - dir]) { grid[below - dir] = c; grid[k] = 0; }
      }
    }
  }

  // 바람: 사구 꼭대기 모래알을 바람 쪽으로 한두 칸 띄워 옮긴다(도약)
  function blow(t) {
    wind = 0.6 + 0.6 * Math.sin(t * 0.00023) + 0.4 * Math.sin(t * 0.0011);
    const tries = Math.round(W * 0.04 * Math.max(0, wind));
    for (let i = 0; i < tries; i++) {
      const x = (Math.random() * W) | 0;
      let y = 0; while (y < H && !grid[y * W + x]) y++;
      if (y >= H - 1) continue;
      let nx = x + 1 + ((Math.random() * 2) | 0), ny = y - 1;
      if (nx >= W) nx -= W;                                   // 오른쪽을 넘으면 왼쪽에서
      if (ny < 0 || grid[ny * W + nx]) continue;
      grid[ny * W + nx] = grid[y * W + x]; grid[y * W + x] = 0;
    }
  }

  function render() {
    const data = img.data;
    data.fill(0);
    for (let k = 0; k < W * H; k++) {
      const c = grid[k];
      if (!c) continue;
      const col = PALETTE[c - 1], o = k * 4;
      // 위가 비어 있으면 햇빛을 받아 밝게
      const lit = k >= W && !grid[k - W] ? 18 : 0;
      data[o] = col[0] + lit; data[o + 1] = col[1] + lit; data[o + 2] = col[2] + lit * 0.6; data[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  // 붓는 자리
  let pouring = false, px = 0, py = 0;
  function pour() {
    if (count >= cap) return;
    const gx = px / CELL | 0, gy = py / CELL | 0;
    for (let i = 0; i < 7; i++) {
      const x = gx + ((Math.random() * 5) | 0) - 2, y = gy + ((Math.random() * 3) | 0) - 1;
      if (x < 0 || x >= W || y < 0 || y >= H || grid[y * W + x]) continue;
      grid[y * W + x] = 1 + ((Math.random() * PALETTE.length) | 0); count++;
    }
  }

  resize();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 200); });
  if (still) return;

  const interactive = (t) => t.closest && t.closest('a, button, input, summary, select, textarea, label');
  addEventListener('pointerdown', (e) => { if (e.button > 0 || interactive(e.target)) return; pouring = true; px = e.clientX; py = e.clientY; }, { passive: true });
  addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; }, { passive: true });
  addEventListener('pointerup', () => { pouring = false; });
  addEventListener('pointercancel', () => { pouring = false; });

  let last = 0;
  function frame(now) {
    if (now - last > 33) {
      if (pouring) pour();
      blow(now); step(); render(); last = now;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
