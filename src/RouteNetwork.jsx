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
import cargoRoutes from "../data/cargo-routes.json";
import events from "../data/events.json";
import plannedRoutes from "../data/planned-routes.json";
import EventDates from "./EventDates.jsx";
import { formatEventDate } from "./event-dates.mjs";
import ciFleet from "../data/china-airlines/fleet.json";
import evaFleet from "../data/eva-air/fleet.json";
import jxFleet from "../data/starlux/fleet.json";

const airlines = [ci, eva, jx];
const taipeiDate = () => new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const expiredSchedule = r => { const e=r.flight_number_evidence || r.schedule_evidence; return e?.valid_to && e.valid_to < taipeiDate(); };
const routes = [...ciRoutes.items, ...evaRoutes.items, ...jxRoutes.items];
const routeEvent = (r) => {
  const records = (r.event_ids || []).map(id => events.find(e => e.id === id)).filter(Boolean);
  return records.find(e => e.event_type === "inaugural" && e.event_date)
    || records.find(e => e.event_date)
    || records.find(e => e.event_type === "inaugural");
};
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
  const mapRef = useRef();
  useEffect(() => {
    setAir(initial);
    setOrigin("all");
    setRegion("all");
    setAircraft("all");
  }, [initial]);
  const cargoMode = aircraft === "cargo-all" || Object.values(fleets).some(f => f.items.some(x => x.kind === "cargo" && x.aircraft_type === aircraft));
  const activeRoutes = cargoMode ? cargoRoutes.items : routes;
  const filtered = activeRoutes
    .filter(
      (r) =>
        (air === "all" || r.airline === air) &&
        (evidence === "all" ||
          (evidence === "operating"
            ? r.status === "confirmed"
            : evidence === "dated"
              ? Boolean(routeEvent(r)?.event_date)
              : r.evidence_kind === "published_schedule_snapshot")) &&
        (origin === "all" || r.origin === origin) &&
        (aircraft === "all" || aircraft === "cargo-all" ||
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
  const cargoOptions = [...new Set(Object.entries(fleets)
    .filter(([id]) => air === "all" || id === air)
    .flatMap(([, f]) => f.items.filter(x => x.kind === "cargo" && x.status === "confirmed").map(x => x.aircraft_type)))].sort();
  const cargoSelected = cargoMode;
  const origins = [
    ...new Set(
      activeRoutes
        .filter((r) => air === "all" || r.airline === air)
        .map((r) => r.origin),
    ),
  ];
  useEffect(() => {
    setTileError(false);
    const map = L.map(ref.current, {
      scrollWheelZoom: false,
      worldCopyJump: false,
      minZoom: 2,
      maxZoom: 10,
      maxBounds: [[-85, -30], [85, 330]],
      maxBoundsViscosity: 1,
      zoomAnimation: false,
    }).setView([32, 165], 2);
    mapRef.current = map;
    const tiles = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 12,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    ).addTo(map);
    tiles.on("tileerror", () => setTileError(true));
    const labelledAirports = new Set();
    for (const r of filtered) {
      const from = airports.items[r.origin],
        to = airports.items[r.destination],
        color = airlineById(r.airline).color,
        path = greatCircle([from.lat, from.lng < -30 ? from.lng + 360 : from.lng], [to.lat, to.lng]),
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
      const marker = L.circleMarker([to.lat, lng], {
        radius: 5,
        color,
        fillColor: color,
        fillOpacity: 1,
      })
        .addTo(map)
        .bindPopup(content);
      if (!labelledAirports.has(r.destination)) {
        marker.bindTooltip(r.destination, {permanent:true, direction:"right", className:"airport-label", offset:[8,0]});
        labelledAirports.add(r.destination);
      }
    }
    for (const code of new Set(filtered.map((r) => r.origin))) {
      const a = airports.items[code];
      const originMarker = L.circleMarker([a.lat, a.lng < -30 ? a.lng + 360 : a.lng], {
        radius: 7,
        color: "#163851",
        fillColor: "#fff",
        fillOpacity: 1,
      })
        .addTo(map)
        .bindPopup(code + " " + a.name)
        .bindTooltip(code, {permanent:true,direction:"left",className:"airport-label airport-origin",offset:[-8,0]});
    }
    const resize = new ResizeObserver(() => map.invalidateSize({pan:false, debounceMoveend:true}));
    resize.observe(ref.current);
    return () => {
      resize.disconnect();
      mapRef.current = null;
      map.remove();
    };
  }, [air, origin, region, aircraft, evidence]);
  return (
    <section className="route-network" aria-label="自營航圖與航線表">
      <p className="fineprint">
        機場代碼在所有縮放層級均顯示；密集區域可放大或篩選航線，點選圓點查看中文機場名稱。地圖以球面大圓航線示意兩機場間路徑；虛線流動僅為視覺效果，非即時航班或實際飛航計畫。實際航路受空域、天氣與航管等因素影響。
      </p>
      {air === "china-airlines" && <section className="official-network" aria-label="華航官方航網統計">
        <h3>官方全球航網 · 含合作與貨運</h3>
        <p className="official-network-total"><strong>{ci.network.value} 個航點</strong> · {ci.network.countries} 個國家／地區</p>
        <p>資料截至 {ci.network.as_of}。{ci.network.scope}</p>
        <ul className="official-network-regions">{ci.network.regions.map(r => <li key={r.label}>{r.label} <b>{r.value}</b></li>)}</ul>
        <details><summary>統計範圍與區域分類</summary><p>{ci.network.note}</p><p>官網符號：* 純貨運；@ 與其他業者合營；☆ 華信班號。下方地圖依機型選擇呈現本站已收錄的客運或貨機航段，不能拿收錄數代表官方完整航網。</p></details>
        <Source item={ci.network} compact />
      </section>}
      <div className="network-heading">
        <h3>{cargoMode ? "貨機實際航段 · 歷史紀錄" : "本站已收錄的自營客運航網"}</h3>
        <div className="network-totals">
          <strong>
            已收錄 {filtered.length} 條航線 ·{" "}
            {new Set(filtered.map((r) => r.destination)).size} 個航點
          </strong>
          <small>目前篩選的收錄紀錄 · 航點以目的地機場去重</small>
        </div>
      </div>
      {cargoSelected && <p role="status" className="notice">貨機航段為已降落航班的歷史紀錄，包含機身編號及班號；不是首航日期或今日完整班表。日期沿用來源列表。最新安排請查閱 <a href="https://cargo.china-airlines.com/" target="_blank" rel="noreferrer">華航貨運</a> 或 <a href="https://www.brcargo.com/NEC_WEB/Schedule/DailySchedule/Index" target="_blank" rel="noreferrer">長榮貨運班表</a>。客機腹艙載貨不列為全貨機航線。</p>}
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
            onChange={(e) => { setAircraft(e.target.value); setOrigin("all"); setEvidence("all"); }}
          >
            <option value="all">全部客機與待查核</option>
            <optgroup label="客機">{aircraftOptions.map((t) => (
              <option key={t}>{t}</option>
            ))}
            </optgroup>
            <optgroup label="貨機">{cargoOptions.length > 0 && <option value="cargo-all">全部貨機</option>}{cargoOptions.map(t => <option key={t} value={t}>{t}（貨機）</option>)}</optgroup>
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
            <option value="dated">已有首航／復航日期</option>
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
      <button type="button" className="map-reset" onClick={() => mapRef.current?.setView([32,165],2,{animate:false})}>重設航圖視野</button>
      <div
        ref={ref}
        className="route-map"
        aria-label="有日期來源的自營航網示意圖"
      />
      {tileError && (
        <p className="notice">
          底圖暫時無法載入；已查核航線仍可由下方清單閱讀。
        </p>
      )}
      <p className="fineprint">
        {activeRoutes.length}
        筆目前模式的航網紀錄，包含來源基準日不同的歷史快照，非今日完整班表。連線為航網示意，非導航航路。共掛與interline銜接不算自營；貨運運量另見客貨運表，不將腹艙貨運畫成獨立貨機航線。
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
                  <th scope="col">機型／首航與復航</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, index) => {
                  const event = routeEvent(r);
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

                        </td>
                        <td data-label="機型／首航與復航">
                          <strong>{r.aircraft || "機型待查核"}</strong>
                          {r.observed_flight && <p className="route-flight-numbers"><strong>{r.observed_flight} · {r.registration}</strong><small>實飛紀錄：{r.as_of} · 單向航段，非固定班表</small></p>}
                          {(r.flight_number_evidence || r.schedule_evidence?.flight_numbers) && <div className="route-flight-numbers">
                            {expiredSchedule(r) && <small>歷史班表（已超過來源適用期間）</small>}
                            {r.flight_number_evidence ? <>
                              <strong>去程 {r.flight_number_evidence.outbound} · 回程 {r.flight_number_evidence.inbound}</strong>
                              <small>{r.flight_number_evidence.period_label || (r.flight_number_evidence.valid_to ? r.flight_number_evidence.valid_from + '～' + r.flight_number_evidence.valid_to : '官網快照 2026-10-23（適用期間未明示）')}</small>
                              <Source item={r.flight_number_evidence} compact />
                            </> : <><strong>班號 {r.schedule_evidence.flight_numbers}</strong><small>歷史班表：{r.schedule_evidence.valid_from}～{r.schedule_evidence.valid_to}</small></>}
                          </div>}

                          {r.next_schedule && <details className="route-next-schedule"><summary>冬季班表 · {r.next_schedule.valid_from}～{r.next_schedule.valid_to}</summary><p>去程 {r.next_schedule.outbound} · 回程 {r.next_schedule.inbound}</p><p>{r.next_schedule.note}</p><Source item={r.next_schedule} compact /></details>}
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
                          {r.route_type !== "self_operated_cargo" && <p className="route-event-date">
                            <span>{event?.event_type === "resumption" ? "復航" : event?.service_kind === "charter" ? "包機首航" : "首航"}：</span>
                            <strong>{formatEventDate(event?.event_date)}</strong>
                          </p>}
                          {event?.event_type === "resumption" && <small>最早首航年月日仍待查核</small>}
                          {event?.announced_event_date && !event.event_date && (
                            <p>
                              預定{formatEventDate(event.announced_event_date)}
                              （實際首航另查）
                            </p>
                          )}
                          <Source item={{...r, note:[r.note,r.aircraft_note].filter(Boolean).join("；")}} compact />
                          {r.aircraft_evidence && <Source item={r.aircraft_evidence} compact />}
                          {(r.event_ids || []).map(id => {const e=events.find(e=>e.id===id);return e?<Source key={id} item={e} compact/>:null;})}
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
      {!cargoMode && plannedRoutes.some((r) => air === "all" || r.airline === air) && (
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
