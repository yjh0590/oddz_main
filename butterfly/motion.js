const scene = document.querySelector('.mascot-art');
const toggle = document.querySelector('#motion-toggle');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduce.matches;

function syncMotion() {
  document.documentElement.classList.toggle('motion-paused', paused);
  // The SVG is a local document so its motion can be paused together with the page.
  scene.contentDocument?.documentElement.classList.toggle('paused', paused);
  toggle.setAttribute('aria-pressed', String(paused));
  toggle.textContent = paused ? '▷ 재생' : 'Ⅱ 멈추기';
  if (reduce.matches) {
    toggle.textContent = '모션 꺼짐';
    toggle.disabled = true;
  } else toggle.disabled = false;
}
scene.addEventListener('load', syncMotion);
toggle.addEventListener('click', () => { paused = !paused; syncMotion(); });
reduce.addEventListener('change', () => { paused = reduce.matches; syncMotion(); });
syncMotion();

document.querySelector('#generate').addEventListener('click', event => {
  if (reduce.matches || paused || event.currentTarget.disabled) return;
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement('i');
  ripple.className = 'click-ripple';
  ripple.setAttribute('aria-hidden', 'true');
  const x = event.detail ? event.clientX - rect.left : rect.width / 2;
  const y = event.detail ? event.clientY - rect.top : rect.height / 2;
  Object.assign(ripple.style, { width: `${size}px`, height: `${size}px`, left: `${x-size/2}px`, top: `${y-size/2}px` });
  button.append(ripple);
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  setTimeout(() => ripple.remove(), 750);
});
