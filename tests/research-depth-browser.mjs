import { chromium } from "playwright";
import assert from "node:assert/strict";
const base = process.env.TEST_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.BROWSER_PATH || "/usr/bin/chromium",
});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  async function go(path) {
    await page.goto(base + "#" + path);
    await page.locator("h1").waitFor();
    await page.evaluate(() =>
      document.documentElement.style.setProperty("--reading-scale", "1.5"),
    );
  }
  async function fits(label) {
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      label,
    );
  }
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const airline of ["china-airlines", "eva-air", "starlux"]) {
      await go(airline + "/overview");
      assert.ok((await page.locator(".company-timeline li").count()) >= 6);
      assert.ok((await page.locator(".company-identity tbody tr").count()) > 0);
      await fits(airline + " timeline " + width);
      await go(airline + "/operations");
      assert.equal(await page.locator(".traffic-table tbody tr").count(), 3);
      await page.getByRole("button", { name: "貨運指標", exact: true }).click();
      assert.ok(
        (await page.locator(".traffic-table").innerText()).includes("FTK"),
      );
      assert.ok(
        (await page.locator(".traffic-table tbody").innerText()).includes(
          "166,059",
        ),
      );
      await page.getByRole("button", { name: "客運指標", exact: true }).click();
      assert.ok(
        (await page.locator(".traffic-table tbody").innerText()).includes(
          "11,419,585",
        ),
      );
      await fits(airline + " operations " + width);
      await go(airline + "/strategy");
      assert.ok(
        (await page.locator(".strategy-research tbody tr").count()) >= 3,
      );
      assert.ok(
        (await page.locator(".strategy-research").innerText()).includes(
          "官方事實",
        ),
      );
      await fits(airline + " strategy " + width);
      await go(airline + "/routes");
      assert.equal(
        await page.locator(".route-table tbody tr").count(),
        { "china-airlines": 9, "eva-air": 14, starlux: 12 }[airline],
      );
      await fits(airline + " routes " + width);
    }
    console.log(
      `PASS three airlines: timelines, business tables, strategy and route tables at ${width}px/150%`,
    );
  }
  await go("starlux/routes");
  await page.getByLabel("出發機場").selectOption("RMQ");
  assert.equal(await page.locator(".route-table tbody tr").count(), 2);
  assert.ok(
    (await page.locator(".route-table tbody").innerText()).includes(
      "RMQ → SHI",
    ),
  );
  assert.ok(
    (await page.locator(".route-table tbody").innerText()).includes(
      "2026年2月13日",
    ),
  );
  await page.getByLabel("航空公司").selectOption("all");
  await page.getByLabel("出發機場").selectOption("KHH");
  assert.equal(await page.locator(".route-table tbody tr").count(), 1);
  assert.ok(
    (await page.locator(".route-table tbody").innerText()).includes(
      "KHH → KIX",
    ),
  );
  await go("starlux/overview");
  const text = await page.locator(".company-identity").innerText();
  for (const fact of [
    "曜石灰",
    "大地金",
    "2646",
    "2024年10月25日",
    "30,087,350,000",
    "3,008,735,000",
    "27.49%",
  ]) {
    assert.ok(text.includes(fact), fact);
  }
  await go("starlux/finance");
  assert.ok(
    (await page.getByLabel("星宇損益與EPS分析").innerText()).includes(
      "272,608",
    ),
  );
  assert.ok((await page.locator(".revenue-mix").innerText()).includes("萬元"));
  await go("eva-air/finance");
  assert.ok(
    (await page.locator(".revenue-mix").innerText()).includes(
      "缺少同口徑完整合計，不計算",
    ),
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS RMQ/KHH origin filtering, precise dates, stock facts, earnings and revenue-boundary guards; no runtime errors",
  );
} finally {
  await browser.close();
}
