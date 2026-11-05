import { compareAnswer, numberFillAnswer, sideValue } from "@/content/math/answers";

test("a side is worth its number or its picture count", () => {
  expect(sideValue({ number: 7 })).toBe(7);
  expect(sideValue({ pics: [{ emoji: "🐟" }, { emoji: "🐟" }] })).toBe(2);
});

test("the answer says how first relates to second", () => {
  expect(compareAnswer({ number: 5 }, { number: 3 })).toBe("more");
  expect(
    compareAnswer({ number: 2 }, { pics: [{ emoji: "🐟" }, { emoji: "🐟" }, { emoji: "🐟" }] }),
  ).toBe("less");
  expect(compareAnswer({ number: 4 }, { number: 4 })).toBe("equal");
});

test("number fill solves any one missing cell of a sum or difference", () => {
  expect(numberFillAnswer([2, "+", 3, "=", "?"])).toBe(5);
  expect(numberFillAnswer([2, "+", "?", "=", 5])).toBe(3);
  expect(numberFillAnswer(["?", "-", 2, "=", 4])).toBe(6);
  expect(numberFillAnswer([7, "-", "?", "=", 3])).toBe(4);
});

test("number fill continues a sequence", () => {
  expect(numberFillAnswer([2, 3, "?", 5])).toBe(4);
  expect(numberFillAnswer(["?", 8, 6])).toBe(10);
  expect(numberFillAnswer([1, 2, 3])).toBeNull();
});

test("an unsolvable sentence has no answer", () => {
  expect(numberFillAnswer([2, "+", "?", "=", "?"])).toBeNull();
  expect(numberFillAnswer([2, 4, "?", 9])).toBeNull();
});
