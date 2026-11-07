import { TRACE_GRID, traceGuides } from "@/content/generated/traceGuides";
import { guidePath } from "@/components/activities/trace/guidePath";
import {
  decodeMask,
  validateOnGuide,
  validateTracing,
} from "@/components/activities/trace/validate";

const PAD = 300;

test.each(["ه", "ح", "م"])("the demo stroke along %s passes the real tracing check", (guide) => {
  const path = guidePath(decodeMask(traceGuides[guide].mask, TRACE_GRID), PAD);
  const pad = { width: PAD, height: PAD };
  expect(path.length).toBeGreaterThan(10);
  expect(validateTracing([path], pad, 1)).toEqual({ valid: true });
  expect(validateOnGuide([path], pad, decodeMask(traceGuides[guide].mask, TRACE_GRID))).toEqual({
    valid: true,
  });
});

test("the stroke starts at the letter's top end", () => {
  const path = guidePath(decodeMask(traceGuides["ح"].mask, TRACE_GRID), PAD);
  const cell = PAD / TRACE_GRID;
  expect(path[0].y - Math.min(...path.map((p) => p.y))).toBeLessThanOrEqual(2 * cell);
});
