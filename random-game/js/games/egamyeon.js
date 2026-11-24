/* 이 파일의 함수·변수는 이 게임 안에서만 보인다 (다른 게임과 이름이 겹쳐도 안전) */
(() => {

registerGxGame(
  {key:"egamyeon", emj:"🛒", nm:"~에 가면", tg:"기억력",
    intro:"시장에 가면! 시장에 가면!",
    rules:["장소에 있을 법한 물건을 <b>하나씩 누적</b>해서 말해!",
      "내 차례엔 💬 <b>채팅으로</b> 지금까지 나온 걸 순서대로 + <b>새 물건 하나</b>를 쳐! (띄어쓰기로 구분)",
      "내 차례엔 목록이 안 보인다! 콤이들이 말할 때 외워 둬.",
      "목록이 길어질수록 어려워진다 🧠"],
    recLabel: v => `항목 ${v}개`},
  /* 엔진 설정 */ { title:"🛒 ~에 가면", flub:true, start(GX){ GX.data.list=[]; egamyeonRound(GX); } }
);

/* ---- ~에 가면 ---- */
const EGAMYEON_THEME = { place:"시장", items:["사과","배","수박","참외","딸기","고구마","감자","양파","당근","오이","호박","무","배추","마늘"] };
function egamyeonRound(GX){
  if(!GX||GX.over) return;
  GX.round++;
  const cur = (GX.round-1) % 4;
  GX.seats.forEach((p,i)=>p.el.classList.toggle("turn", i===cur));
  if(cur===0){
    const L = GX.data.list;
    $("gx-center").innerHTML = `<b>${EGAMYEON_THEME.place}에 가면!</b> 💬 ${L.length ? `지금까지 <b>${L.length}개</b>를 순서대로 + 새 물건 하나!` : "첫 물건을 쳐!"}`;
    $("gx-controls").innerHTML="";
    askChat(L.length ? `${L.length}개 순서대로 + 새 물건 (띄어쓰기)` : "시장에 있을 물건 하나", raw => {
      if(!GX || GX.over) return;
      const words = raw.split(/[\s,]+/).filter(Boolean);
      for(let i = 0; i < L.length; i++){
        if(words[i] !== L[i]) return gxFail(`${i+1}번째는 "${esc(L[i])}"였다! ${words[i] ? `("${esc(words[i])}" 아님)` : "(빼먹음)"}`, L.length);
      }
      const add = words[L.length];
      if(!add) return gxFail("새 물건을 안 붙였다!", L.length);
      if(L.includes(add)) return gxFail(`"${esc(add)}"는 이미 나왔다!`, L.length);
      L.push(add);
      click('word'); hop(GX.seats[0]);
      gxClearTimer();
      gxSafeNext(()=>egamyeonRound(GX), 700);
    });
    gxSetTimer(Math.max(6000, 4000 + L.length*1500), () => { cancelAsk(); gxFail("기억이 안 난다!", L.length); });
  } else {
    const pool = EGAMYEON_THEME.items.filter(w=>!GX.data.list.includes(w));
    const add = rndOf(pool.length?pool:EGAMYEON_THEME.items);
    GX.data.list.push(add);
    gxNpc(GX, cur, flub => {
      const said = [...GX.data.list];
      if(said.length < 3) flub = false;
      if(flub){ const k = Math.floor(Math.random()*(said.length-2)); [said[k], said[k+1]] = [said[k+1], said[k]]; }   // 틀리면 순서를 바꿔 말함
      $("gx-center").innerHTML = `<b>${GX.seats[cur].name}</b>: ${said.map(esc).join(", ")}...!`;
      bubbleSay(GX.seats[cur], add+"!", 900); click('word'); hop(GX.seats[cur]);
      return flub;
    }, () => egamyeonRound(GX), 1400, GX.data.list.length);
  }
}

})();
