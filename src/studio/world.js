import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const buildingUrl = new URL('../../assets/aurevio-studio.glb', import.meta.url).href;
const projectImages = [
  new URL('../../assets/NOIRE.webp', import.meta.url).href,
  new URL('../../assets/VELOR.webp', import.meta.url).href,
  new URL('../../assets/portfolio.webp', import.meta.url).href
];

// Loads a single building; project images are attached to the physical gallery walls.
export async function createWorld(scene, onChange) {
  const gltf = await new GLTFLoader().loadAsync(buildingUrl);
  const building=gltf.scene;scene.add(building);
  const materials=new Set(), geometries=new Set(), textures=new Set(), screens=[];
  building.traverse(object=>{
    if (!object.isMesh) return;
    geometries.add(object.geometry);
    for(const material of (Array.isArray(object.material)?object.material:[object.material])) materials.add(material);
  });
  const screenGeometry=new THREE.PlaneGeometry(5.05,3.15);geometries.add(screenGeometry);
  for(const z of [-12,-19,-26]){
    const material=new THREE.MeshBasicMaterial({color:0x242a22});materials.add(material);
    const screen=new THREE.Mesh(screenGeometry,material);screen.position.set(-8.145,3,z);screen.rotation.y=Math.PI/2;building.add(screen);screens.push(material);
  }
  const ambient=new THREE.HemisphereLight(0xf1f2e6,0x414b3b,1.9);scene.add(ambient);
  const sun=new THREE.DirectionalLight(0xffffff,1.65);sun.position.set(-4,10,8);scene.add(sun);
  let disposed=false,requested=false;
  function setTheme(theme){
    const light=theme==='light';
    const colors=light?{Wall:'#bac1b5',Floor:'#aeb4a9',FloorAccent:'#c6c9b8',Panel:'#59635b',Metal:'#6f7a70',Wood:'#95765c',Charcoal:'#252e28',Glazing:'#60776d',Foliage:'#335b36'}:
      {Wall:'#3c4740',Floor:'#424d43',FloorAccent:'#566054',Panel:'#26312b',Metal:'#69776a',Wood:'#685143',Charcoal:'#161d18',Glazing:'#354a40',Foliage:'#28452e'};
    materials.forEach(material=>{if(colors[material.name] && material.color)material.color.set(colors[material.name]);});
    scene.background=new THREE.Color(light?'#c4ccc2':'#141c17');
    scene.fog=new THREE.Fog(light?'#c4ccc2':'#141c17',28,100);
    ambient.intensity=light?2.1:1.65;sun.intensity=light?1.7:1.2;onChange();
  }
  function loadGallery(){
    if(requested||disposed)return;requested=true;
    const loader=new THREE.TextureLoader();
    projectImages.forEach((url,i)=>loader.load(url,texture=>{
      if(disposed){texture.dispose();return;}
      texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=1;textures.add(texture);
      screens[i].map=texture;screens[i].color.set('#ffffff');screens[i].needsUpdate=true;onChange();
    },undefined,()=>onChange()));
  }
  function dispose(){
    if(disposed)return;disposed=true;scene.remove(building,ambient,sun);
    geometries.forEach(item=>item.dispose());materials.forEach(item=>item.dispose());textures.forEach(item=>item.dispose());
  }
  return {setTheme,loadGallery,dispose};
}
