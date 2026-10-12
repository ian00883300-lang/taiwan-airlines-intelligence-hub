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
const results = [],
  errors = [];
const check = async (name, fn) => {
  try {
    await fn();
    results.push({ name, pass: true });
    console.log("PASS", name);
  } catch (e) {
    results.push({ name, pass: false, error: e.message });
    console.error("FAIL", name, e.message);
  }
};
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
page.on("pageerror", (e) => errors.push(e.message));
const go = async (hash = "home") => {
  await page.goto(base + "#" + hash, { waitUntil: "domcontentloaded" });
  await page.locator("h1").waitFor();
};
try {
  await check(
    "Production dashboard loads three airlines and two real charts",
    async () => {
      await go();
      assert.equal(await page.locator(".airline-card").count(), 3);
      assert.equal(await page.locator("canvas").count(), 2);
      assert.ok(
        (await page.locator("h1").innerText()).includes("台灣航空情報中心"),
      );
    },
  );
  await check(
    "All 96 legacy research links resolve to consolidated topics",
    async () => {
      let sections = JSON.parse(fs.readFileSync("data/sections.json"));
      for (let id of ["china-airlines", "eva-air", "starlux"])
        for (let s of sections) {
          await go(id + "/" + s.id);
          assert.ok(
            (await page.locator("main").innerText()).includes(s.zh),
            id + "/" + s.id,
          );
          assert.equal(await page.locator(".consolidated-nav a").count(), 10);
        }
    },
  );
  await check(
    "Fleet filter separates freight from passenger aircraft",
    async () => {
      await go("china-airlines/fleet");
      await page.getByLabel("篩選機隊").selectOption("cargo");
      assert.equal(await page.locator("tbody tr").count(), 2);
      assert.ok((await page.locator("tbody").innerText()).includes("777F"));
      assert.ok(!(await page.locator("tbody").innerText()).includes("A350"));
    },
  );
  await check(
    "Map filters show one verified STARLUX Europe route and honest empty state",
    async () => {
      await go("starlux/routes");
      await page.getByLabel("區域").selectOption("Europe");
      assert.equal(await page.locator(".route-table tbody tr").count(), 1);
      assert.ok(
        (await page.locator(".route-list").innerText()).includes("PRG"),
      );
      await page.getByLabel("區域").selectOption("Oceania");
      assert.ok(
        (await page.locator(".route-list").innerText()).includes(
          "Data pending verification",
        ),
      );
    },
  );
  await check(
    "Comparison has 22 dimensions and dated financial units",
    async () => {
      await go("compare");
      assert.equal(await page.locator("tbody tr").count(), 22);
      await page.getByLabel("比較主題").selectOption("business");
      assert.equal(await page.locator("tbody tr").count(), 6);
      assert.ok(
        (await page.locator("tbody").innerText()).includes("十億 TWD（2025）"),
      );
    },
  );
  await check(
    "Weekly filter excludes older STARLUX news until background is selected",
    async () => {
      await go("weekly");
      assert.equal(await page.locator(".news-card").count(), 2);
      await page.getByLabel("航空公司").selectOption("starlux");
      assert.equal(await page.locator(".news-card").count(), 0);
      await page.getByLabel("期間").selectOption("all");
      assert.equal(await page.locator(".news-card").count(), 1);
      assert.ok(
        (await page.locator(".news-card").innerText()).includes("2026-08-01"),
      );
    },
  );
  await check(
    "Question search, difficulty and topic filters work together",
    async () => {
      await go("interview");
      assert.equal(await page.locator(".question-card").count(), 36);
      await page.getByLabel("主題").selectOption("Fleet");
      assert.equal(await page.locator(".question-card").count(), 3);
      await page.getByLabel("航空公司").selectOption("eva-air");
      assert.equal(await page.locator(".question-card").count(), 1);
      await page.getByLabel("搜尋題目").fill("不存在的題目");
      assert.equal(await page.locator(".question-card").count(), 0);
    },
  );
  await check(
    "Interview dialog timer, 60-second answer, note, bookmark and completion persist",
    async () => {
      await go("interview");
      await page.reload();
      await page.locator(".question-card").first().click();
      await page.locator("dialog").waitFor();
      await page.getByRole("button", { name: "60 秒", exact: true }).click();
      assert.equal(await page.locator(".timer").innerText(), "60s");
      await page.getByRole("button", { name: "開始", exact: true }).click();
      await page.waitForTimeout(1200);
      assert.notEqual(await page.locator(".timer").innerText(), "60s");
      await page.getByRole("button", { name: "暫停", exact: true }).click();
      await page.getByLabel("我的口說筆記").fill("QA 自己的真實經驗");
      await page.getByRole("button", { name: "收藏題目", exact: true }).click();
      await page
        .getByRole("button", { name: "標記已練習", exact: true })
        .click();
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("dialog").count(), 0);
      await page.reload();
      await page.getByLabel("學習紀錄").selectOption("saved");
      assert.equal(await page.locator(".question-card").count(), 1);
      await page.locator(".question-card").click();
      assert.equal(
        await page.getByLabel("我的口說筆記").inputValue(),
        "QA 自己的真實經驗",
      );
      await page.getByRole("button", { name: "關閉練習", exact: true }).click();
    },
  );
  await check("Notes export downloads a valid local JSON file", async () => {
    const d = page.waitForEvent("download");
    await page.getByRole("button", { name: "匯出筆記" }).click();
    const download = await d;
    const text = fs.readFileSync(await download.path(), "utf8");
    assert.equal(JSON.parse(text).notes["company-ci"], "QA 自己的真實經驗");
  });
  await check("Global search reaches the selected question", async () => {
    await page.getByLabel("全站搜尋").fill("安全管理系統");
    await page.locator(".search-results button").first().click();
    assert.ok(
      (await page.locator("dialog").innerText()).includes(
        "Safety Management System",
      ),
    );
    await page.keyboard.press("Escape");
  });
  await check(
    "Evidence panel exposes source, publication, verification and as-of fields",
    async () => {
      await go("china-airlines");
      await page.locator(".source summary").first().click();
      const txt = await page.locator(".source[open]").innerText();
      assert.ok(txt.includes("Published"));
      assert.ok(txt.includes("Verified"));
      assert.ok(txt.includes("As of"));
      assert.ok(await page.locator(".source[open] a").getAttribute("href"));
    },
  );
  await check(
    "Desktop, iPad and iPhone pages have no document horizontal overflow",
    async () => {
      for (let width of [1440, 1024, 768, 390, 375]) {
        await page.setViewportSize({ width, height: 900 });
        for (let route of [
          "home",
          "airlines",
          "china-airlines/fleet",
          "starlux/routes",
          "compare",
          "weekly",
          "interview",
          "sources",
        ]) {
          await go(route);
          await page.waitForTimeout(50);
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
            `${width}px ${route}`,
          );
        }
      }
    },
  );
  await check(
    "Mobile bottom navigation opens all five main destinations",
    async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await go();
      for (let label of ["航空公司", "比較", "週報", "面試", "總覽"]) {
        await page
          .locator(".mobile-nav")
          .getByRole("link", { name: label, exact: true })
          .click();
        await page.locator("h1").waitFor();
      }
      await page.screenshot({ path: "tests/mobile-viewport.png" });
    },
  );
  await check(
    "External map outage retains usable route list and shows fallback",
    async () => {
      await page.route("https://tile.openstreetmap.org/**", (r) => r.abort());
      await go("starlux/routes");
      await page.waitForTimeout(600);
      assert.ok(
        (await page.locator("main").innerText()).includes("底圖暫時無法載入"),
      );
      assert.equal(await page.locator(".route-table tbody tr").count(), 12);
      await page.unroute("https://tile.openstreetmap.org/**");
    },
  );
  await check("No browser runtime errors in tested flows", async () =>
    assert.deepEqual(errors, []),
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await go();
  await page.screenshot({ path: "tests/desktop-viewport.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await go("interview");
  await page.locator(".question-card").first().click();
  await page.screenshot({ path: "tests/interview-mobile.png" });
} finally {
  await browser.close();
  fs.writeFileSync(
    "tests/browser-results.json",
    JSON.stringify(
      {
        date: new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Taipei",
        }).format(new Date()),
        base,
        results,
        errors,
      },
      null,
      2,
    ),
  );
}
if (results.some((x) => !x.pass)) process.exitCode = 1;
