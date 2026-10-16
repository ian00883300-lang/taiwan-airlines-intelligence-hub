import React, { useState } from "react";
import fundamentals from "../data/aviation-knowledge.json";
import aircraft from "../data/aircraft-knowledge.json";
import ci from "../data/china-airlines/fleet.json";
import br from "../data/eva-air/fleet.json";
import jx from "../data/starlux/fleet.json";

export const knowledgeItems = [...fundamentals.items, ...aircraft.items];
const fleets = [["china-airlines", "華航", ci], ["eva-air", "長榮", br], ["starlux", "星宇", jx]];
export default function KnowledgeBank({ Source }) {
  const [category, setCategory] = useState("全部");
  const [query, setQuery] = useState("");
  const [english, setEnglish] = useState(false);
  const filtered = knowledgeItems.filter(x => (category === "全部" || category === x.category) &&
    `${x.title} ${x.title_en} ${x.answer} ${x.answer_en}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="knowledge-bank">
    <div className="section-heading"><div><span className="eyebrow">AVIATION KNOWLEDGE</span><h1>知識題庫</h1>
      <p>先理解原理，再練習解釋。飛行基礎、儀表與機型特色分開閱讀。</p></div></div>
    <div className="filters">
      <label>搜尋知識<input aria-label="搜尋知識" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="失速、VSI、A350、787…" /></label>
      <label>知識分類<select aria-label="知識分類" value={category} onChange={e => setCategory(e.target.value)}>{["全部", ...new Set(knowledgeItems.map(x => x.category))].map(x => <option key={x}>{x}</option>)}</select></label>
      <label className="knowledge-language"><input type="checkbox" checked={english} onChange={e => setEnglish(e.target.checked)} />顯示英文解釋</label>
    </div>
    <p className="fineprint">{filtered.length} / {knowledgeItems.length} 個主題 · 基礎概念供面試準備；實際操作依核准教材、機型手冊與訓練。機隊連結使用各自註明的資料日期。</p>
    <div className="knowledge-grid">{filtered.map(item => <article key={item.id} id={"knowledge-" + item.id} className="knowledge-card">
      <span className="eyebrow">{item.category}</span><h2>{item.title}</h2><p className="knowledge-subtitle">{item.subtitle || item.title_en}</p>
      <p>{item.answer}</p>{english && <p lang="en" className="knowledge-english">{item.answer_en}</p>}
      <details><summary>易錯點與延伸思考</summary><p>{item.caution}</p><p><strong>試著回答：</strong>{item.follow_up}</p></details>
      {item.types && <div className="knowledge-fleets">{fleets.filter(([, , f]) => f.items.some(x => item.types.includes(x.aircraft_type))).map(([id, name, f]) => <a href={"#" + id + "/fleet"} key={id}>{name} · {f.items.filter(x => item.types.includes(x.aircraft_type)).map(x => x.aircraft_type).join(" / ")} ↗</a>)}</div>}
      <Source item={item} compact />
    </article>)}</div>
    {!filtered.length && <p role="status">沒有符合的主題，請調整搜尋或分類。</p>}
  </section>;
}
