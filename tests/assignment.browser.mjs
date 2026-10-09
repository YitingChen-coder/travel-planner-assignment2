// Rubric audit across all eight static routes; browser tooling remains external.
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
const artifacts = process.env.QA_ARTIFACT_DIR || "/tmp/travel-assignment-qa";
fs.mkdirSync(artifacts, { recursive: true });
const routes = [
  "/",
  "/mood-boards/calm",
  "/mood-boards/arcade",
  "/mood-boards/editorial",
  "/design-systems/calm",
  "/design-systems/arcade",
  "/design-systems/editorial",
  "/final-website",
];
const reports = [];
try {
  for (const [width, height] of [
    [1440, 900],
    [768, 1024],
    [390, 844],
    [320, 700],
  ])
    for (const route of routes) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      page.on("requestfailed", (r) => errors.push(r.url()));
      page.on("response", (r) => {
        if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
      });
      assert.equal((await page.goto(base + route)).status(), 200);
      await page.evaluate(async () => {
        await document.fonts.ready;
        for (let y = 0; y < document.body.scrollHeight; y += 500) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 20));
        }
        scrollTo(0, 0);
      });
      // Bring each lazy image into view after hydration, then check its load.
      for (const image of await page.locator("img").all()) {
        await image.scrollIntoViewIfNeeded();
        await page.waitForFunction(
          (img) => img.complete,
          await image.elementHandle(),
        );
      }
      await page.evaluate(() => scrollTo(0, 0));
      const broken = await page.evaluate(() =>
        [...document.images]
          .filter((i) => !i.naturalWidth || !i.alt.trim())
          .map((i) => i.src),
      );
      assert.deepEqual(broken, [], `${route} images`);
      const overflow = await page.evaluate(() => ({
        viewport: innerWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      assert.equal(
        overflow.scroll <= overflow.viewport,
        true,
        `${route} ${width} overflow`,
      );
      assert.equal(await page.locator("h1").count(), 1);
      const links = await page
        .locator("a[href]")
        .evaluateAll((es) => es.map((e) => e.getAttribute("href")));
      for (const href of links) {
        if (href.startsWith("#"))
          assert.equal(await page.locator(href).count(), 1);
        else if (href.startsWith("/") && width === 1440)
          assert.equal((await page.request.get(base + href)).status(), 200);
      }
      let artifactCount = null;
      if (route === "/mood-boards/calm")
        artifactCount = await page.locator(".mood-piece").count();
      if (route === "/mood-boards/arcade")
        artifactCount = await page.locator(".arcade-piece-tag").count();
      if (route === "/mood-boards/editorial") {
        artifactCount = await page.locator("figure").count();
        assert.equal(
          await page
            .locator(
              'section[aria-labelledby="editorial-title"] figure figcaption',
            )
            .isVisible(),
          false,
          "Editorial cover must hide its duplicate photo caption",
        );
      }
      if (artifactCount !== null) assert.equal(artifactCount, 28, route);
      if (route.includes("/design-systems/")) {
        assert.equal(await page.locator("[data-role]").count(), 4);
        assert.equal(await page.locator("#colors figure").count(), 9);
        assert.equal(await page.locator("[data-state]").count(), 6);
        for (const state of [
          "default",
          "hover",
          "focus",
          "pressed",
          "selected",
          "disabled",
        ])
          assert.equal(
            await page.locator(`[data-state="${state}"]`).count(),
            1,
          );
        for (const name of ["Empty", "Loading specimen", "Error", "Success"])
          assert.equal(
            await page
              .locator("#feedback")
              .getByText(name, { exact: true })
              .count(),
            1,
          );
        for (const role of [
          "checkbox",
          "radio",
          "switch",
          "tablist",
          "tabpanel",
          "textbox",
          "combobox",
        ])
          assert.ok(
            (await page.getByRole(role).count()) > 0,
            `${route} ${role}`,
          );
      }
      await page.addScriptTag({
        path: process.cwd() + "/node_modules/axe-core/axe.min.js",
      });
      const violations = await page.evaluate(async () => {
        const r = await axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        });
        return r.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        }));
      });
      await page.keyboard.press("Tab");
      const focus = await page.evaluate(() => ({
        tag: document.activeElement.tagName,
        width: getComputedStyle(document.activeElement).outlineWidth,
      }));
      assert.notEqual(focus.width, "0px", `${route} visible keyboard focus`);
      const name =
        route === "/" ? "gallery" : route.slice(1).replaceAll("/", "-");
      if (width === 1440 || width === 390) {
        await page.mouse.click(1, 1);
        await page.screenshot({
          path: `${artifacts}/${name}-${width}.png`,
          fullPage: true,
        });
        await page.screenshot({
          path: `${artifacts}/${name}-${width}-viewport.png`,
        });
      }
      assert.deepEqual(errors, [], `${route} browser errors`);
      reports.push({
        route,
        width,
        height,
        artifactCount,
        violations,
        overflow,
        errors,
      });
      console.log(
        JSON.stringify({
          route,
          width,
          artifactCount,
          axeViolations: violations.length,
        }),
      );
      await page.close();
    }
  fs.writeFileSync(
    `${artifacts}/assignment-audit.json`,
    JSON.stringify(reports, null, 2),
  );
  assert.deepEqual(
    reports.filter((r) => r.violations.length),
    [],
    "axe violations",
  );
} finally {
  fs.writeFileSync(
    `${artifacts}/assignment-audit.json`,
    JSON.stringify(reports, null, 2),
  );
  await browser.close();
}
