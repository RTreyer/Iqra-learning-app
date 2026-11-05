import { compareAnswer, sideValue } from "@/content/math/answers";

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
