// The original site remains usable while the 3D building is prepared.
export function initStudio() {
  const canvas=document.querySelector('#studio-scene'),resume=document.querySelector('#studio-resume'),loading=document.querySelector('#studio-loading');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let studio=null,generation=0,simple=false;
  function useSimple(){generation++;simple=true;studio=null;if(loading)loading.hidden=true;if(resume){resume.hidden=false;resume.focus({preventScroll:true});}}
  async function start(){
    const current=++generation;
    if(reduced.matches||navigator.connection?.saveData||simple||studio||!canvas)return;
    if(loading)loading.hidden=false;
    try{
      const {createStudio}=await import('./studio/index.js');
      if(current!==generation||simple||reduced.matches)return;
      const instance=await createStudio(canvas,useSimple,()=>current===generation&&!simple&&!reduced.matches);
      if(current!==generation||simple||reduced.matches)instance?.dispose();else studio=instance;
    }catch(error){console.warn('Studio unavailable; showing the accessible portfolio.',error);}
    finally{if(current===generation&&loading)loading.hidden=true;}
  }
  resume?.addEventListener('click',()=>{simple=false;resume.hidden=true;start();});
  loading?.querySelector('button')?.addEventListener('click',useSimple);
  reduced.addEventListener?.('change',()=>{if(reduced.matches){generation++;studio?.dispose();studio=null;if(loading)loading.hidden=true;if(resume)resume.hidden=true;}else if(!simple)start();});
  requestAnimationFrame(()=>setTimeout(start,0));
  addEventListener('pagehide',()=>{generation++;studio?.dispose();studio=null;});
  addEventListener('pageshow',event=>{if(event.persisted&&!simple)start();});
}
