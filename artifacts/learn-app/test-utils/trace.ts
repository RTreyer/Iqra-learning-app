import { decodeMask, type Stroke } from "@/components/activities/trace/validate";
import { TRACE_GRID, traceGuides } from "@/content/generated/traceGuides";

/**
 * Strokes that trace a guide the way a careful child would: one horizontal stroke along
 * each run of letter cells, row by row, on a `size` × `size` pad.
 */
export function strokesOnGuide(guide: string, size = 300): Stroke[] {
  const shape = traceGuides[guide];
  if (!shape) throw new Error(`No generated outline for "${guide}"`);
  const { cells, grid } = decodeMask(shape.mask, TRACE_GRID);
  const cell = size / grid;
  const strokes: Stroke[] = [];
  for (let row = 0; row < grid; row++) {
    let run: Stroke = [];
    for (let col = 0; col <= grid; col++) {
      if (col < grid && cells[row * grid + col]) {
        run.push({ x: (col + 0.5) * cell, y: (row + 0.5) * cell });
      } else if (run.length) {
        strokes.push(run);
        run = [];
      }
    }
  }
  return strokes;
}

/**
 * Strokes that follow a guide the way a child traces it with a finger: along the letter's centre
 * line, from its right end (Arabic is written right to left), one stroke per connected part
 * (the body, a dot, the next letter), on a `size` × `size` pad. `wobble` (in cells) shakes the
 * finger a little.
 */
export function strokesAlongGuide(guide: string, size = 300, wobble = 0): Stroke[] {
  const shape = traceGuides[guide];
  if (!shape) throw new Error(`No generated outline for "${guide}"`);
  const { spine, grid } = decodeMask(shape.mask, TRACE_GRID);
  const cell = size / grid;
  const left = spine.map((i) => ({ r: Math.floor(i / grid), c: i % grid }));
  const touching = (p: { r: number; c: number }) =>
    left.filter((q) => q !== p && Math.max(Math.abs(q.r - p.r), Math.abs(q.c - p.c)) === 1).length;
  let seed = 11;
  const shake = () => {
    seed = (seed * 16807) % 2147483647;
    return ((seed / 2147483647) * 2 - 1) * wobble;
  };
  const strokes: Stroke[] = [];
  while (left.length) {
    // Start at an end of the line, the rightmost one first.
    const start = left.reduce((a, b) =>
      touching(b) < touching(a) || (touching(b) === touching(a) && b.c > a.c) ? b : a,
    );
    left.splice(left.indexOf(start), 1);
    const path = [start];
    let current = start;
    for (;;) {
      let best = -1;
      let bestDistance = Infinity;
      left.forEach((q, k) => {
        const d = (q.r - current.r) ** 2 + (q.c - current.c) ** 2;
        if (d < bestDistance) {
          bestDistance = d;
          best = k;
        }
      });
      // A jump: the finger lifts, and the next part is a new stroke.
      if (best < 0 || bestDistance > 8) break;
      current = left.splice(best, 1)[0];
      path.push(current);
    }
    strokes.push(
      path.map((p) => ({ x: (p.c + 0.5 + shake()) * cell, y: (p.r + 0.5 + shake()) * cell })),
    );
  }
  return strokes;
}
