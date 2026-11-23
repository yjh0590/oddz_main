import { LOCKED_KEY } from './key.js';
import { unlockSecret } from './vault.js';
import { ask, NEEDS_KEY, OracleError } from './oracle.js';
import { startScene } from './scene.js';
import { PORTRAITS } from './portraits/credits.js';
import { BY_ID } from './philosophers.js';

const STORE_KEY = 'agora.apiKey';
const HISTORY_KEY = 'agora.history';
const HISTORY_MAX = 20;

const $ = (id) => document.getElementById(id);
let apiKey = null;
let running = null;
const scene = startScene($('scene'));

function safeStorage(fn, fallback) {
  try { return fn(localStorage); } catch { return fallback; }
}

/* 잠금 */
function showUnlock() {
  $('unlock').hidden = false;
  $('ask').hidden = true;
  $('lock').hidden = true;
  if (LOCKED_KEY) {
    $('secret-label').textContent = '비밀번호';
    $('secret').autocomplete = 'current-password';
    $('unlock-help').textContent = '혼자 쓰는 광장이에요. 정해 둔 비밀번호를 입력해 주세요.';
  } else {
    $('secret-label').textContent = 'Anthropic API 키';
    $('secret').autocomplete = 'off';
    $('secret').placeholder = 'sk-ant-...';
    $('unlock-help').textContent = '키는 이 브라우저 안에만 저장되고, Anthropic 외에는 어디로도 보내지 않아요.';
  }
  $('secret').focus();
}

function showAsk() {
  $('unlock').hidden = true;
  $('ask').hidden = false;
  $('lock').hidden = !NEEDS_KEY;
  renderHistory();
}

$('unlock-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = $('secret').value.trim();
  const button = e.submitter || $('unlock-form').querySelector('button');
  $('unlock-error').textContent = '';
  if (LOCKED_KEY) {
    button.disabled = true;
    button.textContent = '여는 중…';
    const key = await unlockSecret(LOCKED_KEY, value);
    button.disabled = false;
    button.textContent = '문 열기';
    if (!key) {
      $('unlock-error').textContent = '비밀번호가 맞지 않아요.';
      $('secret').select();
      return;
    }
    apiKey = key;
  } else {
    if (!value.startsWith('sk-ant-')) {
      $('unlock-error').textContent = 'sk-ant-로 시작하는 키를 넣어 주세요.';
      return;
    }
    apiKey = value;
  }
  if ($('remember').checked) safeStorage((s) => s.setItem(STORE_KEY, apiKey));
  $('secret').value = '';
  showAsk();
  $('question').focus();
});

$('lock').addEventListener('click', () => {
  safeStorage((s) => s.removeItem(STORE_KEY));
  apiKey = null;
  showUnlock();
});

/* 질문 */
$('ask-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = $('question').value.trim();
  if (q) run(q);
});

/* 대화: 내 질문 → 모여드는 중 → 철학자들이 한 명씩 말풍선으로 */
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (still) return resolve();
    const t = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('취소', 'AbortError')); }, { once: true });
  });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function avatar(p) {
  const credit = p && PORTRAITS[p.id];
  const mono = () => el('span', 'avatar mono', p ? p.name[0] : '…');
  if (!credit) return mono();
  const img = el('img', 'avatar');
  img.src = `portraits/${credit.file}`;
  img.alt = '';
  img.addEventListener('error', () => img.replaceWith(mono()), { once: true });
  return img;
}

function add(node) {
  $('messages').append(node);
  node.scrollIntoView({ block: 'end', behavior: still ? 'auto' : 'smooth' });
  return node;
}

function meMsg(question) {
  const li = el('li', 'msg me');
  li.append(el('p', 'bubble', question));
  return li;
}

function sageMsg(a) {
  const li = el('li', 'msg sage');
  const body = el('div', 'body');
  const who = el('p', 'who');
  who.append(el('b', '', a.name), el('span', 'meta', `${a.era} · ${a.region}`));
  body.append(who, el('p', 'bubble', a.line));
  if (a.concept) body.append(el('p', 'concept', a.concept));
  li.append(avatar(a), body);
  return li;
}

function typingMsg() {
  const li = el('li', 'msg sage typing');
  const body = el('div', 'body');
  const bubble = el('p', 'bubble');
  bubble.append(el('span', 'dot'), el('span', 'dot'), el('span', 'dot'));
  body.append(el('p', 'who'), bubble);
  li.append(avatar(null), body);
  li.setLabel = (p, text) => {
    li.firstElementChild.replaceWith(avatar(p));
    body.firstElementChild.textContent = text;
  };
  li.setLabel(null, '철학자들이 광장으로 모여드는 중');
  return li;
}

function againMsg(question) {
  const li = el('li', 'msg note again');
  const b = el('button', 'chip', '다른 철학자들에게 다시 묻기');
  b.type = 'button';
  b.addEventListener('click', () => run(question));
  li.append(b);
  return li;
}

function openThread() {
  document.body.classList.add('chatting');
  $('thread').hidden = false;
  for (const old of $('messages').querySelectorAll('.again')) old.remove();
}

async function run(question) {
  running?.abort();
  const controller = new AbortController();
  running = controller;
  const { signal } = controller;

  openThread();
  add(meMsg(question));
  $('question').value = '';
  const typing = add(typingMsg());
  $('ask-button').disabled = true;
  scene.travel(true);

  // 실시간으로 오는 답(onAnswer)은 바로 달고, 한꺼번에 온 답은 한 명씩 시간차로 단다.
  const shown = new Set();
  const reveal = (a) => {
    if (shown.has(a.id)) return;
    shown.add(a.id);
    typing.before(sageMsg(a));
    typing.setLabel(null, '다음 철학자가 말을 고르는 중');
    typing.scrollIntoView({ block: 'end', behavior: still ? 'auto' : 'smooth' });
  };

  try {
    const answers = await ask(question, apiKey, { signal, onAnswer: reveal });
    for (const a of answers) {
      if (shown.has(a.id)) continue;
      typing.setLabel(a, `${a.name} 님이 말하는 중`);
      await wait(450 + Math.min(a.line.length * 14, 1100), signal);
      reveal(a);
    }
    typing.remove();
    add(againMsg(question));
    saveHistory(question, answers);
  } catch (err) {
    typing.remove();
    if (err.name === 'AbortError' || running !== controller) return;
    add(el('li', 'msg note error', err instanceof OracleError ? err.message : '알 수 없는 문제가 생겼어요. 다시 물어봐 주세요.'));
    add(againMsg(question));
    if (err.cause === 401 || err.cause === 403) {
      safeStorage((s) => s.removeItem(STORE_KEY));
    }
  } finally {
    if (running === controller) {
      running = null;
      scene.travel(false);
      $('ask-button').disabled = false;
    }
  }
}

/* 지난 질문 */
function loadHistory() {
  return safeStorage((s) => {
    const list = JSON.parse(s.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  }, []);
}

function saveHistory(question, answers) {
  const list = loadHistory().filter((h) => h.q !== question);
  list.unshift({ q: question, answers, at: Date.now() });
  safeStorage((s) => s.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_MAX))));
  renderHistory();
}

function renderHistory() {
  const list = loadHistory();
  $('history').hidden = list.length === 0;
  $('history-list').replaceChildren(...list.map((h) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = h.q;
    b.addEventListener('click', () => {
      running?.abort();
      running = null;
      scene.travel(false);
      $('ask-button').disabled = false;
      $('history').open = false;
      openThread();
      add(meMsg(h.q));
      for (const a of h.answers || []) add(sageMsg(a));
      add(againMsg(h.q));
    });
    li.append(b);
    return li;
  }));
}

$('clear-history').addEventListener('click', () => {
  safeStorage((s) => s.removeItem(HISTORY_KEY));
  renderHistory();
});

/* 초상 출처 */
$('credit-list').replaceChildren(...Object.entries(PORTRAITS).map(([id, c]) => {
  const li = el('li', '', `${BY_ID.get(id)?.name ?? id} — ${c.artist}, `);
  const a = el('a', '', c.license);
  a.href = c.source;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  li.append(a);
  return li;
}));

/* 시작 */
apiKey = NEEDS_KEY ? safeStorage((s) => s.getItem(STORE_KEY), null) : 'none';
if (apiKey) showAsk();
else showUnlock();
