import { books } from "@/content";
import type { Choice, Lesson } from "@/content/types";

/** One reviewable piece of content, identified across the whole catalog. */
export type ReviewItem =
  | { id: string; kind: "letter"; targetLetter: string; letters: string[]; correctIndex: number }
  | { id: string; kind: "word"; word: string; choices: string[]; correctIndex: number }
  | { id: string; kind: "count"; emoji: string; count: number; options: number[] }
  | { id: string; kind: "calc"; a: number; b: number; op: "+" | "-"; options: number[] }
  | { id: string; kind: "question"; word: string; choices: Choice[]; correctIndex: number };

/** One item per round of a quiz lesson (repeats kept); [] for every other lesson type. */
export function itemsForLesson(lesson: Lesson): ReviewItem[] {
  switch (lesson.type) {
    case "letter_pick":
      return lesson.rounds.map((r) => ({ ...r, id: `letter:${r.targetLetter}`, kind: "letter" }));
    case "word_read":
      return lesson.rounds.map((r) => ({ ...r, id: `word:${r.word}`, kind: "word" }));
    case "counting":
      return lesson.rounds.map((r) => ({ ...r, id: `count:${r.count}`, kind: "count" }));
    case "arithmetic":
      return lesson.rounds.map((r) => ({ ...r, id: `calc:${r.a}${r.op}${r.b}`, kind: "calc" }));
    case "listen_pick":
      return lesson.questions.map((q, index) => ({ ...q, id: `q:${lesson.id}:${index}`, kind: "question" }));
    default:
      return [];
  }
}

/** Stable id of the item asked in one round of a quiz lesson, or null for non quiz lessons. */
export function itemIdFor(lesson: Lesson, roundIndex: number): string | null {
  switch (lesson.type) {
    case "letter_pick": {
      const round = lesson.rounds[roundIndex];
      return round ? `letter:${round.targetLetter}` : null;
    }
    case "word_read": {
      const round = lesson.rounds[roundIndex];
      return round ? `word:${round.word}` : null;
    }
    case "counting": {
      const round = lesson.rounds[roundIndex];
      return round ? `count:${round.count}` : null;
    }
    case "arithmetic": {
      const round = lesson.rounds[roundIndex];
      return round ? `calc:${round.a}${round.op}${round.b}` : null;
    }
    case "listen_pick":
      return lesson.questions[roundIndex] ? `q:${lesson.id}:${roundIndex}` : null;
    default:
      return null;
  }
}

let catalogItems: Map<string, ReviewItem> | null = null;

/** Every review item in the catalog by id, first occurrence wins. Built once on first use. */
export function allItems(): Map<string, ReviewItem> {
  if (catalogItems) return catalogItems;
  const map = new Map<string, ReviewItem>();
  for (const book of books) {
    for (const unit of book.units) {
      for (const lesson of unit.lessons) {
        for (const item of itemsForLesson(lesson)) {
          if (!map.has(item.id)) map.set(item.id, item);
        }
      }
    }
  }
  catalogItems = map;
  return map;
}
