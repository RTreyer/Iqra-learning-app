import { books } from "@/content";
import { ACTIVITY_INSTRUCTIONS, SPOKEN_PER_ROUND, instructionFor } from "@/content/instructions";
import type { LessonType } from "@/content/types";

const lessons = books.flatMap((book) => book.units.flatMap((unit) => unit.lessons));
const perRound: readonly LessonType[] = SPOKEN_PER_ROUND;

test("every lesson gets its task by voice: an instruction, or a spoken task per round", () => {
  const silent = lessons
    .filter((lesson) => !instructionFor(lesson) && !perRound.includes(lesson.type))
    .map((lesson) => `${lesson.id} (${lesson.type})`);
  expect(silent).toEqual([]);
});

test("maths lessons get no extra instruction, their rounds already speak the task", () => {
  for (const lesson of lessons.filter((l) => perRound.includes(l.type))) {
    expect(instructionFor(lesson)).toBeUndefined();
  }
});

test("instructions are vocalised Arabic sentences without symbols the voice cannot read", () => {
  for (const text of Object.values(ACTIVITY_INSTRUCTIONS)) {
    expect(text).toMatch(/[ً-ْ]/);
    expect(text).not.toMatch(/[A-Za-z0-9✓✗🔊🚂]/);
  }
});
