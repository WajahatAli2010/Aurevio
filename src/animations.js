const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const getMotionState = () => ({
  reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  finePointer: window.matchMedia("(pointer: fine)").matches
});

export function initReveal() {
  const items = $$(".reveal");
  if (!items.length) return;
  const { reduced } = getMotionState();
  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach(item => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, current) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const parent = entry.target.parentElement;
      const siblings = parent ? [...parent.querySelectorAll(":scope > .reveal")] : [];
      const index = Math.max(0, siblings.indexOf(entry.target));
      entry.target.style.transitionDelay = Math.min(index * 80, 360) + "ms";
      entry.target.classList.add("is-visible");
      current.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  items.forEach(item => observer.observe(item));
}

export function initScrollProgress() {
  const bar = $(".scroll-line");
  if (!bar) return;
  let frame = 0;
  const update = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = "scaleX(" + progress + ")";
      frame = 0;
    });
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
}

export function initProjectMotion() {
  const projects = $$(".project-card");
  const { reduced, finePointer } = getMotionState();
  if (!projects.length || reduced || !finePointer) return;
  projects.forEach(project => {
    const image = $(".project-image", project);
    if (!image) return;
    let frame = 0, currentShift = 0, targetShift = 0;
    const render = () => {
      frame = 0;
      const rect = image.getBoundingClientRect();
      const centerDelta = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      targetShift = Math.max(-10, Math.min(10, centerDelta * -11));
      currentShift += (targetShift - currentShift) * 0.1;
      image.style.setProperty("--project-shift", currentShift.toFixed(2) + "px");
    };
    const requestRender = () => { if (!frame) frame = requestAnimationFrame(render); };
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender, { passive: true });
    requestRender();
  });
}
