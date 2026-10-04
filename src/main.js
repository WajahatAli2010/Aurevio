import "../css/base.css";
import "../css/header.css";
import "../css/sections.css";
import "../css/responsive.css";
import "../css/theme.css";

import { initNavigation, initHeaderState, initSectionNavigation, initAnchors } from "./navigation.js";
import { initTheme } from "./theme.js";
import { initReveal, initScrollProgress, initProjectMotion, initHeroObject } from "./animations.js";

function initInquiryForm() {
  const form = document.querySelector("#inquiry-form");
  const status = document.querySelector("#inquiry-status");
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
  initTheme();
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