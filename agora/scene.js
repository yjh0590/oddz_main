// 1인칭 회랑 배경(흑백). 캔버스에 원근 투영으로 기둥·들보·바닥을 그린다.
// 외부 3D 라이브러리는 oddz.click CSP(script-src 'self')에 막혀 직접 그린다.
// travel(true)면 기둥 사이로 걸어 들어가고, travel(false)면 천천히 멈춘다.
const ROWS = [3.2, 7.4];  // 안쪽·바깥쪽 기둥 줄의 x
const GAP = 4;            // 기둥 간격(z)
const R = 0.42;           // 기둥 반지름
const H = 7;              // 기둥 높이
const AH = 1.1;           // 들보 높이
const AHEAD = 16;         // 앞으로 그릴 기둥 쌍 수
const FOG = 45;           // 클수록 멀리까지 선명하다
const FOG_L = 0.84;       // 안개(회랑 끝 빛)의 밝기
const WALK = 5.5;         // 걷는 속도(초당 z)

export function startScene(canvas) {
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0, h = 0, f = 1, cx = 0, hy = 0;
  let camZ = -15, eyeY = 1.7, speed = 0, target = 0, last = performance.now();
  const grain = ctx.createPattern(makeGrain(), 'repeat');

  const gray = (l, a = 1) => { const v = Math.round(Math.max(0, Math.min(1, l)) * 255); return `rgba(${v},${v},${v},${a})`; };
  const fogK = (dz) => 1 - Math.exp(-Math.max(dz, 0) / FOG);
  const shade = (l, dz) => { const k = fogK(dz); return gray(l * (1 - k) + FOG_L * k); };
  const P = (x, y, z) => { const s = f / (z - camZ); return [cx + x * s, hy - (y - eyeY) * s, s]; };

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = innerWidth; h = innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    f = Math.max(w, h * 1.1) * 0.6;
    cx = w / 2; hy = h * 0.56;
    draw();
  }

  function quad(pts, fill) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function backdrop() {
    let g = ctx.createLinearGradient(0, 0, 0, hy);
    g.addColorStop(0, '#030303'); g.addColorStop(1, gray(FOG_L));
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, hy);
    g = ctx.createLinearGradient(0, hy, 0, h);
    g.addColorStop(0, gray(FOG_L)); g.addColorStop(0.35, '#3a3a3a'); g.addColorStop(1, '#070707');
    ctx.fillStyle = g; ctx.fillRect(0, hy, w, h - hy);

    // 바닥 판석: 소실점으로 모이는 줄과 다가오는 가로줄
    ctx.lineWidth = 1;
    for (let x = -12; x <= 12; x += 1.6) {
      const a = P(x, 0, camZ + 0.6), b = P(x, 0, camZ + 80);
      ctx.strokeStyle = 'rgba(255,255,255,.07)';
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    for (let z = Math.ceil((camZ + 0.6) / 2) * 2; z < camZ + 60; z += 2) {
      const a = P(-12, 0, z), b = P(12, 0, z);
      ctx.strokeStyle = `rgba(255,255,255,${0.1 * (1 - fogK(z - camZ))})`;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }

    // 회랑 끝의 빛
    const r = Math.max(w, h) * 0.5;
    g = ctx.createRadialGradient(cx, hy - h * 0.04, 0, cx, hy - h * 0.04, r);
    g.addColorStop(0, 'rgba(255,255,255,.75)'); g.addColorStop(0.25, 'rgba(255,255,255,.2)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }

  // 기둥은 시작할 때 픽셀 단위로 조명을 계산한 그림(왼쪽 줄용, 오른쪽은 뒤집어 씀)과
  // 같은 모양의 안개색 실루엣을 만들어 두고, 거리만큼 실루엣을 겹쳐 안개에 묻는다.
  const sprite = makeColumn();

  function shadow(x, z, side) {
    // 회랑 끝(앞쪽 위)에서 오는 빛이 기둥 그림자를 카메라 쪽·바깥쪽으로 길게 드리운다
    const len = 9, out = 0.55 * len * side;
    const pts = [P(x - R, 0, z), P(x + R, 0, z), P(x + R + out, 0, z - len), P(x - R + out, 0, z - len)];
    if (z - len - camZ < 0.3) return;
    const a = (1 - fogK(z - camZ)) * 0.55;
    const g = ctx.createLinearGradient(pts[0][0], pts[0][1], pts[3][0], pts[3][1]);
    g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    quad(pts, g);
  }

  function column(x, z, side) {
    const [sx, sy, s] = P(x, 0, z);
    const half = 1.5 * R * s;
    if (sx + half < 0 || sx - half > w) return;
    const top = hy - (H - eyeY) * s;
    ctx.save();
    ctx.translate(sx, 0);
    if (side > 0) ctx.scale(-1, 1);
    ctx.drawImage(sprite.lit, -half, top, half * 2, sy - top);
    ctx.globalAlpha = fogK(z - camZ);
    ctx.drawImage(sprite.fog, -half, top, half * 2, sy - top);
    ctx.restore();
  }

  function slices() {
    const first = Math.max(0, Math.floor(camZ / GAP));
    for (let i = first + AHEAD; i >= first; i--) {
      const z = i * GAP, dz = z - camZ;
      if (dz < 0.6) continue;
      const far = z + GAP;
      for (const x0 of [ROWS[1], ROWS[0]]) {
        for (const side of [-1, 1]) {
          const x = side * x0;
          // 줄을 따라 이어지는 들보(안쪽 면)
          quad([P(x, H, z), P(x, H + AH, z), P(x, H + AH, far), P(x, H, far)], shade(0.16, dz));
          shadow(x, z, side);
          column(x, z, side);
        }
      }
      // 회랑을 가로지르는 들보, 입구에서는 박공까지
      const span = i === 0 ? ROWS[1] + R * 1.5 : ROWS[0] + R;
      const a = P(-span, H + AH, z), b = P(span, H, z);
      ctx.fillStyle = shade(i === 0 ? 0.3 : 0.1, dz);
      ctx.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
      if (i === 0) {
        quad([P(-span - 0.3, H + AH, z), P(span + 0.3, H + AH, z), P(0, H + AH + 2.4, z)], shade(0.24, dz));
        quad([P(-span + 1.2, H + AH + 0.25, z), P(span - 1.2, H + AH + 0.25, z), P(0, H + AH + 1.95, z)], shade(0.12, dz));
      }
    }
  }

  function finish() {
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.translate(Math.random() * 160, Math.random() * 160);
    ctx.fillStyle = grain; ctx.fillRect(-160, -160, w + 320, h + 320);
    ctx.restore();
    const g = ctx.createRadialGradient(cx, h * 0.5, Math.min(w, h) * 0.3, cx, h * 0.5, Math.max(w, h) * 0.8);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.7)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }

  function draw() {
    backdrop();
    slices();
    finish();
  }

  // 걷는 동안에만 그린다. 멈춰 있을 때(메인 화면 포함)는 한 장으로 가만히 둔다.
  let rafId = 0;
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    speed += (target - speed) * Math.min(1, dt * 1.6);
    camZ += speed * dt;
    eyeY = 1.7 + Math.sin(camZ * 1.5) * 0.04 * Math.min(1, speed / WALK);
    draw();
    if (target > 0 || speed > 0.02) rafId = requestAnimationFrame(frame);
    else { speed = 0; rafId = 0; }
  }

  addEventListener('resize', resize);
  resize();
  return {
    travel(on) {
      target = on && !still ? WALK : 0;
      if (target && !rafId) { last = performance.now(); rafId = requestAnimationFrame(frame); }
    },
  };
}

function makeGrain() {
  const c = document.createElement('canvas');
  c.width = c.height = 160;
  const g = c.getContext('2d');
  const img = g.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

// 기둥 그림: 가로 u∈[-1.5R, 1.5R], 세로 v∈[0, H]. 빛은 회랑 안쪽(+x)과 앞쪽 끝에서 온다.
function makeColumn() {
  const W = 192, PX = W / (3 * R), HT = Math.round(H * PX);
  const lit = document.createElement('canvas'), fog = document.createElement('canvas');
  lit.width = fog.width = W; lit.height = fog.height = HT;
  const img = lit.getContext('2d').createImageData(W, HT);
  const mask = fog.getContext('2d').createImageData(W, HT);
  const L = norm(0.9, 0.25, 0.35), Hv = norm(L[0], L[1], L[2] - 1);
  const noise = valueNoise(32);
  const fogV = Math.round(FOG_L * 255);

  for (let py = 0; py < HT; py++) {
    const v = H * (1 - py / HT);
    const prof = profile(v);
    for (let px = 0; px < W; px++) {
      const u = (px + 0.5) / PX - 1.5 * R;
      const cover = Math.max(0, Math.min(1, (prof.r - Math.abs(u)) * PX + 0.5));
      if (!cover) continue;
      let nx, nz, ny = prof.ny;
      if (prof.box) {
        const edge = Math.abs(u) > prof.r - 0.03;
        nx = edge ? Math.sign(u) * 0.8 : 0; nz = edge ? -0.6 : -1;
      } else {
        let phi = Math.asin(Math.max(-1, Math.min(1, u / prof.r)));
        if (prof.fluted) phi += 0.38 * Math.sin(20 * phi);
        nx = Math.sin(phi); nz = -Math.cos(phi);
      }
      const k = Math.hypot(nx, ny, nz); nx /= k; ny /= k; nz /= k;
      // 감싸는 확산광(부드러운 명암) + 정면의 은은한 하늘빛
      const diff = Math.max(0, (nx * L[0] + ny * L[1] + nz * L[2] + 0.3) / 1.3) ** 1.4;
      const fill = Math.max(0, -nz) * 0.36;
      const spec = 0.22 * Math.pow(Math.max(0, nx * Hv[0] + ny * Hv[1] + nz * Hv[2]), 28);
      const arris = prof.fluted ? 0.07 * Math.pow(Math.max(0, Math.cos(20 * Math.asin(Math.max(-1, Math.min(1, u / prof.r))))), 40) * (0.4 + diff) : 0;
      const stone = 0.86 + 0.2 * noise(u * 5, v * 0.9) + 0.06 * noise(u * 22, v * 6) + (Math.random() - 0.5) * 0.05;
      const l = (0.06 + 0.78 * diff * prof.ao + fill * prof.ao) * stone + spec + arris;
      const i = (py * W + px) * 4;
      const g = Math.round(Math.max(0, Math.min(1, l)) * 255);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = g; img.data[i + 3] = cover * 255;
      mask.data[i] = mask.data[i + 1] = mask.data[i + 2] = fogV; mask.data[i + 3] = cover * 255;
    }
  }
  lit.getContext('2d').putImageData(img, 0, 0);
  fog.getContext('2d').putImageData(mask, 0, 0);
  return { lit, fog };
}

// 높이 v에서 기둥 단면: 반지름, 각진 판인지, 홈이 있는지, 윗면 기울기(ny), 그늘(ao)
function profile(v) {
  const shaftTop = H - 0.5;
  if (v < 0.15) return { r: R * 1.45, box: true, ny: 0, ao: 0.75 };
  if (v < 0.35) {
    const t = (v - 0.15) / 0.2;
    return { r: R * (1.1 + 0.2 * Math.sin(Math.PI * t)), ny: 0.9 * Math.cos(Math.PI * t), ao: 0.85 };
  }
  if (v < shaftTop) {
    const t = (v - 0.35) / (shaftTop - 0.35);
    const ao = (1 - 0.45 * Math.exp(-(shaftTop - v) / 0.35)) * (1 - 0.3 * Math.exp(-(v - 0.35) / 0.4));
    return { r: R * (1 - 0.13 * t + 0.03 * Math.sin(Math.PI * t)), fluted: true, ny: 0, ao };
  }
  if (v < H - 0.22) {
    const t = (v - shaftTop) / 0.28;
    return { r: R * (0.87 + 0.48 * Math.sin((t * Math.PI) / 2)), ny: -0.9 * (1 - t), ao: 0.7 + 0.3 * t };
  }
  return { r: R * 1.5, box: true, ny: 0, ao: 1 };
}

function norm(x, y, z) { const k = Math.hypot(x, y, z); return [x / k, y / k, z / k]; }

// 부드러운 값 잡음(대리석 결). 세로로 늘려 쓰면 결처럼 보인다.
function valueNoise(n) {
  const grid = Array.from({ length: n * n }, Math.random);
  const at = (x, y) => grid[((y % n) + n) % n * n + ((x % n) + n) % n];
  const fade = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = fade(x - xi), fy = fade(y - yi);
    const a = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * fx;
    const b = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * fx;
    return a + (b - a) * fy - 0.5;
  };
}
