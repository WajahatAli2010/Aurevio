// A route through one connected building. Coordinates are Three.js X/Y/Z.
export const destinations = [
  { id:'top',      label:'01 / ENTRANCE', position:[0,2.4,17],     target:[0,2.5,4] },
  { id:'point',    label:'02 / RECEPTION', position:[0,2.2,1],      target:[-4.5,1.8,-1] },
  { id:'work',     label:'03 / GALLERY', position:[0,2.3,-9],       target:[-7.5,2.6,-13] },
  { id:'noire',    label:'03 / NOIRÉ', position:[-3,2.25,-12],      target:[-8.2,2.8,-12] },
  { id:'velor',    label:'03 / VÉLOR', position:[-3,2.25,-19],      target:[-8.2,2.8,-19] },
  { id:'alex',     label:'03 / ALEX MORGAN', position:[-3,2.25,-26],target:[-8.2,2.8,-26] },
  { id:'practice', label:'04 / WORKSHOP', position:[0,2.2,-34],     target:[4.5,2,-39] },
  { id:'why',      label:'05 / WHY AUREVIO', position:[0,2.25,-53], target:[8.2,2.8,-54] },
  { id:'packages', label:'06 / PACKAGES', position:[0,2.2,-64],     target:[5.5,2.2,-68] },
  { id:'about',    label:'07 / LOUNGE', position:[0,2.2,-78],       target:[-5.2,1.5,-81] },
  { id:'faq',      label:'08 / FAQ', position:[0,2.2,-85],          target:[6.5,2.3,-88] },
  { id:'contact',  label:'09 / CONTACT', position:[0,2.2,-97],      target:[0,2.6,-105] }
];

export function sampleRoute(stops, scroll) {
  if (!stops.length) return null;
  const copy = stop => ({position:[...stop.position],target:[...stop.target]});
  if (scroll <= stops[0].scroll) return copy(stops[0]);
  for (let i=1;i<stops.length;i++) {
    const end=stops[i],start=stops[i-1];
    if(scroll<=end.scroll){
      const t=Math.max(0,Math.min(1,(scroll-start.scroll)/Math.max(1,end.scroll-start.scroll)));
      const mix=(a,b)=>a.map((v,j)=>v+(b[j]-v)*t);
      return {position:mix(start.position,end.position),target:mix(start.target,end.target)};
    }
  }
  return copy(stops.at(-1));
}

export function measureRoute(doc) {
  return destinations.map(item=>{
    const element=doc.querySelector(`[data-stop="${item.id}"]`);
    return {...item,scroll:element ? element.getBoundingClientRect().top+window.scrollY : 0};
  });
}
