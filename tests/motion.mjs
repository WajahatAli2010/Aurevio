import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4174', '--strictPort']);
await new Promise((resolve, reject) => {
  server.stdout.on('data', data => { if (data.toString().includes('Local:')) resolve(); });
  server.on('exit', code => reject(new Error(`Preview exited: ${code}`)));
});
let browser, failures = 0;
const url = 'http://127.0.0.1:4174/Aurevio/';
async function check(name, fn) {
  try { await fn(); console.log(`PASS ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}: ${error.message}`); }
}
try {
  browser = await chromium.launch({ executablePath: process.env.AUREVIO_CHROMIUM_PATH,
    args: process.env.AUREVIO_CHROMIUM_PATH ? ['--no-sandbox', '--disable-dev-shm-usage'] : [] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url);
  await check('all nine sections settle to visible content after scrolling', async () => {
    const sections = page.locator('main > section:not(.signal-band)');
    assert.equal(await sections.count(), 9);
    for (const section of await sections.all()) {
      await section.scrollIntoViewIfNeeded();
      // Every marked item is visited, including content below a tall section's fold.
      for (const target of await section.locator('.reveal, .fact-row, .skill-column > div').all()) {
        await target.scrollIntoViewIfNeeded();
        await target.evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(a => a.finished.catch(() => {}))));
      }
    }
    await page.waitForTimeout(900); // Longest entrance + bounded stagger.
    assert.ok(await page.locator('.reveal, .fact-row, .skill-column > div').evaluateAll(items => items.every(el => {
      const s = getComputedStyle(el); return s.opacity === '1' && s.visibility === 'visible' && s.transform === 'none';
    })));
    assert.deepEqual(errors, []);
  });
  await check('FAQ animates in both directions, survives interruption and keyboard use', async () => {
    const item = page.locator('.faq-item').first(), summary = item.locator('summary');
    await summary.scrollIntoViewIfNeeded();
    await summary.click();
    assert.ok(await item.evaluate(el => el.open && el.getAnimations().length > 0));
    await page.waitForTimeout(300);
    assert.ok(await item.evaluate(el => el.open && !el.style.height && !el.style.overflow));
    await summary.focus(); await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    assert.equal(await item.evaluate(el => el.open), false);
    await summary.click({ force: true });
    await page.waitForTimeout(60);
    await summary.click({ force: true });
    await page.waitForTimeout(60);
    await summary.click({ force: true });
    await page.waitForTimeout(300);
    assert.ok(await item.evaluate(el => el.open && !el.style.height));
    await summary.click();
    await page.setViewportSize({ width: 1024, height: 900 });
    assert.ok(await item.evaluate(el => !el.open && !el.style.height && !el.style.overflow));
  });
  await check('form validation and busy/status feedback preserve truthful Instagram handoff', async () => {
    await page.locator('.inquiry-submit').scrollIntoViewIfNeeded();
    await page.locator('.inquiry-submit').click();
    assert.equal(await page.locator('[name="name"]').getAttribute('aria-invalid'), 'true');
    await page.getByLabel('Name', { exact: true }).fill('Motion test');
    await page.getByLabel('Business / project').fill('Local test only');
    await page.getByLabel('Contact', { exact: true }).fill('test@example.com');
    await page.getByLabel('What do you need?').selectOption('Landing page');
    await page.getByLabel('Project brief').fill('Testing the existing clipboard workflow.');
    await page.evaluate(() => {
      window.testOpened = [];
      window.open = url => { window.testOpened.push(url); return null; };
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
        writeText: text => { window.testBrief = text; return new Promise(resolve => { window.testCopyDone = resolve; }); }
      }});
    });
    await page.locator('.inquiry-submit').click();
    assert.equal(await page.locator('.inquiry-submit').getAttribute('aria-busy'), 'true');
    assert.equal(await page.locator('.inquiry-submit').isDisabled(), true);
    await page.evaluate(() => window.testCopyDone());
    await page.waitForFunction(() => !document.querySelector('.inquiry-submit').disabled);
    assert.match(await page.locator('#inquiry-status').innerText(), /Inquiry copied\. Paste/);
    assert.equal(await page.locator('[name="name"]').getAttribute('aria-invalid'), 'false');
    assert.deepEqual(await page.evaluate(() => window.testOpened), ['https://instagram.com/lilwebypants']);
    assert.match(await page.evaluate(() => window.testBrief), /Service: Landing page/);
    await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('Clipboard denied')); });
    await page.locator('.inquiry-submit').click();
    await page.waitForFunction(() => !document.querySelector('.inquiry-submit').disabled);
    assert.match(await page.locator('#inquiry-status').innerText(), /Copy the details/);
    assert.doesNotMatch(await page.locator('#inquiry-status').innerText(), /DM (?:was )?sent/i);
  });
  await check('switching to reduced motion cancels active animations and restores images', async () => {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.locator('.project-main').scrollIntoViewIfNeeded();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length), 0);
    assert.ok(await page.locator('.project-image').evaluateAll(items => items.every(el => !el.style.getPropertyValue('--project-shift'))));
    const summary = page.locator('.faq-item summary').first();
    await summary.click();
    assert.ok(await summary.evaluate(el => el.parentElement.open && !el.parentElement.style.height));
  });
  await check('observer unavailable still leaves every original reveal readable', async () => {
    const fallback = await browser.newPage();
    await fallback.addInitScript(() => { delete window.IntersectionObserver; });
    await fallback.goto(url);
    assert.ok(await fallback.locator('.reveal').evaluateAll(items => items.every(el => getComputedStyle(el).opacity === '1')));
    await fallback.close();
  });
  await check('reveals start before entry, settle after fast scrolling and never replay', async () => {
    const scroll = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
      await scroll.goto(url);
      const card = scroll.locator('.package').first();
      await card.evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight - 80, behavior: 'instant' }));
      await scroll.waitForFunction(() => document.querySelector('.package').getAnimations().length > 0);
      assert.ok(await card.evaluate(el => {
        const a = el.getAnimations()[0];
        return el.getBoundingClientRect().top >= innerHeight && a.effect.getTiming().delay === 0;
      }), 'A card should start before reaching the viewport, without waiting');
      await scroll.locator('#contact').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
      await scroll.waitForFunction(() => document.querySelector('.package').getAnimations().length === 0);
      await card.evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
      await scroll.waitForTimeout(100);
      assert.ok(await card.evaluate(el => !el.getAnimations().length && getComputedStyle(el).opacity === '1'));
      assert.ok(await scroll.locator('.project-image').evaluateAll(items => items.every(el => !el.style.getPropertyValue('--project-shift'))));
    } finally { await scroll.close(); }
  });
  await check('a direct contact jump never fades already-visible content backwards', async () => {
    const jump = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
      await jump.goto(url + '#contact');
      await jump.waitForTimeout(100);
      assert.ok(await jump.locator('#contact .reveal').evaluateAll(items => items.every(el => {
        const r = el.getBoundingClientRect();
        return r.top >= innerHeight || r.bottom <= 0 || (getComputedStyle(el).opacity === '1' && !el.getAnimations().length);
      })));
    } finally { await jump.close(); }
  });
  for (const width of [390, 768, 1440]) for (const theme of ['light', 'dark']) {
    await check(`${width}px ${theme} motion/touch layout and theme persistence`, async () => {
      const touch = width < 1000;
      const screen = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: touch, isMobile: touch });
      await screen.addInitScript(t => localStorage.setItem('aurevio-theme', t), theme);
      await screen.goto(url);
      for (const target of await screen.locator('#packages, #contact').all()) await target.scrollIntoViewIfNeeded();
      await screen.waitForTimeout(900);
      assert.ok(await screen.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert.equal(await screen.locator('html').getAttribute('data-theme'), theme);
      await screen.locator('.theme-toggle')[touch ? 'tap' : 'click']();
      assert.equal(await screen.locator('html').getAttribute('data-theme'), theme === 'dark' ? 'light' : 'dark');
      if (touch) {
        await screen.locator('.nav-toggle').tap();
        await screen.locator('#site-nav a[href="#packages"]').tap();
        assert.equal(await screen.locator('.nav-toggle').getAttribute('aria-expanded'), 'false');
        await screen.locator('[data-service="Redesign"]').tap();
        assert.equal(await screen.locator('[name="service"]').inputValue(), 'Redesign');
        assert.ok(await screen.locator('.project-image').evaluateAll(items => items.every(el => !el.style.getPropertyValue('--project-shift'))));
      }
      await screen.close();
    });
  }
  assert.deepEqual(errors, []);
} finally { await browser?.close(); server.kill(); }
process.exitCode = failures ? 1 : 0;
