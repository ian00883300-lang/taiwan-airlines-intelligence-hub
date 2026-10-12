import React, { useState } from "react";
import dossier from "../data/research-dossier.json";
import sourceCatalog from "../data/sources.json";
import identity from "../data/starlux/identity.json";
import { formatEventDate } from "./event-dates.mjs";

const names = {
  "china-airlines": "中華航空",
  "eva-air": "長榮航空",
  starlux: "星宇航空",
};
const number = (value, digits = 0) =>
  Number(value).toLocaleString("zh-TW", { maximumFractionDigits: digits });

export function CompanyTimeline({ airline, Source }) {
  const records = dossier.airlines[airline].timeline;
  return (
    <section className="company-timeline" aria-label="公司歷史時間軸">
      <p className="fineprint">
        成立、營運、上市、首航、交機與公告分開標示；公告日不直接代表事件日。
      </p>
      <ol>
        {records.map((record, index) => (
          <li key={record.date + record.label}>
            <time dateTime={record.date}>{formatEventDate(record.date)}</time>
            <div>
              <span className="timeline-kind">
                {
                  {
                    event: "事件",
                    announcement: "公告發布",
                    snapshot: "歷史快照",
                  }[record.date_kind]
                }
              </span>
              <h3>{record.label}</h3>
              <p>{record.body}</p>
              <Source item={record} compact />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function CompanyIdentity({ a, Source }) {
  const records =
    a.id === "starlux"
      ? identity.facts
      : [
          ...a.sections.overview,
          ...a.sections.governance,
          ...a.sections.organization,
          ...a.sections.brand,
        ];
  return (
    <section className="company-identity" aria-label="公司與品牌資料表">
      <div className="table-wrap research-table">
        <table>
          <caption>公司、品牌與治理資料</caption>
          <thead>
            <tr>
              <th scope="col">項目</th>
              <th scope="col">公開資料</th>
              <th scope="col">基準與來源</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={index}>
                <th scope="row">{record.label || record.title}</th>
                <td>
                  {record.value != null
                    ? typeof record.value === "number"
                      ? number(record.value) + " " + (record.unit || "")
                      : record.value
                    : record.body || "尚待官方資料查核"}
                </td>
                <td>
                  {record.as_of || "來源未指定基準日"}
                  <Source item={record} compact />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {a.id === "starlux" && (
        <>
          <div className="table-wrap research-table">
            <table>
              <caption>
                主要法人股東 · {formatEventDate(identity.shareholders.as_of)}
              </caption>
              <thead>
                <tr>
                  <th scope="col">股東</th>
                  <th scope="col">股數</th>
                  <th scope="col">持股比例</th>
                </tr>
              </thead>
              <tbody>
                {identity.shareholders.rows.map((row) => (
                  <tr key={row.name}>
                    <th scope="row">{row.name}</th>
                    <td>{number(row.shares)} 股</td>
                    <td>{row.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>{identity.shareholders.note}</p>
          <Source item={identity.shareholders} />
        </>
      )}
    </section>
  );
}

export function TrafficComparison({ airline, Source }) {
  const [metric, setMetric] = useState("passenger");
  const data = dossier.traffic;
  const passenger = metric === "passenger";
  return (
    <section className="traffic-comparison" aria-label="同口徑客貨運比較">
      <h3>{data.title}</h3>
      <p>{data.scope}</p>
      <div className="segmented" role="group" aria-label="客貨運指標">
        <button
          aria-pressed={passenger}
          className={passenger ? "active" : ""}
          onClick={() => setMetric("passenger")}
        >
          客運指標
        </button>
        <button
          aria-pressed={!passenger}
          className={!passenger ? "active" : ""}
          onClick={() => setMetric("cargo")}
        >
          貨運指標
        </button>
      </div>
      <div className="table-wrap research-table traffic-table">
        <table>
          <caption>
            {passenger
              ? "2025客運：運量、運能與載客率"
              : "2025貨運：噸數、噸公里與載貨率"}
          </caption>
          <thead>
            <tr>
              <th scope="col">航空公司</th>
              <th scope="col">{passenger ? "載客人次" : "貨運公噸"}</th>
              <th scope="col">
                {passenger ? "RPK（百萬人公里）" : "FTK（百萬噸公里）"}
              </th>
              <th scope="col">
                {passenger ? "ASK（百萬位公里）" : "AFTK（百萬噸公里）"}
              </th>
              <th scope="col">{passenger ? "載客率" : "載貨率"}</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr
                key={row.airline}
                className={row.airline === airline ? "selected-airline" : ""}
              >
                <th scope="row">{names[row.airline]}</th>
                <td>{number(passenger ? row.passengers : row.cargo_tonnes)}</td>
                <td>
                  {number(
                    (passenger ? row.rpk_thousand : row.ftk_thousand) / 1000,
                    3,
                  )}
                </td>
                <td>
                  {number(
                    (passenger ? row.ask_thousand : row.aftk_thousand) / 1000,
                    3,
                  )}
                </td>
                <td>
                  {number(
                    passenger
                      ? row.passenger_load_factor
                      : row.cargo_load_factor,
                    2,
                  )}
                  %
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="metric-definition">
        {passenger
          ? "RPK＝付費旅客×飛行距離；ASK＝可供座位×飛行距離；載客率＝RPK／ASK。人次與人公里描述不同的運量。"
          : "FTK＝貨物重量×運送距離；AFTK＝可供貨運能力×飛行距離；載貨率＝FTK／AFTK。噸數不能代替噸公里。"}
      </p>
      <p className="fineprint">{data.note}</p>
      <Source item={data} />
    </section>
  );
}

export function RevenueMix({ airline, Source }) {
  const mix = dossier.airlines[airline].revenue_mix;
  return (
    <section className="revenue-mix" aria-label="客貨運營收結構">
      <div className="table-wrap research-table">
        <table>
          <caption>
            {names[airline]} · 2025營收結構（{mix.unit}）
          </caption>
          <thead>
            <tr>
              <th scope="col">業務</th>
              <th scope="col">營收</th>
              <th scope="col">同範圍占比</th>
            </tr>
          </thead>
          <tbody>
            {mix.parts.map((part) => (
              <tr key={part.name}>
                <th scope="row">{part.name}</th>
                <td>{number(part.amount)}</td>
                <td>
                  {mix.total
                    ? number((part.amount / mix.total) * 100, 2) + "%"
                    : "缺少同口徑完整合計，不計算"}
                </td>
              </tr>
            ))}
          </tbody>
          {mix.total && (
            <tfoot>
              <tr>
                <th scope="row">合計</th>
                <td>{number(mix.total)}</td>
                <td>100%</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <p>{mix.scope}</p>
      <Source item={mix} />
    </section>
  );
}

export function OperationsResearch({ airline, Source }) {
  const model = dossier.airlines[airline].operating_model;
  return (
    <>
      <article className="panel operating-model">
        <h3>{model.title}</h3>
        <p>{model.body}</p>
        <Source item={model} />
      </article>
      <TrafficComparison airline={airline} Source={Source} />
      <RevenueMix airline={airline} Source={Source} />
    </>
  );
}

export function StrategyResearch({ airline, Source }) {
  return (
    <section className="strategy-research" aria-label="策略、證據與風險表">
      <p className="notice">
        官方事實與研究解讀分列。追蹤指標是分析框架，不代表公司已公布每一個數值；計畫不當作已實現。
      </p>
      <div className="table-wrap research-table">
        <table>
          <caption>{names[airline]} · 策略、營運含義與追蹤指標</caption>
          <thead>
            <tr>
              <th scope="col">方向</th>
              <th scope="col">官方事實與來源</th>
              <th scope="col">營運／商業解讀</th>
              <th scope="col">追蹤指標與風險</th>
            </tr>
          </thead>
          <tbody>
            {dossier.airlines[airline].strategy.map((row) => (
              <tr key={row.theme}>
                <th scope="row" data-label="方向">
                  {row.theme}
                  <small>{row.stage}</small>
                </th>
                <td data-label="官方事實與來源">
                  {row.official_fact}
                  <Source item={row} compact />
                  {(row.supporting_source_ids || []).map((id) => (
                    <Source
                      key={id}
                      item={sourceCatalog.find((source) => source.id === id)}
                      compact
                    />
                  ))}
                </td>
                <td data-label="營運／商業解讀">{row.analysis}</td>
                <td data-label="追蹤指標與風險">
                  <strong>指標</strong>
                  <p>{row.kpi}</p>
                  <strong>風險</strong>
                  <p>{row.risk}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function EarningsBridge({ Source }) {
  const e = identity.earnings;
  const rows = [
    ["營業收入", e.revenue_thousand],
    ["營業利益", e.operating_income_thousand],
    ["財務成本（費用）", e.finance_cost_thousand],
    ["稅前淨利", e.pretax_income_thousand],
    ["所得稅利益", e.income_tax_benefit_thousand],
    ["本期淨利", e.net_income_thousand],
  ];
  return (
    <section aria-label="星宇損益與EPS分析">
      <div className="table-wrap research-table">
        <table>
          <caption>星宇2025個別損益重點 · 新臺幣仟元</caption>
          <thead>
            <tr>
              <th scope="col">項目</th>
              <th scope="col">金額</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, value]) => (
              <tr key={name}>
                <th scope="row">{name}</th>
                <td>{number(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        基本EPS {e.eps} 元／股；淨利率約
        {number((e.net_income_thousand / e.revenue_thousand) * 100, 2)}
        %。財務成本不是全部營業外損益，表列項目不能直接逐列相加。
      </p>
      <p>{e.note}</p>
      <Source item={e} />
    </section>
  );
}
