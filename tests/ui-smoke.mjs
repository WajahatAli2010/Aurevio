import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
const server = process.env.AUREVIO_TEST_URL ? null : spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort']);
if (server) await new Promise((resolve, reject) => { server.stdout.on('data', data => { if (data.toString().includes('Local:')) resolve(); }); server.on('exit', code => reject(new Error(`Preview exited: ${code}`))); });

const base = process.env.AUREVIO_TEST_URL || 'http://127.0.0.1:4173/Aurevio/';
const browser = await chromium.launch({ headless: true, executablePath: process.env.AUREVIO_CHROMIUM_PATH, args: process.env.AUREVIO_CHROMIUM_PATH ? ["--no-sandbox", "--disable-dev-shm-usage"] : [] });
let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`PASS ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}: ${error.message}`); }
}
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(5000);
  await page.goto(base);
  await check('packages open the matching inquiry without losing entered details', async () => {
    await page.getByLabel('Name', { exact: true }).fill('Test visitor');
    for (const service of ['Landing page', 'Business website', 'Redesign']) {
      const link = page.getByRole('link', { name: `Discuss ${service.toLowerCase()}`, exact: true });
      assert.equal(await link.count(), 1, `Missing actionable package: ${service}`);
      await link.click();
      assert.equal(await page.getByLabel('What do you need?').inputValue(), service);
      assert.equal(await page.getByLabel('Name', { exact: true }).inputValue(), 'Test visitor');
      assert.equal(new URL(page.url()).hash, '#contact');
    }
  });
  await check('navigation follows section order, clears header and identifies the active section', async () => {
    const links = page.locator('#site-nav a');
    const targets = await links.evaluateAll(nodes => nodes.map(a => a.getAttribute('href')));
    assert.deepEqual(targets, ['#work', '#practice', '#why', '#packages', '#about', '#faq', '#contact']);
    for (const target of targets) {
      await page.locator(`#site-nav a[href="${target}"]`).click();
      await page.waitForFunction(id => document.querySelector(`#site-nav a[href="${id}"]`).getAttribute('aria-current') === 'location', target);
      const clear = await page.locator(target).evaluate(el => el.getBoundingClientRect().top >= document.querySelector('.site-header').getBoundingClientRect().bottom - 1);
      assert.ok(clear, `${target} hidden behind the fixed header`);
    }
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await check('mobile navigation opens, closes with Escape and returns focus', async () => {
    const toggle = page.getByRole('button', { name: 'Open navigation', exact: true });
    await toggle.click();
    await page.getByRole('link', { name: /Packages/ }).focus();
    await page.keyboard.press('Escape');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    assert.ok(await toggle.evaluate(el => el === document.activeElement));
    assert.equal(await page.locator('#site-nav').isVisible(), false);
  });
  await check('mobile navigation closes after selecting a destination and survives resize', async () => {
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await page.locator('#site-nav a[href="#packages"]').click();
    assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'), 'false');
    await page.setViewportSize({ width: 1440, height: 960 });
    assert.ok(await page.locator('#site-nav').isVisible());
    assert.equal(await page.locator('#site-nav').getAttribute('inert'), null);
  });
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => localStorage.setItem('aurevio-theme', theme), theme);
    for (const width of [320, 390, 601, 768, 1024, 1101, 1440]) {
      await check(`${theme} layout at ${width}px has loaded images and no horizontal overflow`, async () => {
        await page.setViewportSize({ width, height: 960 });
        await page.reload();
        for (const image of await page.locator('img').all()) await image.scrollIntoViewIfNeeded();
        await page.waitForFunction(() => [...document.images].every(image => image.complete));
        const sizes = await page.evaluate(() => ({ width: innerWidth, body: document.body.scrollWidth, html: document.documentElement.scrollWidth }));
        assert.ok(sizes.body <= sizes.width + 1 && sizes.html <= sizes.width + 1, JSON.stringify(sizes));
        const images = await page.locator('img').evaluateAll(nodes => nodes.every(img => img.naturalWidth > 0));
        assert.ok(images, 'An image failed to load');
      });
    }
  }
  await check('mobile navigation and main content remain available without JavaScript', async () => {
    const noJs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    await noJs.goto(base);
    assert.ok(await noJs.locator('#site-nav').isVisible(), 'Navigation hidden without JavaScript');
    assert.ok(await noJs.locator('#hero-title').isVisible());
    await noJs.close();
  });
} finally { await browser.close(); server?.kill(); }
process.exitCode = failures ? 1 : 0;
