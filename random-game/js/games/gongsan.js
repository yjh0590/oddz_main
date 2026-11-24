/* 이 파일의 함수·변수는 이 게임 안에서만 보인다 (다른 게임과 이름이 겹쳐도 안전) */
(() => {

registerGame(
  {key:"gongsan", flub:true, emj:"✊", nm:"공산당", tg:"왕게임·복불복",
    intro:"공~산당 공산당 공~산당 공산당!",
    rules:["발언권을 가진 <b>수령</b>이 \"동무!\" 하며 마음대로 지시!",
      "수령이 되면 제한 시간 안에 동무를 지목하라우!",
      "지시 복불복: <b>\"바로 마시라우!\"</b>가 나한테 떨어지면 끝... 🍺",
      "그 외 지시는 발언권이 넘어가며 계속! 몇 라운드나 버틸까?"],
    recLabel: v => `${v}라운드 생존`},
  /* 엔진 */ { start: startGongsan, stop: stopGongsan }
);

/* ---- 화면: 공산당 (왕게임) ---- */
addScreen(/*html*/ `
<div id="gongsan-screen" class="screen hidden">
  <button class="btn-small back-corner" data-menu>← 메뉴</button>
  <div style="font-size:28px;font-weight:700;">✊ 공산당</div>
  <div id="gs-center" class="big-center">공~산당 공산당!</div>
  <div class="timer-wrap"><div id="bar-gs" class="timer-bar"></div></div>
  <div id="table-gs" class="seat-table"></div>
  <div id="msg-gs" class="msg"></div>
  <div id="gs-targets" class="btn-row"></div>
  <button id="restart-gs-btn" class="hidden btn-green">다시 하기</button>
</div>
`);

/* ================= 공산당 (왕게임·복불복) ================= */
const GS_ORDERS = [   // [멘트, 벌칙 여부]
  ["바로 마시라우!", true],
  ["원샷 하라우!", true],
  ["옆 동무와 러브샷 하라우~", false],
  ["재롱 부리라우!", false],
  ["애교 보이라우~", false],
  ["건배사 외치라우!", false],
  ["만세 삼창 하라우!", false],
  ["발언권 넘기갔어. 잘 하라우~", false],
];
let GS = null;
function startGongsan(){
  showScreen("gongsan-screen");
  GS = { seats: buildSeats("table-gs"), holder: 0, round: 0, over: false,
    limit: 4000, deadline: 0, raf: 0, timer: 0 };
  $("msg-gs").textContent = "";
  $("gs-targets").innerHTML = "";
  $("restart-gs-btn").classList.add("hidden");
  $("gs-center").innerHTML = "공~산당 공산당! 공~산당 공산당! ✊";
  GS.timer = setTimeout(nextGongsan, 1000);
  GS.raf = requestAnimationFrame(loopGongsan);
}
function stopGongsan(){ haltState(GS); GS = null; }
function nextGongsan(){
  if(!GS || GS.over || closeCatch()) return;
  GS.round++;
  GS.seats.forEach((p,i) => p.el.classList.toggle("turn", i === GS.holder));
  const p = GS.seats[GS.holder];
  $("gs-targets").innerHTML = "";
  if(p.isHuman){
    GS.limit = Math.max(6000, 10000 - 200 * (GS.round - 1));
    GS.deadline = performance.now() + GS.limit;
    $("gs-center").innerHTML = `네가 <b>수령</b>이다! ✊ 💬 <b>채팅으로 명령</b>하라우!`;
    $("msg-gs").textContent = "예: \"슬픈 동무 노래 하라우\" · \"무서운 동무 원샷!\" (마시·원샷·잔 → 벌칙주)";
    askChat("누구 + 명령 (예: 재밌는 동무 애교!)", raw => {
      if(!GS || GS.over) return;
      const who = [1,2,3].find(i => raw.includes(GS.seats[i].name.split(" ")[0])) || rndOf([1,2,3]);
      const penalty = /마시|마셔|원샷|잔|짠|술/.test(raw);
      orderGongsan(0, who, [raw, penalty]);
    });
  } else {
    GS.deadline = 0;
    $("msg-gs").textContent = `${p.name} 수령이 노려본다...`;
    GS.timer = setTimeout(() => {
      if(!GS || GS.over) return;
      const target = rndOf([0,1,2,3].filter(i => i !== GS.holder && (i === 0 ? Math.random() < 0.6 : true)));
      orderGongsan(GS.holder, target);
    }, 900 + Math.random()*800);
  }
}
/* custom = [멘트, 벌칙 여부]: 내가 채팅으로 내린 명령 */
function orderGongsan(from, target, custom){
  if(!GS || GS.over) return;
  GS.deadline = 0;
  $("gs-targets").innerHTML = "";
  const [ment, isPenalty] = custom || rndOf(GS_ORDERS);
  const F = GS.seats[from], T = GS.seats[target];
  $("gs-center").innerHTML = custom ? `<b>${F.name}</b> 🫵 "${esc(ment)}" → <b>${T.name}</b>` : `<b>${F.name}</b> 🫵 "<b>${T.name}</b> 동무! ${ment}"`;
  bubbleSay(F, "동무!", 900);
  click('word'); hop(F);
  GS.timer = setTimeout(() => {
    if(!GS || GS.over) return;
    if(isPenalty){
      if(T.isHuman) return failGongsan(`수령의 명령이다... "${ment}"`);
    }
    /* 틀리면: 벌칙인데 마시는 척만 하거나, 명령에 "싫은데?" 하고 개김 */
    const flub = flubRoll(target, 1 + GS.round*0.03);
    GS.holder = target;
    if(isPenalty){
      bubbleSay(T, flub ? "(마시는 척...) 🤫" : "크윽... 🍺", 1200);
      click('fail'); hop(T);
      $("msg-gs").textContent = flub ? `${T.name}... 잔이 그대로인데?` : `${T.name} 원샷! 게임은 계속된다...`;
    } else {
      bubbleSay(T, flub ? "싫은데?" : custom ? ({ funny: "🎤 랄랄라~ 신난다!", scary: "...(마지못해 함)", sad: "흑... 알겠어요..." }[T.face] || "알갔습네다!") : "알갔습네다!", 1200);
      click('word'); hop(T);
    }
    if(!T.isHuman) openCatch(T, flub, catchStd("msg-gs", failGongsan, () => { clearTimeout(GS.timer); GS.timer = setTimeout(nextGongsan, 1500); }));
    GS.timer = setTimeout(nextGongsan, 1100);
  }, 900);
}
function loopGongsan(now){
  if(!GS || GS.over) return;
  const bar = $("bar-gs");
  if(GS.seats[GS.holder].isHuman && GS.deadline){
    const remain = Math.max(0, GS.deadline - now);
    const ratio = remain / GS.limit;
    bar.style.width = (ratio*100) + "%";
    bar.classList.toggle("low", ratio < 0.35);
    if(remain <= 0) return failGongsan("수령이 우물쭈물?! 반동분자다!");
  } else { bar.style.width = "100%"; bar.classList.remove("low"); }
  GS.raf = requestAnimationFrame(loopGongsan);
}
function failGongsan(why){
  if(!GS || GS.over) return;
  haltState(GS);
  $("gs-targets").innerHTML = "";
  showLose({ key: "gongsan", val: GS.round, loser: GS.seats[0], msgId: "msg-gs", restartId: "restart-gs-btn",
    why, drink: "마시라우~ 🍺" });
}
$("restart-gs-btn").addEventListener("click", () => { stopGongsan(); startGongsan(); });

})();
