import * as THREE from 'three';

const projectImages = [
  new URL('../../assets/NOIRE.webp', import.meta.url).href,
  new URL('../../assets/VELOR.webp', import.meta.url).href,
  new URL('../../assets/portfolio.webp', import.meta.url).href
];

// One continuous building. Screens, furniture and wayfinding give each bay a purpose.
export function createWorld(scene) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  const unit = new THREE.BoxGeometry(1, 1, 1); geometries.add(unit);
  const plane = new THREE.PlaneGeometry(1, 1); geometries.add(plane);
  const material = (color, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({color, roughness: .88, metalness: .02, ...extra});
    materials.add(m); return m;
  };
  const wall = material('#20251e'), floor = material('#2b3027'), structure = material('#3b4135');
  const surface = material('#161a15'), metal = material('#6c7560', {metalness:.24, roughness:.58});
  const accent = material('#c8ff24', {emissive:'#394900', emissiveIntensity:.18});
  const screenMats = [];
  function box(x,y,z,w,h,d,mat) {
    const mesh = new THREE.Mesh(unit,mat); mesh.position.set(x,y,z); mesh.scale.set(w,h,d); scene.add(mesh); return mesh;
  }
  function sign(text, x, y, z, w, h, angle = 0) {
    const c = document.createElement('canvas'); c.width = 768; c.height = 192;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = '#10140f'; ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle = '#c8ff24'; ctx.fillRect(0,0,12,c.height);
    ctx.fillStyle = '#eeeee5'; ctx.font = '600 54px system-ui, sans-serif';
    ctx.textBaseline = 'middle'; ctx.fillText(text,40,98,690);
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace; textures.add(texture);
    const m = new THREE.MeshBasicMaterial({map:texture}); materials.add(m);
    const mesh = new THREE.Mesh(plane,m); mesh.position.set(x,y,z); mesh.scale.set(w,h,1); mesh.rotation.y=angle; scene.add(mesh);
  }
  // The same floor, walls and overhead beams connect every destination.
  box(0,-.18,-55,18,.36,158,floor);
  box(-9,3.4,-55,.35,7,158,wall); box(9,3.4,-55,.35,7,158,wall);
  box(0,7,-55,18,.35,158,wall);
  for (let z=4; z>=-128; z-=12) {
    box(-7.9,3.25,z,.22,6.5,.45,structure); box(7.9,3.25,z,.22,6.5,.45,structure);
    box(0,6.45,z,16,.22,.45,structure);
    box(0,6.27,z,4.3,.035,.12,accent);
    // Narrow floor inlays act as a route through the studio.
    box(-5.8,.014,z-5,.04,.025,10,metal); box(5.8,.014,z-5,.04,.025,10,metal);
  }
  sign('AUREVIO  /  DIGITAL STUDIO',3.2,4.8,0,5.6,1.4);
  sign('02  /  THE POINT',5.2,4.6,-13,4.5,1.1,-.14);
  sign('03  /  SELECTED WORK',5.2,4.7,-24,4.8,1.2,-.1);
  sign('04  /  THE WORKSHOP',5.2,4.6,-58,4.8,1.2,-.1);
  sign('05  /  WHY AUREVIO',5.2,4.6,-70,4.6,1.15,-.1);
  sign('06  /  PACKAGES',5.2,4.6,-82,4.5,1.1,-.1);
  sign('07  /  ABOUT ALI',5.2,4.6,-94,4.4,1.1,-.1);
  sign('08  /  QUESTIONS',5.2,4.6,-106,4.4,1.1,-.1);
  sign('09  /  CONTACT',5.2,4.6,-118,4.3,1.1,-.1);
  const screenDepths = [-30,-39,-48];
  screenDepths.forEach((z,i) => {
    // Framed, floor-supported exhibits; the actual project imagery loads near the gallery.
    box(4.5,2.65,z-.15,5.55,3.45,.35,metal);
    const mat = new THREE.MeshBasicMaterial({color: 0x343d2f}); screenMats.push(mat); materials.add(mat);
    const screen = new THREE.Mesh(plane,mat); screen.name = ['project-NOIRE','project-VELOR','project-ALEX'][i]; screen.scale.set(5.2,2.95,1); screen.position.set(4.5,2.7,z+.035); scene.add(screen);
    box(4.5,.45,z,3.6,.9,1.25,surface);
    box(4.5,.94,z,4.4,.08,1.5,accent);
  });
  // Workshop: drafting surface, legs and an inlaid work surface.
  box(4.7,1.55,-61,5.5,.18,2.4,surface);
  for (const x of [2.7,6.7]) for (const z of [-61.8,-60.2]) box(x,.75,z,.18,1.5,.18,metal);
  box(4.7,1.655,-61,3.2,.02,1.4,structure);
  for (let x=3.3;x<=6.1;x+=.4) box(x,1.67,-61,.012,.012,1.3,metal);
  // Three package plinths and a final contact counter.
  for (let i=0;i<3;i++) { box(2.2+i*2,.55,-83,1.5,1.1,1.5,structure); box(2.2+i*2,1.12,-83,1.5,.06,1.5,accent); }
  box(5,1.1,-119,5,2.2,1.6,surface); box(5,2.24,-119,5,.08,1.6,accent);

  const ambient = new THREE.HemisphereLight(0xffffff,0x31372a,1.7); scene.add(ambient);
  const daylight = new THREE.DirectionalLight(0xffffff,1.5); daylight.position.set(-4,8,8); scene.add(daylight);
  function setTheme(theme) {
    const light = theme === 'light';
    scene.background = new THREE.Color(light ? '#d5d5c6' : '#10140f');
    scene.fog = new THREE.Fog(light ? '#d5d5c6' : '#10140f', 15, 57);
    wall.color.set(light ? '#b6b9a9' : '#20251e');
    floor.color.set(light ? '#c8c9b9' : '#2b3027');
    structure.color.set(light ? '#92998a' : '#3b4135');
    surface.color.set(light ? '#777f70' : '#161a15');
    metal.color.set(light ? '#666e5f' : '#6c7560');
    ambient.intensity = light ? 2 : 1.45; daylight.intensity = light ? 1.55 : 1.1;
  }
  let requested = false, disposed = false;
  function loadGallery(onChange) {
    if (requested) return; requested = true;
    const loader = new THREE.TextureLoader();
    projectImages.forEach((url,i) => loader.load(url, texture => {
      if (disposed) { texture.dispose(); return; }
      texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 1; textures.add(texture);
      screenMats[i].map = texture; screenMats[i].color.set('#ffffff'); screenMats[i].needsUpdate = true; onChange();
    }, undefined, () => onChange()));
  }
  function dispose() {
    disposed = true;
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
    scene.remove(ambient,daylight);
  }
  return {setTheme,loadGallery,dispose};
}
