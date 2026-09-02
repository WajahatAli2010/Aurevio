(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.getElementById('site-nav');
  var navOverlay = document.querySelector('.nav-overlay');

  function openNav() {
    document.body.classList.add('nav-open');
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Close menu');
    }
    if (navOverlay) navOverlay.hidden = false;
  }

  function closeNav() {
    document.body.classList.remove('nav-open');
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
    }
    if (navOverlay) navOverlay.hidden = true;
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      if (document.body.classList.contains('nav-open')) closeNav();
      else openNav();
    });
  }

  var desktopNav = window.matchMedia('(min-width:821px)');
  if (desktopNav) {
    if (typeof desktopNav.addEventListener === 'function') {
      desktopNav.addEventListener('change', function (event) {
        if (event.matches) closeNav();
      });
    } else if (typeof desktopNav.addListener === 'function') {
      desktopNav.addListener(function (m) {
        if (m.matches) closeNav();
      });
    }
  }

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // FAQ triggers (safe if none exist)
  var faqTriggers = document.querySelectorAll('.faq-trigger') || [];
  faqTriggers.forEach(function (button) {
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      var panelId = button.getAttribute('aria-controls');
      var panel = panelId ? document.getElementById(panelId) : null;
      faqTriggers.forEach(function (other) {
        var otherPanel = document.getElementById(other.getAttribute('aria-controls'));
        other.setAttribute('aria-expanded', 'false');
        if (otherPanel) otherPanel.hidden = true;
      });
      if (!expanded && panel) {
        button.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });
  });

  // Reveal on scroll
  var steps = document.querySelectorAll('.reveal') || [];
  if (reduceMotion) {
    steps.forEach(function (step) {
      step.classList.add('is-visible');
    });
  } else if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    );
    steps.forEach(function (step) {
      observer.observe(step);
    });
  } else {
    steps.forEach(function (step) {
      step.classList.add('is-visible');
    });
  }

  var igImg = document.getElementById('ig-profile-img');
  if (igImg) {
    igImg.addEventListener('error', function () {
      igImg.classList.add('is-hidden');
    });
    if (igImg.complete && igImg.naturalWidth === 0) {
      igImg.classList.add('is-hidden');
    }
  }

  var projects = {
    restaurant: {
      label: 'Concept Project',
      title: 'Restaurant Website',
      text:
        "A frontend concept for a restaurant site: a strong opening section, a menu preview, a photo gallery, location details and a simple contact area. This is a demonstration of layout and design — not a live client website.",
      previewClass: 'preview preview-restaurant',
      previewHTML:
        '<div class="pr-hero"><span class="pr-kicker">Kitchen</span><span class="pr-title">Evening menu</span></div><div class="pr-row"><span></span><span></span><span></span></div><div class="pr-gallery"><span></span><span></span></div>'
    },
    fashion: {
      label: 'Concept Project',
      title: 'Clothing Store Website',
      text:
        "A fashion storefront concept that presents collections and brand sections with a clear contact path. It is a static visual website — there is no shopping cart, checkout or payment flow.",
      previewClass: 'preview preview-fashion',
      previewHTML:
        '<div class="pf-hero"><span class="pf-title">New collection</span><span class="pf-sub">Lookbook</span></div><div class="pf-items"><span></span><span></span><span></span></div>'
    },
    portfolio: {
      label: 'Demo Project',
      title: 'Personal Portfolio',
      text:
        'A static personal portfolio demo with an introduction, skills, selected projects and contact information. Built to show a clean, responsive frontend structure.',
      previewClass: 'preview preview-portfolio',
      previewHTML:
        '<div class="pp-intro"><span class="pp-avatar"></span><span class="pp-lines"><i></i><i></i></span></div><div class="pp-skills"><span></span><span></span><span></span></div><div class="pp-projects"><span></span><span></span></div>'
    }
  };

  var modal = document.getElementById('project-modal');
  var modalDialog = modal ? modal.querySelector('.project-modal-dialog') : null;
  var modalTitle = document.getElementById('project-modal-title');
  var modalLabel = document.getElementById('project-modal-label');
  var modalText = document.getElementById('project-modal-text');
  var modalPreview = document.getElementById('project-modal-preview');
  var lastFocus = null;

  function openModal(key) {
    var data = projects[key];
    if (!data || !modal) return;
    lastFocus = document.activeElement;
    console.log('openModal key=', key, 'modal=', modal, 'hiddenBefore=', modal.hidden);
    if (modalLabel) modalLabel.textContent = data.label;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalText) modalText.textContent = data.text;
    if (modalPreview) modalPreview.innerHTML = '<div class="' + data.previewClass + '">' + data.previewHTML + '</div>';
    try {
      modal.hidden = false;
      // force visible in case CSS/attributes conflict
      modal.removeAttribute('hidden');
      modal.style.display = 'grid';
      modal.style.zIndex = '9999';
    } catch (e) {
      console.error('could not unhide modal', e);
    }
    console.log('openModal hiddenAfter=', modal.hidden, 'display=', modal.style.display);
    document.body.classList.add('modal-open');
    if (modalDialog) modalDialog.focus();
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.style.display = 'none';
    modal.style.zIndex = '';
    document.body.classList.remove('modal-open');
    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus();
    }
  }

  document.querySelectorAll('[data-open-project]').forEach(function (button) {
    button.addEventListener('click', function () {
      openModal(button.getAttribute('data-open-project'));
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });

  // allow opening modal from service cards
function openModalWithContent(data) {
  if (!data || !modal) return;
  lastFocus = document.activeElement;
  if (modalLabel) modalLabel.textContent = data.label || '';
  if (modalTitle) modalTitle.textContent = data.title || '';
  if (modalText) modalText.textContent = data.text || '';
  if (modalPreview) {
    if (data.previewHTML) modalPreview.innerHTML = '<div class="preview ' + (data.previewClass || '') + '">' + data.previewHTML + '</div>';
    else modalPreview.innerHTML = '';
  }
  modal.hidden = false;
  modal.removeAttribute('hidden');
  modal.style.display = 'grid';
  document.body.classList.add('modal-open');
  if (modalDialog) modalDialog.focus();
}

  document.querySelectorAll('.service-card').forEach(function (card) {
    // make card keyboard focusable and announceable as button
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('click', function () {
      console.log('service-card clicked:', card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : '[no title]');
      var titleEl = card.querySelector('h3');
      var paraEl = card.querySelector('p');
      var imgEl = card.querySelector('.service-image');
      var data = {
        label: 'Service',
        title: titleEl ? titleEl.textContent.trim() : '',
        text: paraEl ? paraEl.textContent.trim() : '',
        previewClass: imgEl ? 'preview-service' : '',
        previewHTML: imgEl ? imgEl.outerHTML : ''
      };
      openModalWithContent(data);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // close modal on ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (modal && !modal.hidden) closeModal();
      if (document.body.classList.contains('nav-open')) closeNav();
    }
  });

  if (navOverlay) {
    navOverlay.addEventListener('click', function () {
      closeNav();
    });
  }

  if (header) {
    var sections = document.querySelectorAll('main section[id]');
    var headerLinks = document.querySelectorAll('.nav-list a[href^="#"]');
    function updateCurrent() {
      var fromTop = window.scrollY + header.offsetHeight + 24;
      var currentId = 'home';
      sections.forEach(function (section) {
        if (section.offsetTop <= fromTop) {
          currentId = section.id;
        }
      });
      var navIds = { home: true, about: true, services: true, work: true, contact: true };
      headerLinks.forEach(function (link) {
        var id = link.getAttribute('href').slice(1);
        link.removeAttribute('aria-current');
        if (navIds[currentId] && id === currentId) {
          link.setAttribute('aria-current', 'true');
        }
        if (!navIds[currentId] && id === 'work' && (currentId === 'why' || currentId === 'process')) {
          link.setAttribute('aria-current', 'true');
        }
        if (!navIds[currentId] && id === 'contact' && (currentId === 'instagram' || currentId === 'faq')) {
          link.setAttribute('aria-current', 'true');
        }
      });
    }
    window.addEventListener('scroll', updateCurrent, { passive: true });
    updateCurrent();
  }
})();
document.addEventListener("DOMContentLoaded", () => {
  const serviceCards = document.querySelectorAll(".service-card");

  if (!serviceCards.length) return;

  const serviceObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const card = entry.target;
        const index = Array.from(serviceCards).indexOf(card);

        setTimeout(() => {
          card.classList.add("is-visible");
        }, index * 120);

        observer.unobserve(card);
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    }
  );

  serviceCards.forEach((card) => {
    serviceObserver.observe(card);
  });
});
