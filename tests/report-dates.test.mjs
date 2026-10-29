import test from "node:test";
import assert from "node:assert/strict";
import { taipeiDay, taipeiWeek, latestVerified } from "../src/report-dates.mjs";
test("Weekly reports use Taipei Monday boundaries, including year rollover", () => {
  assert.equal(taipeiDay(new Date("2026-10-25T16:00:00Z")), "2026-10-26");
  assert.deepEqual(taipeiWeek(new Date("2026-10-25T15:59:00Z")), {
    start: "2026-10-19",
    end: "2026-10-25",
  });
  assert.deepEqual(taipeiWeek(new Date("2026-10-25T16:00:00Z")), {
    start: "2026-10-26",
    end: "2026-11-01",
  });
  assert.deepEqual(taipeiWeek(new Date("2027-01-01T00:00:00Z")), {
    start: "2026-12-28",
    end: "2027-01-03",
  });
  assert.equal(
    latestVerified([
      { verified_date: "2026-10-24" },
      { published_date: "2026-10-28" },
      { verified_date: "2026-10-27" },
    ]),
    "2026-10-27",
  );
});

import fs from "node:fs";
test("Edited weekly digest resolves original evidence without relabeling old announcements", () => {
  const edition = JSON.parse(
    fs.readFileSync("data/weekly-edition.json", "utf8"),
  );
  const news = JSON.parse(fs.readFileSync("data/weekly-updates.json", "utf8"));
  assert.deepEqual(taipeiWeek(new Date(`${edition.edited_date}T04:00:00Z`)), {
    start: edition.period_start,
    end: edition.period_end,
  });
  assert.equal(
    new Set(edition.items.map((item) => item.news_id)).size,
    edition.items.length,
  );
  for (const item of edition.items) {
    const source = news.find((n) => n.id === item.news_id);
    assert.ok(source && source.source_url.startsWith("https://"));
    assert.ok(source.verified_date <= edition.edited_date);
    assert.ok(source.published_date < edition.period_start);
    assert.ok(item.tracking && item.focus && item.interview);
  }
});
