export function change(previous, current) {
  if (!Number.isFinite(previous) || !Number.isFinite(current) || previous <= 0)
    return "不適用（基期非正值）";
  const rate = (current / previous - 1) * 100;
  return `${rate > 0 ? "成長" : rate < 0 ? "衰退" : "持平"} ${Math.abs(rate).toFixed(2)}%`;
}
