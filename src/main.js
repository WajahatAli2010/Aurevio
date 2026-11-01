import "../css/base.css";
import "../css/header.css";
import "../css/sections.css";
import "../css/theme.css";
import "../css/responsive.css";
import "../css/motion.css";

import { initNavigation, initHeaderState, initSectionNavigation, initAnchors } from "./navigation.js";
import { initTheme } from "./theme.js";
import { initPackageSelection } from "./packages.js";
import { initReveal, initScrollProgress, initProjectMotion, initAccordions, initFormFeedback } from "./animations.js";

function initInquiryForm() {
  const form = document.querySelector("#inquiry-form");
  const status = document.querySelector("#inquiry-status");
  if (!form || !status) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    if (button.disabled) return;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    status.textContent = 'Preparing your inquiry…';
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
    button.disabled = false;
    button.removeAttribute('aria-busy');
    window.open("https://instagram.com/lilwebypants", "_blank", "noopener,noreferrer");
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
  initProjectMotion();
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