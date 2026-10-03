import "../css/main.css";

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = () =>
    window.matchMedia("(pointer:fine)").matches;

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
      document.body.classList.remove("menu-active");
    };

    toggle.addEventListener("click", () => {
      const open = !nav.classList.contains("open");

      if (open) {
        nav.classList.add("open");
        header.classList.add("menu-open");
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Close navigation");
        document.body.classList.add("menu-active");
      } else {
        closeMenu();
      }
    });

    nav.addEventListener("click", event => {
      if (event.target.closest("a")) closeMenu();
    });

    addEventListener("resize", () => {
      if (innerWidth > 900) closeMenu();
    });
  }

  function initHeaderState() {
    const header = $(".site-header");
    if (!header) return;

    const update = () => {
      header.classList.toggle("is-scrolled", scrollY > 20);
    };

    addEventListener("scroll", update, { passive: true });
    update();
  }

  function initReveal() {
    const items = $$(".reveal:not(.hero-reveal)");
    if (!items.length) return;

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
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

        entry.target.style.transitionDelay =
          Math.min(index * 75, 360) + "ms";

        entry.target.classList.add("is-visible");
        current.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -7% 0px"
    });

    items.forEach(item => observer.observe(item));
  }

  function initSectionNav() {
    const links = $$("#site-nav a");
    const sections = links
      .map(link => $(link.getAttribute("href")))
      .filter(Boolean);

    if (!links.length || !sections.length || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        links.forEach(link => {
          link.removeAttribute("aria-current");
          link.classList.remove("is-active");
        });

        const active = links.find(
          link => link.getAttribute("href") === "#" + entry.target.id
        );

        if (active) {
          active.setAttribute("aria-current", "page");
          active.classList.add("is-active");
        }
      });
    }, {
      rootMargin: "-35% 0px -55% 0px",
      threshold: 0
    });

    sections.forEach(section => observer.observe(section));
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
        const progress = max > 0 ? scrollY / max : 0;
        bar.style.transform = "scaleX(" + progress + ")";
        ticking = false;
      });
    };

    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update, { passive: true });
    update();
  }

  function initProjectMotion() {
    const projects = $$(".project");
    if (!projects.length) return;

    projects.forEach(project => {
      const image = $(".project-image", project);
      const img = $("img", project);

      if (!image || !img) return;

      let hovered = false;
      let frame = 0;
      let latestY = 0;

      const render = () => {
        frame = 0;

        const rect = image.getBoundingClientRect();
        const center = innerHeight / 2;
        const delta = Math.max(
          -1,
          Math.min(1, (rect.top + rect.height / 2 - center) / innerHeight)
        );

        latestY = delta * -9;
        const scale = hovered ? 1.095 : 1.055;

        img.style.transform =
          "translate3d(0," + latestY.toFixed(2) + "px,0) scale(" +
          scale +
          ")";
      };

      const requestRender = () => {
        if (frame) return;
        frame = requestAnimationFrame(render);
      };

      if (!prefersReducedMotion() && finePointer()) {
        addEventListener("scroll", requestRender, { passive: true });
        addEventListener("resize", requestRender, { passive: true });

        project.addEventListener("pointerenter", () => {
          hovered = true;
          requestRender();
        });

        project.addEventListener("pointerleave", () => {
          hovered = false;
          requestRender();
        });

        requestRender();
      }
    });
  }

  function initHeroInteraction() {
    const art = $(".hero-stage");
    if (!art || prefersReducedMotion() || !finePointer()) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const render = () => {
      frame = 0;
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      art.style.transform =
        "rotate(" +
        currentX.toFixed(2) +
        "deg) translate3d(0," +
        currentY.toFixed(1) +
        "px,0)";

      if (
        Math.abs(targetX - currentX) > 0.01 ||
        Math.abs(targetY - currentY) > 0.05
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

      targetX = x * 1.6;
      targetY = -y * 5;
      requestRender();
    });

    art.addEventListener("pointerleave", () => {
      targetX = 1.4;
      targetY = 0;
      requestRender();
    });
  }

  function initSmoothAnchors() {
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener("click", event => {
        const id = link.getAttribute("href");
        const target = $(id);

        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start"
        });

        history.replaceState(null, "", id);
      });
    });
  }

  function init() {
    document.documentElement.classList.add("js");

    initNavigation();
    initHeaderState();
    initReveal();
    initSectionNav();
    initScrollProgress();
    initProjectMotion();
    initHeroInteraction();
    initSmoothAnchors();
  }

  try {
    init();
  } catch (error) {
    console.error("Aurevio initialization error:", error);
  }
})();
