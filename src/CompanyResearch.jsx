import securities from "../data/securities.json";
import { change } from "./change.mjs";
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
          <li className="compact-event" key={record.date + record.label}>
            <div className="event-line">
              <strong>
                <time dateTime={record.date}>
                  {record.timeline_date_precision === "year"
                    ? `${record.date}年（日期未詳）`
                    : record.timeline_date_precision === "month"
                      ? `${record.date.slice(0, 4)}年${Number(record.date.slice(5))}月（日期未詳）`
                      : formatEventDate(record.date)}
                </time>{" "}
                —
              </strong>
              <span className="timeline-kind">
                {
                  {
                    event: "事件",
                    announcement: "公告發布",
                    snapshot: "歷史快照",
                  }[record.date_kind]
                }
              </span>
              <strong>{record.label}</strong>
              <span>{record.body}</span>
            </div>
            <Source item={record} compact />
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
    <section
      className="company-identity mobile-records"
      aria-label="公司與品牌資料表"
    >
      <div className="security-summary">
        <div>
          <span>臺灣證券交易所 · 股票代號</span>
          <strong>{securities[a.id].code}</strong>
          <b>{securities[a.id].name}</b>
        </div>
        <details>
          <summary>股票代號來源</summary>
          <Source item={securities[a.id]} compact />
        </details>
      </div>
      <div className="table-wrap research-table">
        <table>
          <caption>公司、品牌與治理資料</caption>
          <thead>
            <tr>
              <th scope="col">項目</th>
              <th scope="col">公開資料</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={index}>
                <th scope="row">{record.label || record.title}</th>
                <td data-label="公開資料">
                  {record.value != null
                    ? typeof record.value === "number"
                      ? number(record.value) + " " + (record.unit || "")
                      : record.value
                    : record.body || "尚待官方資料查核"}
                  <details className="inline-evidence">
                    <summary>基準與來源</summary>
                    {record.as_of || "來源未指定基準日"}
                    <Source item={record} compact />
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {dossier.airlines[a.id].group_entities && (
        <CompanyGroup airline={a.id} Source={Source} />
      )}
      {a.id === "starlux" && (
        <>
          <section className="brand-experience" aria-label="星宇企業識別與五感服務">
            <h3>品牌識別與服務體驗</h3>
            <div className="brand-meanings">
              {identity.brand_experience.colours.map(colour => (
                <article key={colour.name}>
                  <strong>{colour.name}</strong><small>{colour.time}</small>
                  <p>{colour.meaning}</p>
                </article>
              ))}
            </div>
            <details className="inline-evidence">
              <summary>識別色說明與來源</summary>
              <p>{identity.brand_experience.note}</p>
              <Source item={identity.brand_experience} compact />
            </details>
            <details className="brand-senses">
              <summary>{identity.brand_experience.senses.title}</summary>
              <p>{identity.brand_experience.senses.body}</p>
              <dl>{identity.brand_experience.senses.examples.map(item => (
                <div key={item.sense}><dt>{item.sense}</dt><dd>{item.example}</dd></div>
              ))}</dl>
              <p className="fineprint">{identity.brand_experience.senses.note}</p>
              <Source item={identity.brand_experience.senses} compact />
            </details>
          </section>
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
                    <td data-label="股數">{number(row.shares)} 股</td>
                    <td data-label="持股比例">{row.percent}%</td>
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

function CompanyGroup({ airline, Source }) {
  const record = dossier.airlines[airline].group_entities;
  return (
    <section className="company-group" aria-label="華航部分子公司與業務">
      <h3>集團業務與部分子公司</h3>
      <p>{record.scope}</p>
      <div className="table-wrap research-table">
        <table>
          <caption>業務分工與財報列示比例</caption>
          <thead>
            <tr>
              <th scope="col">公司</th>
              <th scope="col">主要業務</th>
              <th scope="col">集團觀點比例</th>
            </tr>
          </thead>
          <tbody>
            {record.rows.map((row) => (
              <tr key={row.name}>
                <th scope="row">{row.name}</th>
                <td data-label="主要業務">{row.business}</td>
                <td data-label="集團觀點比例">{row.ownership_percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="fineprint">
        {record.note} {record.citation}
      </p>
      <Source item={record} />
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
    <section className="revenue-mix mobile-records" aria-label="客貨運營收結構">
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
                <td data-label="營收">{number(part.amount)}</td>
                <td data-label="同範圍占比">
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
                <td data-label="合計營收">{number(mix.total)}</td>
                <td data-label="同範圍占比">100%</td>
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
      {dossier.airlines[airline].cargo_capabilities && (
        <CargoCapabilities airline={airline} Source={Source} />
      )}
    </>
  );
}

function CargoCapabilities({ airline, Source }) {
  const record = dossier.airlines[airline].cargo_capabilities;
  return (
    <section
      className="cargo-capabilities mobile-records"
      aria-label="星宇貨運CEIV認證與研究重點"
    >
      <h3>特殊貨物與CEIV能力</h3>
      <p>{record.scope}</p>
      <div className="table-wrap research-table">
        <table>
          <caption>2025年報 · 貨種與研究重點</caption>
          <thead>
            <tr>
              <th scope="col">認證</th>
              <th scope="col">貨種</th>
              <th scope="col">研究追問（分析框架）</th>
            </tr>
          </thead>
          <tbody>
            {record.rows.map((row) => (
              <tr key={row.certification}>
                <th scope="row">{row.certification}</th>
                <td data-label="貨種">{row.focus}</td>
                <td data-label="研究追問">{row.research_focus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="fineprint">{record.note}</p>
      <Source item={record} />
    </section>
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
  return (
    <section className="earnings-explanation" aria-label="星宇損益與EPS分析">
      <h3>從稅前淨利看本期淨利</h3>
      <p className="earnings-equation">
        稅前淨利 {number(e.pretax_income_thousand)} ＋ 所得稅利益{" "}
        {number(e.income_tax_benefit_thousand)} ＝ 本期淨利{" "}
        {number(e.net_income_thousand)}（新臺幣仟元）
      </p>
      <p>
        基本EPS {e.eps} 元／股；淨利率約{" "}
        {number((e.net_income_thousand / e.revenue_thousand) * 100, 2)}
        %。所得稅利益不是營業收入，財務成本也不等於全部營業外損益。
      </p>
      <p>{e.note}</p>
      <Source item={e} />
    </section>
  );
}

export function AnnualPerformance({ airline, Source }) {
  const record = dossier.airlines[airline].annual_analysis;
  if (!record) return null;
  return (
    <section
      className="annual-performance mobile-records"
      aria-label="兩年損益與營業利益率"
    >
      <h3>2024／2025 損益比較</h3>
      <p>{record.scope}</p>
      <div className="performance-highlights">
        <article>
          <span>2024營業利益率</span>
          <strong>{number(record.operating_margin_2024, 2)}%</strong>
        </article>
        <article>
          <span>2025營業利益率</span>
          <strong>{number(record.operating_margin_2025, 2)}%</strong>
        </article>
      </div>
      <div className="table-wrap research-table">
        <table>
          <caption>{names[airline]} · 金額：新臺幣仟元，EPS：元／股</caption>
          <thead>
            <tr>
              <th scope="col">項目</th>
              <th scope="col">2024</th>
              <th scope="col">2025</th>
              <th scope="col">年增率</th>
            </tr>
          </thead>
          <tbody>
            {record.rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">
                  {row.label}
                  <small>{row.unit}</small>
                </th>
                <td data-label="2024">
                  {number(row.previous, row.unit === "元／股" ? 2 : 0)}
                </td>
                <td data-label="2025">
                  {number(row.current, row.unit === "元／股" ? 2 : 0)}
                </td>
                <td data-label="年增率">{change(row.previous, row.current)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="trend-summary">
        <h4>報表怎麼看？</h4>
        <p>
          2025 相較 2024：
          {record.rows
            .filter((row) => row.unit !== "元／股")
            .slice(0, 3)
            .map((row) => row.label + "" + change(row.previous, row.current))
            .join("；")}
          。上述增減依原始數值計算，非四捨五入後金額。
        </p>
        <p>
          {airline === "starlux"
            ? "研究解讀：營收擴張未同步轉為更高獲利，應並看營業利益率、營運成本與資金負擔；不能只以機隊或航點增加判斷經營成效。"
            : "研究解讀：營收與獲利須分開比較，並追蹤客運及貨運收入結構；單一年度變動不足以判斷長期趨勢或因果。"}
        </p>
        <h4>對照公司方向</h4>
        <p>{dossier.airlines[airline].strategy[0].official_fact}</p>
        <p>{dossier.airlines[airline].strategy[0].analysis}</p>
        <Source item={dossier.airlines[airline].strategy[0]} compact />
      </div>
      <p className="metric-definition">
        營業利益率＝營業利益／營業收入。
        {airline === "starlux"
          ? "2025營收增加，但營業利益及淨利下降；成長、成本與資金負擔須分開評估。"
          : "集團本期淨利與歸屬母公司淨利口徑不同；基本EPS並非直接以集團本期淨利除以期末股數。"}
      </p>
      <p className="fineprint">{record.note}</p>
      <Source item={record} />
    </section>
  );
}

export function CashFlowResearch({ airline, Source }) {
  const record = dossier.airlines[airline].cash_flow;
  if (!record) return null;
  const fields = [
    ["operating", "營業活動"],
    ["investing", "投資活動"],
    ["financing", "籌資活動"],
    ["exchange", "匯率影響"],
    ["opening_cash", "期初現金"],
    ["closing_cash", "期末現金"],
  ];
  return (
    <section
      className="cash-flow-research mobile-records"
      aria-label="現金流與機隊投資"
    >
      <h3>現金流與機隊投資</h3>
      <p>{record.scope}</p>
      <div className="table-wrap research-table">
        <table>
          <caption>2024／2025現金流量 · 新臺幣仟元</caption>
          <thead>
            <tr>
              <th scope="col">項目</th>
              {record.rows.map((row) => (
                <th key={row.year} scope="col">
                  {row.year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map(([key, label]) => (
              <tr key={key}>
                <th scope="row">{label}</th>
                {record.rows.map((row) => (
                  <td key={row.year} data-label={String(row.year)}>
                    {number(row[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="performance-highlights">
        <article>
          <span>2025設備取得付款</span>
          <strong>
            {number(record.equipment_payments_2025 / 100000, 2)}
            <small> 億元</small>
          </strong>
        </article>
        <article>
          <span>2025設備預付款增加</span>
          <strong>
            {number(record.equipment_prepayments_2025 / 100000, 2)}
            <small> 億元</small>
          </strong>
        </article>
      </div>
      <p className="fineprint">
        設備科目包含財報所列不動產、廠房及設備，不能全數推定為飛機成交價；預付款也不是當年交機架數。
      </p>
      <p className="metric-definition">研究解讀：{record.analysis}</p>
      <p>
        {record.note} {record.citation}
      </p>
      <Source item={record} />
    </section>
  );
}
