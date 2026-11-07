import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";
import type { Lesson } from "@/content/types";
import * as haptics from "@/lib/haptics";
import { itemIdFor } from "@/lib/reviewItems";
import type { Score } from "@/lib/scoring";
import type { ChoiceState } from "./ChoiceCard";
import { useLatest } from "./useLatest";

/** Legacy LetterPick delay between the first tap and the next round. */
export const ADVANCE_MS = 900;
/** Legacy delay before a round prompt is spoken. */
export const PROMPT_DELAY_MS = 400;

type Options = {
  lesson: Lesson;
  total: number;
  onComplete: (score: Score) => void;
  onRoundResult?: (itemId: string, correct: boolean) => void;
  /** Advance automatically after this delay; omit to advance with `next()` (Next button). */
  autoAdvanceMs?: number;
  /**
   * After a wrong tap the child tries again until the answer is found (default). Off for
   * activities that report a whole round at once (the syllable train handles its own retries).
   */
  retry?: boolean;
};

/**
 * Round state shared by every quiz activity. Only the first tap of a round is scored and
 * `onRoundResult` fires exactly once per round, with that first tap. A wrong tap greys its
 * option out and the child tries again; the round locks once the answer is found.
 */
export function useQuiz({
  lesson,
  total,
  onComplete,
  onRoundResult,
  autoAdvanceMs,
  retry = true,
}: Options) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<readonly number[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const locked = useRef(false);
  /** Whether this round's scored first tap has happened. */
  const tried = useRef(false);
  const finished = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Timers call the latest callbacks, never a closure from the render that scheduled them.
  const callbacks = useLatest({ onComplete, onRoundResult });

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const advance = useCallback(
    (count: number) => {
      if (roundIndex + 1 >= total) {
        if (finished.current) return;
        finished.current = true;
        callbacks.current.onComplete({ correct: count, total });
        return;
      }
      locked.current = false;
      tried.current = false;
      setPicked(null);
      setWrong([]);
      setRoundIndex(roundIndex + 1);
    },
    [roundIndex, total, callbacks],
  );

  /**
   * Registers a tap; returns false when it is ignored (round locked, or an option already
   * tapped wrong). The first tap of a round is the scored one. A wrong tap leaves the round
   * open for another try (unless `retry` is off); a right tap locks it.
   */
  const pick = useCallback(
    (displayIndex: number, isCorrect: boolean) => {
      if (locked.current || wrong.includes(displayIndex)) return false;
      const first = !tried.current;
      tried.current = true;
      if (first) {
        const itemId = itemIdFor(lesson, roundIndex);
        if (itemId !== null) callbacks.current.onRoundResult?.(itemId, isCorrect);
      }
      if (!isCorrect && retry) {
        haptics.error();
        setWrong([...wrong, displayIndex]);
        return true;
      }
      locked.current = true;
      const count = correctCount + (isCorrect && first ? 1 : 0);
      setPicked(displayIndex);
      setCorrectCount(count);
      if (isCorrect) haptics.success();
      else haptics.error();
      if (autoAdvanceMs !== undefined)
        timer.current = setTimeout(() => advance(count), autoAdvanceMs);
      return true;
    },
    [correctCount, wrong, lesson, roundIndex, callbacks, autoAdvanceMs, advance, retry],
  );

  const next = useCallback(() => {
    if (picked !== null) advance(correctCount);
  }, [picked, correctCount, advance]);

  return useMemo(
    () => ({
      roundIndex,
      picked,
      /** Options tapped wrong in this round: greyed out and disabled. */
      wrong,
      locked: picked !== null,
      correctCount,
      isLast: roundIndex + 1 >= total,
      pick,
      next,
    }),
    [roundIndex, picked, wrong, correctCount, total, pick, next],
  );
}

/** Spoken after a wrong tap, before the task is repeated. */
export const TRY_AGAIN = "حَاوِلْ مَرَّةً أُخْرَى";

/**
 * Visual state of option `index`: options in `wrong` were tapped wrong and stay greyed out;
 * once the round is locked, the correct option shows as correct. The answer is never shown
 * before the child finds it, so a wrong tap does not give it away.
 */
export function choiceState(
  index: number,
  picked: number | null,
  correctIndex: number,
  wrong: readonly number[] = [],
): ChoiceState {
  if (wrong.includes(index)) return "wrong";
  if (picked === null) return "idle";
  if (index === correctIndex) return "correct";
  return index === picked ? "wrong" : "idle";
}

/** One Animated.Value per option slot, sized by the largest round. */
export function useBounce(size: number) {
  const [values] = useState(() => Array.from({ length: size }, () => new Animated.Value(1)));
  const bounce = useCallback(
    (index: number, to = 1.4) => {
      const value = values[index];
      if (!value) return;
      Animated.sequence([
        Animated.spring(value, { toValue: to, useNativeDriver: true, speed: 30 }),
        Animated.spring(value, { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]).start();
    },
    [values],
  );
  return { values, bounce };
}
