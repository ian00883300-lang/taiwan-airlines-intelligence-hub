// Spherical great-circle illustration, not an operational flight plan.
export function greatCircle(from, to, steps = 96) {
  const rad = Math.PI / 180;
  const vector = ([lat, lng]) => [Math.cos(lat * rad) * Math.cos(lng * rad), Math.cos(lat * rad) * Math.sin(lng * rad), Math.sin(lat * rad)];
  const a = vector(from), b = vector(to);
  const dot = Math.max(-1, Math.min(1, a.reduce((s, v, i) => s + v * b[i], 0)));
  const angle = Math.acos(dot);
  let tangent = b.map((v, i) => v - dot * a[i]);
  let length = Math.hypot(...tangent);
  if (length < 1e-10) {
    const axis = Math.abs(a[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    const projection = axis.reduce((s, v, i) => s + v * a[i], 0);
    tangent = axis.map((v, i) => v - projection * a[i]);
    length = Math.hypot(...tangent);
  }
  tangent = tangent.map(v => v / length);
  let previous = from[1];
  return Array.from({length: steps + 1}, (_, i) => {
    const t = angle * i / steps;
    const v = a.map((x, k) => x * Math.cos(t) + tangent[k] * Math.sin(t));
    const lat = Math.atan2(v[2], Math.hypot(v[0], v[1])) / rad;
    let lng = Math.atan2(v[1], v[0]) / rad;
    while (lng - previous > 180) lng -= 360;
    while (lng - previous < -180) lng += 360;
    previous = lng;
    return [lat, lng];
  });
}
