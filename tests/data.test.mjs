import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Ajv from "ajv";
import { formatEventDate } from "../src/event-dates.mjs";
test("STARLUX workforce snapshots reconcile and do not become current fleet statistics", () => {
  const workforce = JSON.parse(
    fs.readFileSync("data/starlux/workforce.json", "utf8"),
  );
  assert.deepEqual(
    workforce.snapshots.map((x) => x.as_of),
    ["2025-12-31", "2026-03-31"],
  );
  for (const x of workforce.snapshots) {
    assert.equal(
      x.pilots + x.cabin_crew + x.dispatchers + x.maintenance + x.other,
      x.total,
    );
    assert.equal(x.source_id, "jxAnnual");
  }
  assert.equal(workforce.snapshots[1].total, 6224);
  const overview = JSON.parse(
    fs.readFileSync("data/starlux/overview.json", "utf8"),
  );
  assert.equal(overview.total.value, 38);
  assert.ok(overview.sections.renewal.every((x) => x.status === "planned"));
  const fleet = JSON.parse(fs.readFileSync("data/starlux/fleet.json", "utf8"));
  const cargo = fleet.orders.find((x) => x.aircraft_type === "A350F");
  assert.equal(cargo.quantity, 10);
  assert.equal(cargo.quantity_basis, "program_total");
  assert.equal(cargo.delivery_state, "order_program");
  assert.ok(fleet.planned.every((x) => x.status === "planned"));
});
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
test("STARLUX has twelve distinct sourced company-detail exercises and deep analysis", () => {
  const questions = read("data/interview-bank.json").filter(
    (q) => q.airline === "starlux",
  );
  const culture = questions.filter(
    (q) => q.practice_group === "星宇品牌與公司研究",
  );
  assert.ok(questions.length >= 12);
  assert.ok(culture.length >= 12);
  const linked = read("data/starlux/interview.json").question_ids;
  for (const q of culture) {
    assert.ok(linked.includes(q.id), q.id);
    assert.equal(q.content_type, "original_practice");
    assert.equal(q.answer_basis, "source_based_analysis");
    assert.ok(q.source_url.startsWith("https://"));
    assert.ok(q.deep_dive.evidence_ids.length);
    assert.ok(q.deep_dive.analysis_zh.length > 100);
    assert.ok(q.deep_dive.analysis_en.length > 200);
    assert.ok(q.deep_dive.pitfalls.length >= 2);
  }
  assert.equal(new Set(culture.map((q) => q.question)).size, 12);
  for (const keyword of [
    "品牌主色",
    "Pantone",
    "股東",
    "董事會",
    "營收",
    "EPS",
    "股票",
    "四艙等",
  ])
    assert.ok(
      culture.some((q) => q.question.includes(keyword)),
      keyword,
    );
});
test("Inauguration and handover dates never fall back to article publication dates", () => {
  const events = read("data/events.json");
  const eventIds = new Set(events.map((e) => e.id));
  assert.equal(eventIds.size, events.length);
  for (const [p, x] of all)
    walk(x, p, (o, path) => {
      for (const id of o.event_ids || []) assert.ok(eventIds.has(id), path);
    });
  for (const air of ids)
    for (const route of read(`data/${air}/routes.json`).items)
      assert.ok(route.event_ids.length, route.id);
  for (const event of events) {
    assert.ok(
      ["delivery", "inaugural", "resumption", "arrival", "entry_into_service"].includes(
        event.event_type,
      ),
    );
    if (event.event_date) {
      assert.notEqual(formatEventDate(event.event_date), "確切年月日待查核");
      assert.equal(event.status, "confirmed");
    } else assert.equal(event.status, "unverified");
  }
  const delivery = events.find((e) => e.id === "jx-a350-1000-first-delivery");
  assert.equal(delivery.event_date, "2026-01-05");
  assert.equal(delivery.source_id, "jxHandover");
  assert.equal(
    events.find((e) => e.id === "jx-a350-1000-arrival").event_date,
    "2026-01-06",
  );
  assert.equal(
    events.find((e) => e.id === "jx-a350-1000-first-service").event_date,
    "2026-02-10",
  );
  assert.equal(
    events.find((e) => e.id === "china-airlines-phx-inaugural").event_date,
    "2025-12-03",
  );
  const q = read("data/interview-bank.json").find(
    (q) => q.id === "jx-event-dates",
  );
  for (const key of ["answer_30", "answer_60"]) {
    assert.ok(q[key].includes("6 January 2026"));
    assert.ok(q[key].includes("5 January 2026"));
    assert.ok(q[key].includes("10 February 2026"));
    assert.ok(!q[key].includes("in January 2026"));
  }
  assert.ok(q.answer_60.includes("publication date"));
  for (const key of ["answer_zh_30", "answer_zh_60"]) {
    assert.ok(q[key].includes("2026年1月6日"));
    assert.ok(q[key].includes("2026年1月5日"));
    assert.ok(q[key].includes("2026年2月10日"));
  }
});
test("Event dates use full calendar dates and reject missing days or invalid dates", () => {
  assert.equal(formatEventDate("2026-08-01"), "2026年8月1日");
  assert.equal(formatEventDate("2024-02-29"), "2024年2月29日");
  for (const input of [
    null,
    "2026-01",
    "2026-02-29",
    "2026-13-01",
    "2026-04-31",
  ])
    assert.equal(formatEventDate(input), "確切年月日待查核");
});
test("Traffic comparison keeps common scopes and reconciles load factors from original units", () => {
  const traffic = read("data/research-dossier.json").traffic;
  assert.equal(traffic.period, "2025-01-01/2025-12-31");
  assert.equal(traffic.rows.length, 3);
  assert.ok(traffic.scope.includes("轉引民航局"));
  for (const row of traffic.rows) {
    assert.ok(
      Math.abs(
        (row.rpk_thousand / row.ask_thousand) * 100 - row.passenger_load_factor,
      ) < 0.02,
    );
    assert.ok(
      Math.abs(
        (row.ftk_thousand / row.aftk_thousand) * 100 - row.cargo_load_factor,
      ) < 0.02,
    );
  }
  assert.equal(
    traffic.rows.find((r) => r.airline === "china-airlines").passengers,
    11419585,
  );
  assert.ok(traffic.note.includes("11,746,082"));
});
test("Revenue mixes reconcile within their source precision and never mix EVA company and group boundaries", () => {
  const airlines = read("data/research-dossier.json").airlines;
  for (const id of ["china-airlines", "starlux"]) {
    const mix = airlines[id].revenue_mix;
    assert.equal(
      mix.parts.reduce((sum, p) => sum + p.amount, 0),
      mix.total,
    );
  }
  assert.equal(airlines["eva-air"].revenue_mix.total, null);
  assert.ok(airlines["eva-air"].revenue_mix.scope.includes("合併營收"));
  const e = read("data/starlux/identity.json").earnings;
  assert.equal(
    e.pretax_income_thousand + e.income_tax_benefit_thousand,
    e.net_income_thousand,
  );
  assert.equal(e.net_income_thousand, 272608);
  const facts = read("data/starlux/identity.json").facts;
  assert.equal(
    facts.find((x) => x.label === "實收資本額").value /
      facts.find((x) => x.label === "已發行普通股").value,
    10,
  );
});
test("All companies have sorted typed timelines, operational models and evidence-separated strategy rows", () => {
  const dossier = read("data/research-dossier.json");
  for (const id of ids) {
    const x = dossier.airlines[id];
    assert.ok(x.timeline.length >= 6);
    assert.deepEqual(
      x.timeline.map((t) => t.date),
      x.timeline.map((t) => t.date).sort(),
    );
    assert.ok(
      x.timeline.every((t) =>
        ["event", "snapshot", "announcement"].includes(t.date_kind),
      ),
    );
    assert.ok(x.strategy.length >= 3);
    for (const strategy of x.strategy)
      assert.ok(
        strategy.official_fact &&
          strategy.analysis &&
          strategy.risk &&
          strategy.kpi &&
          strategy.source_id,
      );
  }
});
test("Expanded self-operated route records cover real origins and keep sources and first-flight evidence separate", () => {
  const routes = ids.flatMap((id) => read(`data/${id}/routes.json`).items);
  assert.equal(routes.length, 119);
  assert.equal(
    new Set(routes.map((r) => [r.airline, r.origin, r.destination].join("/")))
      .size,
    routes.length,
  );
  for (const origin of ["TPE", "RMQ", "KHH"])
    assert.ok(routes.some((r) => r.origin === origin));
  assert.ok(routes.every((r) => r.route_type === "self_operated_passenger"));
  const table = read("data/events.json");
  const phoenix = routes.find(
    (r) => r.airline === "starlux" && r.destination === "PHX",
  );
  assert.equal(
    table.find((e) => e.id === phoenix.event_ids[0]).event_date,
    "2026-01-15",
  );
  assert.ok(
    routes.some(
      (r) =>
        r.evidence_kind === "dated_operating_snapshot" &&
        table.find((e) => e.id === r.event_ids[0]).event_date === null,
    ),
  );
});
test("Deep interview references resolve and revised IDs retain the old question for private-answer review", () => {
  const sources = new Set(read("data/sources.json").map((s) => s.id));
  const bank = read("data/interview-bank.json");
  for (const q of bank) {
    assert.ok(q.deep_dive, q.id);
    for (const id of q.deep_dive.evidence_ids) assert.ok(sources.has(id), id);
    if (q.question_revision > 1)
      assert.ok(q.previous_question.zh && q.previous_question.en);
  }
  assert.equal(
    bank.find((q) => q.id === "jx-values-honesty").source_id,
    "jxFinancial2025",
  );
  assert.ok(
    bank
      .find((q) => q.id === "jx-values-honesty")
      .answer_60.includes("272,608"),
  );
});
test("Audited two-year results preserve profit scope and registry discrepancies", () => {
  const dossier = read("data/research-dossier.json");
  const ci = dossier.airlines["china-airlines"].annual_analysis;
  const jx = dossier.airlines.starlux.annual_analysis;
  assert.equal(
    ci.rows.find((row) => row.label === "本期淨利").current,
    16173472,
  );
  assert.equal(
    ci.rows.find((row) => row.label === "歸屬母公司淨利").current,
    14700319,
  );
  assert.equal(
    jx.rows.find((row) => row.label === "營業收入").previous,
    35546851,
  );
  assert.equal(
    jx.rows.find((row) => row.label === "本期淨利").previous,
    1324438,
  );
  assert.ok(jx.operating_margin_2025 < jx.operating_margin_2024);
  const airline = read("data/china-airlines/overview.json");
  assert.equal(airline.founded.value, "1959-12-16");
  const discrepancy = airline.sections.governance.find(
    (row) => row.label === "成立日期來源差異",
  );
  assert.ok(discrepancy.value.includes("1959年9月7日"));
  assert.equal(discrepancy.source_id, "ciStock");
});
test("Cash-flow statements reconcile signed activities to closing cash without double-counting equipment", () => {
  const dossier = read("data/research-dossier.json");
  for (const airline of ["china-airlines", "starlux"]) {
    const record = dossier.airlines[airline].cash_flow;
    for (const row of record.rows) {
      assert.equal(
        row.opening_cash +
          row.operating +
          row.investing +
          row.financing +
          row.exchange,
        row.closing_cash,
      );
    }
    assert.ok(record.equipment_prepayments_2025 > 0);
    assert.ok(record.note.includes("不可"));
  }
  assert.equal(
    dossier.airlines["china-airlines"].cash_flow.rows[1].closing_cash,
    57551666,
  );
  assert.equal(dossier.airlines.starlux.cash_flow.rows[1].financing, 12123788);
});
test("New operating evidence confirms PHX, preserves SAF accounting boundaries and CEIV scope", () => {
  const event = read("data/events.json").find(
    (row) => row.id === "china-airlines-phx-inaugural",
  );
  assert.equal(event.event_date, "2025-12-03");
  assert.equal(event.source_id, "ciPhxActual");
  assert.equal(event.announcement_published_date, "2025-09-19");
  assert.ok(event.evidence_quote.includes("正式開通"));
  const ci = read("data/china-airlines/overview.json");
  assert.ok(ci.sections.saf[0].body.includes("Book & Claim"));
  assert.ok(ci.sections.saf[0].body.includes("2026年9月13日"));
  const orders = read("data/china-airlines/fleet.json").orders;
  assert.equal(
    orders.find((row) => row.aircraft_type === "777-9").quantity,
    15,
  );
  assert.equal(
    orders.find((row) => row.aircraft_type === "777-8F").quantity,
    8,
  );
  assert.equal(
    read("data/research-dossier.json").airlines.starlux.cargo_capabilities.rows
      .length,
    4,
  );
  const saf = read("data/interview-bank.json").find(
    (row) => row.id === "current",
  );
  assert.ok(saf.answer_60.includes("Book & Claim"));
  assert.ok(saf.answer_zh_60.includes("36.3"));
});
test("All evidence has valid metadata and verified dates do not fabricate publication dates", () => {
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  let n = 0;
  for (const [p, x] of all)
    walk(x, p, (o, path) => {
      if ("status" in o) {
        n++;
        assert.ok(validate(o), path + " " + JSON.stringify(validate.errors));
        for (const k of ["published_date", "verified_date", "as_of"])
          if (o[k]) assert.ok(o[k] <= today, path + " future date " + k);
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
test("STARLUX updated 38-aircraft fleet preserves the 37-aircraft registry snapshot", () => {
  const a = read("data/starlux/overview.json"),
    f = read("data/starlux/fleet.json");
  assert.equal(a.total.value, 38);
  assert.equal(a.total.status, "confirmed");
  assert.equal(
    f.items.reduce((n, x) => n + x.current_fleet, 0),
    38,
  );
  assert.equal(f.history[0].as_of, "2025-12-31");
  assert.equal(f.orders[0].delivery_state, "order_program");
  assert.equal(f.latest_confirmed_total.value, 38);
  assert.equal(f.latest_confirmed_total.as_of, "2026-10-20");
  assert.equal(f.latest_confirmed_total.date_precision, "day");
  for (const id of ["china-airlines", "starlux"]) {
    const items = read(`data/${id}/fleet.json`).items;
    const tails = items.flatMap((x) =>
      x.registrations.records.map((r) => r.tail),
    );
    assert.equal(new Set(tails).size, tails.length);
    for (const x of items) {
      assert.equal(x.registrations.records.length, x.current_fleet);
      assert.equal(x.registrations.as_of, id === "starlux" && x.aircraft_type === "A350-1000" ? "2026-10-17" : "2026-09-30");
    }
  }
  assert.equal(f.composition_snapshot.as_of, "2026-09-30");
  assert.equal(
    f.composition_snapshot.rows.reduce((sum, row) => sum + row.quantity, 0),
    f.composition_snapshot.total,
  );
  assert.ok(
    f.composition_snapshot.rows.every((row) =>
      f.items.some((item) => item.aircraft_type === row.aircraft_type),
    ),
  );
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
      assert.ok(["confirmed", "announced"].includes(r.status));
      if (r.status === "announced")
        assert.equal(r.evidence_kind, "published_schedule_snapshot");
    }
});
test("Interview bank covers 15 topics, four audiences, and both answer lengths", () => {
  const qs = read("data/interview-bank.json");
  assert.equal(new Set(qs.map((x) => x.id)).size, qs.length);
  assert.equal(new Set(qs.map((x) => x.topic)).size, 15);
  assert.equal(new Set(qs.map((x) => x.airline)).size, 4);
  for (const q of qs) {
    assert.ok(q.answer_60.length > q.answer_30.length);
    assert.ok(
      q.answer_zh_30.length > 70,
      q.id + " needs a spoken Chinese answer",
    );
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
test("Financial mix and social categories reconcile to exact source totals", () => {
  const f = read("data/china-airlines/financials.json");
  assert.equal(
    f.breakdown.items.reduce((sum, x) => sum + x.amount, 0),
    f.history.find((x) => x.year === 2025).revenue,
  );
  assert.equal(f.eps.value, f.history.find((x) => x.year === 2025).eps);
  for (const x of read("data/china-airlines/social.json").history)
    assert.equal(x.commercial + x.charity + x.community, x.total);
});
test("Training requirements retain jurisdictions and company durations remain estimates", () => {
  const t = read("data/training-path.json");
  assert.deepEqual(
    [...new Set(t.requirements.map((x) => x.jurisdiction))].sort(),
    ["CASA", "FAA", "臺灣"],
  );
  assert.equal(t.programs.starlux.status, "estimated");
  assert.ok(t.programs.starlux.source_url.includes("careers.jx-starlux.com"));
  assert.ok(
    t.requirements.find((x) => x.id === "tw-atpl").scope.includes("不是"),
  );
  assert.ok(t.requirements.every((x) => x.source_url && x.scope));
});
test("Home-screen icon files match declared sizes and manifest stays under site scope", () => {
  const m = read("public/manifest.webmanifest");
  assert.equal(m.start_url, "./#home");
  assert.equal(m.scope, "./");
  assert.equal(m.display, "standalone");
  for (const size of [32, 180, 192, 512]) {
    const b = fs.readFileSync(`public/icons/metal-t-${size}.png`);
    assert.equal(b.readUInt32BE(16), size);
    assert.equal(b.readUInt32BE(20), size);
  }
  for (const icon of m.icons) assert.ok(fs.existsSync("public/" + icon.src));
});

test("Consolidated topics preserve every legacy research entry exactly once", () => {
  const members = read("data/research-groups.json").flatMap((g) => g.members);
  assert.equal(new Set(members).size, members.length);
  assert.deepEqual(
    [...members].sort(),
    read("data/sections.json")
      .map((s) => s.id)
      .sort(),
  );
});

test("Every passenger layout reconciles cabin counts to its total and all aircraft expose engines and introductions", () => {
  let layouts = 0;
  for (const id of ids) {
    const a = read("data/" + id + "/overview.json");
    assert.ok(a.icao_code && a.codes.source_url.includes("iata.org"));
    for (const x of read("data/" + id + "/fleet.json").items) {
      assert.ok(x.engine.value && x.engine.source_url, id + x.aircraft_type);
      assert.ok(x.introduction.value && x.introduction.source_url);
      if (x.kind === "cargo") continue;
      assert.ok(x.cabin_configurations.layouts.length);
      for (const layout of x.cabin_configurations.layouts) {
        assert.equal(
          layout.cabins.reduce((sum, c) => sum + c.seats, 0),
          layout.total,
          id + x.aircraft_type + layout.name,
        );
        layouts++;
      }
    }
  }
  assert.equal(layouts, 21);
});

test("CAA utilization snapshots resolve to registered aircraft and preserve time notation", () => {
  const u = read("data/aircraft-utilization.json");
  const tails = new Set(
    ids.flatMap((id) =>
      read(`data/${id}/fleet.json`).items.flatMap((x) =>
        (x.registrations?.records || []).map((r) => r.tail),
      ),
    ),
  );
  assert.equal(Object.keys(u.records).length, 115);
  for (const [tail, row] of Object.entries(u.records)) {
    assert.ok(tails.has(tail), tail);
    assert.match(row.flight_hours, /^\d+:[0-5]\d$/);
    assert.ok(Number.isInteger(row.cycles) && row.cycles >= 0);
    assert.ok(row.last_c_check === null || row.last_c_check <= u.as_of);
  }
});

test("Announced routes remain separate from operating records and retain planned dates", () => {
  const plans = read("data/planned-routes.json");
  assert.equal(plans.length, 3);
  const routes = read("data/starlux/routes.json").items;
  for (const p of plans) {
    assert.equal(p.status, "announced");
    assert.ok(p.planned_start > p.verified_date);
    assert.ok(
      !routes.some(
        (r) => r.origin === p.origin && r.destination === p.destination,
      ),
    );
  }
  const sections = read("data/starlux/overview.json").sections;
  assert.ok(
    sections.codeshare.some(
      (x) =>
        x.source_id === "aaJxCodeshare2026" &&
        x.body.includes("待主管機關核准"),
    ),
  );
});

test("CI seasonal timetable excludes partner operators and preserves segmented Auckland service", () => {
  const routes = read("data/china-airlines/routes.json").items;
  const season = routes.filter(
    (r) => r.schedule_evidence?.source_id === "ciSchedule2026Summer",
  );
  assert.equal(season.length, 65);
  assert.ok(!routes.some((r) => r.origin === "TPE" && r.destination === "AKL"));
  assert.ok(routes.some((r) => r.origin === "BNE" && r.destination === "AKL"));
  assert.ok(!routes.some((r) => r.origin === "RMQ" && r.destination === "SGN"));
  assert.ok(!routes.some((r) => r.destination === "BWN"));
  assert.ok(
    routes
      .find((r) => r.destination === "KTI")
      .schedule_evidence.aircraft_codes.includes("738"),
  );
  assert.equal(
    routes.find((r) => r.origin === "TSA" && r.destination === "HND")
      .schedule_evidence.aircraft_codes,
    "333",
  );
  assert.equal(
    routes.find((r) => r.origin === "KHH" && r.destination === "OKA")
      .schedule_evidence.aircraft_codes,
    "738",
  );
  for (const r of season) {
    assert.equal(r.schedule_evidence.valid_to, "2026-10-24");
    assert.ok(
      r.schedule_evidence.source_page >= 4 &&
        r.schedule_evidence.source_page <= 11,
    );
    assert.ok(!/CI9\d{3}/.test(r.schedule_evidence.flight_numbers));
  }
});

test('Verified inaugural history separates route launches, charter starts and resumptions', () => {
  const events = read('data/events.json');
  const event = id => events.find(x => x.id === id);
  assert.equal(event('china-airlines-TPE-SEA-inaugural').event_date, null);
  const sea = event('china-airlines-TPE-SEA-resumption-2024');
  assert.equal(sea.event_type, 'resumption');
  assert.equal(sea.event_date, '2024-07-14');
  assert.equal(sea.published_date, '2024-07-15');
  assert.equal(event('starlux-RMQ-TAK-inaugural').service_kind, 'charter');
  const nrt = event('starlux-NRT-inaugural-pending');
  assert.equal(nrt.event_date, '2020-12-16');
  assert.ok(nrt.corroboration_url.includes('narita-airport.jp'));
  const sendai = events.find(x => /starlux.*SDJ/i.test(x.id));
  assert.equal(sendai.event_date, '2023-04-01');
  assert.equal(sendai.status, 'confirmed');
  assert.equal(sendai.announced_event_date, '2023-04-01');
});

test('Brand definitions stay separate from special livery and unverified sixth-sense claims', () => {
  const brand = read('data/starlux/identity.json').brand_experience;
  assert.deepEqual(brand.colours.map(x => x.name), ['大地金','玫瑰金','曜石灰']);
  assert.equal(brand.senses.examples.length, 5);
  assert.match(brand.senses.note, /2020/);
  assert.match(brand.senses.note, /Data pending verification/);
  const answer = read('data/interview-bank.json').find(x => x.id === 'jx-values-safety');
  for (const colour of brand.colours) assert.ok(answer.answer_zh_30.includes(colour.name));
  assert.equal(answer.question_revision, 3);
});


test('Imported preparation questions distinguish reviewed guidance from frameworks and protect private sources',()=>{
 const raw=fs.readFileSync('data/imported-interview.json','utf8');const q=JSON.parse(raw);
 assert.equal(q.length,327);assert.equal(new Set(q.map(x=>x.id)).size,327);
 assert.equal(q.filter(x=>x.answer_mode==='reviewed_guidance').length,23);
 assert.equal(q.filter(x=>x.answer_mode==='framework').length,304);
 assert.ok(!/docs.google.com|1CVGNHUr9qGCGSOvCExX4nvWWbsLpfVEv7MIT6QBf7MI/.test(raw));
 for(const x of q){assert.equal(x.status,'unverified');assert.ok(x.question);}
 const knowledge=['aviation','aircraft'].flatMap(n=>JSON.parse(fs.readFileSync(`data/${n}-knowledge.json`)).items);
 assert.ok(knowledge.length >= 22);assert.equal(new Set(knowledge.map(x=>x.id)).size,knowledge.length);
 for(const x of knowledge){assert.ok(x.source_url.startsWith('https://'));assert.ok(x.answer);assert.ok(x.caution);}
});

test("Lease commitment snapshots reconcile without becoming current ownership counts", () => {
  const fleet = JSON.parse(fs.readFileSync("data/starlux/fleet.json", "utf8"));
  const snapshot = fleet.ownership_summary;
  assert.equal(snapshot.as_of, "2026-03-31");
  for (const row of snapshot.rows) {
    assert.equal(row.delivered + row.pending, row.total);
  }
  assert.equal(snapshot.rows[0].delivered, 20);
  assert.notEqual(snapshot.as_of, fleet.items[0].as_of);
  const eva = JSON.parse(fs.readFileSync("data/eva-air/fleet.json", "utf8"));
  assert.equal(eva.items.find(x => x.aircraft_type === "A330-300").ownership.quantity, undefined);
});

test('Inaugural dates retain publication dates and distinguish charter and historical stopovers', () => {
  const events = read('data/events.json');
  const e = id => events.find(x => x.id === id);
  assert.equal(e('china-airlines-KHH-KMJ-inaugural').event_date, '2015-10-25');
  assert.equal(e('china-airlines-KHH-KMJ-inaugural').published_date, '2015-10-26');
  assert.match(e('china-airlines-TPE-FCO-inaugural-pending').note, /杜拜/);
  for (const id of ['starlux-TPE-UKB-inaugural', 'starlux-RMQ-UKB-inaugural', 'eva-air-TPE-UKB-inaugural']) {
    assert.equal(e(id).service_kind, 'charter');
    assert.equal(e(id).event_date, '2025-04-18');
  }
});
