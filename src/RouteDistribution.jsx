import React, { useState } from "react";
import { Plot } from "./ResearchPanels.jsx";
export default function RouteDistribution({ routes, continents, continent }) {
  const [metric, setMetric] = useState("routes");
  const rows = Object.entries(continents)
    .map(([id, label]) => {
      const group = routes.filter((r) => continent(r) === id);
      return {
        label,
        value:
          metric === "routes"
            ? group.length
            : new Set(group.map((r) => r.destination)).size,
      };
    })
    .filter((r) => r.value);
  const total = rows.reduce((n, r) => n + r.value, 0);
  return (
    <section className="route-distribution" aria-label="洲別分布">
      <div className="distribution-copy">
        <label>
          洲別分布
          <select
            aria-label="圓餅圖統計口徑"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
          >
            <option value="routes">航線數</option>
            <option value="destinations">航點數（機場去重）</option>
          </select>
        </label>
        <ul>
          {rows.map((r) => (
            <li key={r.label}>
              <span>{r.label}</span>
              <b>
                {r.value} · {((r.value / total) * 100).toFixed(1)}%
              </b>
            </li>
          ))}
        </ul>
        <small>
          依目的地所在洲分類，與目前篩選同步。多個起點飛往同一機場，計為多條航線、單一航點；非航班頻率或運能占比。資料來源見下方各筆「來源與詳情」。
        </small>
      </div>
      {total ? (
        <Plot
          type="doughnut"
          labels={rows.map((r) => r.label)}
          datasets={[
            {
              data: rows.map((r) => r.value),
              backgroundColor: [
                "#346baf",
                "#c49a53",
                "#30958c",
                "#8669a5",
                "#be6284",
                "#8894a0",
              ],
            },
          ]}
          unit={metric === "routes" ? "條航線" : "個航點"}
          label={`按洲別的${metric === "routes" ? "航線" : "航點"}分布，共 ${total} 筆；數值與百分比見旁邊清單`}
        />
      ) : (
        <p>此篩選沒有可繪製資料。</p>
      )}
    </section>
  );
}
