import { books } from "@/content";
import type { ProgressState } from "@/lib/progressState";
import { lastLesson, subjectActivity } from "@/lib/subjectActivity";

const NOW = new Date(2026, 10, 21, 18, 0, 0);
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

function state(lessons: Record<string, string>): ProgressState {
  return {
    version: 2,
    lessons: Object.fromEntries(
      Object.entries(lessons).map(([id, at]) => [id, { completed: true, stars: 2, completedAt: at }]),
    ),
    items: {},
    activity: { days: [] },
    totalStars: 0,
  } as unknown as ProgressState;
}

test("counts each subject's lessons today, this week and in all", () => {
  const progress = state({
    "u1-1": daysAgo(0),
    "u1-2": daysAgo(6),
    "u1-3": daysAgo(10),
    "math-u1-1": daysAgo(2),
  });
  const [arabic, math] = subjectActivity(progress, books, NOW);
  expect(arabic.book.subject).toBe("arabic");
  expect(arabic).toMatchObject({ today: 1, week: 2, done: 3 });
  expect(math.book.subject).toBe("math");
  expect(math).toMatchObject({ today: 0, week: 1, done: 1 });
  expect(arabic.total).toBeGreaterThan(arabic.done);
});

test("nothing learned yet: zeros, and no last lesson", () => {
  const progress = state({});
  expect(subjectActivity(progress, books, NOW).map((a) => a.done)).toEqual([0, 0]);
  expect(lastLesson(progress, books)).toBeNull();
});

test("the last lesson is the one finished most recently, with its subject", () => {
  const progress = state({ "u1-1": daysAgo(3), "math-u1-1": daysAgo(1) });
  const last = lastLesson(progress, books);
  expect(last?.lessonId).toBe("math-u1-1");
  expect(last?.book.subject).toBe("math");
});
