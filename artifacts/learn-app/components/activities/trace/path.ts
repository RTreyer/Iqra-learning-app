import type { Point } from "./validate";

/** Points closer than this to the previous one are dropped. */
export const MIN_POINT_DISTANCE = 2;
/** Hard cap per stroke so a long scribble cannot grow the path without bound. */
export const MAX_STROKE_POINTS = 2000;

/** A stroke with its SVG path data kept in sync, so rendering never rebuilds the string. */
export type DrawnStroke = { points: Point[]; d: string };

const fmt = (n: number) => n.toFixed(1);

export function startStroke(p: Point): DrawnStroke {
  // A repeated point gives a zero length segment, so a single tap still draws a round dot.
  const x = fmt(p.x);
  const y = fmt(p.y);
  return { points: [p], d: `M ${x} ${y} L ${x} ${y}` };
}

/** Appends `p` in place when it is finite, far enough from the last point and under the cap. */
export function addPoint(stroke: DrawnStroke, p: Point): boolean {
  if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return false;
  if (stroke.points.length >= MAX_STROKE_POINTS) return false;
  const last = stroke.points[stroke.points.length - 1];
  if (last && Math.hypot(p.x - last.x, p.y - last.y) < MIN_POINT_DISTANCE) return false;
  stroke.points.push(p);
  stroke.d += ` L ${fmt(p.x)} ${fmt(p.y)}`;
  return true;
}
