import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.TEST_URL || "http://127.0.0.1:5173/";
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const id of ["china-airlines", "starlux"]) {
      for (const topic of [
        "routes",
        "esg",
        "fleet",
        "safety",
        "operations",
        "finance",
        "cadet",
        "strategy",
        "interview",
      ]) {
        await page.goto(base + "#" + id + "/" + topic);
        await page.locator(".airline-masthead").waitFor();
        await page.evaluate(() =>
          document.documentElement.style.setProperty("--reading-scale", "1.5"),
        );
        if (!["routes", "fleet"].includes(topic))
          assert.equal(await page.locator(".company-priorities").count(), 1);
        if (topic === "routes") {
          await page
            .locator(".route-list .source")
            .first()
            .evaluate((e) => (e.open = true));
          assert.ok(
            await page
              .locator(".route-table")
              .evaluate((e) => e.scrollWidth <= e.clientWidth + 2),
            "Route table must not be clipped at " + width,
          );
        }
        if (topic === "fleet") {
          await page
            .locator(".aircraft-registrations details")
            .first()
            .evaluate((e) => (e.open = true));
          assert.ok(
            (await page.locator(".registration-list strong").count()) > 0,
          );
        }
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          `${id}/${topic} overflow ${width}`,
        );
      }
    }
  }
  await page.goto(base + "#starlux/overview");
  assert.ok(
    (await page.locator(".company-timeline").innerText()).includes(
      "2018年5月2日",
    ),
  );
  await page
    .locator(".company-timeline")
    .screenshot({ path: "tests/compact-timeline.png" });
  await page.goto(base + "#china-airlines/routes");
  await page
    .locator(".route-table")
    .screenshot({ path: "tests/route-table.png" });
  await page.goto(base + "#starlux/esg");
  await page.screenshot({
    path: "tests/company-direction.png",
    fullPage: false,
  });
  assert.equal(errors.length, 0, errors.join("\n"));
  console.log(
    "PASS: 72 company/viewport combinations, 150% text, expanded route evidence and registrations, compact dates, no JS errors",
  );
} finally {
  await browser.close();
}
