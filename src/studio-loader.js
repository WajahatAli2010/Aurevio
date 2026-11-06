// Core content appears before the optional 3D code is downloaded.
export function initStudio() {
  const canvas = document.querySelector('#studio-scene');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let studio = null, generation = 0;
  async function update() {
    const current = ++generation;
    if (reduced.matches || navigator.connection?.saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2)) {
      studio?.dispose(); studio=null; return;
    }
    if (studio || !canvas) return;
    try {
      const {createStudio}=await import('./studio/index.js');
      if (current===generation && !reduced.matches) studio=createStudio(canvas);
    } catch (error) { console.warn('Studio unavailable; showing the accessible portfolio.',error); }
  }
  reduced.addEventListener?.('change',update);
  requestAnimationFrame(()=>setTimeout(update,0));
  addEventListener('pagehide',()=>{generation++;studio?.dispose();studio=null;});
  addEventListener('pageshow',event=>{if(event.persisted) update();});
}
