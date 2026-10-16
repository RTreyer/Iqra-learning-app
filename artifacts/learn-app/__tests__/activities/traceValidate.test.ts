import { MAX_STROKE_POINTS, addPoint, startStroke } from "@/components/activities/trace/path";
import { validateTracing, type Stroke } from "@/components/activities/trace/validate";

const PAD = { width: 300, height: 300 };

/** n + 1 evenly spaced points from (x1, y1) to (x2, y2). */
function line(x1: number, y1: number, x2: number, y2: number, n = 20): Stroke {
  return Array.from({ length: n + 1 }, (_, i) => ({ x: x1 + ((x2 - x1) * i) / n, y: y1 + ((y2 - y1) * i) / n }));
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
    const scribble: Stroke = Array.from({ length: 60 }, (_, i) => ({ x: 150 + (i % 2) * 20, y: 150 + (i % 3) * 5 }));
    expect(validateTracing([scribble], PAD)).toEqual({ valid: false, msg: "اِرسم الحرف بشكل أكبر 📏" });
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
    expect(validateTracing(one, PAD, 2)).toEqual({ valid: false, msg: "اِرسم 2 خطوط على الأقل ✏️" });
    expect(validateTracing([...one, line(270, 30, 30, 270)], PAD, 2)).toEqual({ valid: true });
  });

  it("asks for one stroke when nothing was drawn", () => {
    expect(validateTracing([], PAD)).toEqual({ valid: false, msg: "اِرسم خطاً واحداً على الأقل ✏️" });
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
    expect(validateTracing([onlyBad], PAD)).toEqual({ valid: false, msg: "اِرسم خطاً واحداً على الأقل ✏️" });
  });
});

describe("stroke path building", () => {
  it("keeps points and path data in sync", () => {
    const s = startStroke({ x: 1, y: 2 });
    expect(addPoint(s, { x: 10, y: 20 })).toBe(true);
    expect(s.points).toEqual([{ x: 1, y: 2 }, { x: 10, y: 20 }]);
    expect(s.d).toBe("M 1.0 2.0 L 10.0 20.0");
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
