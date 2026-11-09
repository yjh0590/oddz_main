// 김 서린 창 테마: 비 오는 밤 창문.
// - #scene: 창밖 도시 불빛(번진 빛망울). 크기가 바뀔 때만 다시 그린다.
// - #fog: 같은 장면을 흐리고 밝게 만든 '김'. 누른 채 문지르면 닦이고, 시간이 지나면 다시 서린다.
// - #drops: 유리에 맺힌 물방울. 큰 방울은 작은 방울을 삼키며 흘러내리고, 지나간 자리는 김이 닦인다.
(() => {
  'use strict';
  const scene = document.getElementById('scene'), fog = document.getElementById('fog'), dropsC = document.getElementById('drops');
  if (!scene || !fog || !dropsC || !scene.getContext) return;
  const sc = scene.getContext('2d'), fc = fog.getContext('2d'), dc = dropsC.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, fogImg, small = [], big = [];
  const rand = (a, b) => a + Math.random() * (b - a);

  function paintScene() {
    const g = sc.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0a1220'); g.addColorStop(0.55, '#14233a'); g.addColorStop(1, '#241c2c');
    sc.fillStyle = g; sc.fillRect(0, 0, W, H);
    // 건물 실루엣과 창문 불빛
    const base = H * 0.62;
    for (let x = -20; x < W; x += rand(50, 110)) {
      const w = rand(40, 100), h = rand(H * 0.15, H * 0.45);
      sc.fillStyle = 'rgba(6,10,18,.85)'; sc.fillRect(x, base - h, w, h + H);
      for (let wy = base - h + 10; wy < base + H * 0.3; wy += 14) for (let wx = x + 6; wx < x + w - 8; wx += 12) {
        if (Math.random() < 0.28) { sc.fillStyle = Math.random() < 0.7 ? 'rgba(255,196,107,.55)' : 'rgba(150,210,255,.45)'; sc.fillRect(wx, wy, 5, 7); }
      }
    }
    // 번진 빛망울
    const colors = ['255,196,107', '255,140,90', '120,200,255', '255,90,120', '180,255,220'];
    for (let i = 0; i < Math.round(W * H / 14000); i++) {
      const x = rand(0, W), y = rand(H * 0.25, H), r = rand(14, 60), c = colors[(Math.random() * colors.length) | 0];
      const rg = sc.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, `rgba(${c},.55)`); rg.addColorStop(0.6, `rgba(${c},.22)`); rg.addColorStop(1, `rgba(${c},0)`);
      sc.fillStyle = rg; sc.beginPath(); sc.arc(x, y, r, 0, Math.PI * 2); sc.fill();
    }
    // 김: 장면을 흐리고 밝게
    fogImg = document.createElement('canvas'); fogImg.width = W; fogImg.height = H;
    const gc = fogImg.getContext('2d');
    gc.filter = 'blur(18px)'; gc.drawImage(scene, 0, 0); gc.filter = 'none';
    gc.fillStyle = 'rgba(190,206,224,.42)'; gc.fillRect(0, 0, W, H);
    fc.globalCompositeOperation = 'source-over'; fc.globalAlpha = 1; fc.clearRect(0, 0, W, H); fc.drawImage(fogImg, 0, 0);
  }

  function resize() {
    W = innerWidth; H = innerHeight;
    for (const c of [scene, fog, dropsC]) { c.width = W; c.height = H; }
    paintScene();
    small = Array.from({ length: Math.round(W * H / 2600) }, () => ({ x: rand(0, W), y: rand(0, H), r: rand(0.8, 2.6) }));
    big = [];
    drawDrops();
  }

  function wipe(x, y, r, strength) {
    fc.globalCompositeOperation = 'destination-out';
    const g = fc.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(0,0,0,${strength})`); g.addColorStop(0.7, `rgba(0,0,0,${strength * 0.6})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    fc.fillStyle = g; fc.beginPath(); fc.arc(x, y, r, 0, Math.PI * 2); fc.fill();
    fc.globalCompositeOperation = 'source-over';
  }

  function drawDrop(x, y, r) {
    const g = dc.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(0.35, 'rgba(210,230,255,.12)');
    g.addColorStop(0.85, 'rgba(10,20,35,.18)'); g.addColorStop(1, 'rgba(255,255,255,.35)');
    dc.fillStyle = g; dc.beginPath(); dc.ellipse(x, y, r, r * 1.08, 0, 0, Math.PI * 2); dc.fill();
  }
  function drawDrops() {
    dc.clearRect(0, 0, W, H);
    for (const s of small) drawDrop(s.x, s.y, s.r);
    for (const b of big) drawDrop(b.x, b.y, b.r);
  }

  function update() {
    // 새 큰 방울
    if (big.length < 7 && Math.random() < 0.03) big.push({ x: rand(0, W), y: rand(-20, H * 0.5), r: rand(3.5, 6), vy: 0, wob: rand(0, 6) });
    // 작은 방울이 조금씩 생긴다
    if (small.length < W * H / 2200 && Math.random() < 0.5) small.push({ x: rand(0, W), y: rand(0, H), r: rand(0.8, 2.2) });
    for (let i = big.length - 1; i >= 0; i--) {
      const b = big[i];
      // 멈칫거리며 흘러내린다
      b.vy = Math.random() < 0.08 ? 0 : Math.min(9, b.vy + 0.18 * b.r / 4);
      b.wob += 0.15; b.y += b.vy; b.x += Math.sin(b.wob) * 0.4;
      fc.globalCompositeOperation = 'destination-out';
      fc.lineWidth = b.r * 1.6; fc.lineCap = 'round'; fc.strokeStyle = 'rgba(0,0,0,.85)';
      fc.beginPath(); fc.moveTo(b.x, b.y - b.vy - 1); fc.lineTo(b.x, b.y); fc.stroke();
      fc.globalCompositeOperation = 'source-over';
      // 길에 있는 작은 방울을 삼킨다
      for (let j = small.length - 1; j >= 0; j--) {
        const s = small[j];
        if (Math.abs(s.x - b.x) < b.r + s.r && Math.abs(s.y - b.y) < b.r + s.r) { b.r = Math.min(9, Math.hypot(b.r, s.r)); small.splice(j, 1); }
      }
      if (Math.random() < 0.06) small.push({ x: b.x + rand(-1, 1), y: b.y - b.r * 2, r: rand(0.8, 1.6) });   // 흔적 방울
      if (b.y - b.r > H) big.splice(i, 1);
    }
    // 김이 다시 서린다
    fc.globalAlpha = 0.012; fc.drawImage(fogImg, 0, 0); fc.globalAlpha = 1;
  }

  resize();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 200); });

  // 누른 채 문지르기: 김을 닦고 그 자리 작은 방울도 닦인다
  let down = false, lx = 0, ly = 0;
  const interactive = (t) => t.closest && t.closest('a, button, input, summary, select, textarea, label');
  function rub(x0, y0, x1, y1) {
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 8));
    for (let i = 1; i <= n; i++) wipe(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 44, 0.5);
    small = small.filter((s) => Math.hypot(s.x - x1, s.y - y1) > 40);
    if (still) drawDrops();
  }
  addEventListener('pointerdown', (e) => {
    if (e.button > 0 || interactive(e.target)) return;
    down = true; lx = e.clientX; ly = e.clientY; rub(lx, ly, lx, ly);
  }, { passive: true });
  addEventListener('pointermove', (e) => { if (!down) return; rub(lx, ly, e.clientX, e.clientY); lx = e.clientX; ly = e.clientY; }, { passive: true });
  addEventListener('pointerup', () => { down = false; });
  addEventListener('pointercancel', () => { down = false; });

  if (still) return;
  let last = 0;
  function frame(now) {
    if (now - last > 33) { update(); drawDrops(); last = now; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
