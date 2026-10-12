// Isolated Playwright Core setup matches planner.browser.mjs.
import assert from "node:assert/strict";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright-core");
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_EXECUTABLE || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const base = process.env.QA_BASE_URL || "http://localhost:3200";
async function expectError(page, label) {
  const field = page.getByLabel(label, { exact: true });
  assert.equal(await field.getAttribute("aria-invalid"), "true");
  assert.equal(await field.evaluate((e) => e === document.activeElement), true);
  const help = await field.getAttribute("aria-describedby");
  assert.ok(help);
  assert.match(await page.locator(`#${help}`).innerText(), /two decimal places/);
}
try {
  for (const width of [1440, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base + "/final-website");
    await page.getByRole("button", { name: "Plan your journey", exact: true }).click();
    await page.getByLabel("Trip name", { exact: true }).fill("Cents journey");
    await page.getByLabel("Start date", { exact: true }).fill("2026-11-01");
    await page.getByLabel("End date", { exact: true }).fill("2026-11-03");
    const budgetInput = () => page.getByLabel("Overall budget (USD)", { exact: true });
    for (const value of ["0.001", "1.000", "0", "1000000.01", "1e2"]) {
      await budgetInput().fill(value);
      await page.getByRole("button", { name: "Create trip", exact: true }).click();
      await expectError(page, "Overall budget (USD)");
      assert.equal(await page.getByRole("dialog").count(), 1);
    }
    await budgetInput().fill("0.60");
    await page.getByRole("button", { name: "Create trip", exact: true }).click();
    const budget = page.locator('section[aria-labelledby="budget-title"]');
    const spent = () => page.getByTestId("budget-spent").innerText();
    const dayTotal = () => page.getByRole("tabpanel").innerText();
    const category = (name) => budget.locator("dl > div").filter({ has: page.getByText(name, { exact: true }) }).locator("dd").innerText();
    await page.getByRole("button", { name: "+ Add activity", exact: true }).click();
    await page.getByLabel("Activity name", { exact: true }).fill("First lunch");
    await page.getByLabel("Category", { exact: true }).selectOption("Food");
    const cost = () => page.getByLabel("Estimated cost (USD)", { exact: true });
    for (const value of ["0.004", "1.005", "1.000", "-0.01", "1000000.01", "1e2"]) {
      await cost().fill(value);
      await page.getByRole("button", { name: "Add activity", exact: true }).click();
      await expectError(page, "Estimated cost (USD)");
    }
    await cost().fill("0.10");
    await page.getByRole("button", { name: "Add activity", exact: true }).click();
    const firstId = await page.locator("[data-activity]").getAttribute("data-activity");
    async function add(name, value, type) {
      await page.getByRole("button", { name: "+ Add activity", exact: true }).click();
      await page.getByLabel("Activity name", { exact: true }).fill(name);
      await page.getByLabel("Category", { exact: true }).selectOption(type);
      await cost().fill(value);
      await page.getByRole("button", { name: "Add activity", exact: true }).click();
    }
    await add("Second lunch", "0.20", "Food");
    await add("Free walk", "0", "Outdoors");
    assert.match(await dayTotal(), /\$0.30 estimated/);
    assert.equal(await category("Food"), "$0.30");
    await page.getByRole("tab").nth(1).click();
    await add("Bus", "0.29", "Transport");
    assert.match(await spent(), /\$0.59[\s\S]*\$0.60/);
    assert.equal(await category("Transport"), "$0.29");
    assert.match(await budget.innerText(), /\$0.01 left to explore/);
    // Rejecting an edit must preserve the existing activity and totals.
    await page.getByRole("button", { name: "Edit Bus", exact: true }).click();
    await cost().fill("0.004");
    await page.getByRole("button", { name: "Apply changes", exact: true }).click();
    await expectError(page, "Estimated cost (USD)");
    await page.keyboard.press("Escape");
    assert.match(await spent(), /\$0.59/);
    await page.getByRole("button", { name: "Edit overall budget", exact: true }).click();
    for (const value of ["0.001", "1.000", "0", "1000000.01", "1e2"]) {
      await budgetInput().fill(value);
      await page.getByRole("button", { name: "Update budget", exact: true }).click();
      await expectError(page, "Overall budget (USD)");
    }
    await page.keyboard.press("Escape");
    assert.match(await spent(), /\$0.59[\s\S]*\$0.60/);
    await page.getByRole("button", { name: "Edit overall budget", exact: true }).click();
    await budgetInput().fill("0.59");
    await page.getByRole("button", { name: "Update budget", exact: true }).click();
    assert.match(await budget.innerText(), /\$0.00 left to explore/);
    assert.match(await budget.innerText(), /100.0% used/);
    await page.getByRole("button", { name: "Edit Bus", exact: true }).click();
    await cost().fill("0.30");
    await page.getByRole("button", { name: "Apply changes", exact: true }).click();
    assert.match(await budget.innerText(), /\$0.01 over your budget/);
    await page.getByRole("tab").first().click();
    assert.equal(await page.locator("[data-activity]").first().getAttribute("data-activity"), firstId);
    assert.match(await dayTotal(), /\$0.30 estimated/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(errors, []);
    console.log(`PASS USD ${width}: precision errors/accessibility, create/edit budget and activity, free cost, exact day/category/trip totals, balance, over-budget, preserved IDs`);
    await context.close();
  }
} finally {
  await browser.close();
}
