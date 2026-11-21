import type { Book } from "@/content/types";
import { todayKey } from "@/lib/dates";
import type { ProgressState } from "@/lib/progressState";

/** What a subject's lessons look like for the parents: today, this week, all of it. */
export type SubjectActivity = {
  book: Book;
  /** Lessons finished (or improved) today, local day. */
  today: number;
  /** The same over the last 7 days, today included. */
  week: number;
  done: number;
  total: number;
};

export type LastLesson = { book: Book; lessonId: string; title: string; at: string };

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Per available subject: lessons today, this week and in all (as Lingokids' progress centre
 * shows parents where the time went). Counted from each lesson's completedAt, like the daily
 * bowl (lib/daily.ts): a replay that does not beat the best stars does not count again.
 */
export function subjectActivity(
  progress: ProgressState,
  books: Book[],
  now: Date = new Date(),
): SubjectActivity[] {
  const today = todayKey(now);
  const weekKeys = new Set(
    Array.from({ length: 7 }, (_, i) => todayKey(new Date(now.getTime() - i * DAY_MS))),
  );
  return books
    .filter((book) => book.available)
    .map((book) => {
      let todayCount = 0;
      let week = 0;
      let done = 0;
      let total = 0;
      for (const unit of book.units)
        for (const lesson of unit.lessons) {
          total += 1;
          const p = progress.lessons[lesson.id];
          if (!p?.completed) continue;
          done += 1;
          const at = new Date(p.completedAt);
          if (Number.isNaN(at.getTime())) continue;
          const key = todayKey(at);
          if (key === today) todayCount += 1;
          if (weekKeys.has(key)) week += 1;
        }
      return { book, today: todayCount, week, done, total };
    });
}

/** The lesson finished most recently, with its subject; null before the first one. */
export function lastLesson(progress: ProgressState, books: Book[]): LastLesson | null {
  let last: LastLesson | null = null;
  for (const book of books)
    for (const unit of book.units)
      for (const lesson of unit.lessons) {
        const p = progress.lessons[lesson.id];
        if (!p?.completed || Number.isNaN(new Date(p.completedAt).getTime())) continue;
        if (!last || p.completedAt > last.at)
          last = { book, lessonId: lesson.id, title: lesson.title, at: p.completedAt };
      }
  return last;
}
