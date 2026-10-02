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
      if (!response.ok) throw new Error("Failed to load " + file);
      document.getElementById(id).innerHTML = await response.text();
    }));
  }

  function initNavigation() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector("#site-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation");
      }
    });
  }

  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length || !("IntersectionObserver" in window)) {
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

  loadSections()
    .then(() => {
      document.documentElement.classList.add("js");
      initNavigation();
      initReveal();
    })
    .catch(error => console.error("Aurevio loader:", error));
})();