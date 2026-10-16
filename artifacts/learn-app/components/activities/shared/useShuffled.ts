import { useMemo } from "react";
import { seedFor, shuffleWithSeed, type Shuffled } from "./shuffle";

/** Options of one round shuffled per attempt, so the correct answer moves without touching content. */
export function useShuffled<T>(
  items: readonly T[],
  correctIndex: number,
  attemptKey: string,
  roundIndex: number | string,
): Shuffled<T> {
  return useMemo(
    () => shuffleWithSeed(items, correctIndex, seedFor(attemptKey, roundIndex)),
    [items, correctIndex, attemptKey, roundIndex],
  );
}
