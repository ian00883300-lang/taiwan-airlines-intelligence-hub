import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import airports from "../data/airports.json";
import ci from "../data/china-airlines/overview.json";
import eva from "../data/eva-air/overview.json";
import jx from "../data/starlux/overview.json";
import ciRoutes from "../data/china-airlines/routes.json";
import evaRoutes from "../data/eva-air/routes.json";
import jxRoutes from "../data/starlux/routes.json";
import events from "../data/events.json";
import EventDates from "./EventDates.jsx";
import { formatEventDate } from "./event-dates.mjs";

const airlines = [ci, eva, jx];
const routes = [...ciRoutes.items, ...evaRoutes.items, ...jxRoutes.items];
const regions = [
  "Taiwan",
  "Asia",
  "Japan",
  "Korea",
  "China",
  "Southeast Asia",
  "North America",
  "Europe",
  "Oceania",
];
const airlineById = (id) => airlines.find((a) => a.id === id);

export default function RouteNetwork({ initial = "all", Source }) {
  const [air, setAir] = useState(initial),
    [region, setRegion] = useState("all"),
    [origin, setOrigin] = useState("all"),
    [tileError, setTileError] = useState(false);
  const ref = useRef();
  const filtered = routes.filter(
    (r) =>
      (air === "all" || r.airline === air) &&
      (origin === "all" || r.origin === origin) &&
      (region === "all" ||
        r.region === region ||
        (region === "Taiwan" && airports.items[r.origin].region === "Taiwan") ||
        (region === "Asia" &&
          ["Japan", "Korea", "China", "Southeast Asia"].includes(r.region))),
  );
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
        lng = to.lng < 0 ? to.lng + 360 : to.lng;
      L.polyline(
        [
          [from.lat, from.lng],
          [to.lat, lng],
        ],
        { color, weight: 2.5, opacity: 0.7 },
      ).addTo(map);
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
  }, [air, origin, region]);
  return (
    <section className="route-network" aria-label="自營客運航圖與航線表">
      <div className="filters">
        <label>
          航空公司
          <select
            value={air}
            onChange={(e) => {
              setAir(e.target.value);
              setOrigin("all");
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
          區域
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="all">全部區域</option>
            {regions.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label>
          出發機場
          <select value={origin} onChange={(e) => setOrigin(e.target.value)}>
            <option value="all">全部起點</option>
            {origins.map((code) => (
              <option key={code} value={code}>
                {code} · {airports.items[code].name}
              </option>
            ))}
          </select>
        </label>
        <span className="filter-count">{filtered.length} 條已收錄航線</span>
      </div>
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
              <caption>航線、來源基準與首航日期</caption>
              <thead>
                <tr>
                  <th scope="col">航空公司</th>
                  <th scope="col">起點 → 終點</th>
                  <th scope="col">區域／基準日</th>
                  <th scope="col">已核實首航</th>
                  <th scope="col">證據</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const event = r.event_ids
                    ?.map((id) => events.find((e) => e.id === id))
                    .find((e) => e?.event_type === "inaugural");
                  return (
                    <tr key={r.id}>
                      <th scope="row">{airlineById(r.airline).name}</th>
                      <td data-label="起點 → 終點">
                        <strong>
                          {r.origin} → {r.destination}
                        </strong>
                        <p>
                          {airports.items[r.origin].name} →{" "}
                          {airports.items[r.destination].name}
                        </p>
                      </td>
                      <td data-label="區域／基準日">
                        {r.region}
                        <p>
                          {r.as_of ? formatEventDate(r.as_of) : "未指定基準日"}
                        </p>
                        <small>
                          {r.evidence_kind === "dated_operating_snapshot"
                            ? "來源中的營運快照"
                            : "已收錄官方證據"}
                        </small>
                      </td>
                      <td data-label="已核實首航">
                        {formatEventDate(event?.event_date)}
                        {event?.announced_event_date && (
                          <p>
                            預定{formatEventDate(event.announced_event_date)}
                            （實際首航另查）
                          </p>
                        )}
                      </td>
                      <td data-label="證據">
                        <Source item={r} compact />
                        <details>
                          <summary>首航詳情</summary>
                          <EventDates ids={r.event_ids} />
                        </details>
                      </td>
                    </tr>
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
    </section>
  );
}
