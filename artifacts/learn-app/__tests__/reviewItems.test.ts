import { books, getLesson } from "@/content";
import { allItems, itemIdFor, itemsForLesson } from "@/lib/reviewItems";

function unitItems(unitId: string) {
  const unit = books.flatMap((b) => b.units).find((u) => u.id === unitId);
  if (!unit) throw new Error(`missing unit ${unitId}`);
  return unit.lessons.flatMap(itemsForLesson);
}

describe("itemsForLesson", () => {
  it("yields Unit 2 letter, word and question items", () => {
    const items = unitItems("a2");
    const letters = items.filter((i) => i.kind === "letter");
    // 7 letters × 4 syllable rounds + 6 review rounds, over 14 syllables (fatha and long alif).
    expect(letters).toHaveLength(34);
    expect(new Set(letters.map((i) => i.id)).size).toBe(14);
    expect(items.filter((i) => i.kind === "word")).toHaveLength(33);
    expect(items.filter((i) => i.kind === "question")).toHaveLength(6);
    expect(items).toHaveLength(73);
  });

  it("returns no items for non quiz lessons", () => {
    for (const id of ["u2-1", "u2-4", "u2-5"]) {
      const found = getLesson(id);
      expect(found).not.toBeNull();
      expect(itemsForLesson(found!.lesson)).toEqual([]);
    }
  });

  it("uses the same ids as itemIdFor and carries the round data", () => {
    const lesson = getLesson("u2-30")!.lesson;
    const items = itemsForLesson(lesson);
    items.forEach((item, index) => expect(item.id).toBe(itemIdFor(lesson, index)));
    expect(items[0]).toMatchObject({ kind: "question", correctIndex: 0 });
  });
});

describe("allItems", () => {
  it("is memoised and has an item for every round id in the catalog", () => {
    const map = allItems();
    expect(allItems()).toBe(map);
    let rounds = 0;
    for (const book of books) {
      for (const unit of book.units) {
        for (const lesson of unit.lessons) {
          const items = itemsForLesson(lesson);
          items.forEach((_, index) => {
            const id = itemIdFor(lesson, index);
            expect(id).not.toBeNull();
            expect(map.has(id!)).toBe(true);
            rounds += 1;
          });
        }
      }
    }
    expect(rounds).toBeGreaterThan(map.size);
    for (const [id, item] of map) expect(item.id).toBe(id);
  });

  it("keeps the first occurrence of a repeated id", () => {
    const first = itemsForLesson(getLesson("u2-2")!.lesson)[0];
    expect(allItems().get("letter:مَ")).toEqual(first);
  });
});
