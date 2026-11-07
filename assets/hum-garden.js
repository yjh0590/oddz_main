// Hum theme: rebuild the hero's project board from the shared project data,
// so the board stays in step with assets/oddz-projects-data.js.
(() => {
  'use strict';
  const board = document.querySelector('[data-hum-board]');
  const data = window.ODDZ_PROJECTS;
  if (!board || !Array.isArray(data) || data.length === 0) return;

  const stages = [
    { key: 'done', title: '완성' },
    { key: 'doing', title: '진행 중' },
    { key: 'next', title: '끝나면 할 것' },
    { key: 'someday', title: '언젠가 할 것' }
  ];
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = String(text);
    return n;
  };
  const shortName = (name) => String(name).split(' · ')[0];
  const order = (a, b) => parseInt(a.no.slice(3), 10) - parseInt(b.no.slice(3), 10);

  const beds = [];
  let i = 0;
  for (const stage of stages) {
    const items = data.filter((x) => x.stage === stage.key).sort(order);
    if (items.length === 0) continue;
    const bed = el('div', 'bed bed--' + stage.key);
    const name = el('p', 'bed-name');
    name.append(el('span', '', stage.title), el('span', 'num', items.length));
    const list = el('ul', 'tiles');
    for (const item of items) {
      const li = el('li');
      const a = el('a', 'tile', shortName(item.name));
      a.href = '#' + item.id;
      a.style.setProperty('--i', String(i++));
      a.setAttribute('aria-label', item.no + ' ' + item.name + ', ' + stage.title);
      li.append(a);
      list.append(li);
    }
    bed.append(name, list);
    beds.push(bed);
  }
  board.querySelectorAll(':scope > .bed').forEach((n) => n.remove());
  board.append(...beds);
  const caption = board.querySelector('.board-caption');
  if (caption) caption.textContent = '지금까지 적어 둔 프로젝트 ' + data.length + '개';

  // A tile jumps to its card; clear the catalogue filter first so the card is shown.
  board.addEventListener('click', (event) => {
    const tile = event.target.closest('a.tile');
    if (!tile) return;
    const target = document.querySelector(tile.getAttribute('href'));
    if (target && target.hidden) {
      document.querySelector('#work .oddz-filter[data-filter="all"]')?.click();
      const search = document.querySelector('#work .oddz-search input');
      if (search && search.value) {
        search.value = '';
        search.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  });
})();
