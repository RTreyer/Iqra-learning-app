// Builds content/generated/traceGuides.ts: for every trace guide in the catalog, the outline
// the child traces over (an SVG path in a 100 × 100 box) and a coarse mask of where the letters
// are, used to check that the child wrote on the letter (trace/validate.ts).
//
// The line drawings of unit 1 (a straight line, a circle, a wave) are no letters: they are drawn
// here from their centre lines (LINE_SHAPES), large and as thick as a letter's stroke, and then
// checked like letters.
//
// The guide is shaped with HarfBuzz (joined Arabic forms) in Noto Naskh Arabic Bold
// (scripts/fonts, SIL Open Font License 1.1), so what the child sees is exactly what is checked,
// on every device. Run after changing a trace guide:  npm run guides
// `--check` only compares (npm run test:data does), and fails when the file is out of date.

import { Buffer } from "node:buffer";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as hb from "harfbuzzjs";
import { DEMOS } from "../content/demos.ts";
import { books } from "../content/index.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FONT = join(ROOT, "scripts/fonts/NotoNaskhArabic[wght].ttf");
const OUT = join(ROOT, "content/generated/traceGuides.ts");

/** Mask resolution: GRID × GRID cells over the 100 × 100 box. */
export const GRID = 50;
const BOX = 100;
/** Free space around the guide, in box units. */
const MARGIN = 12;
const ARABIC = /[؀-ۿ]/;

function loadFont() {
  const data = readFileSync(FONT);
  const bytes = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  const font = new hb.Font(new hb.Face(new hb.Blob(bytes)));
  font.setVariations([new hb.Variation("wght", 700)]);
  return font;
}

/** Splits an SVG path from HarfBuzz (M, L, Q, C, Z with absolute coordinates) into commands. */
function parsePath(d) {
  const commands = [];
  const re = /([MLQCZ])([^MLQCZ]*)/g;
  for (const [, cmd, args] of d.matchAll(re)) {
    const nums = args.trim()
      ? args
          .trim()
          .split(/[\s,]+/)
          .map(Number)
      : [];
    commands.push({ cmd, nums });
  }
  return commands;
}

/** Shaped glyphs of `text` as path commands in font units, y up, laid out left to right. */
function shapeText(font, text) {
  const buffer = new hb.Buffer();
  buffer.addText(text);
  buffer.guessSegmentProperties();
  hb.shape(font, buffer);
  const infos = buffer.getGlyphInfos();
  const positions = buffer.getGlyphPositions();
  const out = [];
  let x = 0;
  infos.forEach((info, i) => {
    const p = positions[i];
    const dx = x + p.xOffset;
    const dy = p.yOffset;
    for (const { cmd, nums } of parsePath(font.glyphToPath(info.codepoint))) {
      const moved = nums.map((n, k) => (k % 2 === 0 ? n + dx : n + dy));
      out.push({ cmd, nums: moved });
    }
    x += p.xAdvance;
  });
  return out;
}

/** Curves flattened to closed polygons (for the bounding box and the mask). */
function flatten(commands) {
  const polygons = [];
  let poly = [];
  let cx = 0;
  let cy = 0;
  for (const { cmd, nums } of commands) {
    if (cmd === "M") {
      if (poly.length) polygons.push(poly);
      poly = [[nums[0], nums[1]]];
      [cx, cy] = nums;
    } else if (cmd === "L") {
      poly.push([nums[0], nums[1]]);
      [cx, cy] = nums;
    } else if (cmd === "Q") {
      const [x1, y1, x, y] = nums;
      for (let t = 0.125; t <= 1; t += 0.125) {
        const a = (1 - t) * (1 - t);
        const b = 2 * (1 - t) * t;
        const c = t * t;
        poly.push([a * cx + b * x1 + c * x, a * cy + b * y1 + c * y]);
      }
      [cx, cy] = [x, y];
    } else if (cmd === "C") {
      const [x1, y1, x2, y2, x, y] = nums;
      for (let t = 0.125; t <= 1; t += 0.125) {
        const u = 1 - t;
        poly.push([
          u * u * u * cx + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x,
          u * u * u * cy + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y,
        ]);
      }
      [cx, cy] = [x, y];
    } else if (cmd === "Z") {
      if (poly.length) polygons.push(poly);
      poly = [];
    }
  }
  if (poly.length) polygons.push(poly);
  return polygons;
}

/** Nonzero winding number of point (x, y) against all polygons. */
function inside(polygons, x, y) {
  let winding = 0;
  for (const poly of polygons) {
    for (let i = 0; i < poly.length; i++) {
      const [x0, y0] = poly[i];
      const [x1, y1] = poly[(i + 1) % poly.length];
      if (y0 <= y) {
        if (y1 > y && (x1 - x0) * (y - y0) - (x - x0) * (y1 - y0) > 0) winding++;
      } else if (y1 <= y && (x1 - x0) * (y - y0) - (x - x0) * (y1 - y0) < 0) winding--;
    }
  }
  return winding !== 0;
}

const round = (n) => Math.round(n * 10) / 10;

/** Shaped outline of `text` with its bounding box and the scale that fits it in the box. */
function measure(font, text) {
  const shaped = shapeText(font, text);
  const raw = flatten(shaped);
  const xs = raw.flat().map(([x]) => x);
  const ys = raw.flat().map(([, y]) => y);
  const [minX, maxX, minY, maxY] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ];
  const fit = Math.min((BOX - 2 * MARGIN) / (maxX - minX), (BOX - 2 * MARGIN) / (maxY - minY));
  return { shaped, raw, minX, maxX, minY, maxY, fit };
}

/** Letters only, without vowel marks and tatweel. */
const letterCount = (text) => text.replace(/[ً-ْـ\s]/g, "").length;

/**
 * Every guide is drawn at one common size (`letterScale`, the size at which the tallest single
 * letter fits), as letters stand in the book: ل stays tall and ر stays small. Only words too
 * wide for the box shrink below it.
 */
function buildGuide(font, text, letterScale) {
  const { shaped, raw, minX, maxX, minY, maxY, fit } = measure(font, text);
  const scale = Math.min(fit, letterScale);
  const offX = (BOX - (maxX - minX) * scale) / 2;
  const offY = (BOX - (maxY - minY) * scale) / 2;
  // Font units (y up) to box units (y down), centred.
  const tx = (x) => offX + (x - minX) * scale;
  const ty = (y) => offY + (maxY - y) * scale;
  const d = shaped
    .map(({ cmd, nums }) => {
      const pts = [];
      for (let k = 0; k < nums.length; k += 2) pts.push(round(tx(nums[k])), round(ty(nums[k + 1])));
      return cmd + pts.join(" ");
    })
    .join("");
  const polygons = raw.map((poly) => poly.map(([x, y]) => [tx(x), ty(y)]));
  const cell = BOX / GRID;
  const bits = new Uint8Array(Math.ceil((GRID * GRID) / 8));
  let filled = 0;
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (!inside(polygons, (col + 0.5) * cell, (row + 0.5) * cell)) continue;
      const i = row * GRID + col;
      bits[i >> 3] |= 1 << (i & 7);
      filled++;
    }
  }
  if (filled === 0) throw new Error(`Empty mask for "${text}"`);
  return { d, mask: Buffer.from(bits).toString("base64") };
}

/** Thickness of a drawn line, in box units: about the stroke of a letter. */
const LINE_WIDTH = 9;
const circlePoints = (cx, cy, r, n = 64) =>
  Array.from({ length: n }, (_, k) => {
    // From the top, anticlockwise on screen, as a circle is begun in Arabic handwriting.
    const a = -Math.PI / 2 - (2 * Math.PI * k) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
const wavePoints = (x0, x1, cy, amplitude, waves, n = 64) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const t = k / n;
    return [x0 + (x1 - x0) * t, cy - amplitude * Math.sin(2 * Math.PI * waves * t)];
  });

/**
 * The line drawings of unit 1 and of the line tracing example (content/demos.ts): centre lines
 * in the box, in the direction the child is asked to draw (Arabic runs from the right), and
 * whether the line closes on itself.
 */
const LINE_SHAPES = {
  ـــ: {
    points: [
      [78, 50],
      [22, 50],
    ],
  },
  "—": {
    points: [
      [78, 50],
      [22, 50],
    ],
  },
  "|": {
    points: [
      [50, 18],
      [50, 82],
    ],
  },
  "/": {
    points: [
      [68, 18],
      [32, 82],
    ],
  },
  "◯": { points: circlePoints(50, 50, 30), closed: true },
  "〰": { points: wavePoints(80, 20, 50, 11, 2) },
};

/** Distance from (x, y) to the segment a–b. */
function toSegment(x, y, [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(x - ax - t * dx, y - ay - t * dy);
}

/** A thick line along `points`: its outline (with round ends) and the cells it covers. */
function buildLine({ points, closed = false }) {
  const half = LINE_WIDTH / 2;
  const segments = points.map((p, k) => [p, points[k + 1] ?? (closed ? points[0] : null)]);
  const open = segments.filter(([, b]) => b);
  /** The centre line pushed sideways by `side` × half the width (normals averaged at the joints). */
  const offset = (side) =>
    points.map((p, k) => {
      const prev = points[k - 1] ?? (closed ? points.at(-1) : null);
      const next = points[k + 1] ?? (closed ? points[0] : null);
      const normal = ([ax, ay], [bx, by]) => {
        const len = Math.hypot(bx - ax, by - ay);
        return [-(by - ay) / len, (bx - ax) / len];
      };
      const ns = [prev && normal(prev, p), next && normal(p, next)].filter(Boolean);
      const nx = ns.reduce((s, n) => s + n[0], 0) / ns.length;
      const ny = ns.reduce((s, n) => s + n[1], 0) / ns.length;
      const len = Math.hypot(nx, ny);
      return [p[0] + (side * half * nx) / len, p[1] + (side * half * ny) / len];
    });
  const path = (pts) => "M" + pts.map(([x, y]) => `${round(x)} ${round(y)}`).join("L") + "Z";
  let d;
  if (closed) {
    // A ring: the outer edge, then the inner edge the other way round (nonzero fill).
    d = path(offset(1)) + path(offset(-1).reverse());
  } else {
    // Along one side, round the end, back along the other side, round the start.
    const cap = (p, from) =>
      Array.from({ length: 9 }, (_, k) => {
        const a = from + (Math.PI * (k + 1)) / 10;
        return [p[0] + half * Math.cos(a), p[1] + half * Math.sin(a)];
      });
    const left = offset(1);
    const right = offset(-1);
    const angle = ([ax, ay], [bx, by]) => Math.atan2(by - ay, bx - ax);
    const end = points.at(-1);
    const start = points[0];
    d = path([
      ...left,
      ...cap(end, angle(points.at(-2), end) + Math.PI / 2),
      ...right.reverse(),
      ...cap(start, angle(points[1], start) + Math.PI / 2),
    ]);
  }
  const cell = BOX / GRID;
  const bits = new Uint8Array(Math.ceil((GRID * GRID) / 8));
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const x = (col + 0.5) * cell;
      const y = (row + 0.5) * cell;
      if (!open.some(([a, b]) => toSegment(x, y, a, b) <= half)) continue;
      const i = row * GRID + col;
      bits[i >> 3] |= 1 << (i & 7);
    }
  }
  return { d, mask: Buffer.from(bits).toString("base64") };
}

const guides = new Set();
const lines = new Set();
const collect = (guide) => {
  if (guide in LINE_SHAPES) lines.add(guide);
  else if (ARABIC.test(guide)) guides.add(guide);
};
for (const book of books)
  for (const unit of book.units)
    for (const lesson of unit.lessons)
      if (lesson.type === "trace") for (const target of lesson.targets) collect(target.guide);
// The worked examples trace a letter and a line of their own (content/demos.ts).
for (const target of [...DEMOS.trace.lesson.targets, ...DEMOS.trace_lines.lesson.targets])
  collect(target.guide);

/**
 * Arabic-Indic digits (٠ to ٩). At letter size they would be about a third of the box, too
 * small to trace in one stroke, so a guide made only of digits fills the box on its own,
 * with the same free margin as the tallest letter.
 */
const DIGITS = /^[\u0660-\u0669]+$/;

const font = loadFont();
const letterScale = Math.min(
  ...[...guides]
    .filter((text) => !DIGITS.test(text) && letterCount(text) === 1)
    .map((text) => measure(font, text).fit),
);
const entries = [
  ...[...guides].map((text) => [
    text,
    buildGuide(font, text, DIGITS.test(text) ? Infinity : letterScale),
  ]),
  ...[...lines].map((text) => [text, buildLine(LINE_SHAPES[text])]),
].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
const body = entries
  .map(
    ([text, { d, mask }]) =>
      `  ${JSON.stringify(text)}: {\n    d: ${JSON.stringify(d)},\n    mask: ${JSON.stringify(mask)},\n  },`,
  )
  .join("\n");

const source = `// Generated by scripts/build-trace-guides.mjs. Do not edit by hand.
// Letter outlines from Noto Naskh Arabic Bold (SIL Open Font License 1.1, scripts/fonts/OFL.txt),
// shaped with HarfBuzz; the line drawings of unit 1 drawn from their centre lines.
// \`d\` is an SVG path in a 100 × 100 box; \`mask\` marks the cells of a
// ${GRID} × ${GRID} grid over the same box that lie on the letters (base64, row-major bits).

export const TRACE_GRID = ${GRID};

export type TraceGuideShape = { d: string; mask: string };

export const traceGuides: Record<string, TraceGuideShape> = {
${body}
};
`;

if (process.argv.includes("--check")) {
  const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  if (current !== source) {
    console.error("content/generated/traceGuides.ts is out of date: run npm run guides");
    process.exit(1);
  }
  console.log(`${entries.length} trace guides are up to date`);
} else {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, source);
  console.log(`Wrote ${entries.length} trace guides to ${OUT}`);
}
