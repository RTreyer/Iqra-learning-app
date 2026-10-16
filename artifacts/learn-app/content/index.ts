import { books } from "./catalog.ts";
import type { Book, Lesson, Unit } from "./types";

export type * from "./types";
export { books };

export type LessonLookup = { book: Book; unit: Unit; lesson: Lesson; next: Lesson | null };

const bookById = new Map<string, Book>();
const unitById = new Map<string, Unit>();
const lessonById = new Map<string, LessonLookup>();

for (const book of books) {
  bookById.set(book.id, book);
  for (const unit of book.units) {
    unitById.set(unit.id, unit);
    unit.lessons.forEach((lesson, index) => {
      lessonById.set(lesson.id, { book, unit, lesson, next: unit.lessons[index + 1] ?? null });
    });
  }
}

export function getBook(id: string): Book | null {
  return bookById.get(id) ?? null;
}

export function getUnit(id: string): Unit | null {
  return unitById.get(id) ?? null;
}

export function getLesson(id: string): LessonLookup | null {
  return lessonById.get(id) ?? null;
}

export function unitLessonIds(unit: Unit): string[] {
  return unit.lessons.map((lesson) => lesson.id);
}
