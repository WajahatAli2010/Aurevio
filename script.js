(() => {
  "use strict";
  const sections=[["site-header","sections/header.html"],["hero-section","sections/hero.html"],["marquee-section","sections/marquee.html"],["work-section","sections/work.html"],["services-section","sections/services.html"],["about-section","sections/about.html"],["process-section","sections/process.html"],["contact-section","sections/contact.html"],["site-footer","sections/footer.html"]];
  async function loadSections(){await Promise.all(sections.map(async([id,file])=>{const response=await fetch(file);if(!response.ok)throw new Error("Failed to load "+file);document.getElementById(id).innerHTML=await response.text()}))}
  function initNavigation(){const toggle=document.querySelector(".nav-toggle"),nav=document.querySelector("#site-nav");if(!toggle||!nav)return;toggle.addEventListener("click",()=>{const open=nav.classList.toggle("open");toggle.setAttribute("aria-expanded",String(open))});nav.addEventListener("click",e=>{if(e.target.closest("a")){nav.classList.remove("open");toggle.setAttribute("aria-expanded","false")}})}
  loadSections().then(initNavigation).catch(error=>console.error("Aurevio loader:",error));
})();