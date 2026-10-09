// Optional edge-case browser regression suite; see README.
import assert from "node:assert/strict";
import fs from "node:fs";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright-core"
);
const artifacts = process.env.QA_ARTIFACT_DIR || "/tmp/travel-m4-qa";
fs.mkdirSync(artifacts, { recursive: true });
const b = await chromium.launch({
  executablePath:
    process.env.CHROME_EXECUTABLE ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const base = process.env.QA_BASE_URL || "http://localhost:3200";
try {
  for (const width of [768, 320]) {
    const context = await b.newContext({
      viewport: { width, height: width === 320 ? 700 : 1024 },
    });
    const page = await context.newPage();
    await page.goto(base + "/final-website");
    for (const [name, id] of [
      ["The Dolomites", "dolomites"],
      ["The Ligurian coast", "liguria"],
      ["Paris, slowly", "paris"],
      ["A quieter Venice", "venice"],
    ]) {
      const trigger = page.getByRole("button", {
        name: `Plan this trip: ${name}`,
        exact: true,
      });
      await trigger.click();
      assert.equal(
        await page.getByLabel("Destination", { exact: true }).inputValue(),
        id,
      );
      assert.equal(
        await page
          .getByRole("button", { name: "Close dialog", exact: true })
          .evaluate((e) => e === document.activeElement),
        true,
      );
      await page.keyboard.press("Escape");
      assert.equal(
        await trigger.evaluate((e) => e === document.activeElement),
        true,
      );
    }
    await page
      .getByRole("button", { name: "Plan your journey", exact: true })
      .click();
    for (let i = 0; i < 22; i++) {
      await page.keyboard.press("Tab");
      assert.equal(
        await page
          .locator("dialog")
          .evaluate(
            (d) =>
              d.contains(document.activeElement) ||
              document.activeElement === document.body,
          ),
        true,
      );
    }
    await page.getByLabel("Trip name", { exact: true }).fill("A".repeat(80));
    await page.getByLabel("Start date", { exact: true }).fill("2026-12-20");
    await page.getByLabel("End date", { exact: true }).fill("2027-01-19");
    await page
      .getByRole("button", { name: "Create trip", exact: true })
      .click();
    assert.equal(
      await page
        .getByLabel("End date", { exact: true })
        .getAttribute("aria-invalid"),
      "true",
    );
    await page.getByLabel("End date", { exact: true }).fill("2027-01-18");
    await page
      .getByRole("button", { name: "Create trip", exact: true })
      .click();
    assert.equal(await page.getByRole("tab").count(), 30);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    const tabs = page.getByRole("tab");
    await tabs.first().focus();
    await page.keyboard.press("End");
    assert.equal(await tabs.nth(29).getAttribute("aria-selected"), "true");
    await page.keyboard.press("Tab");
    assert.equal(
      await page
        .getByRole("tabpanel")
        .evaluate((e) => e === document.activeElement),
      true,
    );
    await page
      .getByRole("button", { name: "+ Add activity", exact: true })
      .click();
    await page
      .getByLabel("Activity name", { exact: true })
      .fill("B".repeat(100));
    await page
      .getByLabel("Notes & details", { exact: true })
      .fill("note".repeat(250));
    await page
      .getByRole("button", { name: "Add activity", exact: true })
      .click();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await page
      .getByRole("button", { name: "Edit overall budget", exact: true })
      .click();
    await page.getByLabel("Overall budget (USD)", { exact: true }).fill("0");
    await page
      .getByRole("button", { name: "Update budget", exact: true })
      .click();
    assert.equal(
      await page
        .getByLabel("Overall budget (USD)", { exact: true })
        .getAttribute("aria-invalid"),
      "true",
    );
    const box = await page.locator("dialog").boundingBox();
    await page.mouse.click(box.x + 4, box.y + 4);
    assert.equal(await page.locator("dialog").count(), 1);
    await page.mouse.click(1, 1);
    assert.equal(await page.locator("dialog").count(), 0);
    assert.equal(
      await page
        .getByRole("button", { name: "Edit overall budget", exact: true })
        .evaluate((e) => e === document.activeElement),
      true,
    );
    await page
      .getByRole("button", { name: /Demo trips/ })
      .first()
      .click();
    await page.getByRole("button", { name: "Open demo", exact: false }).click();
    await page.locator("#workspace-title").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `${artifacts}/demo-${width}.png`,
      fullPage: true,
    });
    await page
      .getByRole("button", {
        name: "Edit A morning by Lake Braies",
        exact: true,
      })
      .click();
    await page.locator("dialog").evaluate((d) => (d.scrollTop = 0));
    await page.screenshot({ path: `${artifacts}/edit-modal-top-${width}.png` });
    await page.keyboard.press("Escape");
    // Each tab owns a separate React state; no shared application data.
    const second = await context.newPage();
    await second.goto(base + "/final-website");
    await second.getByRole("button", { name: /Try a three-day demo/ }).click();
    await second
      .getByLabel("Passport and travel documents", { exact: true })
      .check();
    assert.equal(
      await page
        .getByLabel("Passport and travel documents", { exact: true })
        .isChecked(),
      false,
    );
    await second.close();
    await page
      .getByRole("button", { name: "Delete this trip", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Delete trip", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Open journey", exact: false })
      .click();
    await page
      .getByRole("button", { name: "Delete this trip", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Delete trip", exact: true })
      .click();
    assert.equal(
      await page
        .getByRole("heading", {
          name: "Your next chapter starts here.",
          exact: true,
        })
        .count(),
      1,
    );
    await page
      .getByRole("button", { name: "Restore demo trip", exact: true })
      .click();
    assert.equal(
      await page
        .getByRole("heading", { name: "A little mountain escape", exact: true })
        .count(),
      1,
    );
    await context.close();
    console.log(
      `PASS extra ${width}: all destinations, modal keyboard/backdrop, 30-day/cross-year/long-text, independent tabs, empty trips, demo restore`,
    );
  }
} finally {
  await b.close();
}
