import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
assert.ok(existsSync(new URL('../src/studio/route.js', import.meta.url)), 'The studio route must exist');
const { sampleRoute } = await import('../src/studio/route.js');
const stops = [
  { scroll: 0, position: [0, 2, 10], target: [0, 2, 0] },
  { scroll: 100, position: [2, 2, -10], target: [1, 2, -20] },
  { scroll: 300, position: [-2, 3, -30], target: [-1, 2, -40] }
];
assert.deepEqual(sampleRoute(stops, -20), {position: [0, 2, 10], target: [0, 2, 0]});
assert.deepEqual(sampleRoute(stops, 100), {position: [2, 2, -10], target: [1, 2, -20]});
assert.deepEqual(sampleRoute(stops, 50), {position: [1, 2, 0], target: [.5, 2, -10]});
assert.deepEqual(sampleRoute(stops, 400), {position: [-2, 3, -30], target: [-1, 2, -40]});
assert.deepEqual(sampleRoute([], 0), null);
console.log('PASS studio route interpolates and clamps camera positions');
