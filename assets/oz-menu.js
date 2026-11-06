// Oz theme: close the theme menu on outside click or Escape.
document.addEventListener('click', (e) => {
  const menu = document.querySelector('.theme-menu');
  if (menu?.open && !menu.contains(e.target)) menu.open = false;
});
document.addEventListener('keydown', (e) => {
  const menu = document.querySelector('.theme-menu');
  if (e.key === 'Escape' && menu?.open) menu.open = false;
});
