import { bookSection, numberMathLessons, pics, shape } from "@/content/math/mathKit";

test("lessons get math-u ids and positions", () => {
  const lessons = numberMathLessons(2, [
    { type: "compare", title: "أ", subtitle: "", emoji: "⚖️", color: "#7C3AED", rounds: [] },
    { type: "compare", title: "ب", subtitle: "", emoji: "⚖️", color: "#7C3AED", rounds: [] },
  ]);
  expect(lessons.map((l) => [l.id, l.number])).toEqual([
    ["math-u2-1", 1],
    ["math-u2-2", 2],
  ]);
});

test("section headings use the book lesson code in Eastern Arabic digits", () => {
  expect(bookSection(2, 1, "الأَعْدَادُ ١، ٢، ٣")).toBe("٢-١: الأَعْدَادُ ١، ٢، ٣");
});

test("picture builders", () => {
  expect(pics("🐟", 3)).toEqual([{ emoji: "🐟" }, { emoji: "🐟" }, { emoji: "🐟" }]);
  expect(shape("circle", "red", "big")).toEqual({ shape: "circle", color: "red", size: "big" });
});
