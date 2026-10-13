import React from "react";

export default function AircraftOverview({ aircraft: x, Source }) {
  return (
    <div className="aircraft-overview">
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
            <div className="registration-list">
              {x.registrations.records.map((r) => (
                <div key={r.tail}>
                  <strong>{r.tail}</strong>
                  <span>出廠 {r.manufactured}</span>
                  <span>機齡 {r.age_years.toFixed(2)} 年</span>
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
