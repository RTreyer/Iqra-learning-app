import { books, getUnit } from "@/content";
import { GOAL_LINES, SUBJECT_DONE, finishLine, goalLine } from "@/content/story";
import type { Lesson, Unit } from "@/content/types";
import {
  collectedLetters,
  goalKind,
  goalState,
  sectionLetter,
  storyStep,
  symbolsBack,
} from "@/lib/storyProgress";

const none = () => false;
const doneIds = (ids: Iterable<string>) => {
  const set = new Set(ids);
  return (l: Lesson) => set.has(l.id);
};
/** The lessons of a unit in order, done one after another. */
const firstN = (unit: Unit, n: number) => doneIds(unit.lessons.slice(0, n).map((l) => l.id));

test("a section is about the letter before its colon; exercises are about none", () => {
  expect(sectionLetter("م: أُحِبُّ مَامَا")).toBe("م");
  expect(sectionLetter("تَدْرِيبَات")).toBeNull();
  expect(sectionLetter(undefined)).toBeNull();
});

test("a letter is collected back once all of its lessons are done", () => {
  const unit = getUnit("a2")!;
  const own = unit.lessons.filter((l) => sectionLetter(l.section) === "م");
  expect(collectedLetters(unit, doneIds(own.slice(1).map((l) => l.id))).has("م")).toBe(false);
  expect([...collectedLetters(unit, doneIds(own.map((l) => l.id)))]).toEqual(["م"]);
  expect(collectedLetters(unit, () => true).size).toBe(unit.letters!.length);
});

test("places that are not letters fill with the share of the unit, the last only at the end", () => {
  expect([0, 0.2, 0.5, 0.99, 1].map((share) => symbolsBack(7, share))).toEqual([0, 1, 3, 6, 7]);
});

test("every unit has its goal: writing, letters, vowels, then one market station per maths unit", () => {
  const arabic = books.find((b) => b.id === "arabic-1")!;
  const math = books.find((b) => b.id === "math-1")!;
  expect(arabic.units.map((u) => goalKind(u, "arabic"))).toEqual([
    "writing",
    "letters",
    "letters",
    "vowels",
    "vowels",
    "letters",
    "letters",
    "letters",
  ]);
  // A market day: each station once, and only the last one ends with the ship sailing.
  expect(math.units.map((u) => goalKind(u, "math"))).toEqual([
    "sort",
    "count",
    "add",
    "carry",
    "pack",
  ]);
  const sails = Object.entries(GOAL_LINES).filter(([, l]) => l.complete.includes("أَبْحَرَتِ"));
  expect(sails.map(([kind]) => kind)).toEqual(["pack"]);
  expect(goalKind({}, "science")).toBeNull();
});

test("the vowels units hold the letters of unit 2, which already came back there", () => {
  const a2 = new Set(getUnit("a2")!.letters);
  for (const id of ["a4", "a5"]) {
    expect(goalKind(getUnit(id)!, "arabic")).toBe("vowels");
    for (const letter of getUnit(id)!.letters!) expect(a2.has(letter)).toBe(true);
  }
  // No other unit brings a letter back twice.
  const seen = new Map<string, string>();
  for (const unit of books.find((b) => b.id === "arabic-1")!.units) {
    if (goalKind(unit, "arabic") !== "letters") continue;
    for (const letter of unit.letters!) {
      expect(seen.get(letter)).toBeUndefined();
      seen.set(letter, unit.id);
    }
  }
});

test("the goal and the letters above the path agree after every lesson", () => {
  for (const id of ["a2", "a3", "a4", "a5", "a6", "a7", "a8"]) {
    const unit = getUnit(id)!;
    const kind = goalKind(unit, "arabic")!;
    for (let n = 0; n <= unit.lessons.length; n++) {
      const done = firstN(unit, n);
      const collected = collectedLetters(unit, done);
      expect(goalState(unit, kind, done).back).toEqual(unit.letters!.map((l) => collected.has(l)));
    }
  }
});

test("finishing a letter's last lesson brings that letter back; the exercises seal the letter", () => {
  const unit = getUnit("a2")!;
  const own = unit.lessons.filter((l) => sectionLetter(l.section) === "م");
  const last = own[own.length - 1];
  const before = doneIds(own.slice(0, -1).map((l) => l.id));
  const step = storyStep(unit, "letters", before, last.id);
  expect(step.fresh).toBe(unit.letters!.indexOf("م"));
  expect(step.completed).toBe(false);
  // Another lesson of the same section brings nothing back.
  expect(storyStep(unit, "letters", none, own[0].id).fresh).toBeNull();
  // All letters back, then the very last exercise completes (seals) the letter.
  const lastLesson = unit.lessons[unit.lessons.length - 1];
  const almost = doneIds(unit.lessons.slice(0, -1).map((l) => l.id));
  expect(goalState(unit, "letters", almost).back.every(Boolean)).toBe(true);
  expect(storyStep(unit, "letters", almost, lastLesson.id)).toMatchObject({
    complete: true,
    completed: true,
    fresh: null,
  });
});

test("the preparation unit writes lines on a page, the last with the last lesson", () => {
  const unit = getUnit("a1")!;
  expect(goalState(unit, "writing", none).back).toEqual([false, false, false, false]);
  const almost = firstN(unit, unit.lessons.length - 1);
  expect(goalState(unit, "writing", almost).back.filter(Boolean)).toHaveLength(3);
  expect(goalState(unit, "writing", () => true)).toEqual({
    back: [true, true, true, true],
    complete: true,
  });
});

test("each Arabic letter is delivered to someone from its unit's stories", () => {
  for (const unit of books.find((b) => b.id === "arabic-1")!.units) {
    const kind = goalKind(unit, "arabic")!;
    if (kind === "writing") {
      expect(unit.recipient).toBeUndefined();
      expect(finishLine(unit, kind)).toBe(GOAL_LINES.writing.complete);
      continue;
    }
    expect(unit.recipient?.to).toMatch(/^إِلَى /);
    expect(unit.recipient?.pictures.length).toBeGreaterThan(0);
    expect(finishLine(unit, kind)).toBe(
      `${GOAL_LINES[kind].complete} سَأُوصِلُهَا ${unit.recipient!.to}.`,
    );
    expect(goalLine(unit, kind, true)).toContain(unit.recipient!.to);
    expect(goalLine(unit, kind, false)).toBe(GOAL_LINES[kind].missing);
  }
});

test("the story ends by subject: letters delivered, the ship gone", () => {
  expect(SUBJECT_DONE.arabic).toContain("رَسَائِلِي");
  expect(SUBJECT_DONE.math).toContain("السَّفِينَةُ");
});
