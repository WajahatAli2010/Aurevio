import "../css/main.css";

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const motionState = () => ({
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    finePointer: window.matchMedia("(pointer: fine)").matches
  });

  function initNavigation() {
    const toggle = $(".nav-toggle");
    const nav = $("#site-nav");
    const header = $(".site-header");

    if (!toggle || !nav || !header) return;

    const closeMenu = () => {
      nav.classList.remove("open");
      header.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
    };

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      header.classList.toggle("menu-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    nav.addEventListener("click", event => {
      if (event.target.closest("a")) closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  function initHeader() {
    const header = $(".site-header");
    if (!header) return;

    const update = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 18);
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initReveals() {
    const items = $$(".reveal");
    if (!items.length) return;

    const { reduced } = motionState();

    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(item => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, current) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const parent = entry.target.parentElement;
        const siblings = parent
          ? [...parent.querySelectorAll(":scope > .reveal")]
          : [];
        const index = Math.max(0, siblings.indexOf(entry.target));

        entry.target.style.transitionDelay = Math.min(index * 80, 360) + "ms";
        entry.target.classList.add("is-visible");
        current.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    });

    items.forEach(item => observer.observe(item));
  }

  function initSectionNav() {
    const links = $$("#site-nav a");
    const ids = links
      .map(link => link.getAttribute("href"))
      .filter(Boolean)
      .map(href => href.slice(1))
      .filter(id => id !== "top");

    const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return;

    const clearActive = () => {
      links.forEach(link => {
        link.classList.remove("is-active");
        link.removeAttribute("aria-current");
      });
    };

    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      clearActive();
      const active = links.find(link =>
        link.getAttribute("href") === "#" + visible.target.id
      );

      if (active) {
        active.classList.add("is-active");
        active.setAttribute("aria-current", "page");
      }
    }, {
      rootMargin: "-35% 0px -55% 0px",
      threshold: [0, 0.12, 0.35]
    });

    sections.forEach(section => observer.observe(section));
  }

  function initScrollProgress() {
    const bar = $(".scroll-progress");
    if (!bar) return;

    let frame = 0;

    const update = () => {
      if (frame) return;

      frame = requestAnimationFrame(() => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const progress = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
        bar.style.transform = "scaleX(" + progress + ")";
        frame = 0;
      });
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  function initHeroMotion() {
    const art = $(".hero-art");
    const { reduced, finePointer } = motionState();

    if (!art || reduced || !finePointer) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const render = () => {
      frame = 0;
      currentX += (targetX - currentX) * 0.11;
      currentY += (targetY - currentY) * 0.11;

      art.style.transform =
        "translate3d(" +
        currentX.toFixed(2) +
        "px," +
        currentY.toFixed(2) +
        "px,0)";

      if (
        Math.abs(targetX - currentX) > 0.02 ||
        Math.abs(targetY - currentY) > 0.02
      ) {
        frame = requestAnimationFrame(render);
      }
    };

    const requestRender = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    art.addEventListener("pointermove", event => {
      const rect = art.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      targetX = x * 7;
      targetY = y * -7;
      requestRender();
    });

    art.addEventListener("pointerleave", () => {
      targetX = 0;
      targetY = 0;
      requestRender();
    });
  }

  function initProjectMotion() {
    const projects = $$(".project");
    const { reduced, finePointer } = motionState();

    if (!projects.length || reduced || !finePointer) return;

    projects.forEach(project => {
      const image = $(".project-image", project);
      if (!image) return;

      let frame = 0;
      let targetShift = 0;
      let currentShift = 0;
      let hovered = false;

      const render = () => {
        frame = 0;
        const rect = image.getBoundingClientRect();
        const centerOffset =
          (rect.top + rect.height / 2 - window.innerHeight / 2) /
          window.innerHeight;

        targetShift = Math.max(-10, Math.min(10, centerOffset * -12));
        currentShift += (targetShift - currentShift) * 0.1;
        image.style.setProperty("--project-shift", currentShift.toFixed(2) + "px");

        if (hovered) {
          project.classList.add("hovered");
        } else {
          project.classList.remove("hovered");
        }
      };

      const requestRender = () => {
        if (!frame) frame = requestAnimationFrame(render);
      };

      project.addEventListener("pointerenter", () => {
        hovered = true;
        requestRender();
      });

      project.addEventListener("pointerleave", () => {
        hovered = false;
        requestRender();
      });

      window.addEventListener("scroll", requestRender, { passive: true });
      window.addEventListener("resize", requestRender, { passive: true });
      requestRender();
    });
  }

  function initAnchors() {
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener("click", event => {
        const targetId = link.getAttribute("href");
        const target = $(targetId);

        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({
          behavior: motionState().reduced ? "auto" : "smooth",
          block: "start"
        });
      });
    });
  }

  function init() {
    document.documentElement.classList.add("js");
    initNavigation();
    initHeader();
    initReveals();
    initSectionNav();
    initScrollProgress();
    initHeroMotion();
    initProjectMotion();
    initAnchors();
  }

  try {
    init();
  } catch (error) {
    console.error("Aurevio initialization error:", error);
  }
})();
