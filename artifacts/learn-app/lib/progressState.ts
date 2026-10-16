/**
 * Pure progress state logic (storage schema v2). No React and no storage IO,
 * so every rule here is unit tested directly.
 */

import { todayKey } from "@/lib/dates";
import { introduce, isDue, review } from "@/lib/srs";

export type LessonProgress = {
  completed: boolean;
  stars: number;
  /** ISO timestamp of the first completion, or of the latest star improvement. */
  completedAt: string;
};

/** Per item review record, maintained by the Leitner scheduler in lib/srs.ts. */
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

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

function normalizeDays(days: string[]): string[] {
  return Array.from(new Set(days.filter((d) => DAY_KEY.test(d))))
    .sort()
    .slice(-MAX_ACTIVITY_DAYS);
}

/** Stars are whole numbers 0..3. Anything that is not a finite number (numeric strings too) counts as 0. */
export function clampStars(stars: unknown): number {
  if (typeof stars !== "number" || !Number.isFinite(stars)) return 0;
  return Math.min(3, Math.max(0, Math.round(stars)));
}

function isProgressItem(value: unknown): value is ProgressItem {
  return (
    isObject(value) &&
    typeof value.box === "number" &&
    Number.isInteger(value.box) &&
    value.box >= 1 &&
    value.box <= 5 &&
    typeof value.dueAt === "string" &&
    typeof value.lastSeenAt === "string" &&
    typeof value.lapses === "number" &&
    Number.isFinite(value.lapses) &&
    value.lapses >= 0
  );
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
        stars: clampStars(entry.stars),
        completedAt: typeof entry.completedAt === "string" ? entry.completedAt : nowIso,
      };
    }
  }

  const items: Record<string, ProgressItem> = {};
  if (isObject(raw.items)) {
    for (const [id, item] of Object.entries(raw.items)) {
      if (isProgressItem(item)) items[id] = item;
    }
  }
  const rawDays =
    isObject(raw.activity) && Array.isArray(raw.activity.days) ? raw.activity.days : [];
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
  const earned = clampStars(stars);
  const existing = state.lessons[lessonId];
  const improved = !existing || earned > existing.stars;
  const lesson: LessonProgress = improved
    ? { completed: true, stars: earned, completedAt: now.toISOString() }
    : { ...existing, completed: true };
  const lessons = { ...state.lessons, [lessonId]: lesson };
  return { ...markActiveToday(state, now), lessons, totalStars: sumStars(lessons) };
}

/** Adds today's local date to activity.days once, keeping the list trimmed. */
function markActiveToday(state: ProgressState, now: Date): ProgressState {
  return { ...state, activity: { days: normalizeDays([...state.activity.days, todayKey(now)]) } };
}

/**
 * Records one answered round inside a lesson. An unknown item is introduced
 * (box 1, due tomorrow, no lapse) whether the answer was right or wrong, so
 * new material enters the schedule without counting a first try as a lapse.
 * For a known item a wrong answer always resets it to box 1 with a lapse
 * (error driven repetition), but a correct answer promotes only when the
 * item is due; otherwise only lastSeenAt moves. Lessons repeat items across
 * rounds, and one sitting must not climb several boxes.
 */
export function applyRoundResult(
  state: ProgressState,
  itemId: string,
  correct: boolean,
  now: Date = new Date(),
): ProgressState {
  const existing = state.items[itemId];
  let item: ProgressItem;
  if (!existing) item = introduce(now);
  else if (!correct || isDue(existing, now)) item = review(existing, correct, now);
  else item = { ...existing, lastSeenAt: now.toISOString() };
  return { ...markActiveToday(state, now), items: { ...state.items, [itemId]: item } };
}

/**
 * Records an answer in a review session, which serves due items only, so it
 * is always a review. An unknown item is introduced and then reviewed: unlike
 * applyRoundResult, a wrong answer here counts a lapse, because the child was
 * explicitly tested on it.
 */
export function applyReview(
  state: ProgressState,
  itemId: string,
  correct: boolean,
  now: Date = new Date(),
): ProgressState {
  const item = review(state.items[itemId] ?? introduce(now), correct, now);
  return { ...markActiveToday(state, now), items: { ...state.items, [itemId]: item } };
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
