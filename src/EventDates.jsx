import React from "react";
import events from "../data/events.json";
import { formatEventDate } from "./event-dates.mjs";

export default function EventDates({ ids = [] }) {
  const selected = ids
    .map((id) => events.find((event) => event.id === id))
    .filter(Boolean);
  if (!selected.length) return null;
  return (
    <aside className="event-dates" aria-label="首航與交機日期">
      {selected.map((event) => (
        <div key={event.id}>
          <strong>
            {event.label}：{formatEventDate(event.event_date)}
          </strong>
          {event.announced_event_date && (
            <p>
              公告中的預定開航日：{formatEventDate(event.announced_event_date)}
              {event.event_date
                ? "（實際首航已另具事後證據）"
                : "（實際首航另查）"}
            </p>
          )}
          {event.published_date && (
            <p>公告發布日：{formatEventDate(event.published_date)}</p>
          )}
          <p>{event.note}</p>
          <a href={event.source_url} target="_blank" rel="noreferrer">
            {event.source} ↗
          </a>
          {event.corroboration_url && (
            <p>
              <a
                href={event.corroboration_url}
                target="_blank"
                rel="noreferrer"
              >
                交叉比對來源 ↗
              </a>
            </p>
          )}
          {event.announcement_source_url && (
            <p>
              <a
                href={event.announcement_source_url}
                target="_blank"
                rel="noreferrer"
              >
                開航計畫公告（
                {formatEventDate(event.announcement_published_date)}）↗
              </a>
            </p>
          )}
          <p className="fineprint">
            {event.checked_date
              ? `來源查核：${formatEventDate(event.checked_date)}`
              : event.announcement_checked_date
                ? `開航計畫查核：${formatEventDate(event.announcement_checked_date)}`
                : "首航日期尚未查核"}
          </p>
        </div>
      ))}
    </aside>
  );
}
