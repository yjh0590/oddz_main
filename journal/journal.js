document.addEventListener('DOMContentLoaded', () => {
  const theme = document.documentElement.dataset.theme || 'sparkle';
  for (const link of document.querySelectorAll('[data-journal-detail], [data-journal-index]')) {
    const url = new URL(link.getAttribute('href'), location.href);
    url.searchParams.set('theme', theme);
    link.href = url.href;
  }
});
