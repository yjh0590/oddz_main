import { funnySports, funnyInterview, funnyMessage, funnyMeeting, cosmicExcuse } from './humor.js';

export const examples = [
  ['집에서 롤드컵을 봤다', '응원하던 팀이 결승에서 졌다'],
  ['알람을 끄고 10분 더 잤다', '면접에서 준비한 말을 잊어버렸다'],
  ['평소와 다른 카페에서 커피를 샀다', '좋아하는 사람에게 답장이 안 왔다'],
  ['출근길에 버스 한 대를 보냈다', '회의에서 발표 순서를 놓쳤다'],
  ['점심 메뉴를 세 번 바꿨다', '오후 회의에서 내 아이디어가 묻혔다'],
  ['양말을 짝짝이로 신었다', '주말 여행에 비가 내렸다'],
];

export function makeStory(cause, effect, variant = 0) {
  cause = cause.trim(); effect = effect.trim();
  if (!cause || !effect) throw new Error('두 사건을 모두 적어주세요.');
  if (cause.length > 150 || effect.length > 150) throw new Error('각 사건을 150자 이내로 적어주세요.');
  if (cause === effect) throw new Error('조금 다른 두 사건을 적어주세요. 연결고리는 우리가 찾아볼게요.');
  const v = Number.isFinite(variant) ? ((Math.trunc(variant) % 3) + 3) % 3 : 0;
  let scenario;
  if (/롤|바론|넥서스/.test(effect + cause) && /졌|패배|지다|탈락/.test(effect)) scenario = funnySports(cause, v);
  else if (/면접/.test(effect) && /잊|까먹|기억|말|긴장/.test(effect)) scenario = funnyInterview(cause, v);
  else if (/답장|연락|카톡/.test(effect) && /커피|카페/.test(cause)) scenario = funnyMessage(cause, v);
  else if (/회의/.test(effect)) scenario = funnyMeeting(cause, v);
  else scenario = cosmicExcuse(cause, effect, v);

  const steps = [...scenario.steps,
    ['그래서, 처음 적은 그 사건', `“${effect}”\n작은 행동 하나에 다른 사람들의 타이밍이 얹히고, 일이 여기까지 커졌습니다. 이 이야기의 등장인물 수를 보세요. 혼자 책임지기엔 출연진이 너무 많습니다.`, '앞선 가상 장면들이 겹쳐 만든 결말이에요. 결론을 당신 한 명의 책임으로 요약하기에는 중간 과정이 너무 길어요.', '연결 중 하나만 달랐어도 다른 결말이 나왔겠죠. 그러니 잠깐 자책을 내려놓아도 괜찮아요.'],
  ];
  return { cause, effect, steps, assumptions: scenario.assumptions, genre: scenario.genre, unsupported: false, verdict: scenario.verdict };
}

export function storyText(story) {
  return ['어쩔 수 없었어 · 나비효과 변명 연구소', `오늘의 장르: ${story.genre}`, '가상 시나리오의 설정: ' + story.assumptions.join(' / '), ...story.steps.map(([title, body, because, otherwise], i) => `${i + 1}. ${title}\n${body}\n→ 다음 연결: ${because}\n다른 선택이었다면: ${otherwise}`), story.verdict, '재미와 위로를 위한 가상의 이야기입니다. 인물·시간·상황은 창작이며 실제 인과관계를 증명하지 않습니다.'].join('\n\n');
}
