import { LOCKED_KEY } from './key.js';
import { unlockSecret } from './vault.js';
import { ask, ANSWER_COUNT, OracleError } from './oracle.js';

const STORE_KEY = 'agora.apiKey';
const HISTORY_KEY = 'agora.history';
const HISTORY_MAX = 20;

const $ = (id) => document.getElementById(id);
let apiKey = null;
let running = null;

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
  $('lock').hidden = false;
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
for (const chip of document.querySelectorAll('.chip')) {
  chip.addEventListener('click', () => {
    $('question').value = chip.textContent;
    $('question').focus();
  });
}

$('question').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) $('ask-form').requestSubmit();
});

$('ask-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = $('question').value.trim();
  if (q) run(q);
});

$('again').addEventListener('click', () => {
  const q = $('asked').dataset.q;
  if (q) run(q);
});

async function run(question) {
  running?.abort();
  const controller = new AbortController();
  running = controller;

  $('result').hidden = false;
  $('asked').textContent = question;
  $('asked').dataset.q = question;
  $('status').className = 'status';
  $('status').textContent = '철학자들이 광장으로 모여드는 중…';
  $('result-actions').hidden = true;
  $('ask-button').disabled = true;
  renderGhosts();
  $('result').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });

  try {
    const answers = await ask(question, apiKey, { signal: controller.signal });
    if (running !== controller) return;
    $('status').textContent = '';
    renderAnswers(answers);
    saveHistory(question, answers);
  } catch (err) {
    if (err.name === 'AbortError' || running !== controller) return;
    $('answers').replaceChildren();
    $('status').className = 'status error';
    $('status').textContent = err instanceof OracleError ? err.message : '알 수 없는 문제가 생겼어요. 다시 물어봐 주세요.';
    if (err.cause === 401 || err.cause === 403) {
      safeStorage((s) => s.removeItem(STORE_KEY));
    }
  } finally {
    if (running === controller) {
      running = null;
      $('ask-button').disabled = false;
      $('result-actions').hidden = $('answers').children.length === 0;
    }
  }
}

function renderGhosts() {
  const items = [];
  for (let i = 0; i < ANSWER_COUNT; i++) {
    const li = document.createElement('li');
    li.className = 'stele ghost';
    li.innerHTML = '<p class="line"></p>';
    items.push(li);
  }
  $('answers').replaceChildren(...items);
}

function renderAnswers(answers) {
  const tpl = $('stele-template');
  const items = answers.map((a, i) => {
    const li = tpl.content.firstElementChild.cloneNode(true);
    li.style.setProperty('--i', i);
    li.querySelector('.name').textContent = a.name;
    li.querySelector('.meta').textContent = `${a.era} · ${a.region}`;
    li.querySelector('.line').textContent = a.line;
    const concept = li.querySelector('.concept');
    if (a.concept) concept.textContent = a.concept;
    else concept.remove();
    return li;
  });
  $('answers').replaceChildren(...items);
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
      $('ask-button').disabled = false;
      $('result').hidden = false;
      $('asked').textContent = h.q;
      $('asked').dataset.q = h.q;
      $('status').className = 'status';
      $('status').textContent = '';
      renderAnswers(h.answers || []);
      $('result-actions').hidden = false;
      $('result').scrollIntoView({ block: 'start' });
    });
    li.append(b);
    return li;
  }));
}

$('clear-history').addEventListener('click', () => {
  safeStorage((s) => s.removeItem(HISTORY_KEY));
  renderHistory();
});

/* 시작 */
apiKey = safeStorage((s) => s.getItem(STORE_KEY), null);
if (apiKey) showAsk();
else showUnlock();
