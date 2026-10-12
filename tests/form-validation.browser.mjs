// Invalid select values and oversized notes are injected to exercise defensive
// validation; ordinary UI options/maxLength normally prevent these values.
import assert from "node:assert/strict";
import fs from "node:fs";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright-core");
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_EXECUTABLE || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const base = process.env.QA_BASE_URL || "http://localhost:3200";
const artifacts = process.env.QA_ARTIFACT_DIR || "/tmp/stage15-form-validation";
const before = !!process.env.QA_CAPTURE_BEFORE;
fs.mkdirSync(artifacts, { recursive: true });
async function invalidSelect(field, value) {
  await field.evaluate((select, value) => {
    const option = new Option("Invalid test choice", value);
    select.add(option);
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}
async function oversizedNotes(field) {
  await field.evaluate((textarea) => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set.call(textarea, "x".repeat(1001));
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const field = (name) => page.getByLabel(name, { exact: true });
    async function shot(name) {
      await page.screenshot({ path: `${artifacts}/${before ? "before" : "after"}-${name}-${width}.png` });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.equal(await page.locator("dialog").evaluate((d) => d.scrollWidth <= d.clientWidth), true);
    }
    async function check(names, first) {
      if (before) return;
      assert.equal(await field(first).evaluate((e) => e === document.activeElement), true);
      const colors = [];
      for (const name of names) {
        const control = field(name);
        assert.equal(await control.getAttribute("aria-invalid"), "true");
        const help = await control.getAttribute("aria-describedby");
        assert.ok(help);
        const message = page.locator(`#${help}`);
        assert.ok((await message.innerText()).trim());
        const style = await control.evaluate((e) => ({ border: getComputedStyle(e).borderTopWidth, color: getComputedStyle(e).borderTopColor }));
        assert.equal(style.border, "2px");
        assert.equal(style.color, await message.evaluate((e) => getComputedStyle(e).color));
        colors.push(style.color);
      }
      assert.equal(new Set(colors).size, 1);
      assert.notEqual(await field(first).evaluate((e) => getComputedStyle(e).outlineStyle), "none");
    }
    await page.goto(base + "/final-website");
    const newTrip = page.getByRole("button", { name: "+ New journey", exact: true });
    await newTrip.click();
    await field("Start date").fill("2026-11-01");
    await field("End date").fill("2026-11-03");
    await invalidSelect(field("Travel pace"), "Unknown");
    await field("Overall budget (USD)").fill("0.001");
    await page.getByRole("button", { name: "Create trip", exact: true }).click();
    await check(["Travel pace", "Overall budget (USD)"], "Travel pace");
    await shot("trip-create");
    if (!before) {
      await page.keyboard.press("Tab");
      assert.equal(await field("Overall budget (USD)").evaluate((e) => e === document.activeElement), true);
      await field("Travel pace").selectOption("Balanced");
      assert.equal(await field("Travel pace").getAttribute("aria-invalid"), "false");
      assert.equal(await field("Travel pace").getAttribute("aria-describedby"), null);
    }
    await page.keyboard.press("Escape");
    assert.equal(await newTrip.evaluate((e) => e === document.activeElement), true);
    await page.getByRole("button", { name: /Try a three-day demo/ }).click();
    const editTrip = page.getByRole("button", { name: "Edit trip details", exact: true });
    await editTrip.click();
    await invalidSelect(field("Destination"), "Unknown");
    await field("Trip name").fill("");
    await page.getByRole("button", { name: "Save trip details", exact: true }).click();
    await check(["Destination", "Trip name"], "Destination");
    await shot("trip-edit");
    await page.keyboard.press("Escape");
    assert.equal(await editTrip.evaluate((e) => e === document.activeElement), true);
    assert.equal(await page.locator("#workspace-title").innerText(), "A little mountain escape");
    const editActivity = page.getByRole("button", { name: "Edit A morning by Lake Braies", exact: true });
    await editActivity.click();
    await field("Activity name").fill(" ");
    await invalidSelect(field("Category"), "Unknown");
    await oversizedNotes(field("Notes & details"));
    await page.getByRole("button", { name: "Apply changes", exact: true }).click();
    await check(["Activity name", "Category", "Notes & details"], "Activity name");
    await shot("activity-edit");
    if (!before) {
      await page.keyboard.press("Tab");
      assert.equal(await field("Start time").evaluate((e) => e === document.activeElement), true);
      // Time controls can have internal keyboard stops; focus the select with
      // keyboard modality still active to verify its visible outline.
      await field("Category").focus();
      assert.notEqual(await field("Category").evaluate((e) => getComputedStyle(e).outlineStyle), "none");
    }
    await field("Notes & details").scrollIntoViewIfNeeded();
    await shot("activity-notes");
    if (!before) {
      await field("Notes & details").focus();
      assert.notEqual(await field("Notes & details").evaluate((e) => getComputedStyle(e).outlineStyle), "none");
      await field("Notes & details").fill("A valid note");
      assert.equal(await field("Notes & details").getAttribute("aria-invalid"), "false");
      assert.equal(await field("Notes & details").getAttribute("aria-describedby"), null);
    }
    await page.keyboard.press("Escape");
    assert.equal(await editActivity.evaluate((e) => e === document.activeElement), true);
    const editBudget = page.getByRole("button", { name: "Edit overall budget", exact: true });
    await editBudget.click();
    await field("Overall budget (USD)").fill("0.001");
    await page.getByRole("button", { name: "Update budget", exact: true }).click();
    await check(["Overall budget (USD)"], "Overall budget (USD)");
    await shot("budget-edit");
    await page.keyboard.press("Escape");
    assert.equal(await editBudget.evaluate((e) => e === document.activeElement), true);
    assert.deepEqual(errors, []);
    console.log(`PASS ${before ? "baseline" : "validation"} ${width}: four forms, input/select/textarea, ARIA, first-error focus, keyboard, dismissal, no overflow`);
    await page.close();
  }
} finally {
  await browser.close();
}
