import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Ajv from "ajv";
const read = (p) =>
  JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
const ids = ["china-airlines", "eva-air", "starlux"];
const all = fs
  .readdirSync("data", { recursive: true })
  .filter((p) => p.endsWith(".json"))
  .map((p) => [p, read("data/" + p)]);
const ajv = new Ajv({ strict: false, allErrors: true });
const validate = ajv.compile(read("schema/evidence.schema.json"));
function walk(x, path, fn) {
  if (!x || typeof x !== "object") return;
  if (!Array.isArray(x)) fn(x, path);
  for (const [k, v] of Object.entries(x)) walk(v, path + "." + k, fn);
}
test("All evidence has valid metadata and verified dates do not fabricate publication dates", () => {
  let n = 0;
  for (const [p, x] of all)
    walk(x, p, (o, path) => {
      if ("status" in o) {
        n++;
        assert.ok(validate(o), path + " " + JSON.stringify(validate.errors));
        for (const k of ["published_date", "verified_date", "as_of"])
          if (o[k]) assert.ok(o[k] <= "2026-10-11", path + " future date " + k);
        if (o.value === null) assert.equal(o.status, "unverified", path);
      }
    });
  assert.ok(n > 150);
});
test("All three airlines expose the same 32 sections and core JSON files", () => {
  assert.equal(read("data/sections.json").length, 32);
  for (const id of ids) {
    const a = read("data/" + id + "/overview.json");
    assert.equal(Object.keys(a.sections).length, 32);
    for (const f of [
      "fleet",
      "routes",
      "financials",
      "recruitment",
      "interview",
    ])
      assert.ok(fs.existsSync("data/" + id + "/" + f + ".json"));
  }
});
test("Passenger and cargo sums match dated current fleet totals, excluding all orders", () => {
  for (const id of ids.slice(0, 2)) {
    const a = read("data/" + id + "/overview.json");
    const f = read("data/" + id + "/fleet.json");
    assert.equal(
      f.items.reduce((s, x) => s + x.current_fleet, 0),
      a.total.value,
    );
    assert.ok(
      f.items.every(
        (x) => x.as_of === a.total.as_of && x.service_state === "current",
      ),
    );
    assert.equal(
      f.items
        .filter((x) => x.kind === "cargo")
        .reduce((s, x) => s + x.current_fleet, 0),
      id === "china-airlines" ? 18 : 9,
    );
  }
});
test("STARLUX historical 29 and program order 18 do not become a current total", () => {
  const a = read("data/starlux/overview.json"),
    f = read("data/starlux/fleet.json");
  assert.equal(a.total.value, null);
  assert.equal(a.total.status, "unverified");
  assert.ok(f.items.every((x) => x.current_fleet === null));
  assert.equal(f.history[0].as_of, "2025-12-31");
  assert.equal(f.orders[0].delivery_state, "order_program");
});
test("Order lifecycle and classification are explicit", () => {
  for (const id of ids)
    for (const o of read("data/" + id + "/fleet.json").orders) {
      assert.ok(
        ["firm_order", "announcement", "option", "MoU", "plan"].includes(
          o.order_type,
        ),
      );
      assert.ok(
        ["program_total", "remaining_backlog"].includes(o.quantity_basis),
      );
      assert.ok(["on_order", "order_program"].includes(o.delivery_state));
      assert.ok(o.note);
      assert.ok(o.quantity > 0);
    }
});
test("Route identifiers, airline, airport and source references are valid", () => {
  const airports = read("data/airports.json").items;
  let keys = new Set();
  for (const id of ids)
    for (const r of read("data/" + id + "/routes.json").items) {
      assert.ok(!keys.has(r.id));
      keys.add(r.id);
      assert.equal(r.airline, id);
      assert.ok(airports[r.origin]);
      assert.ok(airports[r.destination]);
      assert.equal(r.route_type, "self_operated_passenger");
      assert.equal(r.status, "confirmed");
    }
});
test("Interview bank covers 15 topics, four audiences, and both answer lengths", () => {
  const qs = read("data/interview-bank.json");
  assert.equal(new Set(qs.map((x) => x.id)).size, qs.length);
  assert.equal(new Set(qs.map((x) => x.topic)).size, 15);
  assert.equal(new Set(qs.map((x) => x.airline)).size, 4);
  for (const q of qs) {
    assert.ok(q.answer_60.length > q.answer_30.length);
    assert.ok(q.answer_zh_30.length > 70, q.id + ' needs a spoken Chinese answer');
    assert.ok(q.answer_zh_60.length > q.answer_zh_30.length);
    assert.ok(q.answer_outline.length >= 3 && q.follow_up);
    assert.ok(
      q.question_en && q.chinese_answer && q.key_points.length && q.difficulty,
    );
    assert.equal(q.content_type, "original_practice");
  }
  for (const id of ids)
    for (const qid of read("data/" + id + "/interview.json").question_ids)
      assert.ok(qs.some((q) => q.id === qid));
});
test("Every source reference resolves to a documented authoritative URL", () => {
  const sources = read("data/sources.json");
  assert.equal(new Set(sources.map((s) => s.id)).size, sources.length);
  const byId = new Map(sources.map((s) => [s.id, s]));
  for (const [p, x] of all)
    walk(x, p, (o, path) => {
      if (o.source_id) {
        assert.ok(byId.has(o.source_id), path);
        assert.equal(o.source_url, byId.get(o.source_id).source_url);
      }
    });
  for (const s of sources)
    assert.ok(!/wikipedia|reddit|starlux-airways/.test(s.source_url));
});
test("Financial records retain currency, annual period and scope", () => {
  for (const id of ids) {
    const f = read("data/" + id + "/financials.json");
    assert.equal(f.revenue.period, "2025-01-01/2025-12-31");
    assert.equal(f.revenue.unit, "十億新臺幣");
    assert.ok(f.revenue.scope);
    assert.equal(typeof f.revenue.value, "number");
  }
});
test("Weekly events retain publication and event dates separately", () => {
  const news = read("data/weekly-updates.json");
  assert.ok(
    news.filter(
      (n) => n.event_date >= "2026-10-05" && n.event_date <= "2026-10-11",
    ).length >= 2,
  );
  assert.ok(
    news.find((n) => n.airline === "starlux").event_date < "2026-10-05",
  );
  for (const n of news) assert.ok(n.what && n.why && n.impact && n.remember);
});
