import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_PATH
    ? { executablePath: process.env.BROWSER_PATH }
    : { channel: "chrome" }),
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const base = process.env.TEST_URL || "http://127.0.0.1:4173/";
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const go = async (hash) => {
  await page.goto(base + "#" + hash);
  await page.locator("h1").waitFor();
};
try {
  await go("interview");
  const initial = await page
    .locator(".question-card h3")
    .first()
    .evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  for (let i = 0; i < 5; i++)
    await page.getByRole("button", { name: "放大字體", exact: true }).click();
  assert.equal(await page.getByLabel("目前字體大小").innerText(), "150%");
  assert.equal(
    await page
      .getByRole("button", { name: "放大字體", exact: true })
      .isDisabled(),
    true,
  );
  const enlarged = await page
    .locator(".question-card h3")
    .first()
    .evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  assert.ok(Math.abs(enlarged / initial - 1.5) < 0.01);
  await page.reload();
  assert.equal(await page.getByLabel("目前字體大小").innerText(), "150%");
  await page.locator(".question-card").first().click();
  const dialog = page.locator("dialog");
  await dialog.getByRole("button", { name: "縮小字體", exact: true }).click();
  assert.equal(await dialog.getByLabel("目前字體大小").innerText(), "140%");
  await dialog.getByRole("button", { name: "放大字體", exact: true }).click();
  await dialog.getByRole("button", { name: "中英對照", exact: true }).click();
  assert.ok(await dialog.evaluate((e) => e.scrollWidth <= e.clientWidth + 1));
  await page.screenshot({ path: "tests/reading-dialog-mobile.png" });
  await page.keyboard.press("Escape");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "home",
      "interview",
      "china-airlines/recruitment",
      "eva-air/recruitment",
      "starlux/recruitment",
      "starlux/cadet",
      "china-airlines/finance",
      "compare",
    ]) {
      await go(route);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${width}px 150% ${route}`,
      );
    }
  }
  await go("china-airlines/recruitment");
  assert.ok((await page.locator("main").innerText()).includes("IELTS ≥6.0"));
  await go("eva-air/recruitment");
  assert.ok((await page.locator("main").innerText()).includes("AI 撰寫"));
  await go("starlux/recruitment");
  assert.ok((await page.locator("main").innerText()).includes("TOEIC ≥800"));
  await page
    .getByRole("button", { name: "恢復預設字體大小", exact: true })
    .click();
  assert.equal(await page.getByLabel("目前字體大小").innerText(), "100%");
  assert.equal(
    await page
      .getByRole("button", { name: "縮小字體", exact: true })
      .isDisabled(),
    true,
  );
  await page.evaluate(() =>
    localStorage.setItem("taih-reading-size-v1", "999"),
  );
  await page.reload();
  assert.equal(await page.getByLabel("目前字體大小").innerText(), "100%");
  assert.deepEqual(errors, []);
  console.log(
    "PASS font scale/bounds/reset/persistence/dialog sync, invalid storage fallback, 150% at four widths/eight routes, recruitment updates, no runtime errors",
  );
} finally {
  await browser.close();
}
