/* 이 파일의 함수·변수는 이 게임 안에서만 보인다 (다른 게임과 이름이 겹쳐도 안전) */
(() => {

registerGxGame(
  {key:"pado2", emj:"🏄", nm:"파도게임 (단체)", tg:"복불복·왕게임",
    intro:"파도가 친다~ 짝짝짝짝!",
    rules:["리더가 <b>파도의 방향과 양</b>을 정해서 지시!",
      "그 방향 순서대로 다같이 술잔을 비운다.",
      "내가 리더면 시간 안에 지시를 내려야 해.",
      "리더는 매 라운드 랜덤으로 바뀐다."],
    recLabel: v => `${v}라운드 생존`},
  /* 엔진 설정 */ { title:"🏄 파도게임 (단체)", start(GX){ pado2Round(GX); } }
);

/* ---- 파도게임 (단체 잔 비우기) ---- */
function pado2Round(GX){
  if(!GX||GX.over) return;
  GX.round++;
  const leader = rndOf([0,1,2,3]);
  GX.seats.forEach((p,i)=>p.el.classList.toggle("turn", i===leader));
  $("gx-controls").innerHTML="";
  if(leader===0){
    $("gx-center").innerHTML = "네가 리더다! 파도를 지시하라!";
    gxBtn("🌊 왼쪽으로 반 잔!", () => resolvePado2(GX, "왼쪽으로 반 잔", 0));
    gxBtn("🌊 오른쪽으로 한 잔!", () => resolvePado2(GX, "오른쪽으로 한 잔", 0));
    gxSetTimer(Math.max(1000,2800-80*GX.round), () => gxFail("지시를 못 내렸다!", GX.round-1));
  } else {
    /* 콤이가 리더: 지시대로 내 몸으로! 왼쪽=왼쪽으로 쓸기, 오른쪽=오른쪽으로 쓸기, 원샷=꾹 눌러 끝까지 */
    const o = rndOf(["왼쪽으로 반 잔","오른쪽으로 한 잔","전체 원샷 파도"]);
    $("gx-center").innerHTML = `<b>${GX.seats[leader].name}</b>: "<b>${o}</b> 파도!" 🌊`;
    bubbleSay(GX.seats[leader], o + "!", 1200); click('word'); hop(GX.seats[leader]);
    const ok = () => { click('clink'); hop(GX.seats[0]); gxClearTimer(); gxSafeNext(() => resolvePado2(GX, o, leader), 300); };
    const wrong = why => gxFail(why, GX.round-1);
    if(o === "전체 원샷 파도"){
      gxHold("🍺 원샷!", 0.85, lv => lv < 0.85 ? wrong("원샷이라며! 잔이 남았다!") : lv > 1.05 ? wrong("너무 마셔서 사레들렸다! 🤧") : ok());
    } else {
      const want = o.startsWith("왼") ? "left" : "right";
      const go = d => { if(d !== "left" && d !== "right") return; gxInput(null); d === want ? ok() : wrong("반대쪽으로 보냈다!"); };
      gxInput({ swipe: go, key: e => e.key === "ArrowLeft" ? (go("left"), true) : e.key === "ArrowRight" ? (go("right"), true) : false },
        "🌊 지시대로 <b>쓸어서</b> 잔을 넘겨! (← → 도 OK)");
    }
    gxSetTimer(Math.max(1600, 3200 - 80*GX.round), () => { gxInput(null); wrong("파도를 놓쳤다!"); });
  }
}
function resolvePado2(GX, order, leader){
  gxClearTimer(); $("gx-controls").innerHTML="";
  $("gx-center").innerHTML = `<b>${GX.seats[leader].name}</b>: "${order} 파도!" 🌊`;
  bubbleSay(GX.seats[leader], "파도!", 900); click('word'); hop(GX.seats[leader]);
  $("msg-gx").textContent = "다같이 파도 이행 중...";
  gxSafeNext(()=>pado2Round(GX), 1000);
}

})();
