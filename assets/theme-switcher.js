(() => {
  const storageKey = 'oddz-theme';
  const picker = document.querySelector('.theme-picker');
  if (!picker) return;
  for (const link of picker.querySelectorAll('a[data-theme-path]')) {
    link.addEventListener('click', (event) => {
      try {
        const path = link.dataset.themePath;
        if (path) localStorage.setItem(storageKey, path);
        else localStorage.removeItem(storageKey);
      } catch (_) { /* Browser storage can be disabled; links still work. */ }
      const hash = window.location.hash;
      if (hash === '#work' || hash === '#contact') {
        event.preventDefault();
        window.location.assign(link.href + hash);
      }
    });
  }
  document.addEventListener('click', (event) => {
    if (picker.open && !picker.contains(event.target)) picker.open = false;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && picker.open) {
      picker.open = false;
      picker.querySelector('summary').focus();
    }
  });
})();
