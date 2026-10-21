import { chromium } from "playwright";
import assert from "node:assert/strict";

const base = process.env.TEST_URL || "http://127.0.0.1:4175/";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // Data validation alone cannot detect research sections omitted by the UI.
  const cases = [
    ["china-airlines/esg", "旅客參與：Eco Travel 與輕旅行點數"],
    ["china-airlines/operations", "24 小時修管與 MR 修護訓練"],
    ["eva-air/cadet", "第三階段：進階與機型轉換"],
    ["starlux/cadet", "筆試準備的官方範圍"],
    ["china-airlines/cadet", "FOQA：用日常飛航資料改善訓練"],
    ["eva-air/operations", "長榮航空 · 貨種與研究重點"],
    ["china-airlines/operations", "冷鏈運送：主動式與被動式溫控"],
    ["starlux/strategy", "機隊展望：2026 年底 42 架"],
    ["china-airlines/strategy", "2025 年三項永續風險"],
    ["eva-air/strategy", "新興風險：假訊息與人才結構"],
  ];
  for (const [route, text] of cases) {
    await page.goto(`${base}#${route}`, { waitUntil: "domcontentloaded" });
    await page.getByText(text, { exact: false }).first().waitFor({ timeout: 15000 });
    console.log("PASS", route);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}#eva-air/cadet`, { waitUntil: "domcontentloaded" });
  await page.getByText("第三階段：進階與機型轉換", { exact: false }).first().waitFor();
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
    false,
    "Cadet content must not overflow the mobile viewport",
  );
  assert.deepEqual(errors, []);
  console.log("PASS mobile width and runtime");
} finally {
  await browser.close();
}
