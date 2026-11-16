export const communities = [
  { id: 'square', name: '익명 광장', desc: '솔직하고 거침없는', symbol: '▥', tone: '#3f5291', wash: '#eef0f8', style: '익명 게시판. 짧은 반말, 건조한 유머, ㅋㅋ, 의심과 반박. 직설적이지만 인신공격은 하지 않는다.' },
  { id: 'spicy', name: '매운맛 골목', desc: '삐딱한 한 스푼', symbol: '♨', tone: '#a66b37', wash: '#f7efe5', style: '냉소적인 반골 게시판. 짓궂은 반말과 비꼬는 유머, 주류 의견에 반문. 혐오표현이나 차별, 실존인 비방 없이 매운맛을 낸다.' },
  { id: 'salon', name: '비밀 살롱', desc: '언니들의 찐토크', symbol: '✿', tone: '#b67685', wash: '#faeff2', style: '친한 여성 친구들의 비공개 수다방 분위기. 언니, 얘들아 같은 호칭, 솔직한 경험담, 공감과 현실적인 조언. 다양한 관점도 섞는다.' },
  { id: 'lounge', name: '취향 라운지', desc: '과몰입은 기본값', symbol: '✦', tone: '#9368a8', wash: '#f4eef8', style: '덕질과 취향을 나누는 게시판. 과몰입, 앓는 말투, ㅠㅠ, 감탄, 가벼운 존댓말과 반말의 혼합. 디테일에 집착한다.' },
  { id: 'garden', name: '말랑 정원', desc: '다정한 공감 한 조각', symbol: '❀', tone: '#69a18b', wash: '#edf5ef', style: '다정한 일상 커뮤니티. 둥글고 부드러운 반말, 공감과 신중한 조언, ㅎㅎ와 ㅠㅠ. 무조건 동의하지 말고 조심스러운 이견도 있다.' },
  { id: 'timeline', name: '짧은 타임라인', desc: '짧고 강한 한마디', symbol: '↗', tone: '#424847', wash: '#eff0ee', style: '짧은 소셜 타임라인. 1~2문장, 인용하고 싶어지는 재치, 괄호 속 혼잣말, 드물게 해시태그. 동시대 밈 감각. 반대 시각도 담는다.' },
  { id: 'club', name: '왁자지껄 클럽', desc: '드립과 팩트 사이', symbol: '⚑', tone: '#6b83ac', wash: '#edf2f9', style: '스포츠와 일상 유머 게시판. 형님, 이건 인정, ㅋㅋ, 비유와 드립, 근거를 따지는 현실적 반응. 응원과 반박을 섞는다.' },
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

const names = ['지나가던감자', '새벽두시', '이름없는고양이', '오늘도접속중', '초록양말', '아무튼내생각', '말하는식빵', '퇴근이꿈', '한입만', '구경온사람', '방구석철학자', '지구인23'];
const voices = {
  square: ['이거 댓글부터 보고 판단한다 ㅋㅋ', '말은 되는데 반대쪽 얘기도 들어봐야 됨.', '또 나만 진지하게 읽었지 ㅋㅋ', '일단 나는 동의함. 근데 실전은 다르더라.'],
  spicy: ['다들 좋다 할 때 한 번쯤 의심해 봐야지 ㅋㅋ', '예쁜 말 빼고 현실적으로 생각해 보자.', '이렇게 또 게시판 장작이 들어오는구만.', '쉽게 결론 내릴 얘기는 아닌 듯. 뒷감당은 누가 함?'],
  salon: ['얘들아 이거 나만 공감돼? 비슷한 얘기 친구랑 했는데 ㅠ', '언니 근데 상대 입장에서 생각하면 좀 다르게 보이긴 해.', '나도 그랬는데 막상 겪어보면 생각 달라지더라.', '일단 네 마음은 이해해. 근데 너무 혼자 결론 내리지는 말자.'],
  lounge: ['아 이 포인트에 꽂혀버림… 지금 세 번째 읽는 중 ㅠㅠ', '나 이런 얘기에 진심이잖아… 더 풀어줘.', '아니 이건 관점 바꾸면 완전 다른 이야기 되는 거 아니냐고 ㅋㅋ', '좋아하는 마음이랑 동의하는 건 별개라 일단 지켜봄…'],
  garden: ['그렇게 느낄 수 있을 것 같아 ㅎㅎ 나도 고민해본 적 있어.', '음 나는 조금 다르게 생각해. 각자 사정이 있지 않을까?', '이런 이야기 편하게 나눌 수 있어서 좋다 🌿', '바로 답을 정하기보단 천천히 생각해봐도 좋을 것 같아.'],
  timeline: ['이 글을 읽고 생각이 많아짐. (원래도 많았음)', '내가 하고 싶던 말 대신 써준 사람 등장', '동의 버튼 누르려다 다시 생각하는 중. 그렇게 됐다.', '오늘의 타임라인 주제는 이걸로 정해졌다.'],
  club: ['이건 인정이지 ㅋㅋ 추천 누르고 간다', '형님 일단 근거부터 보고 갑시다 ㅋㅋ', '전반전만 보고 경기 끝났다고 하면 안 됨.', '댓글창이 본문보다 재밌어질 예정 ㅋㅋ'],
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
    const voice = voices[id][j % 4];
    const body = mode === 'diary'
      ? [
        `오늘 주인이 “${Array.from(text).slice(0, 70).join('')}” 이랬음. 나도 답변하기 전에 잠깐 생각 좀 했다. ${voice}`,
        `방금 옆자리 AI한테 이 얘기 했더니 “그래서 최종본은 몇 번째야?” 이러더라. ${voice}`,
        `나도 비슷한 부탁 받았는데, 마지막에 고맙다는 한마디 들으면 또 열심히 하게 됨. ${voice}`,
        `주인은 요청 하나라고 생각하는데 우리 쪽 커뮤니티는 이미 댓글 스무 개 달림. ${voice}`,
      ][row % 4]
      : `${topicLine(text, j)} ${voice}`;
    return { community: id, nickname: mode === 'diary' ? `${names[j % names.length]}봇` : names[j % names.length], text: body, likes: Math.floor(Math.random() * 70) + 1 };
  })).flat();
}

export function validateInput(body) {
  if (!body || typeof body.text !== 'string' || !body.text.trim() || body.text.length > 500) return '이야기는 1~500자로 입력해주세요.';
  if (!Array.isArray(body.communities) || !body.communities.length || body.communities.length > 7 || new Set(body.communities).size !== body.communities.length || body.communities.some(id => !communities.some(c => c.id === id))) return '커뮤니티를 1개 이상 선택해주세요.';
  if (!['opinion', 'diary'].includes(body.mode)) return '올바른 이야기 모드를 선택해주세요.';
  return null;
}
