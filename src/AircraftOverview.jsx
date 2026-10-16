import React, { useState } from "react";
import utilization from "../data/aircraft-utilization.json";

export default function AircraftOverview({ aircraft: x, Source }) {
  const [tailQuery, setTailQuery] = useState("");
  const registrations = (x.registrations?.records || []).filter((r) =>
    r.tail.toLowerCase().includes(tailQuery.trim().toLowerCase()),
  );
  return (
    <div className="aircraft-overview">
      {x.ownership && <section className="aircraft-ownership"><h4>自有與租賃</h4><p>{x.ownership.value}</p><details><summary>統計日期與範圍</summary><p>{x.ownership.note}</p><Source item={x.ownership} compact /></details></section>}
      <section className="aircraft-missions">
        <h4>航線與任務</h4>
        <p>{x.main_routes?.value || "Data pending verification"}</p>
        <p className="fineprint">
          {x.main_routes?.note ||
            "派飛機型可能隨日期與營運調整；請以當日官方訂位與航班資料為準。"}
        </p>
        <Source item={x.main_routes} compact />
      </section>
      {x.registrations && (
        <section className="aircraft-registrations">
          <details>
            <summary>
              機身編號 · {x.registrations.records.length} 架 ·{" "}
              {x.registrations.as_of}
            </summary>
            <p className="fineprint">{x.registrations.note}</p>
            <label>
              搜尋機身編號
              <input
                aria-label={`${x.aircraft_type} 搜尋機身編號`}
                value={tailQuery}
                onChange={(e) => setTailQuery(e.target.value)}
                placeholder="例如 B-58501"
              />
            </label>
            <p className="fineprint">
              顯示 {registrations.length} / {x.registrations.records.length}{" "}
              架。機齡為來源基準日數值；出廠日期不等於交付日期。登記不代表當日可執飛。
            </p>
            {!registrations.length && <p>沒有符合的機身編號。</p>}
            <div className="registration-list">
              {registrations.map((r) => (
                <div key={r.tail}>
                  <strong>{r.tail}</strong>
                  <span>出廠 {r.manufactured}</span>
                  <span>機齡 {r.age_years.toFixed(2)} 年</span>
                  <span>型別 {r.type}</span>
                  {r.history && (
                    <details>
                      <summary>機身歷史</summary>
                      <p>{r.history.value}</p>
                      <Source item={r.history} compact />
                    </details>
                  )}
                  {utilization.records[r.tail] && (
                    <details>
                      <summary>
                        飛行時數與維修快照 · {utilization.as_of}
                      </summary>
                      <p>
                        累積飛行 {utilization.records[r.tail].flight_hours}
                        （小時:分鐘）
                      </p>
                      <p>
                        累積起降{" "}
                        {utilization.records[r.tail].cycles.toLocaleString()} 次
                      </p>
                      <p>
                        最近 C-check：
                        {utilization.records[r.tail].last_c_check || "來源未填"}
                      </p>
                      <p className="fineprint">
                        {utilization.note} 原表第{" "}
                        {utilization.records[r.tail].source_page} 頁。
                      </p>
                      <Source item={utilization} compact />
                    </details>
                  )}
                </div>
              ))}
            </div>
            <Source item={x.registrations} compact />
          </details>
        </section>
      )}
      <section className="aircraft-intro">
        <h4>機型介紹</h4>
        <p>{x.introduction?.value || "Data pending verification"}</p>
        <Source item={x.introduction} compact />
      </section>
      {x.design && <section className="aircraft-design"><h4>客艙設計風格與理念</h4><strong>{x.design.theme}</strong><p>{x.design.value}</p><details><summary>設計元素、寓意與面試應用</summary><p>{x.design.elements}</p><p><b>面試應用（本站整理）：</b>{x.design.interview}</p>{x.design.note && <p className="fineprint">{x.design.note}</p>}</details><Source item={x.design} compact />{x.design.upgrade && <><p>{x.design.upgrade.value}</p><Source item={x.design.upgrade} compact /></>}</section>}
      <section className="aircraft-engine">
        <h4>使用引擎</h4>
        <strong>{x.engine?.value || "Data pending verification"}</strong>
        {x.engine?.note && <p className="fineprint">{x.engine.note}</p>}
        <Source item={x.engine} compact />
      </section>
      <section className="aircraft-cabins">
        <h4>總座位數與艙等配置</h4>
        {x.kind === "cargo" ? (
          <p>不適用（全貨機；不提供客運座位）。</p>
        ) : x.cabin_configurations?.layouts?.length ? (
          x.cabin_configurations.layouts.map((layout) => (
            <div className="cabin-layout" key={layout.name}>
              <div className="cabin-total">
                <span>{layout.name}</span>
                <strong>
                  {layout.total}
                  <small> 席</small>
                </strong>
              </div>
              <dl>
                {layout.cabins.map((c) => (
                  <div key={c.name}>
                    <dt>{c.name}</dt>
                    <dd>{c.seats} 席</dd>
                  </div>
                ))}
              </dl>
              {layout.source_url && (
                <a
                  className="seat-map-link"
                  href={layout.source_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  此配置官方座位圖 ↗
                </a>
              )}
            </div>
          ))
        ) : (
          <p>{x.typical_seats.value || "Data pending verification"}</p>
        )}
        <p className="fineprint">
          {x.cabin_configurations?.note || x.typical_seats.note}
        </p>
        <Source item={x.cabin_configurations || x.typical_seats} compact />
      </section>
    </div>
  );
}
