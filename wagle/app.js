import { communities, samples, demoReactions, demoPost } from './community.js?v=20261127';
import { renderPage, renderComment, layoutOf } from './sites.js';

const $ = id => document.getElementById(id);
let site = null; // 한 번에 한 사이트만 선택. 처음엔 미선택(흑백).
let mode = 'opinion';
let gura = false; // 구라 버튼: 켜면 글을 길고 허세 가득하게 지어낸다
let busy = false;
let sort = 'latest';
let currentThread = null;
let serverAvailable = false;
let toastTimeout;
let history = [];
try {
  const saved = JSON.parse(localStorage.getItem('wagle-stories') || '[]');
  if (Array.isArray(saved)) history = saved.filter(t => t && typeof t.id === 'string' && typeof t.text === 'string' && ['opinion', 'diary'].includes(t.mode) && Array.isArray(t.communities) && t.communities.every(id => communities.some(c => c.id === id)) && Array.isArray(t.reactions) && t.reactions.every(r => r && communities.some(c => c.id === r.community) && typeof r.text === 'string' && typeof r.nickname === 'string' && Number.isFinite(r.likes)) && (t.post === undefined || (typeof t.post?.title === 'string' && typeof t.post.body === 'string'))).slice(0, 20);
} catch { /* Storage may be disabled or contain invalid data. */ }

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function toast(message) {
  clearTimeout(toastTimeout);
  $('toast').textContent = message;
  $('toast').hidden = false;
  toastTimeout = setTimeout(() => { $('toast').hidden = true; }, 2800);
}

function palette(node, community) {
  node.style.setProperty('--tone', community.tone);
  node.style.setProperty('--wash', community.wash);
}

// 처음엔 흑백, 카드를 누르면 그 커뮤니티의 색으로 페이지 분위기를 바꾼다.
function theme(community) {
  const root = document.documentElement.style;
  document.documentElement.dataset.site = community?.id ?? '';
  if (!community) return ['--accent', '--page'].forEach(p => root.removeProperty(p));
  root.setProperty('--accent', community.tone);
  root.setProperty('--page', `color-mix(in srgb, ${community.tone} 20%, #fff)`);
}

function renderCommunities() {
  $('communities').replaceChildren(...communities.map(c => {
    const button = element('button', `community-card${site === c.id ? ' selected' : ''}`);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(site === c.id));
    button.setAttribute('aria-label', `${c.name}, ${c.desc}`);
    button.disabled = busy;
    palette(button, c);
    button.append(element('span', 'check-mark', '✓'), element('span', 'community-symbol', c.symbol), element('span', 'community-name', c.name), element('span', 'community-desc', c.desc));
    button.addEventListener('click', () => {
      site = c.id;
      theme(c);
      renderCommunities();
      $('communities').children[communities.indexOf(c)].focus({ preventScroll: true });
    });
    return button;
  }));
  $('selection-count').textContent = site ? `${communities.find(c => c.id === site).name} 선택됨` : '사이트를 골라주세요';
}

function renderSuggestions() {
  $('suggestion-buttons').replaceChildren(...samples[mode].map(sample => {
    const button = element('button', 'suggestion', sample.label);
    button.type = 'button';
    button.disabled = busy;
    button.addEventListener('click', () => {
      $('opinion').value = sample.text;
      updateCount();
      $('opinion').focus();
    });
    return button;
  }));
  // 시점에 따라 입력창 문구가 바뀐다: 1인칭은 내 얘기, 3인칭은 "내 얘기는 아닌데…"로 시작하는 친구 얘기.
  $('compose-hint').textContent = gura ? '구라 ON. 주제만 던지면 없는 얘기까지 지어서 길게 써요.' : mode === 'diary' ? '주인공은 ‘친구’. 아무도 모를 거예요.' : '주인공은 나. 익명이니까, 편하게.';
  if (!busy) $('submit-button').textContent = submitLabel();
  $('opinion').placeholder = mode === 'diary' ? '내 얘기는 아닌데… (예: 친구가 단톡방에 전 애인 욕을 했는데 전 애인도 그 방에 있었대)' : '오늘 엘리베이터에서 팀장님 앞에서 방귀 뀌었는데, 이거 퇴사 사유임?';
}

const submitLabel = () => gura ? '구라 풀기 ↗' : mode === 'diary' ? '친구 얘기로 올리기 ↗' : '내 시점으로 올리기 ↗';

function updateCount() { $('char-count').textContent = $('opinion').value.length; }

function saveHistory() {
  $('history-count').textContent = history.length;
  try { localStorage.setItem('wagle-stories', JSON.stringify(history)); }
  catch { toast('브라우저 저장 공간이 없어 이번 기록은 저장되지 않았어요.'); }
}

function persistThread() {
  if (!currentThread) return;
  history = [currentThread, ...history.filter(t => t.id !== currentThread.id)].slice(0, 20);
  saveHistory();
}

const threadSite = () => communities.find(c => c.id === currentThread.communities[0]);
const onLike = () => { if (!busy) persistThread(); };
const comment = (reaction, best = false) => renderComment(reaction, currentThread.reactions.indexOf(reaction), threadSite(), best, onLike, currentThread.reactions[reaction.replyTo]?.nickname);
const updateCounts = () => document.querySelectorAll('.sp-count').forEach(node => { node.textContent = currentThread.reactions.length; });

function renderReactions() {
  const items = [...currentThread.reactions];
  if (sort === 'popular') items.sort((a, b) => (b.likes + !!b.liked) - (a.likes + !!a.liked));
  // 네이트판 베플: 반응이 다 모인 뒤 추천 상위 3개에 BEST 표시
  const best = threadSite().id === 'pann' && !busy ? new Set([...items].sort((a, b) => b.likes - a.likes).slice(0, 3)) : new Set();
  $('reactions').replaceChildren(...items.map(r => comment(r, best.has(r))));
  updateCounts();
}

// 와글 화면을 숨기고 그 사이트의 페이지로 "들어간다". 브라우저 뒤로가기로도 나올 수 있다.
function enterSite() {
  document.body.classList.add('in-site');
  scrollTo(0, 0);
  if (location.hash !== '#site') window.history.pushState(null, '', '#site');
}
function leaveSite() {
  document.body.classList.remove('in-site');
  if (location.hash === '#site') window.history.replaceState(null, '', location.pathname + location.search);
}

function showThread() {
  const c = threadSite();
  palette($('thread-section'), c);
  $('thread-section').dataset.layout = layoutOf(c);
  $('site-page').replaceChildren(renderPage(currentThread, c, sort));
  $('thread-mode-label').textContent = `패러디 · ${currentThread.demo ? '데모 예시 반응' : 'AI 생성 반응'}`;
  $('typing').hidden = !busy;
  document.querySelectorAll('.sort-button').forEach(button => { button.disabled = busy; });
  renderReactions();
  if (!document.body.classList.contains('in-site')) enterSite();
}

function setBusy(value) {
  busy = value;
  $('submit-button').disabled = value;
  $('submit-button').textContent = value ? '올리는 중…' : submitLabel();
  $('opinion').disabled = value;
  $('gura-button').disabled = value;
  $('regenerate').disabled = value;
  $('regenerate').hidden = value;
  $('new-story').disabled = value;
  $('history-button').disabled = value;
  $('typing').hidden = !value;
  document.querySelectorAll('.compose-tab,.sort-button').forEach(button => { button.disabled = value; });
  renderCommunities();
  renderSuggestions();
  $('thread-section').setAttribute('aria-busy', String(value));
}

async function generate(payload) {
  if (!serverAvailable) return { post: demoPost(payload.text, payload.communities[0], payload.mode, payload.gura), reactions: demoReactions(payload.text, payload.communities, payload.mode, payload.gura), demo: true };
  const response = await fetch('/api/reactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(65000) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '반응을 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
  return data;
}

async function submit(payload) {
  if (busy) return;
  $('error-message').hidden = true;
  const previous = currentThread;
  currentThread = { id: crypto.randomUUID(), text: payload.text, mode: payload.mode, communities: payload.communities, gura: !!payload.gura, reactions: [], createdAt: Date.now(), demo: true };
  showThread();
  setBusy(true);
  try {
    const data = await generate(payload);
    currentThread.demo = data.demo;
    currentThread.post = data.post;
    showThread();
    for (const reaction of data.reactions) {
      await new Promise(resolve => setTimeout(resolve, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240 + Math.random() * 180));
      currentThread.reactions.push(reaction);
      $('reactions').append(comment(reaction));
      updateCounts();
    }
    persistThread();
  } catch (error) {
    currentThread = previous;
    leaveSite();
    $('error-message').textContent = error.name === 'TimeoutError' ? '응답 시간이 길어지고 있어요. 잠시 후 다시 시도해주세요.' : error.message;
    $('error-message').hidden = false;
    $('error-message').scrollIntoView({ behavior: 'smooth', block: 'center' });
  } finally {
    setBusy(false);
    if (currentThread && threadSite().id === 'pann' && document.body.classList.contains('in-site')) renderReactions(); // 베플 표시 갱신
  }
}

$('opinion-form').addEventListener('submit', event => {
  event.preventDefault();
  const text = $('opinion').value.trim();
  if (!text) { toast('먼저 이야기를 한 줄 적어주세요.'); $('opinion').focus(); return; }
  if (!site) { toast('먼저 이야기할 사이트를 골라주세요.'); return; }
  submit({ text, communities: [site], mode, gura });
});
$('opinion').addEventListener('input', updateCount);
$('opinion').addEventListener('keydown', event => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.isComposing) { event.preventDefault(); $('opinion-form').requestSubmit(); }
});
document.querySelectorAll('.compose-tab').forEach(button => button.addEventListener('click', () => {
  mode = button.dataset.mode;
  document.querySelectorAll('.compose-tab').forEach(tab => { const active = tab === button; tab.classList.toggle('active', active); tab.setAttribute('aria-pressed', String(active)); });
  renderSuggestions();
}));
$('thread-section').addEventListener('click', event => {
  const button = event.target.closest('.sort-button');
  if (!button) return;
  sort = button.dataset.sort;
  document.querySelectorAll('.sort-button').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  renderReactions();
});
$('regenerate').addEventListener('click', () => { if (currentThread) submit({ text: currentThread.text, communities: currentThread.communities, mode: currentThread.mode, gura: !!currentThread.gura }); });
$('gura-button').addEventListener('click', () => {
  gura = !gura;
  $('gura-button').setAttribute('aria-pressed', String(gura));
  renderSuggestions();
});
$('back-home').addEventListener('click', leaveSite);
addEventListener('popstate', () => { if (location.hash !== '#site') document.body.classList.remove('in-site'); });
$('new-story').addEventListener('click', () => {
  if (busy) return;
  currentThread = null;
  leaveSite();
  $('opinion').value = '';
  updateCount();
  $('opinion').focus();
});
$('playground').addEventListener('click', () => { $('opinion').scrollIntoView({ behavior: 'smooth', block: 'center' }); if (!busy) $('opinion').focus({ preventScroll: true }); });
$('help-button').addEventListener('click', () => $('help-dialog').showModal());
document.querySelectorAll('.close-dialog').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
}));

function renderHistory() {
  $('history-total').textContent = history.length;
  $('history-list').replaceChildren(...history.map(thread => {
    const button = element('button', 'history-item');
    button.append(element('strong', '', thread.text), element('span', '', `${new Date(thread.createdAt).toLocaleDateString('ko-KR')} · ${thread.mode === 'diary' ? '3인칭' : '1인칭'} · 댓글 ${thread.reactions.length}개`));
    button.addEventListener('click', () => {
      currentThread = thread;
      $('history-dialog').close();
      showThread();
    });
    return button;
  }));
  if (!history.length) $('history-list').append(element('p', 'history-empty', '아직 이야기가 없어요. 첫 이야기를 던져볼까요?'));
  $('clear-history').hidden = history.length === 0;
}
$('history-button').addEventListener('click', () => { renderHistory(); $('history-dialog').showModal(); });
$('clear-history').addEventListener('click', () => { history = []; saveHistory(); renderHistory(); toast('이 브라우저의 기록을 모두 지웠어요.'); });

if (location.hash === '#site') window.history.replaceState(null, '', location.pathname + location.search);
renderCommunities();
renderSuggestions();
$('history-count').textContent = history.length;
if (document.querySelector('meta[name="wagle-runtime"]')?.content !== 'demo') try {
  const response = await fetch('/api/status', { signal: AbortSignal.timeout(3000) });
  if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
    const status = await response.json();
    serverAvailable = true;
    $('connection-status').textContent = status.ai ? 'AI 연결됨' : '데모 모드';
    $('connection-status').classList.toggle('live', status.ai);
  }
} catch { /* A static preview uses the same labeled, browser-local demo. */ }
