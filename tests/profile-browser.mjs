import { chromium } from "playwright";
import assert from "node:assert/strict";
const base = process.env.TEST_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH || "/usr/bin/chromium" });
const checks = [
  ["starlux/overview", "董事會7席"],
  ["starlux/cadet", "6,224"],
  ["starlux/routes", "阿提哈德"],
  ["starlux/operations", "JX Cargo APP"],
  ["starlux/safety", "Just Culture"],
  ["starlux/fleet", "2033年"],
  ["china-airlines/operations", "11,746,082"],
  ["china-airlines/routes", "客運72"],
  ["eva-air/overview", "1989年4月7日"],
];
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({width,height:1000});
    for (const [route, text] of checks) {
      await page.goto(base + "#" + route);
      await page.locator("main").getByText(text, {exact:false}).first().waitFor();
      await page.evaluate(() => document.documentElement.style.setProperty("--reading-scale", "1.5"));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${route} ${width}`);
    }
    console.log(`PASS 9 sourced profile pages at ${width}px and 150% text`);
  }
  assert.deepEqual(errors, []);
} finally { await browser.close(); }
