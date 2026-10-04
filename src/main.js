import "../css/main.css";

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const getMotionState = () => ({
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    finePointer: window.matchMedia("(pointer: fine)").matches
  });

  function initNavigation() {
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

  function initHeaderState() {
    const header = $(".site-header");
    if (!header) return;

    const update = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 18);
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initReveal() {
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
        const siblings = parent
          ? [...parent.querySelectorAll(":scope > .reveal")]
          : [];
        const index = Math.max(0, siblings.indexOf(entry.target));

        entry.target.style.transitionDelay =
          Math.min(index * 80, 360) + "ms";

        entry.target.classList.add("is-visible");
        current.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    });

    items.forEach(item => observer.observe(item));
  }

  function initScrollProgress() {
    const bar = $(".scroll-line");
    if (!bar) return;

    let frame = 0;

    const update = () => {
      if (frame) return;

      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0
          ? Math.min(1, Math.max(0, window.scrollY / max))
          : 0;

        bar.style.transform = "scaleX(" + progress + ")";
        frame = 0;
      });
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  function initSectionNavigation() {
    const links = $$("#site-nav a");
    const targets = links
      .map(link => link.getAttribute("href"))
      .map(href => href ? document.querySelector(href) : null)
      .filter(Boolean);

    if (!links.length || !targets.length || !("IntersectionObserver" in window)) {
      return;
    }

    const clear = () => {
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

      clear();

      const active = links.find(
        link => link.getAttribute("href") === "#" + visible.target.id
      );

      if (active) {
        active.classList.add("is-active");
        active.setAttribute("aria-current", "page");
      }
    }, {
      rootMargin: "-38% 0px -52% 0px",
      threshold: [0, 0.12, 0.3]
    });

    targets.forEach(target => observer.observe(target));
  }

  function initProjectMotion() {
    const projects = $$(".project-card");
    const { reduced, finePointer } = getMotionState();

    if (!projects.length || reduced || !finePointer) return;

    projects.forEach(project => {
      const image = $(".project-image", project);
      if (!image) return;

      let frame = 0;
      let currentShift = 0;
      let targetShift = 0;

      const render = () => {
        frame = 0;

        const rect = image.getBoundingClientRect();
        const centerDelta =
          (rect.top + rect.height / 2 - window.innerHeight / 2) /
          window.innerHeight;

        targetShift = Math.max(-10, Math.min(10, centerDelta * -11));
        currentShift += (targetShift - currentShift) * 0.1;

        image.style.setProperty(
          "--project-shift",
          currentShift.toFixed(2) + "px"
        );
      };

      const requestRender = () => {
        if (!frame) frame = requestAnimationFrame(render);
      };

      window.addEventListener("scroll", requestRender, { passive: true });
      window.addEventListener("resize", requestRender, { passive: true });

      requestRender();
    });
  }

  function initHeroObject() {
    const object = $(".hero-object");
    const { reduced, finePointer } = getMotionState();

    if (!object || reduced || !finePointer) return;

    let frame = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const render = () => {
      frame = 0;

      currentX += (targetX - currentX) * 0.11;
      currentY += (targetY - currentY) * 0.11;

      object.style.transform =
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

    object.addEventListener("pointermove", event => {
      const rect = object.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      targetX = x * 7;
      targetY = y * -7;
      requestRender();
    });

    object.addEventListener("pointerleave", () => {
      targetX = 0;
      targetY = 0;
      requestRender();
    });
  }

  function initAnchors() {
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

  function initInquiryForm() {
    const form = $("#inquiry-form");
    const status = $("#inquiry-status");
    if (!form || !status) return;
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const data = new FormData(form);
      const brief = [
        "AUREVIO PROJECT INQUIRY","",
        "Name: " + data.get("name"),
        "Business / project: " + data.get("business"),
        "Contact: " + data.get("contact"),
        "Service: " + data.get("service"),"",
        "Brief:",data.get("brief")
      ].join("\n");
      try {
        await navigator.clipboard.writeText(brief);
        status.textContent = "Inquiry copied. Paste it into the Aurevio Instagram DM to send it.";
      } catch {
        status.textContent = "Inquiry prepared. Copy the details and send them through the Aurevio Instagram DM.";
      }
      window.open("https://instagram.com/mrpapypants", "_blank", "noopener,noreferrer");
    });
  }

  function init() {
    document.documentElement.classList.add("js");
    initNavigation();
    initHeaderState();
    initReveal();
    initScrollProgress();
    initSectionNavigation();
    initProjectMotion();
    initHeroObject();
    initAnchors();
    initInquiryForm();
  }

  try {
    init();
  } catch (error) {
    console.error("Aurevio initialization error:", error);
  }
})();
