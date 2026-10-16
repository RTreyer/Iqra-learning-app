import type { Lesson } from "@/content/types";

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
