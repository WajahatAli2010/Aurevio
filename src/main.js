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
import "../css/v2.css";

(() => {
  "use strict";

  /** Add accessible mobile navigation behavior. */
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

    document.addEventListener("keydown", event => {
      if (event.key !== "Escape" || !nav.classList.contains("open")) return;
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
      toggle.focus();
    });
  }

  /** Reveal content as it enters the viewport, with a reduced-motion fallback. */
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
    }, { threshold: 0.12 });

    items.forEach(item => observer.observe(item));
  }

  /** Show reading progress at the top of the viewport. */
  /** Highlight the navigation item for the section currently in view. */
  function initActiveNavigation() {
    const links = [...document.querySelectorAll(".site-nav a")];
    const sections = links.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    if (!links.length || !sections.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id));
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });

    sections.forEach(section => observer.observe(section));
  }

  function initProgress() {
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /** Persist the user's light/dark preference locally. */
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
    initActiveNavigation();
    initTheme();
  }

  try {
    init();
  } catch (error) {
    console.error("Aurevio initialization error:", error);
  }
})();