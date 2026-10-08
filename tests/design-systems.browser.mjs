// Optional real-browser regression suite. Keep browser tooling outside the project:
// PLAYWRIGHT_MODULE=/path/to/playwright-core/index.mjs node tests/design-systems.browser.mjs
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const base = process.env.QA_BASE_URL || 'http://localhost:3100';
try {
for (const direction of ['calm', 'arcade', 'editorial']) {
 for (const [width, height] of [[1440,900],[768,1024],[390,844],[320,700]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  assert.equal((await page.goto(`${base}/design-systems/${direction}`)).status(),200);
  const input=page.locator(`#${direction}-destination`), form=page.locator('form');
  await page.locator('#actions button').first().click(); assert.equal(await input.evaluate(e=>e===document.activeElement),true);
  await form.locator('button').click(); assert.equal(await input.getAttribute('aria-invalid'),'true');
  await input.fill('A'); await form.locator('button').click(); assert.equal(await input.getAttribute('aria-invalid'),'true');
  await input.fill('Kyoto'); await page.locator(`#${direction}-notes`).fill('A quiet market morning');
  await page.locator(`#${direction}-season`).selectOption('Winter');
  await page.getByLabel('Keep my dates flexible').uncheck(); await page.getByLabel('Balanced',{exact:true}).check();
  assert.equal(await page.getByLabel(/Shared trip access/).isDisabled(),true);
  assert.equal(await page.locator(`#${direction}-disabled`).isDisabled(),true);
  const toggle=page.getByRole('switch'); await toggle.focus(); await page.keyboard.press('Space'); assert.equal(await toggle.getAttribute('aria-checked'),'true');
  await form.locator('button').click(); assert.equal(await input.getAttribute('aria-invalid'),'false');
  assert.match(await page.locator('#actions [role=status]').innerText(),/Kyoto.*Winter, balanced.*fixed/);
  const tabs=page.getByRole('tab'); await tabs.first().focus(); await page.keyboard.press('ArrowRight'); assert.equal(await tabs.nth(1).getAttribute('aria-selected'),'true');
  await page.keyboard.press('End'); assert.equal(await tabs.nth(2).getAttribute('aria-selected'),'true');
  assert.match(await page.getByRole('tabpanel').innerText(),/quiet market/);
  await page.keyboard.press('Home'); await page.keyboard.press('ArrowLeft'); assert.equal(await tabs.nth(2).getAttribute('aria-selected'),'true');
  await page.keyboard.press('Tab'); assert.equal(await page.getByRole('tabpanel').evaluate(e=>e===document.activeElement),true);
  await page.getByRole('button',{name:'Nature',exact:true}).click();
  assert.match(await page.getByText('No interests selected.',{exact:false}).innerText(),/No interests selected/);
  await page.getByRole('button',{name:'Food',exact:true}).click(); assert.equal(await page.getByText('Food: Local market',{exact:true}).count(),1);
  await page.getByRole('button',{name:'Remove trip',exact:true}).click(); assert.equal(await page.getByRole('button',{name:'Remove trip',exact:true}).isDisabled(),true);
  await page.getByRole('button',{name:'Restore trip',exact:true}).click(); assert.equal(await page.getByRole('button',{name:'Remove trip',exact:true}).isEnabled(),true);
  const open=page.getByRole('button',{name:'Open trip details',exact:true}), dialog=page.locator('dialog');
  for(const mode of ['close','escape','backdrop']) {
   await open.click(); assert.equal(await dialog.isVisible(),true); assert.equal(await page.getByRole('button',{name:'Close',exact:true}).evaluate(e=>e===document.activeElement),true);
   await page.keyboard.press('Tab'); assert.equal(await dialog.evaluate(e=>e.contains(document.activeElement) || document.activeElement === document.body),true);
   await page.keyboard.press('Tab'); assert.equal(await dialog.evaluate(e=>e.contains(document.activeElement)),true);
   const bounds=await dialog.boundingBox(); await page.mouse.click(bounds.x+4,bounds.y+4); assert.equal(await dialog.isVisible(),true);
   if(mode==='close') await page.getByRole('button',{name:'Close',exact:true}).click();
   if(mode==='escape') await page.keyboard.press('Escape');
   if(mode==='backdrop') await page.mouse.click(2,2);
   assert.equal(await dialog.isVisible(),false); assert.equal(await open.evaluate(e=>e===document.activeElement),true);
  }
  for(const name of ['Add a destination','Review destination']) {await page.getByRole('button',{name,exact:true}).click();assert.equal(await input.evaluate(e=>e===document.activeElement),true);}
  await page.getByRole('button',{name:'Reset form',exact:true}).click(); assert.equal(await input.inputValue(),'');assert.equal(await page.locator(`#${direction}-notes`).inputValue(),'');assert.equal(await page.locator(`#${direction}-season`).inputValue(),'Autumn');
  await page.locator('nav a[href="#travel"]').click(); assert.equal(new URL(page.url()).hash,'#travel');
  await input.fill('Destination'.repeat(40)); await page.locator(`#${direction}-notes`).fill('Longnote'.repeat(80));await form.locator('button').click();await tabs.nth(2).click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${direction} ${width}: overflow`);
  await open.click(); assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true); await page.keyboard.press('Escape');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('#actions button').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  assert.deepEqual(errors,[]);console.log(`PASS ${direction} ${width}x${height}: interactions, keyboard, modal, overflow, reduced motion`);await page.close();
 }
}
for(const route of ['','/design-systems/calm','/design-systems/arcade','/design-systems/editorial','/mood-boards/calm','/mood-boards/arcade','/mood-boards/editorial']) {const page=await browser.newPage();assert.equal((await page.goto(base+route)).status(),200);await page.close();}
} finally { await browser.close(); }
