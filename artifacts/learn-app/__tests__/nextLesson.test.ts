import { books } from "@/content";
import type { Book } from "@/content/types";
import { nextLesson } from "@/lib/nextLesson";
import { createEmptyState, type ProgressState } from "@/lib/progressState";

function withStars(predicate: (book: Book) => boolean, stars = 3): ProgressState {
  const state = createEmptyState();
  for (const book of books.filter(predicate))
    for (const unit of book.units)
      for (const lesson of unit.lessons)
        state.lessons[lesson.id] = {
          completed: true,
          stars,
          completedAt: "2026-10-16T00:00:00.000Z",
        };
  return state;
}

test("a fresh state starts at the first Arabic lesson", () => {
  const next = nextLesson(createEmptyState());
  expect(next?.lesson.id).toBe("u1-1");
  expect(next?.unit.id).toBe("a1");
  expect(next?.book.id).toBe("arabic-1");
});

test("lessons below three stars are not finished", () => {
  const state = createEmptyState();
  state.lessons["u1-1"] = { completed: true, stars: 3, completedAt: "2026-10-16T00:00:00.000Z" };
  state.lessons["u1-2"] = { completed: true, stars: 2, completedAt: "2026-10-16T00:00:00.000Z" };
  expect(nextLesson(state)?.lesson.id).toBe("u1-2");
});

test("all Arabic at three stars moves on to Math", () => {
  expect(nextLesson(withStars((b) => b.subject === "arabic"))?.lesson.id).toBe("m1-1");
});

test("everything at three stars returns null", () => {
  expect(nextLesson(withStars(() => true))).toBeNull();
});

test("unavailable books are skipped", () => {
  const catalog = books.map((b) => (b.subject === "arabic" ? { ...b, available: false } : b));
  expect(nextLesson(createEmptyState(), catalog)?.lesson.id).toBe("m1-1");
});
