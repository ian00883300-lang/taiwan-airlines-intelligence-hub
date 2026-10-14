import { change } from "./change.mjs";
import React, { useEffect, useRef, useState } from "react";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import training from "../data/training-path.json";
import social from "../data/china-airlines/social.json";
Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
);
function Plot({
  type = "bar",
  labels,
  datasets,
  unit = "",
  stacked = false,
  label,
}) {
  const ref = useRef();
  useEffect(() => {
    const chart = new Chart(ref.current, {
      type,
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { usePointStyle: true, boxWidth: 9, padding: 16 },
          },
          tooltip: {
            callbacks: {
              label: (c) =>
                `${c.dataset.label || c.label}：${Number(c.raw).toLocaleString("zh-TW", { maximumFractionDigits: 2 })} ${unit}`,
            },
          },
        },
        ...(type === "bar"
          ? {
              scales: {
                x: { stacked, grid: { display: false } },
                y: {
                  stacked,
                  beginAtZero: true,
                  title: { display: true, text: unit },
                  grid: { color: "#e9eef3" },
                },
              },
            }
          : { cutout: "72%" }),
      },
    });
    return () => chart.destroy();
  }, [type, JSON.stringify(labels), JSON.stringify(datasets), unit, stacked]);
  return (
    <div className="research-chart">
      <canvas ref={ref} role="img" aria-label={label} />
    </div>
  );
}
export function TrainingPath({ airline, Source }) {
  const [stage, setStage] = useState("selection");
  const [region, setRegion] = useState("臺灣");
  const selected = training.stages.find((x) => x.id === stage),
    program = training.programs[airline];
  return (
    <div className="training-path">
      <div className="section-intro">
        <span className="eyebrow">CADET TO PROFESSIONAL</span>
        <h2>先看清路線，再準備下一步。</h2>
        <p>{training.note}</p>
      </div>
      <div className="training-steps" role="group" aria-label="訓練階段">
        {training.stages.map((s, i) => (
          <button
            key={s.id}
            className={s.id === stage ? "active" : ""}
            aria-pressed={s.id === stage}
            onClick={() => setStage(s.id)}
          >
            <span>0{i + 1}</span>
            <strong>{s.name}</strong>
            <small>{s.tag}</small>
          </button>
        ))}
      </div>
      <article className="stage-detail" aria-live="polite">
        <span className="eyebrow">{selected.tag}</span>
        <h3>{selected.focus}</h3>
        <p>{selected.body}</p>
        <p className="stage-practice">{selected.practice}</p>
      </article>
      <article className="panel training-program">
        <span className="eyebrow">AIRLINE PROGRAM</span>
        <h3>{program.title}</h3>
        <p>{program.body}</p>
        <Source item={program} />
      </article>
      <div className="section-intro">
        <h2>時數要放回制度裡理解。</h2>
        <p>
          這裡列的是最低要求摘要，不是預估結訓時間。完整資格與採計條件請展開官方來源。
        </p>
      </div>
      <div className="jurisdiction" role="group" aria-label="法規地區">
        {["臺灣", "FAA", "CASA"].map((r) => (
          <button
            key={r}
            aria-pressed={r === region}
            className={r === region ? "active" : ""}
            onClick={() => setRegion(r)}
          >
            {r === "臺灣" ? "臺灣 CAA" : r === "FAA" ? "美國 FAA" : "澳洲 CASA"}
          </button>
        ))}
      </div>
      <div className="requirements-grid">
        {training.requirements
          .filter((x) => x.jurisdiction === region)
          .map((r) => (
            <article className="requirement-card" key={r.id}>
              <span>{r.title}</span>
              <h3>{r.headline}</h3>
              <p>{r.body}</p>
              <Source item={r} />
            </article>
          ))}
      </div>
      <details className="research-note">
        <summary>為什麼沒有照搬累積時數圖？</summary>
        <p>
          首次單飛、實際結訓、航路訓練與升機長是不同情境；截圖中的範圍尚無三航共通官方依據。將它們畫在同一條時程上，容易把經驗估計誤認為法定門檻。
        </p>
        <p>
          Data pending
          verification：三家公司固定升等時數與年限、各梯實際結訓時間。模擬機能否採計，必須看具體法規與時數類別。
        </p>
      </details>
    </div>
  );
}
export function FinanceVisuals({ f, Source }) {
  const [metric, setMetric] = useState("revenue");
  if (!f.history?.length) return null;
  const metrics = {
    revenue: ["合併營收", "新臺幣億元", 100000],
    profit: ["歸屬母公司淨利", "新臺幣億元", 100000],
    eps: ["基本 EPS", "新臺幣元／股", 1],
  };
  const [label, unit, divisor] = metrics[metric];
  const total = f.breakdown.items.reduce((n, x) => n + x.amount, 0);
  return (
    <>
      <div className="research-grid">
        <section className="panel">
          <div className="chart-heading">
            <div>
              <span className="eyebrow">ANNUAL PERFORMANCE</span>
              <h3>全年營運走勢</h3>
            </div>
            <label>
              財務指標
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
              >
                {Object.entries(metrics).map(([k, [name]]) => (
                  <option value={k} key={k}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Plot
            labels={f.history.map((x) => String(x.year))}
            datasets={[
              {
                label,
                data: f.history.map((x) => x[metric] / divisor),
                backgroundColor: "#346baf",
                borderRadius: 5,
                maxBarThickness: 72,
              },
            ]}
            unit={unit}
            label={`${label}，各年數值列於下方資料表`}
          />
          <p className="fineprint">
            切換指標時同步更換單位；未把半年度與全年放在同一趨勢。
          </p>
        </section>
        <section className="panel">
          <span className="eyebrow">REVENUE MIX · 2025</span>
          <h3>營收從哪裡來？</h3>
          <Plot
            type="doughnut"
            labels={f.breakdown.items.map((x) => x.label)}
            datasets={[
              {
                data: f.breakdown.items.map((x) => x.amount / 100000),
                backgroundColor: ["#346baf", "#d89545", "#9aabb9"],
                borderWidth: 3,
                borderColor: "#fff",
              },
            ]}
            unit="新臺幣億元"
            label="2025 客運、貨運、其他營收占比；數值見下方清單"
          />
          <ul className="mix-legend">
            {f.breakdown.items.map((x) => (
              <li key={x.label}>
                <span>{x.label}</span>
                <strong>{((100 * x.amount) / total).toFixed(1)}%</strong>
                <span>{(x.amount / 100000).toFixed(2)} 億元</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="table-wrap">
        <table>
          <caption>全年合併財報 · 營收與歸母淨利單位：新臺幣億元</caption>
          <thead>
            <tr>
              <th>年度</th>
              <th>合併營收</th>
              <th>歸屬母公司淨利</th>
              <th>基本 EPS（元／股）</th>
              <th>營收年增減</th>
            </tr>
          </thead>
          <tbody>
            {f.history.map((x, index) => (
              <tr key={x.year}>
                <th>{x.year}</th>
                <td>{(x.revenue / 100000).toFixed(2)}</td>
                <td>{(x.profit / 100000).toFixed(2)}</td>
                <td>{x.eps.toFixed(2)}</td>
                <td>
                  {index && x.year === f.history[index - 1].year + 1
                    ? change(f.history[index - 1].revenue, x.revenue)
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="trend-summary">
        報表解讀：同口徑全年營收呈現規模變化，歸母淨利與 EPS
        反映不同獲利面向；三者不必然同幅成長。年增減＝（本年／前一年－1）×100%，基期非正值或非連續年度不計算百分比。公司方向與進一步解讀見下方損益比較。
      </p>
      <Source item={f.history.at(-1)} />
      <Source item={f.breakdown} />
    </>
  );
}
export function SocialVisuals({ Source }) {
  const labels = ["商業活動", "慈善活動", "社區投資"],
    keys = ["commercial", "charity", "community"];
  return (
    <section className="social-research">
      <div className="section-intro">
        <span className="eyebrow">SOCIAL PARTICIPATION</span>
        <h2>理解投入，也看清範圍。</h2>
        <p>社會參與包含多種資源投入，不等於全部都是現金捐款。</p>
      </div>
      <div className="research-grid">
        <section className="panel">
          <h3>2023–2025 社會參與</h3>
          <Plot
            labels={social.history.map((x) => String(x.year))}
            datasets={keys.map((k, i) => ({
              label: labels[i],
              data: social.history.map((x) => x[k] / 10000),
              backgroundColor: ["#346baf", "#bb4678", "#33998f"][i],
              maxBarThickness: 75,
            }))}
            stacked
            unit="新臺幣萬元"
            label="三年社會參與分類堆疊圖，精確金額列於資料表"
          />
          <Source item={social.history.at(-1)} />
        </section>
        <section className="panel social-insight">
          <span className="eyebrow">READ BEYOND THE NUMBER</span>
          <h3>
            {(social.history.at(-1).total / 10000).toLocaleString("zh-TW", {
              maximumFractionDigits: 2,
            })}
            <small>萬元 · 2025 社會參與總額</small>
          </h3>
          <p>面試可以進一步問：航空公司的本業資源，如何支持社會參與？</p>
          <h4>{social.sroi.title}</h4>
          <p>{social.sroi.body}</p>
          <Source item={social.sroi} />
        </section>
      </div>
      <div className="table-wrap">
        <table>
          <caption>社會參與種類 · 新臺幣元（保留原始金額）</caption>
          <thead>
            <tr>
              <th>年度</th>
              {labels.map((x) => (
                <th key={x}>{x}</th>
              ))}
              <th>合計</th>
            </tr>
          </thead>
          <tbody>
            {social.history.map((x) => (
              <tr key={x.year}>
                <th>{x.year}</th>
                {[...keys, "total"].map((k) => (
                  <td key={k}>{x[k].toLocaleString("zh-TW")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
