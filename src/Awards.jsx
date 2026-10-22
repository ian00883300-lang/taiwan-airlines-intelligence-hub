import React, {useState} from 'react';
import awards from '../data/awards.json';
export default function Awards({airline,Source}) {
 const [filter,setFilter]=useState('全部');
 const rows=awards.filter(x=>x.airline===airline).sort((a,b)=>b.date.localeCompare(a.date));
 const visible=rows.filter(x=>filter==='全部'||(filter==='認證與續證'?['認證','續證'].includes(x.kind):!['認證','續證'].includes(x.kind)));
 return <section className="panel awards-panel"><h2>歷年獎項與認證</h2><p className="fineprint">已核實的歷年紀錄，非完整得獎清單。獎項年度與頒發、取得、公告日期分列；歷史認證不代表目前仍在有效期內。</p><label>類別 <select value={filter} onChange={e=>setFilter(e.target.value)} aria-label="獎項與認證類別"><option>全部</option><option>獎項與評等</option><option>認證與續證</option></select></label><div className="table-wrap research-table"><table><thead><tr><th>年度／日期</th><th>獎項或認證</th><th>內容與適用範圍</th></tr></thead><tbody>{visible.map(x=><tr key={x.id}><th scope="row"><strong>{x.year}</strong><div style={{whiteSpace:'nowrap'}}>{x.date}</div><small>{x.date_basis}</small></th><td><strong>{x.title}</strong><div>{x.issuer} · {x.kind}</div></td><td>{x.detail}<Source item={x} compact/></td></tr>)}</tbody></table></div></section>;
}
