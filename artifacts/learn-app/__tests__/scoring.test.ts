import { starsForScore } from "@/lib/scoring";

describe("starsForScore", () => {
  it.each([
    [5, 5, 3],
    [3, 5, 2],
    [2, 5, 1],
    [0, 5, 1],
    [2, 3, 2],
    [1, 3, 1],
    [0, 0, 3],
  ])("%i of %i correct gives %i stars", (correct, total, stars) => {
    expect(starsForScore({ correct, total })).toBe(stars);
  });
});
