import type { GuideMask, Point } from "./validate";

/**
 * The guide's centre line as one stroke in pad coordinates, for the demo hand: it starts at
 * the top end (rightmost on a tie, as Arabic is written) and always moves to the nearest cell
 * not yet passed. Fits letters drawn in one stroke without branches, such as د.
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
  const start = (ends.length > 0 ? ends : spine).reduce((best, i) =>
    row(i) < row(best) || (row(i) === row(best) && col(i) > col(best)) ? i : best,
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
