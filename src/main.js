import "../css/main.css";

(() => {
  "use strict";

  function initNavigation() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector("#site-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });

    nav.addEventListener("click", event => {
      if (!event.target.closest("a")) return;
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
    });
  }

  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(item => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    items.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 70, 350)}ms`;
      observer.observe(item);
    });
  }

  function initProgress() {
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    let ticking = false;
    const update = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
        ticking = false;
      });
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initParallax() {
    const targets = document.querySelectorAll("[data-parallax]");
    if (!targets.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    const update = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        targets.forEach(target => {
          const speed = Number(target.dataset.parallax) || 0.15;
          target.style.transform = `translate3d(0,${window.scrollY * speed}px,0)`;
        });
        ticking = false;
      });
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initTilt() {
    const items = document.querySelectorAll("[data-tilt]");
    if (!items.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer:fine)").matches) return;

    items.forEach(item => {
      item.addEventListener("pointermove", event => {
        const rect = item.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        const max = item.classList.contains("hero-stage") ? 2.5 : 1.4;
        item.style.transform = `perspective(1100px) rotateX(${-y * max}deg) rotateY(${x * max}deg) translateY(-3px)`;
      });

      item.addEventListener("pointerleave", () => {
        item.style.transform = "";
      });
    });
  }

  function initTheme() {
    const button = document.querySelector(".theme-toggle");
    if (!button) return;

    const saved = localStorage.getItem("aurevio-theme");
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const light = saved ? saved === "light" : prefersLight;

    document.body.classList.toggle("light-mode", light);
    syncThemeButton(button, light);

    button.addEventListener("click", () => {
      const nextLight = !document.body.classList.contains("light-mode");
      document.body.classList.toggle("light-mode", nextLight);
      localStorage.setItem("aurevio-theme", nextLight ? "light" : "dark");
      syncThemeButton(button, nextLight);
    });
  }

  function syncThemeButton(button, light) {
    button.textContent = light ? "DARK" : "LIGHT";
    button.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
    button.setAttribute("aria-pressed", String(light));
  }

  function init() {
    document.documentElement.classList.add("js");
    initNavigation();
    initReveal();
    initProgress();
    initParallax();
    initTilt();
    initTheme();
  }

  try {
    init();
  } catch (error) {
    console.error("Aurevio initialization error:", error);
  }
})();
