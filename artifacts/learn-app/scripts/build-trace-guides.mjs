// Builds content/generated/traceGuides.ts: for every Arabic trace guide in the catalog, the
// outline the child traces over (an SVG path in a 100 × 100 box) and a coarse mask of where
// the letters are, used to check that the child wrote on the letter (trace/validate.ts).
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

const guides = new Set();
for (const book of books)
  for (const unit of book.units)
    for (const lesson of unit.lessons)
      if (lesson.type === "trace")
        for (const target of lesson.targets)
          if (ARABIC.test(target.guide)) guides.add(target.guide);

const font = loadFont();
const letterScale = Math.min(
  ...[...guides].filter((text) => letterCount(text) === 1).map((text) => measure(font, text).fit),
);
const entries = [...guides].sort().map((text) => [text, buildGuide(font, text, letterScale)]);
const body = entries
  .map(
    ([text, { d, mask }]) =>
      `  ${JSON.stringify(text)}: {\n    d: ${JSON.stringify(d)},\n    mask: ${JSON.stringify(mask)},\n  },`,
  )
  .join("\n");

const source = `// Generated by scripts/build-trace-guides.mjs — do not edit by hand.
// Outlines from Noto Naskh Arabic Bold (SIL Open Font License 1.1, scripts/fonts/OFL.txt),
// shaped with HarfBuzz. \`d\` is an SVG path in a 100 × 100 box; \`mask\` marks the cells of a
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
