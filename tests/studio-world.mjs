import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createWorld } from '../src/studio/world.js';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){}})})};
const scene=new THREE.Scene();
const world=createWorld(scene);
for (const name of ['project-NOIRE','project-VELOR','project-ALEX']) {
  const screen=scene.getObjectByName(name);
  assert.ok(screen?.isMesh, `The studio needs a 3D display for ${name}`);
}
world.setTheme('dark'); const dark=scene.background.getHexString();
world.setTheme('light'); const light=scene.background.getHexString();
assert.notEqual(dark,light,'Light and dark studio materials must differ');
world.dispose();
console.log('PASS 3D scene contains three named exhibits and distinct themes (scene-graph simulation)');
