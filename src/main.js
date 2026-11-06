import "../css/base.css";
import "../css/header.css";
import "../css/sections.css";
import "../css/theme.css";
import "../css/responsive.css";
import "../css/motion.css";
import "../css/studio.css";
import { initStudio } from "./studio-loader.js";
import { initInquiryForm } from "./inquiry.js";

import { initNavigation, initHeaderState, initSectionNavigation, initAnchors } from "./navigation.js";
import { initTheme } from "./theme.js";
import { initPackageSelection } from "./packages.js";
import { initReveal, initScrollProgress, initAccordions, initFormFeedback } from "./animations.js";

function init() {
  document.documentElement.classList.add("js");
  initTheme();
  initStudio();
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
