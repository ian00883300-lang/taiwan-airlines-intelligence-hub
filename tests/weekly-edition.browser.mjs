import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
const news = JSON.parse(fs.readFileSync("data/weekly-updates.json", "utf8"));
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH || "/usr/bin/chromium",
});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("about:blank");
    await page.goto("http://127.0.0.1:4173/#weekly");
    await page.locator(".weekly-edition").waitFor();
    await page.evaluate(() =>
      document.documentElement.style.setProperty("--reading-scale", "1.5"),
    );
    assert.equal(await page.locator(".weekly-tracking-card").count(), 2);
    assert.match(
      await page.locator(".weekly-edition").innerText(),
      /2026-10-26～2026-11-01/,
    );
    assert.match(
      await page.locator(".weekly-edition").innerText(),
      /2026-07-21/,
    );
    assert.match(
      await page.locator(".weekly-edition").innerText(),
      /2026-10-27/,
    );
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await page.getByLabel("航空公司", { exact: true }).selectOption("starlux");
    assert.equal(await page.locator(".weekly-tracking-card").count(), 1);
    await page.getByLabel("追蹤主題", { exact: true }).selectOption("Fleet");
    assert.equal(await page.locator(".weekly-tracking-card").count(), 0);
    await page.getByLabel("追蹤主題", { exact: true }).selectOption("all");
    await page.getByLabel("期間", { exact: true }).selectOption("week");
    const range = await page.locator('select option[value="week"]').innerText();
    const [, start, end] = range.match(
      /(\d{4}-\d{2}-\d{2})～(\d{4}-\d{2}-\d{2})/,
    );
    assert.equal(
      await page.locator(".news-card").count(),
      news.filter(
        (n) =>
          n.airline === "starlux" &&
          n.published_date >= start &&
          n.published_date <= end,
      ).length,
    );
    await page.getByLabel("期間", { exact: true }).selectOption("all");
    assert.equal(
      await page.locator(".news-card").count(),
      news.filter((n) => n.airline === "starlux").length,
    );
    console.log(
      `PASS weekly edition, original evidence dates, filters and archive at ${width}px/150%`,
    );
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
