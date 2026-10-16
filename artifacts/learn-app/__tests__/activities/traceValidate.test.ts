import { parsePoints, strokeToPath, validateTracing, type Stroke } from "@/components/activities/trace/validate";

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

describe("path helpers", () => {
  it("round trips a stroke through SVG path data", () => {
    const stroke = [{ x: 1, y: 2 }, { x: 3.5, y: 4 }, { x: 10, y: 20 }];
    expect(strokeToPath(stroke)).toBe("M 1.0 2.0 L 3.5 4.0 L 10.0 20.0");
    expect(parsePoints(strokeToPath(stroke))).toEqual(stroke);
  });

  it("parsePoints ignores malformed tokens", () => {
    expect(parsePoints("M 1 x L 2 3")).toEqual([{ x: 2, y: 3 }]);
  });
});
