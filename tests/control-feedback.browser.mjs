// Uses the existing isolated Playwright Core and Chrome test tooling.
import assert from "node:assert/strict";
import fs from "node:fs";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright-core");
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_EXECUTABLE || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const base = process.env.QA_BASE_URL || "http://localhost:3200";
const artifacts = process.env.QA_ARTIFACT_DIR || "/tmp/final-control-feedback";
const before = !!process.env.QA_CAPTURE_BEFORE;
fs.mkdirSync(artifacts, { recursive: true });
async function style(control) {
  return control.evaluate((e) => {
    const s = getComputedStyle(e), r = e.getBoundingClientRect();
    return { background: s.backgroundColor, color: s.color, shadow: s.boxShadow, decoration: s.textDecorationLine, thickness: s.textDecorationThickness, outline: s.outlineStyle, width: r.width, height: r.height };
  });
}
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    await page.goto(base + "/final-website");
    async function feedback(control, name, { selected = false, hover = true } = {}) {
      await page.mouse.move(1, 1);
      await control.scrollIntoViewIfNeeded();
      const rest = await style(control);
      await control.hover();
      const hovered = await style(control);
      await page.screenshot({ path: `${artifacts}/${before ? "before" : "after"}-${name}-hover-${width}.png` });
      await page.mouse.down();
      const pressed = await style(control);
      await page.screenshot({ path: `${artifacts}/${before ? "before" : "after"}-${name}-pressed-${width}.png` });
      // Release outside the target so testing the pressed state doesn't activate it.
      await page.mouse.move(1, 1);
      await page.mouse.up();
      if (!before) {
        if (hover) assert.notDeepEqual([hovered.background, hovered.shadow, hovered.thickness, hovered.decoration], [rest.background, rest.shadow, rest.thickness, rest.decoration], `${name} hover feedback`);
        assert.notDeepEqual([pressed.background, pressed.shadow, pressed.thickness], [hovered.background, hovered.shadow, hovered.thickness], `${name} pressed feedback`);
        assert.equal(pressed.width, rest.width);
        assert.equal(pressed.height, rest.height);
        if (selected) {
          assert.equal(hovered.background, rest.background);
          assert.equal(pressed.background, rest.background);
          assert.equal(pressed.color, rest.color);
        }
        if (await control.getAttribute("role") === "tab" && await control.getAttribute("aria-selected") === "false") {
          // In a roving tablist, arrow keys reach unselected tabs; Tab skips them.
          await page.getByRole("tab").first().focus();
          await page.keyboard.press("ArrowRight");
        } else {
          await control.focus();
          await page.keyboard.press("Tab");
          await page.keyboard.press("Shift+Tab");
        }
        assert.equal(await control.evaluate((e) => e === document.activeElement), true);
        assert.notEqual((await style(control)).outline, "none");
      }
    }
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await feedback(nav.getByRole("button", { name: /Demo trips/ }), "navigation");
    await feedback(page.getByRole("link", { name: /Find your somewhere/ }), "text-link");
    await feedback(page.getByRole("button", { name: /Try a three-day demo/ }), "demo-link");
    await feedback(page.getByRole("button", { name: "Plan this trip: The Dolomites", exact: true }), "destination");
    await page.getByRole("button", { name: /Try a three-day demo/ }).click();
    await feedback(page.getByRole("button", { name: "Edit overall budget", exact: true }), "text-button");
    await feedback(page.getByRole("tab").first(), "selected-day", { selected: true });
    await feedback(page.getByRole("tab").nth(1), "day");
    await feedback(page.getByRole("button", { name: "Discover", exact: true }).nth(1), "breadcrumb");
    await feedback(page.locator("footer").getByRole("button", { name: "Discover", exact: true }), "footer");
    await page.getByRole("tab").first().click();
    const disabled = page.getByRole("button", { name: "Move A morning by Lake Braies up", exact: true });
    const disabledRest = await style(disabled);
    await disabled.hover({ force: true });
    assert.deepEqual(await style(disabled), disabledRest);
    assert.equal(await disabled.isDisabled(), true);
    await page.getByRole("tab").first().focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await page.getByRole("tab").nth(1).getAttribute("aria-selected"), "true");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: `${artifacts}/${before ? "before" : "after"}-workspace-${width}.png`, fullPage: true });
    await nav.getByRole("button", { name: /Demo trips/ }).click();
    const staticDate = page.getByText("Nov 9 – Nov 11, 2026", { exact: true });
    const dateRest = await style(staticDate);
    await staticDate.hover();
    assert.deepEqual(await style(staticDate), dateRest);
    assert.notEqual(await staticDate.evaluate((e) => getComputedStyle(e).cursor), "pointer");
    assert.deepEqual(errors, []);
    console.log(`PASS ${before ? "baseline" : "feedback"} ${width}: hover/press, focus, selected/disabled states, static dates, unchanged dimensions, no overflow`);
    await page.close();
  }
} finally { await browser.close(); }
