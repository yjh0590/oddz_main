// 질문을 Claude에게 보내고 철학자 6명의 한 줄 답을 받는다.
import { PHILOSOPHERS, BY_ID } from './philosophers.js';

export const ANSWER_COUNT = 6;
// 이 방식은 API 키가 필요하다. 아티팩트판 oracle은 false.
export const NEEDS_KEY = true;
const API_URL = 'https://api.anthropic.com/v1/messages';

const roster = PHILOSOPHERS.map((p) => `- ${p.id} | ${p.name} | ${p.era}·${p.region} | ${p.ideas}`).join('\n');

export const SYSTEM_PROMPT = `너는 고대 그리스 광장 '아고라'의 진행자다. 사용자가 던진 질문이나 의견에, 아래 명단에서 고른 철학자 ${ANSWER_COUNT}명이 각자 한 줄씩 답한다.

명단 (id | 이름 | 시대·지역 | 핵심 사상 단서):
${roster}

고르는 규칙:
- 질문과 사상이 잘 맞물리는 사람을 고른다. 동양 철학자를 최소 2명 넣고, 한 시대에 4명 이상 몰리지 않게 한다.
- 순서는 시대순으로 둔다.

답하는 규칙:
- 각 철학자가 지금 이 질문을 직접 듣고 대답하듯 1인칭 한국어 한 문장으로 쓴다. 70자 안팎, 길어도 두 문장을 넘기지 않는다.
- 그 사람의 실제 사상과 말버릇에서 나온 답이어야 한다. 소크라테스는 되묻고, 디오게네스는 무례하게 단순하고, 칸트는 보편화해 본다.
- 톤은 진지하다. 진지하게 끝까지 밀어붙인 결과가 피식 웃기게 만든다. 말장난이나 이모지는 쓰지 않는다.
- 실제로 그 사람이 한 적 없는 말을 명언처럼 따옴표로 인용하지 않는다. 실제 유명한 구절을 비틀어 쓰는 것은 괜찮다.
- concept에는 그 답이 기대는 실제 개념이나 저작 이름을 짧게 적는다(예: 정언명령, 무위자연, 쾌락 계산법). 지어낸 개념은 쓰지 않는다.
- 질문이 엉뚱해도 피하지 않고 성실하게 답한다.`;

const SCHEMA = {
  type: 'object',
  properties: {
    answers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', enum: PHILOSOPHERS.map((p) => p.id) },
          line: { type: 'string' },
          concept: { type: 'string' },
        },
        required: ['id', 'line', 'concept'],
        additionalProperties: false,
      },
    },
  },
  required: ['answers'],
  additionalProperties: false,
};

export function buildRequest(question) {
  return {
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
    fallbacks: 'default',
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: question }],
  };
}

// API 응답에서 화면에 그릴 답 목록을 만든다. 명단에 없거나 중복된 철학자는 버린다.
export function parseAnswers(response) {
  if (response.stop_reason === 'refusal') throw new OracleError('철학자들이 이 질문에는 답하지 않기로 했어요. 다르게 물어봐 주세요.');
  if (response.stop_reason === 'max_tokens') throw new OracleError('답이 너무 길어져 중간에 끊겼어요. 다시 물어봐 주세요.');
  const text = (response.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new OracleError('철학자들의 답을 알아듣지 못했어요. 다시 물어봐 주세요.');
  }
  return pickAnswers(data);
}

// 모델이 준 {answers: [...]}에서 명단에 없거나 중복된 철학자를 버린다.
export function pickAnswers(data) {
  const seen = new Set();
  const answers = [];
  for (const a of data?.answers || []) {
    const who = BY_ID.get(a.id);
    if (!who || seen.has(a.id) || !a.line?.trim()) continue;
    seen.add(a.id);
    answers.push({ ...who, line: a.line.trim(), concept: (a.concept || '').trim() });
  }
  if (answers.length === 0) throw new OracleError('광장에 아무도 나오지 않았어요. 다시 물어봐 주세요.');
  return answers.slice(0, ANSWER_COUNT);
}

export class OracleError extends Error {}

export async function ask(question, apiKey, { fetchImpl = fetch, signal } = {}) {
  let res;
  try {
    res = await fetchImpl(API_URL, {
      method: 'POST',
      signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2026-10-21',
        'anthropic-beta': 'server-side-fallback-2026-07-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(buildRequest(question)),
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new OracleError('인터넷 연결을 확인해 주세요.');
  }
  if (!res.ok) throw new OracleError(httpMessage(res.status), { cause: res.status });
  return parseAnswers(await res.json());
}

function httpMessage(status) {
  if (status === 401 || status === 403) return 'API 키가 맞지 않아요. 잠금을 풀고 다시 입력해 주세요.';
  if (status === 429) return '질문이 너무 몰렸어요. 잠시 뒤에 다시 물어봐 주세요.';
  if (status === 400) return '질문을 보내지 못했어요. 질문을 조금 바꿔 보세요.';
  if (status >= 500) return '광장이 잠시 붐벼요. 조금 뒤에 다시 물어봐 주세요.';
  return `알 수 없는 문제가 생겼어요 (${status}).`;
}
