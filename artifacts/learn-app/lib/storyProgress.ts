/**
 * Where a unit stands in Hudhud's story: which letters the child has collected back, and what a
 * finished lesson brought back (one more letter in his letter, one more sack counted).
 */

import type { Lesson, Unit } from "@/content/types";

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

/** How many of a goal's symbols are back at this share of the unit; all only when it is done. */
export function symbolsBack(count: number, share: number): number {
  if (share >= 1) return count;
  return Math.min(count - 1, Math.floor(share * count));
}

export type StoryStep = {
  /** Share of the unit done after the lesson. */
  share: number;
  /** Index of the letter or sack the lesson brought back, if any. */
  fresh: number | null;
  /** The lesson completed the unit: the letter is whole, the ship sails. */
  completed: boolean;
};

/** What finishing one lesson does to the unit's goal in the story. */
export function storyStep(
  symbols: number,
  total: number,
  doneBefore: number,
  lessonWasDone: boolean,
): StoryStep {
  const doneAfter = Math.min(total, doneBefore + (lessonWasDone ? 0 : 1));
  const before = symbolsBack(symbols, total ? doneBefore / total : 0);
  const after = symbolsBack(symbols, total ? doneAfter / total : 0);
  return {
    share: total ? doneAfter / total : 0,
    fresh: after > before ? after - 1 : null,
    completed: doneAfter === total && doneBefore < total,
  };
}
