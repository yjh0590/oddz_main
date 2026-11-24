/* ================= 단톡방 채팅 (모든 게임 공통) =================
   - 게임 중 화면 옆(좁으면 아래)에 채팅창이 뜬다. 콤이 셋이 성격대로 인사·잡담·대답을 한다.
   - 내가 아무 말이나 치면 콤이가 받아친다 (키워드에 맞는 성격이 먼저).
   - 정답을 쳐야 하는 게임은 askChat(안내, 처리함수)로 입력창을 "답 모드"로 바꾼다.
     답 모드에서 엔터 → 내 말로 올라가고 처리함수(text) 호출. 시간 초과·패배 땐 cancelAsk() */
const CHATTER = {
  funny: { hi: ["오늘 다 죽었어 ㅋㅋㅋ", "가즈아~~ 🎉", "첫 잔은 내가 쏜다 ㅋㅋ"],
    idle: ["ㅋㅋㅋㅋ 왜 이렇게 긴장해", "노래 한 곡 뽑을까?", "아 배고파 안주 시키자", "ㅋㅋㅋ 표정 봐", "이번엔 내가 이긴다!"],
    reply: ["ㅋㅋㅋㅋㅋ 뭐래", "인정 ㅋㅋ", "오 드립 좋은데?", "ㅋㅋ 그니까!", "아 그건 좀 ㅋㅋㅋ"] },
  scary: { hi: ["...시작하지.", "도망칠 생각은 하지 마."],
    idle: ["...보고 있다.", "크크...", "틀리면... 알지?", "...조용히 해.", "잔이 비었군."],
    reply: ["...그래서?", "크크크.", "...다시 말해봐.", "...흥.", "말이 많군."] },
  sad: { hi: ["저 오늘 컨디션 별로인데...", "살살 해주세요..."],
    idle: ["하아... 집에 가고 싶다", "오늘따라 술이 쓰네...", "다들 나만 노리는 것 같아...", "...비 온다", "나 사실 술 약한데..."],
    reply: ["...그렇구나", "고마워... 😢", "나도 그렇게 생각해...", "흑...", "응..."] },
};
/* 내 말에 이런 말이 있으면 그 성격이 받아친다 */
const KEYWORD_REPLY = [
  [/ㅋ|ㅎㅎ|웃기|재밌/, "funny", ["ㅋㅋㅋㅋㅋㅋㅋ", "ㅋㅋ 너 웃기다", "ㅋㅋㅋ 나만 웃긴 거 아니지?"]],
  [/무서|살려|소름/, "scary", ["...내가?", "크크크크.", "...이제 알았나."]],
  [/마셔|원샷|술|짠|건배/, "scary", ["...네가 마셔.", "크크... 잔 비워.", "...짠."]],
  [/힘내|괜찮|울지|슬퍼|우울/, "sad", ["고마워... 진짜로... 🥲", "...응, 힘낼게", "너밖에 없다..."]],
];
let chatAsk = null, chatIdle = 0;
function chatSeat(face){ return CUR_SEATS.find(s => s.face === face); }
/* who: 자리(콤이·나) 또는 "sys" */
function chatPost(who, text){
  const log = $("chat-log");
  const line = document.createElement("div");
  if(who === "sys"){ line.className = "chat-sys"; line.textContent = text; }
  else {
    line.className = "chat-line " + (who.isHuman ? "me" : "face-" + who.face);
    line.innerHTML = `<b>${who.isHuman ? "나" : who.name}</b><span></span>`;
    line.querySelector("span").textContent = text;
  }
  log.appendChild(line);
  while(log.children.length > 60) log.firstChild.remove();
  log.scrollTop = log.scrollHeight;
}
/* 콤이가 성격대로 한마디 (kind: hi · idle · reply) */
function npcChat(face, kind, delay = 0){
  const p = chatSeat(face); if(!p) return;
  setTimeout(() => { if(!$("chat").classList.contains("hidden")) chatPost(p, rndOf(CHATTER[face][kind])); }, delay);
}
/* 게임 시작: 채팅창 열고 인사. 가끔 혼잣말 */
function chatStart(){
  $("chat-log").innerHTML = ""; cancelAsk();
  $("chat").classList.remove("hidden"); document.body.classList.add("chat-on");
  ["funny", "scary", "sad"].sort(() => Math.random() - .5).forEach((f, i) => npcChat(f, "hi", 300 + i*700));
  clearInterval(chatIdle);
  chatIdle = setInterval(() => { if(Math.random() < .45) npcChat(rndOf(["funny", "scary", "sad"]), "idle"); }, 7000);
}
function chatStop(){ clearInterval(chatIdle); cancelAsk(); $("chat").classList.add("hidden"); document.body.classList.remove("chat-on"); }
/* 답 모드 */
function askChat(prompt, onSubmit){
  chatAsk = onSubmit;
  const inp = $("chat-input");
  inp.placeholder = prompt; inp.classList.add("ask"); inp.value = "";
  inp.focus();
}
function cancelAsk(){
  chatAsk = null;
  const inp = $("chat-input");
  inp.classList.remove("ask"); inp.placeholder = "아무 말이나 해봐 (엔터)";
}
function chatSend(){
  const inp = $("chat-input");
  const text = inp.value.trim().slice(0, 60);
  if(!text) return;
  inp.value = "";
  const me = CUR_SEATS[0];
  if(me){ chatPost(me, text); bubbleSay(me, text, 1100); }
  if(chatAsk){ const f = chatAsk; cancelAsk(); f(text); return; }
  /* 그냥 수다: 키워드에 맞는 성격이 먼저, 아니면 아무나 */
  const hit = KEYWORD_REPLY.find(([re]) => re.test(text));
  const p = hit ? chatSeat(hit[1]) : rndOf(CUR_SEATS.filter(s => !s.isHuman));
  if(p) setTimeout(() => chatPost(p, rndOf(hit ? hit[2] : CHATTER[p.face].reply)), 500 + Math.random()*700);
}
/* 한글 입력 중 엔터는 글자 확정에 쓰이므로 keyup에서 보낸다 */
$("chat-input").addEventListener("keydown", e => e.stopPropagation());   // 채팅 치는 동안 게임 단축키(스페이스·숫자)가 먹지 않게
$("chat-input").addEventListener("keyup", e => { e.stopPropagation(); if(e.key === "Enter") chatSend(); });
$("chat-send").addEventListener("click", chatSend);
