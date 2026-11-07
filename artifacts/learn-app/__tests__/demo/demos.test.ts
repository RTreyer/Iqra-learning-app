import { books } from "@/content";
import { DEMOS, DEMO_END, DEMO_START } from "@/content/demos";
import {
  validateCompare,
  validateNumberFill,
  validatePictureChoice,
  validateSort,
} from "@/content/math/validate";
import type { Lesson, LessonType } from "@/content/types";

const lessons = books.flatMap((b) => b.units.flatMap((u) => u.lessons));
const types = Object.keys(DEMOS) as LessonType[];

/** The rounds or items a child answers in a lesson, as comparable strings. */
function tasks(lesson: Lesson): string[] {
  const { id, number, title, subtitle, emoji, color, section, type, ...body } = lesson;
  void [id, number, title, subtitle, emoji, color, section, type];
  const lists = Object.values(body).filter(Array.isArray) as unknown[][];
  return lists.flat().map((task) => JSON.stringify(task));
}

test("every activity type has a demo of its own type", () => {
  for (const type of types) expect(DEMOS[type].lesson.type).toBe(type);
});

test("no demo shows a task the child will be asked in a lesson", () => {
  for (const type of types) {
    const asked = new Set(lessons.filter((l) => l.type === type).flatMap(tasks));
    const shown = tasks(DEMOS[type].lesson).filter((task) => asked.has(task));
    expect({ type, shown }).toEqual({ type, shown: [] });
  }
});

test("maths demos are valid rounds", () => {
  const { picture_choice, compare, number_fill, sort } = DEMOS;
  expect(picture_choice.lesson.rounds.flatMap(validatePictureChoice)).toEqual([]);
  expect(compare.lesson.rounds.flatMap(validateCompare)).toEqual([]);
  expect(number_fill.lesson.rounds.flatMap(validateNumberFill)).toEqual([]);
  expect(validateSort(sort.lesson)).toEqual([]);
});

test("everything the demos say is vocalised Arabic the voice can read", () => {
  const said = [DEMO_START, DEMO_END, ...types.flatMap((t) => DEMOS[t].steps)].flatMap((s) =>
    typeof s === "string" ? [s] : "say" in s ? [s.say] : [],
  );
  for (const text of said) {
    expect(text).toMatch(/[ً-ْ]/);
    expect(text).not.toMatch(/[A-Za-z0-9✓✗]/);
  }
});

test("every demo does something: at least one tap or trace", () => {
  for (const type of types) {
    expect(DEMOS[type].steps.some((s) => "tap" in s || "trace" in s)).toBe(true);
  }
});
