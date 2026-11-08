// Oz theme: put on / take off the Emerald City green spectacles.
(() => {
  const btn = document.querySelector('[data-specs]');
  if (!btn) return;
  const label = btn.querySelector('.specs-label');
  btn.addEventListener('click', () => {
    const on = document.documentElement.classList.toggle('specs-on');
    btn.setAttribute('aria-pressed', String(on));
    if (label) label.textContent = on ? '안경 벗기' : '초록 안경';
  });
})();
