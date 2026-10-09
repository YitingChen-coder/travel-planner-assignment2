// Optional local Chrome regression suite; see README for isolated tooling setup.
import assert from "node:assert/strict";
import fs from "node:fs";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright-core"
);
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.CHROME_EXECUTABLE ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const base = process.env.QA_BASE_URL || "http://localhost:3200";
const artifacts = process.env.QA_ARTIFACT_DIR || "/tmp/travel-m4-qa";
fs.mkdirSync(artifacts, { recursive: true });
const axePath = process.cwd() + "/node_modules/axe-core/axe.min.js";
const reports = [];
async function axeCheck(page, label) {
  if (!fs.existsSync(axePath)) return;
  await page.addScriptTag({ path: axePath });
  const violations = await page.evaluate(async () => {
    const result = await axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    });
    return result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    }));
  });
  reports.push({ label, violations });
  assert.deepEqual(violations, [], label);
}
async function noOverflow(page, label) {
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
    label,
  );
}
async function shot(page, name) {
  await page.screenshot({ path: `${artifacts}/${name}.png`, fullPage: true });
}
async function add(page, title, cost) {
  await page
    .getByRole("button", { name: "+ Add activity", exact: true })
    .click();
  await page.getByLabel("Activity name", { exact: true }).fill(title);
  await page
    .getByLabel("Estimated cost (USD)", { exact: true })
    .fill(String(cost));
  await page.getByRole("button", { name: "Add activity", exact: true }).click();
}
try {
  for (const [width, height] of [
    [1440, 900],
    [768, 1024],
    [390, 844],
    [320, 700],
  ]) {
    const context = await browser.newContext({ viewport: { width, height } });
    await context.addInitScript(() => {
      window.__persistenceCalls = [];
      const blocked = (name) =>
        function () {
          window.__persistenceCalls.push(name);
          throw new Error(`Unexpected persistence: ${name}`);
        };
      for (const method of ["getItem", "setItem", "removeItem", "clear", "key"])
        Storage.prototype[method] = blocked(`Storage.${method}`);
      if (window.indexedDB) window.indexedDB.open = blocked("IndexedDB.open");
      if (window.cookieStore) {
        window.cookieStore.get = blocked("cookieStore.get");
        window.cookieStore.set = blocked("cookieStore.set");
      }
      const cookie = Object.getOwnPropertyDescriptor(
        Document.prototype,
        "cookie",
      );
      if (cookie?.configurable)
        Object.defineProperty(Document.prototype, "cookie", {
          get: blocked("document.cookie.get"),
          set: blocked("document.cookie.set"),
          configurable: true,
        });
    });
    const page = await context.newPage();
    const errors = [];
    const failures = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("requestfailed", (r) => failures.push(r.url()));
    page.on("response", (r) => {
      if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);
    });
    assert.equal((await page.goto(base + "/final-website")).status(), 200);
    await page
      .getByRole("button", { name: "Plan your journey", exact: true })
      .waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 30));
      }
      scrollTo(0, 0);
    });
    await page.waitForFunction(() =>
      [...document.images].every((image) => image.complete),
    );
    await noOverflow(page, `landing ${width}`);
    assert.deepEqual(
      await page.evaluate(() =>
        [...document.images]
          .filter((i) => !i.complete || !i.naturalWidth)
          .map((i) => i.src),
      ),
      [],
    );
    await shot(page, `landing-${width}`);
    await page.screenshot({
      path: `${artifacts}/landing-${width}-viewport.png`,
    });
    await axeCheck(page, `landing ${width}`);
    await page.getByRole("link", { name: /Find your somewhere/ }).click();
    assert.equal(new URL(page.url()).hash, "#destinations");
    const plan = page.getByRole("button", {
      name: "Plan this trip: The Ligurian coast",
      exact: true,
    });
    await plan.click();
    assert.equal(
      await page.getByLabel("Destination", { exact: true }).inputValue(),
      "liguria",
    );
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog").count(), 0);
    assert.equal(
      await plan.evaluate((e) => e === document.activeElement),
      true,
    );
    await plan.click();
    await page
      .getByRole("button", { name: "Create trip", exact: true })
      .click();
    assert.equal(
      await page
        .getByLabel("Start date", { exact: true })
        .getAttribute("aria-invalid"),
      "true",
    );
    await page.getByLabel("Trip name", { exact: true }).fill("");
    await page.getByLabel("Start date", { exact: true }).fill("2026-11-01");
    await page.getByLabel("End date", { exact: true }).fill("2026-10-31");
    await page.getByLabel("Overall budget (USD)", { exact: true }).fill("0");
    await page
      .getByRole("button", { name: "Create trip", exact: true })
      .click();
    assert.equal(
      await page
        .getByLabel("Trip name", { exact: true })
        .getAttribute("aria-invalid"),
      "true",
    );
    assert.equal(
      await page
        .getByLabel("End date", { exact: true })
        .getAttribute("aria-invalid"),
      "true",
    );
    assert.equal(
      await page
        .getByLabel("Overall budget (USD)", { exact: true })
        .getAttribute("aria-invalid"),
      "true",
    );
    await page.getByLabel("Trip name", { exact: true }).fill("A seaside pause");
    await page.getByLabel("End date", { exact: true }).fill("2026-11-03");
    await page
      .getByLabel("Travel pace", { exact: true })
      .selectOption("Balanced");
    await page.getByLabel("Overall budget (USD)", { exact: true }).fill("100");
    await axeCheck(page, `trip modal ${width}`);
    await page
      .getByRole("button", { name: "Create trip", exact: true })
      .click();
    assert.equal(
      await page
        .getByRole("heading", { name: "A seaside pause", exact: true })
        .count(),
      1,
    );
    assert.equal(
      await page
        .getByText("Nothing planned. Plenty possible.", { exact: true })
        .count(),
      1,
    );
    await page
      .getByRole("button", { name: "+ Add activity", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Add activity", exact: true })
      .click();
    assert.equal(
      await page
        .getByLabel("Activity name", { exact: true })
        .getAttribute("aria-invalid"),
      "true",
    );
    await page
      .getByLabel("Activity name", { exact: true })
      .fill("Morning walk");
    await page.getByLabel("Duration (minutes)", { exact: true }).fill("0");
    await page.getByLabel("Estimated cost (USD)", { exact: true }).fill("-1");
    await page
      .getByRole("button", { name: "Add activity", exact: true })
      .click();
    assert.equal(
      await page
        .getByLabel("Duration (minutes)", { exact: true })
        .getAttribute("aria-invalid"),
      "true",
    );
    assert.equal(
      await page
        .getByLabel("Estimated cost (USD)", { exact: true })
        .getAttribute("aria-invalid"),
      "true",
    );
    await page.getByLabel("Duration (minutes)", { exact: true }).fill("90");
    await page.getByLabel("Estimated cost (USD)", { exact: true }).fill("25");
    await page
      .getByLabel("Notes & details", { exact: true })
      .fill("Take the long way by the water.");
    await shot(page, `activity-edit-${width}`);
    await page.screenshot({
      path: `${artifacts}/activity-edit-${width}-viewport.png`,
    });
    await axeCheck(page, `activity modal ${width}`);
    await page
      .getByRole("button", { name: "Add activity", exact: true })
      .click();
    await add(page, "Tea by the sea", 10);
    assert.match(await page.getByTestId("budget-spent").innerText(), /\$35.00/);
    assert.equal(
      await page
        .getByRole("button", { name: "Move Morning walk up", exact: true })
        .isDisabled(),
      true,
    );
    await page
      .getByRole("button", { name: "Move Tea by the sea up", exact: true })
      .click();
    assert.deepEqual(
      await page.locator("[data-activity] h4").allTextContents(),
      ["Tea by the sea", "Morning walk"],
    );
    await page
      .getByRole("button", { name: "Move Tea by the sea down", exact: true })
      .click();
    assert.deepEqual(
      await page.locator("[data-activity] h4").allTextContents(),
      ["Morning walk", "Tea by the sea"],
    );
    const tabs = page.getByRole("tab");
    await tabs.first().focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await tabs.nth(1).getAttribute("aria-selected"), "true");
    assert.equal(await page.locator("[data-activity]").count(), 0);
    await add(page, "Local lunch", 55);
    await tabs.first().click();
    assert.equal(await page.locator("[data-activity]").count(), 2);
    await page
      .getByRole("button", { name: "Edit Morning walk", exact: true })
      .click();
    await page.getByLabel("Estimated cost (USD)", { exact: true }).fill("80");
    await page
      .getByRole("button", { name: "Apply changes", exact: true })
      .click();
    assert.match(
      await page.getByTestId("budget-spent").innerText(),
      /\$145.00/,
    );
    await page
      .getByRole("button", { name: "Remove Tea by the sea", exact: true })
      .click();
    await page.getByRole("button", { name: "Keep it", exact: true }).click();
    assert.equal(
      await page
        .getByRole("heading", { name: "Tea by the sea", exact: true })
        .count(),
      1,
    );
    await page
      .getByRole("button", { name: "Remove Tea by the sea", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Remove activity", exact: true })
      .click();
    assert.match(
      await page.getByTestId("budget-spent").innerText(),
      /\$135.00/,
    );
    assert.equal(
      await page.getByText("$35.00 over your budget", { exact: false }).count(),
      1,
    );
    await page
      .getByRole("button", { name: "Edit overall budget", exact: true })
      .click();
    await page.getByLabel("Overall budget (USD)", { exact: true }).fill("200");
    await page
      .getByRole("button", { name: "Update budget", exact: true })
      .click();
    assert.equal(
      await page.getByText("$65.00 left to explore", { exact: false }).count(),
      1,
    );
    await page
      .getByLabel("Passport and travel documents", { exact: true })
      .check();
    await page.getByRole("button", { name: "Add", exact: true }).click();
    assert.equal(
      await page.locator("#checklist-custom").getAttribute("aria-invalid"),
      "true",
    );
    await page
      .getByLabel("Something else to remember?", { exact: true })
      .fill("Camera");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    assert.equal(await page.getByLabel("Camera", { exact: true }).count(), 1);
    await page.getByLabel("Camera", { exact: true }).check();
    assert.equal(
      await page.getByText("2 of 7 ready", { exact: true }).count(),
      1,
    );
    await noOverflow(page, `workspace ${width}`);
    await shot(page, `workspace-${width}`);
    await page.locator("#workspace-title").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `${artifacts}/workspace-${width}-viewport.png`,
    });
    await page.locator("#budget-title").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `${artifacts}/budget-checklist-${width}.png`,
    });
    await axeCheck(page, `workspace ${width}`);
    await page
      .getByRole("button", {
        name: "Remove checklist item Camera",
        exact: true,
      })
      .click();
    assert.equal(
      await page.getByText("1 of 6 ready", { exact: true }).count(),
      1,
    );
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("button", { name: /Demo trips/ })
      .click();
    assert.equal(
      await page
        .getByRole("heading", { name: "Journeys for this visit.", exact: true })
        .count(),
      1,
    );
    await page.getByRole("button", { name: "Open demo", exact: false }).click();
    assert.equal(
      await page
        .getByRole("heading", { name: "A little mountain escape", exact: true })
        .count(),
      1,
    );
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("button", { name: /Demo trips/ })
      .click();
    await page
      .getByRole("button", { name: "Open journey", exact: false })
      .click();
    assert.equal(await page.locator("[data-activity]").count(), 1);
    await page
      .getByRole("button", { name: "Edit Morning walk", exact: true })
      .click();
    await page
      .getByLabel("Notes & details", { exact: true })
      .fill("Longnote".repeat(120));
    await page
      .getByRole("button", { name: "Apply changes", exact: true })
      .click();
    await noOverflow(page, `long note ${width}`);
    await page
      .getByRole("button", { name: "Delete this trip", exact: true })
      .click();
    await page.keyboard.press("Escape");
    assert.equal(
      await page
        .getByRole("heading", { name: "A seaside pause", exact: true })
        .count(),
      1,
    );
    await page
      .getByRole("button", { name: "Delete this trip", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Delete trip", exact: true })
      .click();
    assert.equal(
      await page
        .getByRole("button", { name: "Open journey", exact: false })
        .count(),
      0,
    );
    assert.deepEqual(await page.evaluate(() => window.__persistenceCalls), []);
    // Simulate changes to the demo, then prove reload restores original data.
    await page.getByRole("button", { name: "Open demo", exact: false }).click();
    await add(page, "Temporary demo moment", 77);
    await page
      .getByLabel("Passport and travel documents", { exact: true })
      .check();
    assert.match(
      await page.getByTestId("budget-spent").innerText(),
      /\$192.00/,
    );
    assert.deepEqual(await page.evaluate(() => window.__persistenceCalls), []);
    await page.reload();
    await page.getByRole("button", { name: /Try a three-day demo/ }).click();
    assert.match(
      await page.getByTestId("budget-spent").innerText(),
      /\$115.00/,
    );
    assert.equal(
      await page
        .getByLabel("Passport and travel documents", { exact: true })
        .isChecked(),
      false,
    );
    assert.equal(
      await page
        .getByRole("heading", { name: "Temporary demo moment", exact: true })
        .count(),
      0,
    );
    assert.deepEqual(await page.evaluate(() => window.__persistenceCalls), []);
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("button", { name: /Demo trips/ })
      .click();
    assert.equal(
      await page
        .getByRole("button", { name: "Open journey", exact: false })
        .count(),
      0,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await page
        .getByRole("button", { name: "+ Create a trip", exact: true })
        .evaluate((e) => getComputedStyle(e).transitionDuration),
      "0s",
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(failures, []);
    console.log(
      `PASS ${width}x${height}: discovery, forms, itinerary CRUD/reorder, budget, checklist, refresh reset, no persistence, keyboard, overflow, axe`,
    );
    await context.close();
  }
  for (const route of [
    "",
    "/mood-boards/calm",
    "/mood-boards/arcade",
    "/mood-boards/editorial",
    "/design-systems/calm",
    "/design-systems/arcade",
    "/design-systems/editorial",
    "/final-website",
  ]) {
    const page = await browser.newPage();
    assert.equal((await page.goto(base + route)).status(), 200);
    await page.close();
  }
  console.log("PASS all eight routes");
} finally {
  fs.writeFileSync(
    `${artifacts}/accessibility.json`,
    JSON.stringify(reports, null, 2),
  );
  await browser.close();
}
