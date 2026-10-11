import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import L from "leaflet";
import {
  Plane,
  LayoutDashboard,
  ArrowUpRight,
  ArrowRight,
  ChartNoAxesCombined,
  Newspaper,
  GraduationCap,
  Search,
  ShieldCheck,
  Globe2,
  BookOpen,
  Bookmark,
  Check,
  ExternalLink,
  Clock,
  Database,
  ChevronRight,
  X,
  Menu,
  Download,
  Play,
  RotateCcw,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./style.css";
import "./research.css";
import "./reading.css";
import { ReadingProvider, ReadingControls } from "./ReadingControls.jsx";
import {
  TrainingPath,
  FinanceVisuals,
  SocialVisuals,
} from "./ResearchPanels.jsx";
import {
  PersonalProvider,
  PrivateImport,
  AnswerView,
} from "./PracticeStudio.jsx";
Chart.register(
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
);
const files = import.meta.glob("../data/**/*.json", {
  eager: true,
  import: "default",
});
const data = (p) => files["../data/" + p + ".json"];
const ids = ["china-airlines", "eva-air", "starlux"];
const airlines = ids.map((id) => data(id + "/overview"));
const bank = data("interview-bank"),
  weekly = data("weekly-updates"),
  sources = data("sources"),
  sections = data("sections");
const regions = [
  "Taiwan",
  "Asia",
  "Japan",
  "Korea",
  "China",
  "Southeast Asia",
  "Europe",
  "North America",
  "Oceania",
];
const getAir = (id) => airlines.find((a) => a.id === id);
const PENDING = "Data pending verification";
const colors = [
  "#287eae",
  "#50a0be",
  "#87bfcd",
  "#bfdae0",
  "#ddae66",
  "#8c729b",
  "#ba427e",
];
const labelStatus = {
  confirmed: "已確認",
  announced: "已公告",
  planned: "計畫",
  estimated: "估計",
  unverified: "待查核",
};
const navItems = [
  ["home", "總覽", LayoutDashboard],
  ["china-airlines", "中華航空", Plane],
  ["eva-air", "長榮航空", Plane],
  ["starlux", "星宇航空", Plane],
  ["compare", "三雄比較", ChartNoAxesCombined],
  ["weekly", "每週更新", Newspaper],
  ["interview", "面試題庫", GraduationCap],
  ["sources", "資料來源", Database],
];
function useHash() {
  const [path, setPath] = useState(location.hash.slice(1) || "home");
  useEffect(() => {
    let f = () => {
      setPath(location.hash.slice(1) || "home");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return path;
}
function useSaved(key, initial) {
  const [value, set] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, set];
}
function Badge({ status }) {
  return (
    <span className={"badge " + status}>{labelStatus[status] || status}</span>
  );
}
function Source({ item, compact = false }) {
  if (!item) return null;
  return (
    <details className={"source " + (compact ? "compact" : "")}>
      <summary>
        <ShieldCheck size={12} />
        {item.source_url ? "來源與日期" : "查核說明"}
        {!compact && item.as_of && <span>資料基準 {item.as_of}</span>}
      </summary>
      <div>
        <p>
          <Badge status={item.status} />　
          {item.source_url ? (
            <a href={item.source_url} target="_blank" rel="noreferrer">
              {item.source} <ExternalLink size={12} />
            </a>
          ) : (
            item.source || PENDING
          )}
        </p>
        <p>
          Published：{item.published_date || "未標示"}
          <br />
          Verified：{item.verified_date || "尚未查核"}
          <br />
          As of：{item.as_of || "未標示"}
        </p>
        {item.scope && <p>口徑：{item.scope}</p>}
        {item.note && <p>{item.note}</p>}
        {item.corroboration_url && (
          <a href={item.corroboration_url} target="_blank" rel="noreferrer">
            交叉比對來源 ↗
          </a>
        )}
      </div>
    </details>
  );
}
function Pending({ note }) {
  return (
    <div className="pending">
      <Clock size={16} />
      <div>
        <strong>{PENDING}</strong>
        {note && <p>{note}</p>}
      </div>
    </div>
  );
}
function Heading({ eyebrow, title, description, children }) {
  return (
    <div className="heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
function SectionTitle({ title, en, link }) {
  return (
    <div className="section-title">
      <h2>
        {title}
        <span>{en}</span>
      </h2>
      {link && (
        <a href={"#" + link}>
          查看全部 <ArrowRight size={15} />
        </a>
      )}
    </div>
  );
}
function Donut({ airline }) {
  const canvas = useRef();
  let f = data(airline.id + "/fleet").items.filter(
    (x) => x.current_fleet !== null,
  );
  useEffect(() => {
    if (!canvas.current || !f.length) return;
    let chart = new Chart(canvas.current, {
      type: "doughnut",
      data: {
        labels: f.map((x) => x.aircraft_type),
        datasets: [
          {
            data: f.map((x) => x.current_fleet),
            backgroundColor: colors,
            borderWidth: 3,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",
        plugins: { legend: { display: false } },
        animation: false,
      },
    });
    return () => chart.destroy();
  }, [airline.id]);
  if (!f.length)
    return (
      <Pending note="當前機隊缺少同一基準日的官方分型數量，因此不產生比例圖。" />
    );
  return (
    <div className="donut-block">
      <div className="donut">
        <canvas
          ref={canvas}
          role="img"
          aria-label={airline.name + "機隊比例圖"}
        />
        <div className="donut-center">
          <b>{f.reduce((s, x) => s + x.current_fleet, 0)}</b>
          <span>現役 / 架</span>
        </div>
      </div>
      <ul className="chart-legend">
        {f.map((x, i) => (
          <li key={x.aircraft_type}>
            <i style={{ background: colors[i] }} />
            {x.aircraft_type}
            <b>{x.current_fleet}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
function RouteMap({ initial = "all" }) {
  const [air, setAir] = useState(initial),
    [region, setRegion] = useState("all"),
    [tileError, setTileError] = useState(false);
  const ref = useRef();
  const all = ids.flatMap((id) => data(id + "/routes").items);
  const filtered = all.filter(
    (r) =>
      (air === "all" || r.airline === air) &&
      (region === "all" ||
        r.region === region ||
        (region === "Taiwan" && r.origin === "TPE") ||
        (region === "Asia" &&
          ["Japan", "Korea", "China", "Southeast Asia"].includes(r.region))),
  );
  useEffect(() => {
    const map = L.map(ref.current, {
      scrollWheelZoom: false,
      worldCopyJump: false,
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
    let airports = data("airports").items;
    for (let r of filtered) {
      let from = airports[r.origin],
        to = airports[r.destination];
      let lng = to.lng < 0 ? to.lng + 360 : to.lng;
      let color = getAir(r.airline).color;
      L.polyline(
        [
          [from.lat, from.lng],
          [to.lat, lng],
        ],
        { color, weight: 2.5, opacity: 0.8 },
      ).addTo(map);
      let content = document.createElement("span");
      content.textContent = `${getAir(r.airline).name} · TPE → ${r.destination} ${to.name}`;
      L.circleMarker([to.lat, lng], {
        radius: 6,
        color,
        fillColor: color,
        fillOpacity: 1,
      })
        .addTo(map)
        .bindPopup(content);
    }
    L.circleMarker([25.08, 121.23], {
      radius: 7,
      color: "#163851",
      fillColor: "#fff",
      fillOpacity: 1,
    })
      .addTo(map)
      .bindPopup("TPE 臺灣桃園");
    let ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      map.remove();
    };
  }, [air, region]);
  return (
    <div>
      <div className="filters">
        <label>
          航空公司
          <select value={air} onChange={(e) => setAir(e.target.value)}>
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
        <span className="filter-count">{filtered.length} 條已收錄航線</span>
      </div>
      <div ref={ref} className="route-map" aria-label="代表性航線互動地圖" />
      {tileError && (
        <p className="notice">
          底圖暫時無法載入；已查核航線仍可由下方清單閱讀。
        </p>
      )}
      <p className="fineprint">
        代表性自營客運航線，非完整航網。連線為示意，非實際航路；不含共掛與貨運。無班次保證。
      </p>
      <div className="route-list">
        {filtered.length ? (
          filtered.map((r) => (
            <article key={r.id}>
              <span
                className="airline-dot"
                style={{ background: getAir(r.airline).color }}
              />
              <div>
                <b>
                  TPE <span className="muted">→</span> {r.destination}
                </b>
                <p>
                  {getAir(r.airline).name} ·{" "}
                  {data("airports").items[r.destination].name}
                </p>
                <Source item={r} compact />
              </div>
            </article>
          ))
        ) : (
          <Pending note="此篩選尚無已查核航線；不代表航空公司未營運該區域。" />
        )}
      </div>
    </div>
  );
}
function AirlineCard({ a }) {
  return (
    <article className="airline-card" style={{ "--brand": a.color }}>
      <div className="airline-card-head">
        <span className="airline-emblem">{a.code}</span>
        <div>
          <h2>{a.name}</h2>
          <p>{a.english}</p>
        </div>
        <a href={"#" + a.id} aria-label={"查看" + a.name}>
          <ArrowUpRight size={21} />
        </a>
      </div>
      <div className="fleet-value">
        {a.total.value !== null ? (
          <>
            <strong>{a.total.value}</strong>
            <span>架現役機隊</span>
          </>
        ) : (
          <strong className="pending-number">待查核</strong>
        )}
      </div>
      <p className="fleet-date">
        {a.total.as_of
          ? "資料基準 " + a.total.as_of
          : "當前總數 Data pending verification"}
      </p>
      <div className="mini-facts">
        <div>
          <span>成立 Founded</span>
          <b>{a.founded.value}</b>
        </div>
        <div>
          <span>聯盟 Alliance</span>
          <b>{a.alliance.value || "待查核"}</b>
        </div>
        <div>
          <span>航網 Network</span>
          <b>代表航線已收錄</b>
        </div>
      </div>
      <Source item={a.total} compact />
      <div className="card-footer">
        <span>Last verified · {a.last_verified} *</span>
        <a href={"#" + a.id}>
          公司情報 <ArrowRight size={15} />
        </a>
      </div>
    </article>
  );
}
function NewsCard({ n }) {
  return (
    <article className="news-card">
      <div className="news-meta">
        <span style={{ color: getAir(n.airline).color }}>
          {getAir(n.airline).name}
        </span>
        <span>
          {n.event_date} · {n.topic}
        </span>
        <Badge status={n.status} />
      </div>
      <h3>{n.title}</h3>
      <p>{n.what}</p>
      <details>
        <summary>
          面試重點與影響 <ChevronRight size={14} />
        </summary>
        <dl>
          <dt>WHY DOES IT MATTER?</dt>
          <dd>{n.why}</dd>
          <dt>INTERVIEW IMPACT</dt>
          <dd>{n.impact}</dd>
          <dt>WHAT SHOULD I REMEMBER?</dt>
          <dd>{n.remember}</dd>
        </dl>
      </details>
      <Source item={n} />
    </article>
  );
}
function Home({ openInterview }) {
  return (
    <>
      <div className="hub-masthead">
        <Heading
          eyebrow="YOUR PRE-FLIGHT BRIEFING"
          title="台灣航空情報中心"
          description="台灣三大航空情報 × 培訓機師面試準備。從可信資料，到你的下一個好回答。"
        />
        <div className="hero-actions">
          <a href="#interview">
            開始面試練習 <ArrowRight size={16} />
          </a>
          <a href="#china-airlines/cadet">
            探索機師養成路線 <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
      <div className="verification-strip">
        <ShieldCheck size={17} />
        <span>
          Data verified through: <b>2026-10-11</b> ·
          各資料基準日不同，未查核項目另行標示。
        </span>
        <a href="#sources">查看來源政策 ↗</a>
      </div>
      <div className="airline-grid">
        {airlines.map((a) => (
          <AirlineCard key={a.id} a={a} />
        ))}
      </div>
      <p className="fineprint">
        * Last verified
        為該公司部分資料最近查核日，並非所有分類皆已完成。航點定義未統一，不比較單一總數。
      </p>
      <div className="home-columns">
        <section className="panel">
          <SectionTitle title="機隊組成" en="Fleet snapshot" link="compare" />
          <div className="two-charts">
            {airlines.slice(0, 2).map((a) => (
              <div key={a.id}>
                <h3>
                  {a.name}
                  <small>{a.total.as_of}</small>
                </h3>
                <Donut airline={a} />
              </div>
            ))}
          </div>
        </section>
        <section className="study-panel">
          <div className="eyebrow">INTERVIEW QUICK STUDY</div>
          <GraduationCap size={34} />
          <h2>
            不只記住數字，
            <br />
            更要說明為什麼。
          </h2>
          <p>今天練習：如何區分現役機隊、訂單與交付？用 30 秒說出關鍵差異。</p>
          <button
            className="primary"
            onClick={() => openInterview(bank.find((q) => q.id === "fleet-br"))}
          >
            開始口說練習 <ArrowRight size={16} />
          </button>
          <a href="#interview">瀏覽全部 {bank.length} 道練習題 ↗</a>
        </section>
      </div>
      <section className="panel">
        <SectionTitle title="三雄快速比較" en="At a glance" link="compare" />
        <div className="quick-grid">
          {airlines.map((a) => (
            <div key={a.id}>
              <b>{a.name}</b>
              <h3>{a.tag}</h3>
              <p>{a.total.scope || a.total.note}</p>
              <a href={"#" + a.id + "/interview"}>
                這對面試代表什麼？ <ArrowUpRight size={14} />
              </a>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <SectionTitle title="航網視角" en="Route network" />
        <RouteMap />
      </section>
      <div className="home-columns">
        <section>
          <SectionTitle title="本週情報" en="Oct 05 — Oct 11" link="weekly" />
          {weekly
            .filter((n) => n.event_date >= "2026-10-05")
            .map((n) => (
              <NewsCard n={n} key={n.id} />
            ))}
          <p className="fineprint">
            星宇本週：尚無已查核消息，不代表沒有新消息。
          </p>
        </section>
        <section className="panel">
          <SectionTitle title="機師招募" en="Recruitment" />
          {airlines.map((a) => (
            <div className="recruit-row" key={a.id}>
              <h3>{a.name}</h3>
              <p>{data(a.id + "/recruitment").items[0].title || PENDING}</p>
              <a href={"#" + a.id + "/recruitment"}>
                查看官方依據 <ArrowUpRight size={15} />
              </a>
            </div>
          ))}
          <div className="small-note">
            招募資訊非即時串流，報名前請以官方當期簡章為準。
          </div>
        </section>
      </div>
      <section className="panel">
        <SectionTitle title="最近更新" en="Research log" />
        <p>
          2026-10-11 ·
          核對華航與長榮官方機隊表，建立星宇歷史交付紀錄、代表航線與面試題庫。完整來源可逐項展開。
        </p>
      </section>
    </>
  );
}
function FactCards({ records, openInterview, airline }) {
  return (
    <div className="facts-grid">
      {records.map((r, i) => (
        <article className="fact-card" key={i}>
          <div className="fact-top">
            <h3>{r.title || r.label}</h3>
            <Badge status={r.status} />
          </div>
          {r.value === null ? (
            <Pending note={r.note} />
          ) : (
            <p className={r.value !== undefined ? "fact-value" : ""}>
              {r.body ?? r.value}
            </p>
          )}
          {r.note && r.value !== null && <p className="muted">{r.note}</p>}
          <Source item={r} />
          <button
            className="text-button"
            onClick={() =>
              openInterview(
                bank.find(
                  (q) =>
                    q.id ===
                    (r.source_id === "sms" || r.source_id === "ciSms"
                      ? "sms"
                      : r.source_id === "fatigue"
                        ? "fatigue"
                        : r.source_id === "evaSaf"
                          ? "current"
                          : r.source_id === "ci787"
                            ? "fleet-ci"
                            : r.source_id === "ciFleet"
                              ? "company-ci"
                              : r.source_id === "evaFleet"
                                ? "fleet-br"
                                : r.source_id === "jxDelivery"
                                  ? "fleet-jx"
                                  : r.source_id === "ciRecruit"
                                    ? "why-ci"
                                    : r.source_id === "evaRecruit"
                                      ? "why-br"
                                      : ""),
                ) ||
                  bank.find((q) => q.airline === airline) ||
                  bank[0],
              )
            }
          >
            <GraduationCap size={15} /> Interview View
          </button>
        </article>
      ))}
    </div>
  );
}
function Timeline({ items, empty }) {
  return items.length ? (
    <div className="timeline">
      {items.map((e, i) => (
        <article key={i}>
          <b>{e.date}</b> <Badge status={e.status} />
          <p>{e.label}</p>
          <Source item={e} />
        </article>
      ))}
    </div>
  ) : (
    <Pending note={empty} />
  );
}
function Fleet({ a, tab }) {
  const f = data(a.id + "/fleet");
  const [filter, setFilter] = useState("all");
  if (tab === "orders")
    return (
      <>
        <p className="notice">
          訂單總量與目前待交數分別標註；firm order、option、MoU 與計畫不得相加。
        </p>
        <div className="facts-grid">
          {f.orders.map((o, i) => (
            <article className="fact-card" key={i}>
              <Badge status={o.status} />
              <h3>{o.aircraft_type}</h3>
              <div className="order-value">
                {o.quantity}
                <span> 架 · {o.order_type}</span>
              </div>
              <p>{o.note}</p>
              <Source item={o} />
            </article>
          ))}
        </div>
        <SectionTitle title="未來交付時間軸" en="Future delivery" />
        <Timeline
          items={f.planned}
          empty="目前尚無已重新查核的完整逐年交付排程；不依舊公告外推。"
        />
      </>
    );
  return (
    <>
      <div className="fleet-layout">
        <section className="panel">
          <h3>{a.name} · 機隊組成</h3>
          <Donut airline={a} />
          <Source item={a.total} />
        </section>
        <div>
          <p className="notice">
            Current Fleet
            僅計現役。訂單、未來計畫、已退役皆分開保存。未知值不視為 0。
          </p>
          <label>
            篩選機隊
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">全部</option>
              <option value="passenger">客運 Passenger</option>
              <option value="cargo">貨運 Cargo</option>
            </select>
          </label>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>機型</th>
                  <th>現役</th>
                  <th>任務</th>
                  <th>基準日</th>
                </tr>
              </thead>
              <tbody>
                {f.items
                  .filter((x) => filter === "all" || x.kind === filter)
                  .map((x) => (
                    <tr key={x.aircraft_type}>
                      <td>{x.aircraft_type}</td>
                      <td>{x.current_fleet ?? "待查核"}</td>
                      <td>{x.kind === "cargo" ? "貨運" : "客運"}</td>
                      <td>{x.as_of || "待查核"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <SectionTitle title="機型資料卡" en="Aircraft technical knowledge" />
      {f.items
        .filter((x) => filter === "all" || x.kind === filter)
        .map((x) => (
          <details className="aircraft-detail" key={x.aircraft_type}>
            <summary>
              {x.aircraft_type}{" "}
              <span>
                {x.kind === "cargo" ? "CARGO" : "PASSENGER"} · 查看規格與來源
              </span>
            </summary>
            <div className="spec-grid">
              {[
                "engine",
                "typical_seats",
                "range",
                "main_routes",
                "first_delivery",
                "average_age",
                "replacement_plan",
                "future_orders",
              ].map((k) => (
                <div key={k}>
                  <small>{x[k].label}</small>
                  <p>{x[k].value ?? PENDING}</p>
                  <Source item={x[k]} compact />
                </div>
              ))}
            </div>
            <Source item={x} />
          </details>
        ))}
      <SectionTitle title="機隊歷史時間軸" en="Fleet timeline" />
      {f.history.length ? (
        <div className="timeline">
          {f.history.map((e, i) => (
            <article key={i}>
              <b>{e.date}</b>
              <p>{e.label}</p>
              <Source item={e} />
            </article>
          ))}
        </div>
      ) : (
        <Pending note="分年度機隊變化尚待查核；現役快照不推算歷史變化。" />
      )}
      <SectionTitle title="替換與退役時間軸" en="Replacement / retired" />
      <Timeline
        items={f.replacement_timeline}
        empty="尚未收錄已重新查核的逐機替換或退役清單。"
      />
    </>
  );
}
function Finance({ a, openInterview }) {
  const f = data(a.id + "/financials");
  return (
    <>
      <p className="notice">
        {f.period} · {f.scope}。本版不把公司本體和合併集團數字視為完全相同規模。
      </p>
      <FinanceVisuals f={f} Source={Source} />
      <FactCards
        records={[
          {
            ...f.revenue,
            value:
              f.revenue.value === null
                ? null
                : f.revenue.value + " " + f.revenue.unit,
          },
          {
            ...f.eps,
            value: f.eps.value === null ? null : f.eps.value + " " + f.eps.unit,
          },
        ]}
        openInterview={openInterview}
        airline={a.id}
      />
      <p className="fineprint">{f.note} 本頁供公司研究，非投資建議。</p>
    </>
  );
}
const researchGroups = data("research-groups");
function Airline({ a, tab = "overview", openInterview }) {
  const group =
    researchGroups.find((g) => g.id === tab || g.members.includes(tab)) ||
    researchGroups[0];
  const facts = (keys) => (
    <FactCards
      records={keys.flatMap((k) => a.sections[k] || [])}
      airline={a.id}
      openInterview={openInterview}
    />
  );
  const part = (title, content) => (
    <section className="research-part">
      <h3 className="research-part-title">{title}</h3>
      {content}
    </section>
  );
  return (
    <>
      <div className="airline-masthead" style={{ "--airline-color": a.color }}>
        <Heading
          eyebrow={a.code + " / AIRLINE INTELLIGENCE"}
          title={a.name}
          description={a.english + " · " + a.tag}
        >
          <span className="large-emblem" style={{ color: a.color }}>
            {a.code}
          </span>
        </Heading>
      </div>
      <div className="verification-strip">
        <ShieldCheck size={16} /> Data verified through: {a.last_verified} ·
        個別欄位日期請展開來源
      </div>
      <nav className="topic-nav consolidated-nav" aria-label="研究主題">
        {researchGroups.map((g) => (
          <a
            key={g.id}
            href={"#" + a.id + "/" + g.id}
            className={g.id === group.id ? "active" : ""}
            aria-current={g.id === group.id ? "page" : undefined}
          >
            {g.zh}
          </a>
        ))}
      </nav>
      <SectionTitle title={group.zh} en={group.en} />
      <p className="research-scope">
        {group.members
          .map((id) => sections.find((s) => s.id === id)?.zh)
          .join(" · ")}
      </p>
      {group.id === "fleet" ? (
        <>
          {part("現役機隊與機型資料", <Fleet a={a} tab="fleet" />)}
          {part("訂單與未來交付", <Fleet a={a} tab="orders" />)}
          {part("機隊更新", facts(["renewal"]))}
        </>
      ) : group.id === "routes" ? (
        <>
          <section className="panel">
            <RouteMap initial={a.id} />
          </section>
          {part("樞紐與合作關係", facts(["hubs", "alliances", "codeshare"]))}
        </>
      ) : group.id === "finance" ? (
        <Finance a={a} openInterview={openInterview} />
      ) : group.id === "cadet" ? (
        <>
          {part(
            "培訓招募與申請條件",
            <>
              <p className="notice">
                僅摘要培訓類別，查核日
                2026-10-11。門檻與通知以官方當期頁面為準；不與自訓 CPL
                或已有經驗機師混用。
              </p>
              <FactCards
                records={[
                  ...data(a.id + "/recruitment").items,
                  ...(data(a.id + "/recruitment").qualifications || []),
                ]}
                airline={a.id}
                openInterview={openInterview}
              />
            </>,
          )}
          {part(
            "機師養成路線",
            <TrainingPath airline={a.id} Source={Source} />,
          )}
          {part("人才與職涯", facts(["employees"]))}
        </>
      ) : group.id === "esg" ? (
        <>
          {facts(group.members)}
          {a.id === "china-airlines" ? (
            <SocialVisuals Source={Source} />
          ) : (
            <Pending note="多年度社會參與圖表尚待官方資料查核，不套用華航數據。" />
          )}
        </>
      ) : group.id === "interview" ? (
        <QuestionBank initial={a.id} openInterview={openInterview} />
      ) : group.id === "strategy" ? (
        <>
          {facts(["strategy", "advantages", "risks", "future"])}
          {part(
            "已查核動態",
            <>
              {weekly
                .filter((n) => n.airline === a.id)
                .map((n) => (
                  <NewsCard key={n.id} n={n} />
                ))}
              {a.id === "starlux" && (
                <Pending note="本週（10/05–10/11）尚無已查核新聞；上方為較早背景事件。" />
              )}
            </>,
          )}
        </>
      ) : (
        facts(group.members)
      )}
    </>
  );
}
function comparisonValue(a, key) {
  let f = data(a.id + "/fleet"),
    fin = data(a.id + "/financials");
  const first = (k) => a.sections[k]?.[0];
  const rec = (r) => r?.value ?? r?.body ?? PENDING;
  switch (key) {
    case "founded":
      return rec(a.founded);
    case "alliance":
      return rec(a.alliance);
    case "fleet":
      return a.total.value !== null
        ? `${a.total.value} 架 (${a.total.as_of})`
        : PENDING;
    case "age":
      return rec(a.age);
    case "types":
      return (
        f.items
          .filter((x) => x.current_fleet !== null)
          .map((x) => x.aircraft_type)
          .join(" / ") || "現役分型數待查核"
      );
    case "cargo":
      return first("cargo")?.value != null
        ? first("cargo").value + " 架全貨機；" + first("cargo").note
        : PENDING;
    case "orders":
      return f.orders
        .map((o) => o.aircraft_type + " " + o.quantity + " 架；" + o.note)
        .join(" ");
    case "revenue":
      return fin.revenue.value !== null
        ? fin.revenue.value + " 十億 TWD（2025）；" + fin.scope
        : PENDING;
    case "eps":
      return fin.eps.value !== null
        ? fin.eps.value + " TWD／股（2025 年度）"
        : PENDING;
    case "network":
      return "代表性自營客運航線；非完整航點總數";
    case "brand":
      return rec(first("brand"));
    case "future":
    case "cadet":
      return rec(first(key));
    case "culture":
    case "interview":
      return "Data pending verification；不採網路刻板印象";
    case "northamerica":
    case "europe":
    case "asia": {
      let region =
        key === "northamerica"
          ? "North America"
          : key === "europe"
            ? "Europe"
            : "Japan";
      return (
        data(a.id + "/routes")
          .items.filter((r) => r.region === region)
          .map((r) => "TPE–" + r.destination)
          .join("、") || "尚無本區已收錄資料"
      );
    }
    default:
      return PENDING;
  }
}
function Compare() {
  const [group, setGroup] = useState("all");
  let dims = data("comparison").dimensions;
  const groups = {
    fleet: ["fleet", "age", "types", "longhaul", "cargo", "orders"],
    business: ["revenue", "eps", "brand", "advantages", "risks", "future"],
    interview: ["cadet", "culture", "interview"],
  };
  return (
    <>
      <Heading
        eyebrow="COMPARE WITH CONTEXT"
        title="三雄比較"
        description="先理解口徑，再比較差異。每個數字都應帶著日期一起記住。"
      />
      <div className="filters">
        <label>
          比較主題
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="all">全部面向</option>
            <option value="fleet">機隊與運能</option>
            <option value="business">經營與財務</option>
            <option value="interview">面試與培訓</option>
          </select>
        </label>
      </div>
      <div className="table-wrap comparison">
        <table>
          <thead>
            <tr>
              <th>比較面向</th>
              {airlines.map((a) => (
                <th key={a.id}>
                  <a href={"#" + a.id}>{a.name} ↗</a>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dims
              .filter(([key]) => group === "all" || groups[group].includes(key))
              .map(([key, label]) => (
                <tr key={key}>
                  <th>{label}</th>
                  {airlines.map((a) => (
                    <td key={a.id}>
                      {comparisonValue(a, key)}
                      <a
                        className="compare-source"
                        href={
                          "#" +
                          a.id +
                          "/" +
                          (["revenue", "eps"].includes(key)
                            ? "finance"
                            : key === "types"
                              ? "fleet"
                              : key === "alliance"
                                ? "alliances"
                                : sections.some((s) => s.id === key)
                                  ? key
                                  : "overview")
                        }
                      >
                        來源／詳細資料 ↗
                      </a>
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <section className="study-callout">
        <GraduationCap />
        <div>
          <h2>這些差異對面試代表什麼？</h2>
          <p>
            機隊規模不等於適合度。先選一項已查核的公司特色，再說明它對訓練、團隊合作或營運的意義，最後接上自己的真實經驗。
          </p>
          <a href="#interview">練習 Why This Airline →</a>
        </div>
      </section>
    </>
  );
}
function Weekly() {
  const [air, setAir] = useState("all"),
    [topic, setTopic] = useState("all"),
    [period, setPeriod] = useState("week");
  const topics = [
    "Fleet",
    "Aircraft Orders",
    "Aircraft Delivery",
    "Routes",
    "New Destinations",
    "Codeshare",
    "Alliance",
    "Finance",
    "Cargo",
    "Recruitment",
    "Cadet Pilot",
    "Management",
    "Safety",
    "Maintenance",
    "ESG",
    "SAF",
    "Major Aviation News",
  ];
  let list = weekly.filter(
    (n) =>
      (air === "all" || n.airline === air) &&
      (topic === "all" || n.topic === topic) &&
      (period === "all" ||
        (n.event_date >= "2026-10-05" && n.event_date <= "2026-10-11")),
  );
  return (
    <>
      <Heading
        eyebrow="WEEKLY INTELLIGENCE"
        title="每週情報簡報"
        description="查核週期：2026-10-05 — 2026-10-11。新消息、重要性與面試影響一起讀。"
      />
      <div className="notice">
        人工查核的靜態週報，尚未啟用自動更新；不是即時新聞串流。
      </div>
      <div className="filters">
        <label>
          航空公司
          <select value={air} onChange={(e) => setAir(e.target.value)}>
            <option value="all">全部</option>
            {airlines.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          追蹤主題
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="all">全部主題</option>
            {topics.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          期間
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="week">本週</option>
            <option value="all">含近期背景</option>
          </select>
        </label>
        <span>{list.length} 則</span>
      </div>
      {list.map((n) => (
        <NewsCard key={n.id} n={n} />
      ))}
      {!list.length && (
        <Pending note="本篩選尚無已查核消息，不代表沒有事件發生。" />
      )}
      {air === "all" && period === "week" && (
        <Pending note="星宇本週尚無已查核新聞；可切換「含近期背景」閱讀布拉格首航。" />
      )}
    </>
  );
}
function QuestionBank({
  initial = "all",
  openInterview,
  saved = [],
  mastered = [],
}) {
  const [air, setAir] = useState(initial),
    [topic, setTopic] = useState("all"),
    [query, setQuery] = useState(""),
    [mode, setMode] = useState("all"),
    [difficulty, setDifficulty] = useState("all");
  let list = bank.filter(
    (q) =>
      (air === "all" || q.airline === air) &&
      (topic === "all" || q.topic === topic) &&
      (difficulty === "all" || q.difficulty === difficulty) &&
      (mode === "all" ||
        (mode === "saved" ? saved : mastered).includes(q.id)) &&
      `${q.question} ${q.question_en} ${q.keywords}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <section className="practice-overview" aria-label="練習進度">
        <div>
          <span className="eyebrow">YOUR NEXT TAKEOFF</span>
          <h2>每天一題，把回答說清楚。</h2>
          <p>理解重點 → 計時試說 → 記下調整</p>
          <button
            className="primary"
            onClick={() =>
              openInterview(
                list.find((q) => !mastered.includes(q.id)) ||
                  list[0] ||
                  bank[0],
              )
            }
          >
            開始一題練習 <ArrowRight size={16} />
          </button>
        </div>
        <div className="practice-progress">
          <strong>
            {mastered.filter((id) => bank.some((q) => q.id === id)).length}
            <small> / {bank.length}</small>
          </strong>
          <span>已練習題目</span>
          <progress
            aria-label="已練習題目"
            value={
              mastered.filter((id) => bank.some((q) => q.id === id)).length
            }
            max={bank.length}
          />
          <span>30 秒抓重點 · 60 秒加例子</span>
        </div>
      </section>
      <div className="filters bank-filters">
        <label className="grow">
          搜尋題目
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例如 CRM、機隊、Why this airline"
          />
        </label>
        <label>
          航空公司
          <select value={air} onChange={(e) => setAir(e.target.value)}>
            <option value="all">全部航空公司</option>
            <option value="General">General 通用</option>
            {airlines.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          主題
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="all">全部主題</option>
            {[...new Set(bank.map((q) => q.topic))].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          難度
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="all">全部難度</option>
            <option>基礎</option>
            <option>中階</option>
          </select>
        </label>
        <label>
          學習紀錄
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="all">全部題目</option>
            <option value="saved">已收藏</option>
            <option value="mastered">已練習</option>
          </select>
        </label>
      </div>
      <p className="fineprint">
        {list.length} 道題 ·
        原創模擬練習，非歷屆考題或官方標準答案。練習紀錄僅儲存在此瀏覽器。
      </p>
      <div className="question-grid">
        {list.map((q) => (
          <button
            className="question-card"
            key={q.id}
            onClick={() => openInterview(q)}
          >
            <div className="question-meta">
              <span>
                {q.airline === "General" ? "GENERAL" : getAir(q.airline).code} /{" "}
                {q.topic}
              </span>
              <span>
                {q.difficulty}
                {saved.includes(q.id) && " ★"}
                {mastered.includes(q.id) && " ✓"}
              </span>
            </div>
            <h3>{q.question}</h3>
            <p>{q.question_en}</p>
            <div className="question-bottom">
              {q.keywords.slice(0, 2).map((k) => (
                <span key={k}>{k}</span>
              ))}
              <ArrowUpRight size={18} />
            </div>
          </button>
        ))}
      </div>
      {!list.length && (
        <Pending note="沒有符合篩選的題目，請調整搜尋或條件。" />
      )}
    </>
  );
}
function InterviewDialog({
  q,
  close,
  saved,
  setSaved,
  mastered,
  setMastered,
  notes,
  setNotes,
}) {
  const ref = useRef(),
    [length, setLength] = useState(30),
    [seconds, setSeconds] = useState(30),
    [running, setRunning] = useState(false);
  useEffect(() => {
    ref.current.showModal();
    return () => {};
  }, []);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(
      () =>
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false);
            return 0;
          }
          return s - 1;
        }),
      1000,
    );
    return () => clearInterval(t);
  }, [running]);
  const toggle = (arr, set) =>
    set(arr.includes(q.id) ? arr.filter((x) => x !== q.id) : [...arr, q.id]);
  return (
    <dialog
      ref={ref}
      onCancel={close}
      className="interview-dialog"
      aria-labelledby="practice-title"
    >
      <div className="dialog-top">
        <span className="eyebrow">INTERVIEW VIEW · {q.topic}</span>
        <button onClick={close} aria-label="關閉練習">
          <X />
        </button>
      </div>
      <h2 id="practice-title">{q.question}</h2>
      <ReadingControls />
      <p className="english-question">{q.question_en}</p>
      <p className="muted">{q.note}</p>
      <div className="practice-controls">
        <div className="segmented">
          {[30, 60].map((n) => (
            <button
              key={n}
              className={length === n ? "active" : ""}
              onClick={() => {
                setLength(n);
                setSeconds(n);
                setRunning(false);
              }}
            >
              {n} 秒
            </button>
          ))}
        </div>
        <b className="timer" aria-live="off">
          {seconds}s
        </b>
        <button
          onClick={() => {
            if (seconds === 0) setSeconds(length);
            setRunning(!running);
          }}
        >
          <Play size={14} />
          {running ? "暫停" : "開始"}
        </button>
        <button
          aria-label="重設計時"
          onClick={() => {
            setSeconds(length);
            setRunning(false);
          }}
        >
          <RotateCcw size={15} />
        </button>
      </div>
      <AnswerView q={q} length={length} />
      <Source item={q} />
      <label className="notes-label">
        我的口說筆記
        <textarea
          value={notes[q.id] || ""}
          onChange={(e) => setNotes({ ...notes, [q.id]: e.target.value })}
          placeholder="加入你的真實經驗、待改善處與關鍵字…"
        />
      </label>
      <div className="dialog-actions">
        <button onClick={() => toggle(saved, setSaved)}>
          <Bookmark size={16} />
          {saved.includes(q.id) ? "已收藏" : "收藏題目"}
        </button>
        <button
          className="primary"
          onClick={() => toggle(mastered, setMastered)}
        >
          <Check size={16} />
          {mastered.includes(q.id) ? "已練習" : "標記已練習"}
        </button>
      </div>
    </dialog>
  );
}
function Sources() {
  return (
    <>
      <Heading
        eyebrow="EVIDENCE BEFORE ANSWERS"
        title="來源與查核"
        description="官方資料優先，未知就留白。資料查核日：2026-10-11。"
      />
      <div className="facts-grid">
        {[
          ["L1", "航空公司官方", "年報、IR、ESG、招募與新聞稿"],
          ["L2", "政府與證交所", "民航局、公開資訊觀測站、證交所"],
          ["L3", "產業一手資料", "製造商、聯盟、ICAO、IATA、機場"],
        ].map(([n, t, d]) => (
          <article className="fact-card" key={n}>
            <span className="eyebrow">{n}</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </article>
        ))}
      </div>
      <p className="notice">
        confirmed 是已查核來源中的事實；announced
        是已公告但不代表已實現；planned 是計畫；estimated 是估計；unverified
        尚未查核。原創面試分析不是公司立場。
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>來源</th>
              <th>層級</th>
              <th>發布日</th>
              <th>資料基準</th>
              <th>查核日</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id}>
                <td>
                  <a href={s.source_url} target="_blank" rel="noreferrer">
                    {s.source} ↗
                  </a>
                </td>
                <td>L{s.level}</td>
                <td>{s.published_date || "未標示"}</td>
                <td>{s.as_of || "未標示"}</td>
                <td>{s.verified_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function App() {
  const path = useHash(),
    [page, tab] = path.split("/");
  const [q, setQ] = useState(null),
    [search, setSearch] = useState("");
  const [saved, setSaved] = useSaved("taih-saved-v1", []),
    [mastered, setMastered] = useSaved("taih-mastered-v1", []),
    [notes, setNotes] = useSaved("taih-notes-v1", {});
  const a = getAir(page);
  const exportNotes = () => {
    let url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { exported_at: new Date().toISOString(), saved, mastered, notes },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    let el = document.createElement("a");
    el.href = url;
    el.download = "taih-study-notes.json";
    el.click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content").focus();
        }}
      >
        跳至主要內容
      </a>
      <aside className="sidebar">
        <a href="#home" className="brand">
          <span className="brand-icon">
            <img
              src={`${import.meta.env.BASE_URL}icons/metal-t-centered-192.png`}
              alt=""
            />
          </span>
          <div>
            TAIWAN AIRLINES<small>INTELLIGENCE HUB</small>
          </div>
        </a>
        <div className="sidebar-caption">培訓機師準備系統</div>
        <nav aria-label="主要導覽">
          {navItems.map(([id, label, Icon]) => (
            <a key={id} href={"#" + id} className={page === id ? "active" : ""}>
              <Icon size={18} />
              {label}
              {ids.includes(id) && (
                <i style={{ background: getAir(id).color }} />
              )}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <ShieldCheck size={23} />
          <b>先查證，再起飛。</b>
          <p>
            PUBLIC SOURCES
            <br />
            ZERO EXTRA COST
          </p>
          <span>v0.1 · NT$0</span>
        </div>
      </aside>
      <div className="app-shell">
        <header className="topbar">
          <div className="breadcrumb">
            情報中心 <ChevronRight size={14} />
            <span>
              {navItems.find((x) => x[0] === page)?.[1] || "航空公司"}
            </span>
          </div>
          <div className="global-search">
            <Search size={16} />
            <input
              aria-label="全站搜尋"
              placeholder="搜尋航空公司、面試題目…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <div className="search-results">
                {airlines
                  .filter((a) =>
                    (a.name + a.english)
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((a) => (
                    <a
                      href={"#" + a.id}
                      key={a.id}
                      onClick={() => setSearch("")}
                    >
                      {a.name} <ArrowUpRight size={14} />
                    </a>
                  ))}
                {bank
                  .filter((q) =>
                    (q.question + q.question_en)
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .slice(0, 6)
                  .map((q) => (
                    <button
                      key={q.id}
                      onClick={() => {
                        setQ(q);
                        setSearch("");
                      }}
                    >
                      {q.question}
                    </button>
                  ))}
                <button onClick={() => setSearch("")}>關閉搜尋</button>
              </div>
            )}
          </div>
          <span className="live-label">
            <i />
            研究資料庫
          </span>
        </header>
        <main id="main-content" tabIndex={-1}>
          <ReadingControls />
          {page === "home" ? (
            <Home openInterview={setQ} />
          ) : a ? (
            <Airline key={page} a={a} tab={tab} openInterview={setQ} />
          ) : page === "compare" ? (
            <Compare />
          ) : page === "weekly" ? (
            <Weekly />
          ) : page === "interview" ? (
            <>
              <Heading
                eyebrow="PRACTISE WITH PURPOSE"
                title="把知識，說成你的回答。"
                description={`${bank.length} 道中英文練習題 · 已練習 ${mastered.length} 道 · 已收藏 ${saved.length} 道`}
              >
                <button onClick={exportNotes}>
                  <Download size={16} />
                  匯出筆記
                </button>
              </Heading>
              <PrivateImport />
              <QuestionBank
                openInterview={setQ}
                saved={saved}
                mastered={mastered}
              />
            </>
          ) : page === "sources" ? (
            <Sources />
          ) : page === "airlines" ? (
            <>
              <Heading
                eyebrow="AIRLINES"
                title="選擇航空公司"
                description="相同研究架構，深入理解不同公司。"
              />
              <div className="airline-grid">
                {airlines.map((a) => (
                  <AirlineCard key={a.id} a={a} />
                ))}
              </div>
            </>
          ) : (
            <>
              <Heading title="找不到此頁面" />
              <a href="#home">回到總覽 →</a>
            </>
          )}
          <footer>
            <span>Taiwan Airlines Intelligence Hub · v0.1</span>
            <span>獨立學習工具，非航空公司官方網站 · NT$0</span>
          </footer>
        </main>
      </div>
      <nav className="mobile-nav" aria-label="手機導覽">
        {[
          ["home", "總覽", LayoutDashboard],
          ["airlines", "航空公司", Plane],
          ["compare", "比較", ChartNoAxesCombined],
          ["weekly", "週報", Newspaper],
          ["interview", "面試", GraduationCap],
        ].map(([id, label, Icon]) => (
          <a
            key={id}
            href={"#" + id}
            className={
              page === id || (id === "airlines" && !!a) ? "active" : ""
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </a>
        ))}
      </nav>
      {q && (
        <InterviewDialog
          key={q.id}
          q={q}
          close={() => setQ(null)}
          saved={saved}
          setSaved={setSaved}
          mastered={mastered}
          setMastered={setMastered}
          notes={notes}
          setNotes={setNotes}
        />
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(
  <ReadingProvider>
    <PersonalProvider ids={bank.map((q) => q.id)}>
      <App />
    </PersonalProvider>
  </ReadingProvider>,
);
