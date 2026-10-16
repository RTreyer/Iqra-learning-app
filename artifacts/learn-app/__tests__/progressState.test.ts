import {
  applyCompletion,
  createEmptyState,
  mergeProgress,
  unitProgress,
  upgradeState,
} from "@/lib/progressState";

const NOW = new Date(2026, 9, 16, 18, 0);
const LATER = new Date(2026, 9, 17, 19, 0);

describe("upgradeState", () => {
  it("returns an empty v2 state for missing or invalid data", () => {
    expect(upgradeState(null, NOW)).toEqual(createEmptyState());
    expect(upgradeState("nope", NOW)).toEqual(createEmptyState());
  });

  it("upgrades a v1 blob to v2 with stars intact", () => {
    const v1 = {
      lessons: { a: { completed: true, stars: 2 }, b: { completed: true, stars: 3 } },
      totalStars: 5,
    };
    const state = upgradeState(v1, NOW);
    expect(state).toEqual({
      version: 2,
      lessons: {
        a: { completed: true, stars: 2, completedAt: NOW.toISOString() },
        b: { completed: true, stars: 3, completedAt: NOW.toISOString() },
      },
      items: {},
      activity: { days: [] },
      totalStars: 5,
    });
  });

  it("recomputes totalStars from lessons", () => {
    const state = upgradeState(
      { lessons: { a: { completed: true, stars: 2 } }, totalStars: 99 },
      NOW,
    );
    expect(state.totalStars).toBe(2);
  });

  it("keeps a v2 blob as is", () => {
    const v2 = {
      version: 2,
      lessons: { a: { completed: true, stars: 1, completedAt: "2026-01-01T00:00:00.000Z" } },
      items: {
        x: { box: 2, dueAt: "2026-01-02", lastSeenAt: "2026-01-01", lapses: 0 },
      },
      activity: { days: ["2026-01-01"] },
      totalStars: 1,
    };
    expect(upgradeState(v2, NOW)).toEqual(v2);
  });
});

describe("applyCompletion", () => {
  it("records a first completion with stars, timestamp and activity day", () => {
    const state = applyCompletion(createEmptyState(), "a", 2, NOW);
    expect(state.lessons.a).toEqual({ completed: true, stars: 2, completedAt: NOW.toISOString() });
    expect(state.totalStars).toBe(2);
    expect(state.activity.days).toEqual(["2026-10-16"]);
  });

  it("keeps the best stars: 2 then 3 gives 3", () => {
    const s = applyCompletion(applyCompletion(createEmptyState(), "a", 2, NOW), "a", 3, LATER);
    expect(s.lessons.a.stars).toBe(3);
    expect(s.lessons.a.completedAt).toBe(LATER.toISOString());
    expect(s.totalStars).toBe(3);
  });

  it("keeps the best stars: 3 then 1 gives 3 and keeps completedAt", () => {
    const s = applyCompletion(applyCompletion(createEmptyState(), "a", 3, NOW), "a", 1, LATER);
    expect(s.lessons.a.stars).toBe(3);
    expect(s.lessons.a.completedAt).toBe(NOW.toISOString());
    expect(s.totalStars).toBe(3);
    expect(s.activity.days).toEqual(["2026-10-16", "2026-10-17"]);
  });

  it("adds each day once and keeps only the last 60 days", () => {
    let s = createEmptyState();
    for (let i = 0; i < 65; i++) s = applyCompletion(s, "a", 1, new Date(2026, 0, 1 + i, 12));
    s = applyCompletion(s, "b", 1, new Date(2026, 0, 65, 13));
    expect(s.activity.days).toHaveLength(60);
    expect(s.activity.days[0]).toBe("2026-01-06");
    expect(s.activity.days[59]).toBe("2026-03-06");
  });

  it("does not mutate the input state", () => {
    const base = createEmptyState();
    applyCompletion(base, "a", 2, NOW);
    expect(base).toEqual(createEmptyState());
  });
});

describe("mergeProgress", () => {
  it("keeps the best lesson from either side and unions activity days", () => {
    const stored = applyCompletion(
      applyCompletion(createEmptyState(), "a", 3, NOW),
      "b",
      1,
      NOW,
    );
    const local = applyCompletion(
      applyCompletion(createEmptyState(), "a", 1, LATER),
      "b",
      2,
      LATER,
    );
    const merged = mergeProgress(stored, local);
    expect(merged.lessons.a.stars).toBe(3);
    expect(merged.lessons.b.stars).toBe(2);
    expect(merged.totalStars).toBe(5);
    expect(merged.activity.days).toEqual(["2026-10-16", "2026-10-17"]);
  });
});

describe("unitProgress", () => {
  it("counts done lessons and sums stars for the given ids", () => {
    let s = applyCompletion(createEmptyState(), "a", 3, NOW);
    s = applyCompletion(s, "b", 2, NOW);
    s = applyCompletion(s, "other", 3, NOW);
    expect(unitProgress(s, ["a", "b", "c"])).toEqual({ done: 2, total: 3, stars: 5 });
    expect(unitProgress(s, [])).toEqual({ done: 0, total: 0, stars: 0 });
  });
});
