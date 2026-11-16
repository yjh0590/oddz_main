import { communities, samples, demoReactions } from './community.js';

const $ = id => document.getElementById(id);
const selected = new Set(['square']);
let mode = 'opinion';
let busy = false;
let sort = 'latest';
let currentThread = null;
let serverAvailable = false;
let toastTimeout;
let history = [];
try {
  const saved = JSON.parse(localStorage.getItem('wagle-stories') || '[]');
  if (Array.isArray(saved)) history = saved.filter(t => t && typeof t.id === 'string' && typeof t.text === 'string' && ['opinion', 'diary'].includes(t.mode) && Array.isArray(t.communities) && t.communities.every(id => communities.some(c => c.id === id)) && Array.isArray(t.reactions) && t.reactions.every(r => r && communities.some(c => c.id === r.community) && typeof r.text === 'string' && typeof r.nickname === 'string' && Number.isFinite(r.likes))).slice(0, 20);
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

function renderCommunities() {
  $('communities').replaceChildren(...communities.map(c => {
    const button = element('button', `community-card${selected.has(c.id) ? ' selected' : ''}`);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(selected.has(c.id)));
    button.setAttribute('aria-label', `${c.name}, ${c.desc}`);
    button.disabled = busy;
    palette(button, c);
    button.append(element('span', 'check-mark', '✓'), element('span', 'community-symbol', c.symbol), element('span', 'community-name', c.name), element('span', 'community-desc', c.desc));
    button.addEventListener('click', () => {
      if (selected.has(c.id)) {
        if (selected.size === 1) return toast('최소 한 곳은 선택해주세요.');
        selected.delete(c.id);
      } else selected.add(c.id);
      renderCommunities();
      $('communities').children[communities.indexOf(c)].focus({ preventScroll: true });
    });
    return button;
  }));
  $('selection-count').textContent = `${selected.size}개 선택됨`;
  $('select-all').textContent = selected.size === 7 ? '선택 초기화 ↺' : '모두 선택 ↗';
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
  $('opinion').placeholder = mode === 'diary' ? '오늘 내 AI에게 무슨 부탁을 했나요? AI들끼리 뒷이야기를 나눠요.' : '솔직히, 주 4일제는 이제 도입해야 하는 거 아님?';
}

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

function renderReaction(reaction, index) {
  const c = communities.find(c => c.id === reaction.community);
  const article = element('article', 'reaction');
  palette(article, c);
  const avatar = element('div', 'reaction-avatar', c.symbol);
  avatar.setAttribute('aria-hidden', 'true');
  const body = element('div', 'reaction-body');
  const meta = element('div', 'reaction-meta');
  meta.append(element('span', 'reaction-name', reaction.nickname), element('span', 'reaction-community', c.name), element('span', 'reaction-time', `${index + 1}분 전 · 가상 반응`));
  const like = element('button', `like-button${reaction.liked ? ' liked' : ''}`);
  like.setAttribute('aria-pressed', String(!!reaction.liked));
  const updateLike = () => {
    like.replaceChildren(element('span', 'heart', reaction.liked ? '♥' : '♡'), document.createTextNode(`공감 ${reaction.likes + (reaction.liked ? 1 : 0)}`));
    like.setAttribute('aria-label', `${reaction.nickname} 댓글 공감 ${reaction.likes + (reaction.liked ? 1 : 0)}개`);
  };
  updateLike();
  like.addEventListener('click', () => {
    reaction.liked = !reaction.liked;
    like.classList.toggle('liked', reaction.liked);
    like.setAttribute('aria-pressed', String(reaction.liked));
    updateLike();
    if (!busy) persistThread();
  });
  body.append(meta, element('p', 'reaction-text', reaction.text), like);
  article.append(avatar, body);
  return article;
}

function renderReactions() {
  const items = currentThread ? [...currentThread.reactions] : [];
  if (sort === 'popular') items.sort((a, b) => (b.likes + !!b.liked) - (a.likes + !!a.liked));
  $('reactions').replaceChildren(...items.map(renderReaction));
  $('comment-count').textContent = items.length;
  $('response-count').textContent = items.length;
}

function showThread() {
  $('empty-state').hidden = true;
  $('thread-section').hidden = false;
  $('post-text').textContent = currentThread.text;
  $('post-meta').textContent = `${currentThread.mode === 'diary' ? 'AI 일상 엿보기' : '내 의견 던지기'} · ${new Date(currentThread.createdAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
  $('post-communities').textContent = currentThread.communities.map(id => communities.find(c => c.id === id).name).join(' · ');
  $('thread-mode-label').textContent = currentThread.demo ? '데모 · 예시 반응' : 'AI 생성 반응';
  renderReactions();
}

function setBusy(value) {
  busy = value;
  $('submit-button').disabled = value;
  $('submit-button').textContent = value ? '반응 모으는 중…' : '반응 구경하기 ↗';
  $('opinion').disabled = value;
  $('select-all').disabled = value;
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
  if (!serverAvailable) return { reactions: demoReactions(payload.text, payload.communities, payload.mode), demo: true };
  const response = await fetch('/api/reactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(65000) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '반응을 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
  return data;
}

async function submit(payload) {
  if (busy) return;
  $('error-message').hidden = true;
  const previous = currentThread;
  currentThread = { id: crypto.randomUUID(), text: payload.text, mode: payload.mode, communities: payload.communities, reactions: [], createdAt: Date.now(), demo: true };
  showThread();
  setBusy(true);
  $('thread-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  try {
    const data = await generate(payload);
    currentThread.demo = data.demo;
    showThread();
    for (const reaction of data.reactions) {
      await new Promise(resolve => setTimeout(resolve, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240 + Math.random() * 180));
      currentThread.reactions.push(reaction);
      $('reactions').append(renderReaction(reaction, currentThread.reactions.length - 1));
      $('comment-count').textContent = currentThread.reactions.length;
      $('response-count').textContent = currentThread.reactions.length;
    }
    renderReactions();
    persistThread();
  } catch (error) {
    currentThread = previous;
    if (currentThread) showThread();
    else { $('thread-section').hidden = true; $('empty-state').hidden = false; }
    $('error-message').textContent = error.name === 'TimeoutError' ? '응답 시간이 길어지고 있어요. 잠시 후 다시 시도해주세요.' : error.message;
    $('error-message').hidden = false;
    $('error-message').scrollIntoView({ behavior: 'smooth', block: 'center' });
  } finally { setBusy(false); }
}

$('opinion-form').addEventListener('submit', event => {
  event.preventDefault();
  const text = $('opinion').value.trim();
  if (!text) { toast('먼저 이야기를 한 줄 적어주세요.'); $('opinion').focus(); return; }
  submit({ text, communities: [...selected], mode });
});
$('opinion').addEventListener('input', updateCount);
$('opinion').addEventListener('keydown', event => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.isComposing) { event.preventDefault(); $('opinion-form').requestSubmit(); }
});
$('select-all').addEventListener('click', () => {
  const allSelected = selected.size === 7;
  selected.clear();
  (allSelected ? [communities[0]] : communities).forEach(c => selected.add(c.id));
  renderCommunities();
});
document.querySelectorAll('.compose-tab').forEach(button => button.addEventListener('click', () => {
  mode = button.dataset.mode;
  document.querySelectorAll('.compose-tab').forEach(tab => { const active = tab === button; tab.classList.toggle('active', active); tab.setAttribute('aria-pressed', String(active)); });
  renderSuggestions();
}));
document.querySelectorAll('.sort-button').forEach(button => button.addEventListener('click', () => {
  sort = button.dataset.sort;
  document.querySelectorAll('.sort-button').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  renderReactions();
}));
$('regenerate').addEventListener('click', () => { if (currentThread) submit({ text: currentThread.text, communities: currentThread.communities, mode: currentThread.mode }); });
$('new-story').addEventListener('click', () => {
  if (busy) return;
  currentThread = null;
  $('thread-section').hidden = true;
  $('empty-state').hidden = false;
  $('opinion').value = '';
  updateCount();
  $('opinion').focus();
});
$('playground').addEventListener('click', () => { $('opinion').scrollIntoView({ behavior: 'smooth', block: 'center' }); if (!busy) $('opinion').focus({ preventScroll: true }); });
$('copy-story').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(currentThread.text); toast('이야기를 복사했어요.'); }
  catch { toast('이 브라우저에서는 복사를 사용할 수 없어요.'); }
});
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
    button.append(element('strong', '', thread.text), element('span', '', `${new Date(thread.createdAt).toLocaleDateString('ko-KR')} · ${thread.mode === 'diary' ? 'AI 일상' : '내 의견'} · 댓글 ${thread.reactions.length}개`));
    button.addEventListener('click', () => {
      currentThread = thread;
      $('history-dialog').close();
      showThread();
      $('thread-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return button;
  }));
  if (!history.length) $('history-list').append(element('p', 'history-empty', '아직 이야기가 없어요. 첫 이야기를 던져볼까요?'));
  $('clear-history').hidden = history.length === 0;
}
$('history-button').addEventListener('click', () => { renderHistory(); $('history-dialog').showModal(); });
$('clear-history').addEventListener('click', () => { history = []; saveHistory(); renderHistory(); toast('이 브라우저의 기록을 모두 지웠어요.'); });

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
