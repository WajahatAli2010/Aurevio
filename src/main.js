import "../css/base.css";
import "../css/header.css";
import "../css/sections.css";
import "../css/theme.css";
import "../css/responsive.css";
import "../css/motion.css";

import { initNavigation, initHeaderState, initSectionNavigation, initAnchors } from "./navigation.js";
import { initTheme } from "./theme.js";
import { initPackageSelection } from "./packages.js";
import { initReveal, initScrollProgress, initAccordions, initFormFeedback } from "./animations.js";

function initInquiryForm() {
  const form = document.querySelector("#inquiry-form");
  const status = document.querySelector("#inquiry-status");
  if (!form || !status) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    if (button.disabled) return;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    status.textContent = "Sending your inquiry…";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error("Submission failed");
      form.reset();
      status.textContent = "Your inquiry was sent. Thank you!";
    } catch {
      status.textContent = "Your inquiry could not be sent. Please try again or contact me on Instagram.";
    } finally {
      button.disabled = false;
      button.removeAttribute("aria-busy");
    }
  });
}

function init() {
  document.documentElement.classList.add("js");
  initTheme();
  initNavigation();
  initHeaderState();
  initReveal();
  initScrollProgress();
  initSectionNavigation();
  initPackageSelection();
  initAnchors();
  initInquiryForm();
  initAccordions();
  initFormFeedback();
}

try {
  init();
} catch (error) {
  console.error("Aurevio initialization error:", error);
}
