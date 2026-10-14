document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('[data-lecture-version]');
  function updateLinks() {
    for (const link of links) {
      const url = new URL(link.getAttribute('href'), location.href);
      url.searchParams.set('theme', document.documentElement.dataset.theme || 'sparkle');
      url.hash = location.hash === '#guide' ? 'guide' : '';
      link.href = url.href;
    }
  }
  updateLinks();
  document.querySelector('.page-tabs')?.addEventListener('click', updateLinks);
  window.addEventListener('hashchange', updateLinks);
  window.addEventListener('popstate', updateLinks);
});
