/* ================= 공통 ================= */
const $ = id => document.getElementById(id);
let playerName = "○○";
function rndOf(a){ return a[Math.floor(Math.random()*a.length)]; }
/* 사용자 입력을 innerHTML에 넣을 때는 꼭 esc()를 거친다 */
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
/* ---- 콤이 셋의 성격 ----
   rate: 자기 차례에 틀릴 확률 / flubKind: 리듬 게임에서 틀리는 방식 (skip 멍때림 · extra 한 번 더)
   drink: 잡혀서 마실 때 / gloat: 내가 졌을 때 / wronged: 멀쩡한데 잡혔을 때 / missed: 틀렸는데 안 들켰을 때 */
const PERSONA = {
  funny: { name: "재밌는 콤이", rate: .16, flubKind: "extra",
    drink: "아 ㅋㅋㅋ 들켰네! 원샷~ 🎉", gloat: "원샷! 원샷! 🎉", wronged: "억울하다 억울해 ㅋㅋㅋ", missed: "ㅋㅋㅋ 안 들켰지롱~" },
  scary: { name: "무서운 콤이", rate: .05, flubKind: null,
    drink: "...다음은 너다. 🍺", gloat: "크크크... 마셔.", wronged: "...나를 의심해?", missed: "크크... 몰랐지?" },
  sad:   { name: "슬픈 콤이", rate: .11, flubKind: "skip",
    drink: "흑... 마실게요 🥲", gloat: "괜찮아... 나도 같이 마실게...", wronged: "나 진짜 아닌데... 😢", missed: "...아무도 모르네..." },
};
/* 성격대로 한마디: 말풍선 + 단톡방 */
function personaSay(p, kind, ms = 2500){
  if(!p || !p.persona) return;
  bubbleSay(p, p.persona[kind], ms);
  if(!$("chat").classList.contains("hidden")) chatPost(p, p.persona[kind]);
}
/* ---- 캐릭터 그림 (상반신, viewBox 140×150) ----
   필터 #spray·#rough는 index.html 맨 위 <svg>에 있다. 그리는 순서: back(뒷배경) → body(옷) → head(머리·머리카락) → face(표정) → front(팔·손·소품)
   재밌는 애: 노란 빛 + 꽃무늬 셔츠·나비넥타이 + 고깔모자·곱슬머리 + 잔 든 팔
   무서운 애: 스프레이 그림자 + 검은 후드 + 이빨 웃음 + 앙상한 손가락
   슬픈 애: 푸른 그늘·먹구름 + 카디건·목도리 + 앞머리 + 눈물·휴지 든 손
   look: -1 왼쪽 · 0 정면 · 1 오른쪽을 본다 (얼굴만 그쪽으로 조금 옮긴다) */
const HEAD = `<path class="fillp rough" d="M34 42 Q32 6 70 6 Q108 6 106 42 Q104 80 70 80 Q36 80 34 42 Z"/>`;
const TORSO = "M24 152 Q22 104 46 90 Q70 82 94 90 Q118 104 116 152";
const LOOKS = {
  funny: {
    back: `<ellipse class="glow" cx="70" cy="80" rx="68" ry="74"/>
      <path class="thin" d="M126 40 L134 32 M128 56 L139 54 M124 70 L134 76"/>`,
    body: `<path class="shirt-fun rough" d="${TORSO}"/>
      <g class="dots"><circle cx="40" cy="122" r="4"/><circle cx="58" cy="138" r="4"/><circle cx="96" cy="116" r="4"/>
        <circle cx="104" cy="140" r="4"/><circle cx="84" cy="132" r="3"/><circle cx="50" cy="106" r="3"/></g>
      <path class="thin" d="M58 90 L70 108 L82 90"/>
      <path class="bow rough" d="M70 100 L56 92 L56 108 Z M70 100 L84 92 L84 108 Z"/><circle class="bow" cx="70" cy="100" r="3.5"/>`,
    head: `<path class="rough" d="M36 34 q-9 -1 -7 -9 q-7 -5 0 -11 M104 34 q9 -1 7 -9 q7 -5 0 -11"/>${HEAD}
      <path class="hat rough" d="M52 13 L70 -22 L88 13 Z"/><path class="thin" d="M58 2 L80 6 M63 -9 L76 -6"/>
      <circle class="pom" cx="70" cy="-24" r="5"/>`,
    dy: 0,
    face: `<ellipse class="blush" cx="44" cy="54" rx="8" ry="5"/><ellipse class="blush" cx="96" cy="54" rx="8" ry="5"/>
      <path class="thin" d="M47 27 Q55 20 63 26 M77 26 Q85 20 93 27"/>
      <path d="M49 40 Q56 30 63 40"/><path d="M77 40 Q84 30 91 40"/>
      <path class="ink" d="M50 50 Q70 84 90 50 Z"/>
      <path class="tongue" d="M60 66 Q70 58 80 66 Q76 74 70 74 Q64 74 60 66 Z"/>`,
    front: `<path class="arm-o" d="M34 116 Q14 96 18 66"/><path class="arm-i fun" d="M34 116 Q14 96 18 66"/>
      <circle class="fillp rough" cx="18" cy="62" r="8"/>
      <path class="glass rough" d="M9 36 L27 36 L24 56 L12 56 Z"/><path class="soju" d="M11 44 L25 44 L24 55 L12 55 Z"/>
      <path class="thin" d="M6 30 L2 24 M18 28 L18 20 M30 30 L34 24"/>`,
  },
  scary: {
    back: `<path class="spray" d="M8 152 Q2 96 28 80 Q14 38 32 12 Q70 -16 110 10 Q128 38 114 80 Q140 96 134 152 Z"/>`,
    body: `<path class="hood rough" d="M20 152 Q18 102 44 88 Q70 80 96 88 Q122 102 120 152"/>
      <path class="string" d="M62 92 L59 118 M78 92 L81 118"/><circle class="knot" cx="59" cy="120" r="2.5"/><circle class="knot" cx="81" cy="120" r="2.5"/>
      <path class="string" d="M46 136 Q70 128 94 136"/>`,
    head: `<path class="hood rough" d="M24 64 Q16 0 70 -2 Q124 0 116 64 Q112 92 70 94 Q28 92 24 64 Z"/>
      <path class="fillp rough" d="M40 46 Q38 14 70 14 Q102 14 100 46 Q98 80 70 80 Q42 80 40 46 Z"/>
      <path class="spray" d="M42 30 Q70 6 98 30 Q70 20 42 30 Z"/>`,
    dy: 0,
    face: `<path class="thin" d="M48 30 L64 35 M92 30 L76 35"/>
      <ellipse class="ink" cx="57" cy="42" rx="5" ry="7"/><ellipse class="ink" cx="83" cy="42" rx="5" ry="7"/>
      <circle class="teeth" cx="58.5" cy="40" r="1.6"/><circle class="teeth" cx="84.5" cy="40" r="1.6"/>
      <g transform="translate(7 6) scale(.9)">
        <path class="ink" d="M42 50 Q70 82 98 50 Q70 60 42 50 Z"/>
        <path class="teeth" d="M48 54.5 Q70 74 92 54.5 Q70 61 48 54.5 Z"/>
        <path class="thin" d="M50 58 Q70 66 90 58 M55 56 L56 65 M62 58 L62 69 M70 59 L70 71 M78 58 L78 69 M85 56 L84 65"/>
      </g>`,
    front: `<path class="fillp rough" d="M26 152 Q24 138 36 134 Q50 131 56 142 L56 152 Z"/>
      <path class="thin" d="M31 136 L26 118 L28 112 M38 133 L36 114 L38 108 M45 133 L46 114 L49 109 M52 136 L57 121 L61 117"/>
      <path class="fillp rough" d="M114 152 Q116 138 104 134 Q90 131 84 142 L84 152 Z"/>
      <path class="thin" d="M109 136 L114 118 L112 112 M102 133 L104 114 L102 108 M95 133 L94 114 L91 109 M88 136 L83 121 L79 117"/>`,
  },
  sad: {
    back: `<path class="gloom" d="M6 152 Q4 90 32 78 Q22 34 70 20 Q118 34 108 78 Q136 90 134 152 Z"/>`,
    body: `<path class="cardi rough" d="${TORSO}"/>
      <path d="M70 104 L70 152"/><circle class="ink" cx="77" cy="116" r="2.5"/><circle class="ink" cx="77" cy="132" r="2.5"/><circle class="ink" cx="77" cy="146" r="2.5"/>
      <path class="thin" d="M36 120 L46 124 M34 134 L46 138 M104 122 L94 126"/>
      <path class="scarf rough" d="M42 86 Q70 100 98 86 L98 98 Q70 112 42 98 Z"/>
      <path class="scarf rough" d="M54 102 L48 134 L62 132 L64 106 Z"/>
      <path class="thin" d="M52 112 L62 113 M50 122 L61 123"/>`,
    head: `${HEAD}
      <path class="hair rough" d="M33 46 Q28 2 70 2 Q112 2 107 46 Q102 28 88 30 Q80 18 68 28 Q54 18 46 32 Q36 32 33 46 Z"/>
      <path class="cloud rough" d="M34 -8 Q30 -24 46 -24 Q50 -38 68 -34 Q82 -44 92 -30 Q110 -30 106 -12 Q106 -4 94 -4 L44 -4 Q32 -4 34 -8 Z"/>
      <path class="rain" d="M44 0 L41 8 M58 2 L55 10 M86 2 L83 10 M100 0 L97 8"/>`,
    dy: 6,
    face: `<path d="M46 40 L61 35"/><path d="M79 35 L94 40"/>
      <circle class="ink" cx="56" cy="47" r="3.5"/><circle class="ink" cx="84" cy="47" r="3.5"/>
      <path class="thin" d="M50 52 Q56 55 62 52 M78 52 Q84 55 90 52"/>
      <path class="tear" d="M53 56 Q48 65 53 68 Q58 65 53 56 Z"/>
      <path d="M58 72 Q70 63 82 72"/>`,
    front: `<path class="arm-o" d="M106 126 Q122 104 108 84"/><path class="arm-i sad" d="M106 126 Q122 104 108 84"/>
      <circle class="fillp rough" cx="106" cy="80" r="8"/>
      <path class="fillp rough" d="M98 60 Q106 52 114 60 Q120 70 110 76 L100 74 Q94 68 98 60 Z"/>
      <path class="thin" d="M102 62 Q107 66 111 62"/>`,
  },
};
/* 아이엠 그라운드 손동작: 쿵(무릎) · 짝(박수) · 왼따봉 · 오른따봉. 자리(또는 두들)에 pose-○○ 클래스를 붙이면
   평소 손(front) 대신 그 자세의 팔이 보인다. 소매 색은 css의 --sleeve (성격별) */
const ARM = d => `<path class="arm-o" d="${d}"/><path class="arm-i sleeve" d="${d}"/>`;
/* 따봉 손: 주먹(접힌 손가락 마디가 가로로 보임) + 한쪽 위로 비스듬히 선 굵은 엄지. s = 엄지가 기우는 쪽 (-1 왼쪽 · 1 오른쪽) */
const THUMB = (x, y, s) => `<path class="thumb-o" d="M${x+3*s} ${y-6} Q${x+5*s} ${y-14} ${x+7*s} ${y-20}"/>
  <path class="fillp" d="M${x-10} ${y-2} Q${x-10} ${y-9} ${x-3} ${y-9} L${x+3} ${y-9} Q${x+10} ${y-9} ${x+10} ${y-2} L${x+10} ${y+6} Q${x+10} ${y+13} ${x+3} ${y+13} L${x-3} ${y+13} Q${x-10} ${y+13} ${x-10} ${y+6} Z"/>
  <path class="thumb-i" d="M${x+3*s} ${y-6} Q${x+5*s} ${y-14} ${x+7*s} ${y-20}"/>
  <path class="thin" d="M${x-7} ${y-1} L${x+7} ${y-1} M${x-7} ${y+4} L${x+7} ${y+4} M${x-7} ${y+9} L${x+5} ${y+9}"/>`;
const ARMS = `<g class="arms">
  <g class="p-knee">${ARM("M36 104 Q24 128 32 146")}${ARM("M104 104 Q116 128 108 146")}
    <ellipse class="fillp" cx="32" cy="148" rx="11" ry="6"/><ellipse class="fillp" cx="108" cy="148" rx="11" ry="6"/>
    <path class="thin" d="M16 146 L8 140 M18 138 L12 130 M124 146 L132 140 M122 138 L128 130"/></g>
  <g class="p-clap">${ARM("M36 104 Q42 128 62 114")}${ARM("M104 104 Q98 128 78 114")}
    <ellipse class="fillp" cx="65" cy="106" rx="6" ry="12" transform="rotate(12 65 106)"/>
    <ellipse class="fillp" cx="75" cy="106" rx="6" ry="12" transform="rotate(-12 75 106)"/>
    <path class="thin" d="M70 86 L70 76 M58 90 L51 83 M82 90 L89 83"/></g>
  <g class="p-thumbL">${ARM("M36 104 Q16 100 8 84")}${THUMB(10, 80, -1)}${ARM("M104 104 Q112 128 106 150")}</g>
  <g class="p-thumbR">${ARM("M104 104 Q124 100 132 84")}${THUMB(130, 80, 1)}${ARM("M36 104 Q28 128 34 150")}</g>
</g>`;
const POSES = ["knee", "clap", "thumbL", "thumbR"];   // 박자 순서 = 쿵 짝 따봉 따봉
function pose(el, name){ POSES.forEach(n => el.classList.toggle("pose-" + n, n === name)); }
/* 콤이가 뭔가 할 때 잠깐 손을 쓰게 (리듬 게임 밖에서) */
function flashPose(p){
  pose(p.el, rndOf(["clap", "thumbL", "thumbR"]));
  clearTimeout(p._pt); p._pt = setTimeout(() => pose(p.el, null), 380);
}
function doodleSVG(face = "scary", look = 0){
  const L = LOOKS[face];
  return `<svg viewBox="0 0 140 150" xmlns="http://www.w3.org/2000/svg">
    ${L.back}
    <g transform="rotate(${look*5} 70 150)">
      ${L.body}
      <ellipse class="shadow" cx="70" cy="88" rx="24" ry="7"/>
      <g transform="translate(0 ${L.dy})">
        ${L.head}
        <g transform="translate(${look*6} 0)">${L.face}</g>
      </g>
      <g class="front">${L.front}</g>
      ${ARMS}
    </g>
  </svg>`;
}
/* 1인칭 시점의 "내 손" (술상 끝에 올려둔 두 손) */
function handsSVG(){
  return `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
    <ellipse class="shadow" cx="60" cy="78" rx="40" ry="12"/><ellipse class="shadow" cx="180" cy="78" rx="40" ry="12"/>
    <g class="rough hand-l">
      <g class="palm"><path class="fillp" d="M28 84 Q30 42 52 30 Q74 20 88 36 Q98 50 94 84"/>
        <path class="fillp" d="M88 42 Q102 34 107 45 Q109 56 94 59"/></g>
      <g class="fist"><path class="fillp" d="M84 44 Q78 14 88 6 Q98 2 102 14 L104 44"/>
        <path class="fillp" d="M32 84 Q30 46 48 38 Q70 32 96 40 Q108 46 106 62 Q104 78 96 84"/>
        <path class="thin" d="M62 50 Q94 46 104 54 M62 62 Q94 58 104 66 M64 74 Q92 70 100 78"/></g>
    </g>
    <g class="rough hand-r">
      <g class="palm"><path class="fillp" d="M212 84 Q210 42 188 30 Q166 20 152 36 Q142 50 146 84"/>
        <path class="fillp" d="M152 42 Q138 34 133 45 Q131 56 146 59"/></g>
      <g class="fist"><path class="fillp" d="M156 44 Q162 14 152 6 Q142 2 138 14 L136 44"/>
        <path class="fillp" d="M208 84 Q210 46 192 38 Q170 32 144 40 Q132 46 134 62 Q136 78 144 84"/>
        <path class="thin" d="M178 50 Q146 46 136 54 M178 62 Q146 58 136 66 M176 74 Q148 70 140 78"/></g>
    </g>
  </svg>`;
}
/* 자리: 0 = 나(손만 보임), 1 = 왼쪽, 2 = 맞은편, 3 = 오른쪽. 옆자리 콤이는 나를 쳐다본다 */
const SEAT_LOOK = [
  null,
  { face: "funny", look:  1 },
  { face: "scary", look:  0 },   // 맞은편에서 정면으로 노려본다
  { face: "sad",   look: -1 },
];
let CUR_SEATS = [];   // 지금 판의 자리 (내가 졌을 때 콤이들이 한마디씩 하려고)
function buildSeats(containerId){
  const names = [playerName, ...SEAT_LOOK.slice(1).map(l => PERSONA[l.face].name)];
  const table = $(containerId);
  /* 내 앞의 술상 */
  table.innerHTML = `<div class="pov-deco"><span>🍶</span><span>🥃</span><span class="gap"></span><span>🥃</span><span>🍶</span></div>`;
  return CUR_SEATS = names.map((name, idx) => {
    const seat = document.createElement("div");
    const look = SEAT_LOOK[idx];
    seat.className = `seat pos${idx}` + (idx===0 ? " me" : ` face-${look.face}`) + (idx && npcDrunk[look.face] >= 2 ? " npc-drunk" : "");
    seat.innerHTML = `<div class="bubble"></div>
      <div class="doodle">${idx===0 ? handsSVG() + `<span class="my-glass">🍺</span>` : doodleSVG(look.face, look.look)}</div>
      <div class="pname">${name}${idx===0?" (나)":""}</div>`;
    table.appendChild(seat);
    return { name, isHuman: idx===0, el: seat, persona: idx ? PERSONA[look.face] : null, face: look && look.face,
      bubble: seat.querySelector(".bubble"), doodle: seat.querySelector(".doodle") };
  });
}
/* ---- 콤이 실수 잡기 (모든 엔진 공용) ----
   콤이가 행동할 때 flubRoll로 틀릴지 정하고, 행동을 보여준 뒤 openCatch로 "🚨 걸렸다!" 버튼을 띄운다.
   버튼은 콤이가 행동할 때마다 뜬다 (틀렸을 때만 뜨면 티가 나니까).
   h = { caught(p), wrong(p), missed(p) }: 잡았을 때 / 멀쩡한데 눌렀을 때 / 틀렸는데 못 잡았을 때 (각 엔진의 진행·패배) */
const FLUB_RULE = "콤이도 틀려! 틀린 순간 <b>🚨 걸렸다!</b>로 잡으면 콤이가 마셔. 못 잡거나 멀쩡한 콤이를 잡으면 네가 마셔 🍺";
let CATCH = null, caughtCount = 0;
/* 실수 확률 = 성격 기본값 × mult × 콤이 취기(마실수록 +40%) × 오늘의 룰(콤이 만취면 2배) */
function flubRoll(seatIdx, mult = 1){
  const l = SEAT_LOOK[seatIdx]; if(!l) return false;
  return Math.random() < PERSONA[l.face].rate * mult * (1 + 0.4*npcDrunk[l.face]) * (rule("drunkNpc") ? 2 : 1);
}
function openCatch(p, flub, h){ CATCH = { p, flub, h }; $("catch-btn").classList.remove("hidden"); }
function cancelCatch(){ CATCH = null; $("catch-btn").classList.add("hidden"); }
/* 다음 진행 직전에 부른다. 틀렸는데 못 잡았으면 missed를 부르고 true (호출한 쪽은 진행을 멈춘다) */
function closeCatch(){
  const c = CATCH; cancelCatch();
  if(c && c.flub){ c.h.missed(c.p); return true; }
  return false;
}
/* 엔진 공용 기본 처리: 잡으면 msgId에 "걸렸다" 표시 후 resume, 아니면 fail(이유) */
function catchStd(msgId, fail, resume = () => {}){
  return {
    caught: p => {   // 원래 안내("가만히!" 등)는 남겨두고 잠깐 위에 붙였다 뗀다
      const note = document.createElement("span");
      note.className = "caught-note"; note.innerHTML = `<b class="drink">${p.name}</b> 걸렸다! 마셔~ 🍺`;
      $(msgId).prepend(note); setTimeout(() => note.remove(), 1600);
      resume();
    },
    wrong:  p => { fail(`${p.name}는 멀쩡했는데 잡았다!`); personaSay(p, "wronged"); },
    missed: p => { fail(`${p.name}가 틀렸는데 못 잡았다!`); personaSay(p, "missed"); },
  };
}
/* 잡힌 콤이: 잠깐 부들부들 + 성격대로 한마디 */
function npcDrinks(p){
  caughtCount++; click('clink'); setTimeout(() => click('clink'), 90); shakeSeat(p);
  stamp("🚨 걸렸다!"); combo++; npcGetsDrunk(p);
  setTimeout(() => p.doodle.classList.remove("shake"), 1500);
  personaSay(p, "drink", 1800);
}
$("catch-btn").addEventListener("click", () => {
  const c = CATCH; if(!c) return;
  cancelCatch();
  if(c.flub){ npcDrinks(c.p); c.h.caught(c.p); }
  else c.h.wrong(c.p);
});
/* 걸렸을 때: 부들부들. 나라면 손이 떨리고 화면도 흔들린다 */
function shakeSeat(p){
  p.doodle.classList.remove("shake"); void p.doodle.offsetWidth; p.doodle.classList.add("shake");
  if(p.isHuman){
    const sc = p.el.closest(".screen");
    if(sc){ sc.classList.remove("shaking"); void sc.offsetWidth; sc.classList.add("shaking"); }
  }
}
function bubbleSay(p, text, ms=900){
  p.bubble.textContent = text; p.bubble.classList.add("show");
  clearTimeout(p._bt); p._bt = setTimeout(() => p.bubble.classList.remove("show"), ms);
}
/* 통통 튀기. 내가 해낸 거면(praiseIt) 칭찬 글자와 콤보도 띄운다 */
function hop(p, praiseIt = true){
  p.doodle.classList.remove("beat-hop"); void p.doodle.offsetWidth; p.doodle.classList.add("beat-hop");
  if(p.isHuman && praiseIt) praise(p);
  if(!p.isHuman && !(typeof R !== "undefined" && R)) flashPose(p);
}

/* ---- 타격감: 칭찬 글자 · 콤보 · 도장 · 반짝이 ---- */
let combo = 0;
const PRAISE = ["좋아!", "나이스!", "캬~", "오~", "깔끔!"];
function praise(p, text = rndOf(PRAISE)){
  combo++;
  if(rule("combo") && combo % 5 === 0 && drinks > 0){ setDrunk(drinks - 1); stamp("💧 콤보 해장!", "rule"); chatPost("sys", `🎯 ${combo}콤보! 취기 -1`); }
  const d = document.createElement("div");
  d.className = "praise" + (combo >= 5 ? " hot" : "");
  d.textContent = combo >= 3 ? `${text} 🔥${combo}` : text;
  p.el.appendChild(d); setTimeout(() => d.remove(), 800);
}
/* 화면 가운데에 쾅 찍히는 글자 */
function stamp(text, cls = ""){
  const d = document.createElement("div");
  d.className = "stamp " + cls; d.textContent = text;
  document.body.appendChild(d); setTimeout(() => d.remove(), 900);
}
/* 게임 화면 버튼을 누르면 손끝에서 반짝이가 튄다 */
document.addEventListener("pointerdown", e => {
  if(!e.target.closest(".screen button, #catch-btn") || e.target.closest("[data-menu]")) return;
  for(let i = 0; i < 6; i++){
    const s = document.createElement("span");
    s.className = "spark"; s.textContent = rndOf(["✦", "✧", "•"]);
    const a = Math.random() * Math.PI * 2, r = 30 + Math.random()*30;
    s.style.left = e.clientX + "px"; s.style.top = e.clientY + "px";
    s.style.setProperty("--dx", Math.cos(a)*r + "px"); s.style.setProperty("--dy", Math.sin(a)*r + "px");
    document.body.appendChild(s); setTimeout(() => s.remove(), 500);
  }
});

/* ---- 취기 게이지 ----
   틀려도 바로 끝나지 않는다: 한 잔 마시고(취기 +1) 같은 게임을 처음부터 이어서. 주량(maxDrinks, 오늘의 룰에 따라 2·4·6잔)에 진짜 끝.
   취할수록 화면이 흐려지고 흔들리고 버튼이 비틀거린다 (css의 body.drunk-N). 기록은 이어 한 판들의 합계 */
let drinks = 0, sessionScore = 0, continuing = false, loseToken = 0;
function setDrunk(n){
  drinks = n;
  const lv = Math.min(4, Math.ceil(n / maxDrinks() * 4));   // 주량 대비 취한 정도 → 화면 효과 1~4단계
  for(let i = 1; i <= 4; i++) document.body.classList.toggle("drunk-" + i, i === lv);
  $("drunk-gauge").innerHTML = `취기 ${"🍺".repeat(n)}${"<i>🍺</i>".repeat(Math.max(0, maxDrinks() - n))}<small>${RULE.name}</small>`;
}
/* 새로 시작(메뉴에서 고름 · 다시 하기 · 메뉴로 나감): 취기·점수·콤보 초기화 */
function resetSession(){ loseToken++; sessionScore = 0; caughtCount = 0; combo = 0; setDrunk(0); }
document.addEventListener("click", e => {
  if(!e.target.closest('[id*="restart"]')) return;
  resetSession(); pickRule(); setTimeout(announceRule, 300);   // 다시 하기 = 새 판 = 새 룰
}, true);
/* class="screen"인 화면 중 id 하나만 보이게. 화면을 추가해도 목록을 고칠 필요 없음 */
function showScreen(id){ document.querySelectorAll(".screen").forEach(s => s.classList.toggle("hidden", s.id !== id)); }
/* 등록된 모든 엔진을 멈춘다 (같은 엔진을 쓰는 게임이 여럿이어도 한 번씩) */
function stopAll(){ cancelCatch(); new Set(Object.values(ENGINE_OF)).forEach(e => e.stop()); }

/* ---- 오디오 ---- */
let AC = null;
/* 클릭 전에 만들어지면(소리 미리 준비할 때) 멈춘 상태라서, 부를 때마다 깨운다 */
function audio(){
  if(!AC) AC = new (window.AudioContext||window.webkitAudioContext)();
  if(AC.state === "suspended") AC.resume();
  return AC;
}
function click(type){
  try{
    const ctx = audio();
    const o = ctx.createOscillator(), g = ctx.createGain();
    const conf = { knee:[150,'sine',.09], clap:[650,'triangle',.06],
      thumb:[980,'triangle',.05], word:[1300,'square',.05], fail:[90,'sawtooth',.35], clink:[2350,'sine',.22] }[type];
    o.frequency.value = conf[0]; o.type = conf[1];
    g.gain.setValueAtTime(type==='word'?0.12:0.22, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + conf[2]);
    o.connect(g).connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + conf[2]);
  }catch(e){}
}

/* ---- 랭킹 (localStorage에 저장, 실패하면 메모리만) ---- */
const REC_KEY = "random-game-rec";
const REC = (() => { try{ return JSON.parse(localStorage.getItem(REC_KEY)) || {}; }catch(e){ return {}; } })();   // { key: { val, label } }
function saveRec(key, val, labelFn){
  if(!REC[key] || val > REC[key].val){
    REC[key] = { val, label: labelFn(val) };
    try{ localStorage.setItem(REC_KEY, JSON.stringify(REC)); }catch(e){}
  }
}

/* ---- 엔진 공통 ---- */
/* 판 상태 정리: over 표시 → 루프·타이머 취소. 이미 예약된 콜백은 over를 보고 멈춘다 */
function haltState(S){
  if(!S) return;
  S.over = true;
  cancelAnimationFrame(S.raf); clearTimeout(S.timer);
  if(S.timers) S.timers.forEach(clearTimeout);
}
/* 걸렸을 때 공통 처리: 효과음·흔들기·기록 저장·"마셔~" 메시지·재시작 버튼
   html을 주면 기본 메시지 대신 그걸 쓰고, extra는 기록 줄 뒤에 붙는다 */
function showLose({ key, val, loser, msgId, restartId, why = "", html, drink = "마셔~ 마셔~ 🍺", extra = "" }){
  cancelCatch();
  click('fail'); shakeSeat(loser); combo = 0;
  cancelAsk();
  CUR_SEATS.forEach(s => s.persona && bubbleSay(s, s.persona.gloat, 2500));   // 콤이들이 성격대로 한마디
  const gl = rndOf(CUR_SEATS.filter(s => s.persona)); if(gl) chatPost(gl, gl.persona.gloat);
  const spared = rule("shield") && !shieldUsed;   // 오늘의 룰: 첫 잔은 봐줌
  if(spared){ shieldUsed = true; stamp("🛡️ 봐줌!", "rule"); chatPost("sys", "🛡️ 첫 잔은 봐줬다! 다음은 없어"); }
  else { chatPost("sys", `🍺 ${CUR_SEATS[0] ? CUR_SEATS[0].name : "나"} ${drinks + 1}잔째`); setDrunk(drinks + 1); }
  sessionScore += val;
  const g = gamesByKey[key];
  const head = html !== undefined ? html : `${why} <b class="drink">${loser.name}</b> ${drink}`;
  /* 아직 버틸 만하면: 잠깐 쉬고 같은 게임을 이어서 */
  if(!spared) stamp("🍺 원샷!", "red");
  if(drinks < maxDrinks()){
    $(msgId).innerHTML = `${spared ? why + " <b>🛡️ 이번만 봐준다!</b>" : head}
      <span class="record-line">${drinks}잔째... ${maxDrinks()}잔이면 끝! 정신 차리고 다시~</span>`;
    const tok = loseToken;
    const go = () => {
      if(tok !== loseToken) return;   // 그 사이 메뉴로 나갔거나 새로 시작함
      continuing = true; stopAll(); ENGINE_OF[key].start(key); continuing = false;
    };
    /* 가끔 이어 하기 전에 해장 이벤트 */
    setTimeout(() => { if(tok === loseToken) (!spared && Math.random() < 0.6 ? hangover(go) : go()); }, 1800);
    return;
  }
  /* 만취: 진짜 끝 */
  if(caughtCount) extra += ` · 잡은 콤이 ${caughtCount}명`;
  saveRec(key, sessionScore, g.recLabel);
  $(msgId).innerHTML = `${head} <b>만취! 🥴</b>
    <span class="record-line">이번 판 합계: ${g.recLabel(sessionScore)}${extra} · 최고 기록 ${REC[key].label}</span>`;
  $(restartId).classList.remove("hidden");
}

/* ================= ① 입장 → ② 구호 → ③ 메뉴 ================= */
$("start-btn").addEventListener("click", enter);
$("name-input").addEventListener("keydown", e => { if(e.key==="Enter") enter(); });
function enter(){
  audio();
  playerName = $("name-input").value.replace(/[<>&"']/g, "").trim() || "아무개";   // 이름은 여러 곳의 innerHTML에 들어가므로 HTML 특수문자 제거
  showScreen("chant-screen");
  const crowd = $("chant-crowd"); crowd.innerHTML = "";
  ["funny", "scary", "sad"].forEach((face, i) => {
    const d = document.createElement("div");
    d.className = `doodle bounce face-${face}`;
    d.style.animationDuration = (60 / CHANT_BPM * 2) + "s";   // 구호 박자에 맞춰 들썩
    d.style.animationDelay = (i * 0.12) + "s";
    d.innerHTML = doodleSVG(face); crowd.appendChild(d);
  });
  /* 구호 박자에 맞춰 다 같이 아이엠 그라운드 손동작 */
  let beat = 0;
  clearInterval(enter.poseTimer);
  enter.poseTimer = setInterval(() => {
    if($("chant-screen").classList.contains("hidden")) return clearInterval(enter.poseTimer);
    const name = POSES[beat++ % 4];
    crowd.querySelectorAll(".doodle").forEach(d => pose(d, name));
  }, 60000 / CHANT_BPM);
  const el = $("chant-text");
  playChant(playerName, text => {
    el.textContent = text;
    el.classList.remove("chant-pop"); void el.offsetWidth; el.classList.add("chant-pop");
  }, () => {
    if(!$("chant-screen").classList.contains("hidden")) showScreen("menu-screen");
  });
}
/* "← 메뉴" 버튼: 게임 화면은 나중에 addScreen으로 붙으므로 document에서 위임 처리 */
document.addEventListener("click", e => {
  if(!e.target.closest("[data-menu]")) return;
  stopAll(); resetSession(); chatStop(); $("drunk-gauge").classList.add("hidden");
  document.body.classList.remove("fog"); $("event-modal").classList.add("hidden");
  showScreen("menu-screen"); $("slot-box").innerHTML = "&nbsp;";
});

/* ================= 게임 등록 =================
   각 게임 파일(js/games/*.js)이 registerGame(설정, 엔진)으로 자기를 등록한다.
   - 설정: key, emj, nm, tg, intro, rules, recLabel (메뉴·룰·랭킹에 쓰임)
   - 엔진: { start(key), stop() }
   GAMES 순서 = index.html에서 게임 파일을 불러오는 순서 = 메뉴에 보이는 순서 */
const GAMES = [], gamesByKey = {}, ENGINE_OF = {};
/* 게임·엔진 파일이 자기 화면 HTML을 붙인다. 파일 맨 위에서 불러야 아래 코드가 그 화면을 찾을 수 있다 */
function addScreen(html){ $("rule-modal").insertAdjacentHTML("beforebegin", html); }
function registerGame(meta, engine){
  if(gamesByKey[meta.key]) console.error(`[랜덤게임] 게임 key 중복: ${meta.key}`);
  if(meta.flub) meta.rules.push(FLUB_RULE);
  GAMES.push(meta); gamesByKey[meta.key] = meta; ENGINE_OF[meta.key] = engine;
}

/* ================= 메뉴 동작 ================= */
let pendingGame = null;
function openRules(key){
  const g = gamesByKey[key];
  pendingGame = key;
  $("rule-title").innerHTML = `${g.emj} ${g.nm}`;
  $("rule-intro").textContent = `🎵 "${g.intro}"`;
  $("rule-list").innerHTML = g.rules.map(l => `<li>${l}</li>`).join("");
  $("rule-start").style.display = "inline-block";
  $("rule-modal").classList.remove("hidden");
}
$("rule-x").addEventListener("click", () => { $("rule-modal").classList.add("hidden"); pendingGame = null; });
$("rule-start").addEventListener("click", () => {
  $("rule-modal").classList.add("hidden");
  const k = pendingGame; pendingGame = null;
  if(k) launchGame(k);
});
function launchGame(k){
  stopAll(); resetSession(); pickRule(); $("drunk-gauge").classList.remove("hidden");
  ENGINE_OF[k].start(k);
  chatStart(); announceRule();
}
/* 랜덤게임 시작: 슬롯 연출 후 룰 모달 → 시작 */
$("menu-random").addEventListener("click", () => {
  const btn = $("menu-random");
  if(btn.disabled) return;
  btn.disabled = true;
  let step = 0, total = 12 + Math.floor(Math.random()*8), delay = 70;
  let i = Math.floor(Math.random()*GAMES.length);
  (function spin(){
    const g = GAMES[i % GAMES.length];
    $("slot-box").textContent = `${g.emj} ${g.nm}`;
    click('thumb');
    step++;
    if(step < total){ i++; delay *= 1.14; setTimeout(spin, delay); }
    else {
      click('word');
      $("slot-box").textContent = `👉 ${g.emj} ${g.nm}!`;
      setTimeout(() => { btn.disabled = false; openRules(g.key); }, 500);
    }
  })();
});
/* 게임 설명 목록 */
$("menu-explain").addEventListener("click", () => { renderExplain(); showScreen("explain-screen"); });
function renderExplain(){
  const list = $("explain-list"); list.innerHTML = "";
  GAMES.forEach(g => {
    const b = document.createElement("button");
    b.innerHTML = `<span>${g.emj} ${g.nm}</span><span class="tg">${g.tg}</span>`;
    b.addEventListener("click", () => openRules(g.key));
    list.appendChild(b);
  });
}
/* 게임 골라서 하기 = 설명 목록 재활용 */
$("menu-pick").addEventListener("click", () => { renderExplain(); showScreen("explain-screen"); });
/* 랭킹 */
$("menu-rank").addEventListener("click", () => {
  const t = $("rank-table");
  t.innerHTML = GAMES.map(g => {
    const r = REC[g.key];
    return `<tr><td>${g.emj} ${g.nm}</td><td>${r ? r.label : "—"}</td></tr>`;
  }).join("");
  showScreen("rank-screen");
});
