import RouteDistribution from "./RouteDistribution.jsx";
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { greatCircle } from "./great-circle.mjs";
import airports from "../data/airports.json";
import ci from "../data/china-airlines/overview.json";
import eva from "../data/eva-air/overview.json";
import jx from "../data/starlux/overview.json";
import ciRoutes from "../data/china-airlines/routes.json";
import evaRoutes from "../data/eva-air/routes.json";
import jxRoutes from "../data/starlux/routes.json";
import events from "../data/events.json";
import plannedRoutes from "../data/planned-routes.json";
import EventDates from "./EventDates.jsx";
import { formatEventDate } from "./event-dates.mjs";
import ciFleet from "../data/china-airlines/fleet.json";
import evaFleet from "../data/eva-air/fleet.json";
import jxFleet from "../data/starlux/fleet.json";

const airlines = [ci, eva, jx];
const routes = [...ciRoutes.items, ...evaRoutes.items, ...jxRoutes.items];
const airlineById = (id) => airlines.find((a) => a.id === id);
const continents = {
  Asia: "亞洲",
  "North America": "北美洲",
  Europe: "歐洲",
  Oceania: "大洋洲",
  "South America": "南美洲",
  Africa: "非洲",
};
const continent = (r) =>
  ["Taiwan", "Japan", "Korea", "China", "Southeast Asia", "Asia"].includes(
    r.region,
  )
    ? "Asia"
    : r.region;
const fleets = {
  "china-airlines": ciFleet,
  "eva-air": evaFleet,
  starlux: jxFleet,
};
const aircraftOf = (r) =>
  [r.aircraft, r.schedule_evidence?.value]
    .filter(Boolean)
    .join(" / ")
    .match(/A\d{3}(?:-\d{3,4}|neo)?|(?:B)?7\d{2}(?:-\d{3}(?:ER)?)?F?/g) || [];

export default function RouteNetwork({ initial = "all", Source }) {
  const [air, setAir] = useState(initial),
    [region, setRegion] = useState("all"),
    [evidence, setEvidence] = useState("all"),
    [origin, setOrigin] = useState("all"),
    [aircraft, setAircraft] = useState("all"),
    [tileError, setTileError] = useState(false);
  const ref = useRef();
  useEffect(() => {
    setAir(initial);
    setOrigin("all");
    setRegion("all");
    setAircraft("all");
  }, [initial]);
  const filtered = routes
    .filter(
      (r) =>
        (air === "all" || r.airline === air) &&
        (evidence === "all" ||
          (evidence === "operating"
            ? r.status === "confirmed"
            : r.evidence_kind === "published_schedule_snapshot")) &&
        (origin === "all" || r.origin === origin) &&
        (aircraft === "all" ||
          (aircraft === "unknown"
            ? !aircraftOf(r).length
            : aircraftOf(r).includes(aircraft))) &&
        (region === "all" ||
          continent(r) === region ||
          (region === "Taiwan" &&
            airports.items[r.origin].region === "Taiwan") ||
          (region === "Asia" &&
            ["Japan", "Korea", "China", "Southeast Asia"].includes(r.region))),
    )
    .sort(
      (a, b) =>
        Object.keys(continents).indexOf(continent(a)) -
          Object.keys(continents).indexOf(continent(b)) ||
        a.origin.localeCompare(b.origin) ||
        airports.items[a.destination].name.localeCompare(
          airports.items[b.destination].name,
          "zh-TW",
        ),
    );
  const aircraftOptions = [
    ...new Set(
      Object.entries(fleets)
        .filter(([id]) => air === "all" || id === air)
        .flatMap(([, f]) =>
          f.items
            .filter((x) => x.kind === "passenger")
            .map((x) => x.aircraft_type),
        ),
    ),
  ].sort();
  const origins = [
    ...new Set(
      routes
        .filter((r) => air === "all" || r.airline === air)
        .map((r) => r.origin),
    ),
  ];
  useEffect(() => {
    setTileError(false);
    const map = L.map(ref.current, {
      scrollWheelZoom: false,
      worldCopyJump: true,
    }).setView([32, 165], 2);
    const tiles = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 12,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    ).addTo(map);
    tiles.on("tileerror", () => setTileError(true));
    for (const r of filtered) {
      const from = airports.items[r.origin],
        to = airports.items[r.destination],
        color = airlineById(r.airline).color,
        path = greatCircle([from.lat, from.lng], [to.lat, to.lng]),
        lng = path.at(-1)[1];
      L.polyline(path, {
        color,
        weight: 2.5,
        opacity: 0.8,
        dashArray: "7 9",
        className: "route-flow",
      }).addTo(map);
      const content = document.createElement("span");
      content.textContent = `${airlineById(r.airline).name} · ${r.origin} ${from.name} → ${r.destination} ${to.name} · 來源基準 ${r.as_of || "未指定"}`;
      L.circleMarker([to.lat, lng], {
        radius: 5,
        color,
        fillColor: color,
        fillOpacity: 1,
      })
        .addTo(map)
        .bindPopup(content);
    }
    for (const code of new Set(filtered.map((r) => r.origin))) {
      const a = airports.items[code];
      L.circleMarker([a.lat, a.lng], {
        radius: 7,
        color: "#163851",
        fillColor: "#fff",
        fillOpacity: 1,
      })
        .addTo(map)
        .bindPopup(code + " " + a.name);
    }
    const resize = new ResizeObserver(() => map.invalidateSize());
    resize.observe(ref.current);
    return () => {
      resize.disconnect();
      map.remove();
    };
  }, [air, origin, region, aircraft, evidence]);
  return (
    <section className="route-network" aria-label="自營客運航圖與航線表">
      <p className="fineprint">
        地圖以球面大圓航線示意兩機場間路徑；虛線流動僅為視覺效果，非即時航班或實際飛航計畫。實際航路受空域、天氣與航管等因素影響。
      </p>
      <div className="network-heading">
        <h3>自營客運航網</h3>
        <div className="network-totals">
          <strong>
            {filtered.length} 條航線 ·{" "}
            {new Set(filtered.map((r) => r.destination)).size} 個航點
          </strong>
          <small>目前篩選的收錄紀錄 · 航點以目的地機場去重</small>
        </div>
      </div>
      <RouteDistribution
        routes={filtered}
        continents={continents}
        continent={continent}
      />
      <div className="filters network-filters">
        <label>
          選擇機型
          <select
            aria-label="選擇機型"
            value={aircraft}
            onChange={(e) => setAircraft(e.target.value)}
          >
            <option value="all">全部機型與待查核</option>
            {aircraftOptions.map((t) => (
              <option key={t}>{t}</option>
            ))}
            <option value="unknown">機型資料待查核</option>
          </select>
        </label>
        <label>
          航空公司
          <select
            aria-label="航空公司"
            value={air}
            onChange={(e) => {
              setAir(e.target.value);
              setOrigin("all");
              setAircraft("all");
            }}
          >
            <option value="all">全部航空公司</option>
            {airlines.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          洲別
          <select
            aria-label="洲別"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="all">全部洲別</option>
            {Object.entries(continents).map(([r, name]) => (
              <option key={r} value={r}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          出發機場
          <select value={origin} onChange={(e) => setOrigin(e.target.value)}>
            <option value="all">全部起點</option>
            {[true, false].map((taiwan) => (
              <optgroup
                key={String(taiwan)}
                label={taiwan ? "台灣出發" : "海外延伸航段"}
              >
                {origins
                  .filter(
                    (code) =>
                      (airports.items[code].region === "Taiwan") === taiwan,
                  )
                  .map((code) => (
                    <option key={code} value={code}>
                      {code} · {airports.items[code].name}
                      {code === "BNE" ? "（澳洲）" : ""}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label>
          證據範圍
          <select
            aria-label="證據範圍"
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
          >
            <option value="all">全部來源紀錄</option>
            <option value="operating">開航／營運證據</option>
            <option value="historical">僅期間班表公告</option>
          </select>
        </label>
        <span className="filter-count">
          {filtered.length} 條航線 ·{" "}
          {new Set(filtered.map((r) => r.destination)).size} 個目的地機場
        </span>
      </div>
      <p className="fineprint">
        機型配置依來源日期與班表期間判讀，未收錄不代表未執飛。海外起點為延伸航段，不屬於台灣機場；此處航點數不含僅作起點的機場。
      </p>
      <ul className="network-legend">
        {airlines.map((a) => (
          <li key={a.id}>
            <i style={{ background: a.color }} />
            {a.name}
          </li>
        ))}
      </ul>
      <div
        ref={ref}
        className="route-map"
        aria-label="有日期來源的自營客運航網示意圖"
      />
      {tileError && (
        <p className="notice">
          底圖暫時無法載入；已查核航線仍可由下方清單閱讀。
        </p>
      )}
      <p className="fineprint">
        {routes.length}
        筆自營客運航網紀錄，包含來源基準日不同的歷史快照，非今日完整班表。連線為航網示意，非導航航路。共掛與interline銜接不算自營；貨運運量另見客貨運表，不將腹艙貨運畫成獨立貨機航線。
      </p>
      <div className="route-list mobile-records">
        {filtered.length ? (
          <div className="table-wrap research-table route-table">
            <table>
              <caption>
                {aircraft !== "all"
                  ? `${aircraft === "all" ? "全部" : aircraft} · 已查核機型航線`
                  : "按目的地所在洲別分類"}{" "}
                · 航線與日期
              </caption>
              <thead>
                <tr>
                  <th scope="col">航空公司</th>
                  <th scope="col">起點 → 終點</th>
                  <th scope="col">區域／基準日</th>
                  <th scope="col">機型／已核實首航</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, index) => {
                  const event = r.event_ids
                    ?.map((id) => events.find((e) => e.id === id))
                    .find((e) => e?.event_type === "inaugural");
                  return (
                    <React.Fragment key={r.id}>
                      {(index === 0 ||
                        continent(filtered[index - 1]) !== continent(r)) && (
                        <tr className="continent-heading">
                          <th colSpan="4" scope="colgroup">
                            {continents[continent(r)] || continent(r)}{" "}
                            <small>
                              {
                                filtered.filter(
                                  (x) => continent(x) === continent(r),
                                ).length
                              }{" "}
                              條航線
                            </small>
                          </th>
                        </tr>
                      )}
                      <tr data-route={r.id}>
                        <th scope="row">{airlineById(r.airline).name}</th>
                        <td data-label="起點 → 終點">
                          <strong>
                            <abbr
                              tabIndex={0}
                              title={`${r.origin} · ${airports.items[r.origin].name}機場`}
                            >
                              {r.origin}
                            </abbr>{" "}
                            →{" "}
                            <abbr
                              tabIndex={0}
                              title={`${r.destination} · ${airports.items[r.destination].name}機場`}
                            >
                              {r.destination}
                            </abbr>
                          </strong>
                          <p>
                            {airports.items[r.origin].name} →{" "}
                            {airports.items[r.destination].name}
                          </p>
                        </td>
                        <td data-label="區域／基準日">
                          {r.region}
                          <p>
                            {r.as_of
                              ? formatEventDate(r.as_of)
                              : "未指定基準日"}
                          </p>
                          <small>
                            {r.evidence_kind === "dated_operating_snapshot"
                              ? "來源中的營運快照"
                              : r.evidence_kind ===
                                  "published_schedule_snapshot"
                                ? "期間班表公告（非即時派飛）"
                                : "已收錄官方證據"}
                          </small>
                        </td>
                        <td data-label="機型／已核實首航">
                          <strong>{r.aircraft || "機型待查核"}</strong>
                          {r.schedule_evidence && (
                            <details>
                              <summary>班表期間與多機型配置</summary>
                              <p>
                                {r.schedule_evidence.value} ·{" "}
                                {r.schedule_evidence.flight_numbers}
                              </p>
                              <p>
                                {r.schedule_evidence.valid_from} 至{" "}
                                {r.schedule_evidence.valid_to}
                              </p>
                              <p>{r.schedule_evidence.note}</p>
                              <Source item={r.schedule_evidence} compact />
                            </details>
                          )}
                          <p>首航：</p>
                          {formatEventDate(event?.event_date)}
                          {event?.announced_event_date && !event.event_date && (
                            <p>
                              預定{formatEventDate(event.announced_event_date)}
                              （實際首航另查）
                            </p>
                          )}
                          <details className="inline-evidence">
                            <summary>來源與詳情</summary>
                            <Source item={r} compact />
                            {r.aircraft_note && (
                              <details>
                                <summary>機型配置說明</summary>
                                <p>{r.aircraft_note}</p>
                              </details>
                            )}
                            {r.aircraft_evidence && (
                              <div aria-label="機型證據">
                                <small>機型紀錄來源與日期</small>
                                <Source item={r.aircraft_evidence} compact />
                              </div>
                            )}
                            {!r.aircraft_evidence && r.aircraft_source_url && (
                              <a
                                href={r.aircraft_source_url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                機型任務來源 ↗
                              </a>
                            )}
                            <details>
                              <summary>首航詳情</summary>
                              <EventDates ids={r.event_ids} />
                            </details>
                          </details>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="pending">
            Data pending
            verification：此篩選尚無已查核航線，不代表航空公司未營運該區域。
          </p>
        )}
      </div>
      {plannedRoutes.some((r) => air === "all" || r.airline === air) && (
        <section aria-label="已公告待開航">
          <h3>已公告待開航</h3>
          <p className="fineprint">
            另列公告計畫，不計入上方航線紀錄及地圖；日期到期後仍需首航證據才會改為已營運。
          </p>
          {plannedRoutes
            .filter((r) => air === "all" || r.airline === air)
            .map((r) => (
              <article className="notice" key={r.origin + r.destination}>
                <h4>{r.title}</h4>
                <p>
                  {r.origin} → {r.destination} · {r.body}
                </p>
                <Source item={r} compact />
              </article>
            ))}
        </section>
      )}
    </section>
  );
}
