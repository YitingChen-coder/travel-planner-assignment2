// Browser tooling stays external; no product dependency is required.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const base = process.env.QA_BASE_URL || 'http://localhost:3200';
const output = process.env.QA_ARTIFACT_DIR || '/tmp/assignment-design-quality';
fs.mkdirSync(output, { recursive: true });
const reports = [];
async function appearance(control) {
  return control.evaluate(e => ({ background: getComputedStyle(e).backgroundColor, shadow: getComputedStyle(e).boxShadow, outline: getComputedStyle(e).outlineStyle }));
}
try {
  for (const width of [1440, 390]) {
    for (const direction of ['calm', 'arcade', 'editorial']) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      await page.goto(`${base}/design-systems/${direction}`);
      const toggle = page.locator('#forms').getByRole('switch');
      await toggle.scrollIntoViewIfNeeded(); await page.mouse.move(0, 0);
      const rest = await appearance(toggle); await toggle.hover();
      const hover = await appearance(toggle);
      assert.notDeepEqual(hover, rest, `${direction}: switch hover must be visible`);
      await page.mouse.down(); const pressed = await appearance(toggle);
      assert.notDeepEqual(pressed, hover, `${direction}: switch press must be visible`);
      await page.mouse.move(0, 0); await page.mouse.up();
      await toggle.focus(); await page.keyboard.press('Space');
      assert.equal(await toggle.getAttribute('aria-checked'), 'true');
      assert.notEqual((await appearance(toggle)).outline, 'none');
      await page.getByLabel('Disable reminder control').check();
      assert.equal(await toggle.isDisabled(), true);
      const disabled = await appearance(toggle); await toggle.hover({ force: true });
      assert.deepEqual(await appearance(toggle), disabled);
      await page.getByLabel('Disable reminder control').uncheck();

      const originalCard = page.locator('#travel').getByRole('heading', { name: direction === 'calm' ? 'Three days, unhurried' : direction === 'arcade' ? 'Tokyo night quest' : 'Liguria, in three acts', exact: true });
      await page.getByRole('button', { name: 'Remove trip', exact: true }).click();
      assert.equal(await originalCard.count(), 0, 'removal replaces the card, rather than relabeling it');
      await page.waitForFunction(() => document.activeElement?.textContent === 'Restore trip');
      await page.getByRole('button', { name: 'Restore trip', exact: true }).click();
      assert.equal(await originalCard.isVisible(), true);
      // Undo mounts a new card; focus is restored on its next animation frame.
      await page.waitForFunction(() => document.activeElement?.textContent === 'Open trip details');

      const sample = page.locator(`#${direction}-sample-select`);
      assert.equal(await sample.getAttribute('aria-invalid'), 'true');
      const errorBorder = await sample.evaluate(e => getComputedStyle(e).borderColor);
      await sample.hover();
      assert.equal(await sample.evaluate(e => getComputedStyle(e).borderColor), errorBorder, 'invalid fields retain error borders on hover');
      await sample.selectOption('Autumn'); assert.equal(await sample.getAttribute('aria-invalid'), 'false');
      const note = page.locator(`#${direction}-sample-notes`);
      await note.fill('A place to pause'); assert.equal(await note.getAttribute('aria-invalid'), 'false');
      const preview = page.getByRole('button', { name: 'Preview loading', exact: true });
      await preview.click();
      assert.equal(await page.getByRole('button', { name: 'Preparing preview…', exact: true }).isDisabled(), true);
      await page.locator('#feedback').screenshot({ path: `${output}/system-${direction}-loading-${width}.png` });
      await page.getByText('Preview ready. No network request was made.', { exact: true }).waitFor();

      if (direction === 'arcade') {
        const gate = page.getByRole('button', { name: 'Enter bonus experience', exact: true });
        assert.equal(await gate.isDisabled(), true);
        for (const name of ['Visit the market', 'Find the lantern lane', 'Hear a street performance']) await page.locator('#travel').getByLabel(name).check();
        assert.equal(await page.locator('#arcade-quest-xp').getAttribute('value'), '1000');
        assert.equal(await gate.isEnabled(), true);
        await gate.click(); assert.equal(await page.getByText('Bonus experience entered', { exact: true }).isVisible(), true);
        await page.getByRole('button', { name: 'Reset quest', exact: true }).click();
        assert.equal(await gate.isDisabled(), true);
        assert.equal(await page.locator('#arcade-quest-xp').getAttribute('value'), '720');
      }
      if (direction === 'editorial') {
        await page.getByRole('button', { name: 'Read The harbor at first light', exact: true }).click();
        assert.equal(await page.locator('#editorial-essay-title').innerText(), 'The harbor at first light');
        await page.getByRole('button', { name: 'Bookmark essay', exact: true }).click();
        assert.equal(await page.getByRole('button', { name: 'Bookmark essay', exact: true }).getAttribute('aria-pressed'), 'true');
        await page.getByRole('button', { name: 'Next chapter', exact: true }).click();
        assert.match(await page.locator('#editorial-reading-position').innerText(), /Chapter 2 of 3/);
      }
      for (const section of ['colors','typography','geometry','actions','forms','travel','feedback']) await page.locator(`#${section}`).screenshot({ path: `${output}/system-${direction}-${section}-${width}.png` });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.deepEqual(errors, []);
      await page.close();
    }
    for (const route of ['/', '/mood-boards/calm', '/mood-boards/arcade', '/mood-boards/editorial', '/design-systems/calm', '/design-systems/arcade', '/design-systems/editorial', '/final-website']) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('requestfailed', r => errors.push(r.url()));
      page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
      assert.equal((await page.goto(base + route)).status(), 200);
      if (route.includes('/mood-boards/')) {
        const direction = route.split('/').pop();
        const figures = direction === 'calm' ? page.locator('.mood-piece') : direction === 'arcade' ? page.locator('figure').filter({ has: page.locator('.arcade-piece-tag') }) : page.locator('figure');
        assert.equal(await figures.count(), 28);
        for (let i = 0; i < 28; i++) {
          const figure = figures.nth(i); await figure.scrollIntoViewIfNeeded();
          await figure.evaluate(async e => { await Promise.all([...e.querySelectorAll('img')].map(im => im.decode())); });
          const clippedCaption = await figure.evaluate(e => {
            const bounds = e.getBoundingClientRect();
            const caption = e.querySelector('figcaption');
            if (!caption || getComputedStyle(caption).display === 'none') return false;
            return caption.getBoundingClientRect().bottom > bounds.bottom + 1;
          });
          assert.equal(clippedCaption, false, `${direction} #${i + 1}: caption clipped`);
          await figure.screenshot({ path: `${output}/${direction}-${String(i + 1).padStart(2,'0')}-${width}.png` });
        }
      }
      for (const img of await page.locator('img').all()) { await img.scrollIntoViewIfNeeded(); await img.evaluate(e => e.decode()); }
      await page.addScriptTag({ path: process.cwd() + '/node_modules/axe-core/axe.min.js' });
      const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa'] } })).violations.map(v => ({ id:v.id, nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})) })));
      assert.deepEqual(violations, [], `${route} ${width}: accessibility`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${route} ${width}: overflow`);
      assert.deepEqual(errors, [], `${route} ${width}: application requests`);
      await page.evaluate(() => scrollTo(0,0)); await page.mouse.click(1,1); await page.keyboard.press('Tab');
      assert.notEqual(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle), 'none');
      const slug = route === '/' ? 'hub' : route.slice(1).replaceAll('/','-');
      await page.screenshot({ path: `${output}/${slug}-${width}.png`, fullPage: true });
      reports.push({route,width,violations,errors}); await page.close();
    }
    console.log(`PASS ${width}: eight routes, 84 artifacts, three libraries, keyboard, states, axe, overflow`);
  }
} finally { fs.writeFileSync(`${output}/report.json`, JSON.stringify(reports,null,2)); await browser.close(); }
