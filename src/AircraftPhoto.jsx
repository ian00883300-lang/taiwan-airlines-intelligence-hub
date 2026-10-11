import React, { useState } from "react";

export default function AircraftPhoto({ aircraft, airline }) {
  const [failed, setFailed] = useState(false);
  const photo = aircraft.photo;
  return (
    <figure className="aircraft-photo">
      {photo?.image_url && !failed ? (
        <img
          src={
            photo.image_url.startsWith("https://")
              ? photo.image_url
              : import.meta.env.BASE_URL + photo.image_url
          }
          alt={`${airline} ${aircraft.aircraft_type}｜${photo.description}`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="aircraft-photo-fallback">
          {failed ? "官方圖片暫時無法載入" : "機型圖片待查核"}
          <small>
            {airline} · {aircraft.aircraft_type}
          </small>
        </div>
      )}
      <figcaption>
        <strong>
          {airline} · {aircraft.aircraft_type}
        </strong>
        {photo ? (
          <>
            <span>{photo.description}</span>
            <a href={photo.source_url} target="_blank" rel="noreferrer">
              圖片來源：{photo.source} ↗
            </a>
            <small>
              {photo.credit} · 圖片查核 {photo.verified_date}
              ；不代表當日現役架數。
            </small>
          </>
        ) : (
          <small>
            Data pending verification；不以其他公司或相似機型圖片代替。
          </small>
        )}
      </figcaption>
    </figure>
  );
}
