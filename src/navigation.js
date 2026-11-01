const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export function initNavigation() {
  const header = $('.site-header');
  const toggle = $('.nav-toggle');
  const nav = $('#site-nav');
  if (!header || !toggle || !nav) return;
  const mobile = window.matchMedia('(max-width: 1100px)');
  const setOpen = open => {
    nav.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.inert = mobile.matches && !open;
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setOpen(false);
  });
  mobile.addEventListener('change', () => {
    if (mobile.matches && nav.contains(document.activeElement)) toggle.focus();
    setOpen(false);
  });
  setOpen(false);
}

export function initHeaderState() {
  const header = $('.site-header');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 18);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

export function initSectionNavigation() {
  const links = $$('#site-nav a');
  const targets = links.map(link => $(link.getAttribute('href'))).filter(Boolean);
  if (!targets.length) return;
  let frame = 0;
  const update = () => {
    frame = 0;
    const boundary = ($('.site-header')?.getBoundingClientRect().bottom || 76) + 48;
    let active = null;
    for (const section of targets) {
      if (section.getBoundingClientRect().top <= boundary) active = section.id;
    }
    for (const link of links) {
      const selected = link.getAttribute('href') === '#' + active;
      link.classList.toggle('is-active', selected);
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };
  const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  window.addEventListener('load', requestUpdate);
  document.fonts?.ready.then(requestUpdate);
  update();
}

export function initAnchors() {
  $$('a[href^="#"]').forEach(link => {
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const target = $(id);
    if (!target) return;
    link.addEventListener('click', event => {
      event.preventDefault();
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      // Move keyboard focus with the visual destination, including the skip link.
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      history.replaceState(null, '', id);
    });
  });
}
