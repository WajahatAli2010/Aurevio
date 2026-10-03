import "../css/main.css";

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initNavigation() {
    const toggle = $(".nav-toggle");
    const nav = $("#site-nav");
    const header = $(".site-header");
    if (!toggle || !nav || !header) return;

    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      header.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });

    nav.addEventListener("click", event => {
      if (!event.target.closest("a")) return;
      nav.classList.remove("open");
      header.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
    });
  }

  function initReveal() {
    const items = $$(".reveal:not(.hero-reveal)");
    if (!items.length) return;

    if (reduced() || !("IntersectionObserver" in window)) {
      items.forEach(item => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, current) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const siblings = entry.target.parentElement ? [...entry.target.parentElement.querySelectorAll(":scope > .reveal")] : [];
        const index = Math.max(0, siblings.indexOf(entry.target));
        entry.target.style.transitionDelay = Math.min(index * 65, 320) + "ms";
        entry.target.classList.add("is-visible");
        current.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

    items.forEach(item => observer.observe(item));
  }

  function initScrollProgress() {
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);

    let ticking = false;
    const update = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = "scaleX(" + (max > 0 ? scrollY / max : 0) + ")";
        ticking = false;
      });
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update, { passive: true });
    update();
  }

  function initProjectParallax() {
    if (reduced() || !window.matchMedia("(pointer:fine)").matches) return;

    $$(".project-image").forEach(image => {
      const img = $("img", image);
      if (!img) return;

      const move = () => {
        const rect = image.getBoundingClientRect();
        const center = innerHeight / 2;
        const delta = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - center) / innerHeight));
        img.style.transform = "scale(1.075) translateY(" + (delta * -10) + "px)";
      };

      addEventListener("scroll", move, { passive: true });
      move();
    });
  }

  function initHeroArt() {
    if (reduced() || !window.matchMedia("(pointer:fine)").matches) return;
    const art = $(".hero-art");
    if (!art) return;

    art.addEventListener("pointermove", event => {
      const rect = art.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      art.style.transform = "rotate(" + (x * 1.8).toFixed(2) + "deg) translateY(" + (-y * 5).toFixed(1) + "px)";
    });

    art.addEventListener("pointerleave", () => {
      art.style.transform = "rotate(1.4deg)";
    });
  }

  function init() {
    document.documentElement.classList.add("js");
    initNavigation();
    initReveal();
    initScrollProgress();
    initProjectParallax();
    initHeroArt();
  }

  try { init(); } catch (error) { console.error("Aurevio initialization error:", error); }
})();
