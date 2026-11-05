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
//  7. Whole letter: at least ALONG of the letter's centre line was passed, and at least
//     BRANCH_PASSED of each of its branches (stem, bar, hook). A thick letter is half covered
//     by a line through part of it, so check 6 alone lets a skipped hook pass.

/** Share of drawn points that must lie on the letter. */
export const ON_LETTER = 0.9;
/** Share of the letter that must be traced. */
export const COVERED = 0.5;
/** Share of the letter's centre line the drawing must pass. */
export const ALONG = 0.9;
/** Share of each branch of the centre line the drawing must pass. */
export const BRANCH_PASSED = 0.5;
/** Shorter branches (in cells) are thinning noise at thick corners and are not checked. */
const MIN_BRANCH = 4;
/** Finger tolerance in mask cells (a cell is 2 % of the pad). */
const REACH = 2;

/**
 * `spine` is the letter's centre line (cell indices), split into `branches` at its junctions,
 * and `width` the letter's half width at each cell: a centre line cell counts as passed when
 * the drawing comes within 80 % of that half width plus a cell.
 */
export type GuideMask = {
  grid: number;
  cells: Uint8Array;
  near: Uint8Array;
  count: number;
  spine: number[];
  branches: number[][];
  width: Float32Array;
};

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
  const width = halfWidths(cells, grid);
  const spine = centreLine(cells, grid);
  const branches = splitBranches(spine, grid);
  const decoded = { grid, cells, near, count, spine, branches, width };
  masks.set(mask, decoded);
  return decoded;
}

/** Checks 5 to 7 for a guide mask; `word` only changes the wording of the hint. */
export function validateOnGuide(
  strokes: Stroke[],
  pad: PadSize,
  guide: GuideMask,
  word = false,
): ValidationResult {
  const { grid, cells, near, count, spine, branches, width } = guide;
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

  const drawn = new Uint8Array(grid * grid);
  for (const p of points) {
    const i = cellOf(p);
    if (i >= 0) drawn[i] = 1;
  }
  const isPassed = (i: number) => {
    const row = Math.floor(i / grid);
    const col = i % grid;
    const reach = width[i] * 0.8 + 1;
    const span = Math.ceil(reach);
    for (let dr = -span; dr <= span; dr++) {
      for (let dc = -span; dc <= span; dc++) {
        const r = row + dr;
        const c = col + dc;
        if (r < 0 || r >= grid || c < 0 || c >= grid || dr * dr + dc * dc > reach * reach) continue;
        if (drawn[r * grid + c]) return true;
      }
    }
    return false;
  };
  const share = (part: number[]) => part.filter(isPassed).length / part.length;
  if (spine.length > 0 && share(spine) < ALONG) return { valid: false, msg: COVER_MORE(word) };
  if (branches.some((branch) => share(branch) < BRANCH_PASSED))
    return { valid: false, msg: COVER_MORE(word) };
  return { valid: true };
}

/** The centre line cut at its junctions (cells with three or more neighbours on it). */
function splitBranches(spine: number[], grid: number): number[][] {
  const on = new Set(spine);
  const neighbours = (i: number) => {
    const row = Math.floor(i / grid);
    const col = i % grid;
    const out: number[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = row + dr;
        const c = col + dc;
        if ((dr || dc) && r >= 0 && r < grid && c >= 0 && c < grid && on.has(r * grid + c))
          out.push(r * grid + c);
      }
    }
    return out;
  };
  const junction = new Set(spine.filter((i) => neighbours(i).length >= 3));
  const seen = new Set<number>();
  const branches: number[][] = [];
  for (const start of spine) {
    if (junction.has(start) || seen.has(start)) continue;
    seen.add(start);
    const branch: number[] = [];
    const queue = [start];
    while (queue.length) {
      const i = queue.pop()!;
      branch.push(i);
      for (const j of neighbours(i)) {
        if (junction.has(j) || seen.has(j)) continue;
        seen.add(j);
        queue.push(j);
      }
    }
    if (branch.length >= MIN_BRANCH) branches.push(branch);
  }
  return branches;
}

/** Distance of every letter cell to the nearest empty cell (two pass chamfer). */
function halfWidths(cells: Uint8Array, grid: number): Float32Array {
  const d = new Float32Array(grid * grid);
  for (let i = 0; i < d.length; i++) d[i] = cells[i] ? Infinity : 0;
  const relax = (i: number, j: number, cost: number) => {
    if (d[j] + cost < d[i]) d[i] = d[j] + cost;
  };
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      const i = r * grid + c;
      if (r > 0) relax(i, i - grid, 1);
      if (c > 0) relax(i, i - 1, 1);
      if (r > 0 && c > 0) relax(i, i - grid - 1, Math.SQRT2);
      if (r > 0 && c < grid - 1) relax(i, i - grid + 1, Math.SQRT2);
    }
  }
  for (let r = grid - 1; r >= 0; r--) {
    for (let c = grid - 1; c >= 0; c--) {
      const i = r * grid + c;
      if (r < grid - 1) relax(i, i + grid, 1);
      if (c < grid - 1) relax(i, i + 1, 1);
      if (r < grid - 1 && c < grid - 1) relax(i, i + grid + 1, Math.SQRT2);
      if (r < grid - 1 && c > 0) relax(i, i + grid - 1, Math.SQRT2);
    }
  }
  // Cells on the pad edge count as one cell from the outside.
  for (let i = 0; i < d.length; i++) if (d[i] === Infinity) d[i] = 1;
  return d;
}

/** The letter thinned to a one cell centre line (Zhang and Suen). */
function centreLine(cells: Uint8Array, grid: number): number[] {
  const m = Uint8Array.from(cells);
  const at = (r: number, c: number) =>
    r < 0 || c < 0 || r >= grid || c >= grid ? 0 : m[r * grid + c];
  let changed = true;
  while (changed) {
    changed = false;
    for (const pass of [0, 1]) {
      const remove: number[] = [];
      forEachCell(m, grid, (r, c) => {
        // Neighbours clockwise from the top.
        const n = [
          at(r - 1, c),
          at(r - 1, c + 1),
          at(r, c + 1),
          at(r + 1, c + 1),
          at(r + 1, c),
          at(r + 1, c - 1),
          at(r, c - 1),
          at(r - 1, c - 1),
        ];
        const filled = n.reduce((a, b) => a + b, 0);
        if (filled < 2 || filled > 6) return;
        let turns = 0;
        for (let k = 0; k < 8; k++) if (!n[k] && n[(k + 1) % 8]) turns++;
        if (turns !== 1) return;
        const keep =
          pass === 0
            ? n[0] * n[2] * n[4] || n[2] * n[4] * n[6]
            : n[0] * n[2] * n[6] || n[0] * n[4] * n[6];
        if (!keep) remove.push(r * grid + c);
      });
      for (const i of remove) m[i] = 0;
      if (remove.length) changed = true;
    }
  }
  const out: number[] = [];
  for (let i = 0; i < m.length; i++) if (m[i]) out.push(i);
  return out;
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
