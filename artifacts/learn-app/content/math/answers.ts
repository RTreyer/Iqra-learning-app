import type { CompareSide } from "../types.ts";

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
