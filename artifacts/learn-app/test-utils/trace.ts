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
