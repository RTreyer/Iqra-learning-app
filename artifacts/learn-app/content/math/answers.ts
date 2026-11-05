import type { CompareSide, FillCell } from "../types.ts";

export type CompareAnswer = "more" | "less" | "equal";

export function sideValue(side: CompareSide): number {
  return "number" in side ? side.number : side.pics.length;
}

/** How `first` relates to `second`; derived, never stored in content. */
export function compareAnswer(first: CompareSide, second: CompareSide): CompareAnswer {
  const a = sideValue(first);
  const b = sideValue(second);
  return a > b ? "more" : a < b ? "less" : "equal";
}

/** The number hidden behind "?", or null when the sentence cannot be solved. */
export function numberFillAnswer(cells: FillCell[]): number | null {
  if (cells.filter((c) => c === "?").length !== 1) return null;
  if (cells.includes("=")) {
    const [a, op, b, eq, c] = cells;
    if (cells.length !== 5 || (op !== "+" && op !== "-") || eq !== "=") return null;
    const sign = op === "+" ? 1 : -1;
    if (c === "?" && typeof a === "number" && typeof b === "number") return a + sign * b;
    if (b === "?" && typeof a === "number" && typeof c === "number") return sign * (c - a);
    if (a === "?" && typeof b === "number" && typeof c === "number") return c - sign * b;
    return null;
  }
  if (cells.some((c) => c !== "?" && typeof c !== "number")) return null;
  const at = cells.indexOf("?");
  const known = cells
    .map((c, i) => [i, c] as const)
    .filter((p): p is readonly [number, number] => typeof p[1] === "number");
  if (known.length < 2) return null;
  const [[i0, v0], [i1, v1]] = known;
  const step = (v1 - v0) / (i1 - i0);
  if (!Number.isInteger(step) || step === 0) return null;
  if (known.some(([i, v]) => v !== v0 + step * (i - i0))) return null;
  return v0 + step * (at - i0);
}
