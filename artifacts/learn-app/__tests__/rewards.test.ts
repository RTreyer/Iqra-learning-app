import { DAILY_GOAL, lessonsToday } from "@/lib/daily";
import { createEmptyState } from "@/lib/progressState";
import {
  STARS_PER_STICKER,
  STICKERS,
  newSticker,
  nextStickerProgress,
  stickersEarned,
} from "@/lib/stickers";

const NOW = new Date(2026, 9, 16, 18, 0, 0);

describe("today's qamariya", () => {
  it("counts lessons completed or improved on the local day", () => {
    const state = createEmptyState();
    state.lessons = {
      a: { completed: true, stars: 3, completedAt: new Date(2026, 9, 16, 8).toISOString() },
      b: { completed: true, stars: 1, completedAt: new Date(2026, 9, 16, 17).toISOString() },
      c: { completed: true, stars: 2, completedAt: new Date(2026, 9, 15, 23).toISOString() },
      d: { completed: false, stars: 0, completedAt: NOW.toISOString() },
      e: { completed: true, stars: 2, completedAt: "not a date" },
    };
    expect(lessonsToday(state, NOW)).toBe(2);
  });

  it("asks for three lessons a day", () => {
    expect(DAILY_GOAL).toBe(3);
  });
});

describe("sticker album", () => {
  it("earns one sticker per fixed number of stars, never more than the album holds", () => {
    expect(stickersEarned(0)).toBe(0);
    expect(stickersEarned(STARS_PER_STICKER - 1)).toBe(0);
    expect(stickersEarned(STARS_PER_STICKER)).toBe(1);
    expect(stickersEarned(10_000)).toBe(STICKERS.length);
  });

  it("names the sticker a completion crosses into, and nothing otherwise", () => {
    expect(newSticker(10, 12)).toBe(STICKERS[0]);
    expect(newSticker(12, 15)).toBeNull();
    expect(newSticker(23, 24)).toBe(STICKERS[1]);
  });

  it("shows the way to the next sticker until the album is full", () => {
    expect(nextStickerProgress(0)).toEqual({ missing: STARS_PER_STICKER, share: 0 });
    expect(nextStickerProgress(15)).toEqual({ missing: 9, share: 3 / 12 });
    expect(nextStickerProgress(STARS_PER_STICKER * STICKERS.length)).toBeNull();
  });

  it("every sticker has a vocalised name to speak", () => {
    expect(new Set(STICKERS.map((s) => s.id)).size).toBe(STICKERS.length);
    for (const sticker of STICKERS) expect(sticker.name).toMatch(/[ً-ْ]/);
  });
});
