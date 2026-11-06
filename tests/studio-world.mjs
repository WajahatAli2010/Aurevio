import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
const data=fs.readFileSync(new URL('../assets/aurevio-studio.glb',import.meta.url));
assert.equal(data.toString('ascii',0,4),'glTF');assert.equal(data.readUInt32LE(4),2);
const length=data.readUInt32LE(12),json=JSON.parse(data.subarray(20,20+length)),names=json.nodes.map(node=>node.name);
for(const name of ['Studio_Wall','Studio_Floor','Studio_Wood','Studio_Foliage'])assert.ok(names.includes(name),`Missing building feature ${name}`);
assert.ok(names.filter(name=>name.startsWith('gallery display')).length>=3,'Three project display structures are required');
assert.ok(data.length<500_000,'The building model must remain lightweight');
const buffer=data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength);
const model=await new Promise((resolve,reject)=>new GLTFLoader().parse(buffer,'',resolve,reject));model.scene.updateMatrixWorld(true);
for(const [name,z] of [['gallery_display',-12],['gallery_display001',-19],['gallery_display002',-26]]){
  const mesh=model.scene.getObjectByName(name);assert.ok(mesh,`Missing ${name}`);
  const center=new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
  assert.ok(Math.abs(center.x+8.23)<.02&&Math.abs(center.z-z)<.02,`${name} does not align with its project texture`);
}
console.log('PASS studio GLB loads with rooms, furnishings and three aligned project displays');
