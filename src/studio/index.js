import * as THREE from 'three';
import { createWorld } from './world.js';
import { destinations, measureRoute, sampleRoute } from './route.js';

// Keep the original semantic portfolio intact until the entire building is ready.
export async function createStudio(canvas, onSimple, mayStart=()=>true) {
  const experience=document.querySelector('#studio-experience');
  if(!experience||!canvas)return null;
  let renderer;
  try { renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:false,powerPreference:'low-power'}); }
  catch { return null; }
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(48,1,.1,120);
  let frame=0,active=false,disposed=false,stops=[],activeIndex=-1,current=null;
  function queue(){if(active&&!frame&&!document.hidden&&!disposed)frame=requestAnimationFrame(draw);}
  let world;
  try {world=await createWorld(scene,queue);} catch(error){renderer.dispose();throw error;}
  if(!mayStart()){world.dispose();renderer.dispose();return null;}
  const root=document.documentElement, header=document.querySelector('.site-header');
  const originalForm=document.querySelector('#contact .inquiry-panel');
  const parent=originalForm?.parentNode, nextSibling=originalForm?.nextSibling;
  const contact=document.querySelector('#walk-contact'),packages=document.querySelector('#walk-packages'),faq=document.querySelector('#walk-faq');
  const dialogs={contact,packages,faq};
  if(originalForm)contact.querySelector('[data-contact-slot]').append(originalForm);
  const packageGrid=document.querySelector('#packages .package-grid');
  const faqList=document.querySelector('#faq .faq-list');
  if(packageGrid)packages.querySelector('[data-package-slot]').append(packageGrid.cloneNode(true));
  if(faqList)faq.querySelector('[data-faq-slot]').append(faqList.cloneNode(true));
  const panels=[...experience.querySelectorAll('[data-panel]')],links=[...experience.querySelectorAll('[data-go]')];
  const nav=[...experience.querySelectorAll('.walk-nav [data-go]')], locationLabel=document.querySelector('#walk-location');
  const themeButton=document.querySelector('#walk-theme'),simpleButton=document.querySelector('#walk-simple');
  function measure(){stops=measureRoute(document);queue();}
  function setPanel(index){
    if(index===activeIndex)return;activeIndex=index;
    const id=destinations[index].id;
    panels.forEach(panel=>{panel.hidden=panel.dataset.panel!==id;});
    const navId=['noire','velor','alex'].includes(id)?'work':id;
    nav.forEach(button=>{if(button.dataset.go===navId)button.setAttribute('aria-current','location');else button.removeAttribute('aria-current');});
    if(locationLabel)locationLabel.textContent=destinations[index].label;
    if(index>=2&&index<=5)world.loadGallery();
  }
  function draw(){
    frame=0;if(!active||disposed||document.hidden)return;
    const scroll=window.scrollY;
    current=sampleRoute(stops,scroll)||current;
    if(current){camera.position.set(...current.position);camera.lookAt(...current.target);}
    let closest=0;
    for(let i=1;i<stops.length;i++)if(Math.abs(stops[i].scroll-scroll)<Math.abs(stops[closest].scroll-scroll))closest=i;
    setPanel(closest);renderer.render(scene,camera);
    canvas.dataset.ready='true';canvas.dataset.stage=destinations[closest].id;
  }
  function resize(){
    const small=window.innerWidth<=700;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,small?1:1.25));
    renderer.setSize(window.innerWidth,window.innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.fov=small?57:48;camera.updateProjectionMatrix();measure();
  }
  function findIndex(id){const i=destinations.findIndex(item=>item.id===id);return i<0?0:i;}
  function navigate(id,{historyEntry=true,instant=false}={}){
    const index=findIndex(id),destination=stops[index];if(!destination)return;
    if(historyEntry&&location.hash!==`#${id}`)history.pushState(null,'',`#${id}`);
    window.scrollTo({top:destination.scroll,behavior:instant?'auto':'smooth'});
  }
  function syncDialogLock(){document.body.classList.toggle('walk-dialog-open',Object.values(dialogs).some(dialog=>dialog?.open));}
  function openDialog(name){
    const dialog=dialogs[name];if(!dialog)return;
    Object.values(dialogs).forEach(item=>{if(item?.open)item.close();});
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
    syncDialogLock();
  }
  function closeDialog(dialog){if(dialog.open&&typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');syncDialogLock();queue();}
  function click(event){
    const go=event.target.closest('[data-go]');
    if(go&&experience.contains(go)){navigate(go.dataset.go);return;}
    const opener=event.target.closest('[data-dialog]');
    if(opener){openDialog(opener.dataset.dialog);return;}
    const close=event.target.closest('[data-close]');
    if(close){closeDialog(close.closest('dialog'));return;}
    const service=event.target.closest('#walk-packages a[data-service]');
    if(service){
      event.preventDefault();const select=contact.querySelector('select[name="service"]');
      if(select){select.value=service.dataset.service;select.dispatchEvent(new Event('change',{bubbles:true}));}
      closeDialog(packages);openDialog('contact');
    }
  }
  function syncTheme(){
    world.setTheme(root.dataset.theme);
    const dark=root.dataset.theme==='dark';themeButton.setAttribute('aria-pressed',String(dark));
    themeButton.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
  }
  const themeObserver=new MutationObserver(syncTheme);themeObserver.observe(root,{attributes:true,attributeFilter:['data-theme']});
  function toggleTheme(){header.querySelector('.theme-toggle')?.click();}
  function pop(){navigate(location.hash.slice(1)||'top',{historyEntry:false,instant:true});}
  function contextLost(event){event.preventDefault();dispose();onSimple?.();}
  const dialogClosed=()=>{syncDialogLock();queue();};
  const simple=()=>{dispose();onSimple?.();};
  experience.addEventListener('click',click);themeButton.addEventListener('click',toggleTheme);simpleButton.addEventListener('click',simple);
  Object.values(dialogs).forEach(dialog=>dialog?.addEventListener('close',dialogClosed));
  window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('popstate',pop);document.addEventListener('visibilitychange',queue);canvas.addEventListener('webglcontextlost',contextLost);
  const initial=location.hash.slice(1)||'top';
  experience.hidden=false;root.classList.add('studio-active');active=true;syncTheme();resize();
  navigate(initial,{historyEntry:false,instant:true});queue();
  function dispose(){
    if(disposed)return;disposed=true;active=false;if(frame)cancelAnimationFrame(frame);
    Object.values(dialogs).forEach(dialog=>{if(dialog?.open)dialog.close();dialog?.removeEventListener('close',dialogClosed);});
    document.body.classList.remove('walk-dialog-open');
    experience.removeEventListener('click',click);themeButton.removeEventListener('click',toggleTheme);simpleButton.removeEventListener('click',simple);
    window.removeEventListener('scroll',queue);window.removeEventListener('resize',resize);window.removeEventListener('popstate',pop);
    document.removeEventListener('visibilitychange',queue);canvas.removeEventListener('webglcontextlost',contextLost);themeObserver.disconnect();
    if(originalForm&&parent)parent.insertBefore(originalForm,nextSibling&&nextSibling.parentNode===parent?nextSibling:null);
    packages.querySelector('[data-package-slot]').replaceChildren();faq.querySelector('[data-faq-slot]').replaceChildren();
    root.classList.remove('studio-active');experience.hidden=true;world.dispose();renderer.dispose();
    const id=['noire','velor','alex'].includes(location.hash.slice(1))?'work':location.hash.slice(1);
    if(id)document.getElementById(id)?.scrollIntoView({behavior:'auto',block:'start'});
  }
  return {dispose};
}
