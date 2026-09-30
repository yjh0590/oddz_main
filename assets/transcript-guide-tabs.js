(() => {
  const tabs = [...document.querySelectorAll('.page-tabs [role="tab"]')];
  if (tabs.length !== 2) return;
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  const tablist = document.querySelector('.page-tabs');
  function selectTab(index, focus = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (focus) tabs[index].focus();
  }
  function fromHash() { selectTab(location.hash === '#guide' ? 1 : 0); }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      const url = new URL(location.href);
      url.hash = index === 1 ? 'guide' : 'download';
      if (location.hash !== url.hash) history.pushState(null, '', url);
      selectTab(index);
    });
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = 1 - index;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = 1;
      else return;
      event.preventDefault();
      tabs[next].click();
      tabs[next].focus();
    });
  });
  window.addEventListener('popstate', fromHash);
  window.addEventListener('hashchange', fromHash);
  fromHash();
  tablist.hidden = false;
})();
