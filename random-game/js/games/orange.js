/* 이 파일의 함수·변수는 이 게임 안에서만 보인다 (다른 게임과 이름이 겹쳐도 안전) */
(() => {

registerGxGame(
  {key:"orange", emj:"🍊", nm:"오렌지", tg:"리액션 릴레이",
    intro:"오렌지~ 오렌지~ 오렌지~ 오~",
    rules:["오렌지를 <b>점점 크게</b> 외치며 다음 사람에게 패스!",
      "내 차례엔 시간 안에 리액션 버튼을 눌러야 해.",
      "라운드가 갈수록 시간이 <b>점점 짧아져!</b> ⚡",
      "타이밍 놓치면 벌칙!"],
    recLabel: v => `${v}라운드 생존`},
  /* 엔진 설정 */ { title:"🍊 오렌지", flub:true, start(GX){ GX.data.passer=0; orangeRound(GX); } }
);

/* ---- 오렌지 ---- */
function orangeRound(GX){
  if(!GX||GX.over) return;
  GX.round++;
  const bangs = "!".repeat(Math.min(8, GX.round));
  const from = GX.data.passer;
  const target = gxPickTarget(from);
  GX.seats.forEach((p,i)=>p.el.classList.toggle("turn", i===from));
  if(from === 0){
    $("gx-center").innerHTML = `네 차례! 오렌지를 <b>더 크게</b> 키워서 외쳐라!`;
    const need = Math.min(0.88, 0.25 + 0.05*GX.round);   // 라운드마다 더 크게 질러야 한다
    gxHold("🍊 오렌지~", need, lv => {
      if(lv > 1) return gxFail("오렌지이이이이...! 목이 쉬었다! 🥴", GX.round-1);
      if(lv < need) return gxFail("목소리가 작아졌다! 더 크게 했어야지!", GX.round-1);
      const said = "오렌지" + "!".repeat(Math.max(1, Math.round(lv*8)));
      bubbleSay(GX.seats[0], said, 900); click('word'); hop(GX.seats[0]);
      GX.data.passer = target; gxClearTimer();
      gxSafeNext(()=>orangeRound(GX), 500);
    });
    gxSetTimer(Math.max(1900, 3400-60*GX.round), () => gxFail("리액션이 늦었다!", GX.round-1));
  } else {
    GX.data.passer = target;
    gxNpc(GX, from, flub => {
      if(GX.round < 3) flub = false;   // 처음엔 비교할 게 없다
      const said = "오렌지" + (flub ? "!".repeat(Math.max(0, bangs.length-3)) : bangs);   // 틀리면 안 키우고 작아짐
      $("gx-center").innerHTML = `<b>${GX.seats[from].name}</b>: "${said}"`;
      bubbleSay(GX.seats[from], said, 900); click('word'); hop(GX.seats[from]);
      return flub;
    }, () => orangeRound(GX), Math.max(400, 900-30*GX.round), GX.round-1);
  }
}

})();
