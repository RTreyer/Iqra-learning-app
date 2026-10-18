import { books, grades } from "./catalog.ts";
import type { Book, Grade, Lesson, Unit } from "./types";

export type * from "./types";
export { books, grades };

export type LessonLookup = { book: Book; unit: Unit; lesson: Lesson; next: Lesson | null };

const gradeByNumber = new Map<number, Grade>();
const gradeByBookId = new Map<string, Grade>();
const bookById = new Map<string, Book>();

for (const grade of grades) {
  gradeByNumber.set(grade.number, grade);
  for (const book of grade.books) gradeByBookId.set(book.id, grade);
}
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

export function getGrade(number: number): Grade | null {
  return gradeByNumber.get(number) ?? null;
}

/** The grade a book belongs to, for the book screen's back button. */
export function getGradeOfBook(bookId: string): Grade | null {
  return gradeByBookId.get(bookId) ?? null;
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
