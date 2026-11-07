/**
 * Where a unit stands in Hudhud's story. Every unit has one goal at the end of its path
 * (GoalKind in content/types.ts). The goal, the letters above the path and the finish card all
 * read the same state from here, so they never disagree:
 * - letters and vowels: a letter is back (or has its vowel marks back) once every lesson of its
 *   section is done; the exercises at the end seal the letter;
 * - writing and the market stations: a share of the places fill as lessons are done, the last
 *   one only with the whole unit.
 */

import type { GoalKind, Lesson, Unit } from "@/content/types";

/** The letter a section is about ("م: أُحِبُّ مَامَا" is about م), or null (exercises, tests). */
export function sectionLetter(section: string | undefined): string | null {
  const match = section?.match(/^\s*(\S)\s*:/);
  return match ? match[1] : null;
}

/** A letter is collected back once every lesson of its section is done (or the whole unit). */
export function collectedLetters(unit: Unit, done: (lesson: Lesson) => boolean): Set<string> {
  const collected = new Set<string>();
  const allDone = unit.lessons.every(done);
  for (const letter of unit.letters ?? []) {
    const own = unit.lessons.filter((l) => sectionLetter(l.section) === letter);
    if (allDone || (own.length > 0 && own.every(done))) collected.add(letter);
  }
  return collected;
}

/** How many of a goal's places are filled at this share of the unit; all only when it is done. */
export function symbolsBack(count: number, share: number): number {
  if (share >= 1) return count;
  return Math.min(count - 1, Math.floor(share * count));
}

type GoalUnit = Pick<Unit, "letters" | "goal">;

/** The unit's goal: as set in the content, else from its subject and letters. Null: no story. */
export function goalKind(unit: GoalUnit, subject: string): GoalKind | null {
  if (unit.goal) return unit.goal;
  if (subject === "math") return "jars";
  if (subject === "arabic" || subject === "lughati")
    return unit.letters?.length ? "letters" : "writing";
  return null;
}

/** Places of a goal that are not letters: lines on the page, baskets, sacks, parcels. */
const PLACES: Record<Exclude<GoalKind, "letters" | "vowels">, number> = {
  writing: 4,
  seeds: 3,
  jars: 5,
  drops: 5,
  give: 4,
  stones: 4,
};

/** The letters a goal is about (letters, vowels), else none. */
export function goalLetters(unit: GoalUnit, kind: GoalKind): string[] {
  return kind === "letters" || kind === "vowels" ? (unit.letters ?? []) : [];
}

export function goalSize(unit: GoalUnit, kind: GoalKind): number {
  return kind === "letters" || kind === "vowels" ? (unit.letters ?? []).length : PLACES[kind];
}

export type GoalState = {
  /** One flag per place of the goal: filled (letter back, line written, sack counted …). */
  back: boolean[];
  /** Every lesson of the unit is done: the letter is sealed, the station finished. */
  complete: boolean;
};

export function goalState(
  unit: Unit,
  kind: GoalKind,
  done: (lesson: Lesson) => boolean,
): GoalState {
  const complete = unit.lessons.length > 0 && unit.lessons.every(done);
  if (kind === "letters" || kind === "vowels") {
    const collected = collectedLetters(unit, done);
    return { back: goalLetters(unit, kind).map((l) => collected.has(l)), complete };
  }
  const total = unit.lessons.length;
  const share = total ? unit.lessons.filter(done).length / total : 0;
  const filled = symbolsBack(PLACES[kind], share);
  return { back: Array.from({ length: PLACES[kind] }, (_, i) => i < filled), complete };
}

export type StoryStep = GoalState & {
  /** Index of the place this lesson filled, if any. */
  fresh: number | null;
  /** This lesson finished the unit: the letter is sealed, the station done. */
  completed: boolean;
};

/** What finishing one lesson does to the unit's goal in the story. */
export function storyStep(
  unit: Unit,
  kind: GoalKind,
  doneBefore: (lesson: Lesson) => boolean,
  lessonId: string,
): StoryStep {
  const before = goalState(unit, kind, doneBefore);
  const after = goalState(unit, kind, (l) => l.id === lessonId || doneBefore(l));
  const fresh = after.back.findIndex((b, i) => b && !before.back[i]);
  return {
    ...after,
    fresh: fresh < 0 ? null : fresh,
    completed: after.complete && !before.complete,
  };
}

/** Every letter learnt so far across a book's units: those whose sections are all done. */
export function learntLetters(units: Unit[], done: (lesson: Lesson) => boolean): Set<string> {
  const learnt = new Set<string>();
  for (const unit of units) for (const letter of collectedLetters(unit, done)) learnt.add(letter);
  return learnt;
}

/** The sidr tree's stage on the maths path: one more for every maths unit finished (0 to 5). */
export function treeStage(units: Unit[], done: (lesson: Lesson) => boolean): number {
  const finished = units.filter((u) => u.lessons.length > 0 && u.lessons.every(done)).length;
  return Math.min(5, Math.round((finished / Math.max(1, units.length)) * 5));
}
