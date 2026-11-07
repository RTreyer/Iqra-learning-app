import { todayKey } from "@/lib/dates";
import type { ProgressState } from "@/lib/progressState";

/** Lessons a day that light up the whole qamariya window on the home screen. */
export const DAILY_GOAL = 3;

/**
 * Lessons finished or improved today (local day), from each lesson's completedAt. A replay that
 * does not beat the best stars leaves completedAt alone, so it does not count again.
 * Nothing is lost on a day without lessons: the window simply starts empty.
 */
export function lessonsToday(progress: ProgressState, now: Date = new Date()): number {
  const today = todayKey(now);
  let count = 0;
  for (const lesson of Object.values(progress.lessons)) {
    if (!lesson.completed) continue;
    const at = new Date(lesson.completedAt);
    if (!Number.isNaN(at.getTime()) && todayKey(at) === today) count += 1;
  }
  return count;
}
