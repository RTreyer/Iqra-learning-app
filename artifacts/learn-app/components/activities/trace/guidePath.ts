import type { GuideMask, Point } from "./validate";

/**
 * The guide's centre line as one stroke in pad coordinates, for the demo hand: it starts at
 * the right top, as Arabic is written from right to left (at an end of the line there when it
 * has one), and always moves to the nearest cell not yet passed. Fits letters drawn in one
 * stroke without branches, such as د.
 */
export function guidePath(guide: GuideMask, pad: number): Point[] {
  const { grid, spine } = guide;
  if (spine.length === 0) return [];
  const row = (i: number) => Math.floor(i / grid);
  const col = (i: number) => i % grid;
  const on = new Set(spine);
  const neighbours = (i: number) => {
    let n = 0;
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++)
        if ((dr || dc) && on.has((row(i) + dr) * grid + col(i) + dc)) n++;
    return n;
  };
  const ends = spine.filter((i) => neighbours(i) === 1);
  // Arabic is written from right to left: start at the end nearest the top right corner.
  const corner = (i: number) => col(i) - row(i);
  // A loop letter (مـ, ه) may have its only end on the left, where the pen arrives: an end
  // counts only near the right top; otherwise the stroke starts at the right top of the spine.
  const top = spine.reduce((best, i) => (corner(i) > corner(best) ? i : best));
  const startEnds = ends.filter((i) => corner(i) >= corner(top) - grid / 10);
  const start = (startEnds.length > 0 ? startEnds : [top]).reduce((best, i) =>
    corner(i) > corner(best) || (corner(i) === corner(best) && row(i) < row(best)) ? i : best,
  );
  const left = new Set(spine);
  left.delete(start);
  const order = [start];
  let current = start;
  while (left.size > 0) {
    let next = -1;
    let nearest = Infinity;
    for (const i of left) {
      const d = (row(i) - row(current)) ** 2 + (col(i) - col(current)) ** 2;
      if (d < nearest) {
        nearest = d;
        next = i;
      }
    }
    left.delete(next);
    order.push(next);
    current = next;
  }
  const scale = pad / grid;
  return order.map((i) => ({ x: (col(i) + 0.5) * scale, y: (row(i) + 0.5) * scale }));
}

/** `points` with extra points every `step` along each segment, as a finger would report them. */
export function densify(points: Point[], step: number): Point[] {
  if (points.length === 0) return [];
  const out = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / step));
    for (let k = 1; k <= n; k++)
      out.push({ x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n });
  }
  return out;
}
