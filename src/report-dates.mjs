export function taipeiDay(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en', {timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(p => [p.type,p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
export function taipeiWeek(now = new Date()) {
  const day = new Date(`${taipeiDay(now)}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() - (day.getUTCDay() + 6) % 7);
  const start = day.toISOString().slice(0,10);
  day.setUTCDate(day.getUTCDate() + 6);
  return {start, end:day.toISOString().slice(0,10)};
}
export function latestVerified(items) {
  return items.map(i => i.verified_date).filter(Boolean).sort().at(-1) || '尚無查核紀錄';
}
