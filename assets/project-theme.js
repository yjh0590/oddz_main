(() => {
  const home = {
    sparkle: '../index.html',
    machine: '../themes/machine.html',
    'game-water': '../themes/game-water.html',
    'game-sunset': '../themes/game-sunset.html',
    bubbles: '../themes/bubbles.html'
  };
  const requested = new URLSearchParams(location.search).get('theme');
  let theme = 'sparkle';
  if (Object.hasOwn(home, requested)) {
    theme = requested;
    try {
      if (theme === 'sparkle') localStorage.removeItem('oddz-theme');
      else localStorage.setItem('oddz-theme', home[theme].slice(3));
    } catch (_) { /* Explicit link still sets the theme. */ }
  } else {
    try {
      const stored = localStorage.getItem('oddz-theme');
      for (const [name, path] of Object.entries(home)) {
        if (stored === path.slice(3)) { theme = name; break; }
      }
    } catch (_) { /* Default theme is available without storage. */ }
  }
  document.documentElement.dataset.theme = theme;
  document.addEventListener('DOMContentLoaded', () => {
    for (const link of document.querySelectorAll('[data-home-link]')) {
      link.href = home[theme] + (link.dataset.homeLink === 'work' ? '#work' : '');
    }
  });
})();
