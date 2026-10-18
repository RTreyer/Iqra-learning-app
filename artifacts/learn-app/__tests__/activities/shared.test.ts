import { renderHook } from "@testing-library/react-native";
import { hashString, seedFor, shuffleWithSeed } from "@/components/activities/shared/shuffle";
import { useShuffled } from "@/components/activities/shared/useShuffled";
import type { Lesson } from "@/content/types";
import { toArabicDigits } from "@/lib/arabicNumbers";
import { itemIdFor } from "@/lib/reviewItems";
import { lessonOf } from "@/test-utils/activities";

const ITEMS = ["a", "b", "c", "d", "e"] as const;

describe("shuffleWithSeed", () => {
  it("is deterministic for the same seed and does not mutate the input", () => {
    const input = [...ITEMS];
    const first = shuffleWithSeed(input, 2, 42);
    expect(shuffleWithSeed(input, 2, 42)).toEqual(first);
    expect(input).toEqual(ITEMS);
    expect([...first.items].sort()).toEqual([...ITEMS]);
  });

  it("produces different orders for different seeds over a sample", () => {
    const orders = new Set<string>();
    for (let seed = 0; seed < 50; seed++)
      orders.add(shuffleWithSeed(ITEMS, 0, seed).items.join(""));
    expect(orders.size).toBeGreaterThan(10);
  });

  it("tracks the correct item and moves it across attempts", () => {
    const positions = new Set<number>();
    for (let attempt = 0; attempt < 30; attempt++) {
      const s = shuffleWithSeed(ITEMS, 3, seedFor(`u2-2:${attempt}`, 0));
      expect(s.items[s.correctIndex]).toBe("d");
      expect(s.order[s.correctIndex]).toBe(3);
      positions.add(s.correctIndex);
    }
    expect(positions.size).toBeGreaterThan(2);
  });

  it("returns -1 when the correct index is out of range", () => {
    expect(shuffleWithSeed(ITEMS, 9, 1).correctIndex).toBe(-1);
  });

  it("hashes strings stably", () => {
    expect(hashString("abc")).toBe(hashString("abc"));
    expect(hashString("abc")).not.toBe(hashString("abd"));
  });
});

describe("useShuffled", () => {
  it("memoises per attemptKey and round", () => {
    const items = ["x", "y", "z"];
    const { result, rerender } = renderHook(
      ({ key, round }: { key: string; round: number }) => useShuffled(items, 1, key, round),
      { initialProps: { key: "k:1", round: 0 } },
    );
    const first = result.current;
    rerender({ key: "k:1", round: 0 });
    expect(result.current).toBe(first);
    expect(result.current.items[result.current.correctIndex]).toBe("y");
    rerender({ key: "k:2", round: 0 });
    expect(result.current).not.toBe(first);
    expect(result.current.items[result.current.correctIndex]).toBe("y");
  });
});

describe("itemIdFor", () => {
  const base = { id: "m1", number: 1, title: "", subtitle: "", emoji: "", color: "" };

  it("maps quiz lessons to stable ids", () => {
    expect(itemIdFor(lessonOf("u2-2", "letter_pick"), 0)).toBe("letter:مَ");
    expect(itemIdFor(lessonOf("u2-3", "word_read"), 1)).toBe("word:أَنَا");
    expect(itemIdFor(lessonOf("u2-30", "listen_pick"), 2)).toBe("q:u2-30:2");
    const counting: Lesson = {
      ...base,
      type: "counting",
      rounds: [{ emoji: "🍎", count: 4, options: [3, 4, 5] }],
    };
    expect(itemIdFor(counting, 0)).toBe("count:4");
    const arithmetic: Lesson = {
      ...base,
      type: "arithmetic",
      rounds: [{ a: 3, b: 2, op: "-", options: [1, 2] }],
    };
    expect(itemIdFor(arithmetic, 0)).toBe("calc:3-2");
  });

  it("returns null for other types and missing rounds", () => {
    expect(itemIdFor(lessonOf("u2-1", "story"), 0)).toBeNull();
    expect(itemIdFor(lessonOf("u1-3", "behavior"), 0)).toBeNull();
    expect(itemIdFor(lessonOf("u2-2", "letter_pick"), 99)).toBeNull();
  });
});

describe("toArabicDigits", () => {
  it("converts every digit", () => {
    expect(toArabicDigits(0)).toBe("٠");
    expect(toArabicDigits(1234567890)).toBe("١٢٣٤٥٦٧٨٩٠");
    expect(toArabicDigits(-12)).toBe("-١٢");
  });
});
