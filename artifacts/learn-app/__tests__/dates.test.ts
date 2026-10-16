import { todayKey } from "@/lib/dates";

describe("todayKey", () => {
  it("formats the local calendar date as YYYY-MM-DD", () => {
    expect(todayKey(new Date(2026, 0, 5, 9, 30))).toBe("2026-01-05");
  });

  it("uses the local date late in the evening, not UTC", () => {
    expect(todayKey(new Date(2026, 11, 31, 23, 59))).toBe("2026-12-31");
  });
});
