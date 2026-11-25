// 홈 진열대: 왼쪽 큰 배너 + 오른쪽 세로 목록. 목록 위 탭으로 '완성 / 만드는 중'을 고르고, 목록 가운데에 온 작품이 배너에 뜬다.
// 색·재질·모서리는 각 테마의 --board-*, --card-*, --home-* 토큰을 따르고, 테마별 모양·장식·모션은 oddz-shelf.css에 있다.
// oddz-projects-catalog.js 다음에 defer로 불러야 테마 이름(data-oddz-theme)이 정해져 있다.
(() => {
  'use strict';
  const data = window.ODDZ_PROJECTS;
  const hero = document.querySelector('main > .hero');
  if (!hero || !Array.isArray(data)) return;

  const theme = document.documentElement.dataset.oddzTheme || 'sparkle';
    const copy = {
    sparkle: '최근 채집한 것',
    machine: '출고 완료',
    'game-water': '클리어한 퀘스트',
    'game-sunset': '완수한 의뢰',
    bubbles: '오늘의 공연',
    ink: '낙관 찍은 그림',
    fog: '창에 적어 둔 것',
    sand: '발굴한 유물',
    magnet: '붙어 있는 것',
    cloth: '다 마른 빨래',
    ripple: '떠오른 것',
    olympus: '올림포스에 오른 것'
  }[theme] || '완성한 것';

  const dateKey = (d) => {
    const [y = 0, m = 0, day = 0] = String(d || '').match(/\d+/g) || [];
    return Number(y) * 10000 + Number(m) * 100 + Number(day);
  };
  const byStage = (key) => data.filter((p) => p.stage === key).sort((a, b) => dateKey(b.date) - dateKey(a.date));
  const sets = { done: byStage('done'), doing: byStage('doing') };
  if (!sets.done.length) return;
  let shown = sets.done;

  // 데이터의 경로는 사이트 루트 기준('/projects/x.html'), 상세 페이지에는 지금 테마를 넘긴다
  const link = (p) => {
    if (typeof p.url !== 'string' || !p.url.startsWith('/')) return '#work';
    const url = new URL(p.url, location.origin);
    if (url.pathname.startsWith('/projects/')) url.searchParams.set('theme', theme);
    return url.href;
  };
  const icon = (p) => (typeof p.icon === 'string' && /^\/assets\/icons\/[a-z0-9-]+\.png$/.test(p.icon) ? new URL(p.icon, location.origin).href : '');
  const mk = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = String(text);
    return n;
  };

  // 아이콘 PNG에는 네모 타일이 그려져 있어서, 타일 테두리 안쪽 원만 잘라 테마 모양 틀(CSS --emblem)에 담는다
  const emblem = (p, cls) => {
    const outer = mk('span', 'oddz-shelf__emblem' + (cls ? ' ' + cls : ''));
    const inner = mk('span');
    const img = mk('img');
    img.src = icon(p); img.alt = ''; img.decoding = 'async';
    // 틀 여백은 아이콘 타일의 바탕색으로 채운다 (CSS가 이 그림을 크게 확대해 타일 안쪽 한 점을 비춘다)
    if (img.src) inner.style.setProperty('--icon', `url("${img.src}")`);
    inner.append(img);
    outer.append(inner);
    return outer;
  };

  const splitName = (n) => { const [main, ...rest] = String(n || '').split(' · '); return [main, rest.join(' · ')]; };

  const shelf = mk('section', 'oddz-shelf');
  shelf.setAttribute('aria-label', copy);
  const stage = mk('div', 'oddz-shelf__stage');
  const banner = mk('article', 'oddz-shelf__banner');
  banner.setAttribute('aria-live', 'polite');
  const side = mk('div', 'oddz-shelf__side');
  const up = mk('button', 'oddz-shelf__arrow', '▲');
  const down = mk('button', 'oddz-shelf__arrow', '▼');
  up.type = down.type = 'button';
  up.setAttribute('aria-label', '이전 작품');
  down.setAttribute('aria-label', '다음 작품');
  const list = mk('ol', 'oddz-shelf__list');
  list.setAttribute('aria-label', copy);
  const count = mk('span', 'oddz-shelf__count');

  // 단계 탭: 완성 / 만드는 중
  const tabs = mk('div', 'oddz-shelf__tabs');
  tabs.setAttribute('role', 'group');
  tabs.setAttribute('aria-label', '보여 줄 단계');
  for (const [key, label] of [['done', '완성'], ['doing', '만드는 중']]) {
    if (!sets[key].length) continue;
    const t = mk('button', '', label);
    t.type = 'button';
    t.dataset.stage = key;
    t.setAttribute('aria-pressed', String(key === 'done'));
    t.append(mk('span', '', sets[key].length));
    tabs.append(t);
  }

  let items = [];
  const fillList = () => {
    items = shown.map((p, i) => {
      const li = mk('li');
      const b = mk('button');
      b.type = 'button';
      b.dataset.i = i;
      const text = mk('span');
      const [main, sub] = splitName(p.name);
      text.append(mk('strong', '', main), mk('small', '', sub || p.type));
      b.append(emblem(p), text);
      li.append(b);
      return b;
    });
    list.replaceChildren(...items.map((b) => b.parentElement));
  };
  fillList();
  side.append(tabs, up, list, down, count);
  // 액자: 배너 바깥으로 나오는 테마 장식(마개, 족자 막대, 깃대 등)을 붙이는 자리
  const frame = mk('div', 'oddz-shelf__frame');
  frame.append(banner);
  stage.append(frame, side);

  const more = mk('div', 'oddz-shelf__more');
  more.append(mk('span', '', `완성 ${sets.done.length}개 · 만드는 중 ${sets.doing.length}개 · 전체 ${data.length}개`));
  const all = mk('a', '', '작품 목록 전체 보기 →');
  all.href = '#work';
  more.append(all);

  shelf.append(stage, more);
  hero.classList.add('has-shelf');
  hero.after(shelf);

  // '본 이름 · 부제' → [본 이름, 부제]. 제목은 본 이름만 크게, 부제는 아랫줄에 작게
  // 배너에는 소개의 첫 문장만 (나머지는 상세 페이지에)
  const firstSentence = (t) => String(t || '').split(/(?<=[.!?])\s/)[0];

  let current = -1;
  const show = (i) => {
    if (i === current) return;
    current = i;
    const p = shown[i];
    const big = emblem(p, 'oddz-shelf__icon');
    const head = mk('div', 'oddz-shelf__head');
    const [main, sub] = splitName(p.name);
    const title = mk('h2', '', main);
    if (sub) title.append(mk('span', 'oddz-shelf__sub', sub));
    head.append(mk('span', 'oddz-shelf__tag', p.no), title);
    const actions = mk('div', 'oddz-shelf__actions');
    const go = mk('a', 'oddz-shelf__btn', (p.link || '보기') + ' ↗');
    go.href = link(p);
    actions.append(go);
    banner.replaceChildren(mk('span', 'oddz-shelf__halo'), big, head, mk('p', 'oddz-shelf__desc', firstSentence(p.desc)), actions);
    items.forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
    count.textContent = `${i + 1} / ${shown.length}`;
  };

  // 목록 가운데(가로 목록이면 왼쪽 끝)에 가장 가까운 칸
  const nearest = () => {
    const vertical = getComputedStyle(list).flexDirection !== 'row';
    const box = list.getBoundingClientRect();
    const mid = vertical ? box.top + box.height / 2 : box.left + 38;
    let best = 0, dist = Infinity;
    items.forEach((b, k) => {
      const r = b.getBoundingClientRect();
      const d = Math.abs((vertical ? r.top + r.height / 2 : r.left + r.width / 2) - mid);
      if (d < dist) { dist = d; best = k; }
    });
    return best;
  };
  // 화살표·클릭으로 옮길 때는 목적지에 닿을 때까지 지나가는 칸으로 배너를 바꾸지 않는다 (깜박임 방지)
  let raf = 0, target = -1;
  list.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const i = nearest();
      if (target >= 0) { if (i !== target) return; target = -1; }
      show(i);
    });
  }, { passive: true });
  list.addEventListener('scrollend', () => { target = -1; });

  // 드래그 모션: 목록을 넘긴 양(--spin, 누적 각도)과 속도(--vel, -1~1, 손을 떼면 0으로 잦아듦)를 진열대에 넘긴다.
  // 테마 CSS가 이 값으로 톱니를 돌리고, 깃발을 펄럭이고, 열기구를 띄운다.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let lastPos = 0, spin = 0, vel = 0, loop = 0;
    const pos = () => (getComputedStyle(list).flexDirection === 'row' ? list.scrollLeft : list.scrollTop);
    const paint = () => {
      shelf.style.setProperty('--vel', Math.abs(vel) > 0.005 ? vel.toFixed(3) : '0');
      shelf.style.setProperty('--spin', `${spin.toFixed(1)}deg`);
      shelf.style.setProperty('--drift', `${spin.toFixed(1)}px`);
    };
    const tick = () => {
      vel *= 0.9;
      paint();
      loop = Math.abs(vel) > 0.005 ? requestAnimationFrame(tick) : 0;
    };
    lastPos = pos();
    list.addEventListener('scroll', () => {
      const p = pos(), d = p - lastPos;
      lastPos = p;
      spin += d * 0.5;
      vel = Math.max(-1, Math.min(1, vel * 0.6 + d / 40));
      paint();
      if (!loop) loop = requestAnimationFrame(tick);
    }, { passive: true });
  }

  const go = (i) => {
    i = Math.max(0, Math.min(shown.length - 1, i));
    const vertical = getComputedStyle(list).flexDirection !== 'row';
    const b = items[i];
    const smooth = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    // scrollIntoView는 페이지까지 굴리므로 목록 안에서만 움직인다
    if (vertical) list.scrollTo({ top: b.offsetTop - list.clientHeight / 2 + b.offsetHeight / 2, behavior: smooth });
    else list.scrollTo({ left: b.parentElement.offsetLeft, behavior: smooth });
    target = i;
    show(i);
  };
  list.addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (b) go(+b.dataset.i); });
  up.addEventListener('click', () => go(current - 1));
  down.addEventListener('click', () => go(current + 1));
  list.addEventListener('keydown', (e) => {
    const d = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[e.key];
    if (d) { e.preventDefault(); go(current + d); items[current].focus({ preventScroll: true }); }
  });
  banner.addEventListener('pointermove', (e) => {
    const r = banner.getBoundingClientRect();
    banner.style.setProperty('--mx', `${e.clientX - r.left}px`);
    banner.style.setProperty('--my', `${e.clientY - r.top}px`);
  });

  // 첫 칸과 끝 칸도 목록 가운데까지 올 수 있게 위아래 여백을 목록 높이로 맞춘다 (CSS %는 폭 기준이라 못 씀)
  const pad = () => {
    const vertical = getComputedStyle(list).flexDirection !== 'row';
    list.style.paddingBlock = vertical ? `${Math.max(0, (list.clientHeight - items[0].parentElement.offsetHeight) / 2)}px` : '';
    list.scrollTop = 0;
    list.scrollLeft = 0;
  };
  new ResizeObserver(pad).observe(list);

  // 탭을 누르면 그 단계 작품으로 목록을 다시 채우고 첫 작품을 배너에 띄운다
  tabs.addEventListener('click', (e) => {
    const t = e.target.closest('button[data-stage]');
    if (!t || t.getAttribute('aria-pressed') === 'true') return;
    tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === t)));
    shown = sets[t.dataset.stage];
    shelf.dataset.stage = t.dataset.stage;
    fillList();
    current = -1;
    target = -1;
    pad();
    show(0);
  });
  // 화면 전환: 평소엔 진열대만, #work(또는 그 안의 앵커)로 오면 작품 목록만 보여 준다
  const work = document.getElementById('work');
  if (work) {
    const back = mk('a', 'oddz-shelf__back', '← 처음 화면');
    back.href = '#';
    work.prepend(back);
    const root = document.documentElement;
    root.classList.add('oddz-has-shelf');
    const sync = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const target = id && document.getElementById(id);
      const showWork = !!target && work.contains(target);
      if (showWork !== root.classList.contains('oddz-view-work')) {
        root.classList.toggle('oddz-view-work', showWork);
        if (target === work || !showWork) scrollTo(0, 0);
        else target.scrollIntoView();
      }
    };
    addEventListener('hashchange', sync);
    sync();
    // #work로 바로 들어오면 브라우저가 불러온 뒤 다시 그 위치로 굴리므로 머리글이 보이게 맨 위로
    addEventListener('load', () => { if (location.hash === '#work') scrollTo(0, 0); });
  }

  show(0);
})();
