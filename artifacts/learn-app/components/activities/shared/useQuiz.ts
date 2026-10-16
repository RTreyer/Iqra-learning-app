import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import type { Lesson } from "@/content/types";
import * as haptics from "@/lib/haptics";
import { itemIdFor } from "@/lib/reviewItems";
import type { Score } from "@/lib/scoring";
import type { ChoiceState } from "./ChoiceCard";

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
};

/**
 * Round state shared by every quiz activity: only the first tap of a round counts,
 * the round locks after it, and `onRoundResult` fires exactly once per round.
 */
export function useQuiz({ lesson, total, onComplete, onRoundResult, autoAdvanceMs }: Options) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const locked = useRef(false);
  const finished = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const advance = useCallback(
    (count: number) => {
      if (roundIndex + 1 >= total) {
        if (finished.current) return;
        finished.current = true;
        onComplete({ correct: count, total });
        return;
      }
      locked.current = false;
      setPicked(null);
      setRoundIndex(roundIndex + 1);
    },
    [roundIndex, total, onComplete],
  );

  /** Registers the first tap of the round; returns false when the round is already locked. */
  const pick = useCallback(
    (displayIndex: number, isCorrect: boolean) => {
      if (locked.current) return false;
      locked.current = true;
      const count = correctCount + (isCorrect ? 1 : 0);
      setPicked(displayIndex);
      setCorrectCount(count);
      const itemId = itemIdFor(lesson, roundIndex);
      if (itemId !== null) onRoundResult?.(itemId, isCorrect);
      if (isCorrect) haptics.success();
      else haptics.error();
      if (autoAdvanceMs !== undefined) timer.current = setTimeout(() => advance(count), autoAdvanceMs);
      return true;
    },
    [correctCount, lesson, roundIndex, onRoundResult, autoAdvanceMs, advance],
  );

  const next = useCallback(() => {
    if (picked !== null) advance(correctCount);
  }, [picked, correctCount, advance]);

  return { roundIndex, picked, locked: picked !== null, correctCount, isLast: roundIndex + 1 >= total, pick, next };
}

/** Visual state of option `index` given the tapped option and the correct one. */
export function choiceState(index: number, picked: number | null, correctIndex: number): ChoiceState {
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
