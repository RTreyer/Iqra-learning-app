import { BOX_INTERVAL_DAYS, introduce, isDue, pickDue, review, type ItemState } from "@/lib/srs";

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date(2026, 9, 16, 18, 0);
const plus = (date: Date, days: number) => new Date(date.getTime() + days * DAY);
/** ISO string of local midnight `days` calendar days after `date`. */
const localDay = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days).toISOString();

function item(box: ItemState["box"], dueAt: Date): ItemState {
  return { box, dueAt: dueAt.toISOString(), lastSeenAt: NOW.toISOString(), lapses: 0 };
}

describe("introduce", () => {
  it("puts a new item in box 1, due tomorrow", () => {
    expect(introduce(NOW)).toEqual({
      box: 1,
      dueAt: localDay(NOW, 1),
      lastSeenAt: NOW.toISOString(),
      lapses: 0,
    });
  });
});

describe("review", () => {
  it("three correct reviews from box 1 reach box 4, due 7 days out", () => {
    let state = introduce(NOW);
    let at = NOW;
    for (let i = 0; i < 3; i += 1) {
      at = plus(at, 1);
      state = review(state, true, at);
    }
    expect(state.box).toBe(4);
    expect(state.dueAt).toBe(localDay(at, BOX_INTERVAL_DAYS[4]));
    expect(state.dueAt).toBe(localDay(at, 7));
    expect(state.lastSeenAt).toBe(at.toISOString());
    expect(state.lapses).toBe(0);
  });

  it("caps at box 5", () => {
    const state = review(item(5, NOW), true, NOW);
    expect(state.box).toBe(5);
    expect(state.dueAt).toBe(localDay(NOW, 14));
  });

  it("a wrong answer resets to box 1 and counts a lapse", () => {
    const state = review({ ...item(4, NOW), lapses: 2 }, false, NOW);
    expect(state).toMatchObject({ box: 1, lapses: 3, dueAt: localDay(NOW, 1) });
  });
});

describe("isDue", () => {
  it("is due from the start of the due day, by local calendar day", () => {
    const introducedAt = new Date(2026, 2, 1, 18, 0);
    const state = introduce(introducedAt);
    expect(isDue(state, new Date(2026, 2, 1, 23, 59))).toBe(false);
    expect(isDue(state, new Date(2026, 2, 2, 0, 0))).toBe(true);
    expect(isDue(state, new Date(2026, 2, 2, 8, 0))).toBe(true);
    expect(isDue(state, new Date(2026, 2, 5, 8, 0))).toBe(true);
  });

  it("keeps dueAt on local midnight across a DST change", () => {
    const state = review(
      { ...introduce(new Date(2026, 2, 20, 18, 0)), box: 4 },
      true,
      new Date(2026, 2, 20, 18, 0),
    );
    const due = new Date(state.dueAt);
    expect([due.getFullYear(), due.getMonth(), due.getDate(), due.getHours()]).toEqual([
      2026, 3, 3, 0,
    ]);
  });

  it("treats an unparsable dueAt as due", () => {
    expect(isDue({ ...item(1, NOW), dueAt: "garbage" }, NOW)).toBe(true);
  });

  it("treats a dueAt more than 14 days ahead as due (clock moved backwards)", () => {
    expect(isDue(item(5, new Date(localDay(NOW, 14))), NOW)).toBe(false);
    expect(isDue(item(5, new Date(localDay(NOW, 15))), NOW)).toBe(true);
    expect(isDue(item(1, new Date(2027, 0, 1)), NOW)).toBe(true);
  });
});

describe("pickDue", () => {
  const past = (days: number) => plus(NOW, -days);

  it("returns only due ids, at most limit", () => {
    const items: Record<string, ItemState> = {
      "letter:a": item(1, past(3)),
      "letter:b": item(1, past(2)),
      "word:x": item(2, past(1)),
      "calc:1+1": item(1, plus(NOW, 1)),
    };
    expect(pickDue(items, NOW)).toHaveLength(3);
    expect(pickDue(items, NOW)).not.toContain("calc:1+1");
    expect(pickDue(items, NOW, 2)).toHaveLength(2);
    expect(pickDue({}, NOW)).toEqual([]);
  });

  it("orders oldest due first, then lowest box", () => {
    const items: Record<string, ItemState> = {
      "letter:new": item(3, past(1)),
      "letter:old": item(3, past(5)),
      "letter:low": item(1, past(1)),
    };
    expect(pickDue(items, NOW)).toEqual(["letter:old", "letter:low", "letter:new"]);
  });

  it("interleaves kinds so no two neighbours share a kind when avoidable", () => {
    const items: Record<string, ItemState> = {
      "letter:a": item(1, past(6)),
      "letter:b": item(1, past(5)),
      "word:x": item(1, past(4)),
      "calc:2+2": item(1, past(3)),
      "letter:c": item(1, past(2)),
    };
    expect(pickDue(items, NOW)).toEqual(["letter:a", "word:x", "letter:b", "calc:2+2", "letter:c"]);
  });

  it("is stable for a fixed input regardless of key order", () => {
    const a: Record<string, ItemState> = {
      "word:y": item(2, past(1)),
      "letter:a": item(2, past(1)),
      "word:x": item(2, past(1)),
    };
    const b: Record<string, ItemState> = {
      "word:x": a["word:x"],
      "letter:a": a["letter:a"],
      "word:y": a["word:y"],
    };
    expect(pickDue(a, NOW)).toEqual(pickDue(b, NOW));
    expect(pickDue(a, NOW)).toEqual(["letter:a", "word:x", "word:y"]);
  });

  it("falls back to consecutive ids when only one kind is due", () => {
    const items: Record<string, ItemState> = {
      "count:3": item(1, past(2)),
      "count:5": item(1, past(1)),
      "word:z": item(1, plus(NOW, 2)),
    };
    expect(pickDue(items, NOW)).toEqual(["count:3", "count:5"]);
  });
});
