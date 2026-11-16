// 사이트별 "페이지" 껍데기. 레이아웃은 board(게시판) / app(모바일 앱) / feed(SNS) 세 갈래이고
// 세부 느낌은 styles.css의 [data-site] 규칙이 맡는다. 로고 이미지는 쓰지 않고 이름만 글자로 표기한다.
const pages = {
  dc: { layout: 'board', brand: '디시인사이드', board: '와글 갤러리', tabs: ['전체글', '개념글', '공지', '갤러리 정보'], me: 'ㅇㅇ(1.234)', head: '일반', down: '비추천', input: '타인의 권리를 침해하거나 명예를 훼손하는 댓글은 제재될 수 있습니다.' },
  fmkorea: { layout: 'board', brand: '에펨코리아', board: '자유게시판', tabs: ['포텐 터짐', '자유', '축구', '야구', '게임'], me: '와글러', head: '잡담', input: '댓글을 입력해 주세요.' },
  theqoo: { layout: 'board', brand: '더쿠', board: 'HOT 스퀘어', tabs: ['HOT', '스퀘어', '일상토크', '정보'], me: '무명의 더쿠', head: '잡담', numbered: true, input: '댓글을 작성하려면 로그인하세요.' },
  instiz: { layout: 'board', brand: '인스티즈', board: '익명잡담', tabs: ['이슈', '익명잡담', '연예', '고민'], me: '글쓴이', head: '일상', input: '익명으로 댓글 달기' },
  pann: { layout: 'board', brand: '네이트판', board: '톡커들의 선택', tabs: ['랭킹', '결혼/시집/친정', '사는 얘기', '10대 이야기'], me: 'ㅇㅇ', down: '반대', best: true, input: '타인을 비방하는 댓글은 삭제될 수 있습니다.' },
  blind: { layout: 'app', brand: '블라인드', board: '토픽 · 회사생활', tabs: ['회사생활', '연봉', '이직', '썸·연애'], me: '와글 · 글쓴이', input: '댓글을 남겨주세요.' },
  everytime: { layout: 'app', brand: '에브리타임', board: '자유게시판', tabs: [], me: '익명(글쓴이)', input: '댓글을 입력하세요.' },
  daangn: { layout: 'app', brand: '동네생활', board: '일상', tabs: ['전체', '일상', '맛집', '동네질문'], me: '와글러 · 내 동네', input: '댓글을 입력해주세요.' },
  momcafe: { layout: 'app', brand: '우리동네 맘스카페', board: '자유수다방', tabs: ['전체글', '인기글', '자유수다방', '육아정보'], me: '와글맘', input: '댓글을 남겨보세요.' },
  x: { layout: 'feed', brand: '← 게시물', me: '나', handle: '@wagle_me', input: '답글 게시하기' },
  threads: { layout: 'feed', brand: '스레드', me: 'wagle.me', input: 'wagle.me님에게 답글 남기기...' },
};

export const layoutOf = c => pages[c.id].layout;

function h(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children.filter(child => child !== null && child !== undefined && child !== false));
  return node;
}

const two = n => String(n).padStart(2, '0');
const stamp = time => { const d = new Date(time); return `${two(d.getMonth() + 1)}.${two(d.getDate())} ${two(d.getHours())}:${two(d.getMinutes())}`; };
const count = () => h('b', 'sp-count', '0'); // app.js가 댓글 수로 채운다.

export function renderPage(thread, c, sort) {
  const p = pages[c.id];
  const text = thread.text;
  const title = Array.from(text.split('\n')[0]).slice(0, 40).join('') + (Array.from(text).length > 40 ? '…' : '');
  const views = 120 + (text.length * 37) % 880;
  const likes = Math.round(views / 18);
  const root = h('div', 'sp');
  root.dataset.site = c.id;
  root.dataset.layout = p.layout;

  const head = h('header', 'sp-head', h('span', 'sp-logo', p.brand),
    p.layout === 'board' ? h('span', 'sp-search', '검색어를 입력하세요') : null,
    h('span', 'sp-icons', p.layout === 'board' ? '로그인 · 회원가입' : p.layout === 'app' ? '⌕  ☰' : ''));
  const board = p.board ? h('div', 'sp-board', p.board) : null;
  const active = Math.max(0, p.tabs?.findIndex(tab => p.board.includes(tab)) ?? 0);
  const tabs = p.tabs?.length ? h('nav', 'sp-tabs', ...p.tabs.map((tab, i) => h('span', i === active ? 'on' : '', tab))) : null;

  const when = p.layout === 'board' ? stamp(thread.createdAt) : '방금 전';
  const author = h('div', 'sp-author', h('span', 'c-avatar', c.symbol),
    h('div', 'sp-who', h('b', '', p.me), p.handle ? h('span', 'c-handle', p.handle) : null,
      p.layout !== 'feed' ? h('span', 'sp-meta', p.layout === 'board' ? `${when} · 조회 ${views} · ${c.like} ${likes}` : `${p.board} · ${when} · 조회 ${views}`) : null));
  const post = h('article', 'sp-post');
  if (p.layout !== 'feed') post.append(h('h1', 'sp-title', p.head ? h('span', 'sp-head-tag', `[${p.head}] `) : null, title));
  post.append(author, h('div', 'sp-body', text));
  if (p.layout === 'board') post.append(h('div', 'sp-vote', h('span', 'up', c.like, h('b', '', String(likes))), p.down ? h('span', 'down', p.down, h('b', '', String(Math.round(likes / 9)))) : null));
  if (p.layout === 'app') post.append(h('div', 'sp-actions', h('span', 'a-like', `♡ ${c.like} ${likes}`), h('span', 'a-cmt', '💬 댓글 ', count()), h('span', '', '☆ 스크랩')));
  if (p.layout === 'feed') {
    const d = new Date(thread.createdAt);
    post.append(h('div', 'sp-stamp', `${d.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })} · ${d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} · 조회수 ${views * 13}`),
      h('div', 'sp-actions', h('span', '', '💬 ', count()), h('span', '', `⟲ ${Math.round(likes / 3)}`), h('span', '', `♡ ${likes}`), h('span', '', c.id === 'x' ? '🔖' : '➤')));
  }

  const sortLabel = c.like === '♥' ? '인기순' : `${c.like}순`;
  const sorter = h('div', 'sp-sort', ...[['latest', '등록순'], ['popular', sortLabel]].map(([key, label]) => {
    const button = h('button', `sort-button${sort === key ? ' active' : ''}`, label);
    button.type = 'button';
    button.dataset.sort = key;
    button.setAttribute('aria-pressed', String(sort === key));
    return button;
  }));
  const cmtHead = h('div', 'sp-cmt-head', h('span', '', p.layout === 'feed' ? '답글 ' : p.layout === 'board' ? '전체 댓글 ' : '댓글 ', count(), p.layout === 'board' ? '개' : ''), sorter);
  const list = h('ul', 'sp-cmts');
  list.id = 'reactions';
  list.setAttribute('aria-live', 'polite');
  const typing = h('div', 'typing', h('span'), h('span'), h('span'), ' 누군가 댓글을 쓰고 있어요');
  typing.id = 'typing';
  typing.hidden = true;
  const input = h('div', 'sp-input', h('span', '', p.input));

  root.append(...[head, board, tabs, post].filter(Boolean), ...(p.layout === 'feed' ? [input, cmtHead, list, typing] : [cmtHead, list, typing, input]));
  return root;
}

export function renderComment(reaction, index, c, best, onLike) {
  const p = pages[c.id];
  const like = h('button', `c-like${reaction.liked ? ' liked' : ''}`);
  like.type = 'button';
  const paint = () => {
    const n = reaction.likes + (reaction.liked ? 1 : 0);
    like.textContent = c.like === '♥' ? `${reaction.liked ? '♥' : '♡'} ${n}` : `${c.like} ${n}`;
    like.setAttribute('aria-pressed', String(!!reaction.liked));
    like.setAttribute('aria-label', `${reaction.nickname} 댓글 ${c.like === '♥' ? '좋아요' : c.like} ${n}개`);
  };
  paint();
  like.addEventListener('click', () => { reaction.liked = !reaction.liked; like.classList.toggle('liked', reaction.liked); paint(); onLike(); });

  const isX = c.id === 'x' && reaction.nickname.startsWith('@');
  const name = (p.numbered ? `${index + 1}. ` : '') + (isX ? reaction.nickname.slice(1).replace(/_/g, ' ') : reaction.nickname);
  const time = p.layout === 'board' ? `${index + 1}분 전` : p.layout === 'feed' ? `· ${index + 1}분` : `${index + 1}분 전`;
  const foot = p.layout === 'feed'
    ? [h('span', '', `💬 ${reaction.likes % 7}`), h('span', '', `⟲ ${reaction.likes % 11}`), like, h('span', '', `📊 ${reaction.likes * 13 + 40}`)]
    : p.layout === 'app' ? [like, h('span', '', '답글쓰기')]
      : p.down ? [like, h('span', 'c-down', `${p.down} ${Math.round(reaction.likes / 6)}`)] : [like];

  const item = h('li', `c${best ? ' best' : ''}`, h('span', 'c-avatar', c.symbol),
    h('div', 'c-main',
      h('div', 'c-head', best ? h('em', 'c-best', 'BEST') : null, h('b', 'c-nick', name), isX ? h('span', 'c-handle', reaction.nickname) : null, h('span', 'c-time', time)),
      h('p', 'c-text', reaction.text),
      h('div', 'c-foot', ...foot)));
  item.querySelector('.c-avatar').setAttribute('aria-hidden', 'true');
  return item;
}
