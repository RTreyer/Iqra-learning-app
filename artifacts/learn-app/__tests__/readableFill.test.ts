import { readableFill, whiteContrast } from "@/theme/tokens";

function hue(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

test("amber darkens until white text reads at 4.5:1 and stays orange", () => {
  const fill = readableFill("#D97706");
  expect(whiteContrast("#D97706")).toBeLessThan(4.5);
  expect(whiteContrast(fill)).toBeGreaterThanOrEqual(4.5);
  expect(Math.abs(hue(fill) - hue("#D97706"))).toBeLessThanOrEqual(10);
});

test("a colour that already passes is returned unchanged", () => {
  expect(readableFill("#2563EB")).toBe("#2563EB");
});

test("a higher minimum darkens further and results are stable per input", () => {
  expect(whiteContrast(readableFill("#2563EB", 7))).toBeGreaterThanOrEqual(7);
  expect(readableFill("#D97706")).toBe(readableFill("#D97706"));
});
