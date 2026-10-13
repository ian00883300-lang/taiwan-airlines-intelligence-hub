import { chromium } from "playwright";
import assert from "node:assert/strict";
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await b.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
const base = process.env.TEST_URL || "http://127.0.0.1:5173/";
try {
  for (const width of [320, 390, 768, 1440]) {
    await p.setViewportSize({ width, height: 1000 });
    await p.goto(base + "#china-airlines/routes");
    await p.reload();
    await p.locator(".route-table").waitFor();
    await p.evaluate(() =>
      document.documentElement.style.setProperty("--reading-scale", "1.5"),
    );
    assert.equal(await p.locator(".continent-heading").count(), 4);
    assert.equal(await p.locator("tr[data-route]").count(), 19);
    await p.getByLabel("洲別", { exact: true }).selectOption("Europe");
    assert.equal(await p.locator(".continent-heading").count(), 1);
    assert.equal(await p.locator("tr[data-route]").count(), 3);
    await p.getByLabel("洲別", { exact: true }).selectOption("all");
    await p.getByRole("button", { name: "依機型看航線", exact: true }).click();
    await p.getByLabel("選擇機型", { exact: true }).selectOption("A321neo");
    assert.equal(await p.locator("tr[data-route]").count(), 3);
    assert.ok(
      (await p.locator(".route-table").innerText()).includes("KHH → MNL"),
    );
    await p.getByLabel("選擇機型", { exact: true }).selectOption("777-300ER");
    assert.ok(
      (await p.locator(".route-list").innerText()).includes("Data pending"),
    );
    await p.getByLabel("航空公司", { exact: true }).selectOption("starlux");
    await p.getByLabel("選擇機型", { exact: true }).selectOption("A350-1000");
    assert.equal(await p.locator("tr[data-route]").count(), 3);
    assert.equal(await p.locator(".continent-heading").count(), 3);
    assert.ok(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    assert.ok(
      await p
        .locator(".route-table")
        .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
    );
    await p.getByRole("button", { name: "依洲別看航線", exact: true }).click();
    assert.equal(await p.locator("tr[data-route]").count(), 13);
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS continent grouping, aircraft lookup, filter reset, unknown coverage, four widths at 150%, no clipping or JS errors",
  );
} finally {
  await b.close();
}
