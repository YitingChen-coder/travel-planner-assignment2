import assert from 'node:assert/strict';
import fs from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const base = process.env.QA_BASE_URL || 'http://localhost:3200';
const output = process.env.QA_ARTIFACT_DIR || '/tmp/assignment-component-states';
fs.mkdirSync(output, { recursive: true });
try {
  for (const width of [1440,390]) for (const direction of ['calm','arcade','editorial']) {
    const page = await browser.newPage({ viewport: { width, height:900 } });
    const errors=[];page.on('pageerror', e=>errors.push(e.message));
    await page.goto(`${base}/design-systems/${direction}`);
    await page.waitForLoadState('networkidle');
    const navigation=page.getByRole('navigation',{name:'Design-system sections'});
    assert.equal(await navigation.getByRole('link').count(),6);
    for (const target of ['colors','typography','geometry','actions','control-states','feedback']) assert.equal(await navigation.locator(`a[href="#${target}"]`).count(),1);
    const travel=page.locator('#travel');
    assert.equal(await travel.getByRole('button',{name:'Open trip details',exact:true}).count(),1);
    assert.equal(await travel.locator('li').count()>0,true);
    const open=travel.getByRole('button',{name:'Open trip details',exact:true});
    await open.click(); const dialog=page.getByRole('dialog');await dialog.waitFor();
    assert.equal(await dialog.getByRole('heading').count(),1);
    for(let i=0;i<5;i++){await page.keyboard.press('Tab');assert.equal(await dialog.evaluate(e=>e.contains(document.activeElement)),true);}
    await page.keyboard.press('Escape');assert.equal(await dialog.isVisible(),false);assert.equal(await open.evaluate(e=>e===document.activeElement),true);
    const gallery=page.locator('#control-states');
    assert.equal(await gallery.locator('[data-control]').count(),11);
    for (const kind of ['primary','secondary','link','input','select','textarea','checkbox','radio','switch','tab','chip']) {
      const row=gallery.locator(`[data-control="${kind}"]`);
      assert.equal(await row.locator('[data-preview="rest"]').count(),1);
      assert.equal(await row.locator('[data-preview="focus"]').count(),1);
      const disabled=row.locator('[data-preview="disabled"]');
      if(kind==='link') {assert.equal(await disabled.locator('a').count(),0);assert.equal(await disabled.locator('[aria-disabled]').count(),1);}
      else for (const control of await disabled.locator('button,input,select,textarea').all()) assert.equal(await control.isDisabled(),true);
    }
    const action=gallery.locator('[data-control="primary"] [data-preview="rest"] button');
    const appearance=control=>control.evaluate(e=>({shadow:getComputedStyle(e).boxShadow,transform:getComputedStyle(e).transform}));
    await action.scrollIntoViewIfNeeded();await page.mouse.move(0,0);const rest=await appearance(action);
    await action.hover();await page.waitForTimeout(180);const hover=await appearance(action);assert.notDeepEqual(hover,rest);
    await page.mouse.down();await page.waitForTimeout(180);assert.notDeepEqual(await appearance(action),hover);await page.mouse.up();
    const unavailable=gallery.locator('[data-control="primary"] [data-preview="disabled"] button');
    const disabledAppearance=await appearance(unavailable);await unavailable.hover({force:true});await page.waitForTimeout(180);assert.deepEqual(await appearance(unavailable),disabledAppearance);
    const chip=gallery.locator('[data-control="chip"] [data-preview="selected"] button');
    assert.equal(await chip.getAttribute('aria-pressed'),'true');await chip.click();assert.equal(await chip.getAttribute('aria-pressed'),'false');
    const toggle=gallery.locator('[data-control="switch"] [data-preview="rest"] button');
    await toggle.focus();await page.keyboard.press('Space');assert.equal(await toggle.getAttribute('aria-checked'),'true');
    assert.notEqual(await toggle.evaluate(e=>getComputedStyle(e).outlineStyle),'none');
    const tabs=gallery.locator('[data-control="tab"] [data-preview="rest"]');
    await tabs.getByRole('tab',{name:'Overview'}).focus();await page.keyboard.press('ArrowRight');
    assert.equal(await tabs.getByRole('tab',{name:'Itinerary'}).getAttribute('aria-selected'),'true');
    const demo=page.locator('[data-feedback-scenario]');const input=demo.getByLabel('Preview destination',{exact:true});
    assert.equal(await demo.locator('[data-result]').getAttribute('data-result'),'empty');
    await demo.screenshot({path:`${output}/${direction}-empty-${width}.png`});
    await demo.getByRole('button',{name:'Preview destination',exact:true}).click();
    assert.equal(await input.getAttribute('aria-invalid'),'true');assert.equal(await input.evaluate(e=>e===document.activeElement),true);
    await demo.screenshot({path:`${output}/${direction}-error-${width}.png`});
    await input.fill('Lake Braies');await demo.getByRole('button',{name:'Preview destination',exact:true}).click();
    assert.equal(await demo.locator('[data-result]').getAttribute('data-result'),'loading');assert.equal(await input.isDisabled(),true);
    await demo.screenshot({path:`${output}/${direction}-loading-${width}.png`});
    await demo.locator('[data-result="success"]').waitFor();assert.equal(await demo.getByRole('heading',{name:'Lake Braies'}).isVisible(),true);
    await demo.screenshot({path:`${output}/${direction}-success-${width}.png`});
    await demo.getByRole('button',{name:'Clear preview'}).click();assert.equal(await demo.locator('[data-result]').getAttribute('data-result'),'empty');
    for (const role of ['display','heading','body','label']) assert.match(await page.locator(`[data-role="${role}"] figcaption`).innerText(),/Source: \/(final-website|design-systems)/);
    await page.addScriptTag({path:process.cwd()+'/node_modules/axe-core/axe.min.js'});
    const violations=await page.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
    assert.deepEqual(violations,[]);assert.deepEqual(errors,[]);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await chip.click(); await toggle.click(); await tabs.getByRole('tab',{name:'Overview'}).click();
    await page.mouse.move(0,0);
    await page.locator('#colors').screenshot({path:`${output}/${direction}-colors-${width}.png`});
    await page.locator('#geometry').screenshot({path:`${output}/${direction}-geometry-${width}.png`});
    await gallery.screenshot({path:`${output}/${direction}-controls-${width}.png`});
    await page.locator('#typography').screenshot({path:`${output}/${direction}-type-${width}.png`});
    console.log(`PASS ${direction} ${width}: 11 real component state rows, disabled behavior, choice/keyboard, four feedback states, content sources, axe, overflow`);
    await page.close();
  }
} finally {await browser.close();}
