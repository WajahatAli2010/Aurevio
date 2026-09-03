(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var siteNav = document.getElementById("site-nav");
  var navOverlay = document.querySelector(".nav-overlay");

  function openNav() {
    document.documentElement.classList.add("nav-open");
    document.body.classList.add("nav-open"); 

    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Close menu");
    }

    if (navOverlay) {
      navOverlay.hidden = false;
    }
  }

  function closeNav() {
    document.documentElement.classList.remove("nav-open");
    document.body.classList.remove("nav-open");

    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    }

    if (navOverlay) {
      navOverlay.hidden = true;
    }
  }

  // Mobile navigation
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      if (document.body.classList.contains("nav-open")) {
        closeNav();
      } else {
        openNav();
      }
    });
  }

  var desktopNav = window.matchMedia("(min-width:821px)");

  if (desktopNav) {
    if (typeof desktopNav.addEventListener === "function") {
      desktopNav.addEventListener("change", function (event) {
        if (event.matches) {
          closeNav();
        }
      });
    } else if (typeof desktopNav.addListener === "function") {
      desktopNav.addListener(function (m) {
        if (m.matches) {
          closeNav();
        }
      });
    }
  }

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // FAQ
  var faqTriggers = document.querySelectorAll(".faq-trigger") || [];

  faqTriggers.forEach(function (button) {
    button.addEventListener("click", function () {
      var expanded =
        button.getAttribute("aria-expanded") === "true";

      var panelId = button.getAttribute("aria-controls");
      var panel = panelId
        ? document.getElementById(panelId)
        : null;

      // Close all FAQ items
      faqTriggers.forEach(function (other) {
        var otherPanel = document.getElementById(
          other.getAttribute("aria-controls")
        );

        other.setAttribute("aria-expanded", "false");

        if (otherPanel) {
          otherPanel.hidden = true;
        }
      });

      // Open clicked item if it was closed
      if (!expanded && panel) {
        button.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }
    });
  });

  // Reveal on scroll
  var steps = document.querySelectorAll(".reveal") || [];

  if (reduceMotion) {
    steps.forEach(function (step) {
      step.classList.add("is-visible");
    });
  } else if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    steps.forEach(function (step) {
      observer.observe(step);
    });
  } else {
    steps.forEach(function (step) {
      step.classList.add("is-visible");
    });
  }

  // Instagram image fallback
  var igImg = document.getElementById("ig-profile-img");

  if (igImg) {
    igImg.addEventListener("error", function () {
      igImg.classList.add("is-hidden");
    });

    if (igImg.complete && igImg.naturalWidth === 0) {
      igImg.classList.add("is-hidden");
    }
  }

  // Project data
  var projects = {
    restaurant: {
      label: "Concept Project",
      title: "Restaurant Website",
      text:
        "A frontend concept for a restaurant site: a strong opening section, a menu preview, a photo gallery, location details and a simple contact area. This is a demonstration of layout and design — not a live client website.",
      previewClass: "preview preview-restaurant",
      previewHTML:
        '<div class="pr-hero">' +
        '<span class="pr-kicker">Kitchen</span>' +
        '<span class="pr-title">Evening menu</span>' +
        "</div>" +
        '<div class="pr-row">' +
        "<span></span><span></span><span></span>" +
        "</div>" +
        '<div class="pr-gallery">' +
        "<span></span><span></span>" +
        "</div>"
    },

    fashion: {
      label: "Concept Project",
      title: "Clothing Store Website",
      text:
        "A fashion storefront concept that presents collections and brand sections with a clear contact path. It is a static visual website — there is no shopping cart, checkout or payment flow.",
      previewClass: "preview preview-fashion",
      previewHTML:
        '<div class="pf-hero">' +
        '<span class="pf-title">New collection</span>' +
        '<span class="pf-sub">Lookbook</span>' +
        "</div>" +
        '<div class="pf-items">' +
        "<span></span><span></span><span></span>" +
        "</div>"
    },

    portfolio: {
      label: "Demo Project",
      title: "Personal Portfolio",
      text:
        "A static personal portfolio demo with an introduction, skills, selected projects and contact information. Built to show a clean, responsive frontend structure.",
      previewClass: "preview preview-portfolio",
      previewHTML:
        '<div class="pp-intro">' +
        '<span class="pp-avatar"></span>' +
        '<span class="pp-lines"><i></i><i></i></span>' +
        "</div>" +
        '<div class="pp-skills">' +
        "<span></span><span></span><span></span>" +
        "</div>" +
        '<div class="pp-projects">' +
        "<span></span><span></span>" +
        "</div>"
    }
  };

  // Modal elements
  var modal = document.getElementById("project-modal");

  var modalDialog = modal
    ? modal.querySelector(".project-modal-dialog")
    : null;

  var modalTitle = document.getElementById("project-modal-title");
  var modalLabel = document.getElementById("project-modal-label");
  var modalText = document.getElementById("project-modal-text");
  var modalPreview = document.getElementById("project-modal-preview");

  var lastFocus = null;

  // Open project modal
  function openModal(key) {
    var data = projects[key];

    if (!data || !modal) return;

    lastFocus = document.activeElement;

    if (modalLabel) {
      modalLabel.textContent = data.label;
    }

    if (modalTitle) {
      modalTitle.textContent = data.title;
    }

    if (modalText) {
      modalText.textContent = data.text;
    }

    if (modalPreview) {
      modalPreview.innerHTML =
        '<div class="' +
        data.previewClass +
        '">' +
        data.previewHTML +
        "</div>";
    }

    modal.hidden = false;
    modal.removeAttribute("hidden");

    modal.style.display = "grid";
    modal.style.zIndex = "9999";

    document.body.classList.add("modal-open");

    if (modalDialog) {
      modalDialog.focus();
    }
  }

  // Close modal
  function closeModal() {
    if (!modal || modal.hidden) return;

    modal.hidden = true;

    modal.style.display = "none";
    modal.style.zIndex = "";

    document.body.classList.remove("modal-open");

    if (
      lastFocus &&
      typeof lastFocus.focus === "function"
    ) {
      lastFocus.focus();
    }
  }

  // Project buttons
  document
    .querySelectorAll("[data-open-project]")
    .forEach(function (button) {
      button.addEventListener("click", function () {
        openModal(
          button.getAttribute("data-open-project")
        );
      });
    });

  // Close buttons and backdrop
  document
    .querySelectorAll("[data-close-modal]")
    .forEach(function (el) {
      el.addEventListener("click", closeModal);
    });

  // Open modal with custom content
  function openModalWithContent(data) {
    if (!data || !modal) return;

    lastFocus = document.activeElement;

    if (modalLabel) {
      modalLabel.textContent = data.label || "";
    }

    if (modalTitle) {
      modalTitle.textContent = data.title || "";
    }

    if (modalText) {
      modalText.textContent = data.text || "";
    }

    if (modalPreview) {
      if (data.previewHTML) {
        modalPreview.innerHTML =
          '<div class="preview ' +
          (data.previewClass || "") +
          '">' +
          data.previewHTML +
          "</div>";
      } else {
        modalPreview.innerHTML = "";
      }
    }

    modal.hidden = false;
    modal.removeAttribute("hidden");

    modal.style.display = "grid";

    document.body.classList.add("modal-open");

    if (modalDialog) {
      modalDialog.focus();
    }
  }

  // Service cards open modal
  document
    .querySelectorAll(".service-card")
    .forEach(function (card) {
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");

      card.addEventListener("click", function () {
        var titleEl = card.querySelector("h3");
        var paraEl = card.querySelector("p");
        var imgEl = card.querySelector(".service-image");

        var data = {
          label: "Service",
          title: titleEl
            ? titleEl.textContent.trim()
            : "",
          text: paraEl
            ? paraEl.textContent.trim()
            : "",
          previewClass: imgEl
            ? "preview-service"
            : "",
          previewHTML: imgEl
            ? imgEl.outerHTML
            : ""
        };

        openModalWithContent(data);
      });

      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.click();
        }
      });
    });

  // Close modal with Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (modal && !modal.hidden) {
        closeModal();
      }

      if (
        document.body.classList.contains("nav-open")
      ) {
        closeNav();
      }
    }
  });

  // Close mobile nav when overlay clicked
  if (navOverlay) {
    navOverlay.addEventListener("click", function () {
      closeNav();
    });
  }

  // Active navigation link
  if (header) {
    var sections = document.querySelectorAll(
      "main section[id]"
    );

    var headerLinks =
      document.querySelectorAll(
        '.nav-list a[href^="#"]'
      );

    function updateCurrent() {
      var fromTop =
        window.scrollY +
        header.offsetHeight +
        24;

      var currentId = "home";

      sections.forEach(function (section) {
        if (section.offsetTop <= fromTop) {
          currentId = section.id;
        }
      });

      var navIds = {
        home: true,
        about: true,
        services: true,
        work: true,
        contact: true
      };

      headerLinks.forEach(function (link) {
        var id = link
          .getAttribute("href")
          .slice(1);

        link.removeAttribute("aria-current");

        if (
          navIds[currentId] &&
          id === currentId
        ) {
          link.setAttribute(
            "aria-current",
            "true"
          );
        }

        if (
          !navIds[currentId] &&
          id === "work" &&
          (currentId === "why" ||
            currentId === "process")
        ) {
          link.setAttribute(
            "aria-current",
            "true"
          );
        }

        if (
          !navIds[currentId] &&
          id === "contact" &&
          (currentId === "instagram" ||
            currentId === "faq")
        ) {
          link.setAttribute(
            "aria-current",
            "true"
          );
        }
      });
    }

    window.addEventListener(
      "scroll",
      updateCurrent,
      { passive: true }
    );

    updateCurrent();
  }
})();


// Service card reveal animation
document.addEventListener(
  "DOMContentLoaded",
  () => {
    const serviceCards =
      document.querySelectorAll(
        ".service-card"
      );

    if (!serviceCards.length) return;

    const serviceObserver =
      new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const card = entry.target;

            const index =
              Array.from(
                serviceCards
              ).indexOf(card);

            setTimeout(() => {
              card.classList.add(
                "is-visible"
              );
            }, index * 120);

            observer.unobserve(card);
          });
        },
        {
          threshold: 0.15,
          rootMargin:
            "0px 0px -50px 0px"
        }
      );

    serviceCards.forEach((card) => {
      serviceObserver.observe(card);
    });
  }
);

// ===== Iteration polish =====
document.addEventListener('DOMContentLoaded', function(){
  var loader = document.getElementById('site-loader');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finishLoader = function(){ 
    if(loader) loader.classList.add('is-done'); 
    document.body.classList.add('page-ready'); 
  };

  if(loader) {
    if (reduced) {
      finishLoader();
    } else {
      var images = Array.from(document.querySelectorAll('img'));
      var imagePromises = images.map(function(img) {
        if (img.complete && img.naturalHeight !== 0) {
          return Promise.resolve();
        }
        return new Promise(function(resolve) {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        });
      });

      // Wait until all images are fully loaded before dismissing
      Promise.all(imagePromises).then(function() {
        finishLoader();
      });
    }
  }

  var reveals=document.querySelectorAll('.reveal-block');
  if(reduced || !('IntersectionObserver' in window)){ reveals.forEach(function(el){el.classList.add('is-visible')}); }
  else{
    var ro=new IntersectionObserver(function(entries,obs){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-visible');obs.unobserve(e.target);}})},{threshold:.12,rootMargin:'0px 0px -7% 0px'});
    reveals.forEach(function(el){ro.observe(el)});
  }

  var artSections=document.querySelectorAll('.hero-visual,.about-visual,.ig-card,.contact-card');
  if(!reduced && artSections.length){
    var raf=0;
    function paintSectionDrift(){
      raf=0;
      var vh=window.innerHeight;
      artSections.forEach(function(el){
        var r=el.getBoundingClientRect();
        if(r.bottom < -120 || r.top > vh+120) return;
        var center=r.top+r.height*.5;
        var offset=(center-vh*.5)/vh;
        var drift=Math.max(-14,Math.min(14,-offset*16));
        el.style.setProperty('--section-drift',drift.toFixed(2)+'px');
        if(el.classList.contains('scroll-art')) el.style.setProperty('--art-drift',drift.toFixed(2)+'px');
      });
    }
    window.addEventListener('scroll',function(){ if(!raf) raf=requestAnimationFrame(paintSectionDrift); },{passive:true});
    paintSectionDrift();
  }

  var artReveal=document.querySelectorAll('.scroll-art');
  if(reduced || !('IntersectionObserver' in window)){ artReveal.forEach(function(el){el.classList.add('is-art-visible')}); }
  else {
    var artObserver=new IntersectionObserver(function(entries,obs){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        entry.target.classList.add('is-art-visible');
        obs.unobserve(entry.target);
      });
    },{threshold:.18,rootMargin:'0px 0px -12% 0px'});
    artReveal.forEach(function(el){artObserver.observe(el)});
  }

  document.querySelectorAll('.service-card').forEach(function(card){
    card.addEventListener('click',function(e){ if(e.target.closest('a,button,input,select,textarea')) return; });
  });

  var modal=document.getElementById('project-modal'), dialog=modal && modal.querySelector('.project-modal-dialog');
  var focusables='a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
  document.addEventListener('keydown',function(e){
    if(!modal || modal.hidden) return;
    if(e.key==='Tab' && dialog){ var els=dialog.querySelectorAll(focusables), first=els[0], last=els[els.length-1]; if(!els.length) return; if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus()} else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus()} }
  });

  var form=document.getElementById('contact-form'), status=document.getElementById('form-status');
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var name=(form.elements.name.value||'').trim(), type=form.elements.type.value, brief=(form.elements.brief.value||'').trim();
      if(!name || !type || !brief){ if(status) status.textContent='Please fill in your name, project type and brief.'; return; }
      var subject=encodeURIComponent('Aurevio project enquiry — '+type);
      var body=encodeURIComponent('Hi Aurevio,\n\nName: '+name+'\nProject type: '+type+'\n\nBrief:\n'+brief+'\n\nThanks.');
      if(status) status.textContent='Opening your email app…';
      window.location.href='mailto:wajahat.a2010@gmail.com?subject='+subject+'&body='+body;
    });
  }
});

(function () {
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(pointer:fine)").matches;
  if (reduced) return;

  if (finePointer) {
    document.body.classList.add("aurevio-pointer");
    var aura=document.querySelector(".aurevio-body-aura");
    var ax=window.innerWidth/2,ay=window.innerHeight/2,tx=ax,ty=ay;
    function paintAura(){
      ax+=(tx-ax)*.075; ay+=(ty-ay)*.075;
      if(aura) aura.style.transform="translate3d("+ax+"px,"+ay+"px,0) translate3d(-50%,-50%,0)";
      requestAnimationFrame(paintAura);
    }
    requestAnimationFrame(paintAura);
    window.addEventListener("pointermove",function(e){tx=e.clientX;ty=e.clientY},{passive:true});

    document.querySelectorAll("a,button,.service-card,.project-card").forEach(function(el){
      el.addEventListener("pointerenter",function(){document.body.classList.add("aurevio-cursor-active")});
      el.addEventListener("pointerleave",function(){document.body.classList.remove("aurevio-cursor-active")});
    });

    var hero=document.querySelector(".hero-visual");
    if(hero){
      hero.addEventListener("pointermove",function(e){
        var r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        var frame=hero.querySelector(".browser-frame");
        if(frame) frame.style.transform="rotateY("+(-5+x*7)+"deg) rotateX("+(2.5-y*5)+"deg) translate3d("+(x*8)+"px,"+(y*6)+"px,0)";
        hero.querySelectorAll(".aurevio-float-chip").forEach(function(chip,i){
          var s=[18,12,15][i]||12;
          chip.style.setProperty("--fx",(x*s)+"px"); chip.style.setProperty("--fy",(y*s)+"px");
        });
      });
      hero.addEventListener("pointerleave",function(){
        var frame=hero.querySelector(".browser-frame"); if(frame) frame.style.transform="";
        hero.querySelectorAll(".aurevio-float-chip").forEach(function(chip){chip.style.setProperty("--fx","0px");chip.style.setProperty("--fy","0px")});
      });
    }

    document.querySelectorAll(".magnetic").forEach(function(el){
      el.addEventListener("pointermove",function(e){
        var r=el.getBoundingClientRect(),x=(e.clientX-(r.left+r.width/2))/r.width,y=(e.clientY-(r.top+r.height/2))/r.height;
        el.style.setProperty("--mx",(x*7)+"px");el.style.setProperty("--my",(y*7)+"px");
      });
      el.addEventListener("pointerleave",function(){el.style.setProperty("--mx","0px");el.style.setProperty("--my","0px")});
    });

    document.querySelectorAll(".project-card,.service-card").forEach(function(card){
      card.addEventListener("pointermove",function(e){
        var r=card.getBoundingClientRect();
        card.style.setProperty("--gx",(e.clientX-r.left)+"px");card.style.setProperty("--gy",(e.clientY-r.top)+"px");
      });
    });
  }
})();
