import { MAX_STROKE_POINTS, addPoint, startStroke } from "@/components/activities/trace/path";
import {
  ON_LETTER,
  decodeMask,
  validateOnGuide,
  validateTracing,
  type Stroke,
} from "@/components/activities/trace/validate";
import { TRACE_GRID, traceGuides } from "@/content/generated/traceGuides";
import { strokesOnGuide } from "@/test-utils/trace";

const PAD = { width: 300, height: 300 };

/** n + 1 evenly spaced points from (x1, y1) to (x2, y2). */
function line(x1: number, y1: number, x2: number, y2: number, n = 20): Stroke {
  return Array.from({ length: n + 1 }, (_, i) => ({
    x: x1 + ((x2 - x1) * i) / n,
    y: y1 + ((y2 - y1) * i) / n,
  }));
}

describe("validateTracing", () => {
  it("passes a diagonal across the pad", () => {
    expect(validateTracing([line(30, 30, 270, 270)], PAD)).toEqual({ valid: true });
  });

  it("fails a 5 px stroke", () => {
    const result = validateTracing([line(150, 150, 155, 150)], PAD);
    expect(result).toEqual({ valid: false, msg: "اِرسم الحرف بشكل أكبر 📏" });
  });

  it("fails with too few points even when long", () => {
    expect(validateTracing([line(30, 30, 270, 270, 5)], PAD).valid).toBe(false);
  });

  it("fails a long stroke with a tiny bounding box (scribble in place)", () => {
    const scribble: Stroke = Array.from({ length: 60 }, (_, i) => ({
      x: 150 + (i % 2) * 20,
      y: 150 + (i % 3) * 5,
    }));
    expect(validateTracing([scribble], PAD)).toEqual({
      valid: false,
      msg: "اِرسم الحرف بشكل أكبر 📏",
    });
  });

  it("fails an off centre stroke", () => {
    const result = validateTracing([line(0, 5, 160, 5)], PAD);
    expect(result).toEqual({ valid: false, msg: "اِرسم الحرف في وسط المساحة 🎯" });
  });

  it("accepts a long horizontal line through the middle (bbox height can be zero)", () => {
    expect(validateTracing([line(40, 150, 260, 150)], PAD).valid).toBe(true);
  });

  it("respects strokeCount", () => {
    const one = [line(30, 30, 270, 270)];
    expect(validateTracing(one, PAD, 2)).toEqual({
      valid: false,
      msg: "اِرسم 2 خطوط على الأقل ✏️",
    });
    expect(validateTracing([...one, line(270, 30, 30, 270)], PAD, 2)).toEqual({ valid: true });
  });

  it("asks for one stroke when nothing was drawn", () => {
    expect(validateTracing([], PAD)).toEqual({
      valid: false,
      msg: "اِرسم خطاً واحداً على الأقل ✏️",
    });
  });

  it("uses the shorter pad side for the length rule", () => {
    const wide = { width: 600, height: 200 };
    // 130 px is above 50 % of 200 but would fail against 50 % of 600.
    expect(validateTracing([line(235, 100, 365, 100)], wide).valid).toBe(true);
  });
});

describe("invalid input", () => {
  it("rejects an unmeasured or collapsed pad", () => {
    const diagonal = [line(30, 30, 270, 270)];
    expect(validateTracing(diagonal, { width: 0, height: 300 }).valid).toBe(false);
    expect(validateTracing(diagonal, { width: 300, height: NaN }).valid).toBe(false);
    expect(validateTracing(diagonal, { width: -1, height: -1 }).valid).toBe(false);
  });

  it("drops non finite points", () => {
    const poisoned = [...line(30, 30, 270, 270), { x: NaN, y: 10 }, { x: Infinity, y: 0 }];
    expect(validateTracing([poisoned], PAD)).toEqual({ valid: true });
    const onlyBad: Stroke = [{ x: NaN, y: NaN }];
    expect(validateTracing([onlyBad], PAD)).toEqual({
      valid: false,
      msg: "اِرسم خطاً واحداً على الأقل ✏️",
    });
  });
});

describe("stroke path building", () => {
  it("keeps points and path data in sync", () => {
    const s = startStroke({ x: 1, y: 2 });
    expect(addPoint(s, { x: 10, y: 20 })).toBe(true);
    expect(s.points).toEqual([
      { x: 1, y: 2 },
      { x: 10, y: 20 },
    ]);
    expect(s.d).toBe("M 1.0 2.0 L 1.0 2.0 L 10.0 20.0");
  });

  it("draws a single point stroke as a dot", () => {
    const s = startStroke({ x: 5, y: 6 });
    expect(s.points).toEqual([{ x: 5, y: 6 }]);
    expect(s.d).toBe("M 5.0 6.0 L 5.0 6.0");
  });

  it("skips points closer than 2 px and non finite points", () => {
    const s = startStroke({ x: 0, y: 0 });
    expect(addPoint(s, { x: 1, y: 1 })).toBe(false);
    expect(addPoint(s, { x: NaN, y: 5 })).toBe(false);
    expect(addPoint(s, { x: 2, y: 0 })).toBe(true);
    expect(s.points).toHaveLength(2);
  });

  it("caps a stroke at the maximum point count", () => {
    const s = startStroke({ x: 0, y: 0 });
    for (let i = 1; i < MAX_STROKE_POINTS + 50; i++) addPoint(s, { x: i * 3, y: 0 });
    expect(s.points).toHaveLength(MAX_STROKE_POINTS);
  });
});

describe("validateOnGuide", () => {
  const shape = (guide: string) => decodeMask(traceGuides[guide].mask, TRACE_GRID);

  it("passes every guide traced along its outline", () => {
    const failing = Object.keys(traceGuides).filter(
      (guide) => !validateOnGuide(strokesOnGuide(guide), PAD, shape(guide)).valid,
    );
    expect(failing).toEqual([]);
  });

  it("passes a trace along the letter", () => {
    expect(validateOnGuide(strokesOnGuide("د"), PAD, shape("د"))).toEqual({ valid: true });
  });

  it("fails a line across the pad: it is not on the letter", () => {
    expect(validateOnGuide([line(30, 30, 270, 270)], PAD, shape("د"))).toEqual({
      valid: false,
      msg: "اُكتب فوق الحرف المرسوم ✏️",
    });
  });

  it("fails a different letter written on the guide", () => {
    expect(validateOnGuide(strokesOnGuide("ق"), PAD, shape("د")).valid).toBe(false);
    expect(validateOnGuide(strokesOnGuide("ب"), PAD, shape("م")).valid).toBe(false);
  });

  it("fails when less than half of the letter is traced", () => {
    const strokes = strokesOnGuide("ل");
    const top = strokes.slice(0, Math.floor(strokes.length * 0.3));
    expect(validateOnGuide(top, PAD, shape("ل"))).toEqual({
      valid: false,
      msg: "أكمل كتابة الحرف كله 📏",
    });
  });

  it("speaks of the word for word guides", () => {
    expect(validateOnGuide([line(30, 30, 270, 270)], PAD, shape("بيت"), true)).toEqual({
      valid: false,
      msg: "اُكتب فوق الكلمة المرسومة ✏️",
    });
    expect(validateOnGuide(strokesOnGuide("بيت"), PAD, shape("بيت"), true).valid).toBe(true);
  });
});

describe("digit guides", () => {
  const shape = (guide: string) => decodeMask(traceGuides[guide].mask, TRACE_GRID);
  const passes = (guide: string, strokes: Stroke[]) => {
    expect(validateTracing(strokes, PAD)).toEqual({ valid: true });
    expect(validateOnGuide(strokes, PAD, shape(guide))).toEqual({ valid: true });
  };

  it("passes ١ written as one stroke from top to bottom", () => {
    const { cells, grid } = shape("١");
    const cell = PAD.width / grid;
    const stroke: Stroke = [];
    for (let row = 0; row < grid; row++) {
      const cols = Array.from({ length: grid }, (_, c) => c).filter((c) => cells[row * grid + c]);
      if (cols.length) {
        const mid = (cols[0] + cols[cols.length - 1]) / 2;
        stroke.push({ x: (mid + 0.5) * cell, y: (row + 0.5) * cell });
      }
    }
    passes("١", [stroke]);
  });

  it("passes ٢ and ٦ traced along their outline", () => {
    for (const digit of ["٢", "٦"]) passes(digit, strokesOnGuide(digit));
  });

  it("fails ٣ with its last hook skipped, although half of it is covered", () => {
    const shape3 = shape("٣");
    const leftPart = strokesOnGuide("٣")
      .map((stroke) => stroke.filter((p) => p.x < 170))
      .filter((stroke) => stroke.length > 0);
    // Without the centre line check this drawing passes.
    expect(validateOnGuide(leftPart, PAD, { ...shape3, spine: [], branches: [] })).toEqual({
      valid: true,
    });
    expect(validateOnGuide(leftPart, PAD, shape3)).toEqual({
      valid: false,
      msg: "أكمل كتابة الحرف كله 📏",
    });
  });

  it("fails a stroke that runs off the letter, even when a heavy scribble on it outweighs it", () => {
    // Drawn on a phone (pad 800 px from (62, 468)): ٣ gone over several times, plus a stroke
    // beyond its last hook.
    const p = (x: number, y: number) => ({ x: ((x - 62) * 300) / 800, y: ((y - 468) * 300) / 800 });
    const path = (corners: [number, number][]): Stroke =>
      corners.slice(1).flatMap(([x, y], k) => {
        const [x0, y0] = corners[k];
        return Array.from({ length: 21 }, (_, i) =>
          p(x0 + ((x - x0) * i) / 20, y0 + ((y - y0) * i) / 20),
        );
      });
    const digit = [
      path([
        [305, 615],
        [335, 760],
        [395, 1000],
        [405, 1140],
      ]),
      path([
        [370, 745],
        [600, 772],
        [650, 760],
      ]),
      path([
        [510, 590],
        [540, 650],
        [548, 720],
      ]),
      path([
        [650, 595],
        [620, 700],
        [575, 760],
      ]),
    ];
    const scribble = [...digit, ...digit, ...digit];
    const extra = path([
      [650, 760],
      [700, 745],
      [730, 650],
      [760, 600],
    ]);
    const three = shape("٣");
    expect(validateOnGuide(scribble, PAD, three)).toEqual({ valid: true });
    const drawn = [...scribble, extra].flat();
    const onLetter = drawn.filter((q) => {
      const i =
        Math.floor((q.y / 300) * TRACE_GRID) * TRACE_GRID + Math.floor((q.x / 300) * TRACE_GRID);
      return three.near[i] === 1;
    }).length;
    // The share on the letter alone would let it pass.
    expect(onLetter / drawn.length).toBeGreaterThan(ON_LETTER);
    expect(validateOnGuide([...scribble, extra], PAD, three)).toEqual({
      valid: false,
      msg: "اُكتب فوق الحرف المرسوم ✏️",
    });
  });

  it("fails ٣ scribbled thick along the stem and bar with the hook left out", () => {
    // Drawn on a phone (pad 800 px from (62, 468)): it covered most of the digit but not the hook.
    const p = (x: number, y: number) => ({ x: ((x - 62) * 300) / 800, y: ((y - 468) * 300) / 800 });
    const band = (from: [number, number], to: [number, number], width: number): Stroke[] =>
      [-1, -0.5, 0, 0.5, 1].map((o) =>
        Array.from({ length: 31 }, (_, i) =>
          p(
            from[0] + o * width + ((to[0] - from[0]) * i) / 30,
            from[1] + ((to[1] - from[1]) * i) / 30,
          ),
        ),
      );
    const drawing = [
      ...band([335, 630], [395, 1000], 30),
      ...band([395, 1000], [415, 1135], 20),
      ...band([400, 725], [580, 740], 12),
      ...band([515, 585], [520, 760], 10),
    ];
    expect(validateOnGuide(drawing, PAD, shape("٣"))).toEqual({
      valid: false,
      msg: "أكمل كتابة الحرف كله 📏",
    });
  });
});
