/* ================= 판마다 달라지는 패턴 =================
   ① 오늘의 룰: 새 판마다 하나 뽑는다. 효과는 각 곳에서 rule("id")로 확인
   ② 해장 이벤트: 한 잔 마시고 이어 하기 전에 미니 이벤트 (짠 타이밍 · 콤이 퀴즈 · 벌칙 룰렛)
   ③ 콤이 취기: 잡혀서 마신 콤이는 비틀거리고 실수가 늘어난다 (npcDrunk) */
const RULES = [
  { id: "speed",    name: "⚡ 스피드 술자리", desc: "모든 게 빨라진다!" },
  { id: "drunkNpc", name: "🤪 콤이들 이미 취함", desc: "콤이 실수 2배! 잘 잡아" },
  { id: "shield",   name: "🛡️ 첫 잔은 봐줌", desc: "처음 한 번은 안 마셔도 돼" },
  { id: "weak",     name: "🍶 주량 2잔", desc: "2잔이면 끝! 긴장해" },
  { id: "strong",   name: "🍺 주량 6잔", desc: "6잔까지 버틴다" },
  { id: "fog",      name: "🌫️ 담배 연기 자욱", desc: "콤이들이 뿌옇게 보인다... 잘 봐" },
  { id: "combo",    name: "🎯 콤보 해장", desc: "5콤보마다 취기 한 잔이 깬다" },
  { id: "normal",   name: "🍻 평범한 술자리", desc: "오늘은 평범하게~" },
];
let RULE = RULES[RULES.length - 1], shieldUsed = false;
const rule = id => RULE.id === id;
const npcDrunk = { funny: 0, scary: 0, sad: 0 };
const speedK = () => rule("speed") ? 0.8 : 1;   // 대기 시간에 곱한다 (작을수록 빠름)
function maxDrinks(){ return rule("weak") ? 2 : rule("strong") ? 6 : 4; }
function pickRule(){
  RULE = rndOf(RULES); shieldUsed = false;
  for(const k in npcDrunk) npcDrunk[k] = 0;
  document.body.classList.toggle("fog", rule("fog"));
}
function announceRule(){
  stamp(RULE.name, "rule");
  chatPost("sys", `📜 오늘의 룰: ${RULE.name} — ${RULE.desc}`);
  setDrunk(drinks);   // 게이지 아래 룰 이름 갱신
}

/* ---- 해장 이벤트 ---- */
let evKey = null;   // 이벤트 중 스페이스 처리
document.addEventListener("keydown", e => { if(evKey && e.code === "Space"){ e.preventDefault(); evKey(); } }, true);
function showEvent(title, body){
  $("event-card").innerHTML = `<h2>${title}</h2>${body}<div id="ev-result"></div>`;
  $("event-modal").classList.remove("hidden");
}
/* 결과: delta잔 (취기 0 ~ 최대-1 사이로), 잠깐 보여주고 done */
function endEvent(text, delta, done){
  evKey = null; cancelAsk();
  setDrunk(Math.max(0, Math.min(maxDrinks() - 1, drinks + delta)));
  $("ev-result").innerHTML = text;
  chatPost("sys", text.replace(/<[^>]+>/g, ""));
  click(delta < 0 ? 'clink' : delta > 0 ? 'fail' : 'thumb');
  setTimeout(() => { $("event-modal").classList.add("hidden"); done(); }, 1300);
}
/* 짠 타이밍: 왔다 갔다 하는 잔이 초록 칸에 들어왔을 때 짠! */
function evClink(done){
  const z0 = 0.15 + Math.random()*0.5, zw = 0.2;
  showEvent("🥂 해장 짠!", `<div class="sub">잔이 초록 칸에 왔을 때 짠! (버튼 · 스페이스)</div>
    <div class="ev-bar"><i class="ev-zone" style="left:${z0*100}%;width:${zw*100}%"></i><b class="ev-mark">🥂</b></div>
    <button id="ev-btn" class="btn-green">🥂 짠!</button>`);
  const t0 = performance.now(); let x = 0, raf = 0, over = false;
  const step = now => { x = 0.5 - 0.5*Math.cos((now - t0) / 1100 * Math.PI); document.querySelector(".ev-mark").style.left = x*100 + "%"; raf = requestAnimationFrame(step); };
  raf = requestAnimationFrame(step);
  const hit = () => {
    if(over) return; over = true; cancelAnimationFrame(raf);
    x >= z0 && x <= z0 + zw ? endEvent("짠~ 🥂 <b>해장 성공! 취기 -1</b>", -1, done) : endEvent("빗나갔다... 술만 흘렸네 😅", 0, done);
  };
  evKey = hit; $("ev-btn").addEventListener("click", hit);
  setTimeout(() => { if(!over){ over = true; cancelAnimationFrame(raf); endEvent("짠을 안 했다고? 😑", 0, done); } }, 4500);
}
/* 콤이 퀴즈: 채팅으로 암산 */
function evQuiz(done){
  const p = rndOf(CUR_SEATS.filter(s => !s.isHuman));
  const a = 2 + Math.floor(Math.random()*8), b = 2 + Math.floor(Math.random()*8), c = 1 + Math.floor(Math.random()*9);
  const q = `${a} × ${b} + ${c}`, ans = a*b + c;
  showEvent(`💬 ${p.name}의 해장 퀴즈`, `<div class="ev-q">${q} = ?</div><div class="sub">채팅으로 답해! (6초) 맞히면 취기 -1, 틀리면 +1</div>`);
  chatPost(p, { funny: `퀴즈~ ${q}는? ㅋㅋ`, scary: `...${q}. 답해.`, sad: `저기... ${q}는 얼마예요...?` }[p.face]);
  let over = false;
  askChat("정답 숫자 (엔터)", t => {
    if(over) return; over = true;
    +t.replace(/[^\d-]/g, "") === ans ? endEvent(`정답! <b>해장 성공! 취기 -1</b>`, -1, done) : endEvent(`땡! 답은 ${ans}. <b>한 잔 더 🍺</b>`, 1, done);
  });
  setTimeout(() => { if(!over){ over = true; endEvent(`시간 끝! 답은 ${ans}`, 0, done); } }, 6000);
}
/* 벌칙 룰렛: 돌려서 나온 대로 */
function evRoulette(done){
  const opts = [["💧 해장", -1], ["🍺 한 잔 더", 1], ["🤝 콤이가 대신", -1], ["😶 꽝", 0], ["🍻 러브샷", 0]];
  showEvent("🎲 벌칙 룰렛", `<div class="ev-wheel">${opts.map(o => `<span>${o[0]}</span>`).join("")}</div>`);
  const spans = [...document.querySelectorAll(".ev-wheel span")];
  const target = Math.floor(Math.random()*opts.length), total = opts.length*3 + target;
  let i = 0, delay = 60;
  (function spin(){
    spans.forEach((s, k) => s.classList.toggle("on", k === i % opts.length)); click('thumb');
    if(i++ < total){ delay *= 1.09; setTimeout(spin, delay); return; }
    const [name, d] = opts[target];
    if(name === "🤝 콤이가 대신"){ const p = rndOf(CUR_SEATS.filter(s => !s.isHuman)); npcDrinks(p); return endEvent(`${p.name}가 대신 마셨다! <b>취기 -1</b>`, d, done); }
    endEvent(name === "🍻 러브샷" ? "콤이랑 러브샷~ 💕 (취기 그대로)" : `${name}! ${d < 0 ? "<b>취기 -1</b>" : d > 0 ? "<b>취기 +1</b>" : ""}`, d, done);
  })();
}
function hangover(done){ rndOf([evClink, evQuiz, evRoulette])(done); }

/* ---- 콤이 취기: npcDrinks에서 부른다 ---- */
function npcGetsDrunk(p){
  if(!p.face) return;
  npcDrunk[p.face]++;
  if(npcDrunk[p.face] === 2){ p.el.classList.add("npc-drunk"); chatPost("sys", `🥴 ${p.name} 취기가 오른다... 실수가 늘 거야`); }
}
