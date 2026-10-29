import React from "react";

export default function WeeklyEdition({
  edition,
  records,
  air,
  topic,
  Source,
}) {
  const selected = edition.items
    .map((item) => ({
      ...item,
      news: records.find((news) => news.id === item.news_id),
    }))
    .filter(
      (item) =>
        item.news &&
        (air === "all" || item.news.airline === air) &&
        (topic === "all" || item.news.topic === topic),
    );
  return (
    <section className="weekly-edition" aria-label="本期營運追蹤週報">
      <h2>{edition.title}</h2>
      <p>
        週期：{edition.period_start}～{edition.period_end} · 編輯日期：
        {edition.edited_date}（台灣時間）
      </p>
      <p className="notice">{edition.note}</p>
      {selected.map((item) => (
        <article key={item.news_id} className="panel weekly-tracking-card">
          <span className="eyebrow">
            營運追蹤 ·{" "}
            {({starlux: "星宇航空", "eva-air": "長榮航空", "china-airlines": "中華航空"})[item.news.airline] || item.news.airline}
          </span>
          <h3>{item.headline}</h3>
          <p>{item.tracking}</p>
          <dl>
            <dt>本期觀察</dt>
            <dd>{item.focus}</dd>
            <dt>面試延伸</dt>
            <dd>{item.interview}</dd>
          </dl>
          <p className="fineprint">
            原公告日：{item.news.published_date || "未指定"} · 事件日：
            {item.news.event_date || "未確認"} · 原來源查核：
            {item.news.verified_date}
          </p>
          <Source item={item.news} />
        </article>
      ))}
      {!selected.length && (
        <p className="pending">
          本期追蹤沒有符合此篩選的項目，可切換「近期與背景」查看其他消息。
        </p>
      )}
    </section>
  );
}
