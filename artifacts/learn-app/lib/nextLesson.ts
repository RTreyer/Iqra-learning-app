import { books, type Book, type Lesson, type Unit } from "@/content";
import type { ProgressState } from "@/lib/progressState";

export type NextLesson = { book: Book; unit: Unit; lesson: Lesson };

/**
 * Where the play button goes: the first lesson not yet done, in catalog order (Arabic, Math,
 * Science), skipping unavailable books. With `bookId`, only in that book (the subject the child
 * chose). Once every lesson is done, the first one below three stars; then null.
 */
export function nextLesson(
  progress: ProgressState,
  catalog: Book[] = books,
  bookId?: string | null,
): NextLesson | null {
  const scope = catalog.filter((book) => book.available && (!bookId || book.id === bookId));
  const first = (open: (lessonId: string) => boolean): NextLesson | null => {
    for (const book of scope)
      for (const unit of book.units)
        for (const lesson of unit.lessons) if (open(lesson.id)) return { book, unit, lesson };
    return null;
  };
  return (
    first((id) => !progress.lessons[id]?.completed) ??
    first((id) => (progress.lessons[id]?.stars ?? 0) < 3)
  );
}
