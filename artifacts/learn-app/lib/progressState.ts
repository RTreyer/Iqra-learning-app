/**
 * Pure progress state logic (storage schema v2). No React and no storage IO,
 * so every rule here is unit tested directly.
 */

import { todayKey } from "@/lib/dates";

export type LessonProgress = {
  completed: boolean;
  stars: number;
  /** ISO timestamp of the first completion, or of the latest star improvement. */
  completedAt: string;
};

/** Per item review record. Filled by the Leitner scheduler (Task 5.3), empty until then. */
export type ProgressItem = {
  box: 1 | 2 | 3 | 4 | 5;
  dueAt: string;
  lastSeenAt: string;
  lapses: number;
};

export type ProgressState = {
  version: 2;
  lessons: Record<string, LessonProgress>;
  items: Record<string, ProgressItem>;
  /** Local YYYY-MM-DD days with at least one lesson or review, oldest first. */
  activity: { days: string[] };
  totalStars: number;
};

export type UnitProgress = { done: number; total: number; stars: number };

export const MAX_ACTIVITY_DAYS = 60;

export function createEmptyState(): ProgressState {
  return { version: 2, lessons: {}, items: {}, activity: { days: [] }, totalStars: 0 };
}

function sumStars(lessons: Record<string, LessonProgress>): number {
  return Object.values(lessons).reduce((sum, l) => sum + l.stars, 0);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeDays(days: string[]): string[] {
  return Array.from(new Set(days)).sort().slice(-MAX_ACTIVITY_DAYS);
}

/**
 * Turns whatever was stored (nothing, v1 `{ lessons, totalStars }`, or v2)
 * into a valid v2 state. v1 lessons get `completedAt = now`. totalStars is
 * always recomputed from lessons so it can never drift.
 */
export function upgradeState(raw: unknown, now: Date = new Date()): ProgressState {
  if (!isObject(raw)) return createEmptyState();
  const nowIso = now.toISOString();

  const lessons: Record<string, LessonProgress> = {};
  if (isObject(raw.lessons)) {
    for (const [id, entry] of Object.entries(raw.lessons)) {
      if (!isObject(entry)) continue;
      lessons[id] = {
        completed: entry.completed === true,
        stars: typeof entry.stars === "number" ? entry.stars : 0,
        completedAt: typeof entry.completedAt === "string" ? entry.completedAt : nowIso,
      };
    }
  }

  const items = isObject(raw.items) ? (raw.items as Record<string, ProgressItem>) : {};
  const rawDays = isObject(raw.activity) && Array.isArray(raw.activity.days) ? raw.activity.days : [];
  const days = normalizeDays(rawDays.filter((d): d is string => typeof d === "string"));

  return { version: 2, lessons, items, activity: { days }, totalStars: sumStars(lessons) };
}

/** True when the stored blob is not already v2 and must be written back. */
export function needsUpgrade(raw: unknown): boolean {
  return !isObject(raw) || raw.version !== 2;
}

/**
 * Records a lesson completion. Stars keep the best result (replay allowed).
 * completedAt is set on the first completion and only moves forward when the
 * stars improve, so it marks when the current best result was earned.
 * Today's local date is added to activity.days.
 */
export function applyCompletion(
  state: ProgressState,
  lessonId: string,
  stars: number,
  now: Date = new Date(),
): ProgressState {
  const existing = state.lessons[lessonId];
  const improved = !existing || stars > existing.stars;
  const lesson: LessonProgress = improved
    ? { completed: true, stars: Math.max(existing?.stars ?? 0, stars), completedAt: now.toISOString() }
    : { ...existing, completed: true };
  const lessons = { ...state.lessons, [lessonId]: lesson };
  return {
    ...state,
    lessons,
    activity: { days: normalizeDays([...state.activity.days, todayKey(now)]) },
    totalStars: sumStars(lessons),
  };
}

/**
 * Combines the stored state with changes made before it finished loading.
 * Per lesson the higher stars win (stored wins ties), days are unioned and
 * local items override stored ones.
 */
export function mergeProgress(stored: ProgressState, local: ProgressState): ProgressState {
  const lessons = { ...stored.lessons };
  for (const [id, entry] of Object.entries(local.lessons)) {
    if (entry.stars > (lessons[id]?.stars ?? -1)) lessons[id] = entry;
  }
  return {
    version: 2,
    lessons,
    items: { ...stored.items, ...local.items },
    activity: { days: normalizeDays([...stored.activity.days, ...local.activity.days]) },
    totalStars: sumStars(lessons),
  };
}

/** Completed count and star sum over the given lesson ids. */
export function unitProgress(state: ProgressState, lessonIds: string[]): UnitProgress {
  let done = 0;
  let stars = 0;
  for (const id of lessonIds) {
    const lesson = state.lessons[id];
    if (lesson?.completed) done += 1;
    stars += lesson?.stars ?? 0;
  }
  return { done, total: lessonIds.length, stars };
}
