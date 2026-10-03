import "../css/base.css";
import "../css/header.css";
import "../css/hero.css";
import "../css/marquee.css";
import "../css/work.css";
import "../css/services.css";
import "../css/about.css";
import "../css/process.css";
import "../css/contact.css";
import "../css/footer.css";

(() => {
  "use strict";

  /** Handle the compact mobile navigation. */
  function initNavigation() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector("#site-nav");
    if (!toggle || !nav) return;

    const close = () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
    };

    toggle.addEventListener("click", () => {
      const open = !nav.classList.contains("open");
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });

    nav.addEventListener("click", event => {
      if (event.target.closest("a")) close();
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        close();
        toggle.focus();
      }
    });
  }

  /** Reveal marked elements as they enter the viewport. */
  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      items.forEach(item => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1 });

    items.forEach(item => observer.observe(item));
  }

  /** Show reading progress at the top of the page. */
  function initProgress() {
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    };

    addEventListener("scroll", update, { passive: true });
    update();
  }

  /** Persist the user's light/dark preference. */
  function initTheme() {
    const button = document.querySelector(".theme-toggle");
    if (!button) return;

    const saved = localStorage.getItem("aurevio-theme");
    const light = saved ? saved === "light" : matchMedia("(prefers-color-scheme: light)").matches;
    document.body.classList.toggle("light-mode", light);
    syncThemeButton(button, light);

    button.addEventListener("click", () => {
      const next = !document.body.classList.contains("light-mode");
      document.body.classList.toggle("light-mode", next);
      localStorage.setItem("aurevio-theme", next ? "light" : "dark");
      syncThemeButton(button, next);
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
    initTheme();
  }

  try {
    init();
  } catch (error) {
    console.error("Aurevio initialization error:", error);
  }
})();