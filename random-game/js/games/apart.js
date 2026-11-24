/* 이 파일의 함수·변수는 이 게임 안에서만 보인다 (다른 게임과 이름이 겹쳐도 안전) */
(() => {

registerGxGame(
  {key:"apart", emj:"🏢", nm:"아파트", tg:"복불복 리빌",
    intro:"아~파트 아파트, 아~파트 아파트!",
    rules:["술래가 외친 <b>층수</b>만큼 손을 하나씩 뺀다!",
      "[손 빼기 시작!]을 누르면 순서대로 손이 빠져나가.",
      "층수에 걸린 손의 주인이 벌칙!",
      "라운드마다 층수가 랜덤으로 바뀐다."],
    recLabel: v => `${v}라운드 생존`},
  /* 엔진 설정 */ { title:"🏢 아파트", start(GX){ apartRound(GX); } }
);

/* ---- 아파트 ---- */
function apartRound(GX){
  if(!GX||GX.over) return;
  GX.round++;
  const floor = 8 + Math.floor(Math.random()*13);
  const startIdx = Math.floor(Math.random()*4);
  const ans = (startIdx + floor - 1) % 4;
  $("gx-center").innerHTML = `술래: "<b>${floor}층!</b>" 1층은 <b>${GX.seats[startIdx].name}</b>부터, 시계 방향(나→왼쪽→맞은편→오른쪽)으로 쌓는다`;
  $("msg-gx").textContent = "🧮 계산해! 누가 걸릴까? 맞히면 피한다";
  GX.seats.forEach((p,i)=>p.el.classList.toggle("turn", i===startIdx));
  gxPredict(GX, ans, Math.max(2500, 6000 - 200*GX.round), GX.round-1, () => {
    let count = 0;
    const tick = () => {
      if(!GX||GX.over) return;
      count++;
      const idx = (startIdx + count - 1) % 4;
      GX.seats.forEach((p,i)=>p.el.classList.toggle("turn", i===idx));
      if(count >= floor){
        const loser = GX.seats[idx];
        if(loser.isHuman){ $("msg-gx").textContent = "내 손이었지만... 알고 있었지! 쏙 뺐다 😎"; click('word'); }
        else { $("msg-gx").innerHTML = `<b>${loser.name}</b> 손이 걸렸다! 원샷~ 🍺`; npcDrinks(loser); }
        gxSafeNext(()=>apartRound(GX), 1300);
        return;
      }
      GX.timer = setTimeout(tick, Math.max(60, 200 - count*4));
    };
    tick();
  });
}

})();
