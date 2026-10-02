(() => {
  "use strict";

  const sections = [
    ["site-header", "sections/header.html"],
    ["hero-section", "sections/hero.html"],
    ["marquee-section", "sections/marquee.html"],
    ["work-section", "sections/work.html"],
    ["services-section", "sections/services.html"],
    ["about-section", "sections/about.html"],
    ["process-section", "sections/process.html"],
    ["contact-section", "sections/contact.html"],
    ["site-footer", "sections/footer.html"]
  ];

  async function loadSections() {
    await Promise.all(sections.map(async ([id, file]) => {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`Failed to load ${file}: ${response.status}`);
      document.getElementById(id).innerHTML = await response.text();
    }));
  }

  function initNavigation() {
    const navToggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector("#site-nav");

    navToggle?.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });

    nav?.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        navToggle?.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initReveal() {
    const revealItems = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      revealItems.forEach(item => observer.observe(item));
    } else {
      revealItems.forEach(item => item.classList.add("is-visible"));
    }
  }

  loadSections()
    .then(() => {
      initNavigation();
      initReveal();
    })
    .catch(error => {
      console.error("Aurevio section loader error:", error);
    });
})();