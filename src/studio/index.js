import * as THREE from 'three';
import { createWorld } from './world.js';
import { measureRoute, sampleRoute } from './route.js';

export function createStudio(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({canvas, antialias:false, alpha:false, powerPreference:'low-power'});
  } catch { return null; }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46,1,.1,90);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x10140f);
  const world = createWorld(scene);
  const controls = [...document.querySelectorAll('[data-exhibit]')];
  const close = document.querySelector('#close-exhibit');
  const label = document.querySelector('#studio-location');
  const header = document.querySelector('.site-header');
  const main = document.querySelector('main');
  const faq = document.querySelector('#faq');
  const contact = document.querySelector('#contact');
  let stops = [], frame = 0, selection = null, transition = null, disposed = false, faqFrozen = null;
  let faqStart = Infinity, faqEnd = Infinity;
  let current = {position:[0,2.15,10],target:[1,2.2,-2]};
  const depths = [-30,-39,-48];
  const names = ['NOIRÉ','VÉLOR','Alex Morgan'];
  function queue() { if (!frame && !document.hidden && !disposed) frame = requestAnimationFrame(draw); }
  function updateRoute() {
    const offset = (header?.offsetHeight || 76) + 1;
    stops = measureRoute(document, offset);
    faqStart = faq ? faq.getBoundingClientRect().top + scrollY - offset : Infinity;
    faqEnd = contact ? contact.getBoundingClientRect().top + scrollY - offset : Infinity;
    queue();
  }
  function updateButtons() {
    controls.forEach((button,i) => button.setAttribute('aria-pressed', String(selection === i)));
    if (close) close.hidden = selection === null;
    if (label) label.textContent = selection === null ? 'Scroll to explore the studio' : `${names[selection]} exhibit`;
  }
  function interpolate(from,to,t) {
    const mix = (a,b) => a.map((v,i) => v+(b[i]-v)*t);
    return {position:mix(from.position,to.position), target:mix(from.target,to.target)};
  }
  function draw(now) {
    frame = 0; if (disposed || document.hidden) return;
    const route = sampleRoute(stops,window.scrollY) || current;
    let destination = route;
    if (window.scrollY >= faqStart && window.scrollY < faqEnd && faq?.querySelector('details[open]')) {
      faqFrozen ||= {position:[...current.position],target:[...current.target]};
      destination=faqFrozen;
    } else faqFrozen=null;
    if (selection !== null) {
      const z = depths[selection];
      destination = {position:[.8,2.35,z+7.6],target:[4.2,2.65,z]};
    }
    if (transition) {
      const p=Math.min(1,(now-transition.start)/300), t=1-Math.pow(1-p,3);
      current=interpolate(transition.from,destination,t);
      if (p<1) queue(); else transition=null;
    } else current=destination;
    camera.position.set(...current.position); camera.lookAt(...current.target);
    renderer.render(scene,camera);
    document.documentElement.classList.add('studio-ready');
    canvas.dataset.ready='true'; canvas.dataset.position=current.position[2].toFixed(2);
  }
  function resize() {
    const small=window.innerWidth<=700;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1 : 1.25));
    renderer.setSize(window.innerWidth,window.innerHeight,false);
    camera.aspect=window.innerWidth/window.innerHeight; camera.fov=small ? 58 : 46; camera.updateProjectionMatrix();
    updateRoute();
  }
  function select(index) {
    if (selection === index) index=null;
    selection=index; transition={from:current,start:performance.now()};
    if (index !== null) world.loadGallery(queue);
    updateButtons(); queue();
  }
  const actions = controls.map((button,i) => {
    const handler=()=>{select(i); if (selection !== null) close?.focus({preventScroll:true});}; button.hidden=false; button.addEventListener('click',handler); return handler;
  });
  // Keep the close action close to the initiating control for keyboard users.
  const closeHandler=()=>{ const previous=selection; select(null); if (previous !== null) controls[previous]?.focus(); };
  close?.addEventListener('click',closeHandler);
  function scroll() {
    if (selection !== null) { selection=null; transition=null; updateButtons(); }
    queue();
  }
  const theme = new MutationObserver(() => {world.setTheme(document.documentElement.dataset.theme); queue();});
  theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  const gallery=document.querySelector('#work');
  let galleryObserver;
  if (gallery && 'IntersectionObserver' in window) {
    galleryObserver=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){world.loadGallery(queue);galleryObserver.disconnect();}
    },{rootMargin:'1200px 0px'});
    galleryObserver.observe(gallery);
  } else world.loadGallery(queue);
  const resizeObserver = 'ResizeObserver' in window && main ? new ResizeObserver(updateRoute) : null;
  resizeObserver?.observe(main);
  window.addEventListener('scroll',scroll,{passive:true}); window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',queue);
  const contextLost = event => {event.preventDefault(); dispose();};
  canvas.addEventListener('webglcontextlost',contextLost);
  world.setTheme(document.documentElement.dataset.theme); updateButtons(); resize();
  document.fonts?.ready.then(() => {if (!disposed) updateRoute();});
  function dispose() {
    if (disposed) return; disposed=true;
    if(frame) cancelAnimationFrame(frame);
    window.removeEventListener('scroll',scroll);window.removeEventListener('resize',resize);
    document.removeEventListener('visibilitychange',queue);canvas.removeEventListener('webglcontextlost',contextLost);
    theme.disconnect();galleryObserver?.disconnect();resizeObserver?.disconnect();
    controls.forEach((button,i)=>{button.removeEventListener('click',actions[i]);button.hidden=true;button.setAttribute('aria-pressed','false');});
    close?.removeEventListener('click',closeHandler);if(close)close.hidden=true;
    document.documentElement.classList.remove('studio-ready');
    world.dispose();renderer.dispose();
  }
  return {dispose};
}
