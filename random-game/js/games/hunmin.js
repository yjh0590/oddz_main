/* 이 파일의 함수·변수는 이 게임 안에서만 보인다 (다른 게임과 이름이 겹쳐도 안전) */
(() => {

registerGxGame(
  {key:"hunmin", emj:"🔤", nm:"훈민정음", tg:"단어 순발력",
    intro:"훈~민정음 훈~민정음!",
    rules:["술래가 외친 <b>자음 두 개</b>로 시작하는 단어를 대라!",
      "💬 <b>채팅으로 직접 쳐서</b> 답해! (예: ㄱㅂ → 가방, 고백...)",
      "이미 나온 단어, 틀린 자음 단어 = 탈락!",
      "시간이 <b>점점 짧아져!</b> ⚡"],
    recLabel: v => `${v}라운드 생존`},
  /* 엔진 설정 */ { title:"🔤 훈민정음", flub:true, start(GX){ GX.data.used=new Set(); hunminRound(GX); } }
);

/* ---- 훈민정음 ---- */
const HUNMIN_BANK = {
  "ㄱㅂ": ["가방","고비","구비"],
  "ㅂㅈ": ["바지","부자","보증"],
  "ㅅㄱ": ["사과","소고기","시금치"],
  "ㅁㅊ": ["미치광이","무침","마차"],
  "ㅇㅅ": ["의사","연습","우산"],
  "ㅎㅅ": ["학생","호수","화살"]
};
/* 단어의 초성 (한글이 아니면 ?) */
const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
function choOf(w){ return [...w].map(c => { const k = c.charCodeAt(0) - 0xAC00; return k >= 0 && k < 11172 ? CHO[Math.floor(k/588)] : "?"; }).join(""); }
/* 내 다음엔 콤이 한 명이 같은 자음으로 받는다. 틀리면 이미 나온 단어나 다른 자음 단어 */
function hunminNpc(GX, combo){
  const idx = rndOf([1,2,3]);
  GX.seats.forEach((p,i)=>p.el.classList.toggle("turn", i===idx));
  gxNpc(GX, idx, flub => {
    const valid = HUNMIN_BANK[combo].filter(w=>!GX.data.used.has(w));
    if(!valid.length) flub = true;
    const trap = [...GX.data.used, ...Object.values(HUNMIN_BANK).flat().filter(w=>!HUNMIN_BANK[combo].includes(w))];
    const w = flub ? rndOf(trap) : rndOf(valid);
    GX.data.used.add(w);
    $("gx-center").innerHTML = `술래: "<b>${combo}</b>!" — <b>${GX.seats[idx].name}</b>: "${esc(w)}!"`;
    bubbleSay(GX.seats[idx], w+"!", 900); click('word'); hop(GX.seats[idx]);
    return flub;
  }, () => hunminRound(GX), 1100, GX.round-1);
}
function hunminRound(GX){
  if(!GX||GX.over) return;
  GX.round++;
  const combo = rndOf(Object.keys(HUNMIN_BANK));
  $("gx-center").innerHTML = `술래: "<b>${combo}</b>!" 엄지를 세웠다... 시작하는 단어를 외쳐라!`;
  $("gx-controls").innerHTML = "";
  $("gx-center").innerHTML = `술래: "<b>${combo}</b>!" 💬 <b>${combo}</b>로 시작하는 단어를 채팅으로 쳐!`;
  askChat(`${combo}로 시작하는 단어 (엔터)`, raw => {
    if(!GX || GX.over) return;
    const w = raw.replace(/\s/g, "");
    if(GX.data.used.has(w)) return gxFail(`"${esc(w)}"...는 이미 나온 단어다!`, GX.round-1);
    if(w.length < 2 || !choOf(w).startsWith(combo)) return gxFail(`"${esc(w)}"는 ${combo}로 시작하지 않잖아! (${choOf(w)})`, GX.round-1);
    GX.data.used.add(w);
    click('word'); hop(GX.seats[0]);
    gxClearTimer();
    $("msg-gx").textContent = "";
    gxSafeNext(()=>hunminNpc(GX, combo), 500);
  });
  gxSetTimer(Math.max(4000, 7500 - 150*GX.round), () => { cancelAsk(); gxFail("너무 늦었다! 손 잡혔다!", GX.round-1); });
}

})();
