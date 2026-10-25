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

export function validateTracing(
  strokes: Stroke[],
  pad: PadSize,
  strokeCount = 1,
): ValidationResult {
  const { width: padW, height: padH } = pad;
  // An unmeasured or collapsed pad cannot be judged; never accept it.
  if (!(padW > 0 && padH > 0)) return { valid: false, msg: TOO_SMALL };
  // Drop non finite points (bad events) and strokes left empty by that.
  strokes = strokes
    .map((stroke) => stroke.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y)))
    .filter((stroke) => stroke.length > 0);

  // 1: enough distinct strokes?
  if (strokes.length < strokeCount) {
    return {
      valid: false,
      msg:
        strokeCount === 1
          ? "اِرسم خطاً واحداً على الأقل ✏️"
          : `اِرسم ${strokeCount} خطوط على الأقل ✏️`,
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
  if (maxX - minX < padW * 0.2 && maxY - minY < padH * 0.15)
    return { valid: false, msg: TOO_SMALL };

  // 4: centroid within 35 % of the pad centre on each axis (0 = centre, 0.5 = edge).
  const offX = Math.abs(sumX / all.length - padW / 2) / padW;
  const offY = Math.abs(sumY / all.length - padH / 2) / padH;
  if (offX > 0.35 || offY > 0.35) return { valid: false, msg: OFF_CENTRE };

  return { valid: true };
}

// ── On the guide ─────────────────────────────────────────────────────────────────────────
// For Arabic guides the outline is known (content/generated/traceGuides.ts), so the check is
// about the letter itself, not just the size of the drawing:
//  5. On the letter: at least ON_LETTER of the drawn points lie on the letter (with a
//     finger's tolerance), so a different letter or a scribble next to it fails.
//  6. Covered: at least COVERED of the letter lies under the drawn path.

/** Share of drawn points that must lie on the letter. */
export const ON_LETTER = 0.9;
/** Share of the letter that must be traced. */
export const COVERED = 0.5;
/** Finger tolerance in mask cells (a cell is 2 % of the pad). */
const REACH = 2;

export type GuideMask = { grid: number; cells: Uint8Array; near: Uint8Array; count: number };

const masks = new Map<string, GuideMask>();

/** Decodes a base64 bit mask once; `near` marks every cell within REACH of the letter. */
export function decodeMask(mask: string, grid: number): GuideMask {
  const cached = masks.get(mask);
  if (cached) return cached;
  const bytes = base64Bytes(mask);
  const cells = new Uint8Array(grid * grid);
  let count = 0;
  for (let i = 0; i < cells.length; i++) {
    if (bytes[i >> 3] & (1 << (i & 7))) {
      cells[i] = 1;
      count++;
    }
  }
  const near = new Uint8Array(grid * grid);
  forEachCell(cells, grid, (row, col) =>
    forEachWithin(row, col, grid, (i) => {
      near[i] = 1;
    }),
  );
  const decoded = { grid, cells, near, count };
  masks.set(mask, decoded);
  return decoded;
}

/** Checks 5 and 6 for a guide mask; `word` only changes the wording of the hint. */
export function validateOnGuide(
  strokes: Stroke[],
  pad: PadSize,
  guide: GuideMask,
  word = false,
): ValidationResult {
  const { grid, cells, near, count } = guide;
  const cellOf = (p: Point) => {
    const col = Math.floor((p.x / pad.width) * grid);
    const row = Math.floor((p.y / pad.height) * grid);
    return row >= 0 && row < grid && col >= 0 && col < grid ? row * grid + col : -1;
  };
  // Points every half cell along each stroke, so fast swipes leave no gaps.
  const step = Math.min(pad.width, pad.height) / grid / 2;
  const points: Point[] = [];
  for (const stroke of strokes) {
    stroke.forEach((p, i) => {
      if (i === 0) return void points.push(p);
      const prev = stroke[i - 1];
      const n = Math.max(1, Math.ceil(Math.hypot(p.x - prev.x, p.y - prev.y) / step));
      for (let k = 1; k <= n; k++)
        points.push({ x: prev.x + ((p.x - prev.x) * k) / n, y: prev.y + ((p.y - prev.y) * k) / n });
    });
  }
  if (points.length === 0) return { valid: false, msg: COVER_MORE(word) };

  const onLetter = points.filter((p) => {
    const i = cellOf(p);
    return i >= 0 && near[i] === 1;
  }).length;
  if (onLetter / points.length < ON_LETTER) return { valid: false, msg: ON_THE_LETTER(word) };

  const covered = new Uint8Array(grid * grid);
  let coveredCount = 0;
  for (const p of points) {
    const i = cellOf(p);
    if (i < 0) continue;
    forEachWithin(Math.floor(i / grid), i % grid, grid, (j) => {
      if (cells[j] && !covered[j]) {
        covered[j] = 1;
        coveredCount++;
      }
    });
  }
  if (coveredCount / count < COVERED) return { valid: false, msg: COVER_MORE(word) };
  return { valid: true };
}

const ON_THE_LETTER = (word: boolean) =>
  word ? "اُكتب فوق الكلمة المرسومة ✏️" : "اُكتب فوق الحرف المرسوم ✏️";
const COVER_MORE = (word: boolean) =>
  word ? "أكمل كتابة الكلمة كلها 📏" : "أكمل كتابة الحرف كله 📏";

function forEachCell(cells: Uint8Array, grid: number, fn: (row: number, col: number) => void) {
  for (let i = 0; i < cells.length; i++) if (cells[i]) fn(Math.floor(i / grid), i % grid);
}

/** Calls `fn` for every cell index within REACH (a disc) of (row, col). */
function forEachWithin(row: number, col: number, grid: number, fn: (i: number) => void) {
  for (let dr = -REACH; dr <= REACH; dr++) {
    for (let dc = -REACH; dc <= REACH; dc++) {
      if (dr * dr + dc * dc > REACH * REACH) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < grid && c >= 0 && c < grid) fn(r * grid + c);
    }
  }
}

const BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Base64 to bytes without atob or Buffer, so it runs the same on native, web and Jest. */
function base64Bytes(text: string): Uint8Array {
  const clean = text.replace(/=+$/, "");
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let bits = 0;
  let value = 0;
  let o = 0;
  for (const ch of clean) {
    value = (value << 6) | BASE64.indexOf(ch);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[o++] = (value >> bits) & 0xff;
    }
  }
  return out;
}
