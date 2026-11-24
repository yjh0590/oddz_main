/* 이 파일의 함수·변수는 이 게임 안에서만 보인다 (다른 게임과 이름이 겹쳐도 안전) */
(() => {

registerGxGame(
  {key:"record", emj:"🎵", nm:"레코드 게임", tg:"릴레이·지식",
    intro:"레코드~ 레코드~ 칙칙폭폭!",
    rules:["아무 노래 <b>제목</b>이나 대며 릴레이!",
      "이미 나온 제목은 다시 말하면 안 돼.",
      "시간 초과되면 벌칙!",
      "가사가 아니라 <b>제목만</b> 말하면 돼."],
    recLabel: v => `제목 ${v}개`},
  /* 엔진 설정 */ { title:"🎵 레코드 게임", flub:true, start(GX){ GX.data.used=new Set(); GX.data.turn=0; recordRound(GX); } }
);

/* ---- 레코드 게임 ---- */
const RECORD_TITLES = ["다이너마이트","봄날","작은 것들을 위한 시","벚꽃 엔딩","좋은 날","여행","밤편지","아로하","고백","안녕"];
function recordRound(GX){
  if(!GX||GX.over) return;
  GX.round++;
  const cur = GX.data.turn;
  GX.seats.forEach((p,i)=>p.el.classList.toggle("turn", i===cur));
  if(cur===0){
    $("gx-center").innerHTML = "노래 제목을 하나 대라! 💬 <b>채팅으로 쳐!</b> (중복 불가)";
    askChat("노래 제목 (엔터)", raw => {
      if(!GX || GX.over) return;
      if(GX.data.used.has(raw)) return gxFail(`"${esc(raw)}"는 이미 나왔다!`, GX.round-1);
      GX.data.used.add(raw); click('word'); hop(GX.seats[0]);
      gxClearTimer();
      GX.data.turn=(GX.data.turn+1)%4;
      gxSafeNext(()=>recordRound(GX), 500);
    });
    gxSetTimer(Math.max(4500, 8000-GX.round*150), () => { cancelAsk(); gxFail("시간 초과!", GX.round-1); });
  } else {
    GX.data.turn=(cur+1)%4;
    gxNpc(GX, cur, flub => {
      const pool = RECORD_TITLES.filter(t=>!GX.data.used.has(t));
      if(!pool.length) flub = true;                      // 새 제목이 바닥나면 어쩔 수 없이 중복
      if(!GX.data.used.size) flub = false;
      const t = flub ? rndOf([...GX.data.used]) : rndOf(pool);   // 틀리면 이미 나온 제목
      GX.data.used.add(t);
      $("gx-center").innerHTML = `<b>${GX.seats[cur].name}</b>: "${esc(t)}!"`;
      bubbleSay(GX.seats[cur], t, 1000); click('word'); hop(GX.seats[cur]);
      return flub;
    }, () => recordRound(GX), 800, GX.round-1);
  }
}


})();
