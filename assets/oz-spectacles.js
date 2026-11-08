// Oz theme easter egg: put on the gatekeeper's green spectacles to see what is hidden.
// Everything here is already public (dev journal posts, public GitHub repos).
(() => {
  const plate = document.querySelector('.postcard');
  const caption = plate?.querySelector('[data-specs-caption]');
  const triggers = plate ? [...plate.querySelectorAll('[data-specs]')] : [];
  const btn = plate?.querySelector('button.specs[data-specs]');
  const hit = plate?.querySelector('.specs-hit');
  if (!plate || !caption || !btn) return;

  const journal = (slug) => ({ label: '개발일지', href: `../journal/${slug}.html?theme=oz` });
  const source = (repo) => ({ label: '소스 코드', href: `https://github.com/yjh0590/${repo}`, external: true });

  // Per-project back stories, keyed by card id.
  const secrets = {
    'pj-01': { note: '아주 간단한 참여가 쌓이면 어떤 게임이 될지 적어 둔 첫 메모가 있다.', links: [journal('rock-paper-scissors')] },
    'pj-02': { note: '처음에는 실행 파일로 만들려다 웹으로 방향을 바꾼, 첫 배포 프로젝트.', links: [journal('enrollment'), source('inu-sugangshinchoeng')] },
    'pj-03': { note: '쓰던 일기 앱의 제한이 답답해서, 내가 쓰고 싶은 방식대로 직접 만들었다.', links: [journal('diary')] },
    'pj-04': { note: '카메라로 실제 손과 물체의 움직임을 따라가 보려던 실험에서 시작했다.', links: [journal('bottle')] },
    'pj-05': { note: '처음에는 마우스 좌표와 화면 인식으로 다음 강의를 누르는 스크립트였다.', links: [{ label: '그 스크립트 이야기', href: '../journal/lms-script.html?theme=oz' }, journal('todays-lecture')] },
    'pj-06': { note: '낙서 캐릭터와 둥근 탁자 시점으로 만드는 중.', links: [journal('random-games')] },
    'pj-07': { note: '‘왼쪽 문’ 안내를 실제 화살표로 바꾸려다 위치와 데이터의 한계를 만났다.', links: [journal('subway')] },
    'pj-08': { note: '부처별 HWPX 문서 수백 개를 사업별로 나누던 일에서 나왔다.', links: [journal('macro')] },
    'pj-11': { note: '강의 영상을 MP3로 바꾸고 대본을 공부 자료로 만들던 반복 작업을 한 흐름으로 묶었다.', links: [journal('transcript-guide'), source('lecture-video-transcript-guide')] },
    'pj-14': { note: '시작은 “로또에 당첨되면 뭐 하지?”라는 상상이었다.', links: [journal('if-world'), source('if-you-get-lotto-1st')] },
    'pj-19': { note: '처음에는 종료 예약 버튼 하나뿐인 프로그램이었다.', links: [journal('cmd-toolbox'), source('CmdToolbox')] },
    'pj-21': { note: 'v0.6.1 아이콘 → v0.6.2 둥근 카드 → v0.7 HTML·CSS 화면 → v0.7.1 Chrome 앱 창.', links: [journal('sseuk-ssak')] },
  };

  // Journal-only experiments that never made it onto the project list.
  const lab = [
    { no: '실험', type: '3D', title: '카메라 트래킹 3D 큐브', date: '2026.05.04', desc: '여러 회전축을 가진 큐브를 카메라로 움직여 보려던 인터랙션 실험.', slug: 'cube', mood: 'fantasy' },
    { no: '실험', type: 'Web', title: 'PDF 변환·정리 웹사이트', date: '2025.09.04', desc: '관리자 화면과 로그인 연결을 시험하다가 막혔던 짧은 개발 메모.', slug: 'pdf-experiment', mood: 'trial' },
    { no: '메모', type: 'Idea', title: '키보드 답장 아이디어', date: '2025.12.09', desc: '답장을 쓸 때 AI가 문장을 도와주는 키보드에 대한 짧은 구상.', slug: 'keyboard', mood: 'wish' },
    { no: '기록', type: 'Web', title: 'oddz.click 만들기', date: '2026.07–09', desc: '이름을 정하고 여러 디자인을 거쳐 도메인과 GitHub Pages를 연결한 기록.', slug: 'oddz', mood: 'journey' },
  ];

  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const link = ({ label, href, external }) => {
    const a = el('a', '', label + ' ↗'); a.href = href;
    if (external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    return a;
  };

  let built = false;
  function build() {
    const catalog = document.querySelector('#work .oddz-catalog');
    if (!catalog) return false;
    for (const [id, s] of Object.entries(secrets)) {
      const main = document.getElementById(id)?.querySelector('.entry-main');
      if (!main || main.querySelector('.secret')) continue;
      const box = el('div', 'secret');
      box.append(el('span', 'secret-tag', '안경으로 본 것'), el('p', 'secret-note', s.note));
      const links = el('span', 'secret-links'); s.links.forEach((l) => links.append(link(l))); box.append(links);
      main.insertBefore(box, main.querySelector('.oddz-project-lower'));
    }
    const section = el('section', 'oddz-project-stage secret-lab'); section.dataset.stage = 'secret';
    const head = el('div', 'oddz-stage-head');
    head.append(el('h3', '', '지도 밖 실험실'), el('span', 'oddz-stage-count', lab.length + '개'));
    const list = el('div', 'oddz-stage-list');
    for (const x of lab) {
      const card = el('article', 'entry oddz-project-card secret-card'); card.dataset.mood = x.mood;
      const main = el('div', 'entry-main');
      const meta = el('div', 'entry-meta'); meta.append(el('span', 'entry-cat', x.type), el('span', 'entry-status', '목록 밖'));
      const lower = el('div', 'oddz-project-lower'); lower.append(el('span', 'entry-link', '개발일지 보기 ↗'));
      main.append(meta, el('h3', '', x.title), el('p', 'oddz-project-date', x.date), el('p', 'oddz-project-desc', x.desc), lower);
      const surface = el('a', 'oddz-card-surface'); surface.href = `../journal/${x.slug}.html?theme=oz`;
      surface.setAttribute('aria-label', x.title + ' 개발일지 열기');
      card.append(el('div', 'number', x.no), main, surface);
      list.append(card);
    }
    section.append(head, el('p', 'oddz-stage-intro', '프로젝트 목록에는 없지만 개발일지에 남아 있는 실험과 메모'), list);
    catalog.querySelector('.oddz-project-groups')?.after(section);
    return true;
  }

  const text = {
    off: ['노란 벽돌길 끝에 에메랄드 시티가 있다.', '초록 안경 쓰고 보기'],
    on: ['초록 안경을 쓰자, 카드마다 숨어 있던 것들이 보이기 시작했다. ↓', '안경 벗기'],
  };
  // The plate scene (walk in, put on glasses, look up) takes about 2s; reveal after it.
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer = 0;
  function toggle() {
    if (!built) built = build();
    const on = plate.classList.toggle('specs-on');
    clearTimeout(timer);
    if (on) timer = setTimeout(() => document.documentElement.classList.add('oz-specs'), calm.matches ? 0 : 2200);
    else document.documentElement.classList.remove('oz-specs');
    const [line, label] = on ? text.on : text.off;
    caption.textContent = line;
    btn.textContent = label;
    triggers.forEach((t) => t.setAttribute('aria-pressed', String(on)));
    hit?.setAttribute('aria-label', on ? '초록 안경 벗기' : '탁자 위 초록 안경 쓰기');
  }
  triggers.forEach((t) => t.addEventListener('click', toggle));
})();
