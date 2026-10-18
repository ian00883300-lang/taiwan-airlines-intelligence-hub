import React from 'react';
import services from '../data/maintenance-services.json';

export default function MaintenanceServices({ airline, Source }) {
  const rows = services[airline];
  if (!rows) return null;
  return <section className="study-section maintenance-services">
    <h3>{airline === 'china-airlines' ? '修護服務：六類業務與分工' : '修護服務：合作體系與分工'}</h3>
    <div className="study-table"><table>
      <thead><tr><th>類別</th><th>公開服務範圍</th><th>研究重點</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.title}>
        <th scope="row">{row.title}</th><td>{row.body}<Source item={row}/></td><td>{row.study_note}</td>
      </tr>)}</tbody>
    </table></div>
    <p className="fineprint">依官方服務介紹分類；研究重點為本站整理。特定機型與工作項目仍須核對現行核准能力清單。</p>
  </section>;
}
