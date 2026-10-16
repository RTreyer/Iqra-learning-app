import { books, type Book, type Lesson, type Unit } from "@/content";
import type { ProgressState } from "@/lib/progressState";

export type NextLesson = { book: Book; unit: Unit; lesson: Lesson };

/** First lesson in catalog order (Arabic, Math, Science) below three stars, skipping unavailable books. */
export function nextLesson(progress: ProgressState, catalog: Book[] = books): NextLesson | null {
  for (const book of catalog) {
    if (!book.available) continue;
    for (const unit of book.units)
      for (const lesson of unit.lessons)
        if ((progress.lessons[lesson.id]?.stars ?? 0) < 3) return { book, unit, lesson };
  }
  return null;
}
