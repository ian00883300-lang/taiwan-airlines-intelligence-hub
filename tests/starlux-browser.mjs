import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
const bank = JSON.parse(fs.readFileSync("data/interview-bank.json", "utf8"));
const culture = bank.filter((q) => q.practice_group === "星宇品牌與公司研究");
const base = process.env.TEST_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.BROWSER_PATH || "/usr/bin/chromium",
});
const errors = [];
try {
  const page = await browser.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base + "#interview");
    await page.locator(".bank-filters input").fill("");
    await page.locator(".bank-filters select").nth(2).selectOption("all");
    await page.locator(".bank-filters select").nth(0).selectOption("starlux");
    assert.equal(await page.locator(".question-card").count(), 18);
    await page.locator(".bank-filters select").nth(2).selectOption("進階");
    assert.equal(await page.locator(".question-card").count(), 16);
    await page.locator(".bank-filters input").fill("星宇品牌與公司研究");
    assert.equal(await page.locator(".question-card").count(), 12);
    for (const q of culture) {
      await page
        .locator(".question-card")
        .filter({
          has: page.getByRole("heading", { name: q.question, exact: true }),
        })
        .click();
      const dialog = page.locator("dialog[open]");
      await dialog.locator(".deep-research").evaluate((el) => (el.open = true));
      assert.ok(await dialog.locator(`a[href="${q.source_url}"]`).count());
      assert.ok(
        (await dialog.locator(".deep-research").innerText()).includes(
          "容易混淆",
        ),
      );
      for (const seconds of [30, 60]) {
        await dialog
          .getByRole("button", { name: `${seconds} 秒`, exact: true })
          .click();
        for (const language of ["中文", "English", "中英對照"]) {
          await dialog
            .getByRole("button", { name: language, exact: true })
            .click();
          const answers = await dialog.locator(".answer").allTextContents();
          assert.ok(
            answers.includes(q[`answer_zh_${seconds}`]) ||
              language === "English",
          );
          assert.ok(
            answers.includes(q[`answer_${seconds}`]) || language === "中文",
          );
          assert.ok(
            await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
            `${q.id} ${width} ${language}`,
          );
        }
      }
      await dialog
        .getByRole("button", { name: "關閉練習", exact: true })
        .click();
    }
    console.log(
      `PASS all 12 culture questions, bilingual 30/60-second answers and layout at ${width}px`,
    );
  }
  await page.goto(base + "#interview");
  await page.locator(".bank-filters select").nth(2).selectOption("all");
  await page.locator(".bank-filters input").fill("如何區分星宇首架 A350-1000");
  await page.locator(".question-card").click();
  let dialog = page.locator("dialog[open]");
  assert.ok(
    (await dialog.locator(".answer").innerText()).includes("2026年1月6日"),
  );
  const milestoneText = await dialog.locator(".event-dates").innerText();
  assert.ok(milestoneText.includes("交機（土魯斯當地）：2026年1月5日"));
  assert.ok(milestoneText.includes("抵台（台灣當地）：2026年1月6日"));
  assert.ok(milestoneText.includes("首次載客飛航：2026年2月10日"));
  console.log(
    "PASS delivery answer separates handover, arrival and first passenger service",
  );
  await dialog.getByRole("button", { name: "關閉練習", exact: true }).click();
  let dates = "";
  for (const airline of ["starlux", "eva-air", "china-airlines"]) {
    await page.goto(base + `#${airline}/routes`);
    await page.locator(".route-list").waitFor();
    dates += await page.locator(".route-list").innerText();
  }
  assert.ok(dates.includes("2026年8月1日"));
  assert.ok(dates.includes("2025年10月3日"));
  assert.ok(dates.includes("2025年12月3日（實際首航另查）"));
  assert.deepEqual(errors, []);
  console.log(
    "PASS route dates show event, announcement, plan and unknown dates distinctly; no runtime errors",
  );
} finally {
  await browser.close();
}
