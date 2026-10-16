import { currentStreak } from "@/lib/streak";

const TODAY = new Date(2026, 9, 16, 10, 0, 0);

test("no days means no streak", () => {
  expect(currentStreak([], TODAY)).toBe(0);
});

test("today alone is a streak of one", () => {
  expect(currentStreak(["2026-10-16"], TODAY)).toBe(1);
});

test("yesterday and today count two", () => {
  expect(currentStreak(["2026-10-15", "2026-10-16"], TODAY)).toBe(2);
});

test("yesterday keeps the streak alive until today is over", () => {
  expect(currentStreak(["2026-10-14", "2026-10-15"], TODAY)).toBe(2);
  expect(currentStreak(["2026-10-15"], TODAY)).toBe(1);
});

test("a gap resets the streak", () => {
  expect(currentStreak(["2026-10-16", "2026-10-13"], TODAY)).toBe(1);
  expect(currentStreak(["2026-10-14"], TODAY)).toBe(0);
});

test("unsorted days and duplicates are ignored", () => {
  expect(
    currentStreak(["2026-10-16", "2026-10-14", "2026-10-16", "2026-10-15", "2026-10-15"], TODAY),
  ).toBe(3);
});

test("streaks cross month and year boundaries", () => {
  expect(currentStreak(["2026-09-30", "2026-10-01"], new Date(2026, 9, 1, 8))).toBe(2);
  expect(currentStreak(["2025-12-31", "2026-01-01"], new Date(2026, 0, 1, 8))).toBe(2);
});

test("future days do not count", () => {
  expect(currentStreak(["2026-10-17"], TODAY)).toBe(0);
});
