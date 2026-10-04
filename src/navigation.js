import { $, $$, getMotionState } from "./dom.js";

export function initNavigation() {
  const header = $(".site-header");
  const toggle = $(".nav-toggle");
  const nav = $("#site-nav");
  if (!header || !toggle || !nav) return;

  const closeMenu = () => {
    nav.classList.remove("open");
    header.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
  };

  toggle.addEventListener("click", () => {
    const open = !nav.classList.contains("open");
    nav.classList.toggle("open", open);
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });

  nav.addEventListener("click", event => {
    if (event.target.closest("a")) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

export function initHeaderState() {
  const header = $(".site-header");
  if (!header) return;
  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 18);
  window.addEventListener("scroll", update, { passive: true });
  update();
}

export function initSectionNavigation() {
  const links = $$("#site-nav a");
  const targets = links.map(link => link.getAttribute("href"))
    .map(href => href ? document.querySelector(href) : null)
    .filter(Boolean);
  if (!links.length || !targets.length || !("IntersectionObserver" in window)) return;

  const clear = () => {
    links.forEach(link => {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });
  };

  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    clear();
    const active = links.find(link => link.getAttribute("href") === "#" + visible.target.id);
    if (active) {
      active.classList.add("is-active");
      active.setAttribute("aria-current", "page");
    }
  }, { rootMargin: "-38% 0px -52% 0px", threshold: [0, 0.12, 0.3] });

  targets.forEach(target => observer.observe(target));
}

export function initAnchors() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const id = link.getAttribute("href");
      const target = $(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({
        behavior: getMotionState().reduced ? "auto" : "smooth",
        block: "start"
      });
      history.replaceState(null, "", id);
    });
  });
}
