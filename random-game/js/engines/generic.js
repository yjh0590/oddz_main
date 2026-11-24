/* ---- 화면: 범용 게임 화면 (GX 엔진 공용) ---- */
addScreen(/*html*/ `
<div id="generic-screen" class="screen hidden">
  <button class="btn-small back-corner" data-menu>← 메뉴</button>
  <div id="gx-title" style="font-size:28px;font-weight:700;"></div>
  <div id="gx-center" class="big-center"></div>
  <div class="timer-wrap"><div id="bar-gx" class="timer-bar"></div></div>
  <div id="table-gx" class="seat-table"></div>
  <div id="msg-gx" class="msg"></div>
  <div id="gx-controls" class="btn-row"></div>
  <button id="restart-gx-btn" class="hidden btn-green">다시 하기</button>
</div>
`);

/* ================= 범용 엔진 (GXGAMES 19개 공용, GX) ================= */
/* 범용 게임은 js/games/에서 registerGxGame(설정, { title, start(GX) })로 등록한다. */
const GXGAMES = {};
const GX_ENGINE = { start: k => startGeneric(k), stop: () => stopGeneric() };
function registerGxGame(meta, cfg){ GXGAMES[meta.key] = cfg; meta.flub = !!cfg.flub; registerGame(meta, GX_ENGINE); }
function seatNeighbors(i){ return [(i+3)%4, (i+1)%4]; }
function gxPickTarget(exclude){
  const pool = [0,1,2,3].filter(i => i !== exclude);
  if(exclude !== 0 && Math.random() < 0.45) return 0;
  return rndOf(pool);
}
let GX = null;
function startGeneric(key){
  showScreen("generic-screen");
  const cfg = GXGAMES[key];
  GX = { key, cfg, seats: buildSeats("table-gx"), over:false, round:0,
    raf:0, timer:0, deadline:0, limit:0, onTimeout:null, data:{} };
  $("gx-title").textContent = cfg.title;
  $("gx-center").innerHTML = "";
  $("msg-gx").textContent = "";
  $("gx-controls").innerHTML = "";
  $("restart-gx-btn").classList.add("hidden");
  /* 콤이를 직접 톡 눌러 가리킬 수 있게 (gxAim) */
  GX.seats.forEach((s, i) => s.el.addEventListener("click", () => { if(i && GX && GX.input && GX.input.seat) GX.input.seat(i); }));
  GX.raf = requestAnimationFrame(gxLoop);
  GX.timer = setTimeout(() => cfg.start(GX), 900);
}
/* haltState가 over=true를 먼저 찍는다: 라운드 함수들은 GX를 인자로 붙잡고 있어서, 전역 GX만 null로 만들면 남은 타이머가 옛 판을 계속 돌린다 */
function stopGeneric(){ haltState(GX); GX = null; }
function gxLoop(now){
  if(!GX || GX.over) return;
  const bar = $("bar-gx");
  if(GX.deadline){
    const remain = Math.max(0, GX.deadline - now);
    const ratio = remain / GX.limit;
    bar.style.width = (ratio*100)+"%";
    bar.classList.toggle("low", ratio < .35);
    if(remain <= 0){
      GX.deadline = 0;
      const fn = GX.onTimeout; GX.onTimeout = null;
      if(fn) fn();
      if(!GX || GX.over) return;
    }
  } else { bar.style.width="100%"; bar.classList.remove("low"); }
  GX.raf = requestAnimationFrame(gxLoop);
}
function gxSetTimer(ms, onTimeout){ ms *= speedK(); GX.limit = ms; GX.deadline = performance.now() + ms; GX.onTimeout = onTimeout; }
function gxClearTimer(){ GX.deadline = 0; GX.onTimeout = null; }
function gxSafeNext(fn, delay=700){ delay *= speedK(); const gx = GX; GX.timer = setTimeout(() => { if(GX === gx && !gx.over) fn(); }, delay); }
function gxBtn(label, onClick, cls=""){
  const b = document.createElement("button");
  b.textContent = label; if(cls) b.className = cls;
  b.addEventListener("click", onClick);
  $("gx-controls").appendChild(b);
  return b;
}
/* 콤이 실수 잡기 (GX용). 잡으면 onCaught, 못 잡거나 멀쩡한 콤이를 잡으면 내가 짐 */
function gxCatch(GX, idx, flub, rec, onCaught = () => {}){
  openCatch(GX.seats[idx], flub, catchStd("msg-gx", why => gxFail(why, rec), onCaught));
}
/* 콤이 차례: act(flub)로 행동을 보여주고 delay 뒤 next. 그 사이에 🚨로 잡을 수 있다.
   act가 true/false를 돌려주면 그 값이 실제로 틀렸는지가 된다 (틀릴 수 없는 상황 등) */
function gxNpc(GX, idx, act, next, delay, rec){
  let flub = flubRoll(idx, 1 + GX.round*0.03);
  const r = act(flub); if(r !== undefined) flub = r;
  const gx = GX;
  gxCatch(GX, idx, flub, rec, () => { clearTimeout(gx.timer); gxSafeNext(next, 1500); });
  gxSafeNext(() => { if(!closeCatch()) next(); }, Math.max(delay, 800));
}
/* ---- 버튼 말고 다른 조작 ----
   GX.input = { key(e), keyup(e), seat(i), swipe(dir) } 중 지금 받는 것만 넣는다. key/keyup은 처리했으면 true.
   gxInput(h, hint)는 컨트롤 줄을 비우고 안내 글자를 띄운다. 끝나면 gxInput(null) */
function gxInput(h, hint = ""){
  if(!GX) return;
  GX.input = h;
  $("gx-controls").innerHTML = hint ? `<div class="hint">${hint}</div>` : "";
  GX.seats.forEach((s, i) => s.el.classList.toggle("aimable", !!(h && h.seat) && i > 0));
}
const onGx = () => GX && !GX.over && !$("generic-screen").classList.contains("hidden");
document.addEventListener("keydown", e => {
  if(!onGx() || e.target.tagName === "INPUT") return;
  const h = GX.input;
  if(h && h.key){ if(h.key(e)) e.preventDefault(); return; }
  /* 숫자키 1~9 = n번째 버튼 */
  if(/^[1-9]$/.test(e.key)){
    const b = [...$("gx-controls").querySelectorAll("button")].filter(b => !b.disabled)[e.key - 1];
    if(b){ e.preventDefault(); b.click(); }
  }
});
document.addEventListener("keyup", e => { if(onGx() && GX.input && GX.input.keyup && GX.input.keyup(e)) e.preventDefault(); });
/* 쓸기: 화면 어디서든 누른 채로 40px 넘게 밀면 그 방향 */
let swipeFrom = null;
$("generic-screen").addEventListener("pointerdown", e => { swipeFrom = { x: e.clientX, y: e.clientY }; });
$("generic-screen").addEventListener("pointerup", e => {
  if(!swipeFrom || !onGx() || !GX.input || !GX.input.swipe) return;
  const dx = e.clientX - swipeFrom.x, dy = e.clientY - swipeFrom.y; swipeFrom = null;
  if(Math.max(Math.abs(dx), Math.abs(dy)) < 40) return;
  GX.input.swipe(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down"));
});
const ARROW_SEAT = { ArrowLeft: 1, ArrowUp: 2, ArrowRight: 3 };
const SWIPE_SEAT = { left: 1, up: 2, right: 3 };
/* 가리키기: 콤이를 직접 톡 / 그쪽으로 쓸기 / ← ↑ →. withMe면 "🙋 나!"(↓)도 고를 수 있다 */
function gxAim(onPick, title = "누구?", withMe = false){
  const pick = i => { if(i === undefined) return; gxInput(null); click('thumb'); onPick(i); };
  const keyOf = e => e.key === "ArrowDown" && withMe ? 0 : ARROW_SEAT[e.key];
  gxInput({ seat: pick, swipe: d => pick(d === "down" && withMe ? 0 : SWIPE_SEAT[d]),
    key: e => keyOf(e) !== undefined ? (pick(keyOf(e)), true) : false },
    `${title} 👉 콤이를 <b>직접 톡!</b> (쓸기 · 화살표 키도 OK)`);
  if(withMe) gxBtn("🙋 나!", () => pick(0));
}
/* 예측: 누가 걸릴지 ms 안에 찍는다. 맞히면 onRight(), 틀리거나 늦으면 내가 마신다 */
function gxPredict(GX, ans, ms, rec, onRight){
  gxAim(i => {
    gxClearTimer();
    if(i === ans){ praise(GX.seats[0], "정답!"); onRight(); }
    else gxFail(`땡! 걸리는 건 ${GX.seats[ans].name}였다!`, rec);
  }, "누가 걸릴까?", true);
  gxSetTimer(ms, () => { gxInput(null); gxFail(`계산이 느렸다! (${GX.seats[ans].name}였다)`, rec); });
}
/* 연타: 큰 버튼(또는 스페이스)을 빠르게 n번. 잠깐(idle) 멈추면 onDone(n) */
function gxMash(label, onDone, idle = 420){
  let n = 0, t = 0;
  const gx = GX;
  const tap = () => {
    n++; click('knee'); hop(GX.seats[0], false);
    b.textContent = `${label} ${"탁".repeat(n)}`;
    b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
    clearTimeout(t);
    t = setTimeout(() => { if(GX === gx && !gx.over){ gxInput(null); onDone(n); } }, idle);
  };
  gxInput({ key: e => e.code === "Space" && !e.repeat ? (tap(), true) : false }, "빠르게 연타! (스페이스도 OK)");
  const b = gxBtn(label, () => {}, "big-tap");
  b.addEventListener("pointerdown", e => { e.preventDefault(); tap(); });
}
/* 꾹 누르기: 누르고 있는 동안 게이지가 차고(full ms에 100%), 떼면 onRelease(lv). 1을 넘기면 과했다.
   target(0~1)에 눈금을 그려 준다 */
function gxHold(label, target, onRelease, full = 1400){
  let t0 = 0, raf = 0;
  const lvNow = () => (performance.now() - t0) / full;
  const step = () => { b.style.setProperty("--lv", Math.min(1.15, lvNow())); raf = requestAnimationFrame(step); };
  const start = () => { if(t0) return; t0 = performance.now(); step(); };
  const end = () => { if(!t0) return; const lv = lvNow(); t0 = 0; cancelAnimationFrame(raf); gxInput(null); onRelease(lv); };
  gxInput({ key: e => e.code === "Space" ? (start(), true) : false, keyup: e => e.code === "Space" ? (end(), true) : false },
    "꾹 눌렀다가 노란 눈금을 넘기면 떼! 끝까지 가면 목이 쉰다 (스페이스도 OK)");
  const b = gxBtn(label, () => {}, "big-tap hold");
  b.style.setProperty("--tg", target);
  b.addEventListener("pointerdown", e => { e.preventDefault(); start(); });
  b.addEventListener("pointerup", end); b.addEventListener("pointerleave", end);
}
function gxFail(why, recVal){
  if(!GX || GX.over) return;
  haltState(GX);
  $("gx-controls").innerHTML = "";
  showLose({ key: GX.key, val: recVal, loser: GX.seats[0], msgId: "msg-gx", restartId: "restart-gx-btn", why });
}
$("restart-gx-btn").addEventListener("click", () => { const k = GX?GX.key:null; stopGeneric(); if(k) startGeneric(k); });
