import { books, getUnit } from "@/content";
import {
  GOAL_LINES,
  MESSAGE,
  STATIONS,
  SUBJECT_DONE,
  finishLine,
  goalLine,
  pathLine,
  stationScenes,
} from "@/content/story";
import { messageLetters } from "@/components/world/Bowl";
import type { Lesson, Unit } from "@/content/types";
import {
  collectedLetters,
  goalKind,
  goalState,
  learntLetters,
  sectionLetter,
  storyStep,
  symbolsBack,
  voyageStage,
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
  // The coffee trader's journey, Haraz to Mocha: each maths station once.
  expect(math.units.map((u) => goalKind(u, "math"))).toEqual([
    "sort",
    "count",
    "add",
    "give",
    "ship",
  ]);
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

test("every unit is a station on Hudhud's journey, and ends with its clue or lesson", () => {
  for (const book of books.filter((b) => b.available))
    for (const unit of book.units) {
      const kind = goalKind(unit, book.subject)!;
      const station = STATIONS[unit.id];
      expect(station).toBeDefined();
      expect(stationScenes(unit.id)!.map((s) => s.line)).toEqual([station.where, station.ask]);
      expect(pathLine(unit.id, kind)).toBe(station.ask);
      expect(finishLine(unit.id, kind)).toBe(station.outro);
      expect(goalLine(unit.id, kind, true)).toBe(station.outro);
      expect(goalLine(unit.id, kind, false)).toBe(GOAL_LINES[kind].missing);
    }
  // Rasha's trail leads to her new home: she is well.
  expect(STATIONS.a8.outro).toContain("بِخَيْرٍ");
  // The trader's ship sails, and he passes Rasha's kindness on: water for the birds.
  expect(STATIONS["math-u5"].outro).toContain("صَحْنَ مَاءٍ لِلطُّيُورِ");
});

test("Rasha's message becomes readable only with the letters of the whole book", () => {
  const arabic = books.find((b) => b.id === "arabic-1")!;
  const letters = new Set([...MESSAGE.words, MESSAGE.name].flatMap(messageLetters));
  const taught = learntLetters(arabic.units, () => true);
  for (const letter of letters) if (letter !== "ا") expect(taught.has(letter)).toBe(true);
  // At the start none of them is learnt yet; unit 2 alone does not make it readable.
  expect(learntLetters(arabic.units, () => false).size).toBe(0);
  const unit2 = new Set(getUnit("a2")!.lessons.map((l) => l.id));
  const after2 = learntLetters(arabic.units, (l) => unit2.has(l.id));
  expect([...letters].some((l) => l !== "ا" && !after2.has(l))).toBe(true);
});

test("one more sack goes on the ship with every maths unit finished; with all it sails", () => {
  const math = books.find((b) => b.id === "math-1")!;
  expect(voyageStage(math.units, () => false)).toBe(0);
  expect(voyageStage(math.units, () => true)).toBe(5);
  const first = new Set(math.units[0].lessons.map((l) => l.id));
  expect(voyageStage(math.units, (l) => first.has(l.id))).toBe(1);
});

test("the story ends by thread: the message read, the ship sailed", () => {
  expect(SUBJECT_DONE.arabic).toContain("رَشَا");
  expect(SUBJECT_DONE.math).toContain("السَّفِينَةُ");
});
