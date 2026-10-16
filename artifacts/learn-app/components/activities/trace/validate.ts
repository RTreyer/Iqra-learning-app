/**
 * Tracing validation, moved from the legacy writing screen with the same rules.
 * All four checks must pass:
 *  1. Stroke count: at least `strokeCount` distinct strokes.
 *  2. Path length: total distance drawn is at least 50 % of the shorter pad side.
 *  3. Bounding box: width at least 20 % of the pad width OR height at least 15 % of the pad height.
 *  4. Centroid: mean point within 35 % of the pad centre on each axis.
 */

export type Point = { x: number; y: number };
export type Stroke = Point[];
export type PadSize = { width: number; height: number };
export type ValidationResult = { valid: true } | { valid: false; msg: string };

const TOO_SMALL = "اِرسم الحرف بشكل أكبر 📏";
const OFF_CENTRE = "اِرسم الحرف في وسط المساحة 🎯";

/** Extracts all M/L coordinate pairs from an SVG path data string. */
export function parsePoints(d: string): Point[] {
  const pts: Point[] = [];
  const tokens = d.split(/\s+/);
  for (let i = 0; i < tokens.length - 2; i++) {
    const cmd = tokens[i];
    if (cmd === "M" || cmd === "L") {
      const x = parseFloat(tokens[i + 1]);
      const y = parseFloat(tokens[i + 2]);
      if (!isNaN(x) && !isNaN(y)) pts.push({ x, y });
    }
  }
  return pts;
}

/** SVG path data for one stroke ("M x y L x y ..."), the inverse of parsePoints. */
export function strokeToPath(stroke: Stroke): string {
  let d = "";
  for (let i = 0; i < stroke.length; i++) {
    d += `${i === 0 ? "M" : " L"} ${stroke[i].x.toFixed(1)} ${stroke[i].y.toFixed(1)}`;
  }
  return d;
}

export function validateTracing(strokes: Stroke[], pad: PadSize, strokeCount = 1): ValidationResult {
  const { width: padW, height: padH } = pad;

  // 1: enough distinct strokes?
  if (strokes.length < strokeCount) {
    return {
      valid: false,
      msg: strokeCount === 1 ? "اِرسم خطاً واحداً على الأقل ✏️" : `اِرسم ${strokeCount} خطوط على الأقل ✏️`,
    };
  }

  const all: Point[] = strokes.flat();
  if (all.length < 10) return { valid: false, msg: TOO_SMALL };

  // 2: total path length, summed per stroke.
  let totalLen = 0;
  for (const pts of strokes) {
    for (let i = 1; i < pts.length; i++) {
      totalLen += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    }
  }
  if (totalLen < Math.min(padW, padH) * 0.5) return { valid: false, msg: TOO_SMALL };

  // 3: bounding box, at least one dimension adequate.
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let sumX = 0;
  let sumY = 0;
  for (const p of all) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
    sumX += p.x;
    sumY += p.y;
  }
  if (maxX - minX < padW * 0.2 && maxY - minY < padH * 0.15) return { valid: false, msg: TOO_SMALL };

  // 4: centroid within 35 % of the pad centre on each axis (0 = centre, 0.5 = edge).
  const offX = Math.abs(sumX / all.length - padW / 2) / padW;
  const offY = Math.abs(sumY / all.length - padH / 2) / padH;
  if (offX > 0.35 || offY > 0.35) return { valid: false, msg: OFF_CENTRE };

  return { valid: true };
}
