import type { Lesson, LessonType } from "@/content/types";
import type { Score } from "@/lib/scoring";

/**
 * Callbacks need not be stable: activities keep the latest `onComplete` / `onRoundResult`
 * in a ref, so a parent re-render between a tap and a delayed advance is safe.
 */
export type ActivityProps<T extends LessonType> = {
  lesson: Extract<Lesson, { type: T }>;
  color: string;
  /** From useLessonAttempt; changes on every restart and resets the activity. */
  attemptKey: string;
  /** Non quiz activities send { correct: 0, total: 0 }. */
  onComplete: (score: Score) => void;
  /** Quiz activities only, fired once per round on the first tap. */
  onRoundResult?: (itemId: string, correct: boolean) => void;
};
