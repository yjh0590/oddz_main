// 홈 히어로 옆 '작업 현황판'. 반짝이·기계·물빛·노을·비눗방울 홈에서 쓴다.
// 프로젝트 데이터(oddz-projects-data.js)로 그리고, 단계 버튼은 아래 카탈로그 필터를 누른다.
// oddz-projects-catalog.js 다음에 defer로 불러야 테마 이름(data-oddz-theme)이 정해져 있다.
(() => {
  'use strict';
  const data = window.ODDZ_PROJECTS;
  const hero = document.querySelector('main > .hero');
  if (!hero || !Array.isArray(data) || data.length === 0) return;

  const theme = document.documentElement.dataset.oddzTheme || 'sparkle';
  const copy = {
    sparkle: ['채집 현황', '최근 채집한 것', '지금 깜박이는 것'],
    machine: ['작업 현황판', '최근 출고', '가동 중'],
    'game-water': ['퀘스트 로그', '최근 클리어', '진행 중인 퀘스트'],
    'game-sunset': ['모험 일지', '최근 완수한 의뢰', '진행 중인 의뢰'],
    bubbles: ['오늘의 무대', '최근 공연', '리허설 중'],
    ripple: ['Surface', '최근 떠오른 것', '지금 번지는 물결'],
    olympus: ['PANTHEON', '최근 올림포스에 오른 것', '지금 빚는 중']
  }[theme] || ['작업 현황', '최근 완성', '지금 만드는 중'];
  const stages = [['done', '완성'], ['doing', '진행 중'], ['next', '끝나면 할 것'], ['someday', '언젠가 할 것']];

  const mk = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = String(text);
    return n;
  };
  // '2026.11.08', '2026.07', '2026.09.23 이전' → 비교용 숫자
  const dateKey = (d) => {
    const [y = 0, m = 0, day = 0] = String(d || '').match(/\d+/g) || [];
    return Number(y) * 10000 + Number(m) * 100 + Number(day);
  };
  const detailUrl = (str) => {
    if (typeof str !== 'string') return null;
    const path = str.split('?')[0];
    if (!/^\/projects\/[a-z0-9-]+\.html$/i.test(path)) return null;
    const url = new URL(path, document.baseURI);
    url.searchParams.set('theme', theme);
    return url.href;
  };
  const iconUrl = (str) =>
    typeof str === 'string' && /^\/assets\/icons\/[a-z0-9-]+\.png$/.test(str) ? new URL(str, document.baseURI).href : null;

  const board = mk('aside', 'hero-board');
  board.setAttribute('aria-label', copy[0]);

  const head = mk('div', 'hero-board__head');
  head.append(mk('span', 'hero-board__title', copy[0]), mk('span', 'hero-board__total', '전체 ' + data.length + '개'));
  board.append(head);

  // 단계별 개수: 누르면 카탈로그가 그 단계만 보여 준다.
  const tally = mk('div', 'hero-board__stages');
  for (const [key, label] of stages) {
    const count = data.filter((p) => p.stage === key).length;
    const btn = mk('button', 'hero-board__stage');
    btn.type = 'button';
    btn.dataset.stage = key;
    btn.style.setProperty('--share', (count / data.length).toFixed(3));
    btn.setAttribute('aria-label', label + ' ' + count + '개 보기');
    btn.append(mk('span', 'hero-board__num', count), mk('span', 'hero-board__label', label), mk('span', 'hero-board__bar'));
    btn.addEventListener('click', () => {
      const tab = document.querySelector('#work .oddz-filter[data-filter="' + key + '"]');
      if (tab) tab.click();
      document.getElementById('work')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    tally.append(btn);
  }
  board.append(tally);

  // 최근 완성 3개
  const recent = data.filter((p) => p.stage === 'done').sort((a, b) => dateKey(b.date) - dateKey(a.date)).slice(0, 3);
  if (recent.length) {
    const sec = mk('div', 'hero-board__section');
    sec.append(mk('p', 'hero-board__sub', copy[1]));
    const list = mk('ul', 'hero-board__recent');
    for (const p of recent) {
      const li = mk('li');
      const href = detailUrl(p.url);
      const row = mk(href ? 'a' : 'div', 'hero-board__item');
      if (href) row.href = href;
      const src = iconUrl(p.icon);
      if (src) {
        const img = mk('img');
        img.src = src; img.alt = ''; img.width = 40; img.height = 40; img.decoding = 'async';
        row.append(img);
      }
      const text = mk('span', 'hero-board__text');
      text.append(mk('span', 'hero-board__name', p.name), mk('span', 'hero-board__meta', [p.date, p.type].filter(Boolean).join(' · ')));
      row.append(text);
      if (href) row.append(mk('span', 'hero-board__go', '→'));
      li.append(row);
      list.append(li);
    }
    sec.append(list);
    board.append(sec);
  }

  // 진행 중
  const doing = data.filter((p) => p.stage === 'doing');
  if (doing.length) {
    const sec = mk('div', 'hero-board__section');
    sec.append(mk('p', 'hero-board__sub', copy[2]));
    const chips = mk('ul', 'hero-board__chips');
    for (const p of doing) chips.append(mk('li', '', p.name));
    sec.append(chips);
    board.append(sec);
  }

  hero.classList.add('has-board');
  hero.append(board);
})();
