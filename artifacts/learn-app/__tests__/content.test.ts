import { getBook } from "@/content";
import { subjects } from "@/theme/tokens";

test("book colors match the subject tokens", () => {
  for (const id of ["arabic-1", "math-1", "science-1"]) {
    const book = getBook(id);
    expect(book?.color).toBe(subjects[book!.subject]);
  }
});
