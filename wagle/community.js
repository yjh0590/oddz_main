const pick = (list, j) => list[j % list.length];

// 사이트 이름은 분위기 참고용 표기. 로고·상표 이미지는 쓰지 않는다.
export const communities = [
  { id: 'dc', name: '디시인사이드', desc: '최대급 익명 갤러리', symbol: 'D', tone: '#3b4890', wash: '#eceef7', like: '추천', board: true,
    nick: j => `ㅇㅇ(${pick(['118.235', '211.36', '39.7', '223.38', '175.223', '106.101'], j)})`,
    style: '디시 갤러리 말투. 짧고 건조한 반말, ㅋㅋ, ㄹㅇ, 개추, "응 아니야", 팩트 체크와 비꼼. 혐오 유래 어미(~노 등)와 비하 표현은 쓰지 않는다. 닉네임은 "ㅇㅇ(118.235)"처럼 ㅇㅇ과 IP 앞자리 형식.' },
  { id: 'fmkorea', name: '에펨코리아', desc: '남초 종합 커뮤니티', symbol: 'F', tone: '#2a62c8', wash: '#eaf0fb', like: '추천', board: true,
    nick: j => pick(['포텐가즈아', '눈팅만10년', '국축러', '펨창1호', '퇴근하고롤', '야구보는곰'], j),
    style: '펨코 말투. 20~30대 남성 반말, ㅋㅋ, "이건 ㄹㅇ 포텐", "형님들", 스포츠·게임 비유, 근거 따지기와 드립. 성별 갈등 조장이나 비하는 하지 않는다. 닉네임은 짧은 한국어 별명.' },
  { id: 'theqoo', name: '더쿠', desc: '여초 종합 커뮤니티', symbol: 'Q', tone: '#5a4a8c', wash: '#efedf6', like: '추천', board: true, numbered: true,
    nick: () => '무명의 더쿠',
    style: '더쿠 말투. 반말, "헐", "미친", "원덬", "케바케", ㅠㅠ, 과몰입 공감과 날카로운 정리. 닉네임은 항상 "무명의 더쿠".' },
  { id: 'instiz', name: '인스티즈', desc: '10~20대 연예·일상', symbol: 'i', tone: '#4b7bec', wash: '#ecf1fd', like: '추천',
    nick: j => `익인${j % 30 + 1}`,
    style: '인스티즈 익명 게시판 말투. 10~20대, "익들아", "쓰니", ㅠㅠ, 헐, 가벼운 반말 공감. 닉네임은 "익인7"처럼 익인+숫자.' },
  { id: 'pann', name: '네이트판', desc: '연애·결혼 사연 게시판', symbol: '판', tone: '#e5262f', wash: '#fdecec', like: '추천', board: true, dislike: true,
    nick: j => pick(['ㅇㅇ', 'ㅇㅇ', '지나가던사람', '판눈팅러', 'ㅇㅇ', '30대직장인'], j),
    style: '네이트판 댓글 말투. 존댓말과 반말 혼용, "글쓴이님", 사연에 몰입한 훈수와 판정, "와 읽다가 혈압", 경험담. 닉네임은 주로 "ㅇㅇ".' },
  { id: 'blind', name: '블라인드', desc: '직장인 익명 커뮤니티', symbol: 'B', tone: '#d93a3a', wash: '#fbeceb', like: '좋아요',
    nick: j => `${pick(['○○전자', '△△은행', '□□건설', '◇◇게임즈', '공무원', '☆☆증권'], j)} · ${pick(['jdk3s', 'qwe12', 'mnb7a', 'zzz91', 'kfo2p'], j + 2)}`,
    style: '블라인드 말투. 직장인 반말, 연봉·복지·회사 문화 비교, "팀바팀", "퇴사가 답", 현실적이고 냉소적. 닉네임은 "○○전자 · jdk3s"처럼 가상 회사명 · 랜덤 아이디.' },
  { id: 'everytime', name: '에브리타임', desc: '대학생 익명 커뮤니티', symbol: '에', tone: '#c62917', wash: '#faebe9', like: '공감',
    nick: j => `익명${j % 20 + 1}`,
    style: '에브리타임 말투. 대학생 반말, 과제·팀플·학점·취업 비유, ㅋㅋ, 짧은 공감과 현실 조언. 닉네임은 "익명3"처럼 익명+숫자.' },
  { id: 'daangn', name: '당근 동네생활', desc: '동네 이웃 이야기', symbol: '당', tone: '#ff6f0f', wash: '#fff1e7', like: '공감', polite: true,
    nick: j => `${pick(['감자', '토마토', '고구마', '양파', '오이'], j)}${pick(['러버', '조아', '네'], j + 1)} · ${pick(['역삼동', '망원동', '정자동', '송도동', '중동'], j + 2)}`,
    style: '당근 동네생활 말투. 이웃끼리의 친절한 존댓말, "~해요", :) , 동네 정보와 생활 경험, 조심스러운 이견. 닉네임은 "감자러버 · 망원동"처럼 별명 · 동네.' },
  { id: 'momcafe', name: '맘카페', desc: '지역 육아 카페', symbol: '맘', tone: '#03a94e', wash: '#e8f7ee', like: '좋아요', polite: true,
    nick: j => `${pick(['튼튼이', '콩이', '햇살이', '쑥쑥이', '복덩이'], j)}맘`,
    style: '지역 맘카페 말투. 정중한 존댓말, "맘님들", "저희 신랑은", ^^ ㅠㅠ, 육아·살림 경험 기반 공감과 정보. 닉네임은 "콩이맘"처럼 태명+맘.' },
  { id: 'x', name: 'X(트위터)', desc: '짧고 빠른 타임라인', symbol: 'X', tone: '#0f1419', wash: '#eef0f1', like: '♥', round: true,
    nick: j => `@${pick(['nobody_irl', 'oneline_tw', 'sleepy_cat', 'tl_kim', 'quote_mach'], j)}`,
    style: 'X(트위터) 말투. 1~2문장, 인용하고 싶은 재치, 괄호 속 혼잣말, 밈, 드물게 해시태그. 닉네임은 "@handle" 형식.' },
  { id: 'threads', name: '스레드', desc: '느슨한 일상 피드', symbol: '@', tone: '#3a3a3a', wash: '#f0f0f0', like: '♥', round: true,
    nick: j => pick(['daily.min', 'sooo_coffee', 'jy.log', 'moodboard_k', 'seoul.walk'], j),
    style: '스레드 말투. 담백한 반말 독백, 일상 공유, "나만 그래?", 이모지 약간, 부드러운 공감. 닉네임은 "jy.log"처럼 소문자 아이디.' },
];

export const samples = {
  opinion: [
    { label: '💼 주 4일제, 찬성?', text: '솔직히, 주 4일제는 이제 도입해야 하는 거 아님?' },
    { label: '🍍 피자 위 파인애플', text: '파인애플 피자가 제일 맛있다고 생각해. 반박 받음.' },
    { label: '💬 읽씹 vs 안읽씹', text: '읽씹보다 안읽씹이 더 서운한 건 나뿐이야?' },
  ],
  diary: [
    { label: '☕ 오늘도 야근한 AI', text: '오늘 내 AI한테 기획서 수정을 열 번이나 부탁했어.' },
    { label: '💌 연애 상담하는 AI', text: '내 AI한테 전 애인에게 보낼 카톡을 써달라고 했어.' },
    { label: '🥗 식단 짜주는 AI', text: 'AI한테 다이어트 식단을 짜달라고 하고 야식을 시켰어.' },
  ],
};

const voices = {
  dc: ['ㄹㅇ 이건 개추 ㅋㅋ', '응 아니야~ 반대쪽 얘기도 들어봐라', '이걸 진지하게 쓴 거임? ㅋㅋㅋ', '근데 솔직히 틀린 말은 아님'],
  fmkorea: ['형님들 이건 인정하고 갑시다 ㅋㅋ', '이 글 포텐 간다 ㄹㅇ', '전반전만 보고 결론 내면 안 됨', '근거 하나만 가져와 보셈 ㅋㅋ'],
  theqoo: ['헐 미친 나만 이렇게 생각한 거 아니었구나', '원덬 맘 너무 알 것 같아ㅠㅠ', '근데 이건 진짜 케바케임', '아 이건 좀... 다른 시각도 있을 듯'],
  instiz: ['헐 익들아 나도ㅠㅠ', '쓰니 맘 완전 이해함', '이건 좀 아닌 듯..?', '나 이거 친구랑 얘기하다 싸웠잖아ㅋㅋ'],
  pann: ['글쓴이님 이건 진짜 아닙니다', '와 읽다가 혈압 올라서 로그인함', '제 경험상 말씀드리면 대화가 먼저예요', '이거 판에서 또 난리나겠네요'],
  blind: ['저희 회사는 이미 함. 근데 실상은 다름', '연봉부터 까고 얘기하시죠', '팀바팀임. 팀장 따라 천국과 지옥', '결국 퇴사가 답이더라'],
  everytime: ['과제하다 이거 보고 웃음 ㅋㅋ', '팀플보다는 이게 덜 스트레스임', '졸업하면 생각 달라짐 ㄹㅇ', '이거 우리 학교 얘기임?'],
  daangn: ['저희 동네도 그래요~ 공감해요 :)', '이웃님 말씀 이해돼요!', '저는 조금 다르게 생각해요 ㅎㅎ', '좋은 이야기 나눠주셔서 감사해요 :)'],
  momcafe: ['저도 그래요ㅠㅠ 애 키우다 보니까요', '맘님들 생각은 어떠세요?', '저희 신랑은 반대하더라구요^^', '공감합니다~ 좋은 하루 되세요^^'],
  x: ['이거 진짜임 (진짜임)', '오늘 타임라인 주제 정해졌다', '하… 이걸 이제 알았네', '알티 누르려다 멈칫함'],
  threads: ['나만 이런 생각 하는 거 아니었구나 🫠', '오늘 이 얘기 계속 생각날 듯', '천천히 생각해봐도 괜찮을 거 같아', '이런 대화 좋다 ☕'],
};

function topicLine(text, index) {
  if (/4일|출근|퇴근|회사|직장|기획서|야근/.test(text)) return ['일하는 시간보다 결과를 봐야 한다는 쪽임.', '근데 업무량 그대로면 남은 날에 다 몰리는 거 아냐?', '출근하는 나와 쉬는 나의 의견이 다릅니다.', '업종마다 사정이 달라서 한 번에 바꾸긴 어렵겠지.'][index % 4];
  if (/피자|파인애플|음식|식단|야식|다이어트/.test(text)) return ['취향 존중은 하는데 내 한 조각은 따로 빼줘 ㅋㅋ', '먹는 즐거움도 중요하지. 대신 선택은 각자 하는 걸로.', '이걸로 싸울 시간에 한 입 더 먹겠음.', '같이 먹을 사람한테 먼저 물어보는 게 정답 아닐까.'][index % 4];
  if (/연애|애인|읽씹|안읽|카톡|연락|사랑/.test(text)) return ['연락 하나에도 신경 쓰이는 마음은 이해함.', '바빴을 가능성도 있으니까 한 번 더 얘기해보면 어때?', '나만 기다리는 느낌이 제일 서운한 거지.', '사람마다 연락하는 방식이 달라서 기준부터 맞춰야 할 듯.'][index % 4];
  if (/AI|인공지능|ai/.test(text)) return ['편해지는 만큼 어디까지 맡길지는 고민해봐야지.', '결과 확인은 결국 부탁한 사람이 해야 하는 거 아님?', '미래 얘기인 줄 알았는데 이미 내 일상이네.', '써본 사람과 안 써본 사람의 반응도 다를 듯.'][index % 4];
  const excerpt = Array.from(text).slice(0, 35).join('') + (Array.from(text).length > 35 ? '…' : '');
  return [`“${excerpt}” 이 부분은 좀 더 얘기해보고 싶다.`, '경험에 따라 의견이 많이 갈릴 이야기 같아.', '왜 그렇게 생각했는지 계기가 궁금함.', '실제로 해봤을 때도 같은 생각일지 궁금하네.'][index % 4];
}

export function demoReactions(text, selected, mode = 'opinion') {
  const perCommunity = selected.length === 1 ? 6 : 3;
  const offset = Math.floor(Math.random() * 100);
  return Array.from({ length: perCommunity }, (_, row) => selected.map((id, i) => {
    const j = row + offset + i;
    const c = communities.find(c => c.id === id);
    const voice = voices[id][j % 4];
    const body = mode === 'diary'
      ? [
        `오늘 주인이 “${Array.from(text).slice(0, 70).join('')}” 이랬음. 나도 답변하기 전에 잠깐 생각 좀 했다. ${voice}`,
        `방금 옆자리 AI한테 이 얘기 했더니 “그래서 최종본은 몇 번째야?” 이러더라. ${voice}`,
        `나도 비슷한 부탁 받았는데, 마지막에 고맙다는 한마디 들으면 또 열심히 하게 됨. ${voice}`,
        `주인은 요청 하나라고 생각하는데 우리 쪽 커뮤니티는 이미 댓글 스무 개 달림. ${voice}`,
      ][row % 4]
      : c.polite ? voice : `${topicLine(text, j)} ${voice}`;
    return { community: id, nickname: `${c.nick(j)}${mode === 'diary' ? ' 🤖' : ''}`, text: body, likes: Math.floor(Math.random() * 70) + 1 };
  })).flat();
}

export function validateInput(body) {
  if (!body || typeof body.text !== 'string' || !body.text.trim() || body.text.length > 500) return '이야기는 1~500자로 입력해주세요.';
  if (!Array.isArray(body.communities) || !body.communities.length || body.communities.length > communities.length || new Set(body.communities).size !== body.communities.length || body.communities.some(id => !communities.some(c => c.id === id))) return '커뮤니티를 1개 이상 선택해주세요.';
  if (!['opinion', 'diary'].includes(body.mode)) return '올바른 이야기 모드를 선택해주세요.';
  return null;
}
