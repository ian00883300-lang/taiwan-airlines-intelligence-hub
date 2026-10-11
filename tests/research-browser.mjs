import { chromium } from "playwright";
import assert from "node:assert/strict";
const base = process.env.TEST_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const go = async (route) => {
  await page.goto(base + "#" + route);
  await page.locator("h1").waitFor();
};
try {
  await go("home");
  await page.locator(".install-guide summary").click();
  assert.ok(
    (await page.locator(".install-guide").innerText()).includes("Safari"),
  );
  const manifestURL = await page
    .locator('link[rel="manifest"]')
    .evaluate((e) => e.href);
  const response = await page.request.get(manifestURL);
  assert.equal(response.status(), 200);
  const manifest = await response.json();
  assert.ok(new URL(manifest.start_url, manifestURL).href.startsWith(base));
  for (const icon of manifest.icons) {
    const r = await page.request.get(new URL(icon.src, manifestURL).href);
    assert.equal(r.status(), 200);
    assert.ok(r.headers()["content-type"].includes("image/png"));
  }
  const apple = await page
    .locator('link[rel="apple-touch-icon"]')
    .evaluate((e) => e.href);
  assert.equal((await page.request.get(apple)).status(), 200);
  await page.screenshot({ path: "tests/research-home.png" });
  await go("china-airlines/cadet");
  assert.equal(await page.locator(".training-steps button").count(), 6);
  await page
    .getByRole("button", { name: "03 儀器與商用能力 IR / CPL" })
    .click();
  assert.ok(
    (await page.locator(".stage-detail").innerText()).includes("天氣最低標準"),
  );
  await page.getByRole("button", { name: "美國 FAA", exact: true }).click();
  assert.equal(await page.locator(".requirement-card").count(), 3);
  await page.getByRole("button", { name: "澳洲 CASA", exact: true }).click();
  assert.equal(await page.locator(".requirement-card").count(), 2);
  await page.getByRole("button", { name: "臺灣 CAA", exact: true }).click();
  await page.locator(".all-sections summary").click();
  assert.equal(await page.locator(".section-nav a").count(), 32);
  await page
    .locator(".section-nav")
    .getByRole("link", { name: "機師招募", exact: true })
    .click();
  assert.ok(page.url().endsWith("/recruitment"));
  await go("eva-air/cadet");
  assert.ok(
    (await page.locator(".training-program").innerText()).includes("12–14"),
  );
  await go("starlux/cadet");
  assert.ok(
    (await page.locator(".training-program").innerText()).includes("1.5–2 年"),
  );
  await go("china-airlines/finance");
  assert.equal(await page.locator("canvas").count(), 2);
  await page.getByLabel("財務指標").selectOption("eps");
  assert.equal(
    await page
      .locator("canvas")
      .first()
      .evaluate((e) => e.getAttribute("aria-label"))
      .then((s) => s.includes("EPS")),
    true,
  );
  assert.ok((await page.locator("main").innerText()).includes("2.42"));
  await page.screenshot({ path: "tests/research-finance.png" });
  await go("china-airlines/esg");
  assert.equal(await page.locator(".social-research canvas").count(), 1);
  assert.ok(
    (await page.locator(".social-research").innerText()).includes("71,694,349"),
  );
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "home",
      "china-airlines/cadet",
      "china-airlines/finance",
      "china-airlines/esg",
    ]) {
      await go(route);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${width} ${route}`,
      );
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await go("china-airlines/cadet");
  await page.screenshot({ path: "tests/research-mobile.png" });
  assert.deepEqual(errors, []);
  console.log(
    "PASS manifest/icons, installer instructions, training stages, jurisdiction filters, category navigation, financial metric switch, ESG figures, 6 responsive widths, no runtime errors",
  );
} finally {
  await browser.close();
}
