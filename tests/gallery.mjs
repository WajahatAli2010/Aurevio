import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4175', '--strictPort']);
await new Promise((resolve, reject) => { server.stdout.on('data', data => { if (data.toString().includes('Local:')) resolve(); }); server.on('exit', code => reject(new Error(`Server exited: ${code}`))); });
const browser = await chromium.launch({headless: true, executablePath: process.env.AUREVIO_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader']});
try {
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto('http://127.0.0.1:4175/Aurevio/');
  assert.equal(await page.locator('canvas#gallery-scene').count(), 1, 'An architectural 3D scene must be present');
  await page.waitForFunction(() => document.querySelector('#gallery-scene').dataset.ready === 'true');
  const first = await page.locator('#gallery-scene').getAttribute('data-position');
  await page.locator('#packages').scrollIntoViewIfNeeded();
  await page.waitForFunction(old => document.querySelector('#gallery-scene').dataset.position !== old, first);
  assert.ok(await page.locator('#inquiry-form').isVisible());
  console.log('PASS gallery moves as the visitor navigates');
} finally {await browser.close(); server.kill();}
