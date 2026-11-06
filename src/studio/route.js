// Camera locations are tied to real document sections, not total page length.
export function sampleRoute(stops, scroll) {
  if (!stops.length) return null;
  const copy = stop => ({ position: [...stop.position], target: [...stop.target] });
  if (scroll <= stops[0].scroll) return copy(stops[0]);
  for (let i = 1; i < stops.length; i++) {
    const end = stops[i];
    const start = stops[i - 1];
    if (scroll <= end.scroll) {
      const t = Math.max(0, Math.min(1, (scroll - start.scroll) / Math.max(1, end.scroll - start.scroll)));
      const mix = (a, b) => a.map((v, j) => v + (b[j] - v) * t);
      return { position: mix(start.position, end.position), target: mix(start.target, end.target) };
    }
  }
  return copy(stops.at(-1));
}

export const destinations = [
  { selector: '#top', z: 10, x: 0, look: 1 },
  { selector: '#point', z: -4, x: -.5, look: .8 },
  { selector: '#work', z: -18, x: -.6, look: 1.4 },
  { selector: '.project-main', z: -23, x: -.7, look: 2.1 },
  { selector: '.project-secondary:not(.project-low)', z: -32, x: -.6, look: 2 },
  { selector: '.project-low', z: -41, x: -.5, look: 2 },
  { selector: '#practice', z: -51, x: .5, look: 1 },
  { selector: '#why', z: -63, x: -.3, look: 1.2 },
  { selector: '#packages', z: -75, x: .4, look: 1 },
  { selector: '#about', z: -87, x: -.4, look: 1 },
  { selector: '#faq', z: -99, x: .2, look: 1 },
  { selector: '#contact', z: -111, x: 0, look: .7 }
];

export function measureRoute(doc, offset = 0) {
  return destinations.flatMap(item => {
    const element = doc.querySelector(item.selector);
    if (!element) return [];
    return [{ scroll: Math.max(0, element.getBoundingClientRect().top + window.scrollY - offset),
      position: [item.x, 2.15, item.z], target: [item.look, 2.2, item.z - 12] }];
  }).sort((a, b) => a.scroll - b.scroll);
}
