// Opening oddz.click again returns to the visitor's last selected theme.
// Loaded synchronously in <head> of index.html so the redirect happens before paint.
(() => {
  try {
    const saved = localStorage.getItem('oddz-theme');
    const allowed = [
      'themes/machine.html',
      'themes/game-water.html',
      'themes/game-sunset.html',
      'themes/bubbles.html',
      'themes/oz.html',
      'themes/hum.html',
      'themes/olympus.html',
      'themes/ripple.html'
    ];
    if (allowed.includes(saved)) location.replace(new URL(saved + location.hash, location.href));
  } catch (_) { /* Stay on the default design when storage is unavailable. */ }
})();
