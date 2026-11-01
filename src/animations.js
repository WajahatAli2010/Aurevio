const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const entranceEase = 'cubic-bezier(.16,1,.3,1)';
const running = new Set();

// Animate from a visible resting state. No hidden/pending classes or fill-forwards:
// a missed observer, cancelled animation or failed script cannot strand content.
function play(element, frames, options = {}) {
  if (reduced.matches || !element?.animate || element.contains(document.activeElement)) return;
  // Hold the first visible frame during a stagger instead of flashing at full
  // opacity and fading back down when the delay ends. Cancellation restores CSS.
  const animation = element.animate(frames, { duration: 560, easing: entranceEase, fill: 'backwards', ...options });
  running.add(animation);
  animation.finished.catch(() => {}).finally(() => {
    running.delete(animation);
    animation.cancel();
  });
  return animation;
}
reduced.addEventListener('change', () => {
  if (reduced.matches) running.forEach(animation => animation.cancel());
});

export function initReveal() {
  const groups = '.fact-row, .skill-column > div';
  const items = $$('.reveal, ' + groups).filter(item => !item.matches('.fact-column, .skill-column'));
  if (!('IntersectionObserver' in window)) return;
  const entrances = new Map();
  const observer = new IntersectionObserver(entries => {
    for (const { target, isIntersecting, boundingClientRect: rect } of entries) {
      if (!isIntersecting) {
        // A fast scroll can leave before the entrance finishes. Settle offscreen
        // and never replay an entrance when the visitor scrolls back.
        if (entrances.has(target)) {
          entrances.get(target).cancel();
          entrances.delete(target);
          observer.unobserve(target);
        }
        continue;
      }
      if (entrances.has(target)) continue;
      target.classList.add('is-visible');
      // Start just ahead of the viewport. If a jump or a delayed observer has
      // already put content on screen, leave it readable instead of fading back.
      if (reduced.matches || rect.top < innerHeight - 24) {
        observer.unobserve(target);
        continue;
      }
      const row = target.matches('.service-item, .why-item, .fact-row, .skill-column > div');
      const quiet = target.matches('.faq-item, .section-number, .eyebrow');
      const surface = target.matches('.project-card, .package, .inquiry-panel');
      // Large panels stay in place; avoid nested project opacity/scale effects.
      const frames = surface ? [{ opacity: .8 }, { opacity: 1 }] : [
        { opacity: quiet ? .8 : .65, transform: row ? 'translateX(-6px)' : `translateY(${quiet ? 4 : 10}px)` },
        { opacity: 1, transform: 'none' }
      ];
      const animation = play(target, frames, { duration: quiet ? 320 : 420 });
      if (animation) {
        entrances.set(target, animation);
        animation.finished.catch(() => {}).finally(() => {
          entrances.delete(target);
          observer.unobserve(target);
        });
      } else observer.unobserve(target);
    }
  }, { threshold: 0, rootMargin: '0px 0px 160px 0px' });
  items.forEach(item => observer.observe(item));
  // Focusing an interactive descendant must never wait for its entrance.
  document.addEventListener('focusin', event => {
    running.forEach(animation => {
      const element = animation.effect?.target;
      if (element?.contains(event.target)) animation.cancel();
    });
  });
}

// Progress updates are coalesced into a frame; image motion is hover/focus only.
const scrollTasks = new Set();
let frame = 0;
function requestScrollFrame() {
  if (frame || document.hidden) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    scrollTasks.forEach(task => task());
  });
}
function onScrollFrame(task) {
  if (!scrollTasks.size) {
    window.addEventListener('scroll', requestScrollFrame, { passive: true });
    window.addEventListener('resize', requestScrollFrame, { passive: true });
    document.addEventListener('visibilitychange', requestScrollFrame);
  }
  scrollTasks.add(task);
  requestScrollFrame();
}
export function initScrollProgress() {
  const bar = $('.scroll-line');
  if (!bar) return;
  onScrollFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = `scaleX(${progress})`;
  });
}
export function initAccordions() {
  const finishers = new Set();
  $$('.faq-item').forEach(details => {
    const summary = $('summary', details);
    let animation, desired = details.open;
    const settle = () => {
      animation?.cancel();
      animation = null;
      details.open = desired;
      details.style.removeProperty('height');
      details.style.removeProperty('overflow');
      delete details.dataset.closing;
      finishers.delete(settle);
    };
    summary.addEventListener('click', event => {
      if (reduced.matches || !details.animate) return; // Native keyboard/touch behavior.
      event.preventDefault();
      const start = details.getBoundingClientRect().height;
      desired = animation ? !desired : !details.open;
      animation?.cancel();
      details.style.removeProperty('height');
      details.open = true;
      const style = getComputedStyle(details);
      const end = desired ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      details.dataset.closing = String(!desired);
      details.style.overflow = 'hidden';
      animation = details.animate([{ height: `${start}px` }, { height: `${end}px` }], {
        duration: 240, easing: 'cubic-bezier(.22,.75,.2,1)'
      });
      animation.onfinish = settle;
      finishers.add(settle);
    });
  });
  const finishAll = () => [...finishers].forEach(finish => finish());
  reduced.addEventListener('change', () => { if (reduced.matches) finishAll(); });
  window.addEventListener('resize', finishAll, { passive: true });
}

export function initFormFeedback() {
  const form = $('#inquiry-form');
  const status = $('#inquiry-status');
  if (!form || !status) return;
  const fields = $$('input, select, textarea', form);
  const update = (field, animate = false) => {
    const valid = field.validity.valid;
    const next = valid ? 'valid' : 'invalid';
    const changed = field.dataset.fieldState !== next;
    field.dataset.fieldState = next;
    field.setAttribute('aria-invalid', String(!valid));
    if (animate && changed) play(field, valid ? [
      { opacity: .75 }, { opacity: 1 }
    ] : [
      { transform: 'translateX(0)' }, { transform: 'translateX(-2px)' },
      { transform: 'translateX(2px)' }, { transform: 'translateX(0)' }
    ], { duration: 200, easing: 'ease-out' });
  };
  fields.forEach(field => {
    field.addEventListener('blur', () => update(field, true));
    field.addEventListener('invalid', () => update(field, true));
    field.addEventListener('input', () => { if (field.dataset.fieldState) update(field); });
    field.addEventListener('change', () => update(field, true));
  });
  new MutationObserver(() => {
    if (status.textContent.trim()) play(status, [
      { opacity: .3, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }
    ], { duration: 200 });
  }).observe(status, { childList: true, characterData: true, subtree: true });
}
