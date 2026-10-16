/** Score based star awarding shared by every lesson screen. */

export type Score = { correct: number; total: number };

/** 100% gives 3 stars, at least 60% gives 2, anything else 1. An empty score counts as perfect. */
export function starsForScore({ correct, total }: Score): 1 | 2 | 3 {
  if (total === 0) return 3;
  const ratio = correct / total;
  if (ratio >= 1) return 3;
  if (ratio >= 0.6) return 2;
  return 1;
}
