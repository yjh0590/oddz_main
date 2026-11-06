// Decorative background particles for the home page and themes.
// Each page has one or more containers; only the ones present are filled.
(() => {
  const rand = (min, span) => min + Math.random() * span;
  const STAR = '<svg width="SIZE" height="SIZE" viewBox="0 0 10 10"><path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="currentColor"/></svg>';

  function floaters(container, { count, cls, delay, duration, drift, size }, extra) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = cls;
      const px = rand(size[0], size[1]);
      el.style.left = Math.random() * 100 + 'vw';
      el.style.width = px + 'px';
      el.style.height = px + 'px';
      el.style.animationDelay = Math.random() * delay + 's';
      el.style.animationDuration = rand(duration[0], duration[1]) + 's';
      el.style.setProperty('--drift', (Math.random() * drift * 2 - drift) + 'px');
      if (extra) extra(el);
      container.appendChild(el);
    }
  }

  function twinkles(container, { count, cls, size, top }) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = cls;
      el.innerHTML = STAR.replaceAll('SIZE', String(size));
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top = Math.random() * top + 'vh';
      el.style.animationDuration = rand(2, 3) + 's';
      el.style.animationDelay = Math.random() * 4 + 's';
      container.appendChild(el);
    }
  }

  const $ = (id) => document.getElementById(id);

  // Home (sparkle)
  if ($('fireflies')) floaters($('fireflies'), { count: 22, cls: 'firefly', delay: 22, duration: [16, 14], drift: 40, size: [3, 4] });

  // Game · sunset
  if ($('embers')) floaters($('embers'), { count: 22, cls: 'ember', delay: 20, duration: [14, 14], drift: 35, size: [3, 4] });

  // Game · water
  if ($('stars')) twinkles($('stars'), { count: 34, cls: 'star', size: 8, top: 70 });

  // Bubbles
  if ($('bubbles')) {
    const colors = ['#F5A9C9', '#8FD8E8', '#B79EE8', '#9EE8C8'];
    floaters($('bubbles'), { count: 20, cls: 'bubble', delay: 22, duration: [16, 14], drift: 40, size: [10, 22] }, (el) => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      el.style.background = `radial-gradient(circle at 30% 26%, rgba(255,255,255,0.9), transparent 40%), ${color}33`;
      el.style.border = `1px solid ${color}88`;
    });
  }
  if ($('sparkles')) twinkles($('sparkles'), { count: 26, cls: 'spark', size: 10, top: 100 });

  // Machine
  const hex = $('hexbits');
  if (hex) {
    const NS = 'http://www.w3.org/2000/svg';
    for (let i = 0; i < 16; i++) {
      const wrap = document.createElementNS(NS, 'svg');
      wrap.setAttribute('viewBox', '0 0 200 200');
      const use = document.createElementNS(NS, 'use');
      use.setAttribute('href', '#hexnut');
      wrap.appendChild(use);
      wrap.classList.add('hexbit');
      const size = rand(10, 14);
      wrap.style.left = Math.random() * 100 + 'vw';
      wrap.style.width = size + 'px';
      wrap.style.height = size + 'px';
      wrap.style.animationDelay = Math.random() * 22 + 's';
      wrap.style.animationDuration = rand(18, 14) + 's';
      wrap.style.setProperty('--drift', (Math.random() * 70 - 35) + 'px');
      hex.appendChild(wrap);
    }
  }
})();
