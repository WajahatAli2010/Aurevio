import "../css/main.css";
import { initNavigation, initHeaderState, initSectionNavigation, initAnchors } from "./navigation.js";
import { initTheme } from "./theme.js";
import { initReveal, initScrollProgress, initProjectMotion, initHeroObject } from "./animations.js";
import { initInquiryForm } from "./inquiry.js";

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
