// 홈 테마 공통 움직임 (반짝이·기계·물빛·노을·비눗방울·올림포스).
// - 카드·현황판 위 커서 위치를 --mx/--my로 넘겨 테마가 빛·광택을 그리게 한다.
// - 스크롤 위치를 --scroll(px 숫자)로 넘겨 톱니·산 같은 배경이 따라 움직이게 한다.
// - 카드가 화면에 들어올 때 .is-in을 붙인다. 스크립트가 없으면 카드는 처음부터 보인다.
// 움직임 줄이기 설정이면 스크롤·등장 효과는 쓰지 않는다.
(() => {
  'use strict';
  const root = document.documentElement;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 커서 빛: 카드와 현황판에만 위임으로 건다.
  document.addEventListener('pointermove', (e) => {
    const el = e.target.closest?.('.oddz-project-card, .hero-board');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  }, { passive: true });

  if (still) return;

  // 스크롤 값
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      root.style.setProperty('--scroll', String(Math.round(scrollY)));
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 카드 등장: 카탈로그가 그려진 뒤(이 스크립트는 그 뒤에 defer로 실행) 관찰한다.
  if (!('IntersectionObserver' in window)) return;
  const cards = document.querySelectorAll('#work .oddz-project-card');
  if (!cards.length) return;
  root.classList.add('motion-reveal');
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -6% 0px' });
  cards.forEach((card, i) => {
    card.style.setProperty('--i', String(i % 6));
    io.observe(card);
  });
})();
