import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
const base = process.env.TEST_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_PATH
    ? { executablePath: process.env.BROWSER_PATH }
    : { channel: "chrome" }),
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const entry = {
  zh_30: "測試專屬短答，不是真人資料。",
  zh_60: "測試專屬長答，不是真人資料。這是測試內容。",
  en_30: "Synthetic short answer.",
  en_60: "Synthetic longer answer for validation.",
  coaching: "測試提醒",
  follow_up: "測試追問",
  basis: "合成資料",
};
const upload = async (object) =>
  page.getByLabel("匯入個人答案 JSON").setInputFiles({
    name: "test.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(object)),
  });
try {
  await page.goto(base + "#interview");
  await page.locator(".question-card").first().click();
  assert.ok((await page.locator(".answer").innerText()).includes("華航"));
  await page.getByRole("button", { name: "English", exact: true }).click();
  assert.ok(
    (await page.locator(".answer").innerText()).includes("China Airlines"),
  );
  await page.getByRole("button", { name: "中英對照", exact: true }).click();
  assert.equal(await page.locator(".answer").count(), 2);
  await page.getByRole("button", { name: "60 秒", exact: true }).click();
  assert.ok((await page.locator(".answer").first().innerText()).length > 150);
  await page.getByRole("button", { name: "隱藏答案，先試說" }).click();
  assert.equal(await page.locator(".answer").count(), 0);
  await page.getByRole("button", { name: "顯示答案" }).click();
  for (const width of [320, 375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(
      await page
        .locator("dialog")
        .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
      "dialog overflow " + width,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "tests/practice-mobile.png" });
  await page.keyboard.press("Escape");
  await page.locator(".private-library summary").click();
  const writes = [];
  page.on("request", (r) => {
    if (r.method() !== "GET") writes.push(r.url());
  });
  await upload({ version: 1, answers: { "company-ci": entry } });
  await page.getByRole("status").filter({ hasText: "已載入 1 題" }).waitFor();
  await page.reload();
  await page.locator(".question-card").first().click();
  assert.equal(await page.getByLabel("答案版本").inputValue(), "personal");
  assert.equal(await page.locator(".answer").innerText(), entry.zh_30);
  await page.getByLabel("答案版本").selectOption("general");
  assert.ok((await page.locator(".answer").innerText()).includes("華航"));
  await page.keyboard.press("Escape");
  await page.locator(".private-library summary").click();
  await upload({ version: 1, answers: { unknown: entry } });
  await page.getByRole("status").filter({ hasText: "原資料未更動" }).waitFor();
  assert.equal(
    JSON.parse(
      await page.evaluate(() =>
        localStorage.getItem("taih-personal-answers-v1"),
      ),
    ).answers["company-ci"].zh_30,
    entry.zh_30,
  );
  await page
    .getByRole("button", { name: "移除此瀏覽器的個人答案", exact: true })
    .click();
  await page.getByRole("button", { name: "取消", exact: true }).click();
  assert.ok(
    await page.evaluate(() => localStorage.getItem("taih-personal-answers-v1")),
  );
  await page
    .getByRole("button", { name: "移除此瀏覽器的個人答案", exact: true })
    .click();
  await page
    .getByRole("button", { name: "確認移除個人答案", exact: true })
    .click();
  assert.equal(
    await page.evaluate(() => localStorage.getItem("taih-personal-answers-v1")),
    null,
  );
  assert.deepEqual(writes, []);
  assert.deepEqual(errors, []);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.reload();
  await page.screenshot({ path: "tests/practice-desktop.png" });
  console.log(
    "PASS Chinese/English/bilingual, recall, 30/60, five dialog widths, private import/persistence/switch, invalid import preservation, removal/cancel, no uploads or runtime errors",
  );
} finally {
  await browser.close();
}
