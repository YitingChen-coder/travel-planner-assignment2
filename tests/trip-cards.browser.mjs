// Uses the existing isolated Playwright Core / Chrome tooling.
import assert from "node:assert/strict";
import fs from "node:fs";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright-core");
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_EXECUTABLE || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const base = process.env.QA_BASE_URL || "http://localhost:3200";
const artifacts = process.env.QA_ARTIFACT_DIR || "/tmp/stage14-trip-cards";
fs.mkdirSync(artifacts, { recursive: true });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base + "/final-website");
    for (const [name, start, end] of [
      ["November pause 2026", "2026-11-01", "2026-11-03"],
      ["November pause 2027", "2027-11-01", "2027-11-03"],
      ["A journey into the new year", "2026-12-31", "2027-01-02"],
    ]) {
      await page.getByRole("button", { name: "+ New journey", exact: true }).click();
      await page.getByLabel("Trip name", { exact: true }).fill(name);
      await page.getByLabel("Start date", { exact: true }).fill(start);
      await page.getByLabel("End date", { exact: true }).fill(end);
      await page.getByRole("button", { name: "Create trip", exact: true }).click();
    }
    const tripsNav = page.getByRole("navigation", { name: "Main navigation" }).getByRole("button", { name: /Demo trips/ });
    await tripsNav.click();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
    });
    const stage = process.env.QA_CAPTURE_BEFORE ? "before" : "after";
    await page.screenshot({ path: `${artifacts}/${stage}-${width}.png`, fullPage: true });
    await page.screenshot({ path: `${artifacts}/${stage}-${width}-viewport.png` });
    if (process.env.QA_CAPTURE_BEFORE) {
      await page.close();
      continue;
    }
    const cards = page.getByRole("article");
    assert.equal(await cards.count(), 4);
    for (const [name, dates] of [
      ["A little mountain escape", "Nov 9 – Nov 11, 2026"],
      ["November pause 2026", "Nov 1 – Nov 3, 2026"],
      ["November pause 2027", "Nov 1 – Nov 3, 2027"],
      ["A journey into the new year", "Dec 31, 2026 – Jan 2, 2027"],
    ]) {
      const card = cards.filter({ has: page.getByRole("heading", { name, exact: true }) });
      const dateLine = card.getByText(dates, { exact: true });
      assert.equal(await dateLine.count(), 1);
      const metadata = card.getByText("3 days · Unhurried", { exact: true });
      const dateStyle = await dateLine.evaluate((e) => ({ size: parseFloat(getComputedStyle(e).fontSize), weight: parseInt(getComputedStyle(e).fontWeight), color: getComputedStyle(e).color }));
      const metaStyle = await metadata.evaluate((e) => ({ size: parseFloat(getComputedStyle(e).fontSize), weight: parseInt(getComputedStyle(e).fontWeight), color: getComputedStyle(e).color }));
      assert.ok(dateStyle.size > metaStyle.size);
      assert.ok(dateStyle.weight > metaStyle.weight);
      assert.notEqual(dateStyle.color, metaStyle.color);
      assert.equal(await card.getByText("3 days · Unhurried", { exact: true }).count(), 1);
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const buttons = cards.getByRole("button");
    await buttons.first().focus();
    await page.keyboard.press("Tab");
    assert.equal(await buttons.nth(1).evaluate((e) => e === document.activeElement), true);
    assert.notEqual(await buttons.nth(1).evaluate((e) => getComputedStyle(e).outlineStyle), "none");
    await page.keyboard.press("Enter");
    assert.equal(await page.locator("#workspace-title").innerText(), "November pause 2026");
    await tripsNav.click();
    await cards.filter({ has: page.getByRole("heading", { name: "A journey into the new year", exact: true }) }).getByRole("button").focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator("#workspace-title").innerText(), "A journey into the new year");
    assert.equal(await page.getByRole("tab").count(), 3);
    assert.deepEqual(errors, []);
    console.log(`PASS trip cards ${width}: years, cross-year dates, metadata, keyboard Tab/Enter/focus, no overflow`);
    await page.close();
  }
} finally {
  await browser.close();
}
