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
    'pj-02': { note: '아주 간단한 참여가 쌓이면 어떤 게임이 될지 적어 둔 첫 메모가 있다.', links: [journal('rock-paper-scissors')] },
    'pj-04': { note: '처음에는 실행 파일로 만들려다 웹으로 방향을 바꾼, 첫 배포 프로젝트.', links: [journal('enrollment'), source('inu-sugangshinchoeng')] },
    'pj-05': { note: '쓰던 일기 앱의 제한이 답답해서, 내가 쓰고 싶은 방식대로 직접 만들었다.', links: [journal('diary')] },
    'pj-06': { note: '카메라로 실제 손과 물체의 움직임을 따라가 보려던 실험에서 시작했다.', links: [journal('bottle')] },
    'pj-08': { note: '처음에는 마우스 좌표와 화면 인식으로 다음 강의를 누르는 스크립트였다.', links: [{ label: '그 스크립트 이야기', href: '../journal/lms-script.html?theme=oz' }, journal('todays-lecture')] },
    'pj-09': { note: '낙서 캐릭터와 둥근 탁자 시점으로 만드는 중.', links: [journal('random-games')] },
    'pj-11': { note: '‘왼쪽 문’ 안내를 실제 화살표로 바꾸려다 위치와 데이터의 한계를 만났다.', links: [journal('subway')] },
    'pj-12': { note: '부처별 HWPX 문서 수백 개를 사업별로 나누던 일에서 나왔다.', links: [journal('macro')] },
    'pj-15': { note: '강의 영상을 MP3로 바꾸고 대본을 공부 자료로 만들던 반복 작업을 한 흐름으로 묶었다.', links: [journal('transcript-guide'), source('lecture-video-transcript-guide')] },
    'pj-18': { note: '시작은 “로또에 당첨되면 뭐 하지?”라는 상상이었다.', links: [journal('if-world'), source('if-you-get-lotto-1st')] },
    'pj-23': { note: '처음에는 종료 예약 버튼 하나뿐인 프로그램이었다.', links: [journal('cmd-toolbox'), source('CmdToolbox')] },
    'pj-07': { note: '물병 다음으로 시도한 움직임. 작은 값 하나에도 큐브가 엉뚱하게 돌았다.', links: [journal('cube')] },
    'pj-01': { note: '로그인에서 막혀, 어디서 멈췄는지도 찾지 못한 채 메모만 남았다.', links: [journal('pdf-experiment')] },
    'pj-03': { note: '한 줄로 적어 둔 생각. 구현까지 간 기록은 없다.', links: [journal('keyboard')] },
    'pj-10': { note: '처음 돈을 주고 산 도메인. oddments에서 이름을 따왔다.', links: [journal('oddz')] },
    'pj-25': { note: 'v0.6.1 아이콘 → v0.6.2 둥근 카드 → v0.7 HTML·CSS 화면 → v0.7.1 Chrome 앱 창.', links: [journal('sseuk-ssak')] },
    'pj-40': { note: '정답 셀만 보면 놓치기 쉬운 계산 순서를, 한 단계씩 멈춰서 볼 수 있게 했다.', links: [journal('computer-skills')] },
    'pj-41': { note: '쌓인 저장 목록에서 먼저 정리 대상을 골라 확인하는 흐름을 만들었다.', links: [journal('social-saves')] },
    'pj-42': { note: '다시 만들어 볼 요리를 찾기 쉽게, 링크와 짧은 메모를 모으려는 구상이다.', links: [journal('recipe-links')] },
  };

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
