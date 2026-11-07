import { books } from "@/content";
import { DEMOS, DEMO_END, DEMO_IDS, DEMO_START, demoIdFor } from "@/content/demos";
import {
  validateCompare,
  validateNumberFill,
  validatePictureChoice,
  validateSort,
} from "@/content/math/validate";
import type { Lesson, LessonType } from "@/content/types";

const lessons = books.flatMap((b) => b.units.flatMap((u) => u.lessons));
const types = Object.keys(DEMOS).filter((id) => id !== "trace_lines") as LessonType[];

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
  for (const id of DEMO_IDS) {
    const { lesson } = DEMOS[id];
    const asked = new Set(lessons.filter((l) => l.type === lesson.type).flatMap(tasks));
    const shown = tasks(lesson).filter((task) => asked.has(task));
    expect({ id, shown }).toEqual({ id, shown: [] });
  }
});

test("lessons that trace lines get the line demo; letters and digits get the letter demo", () => {
  const traces = lessons.filter((l) => l.type === "trace");
  expect(demoIdFor(traces.find((l) => l.id === "u1-5")!)).toBe("trace_lines");
  const others = traces.filter((l) => l.id !== "u1-5").map(demoIdFor);
  expect(new Set(others)).toEqual(new Set(["trace"]));
  for (const lesson of lessons.filter((l) => l.type !== "trace"))
    expect(demoIdFor(lesson)).toBe(lesson.type);
});

test("maths demos are valid rounds", () => {
  const { picture_choice, compare, number_fill, sort } = DEMOS;
  expect(picture_choice.lesson.rounds.flatMap(validatePictureChoice)).toEqual([]);
  expect(compare.lesson.rounds.flatMap(validateCompare)).toEqual([]);
  expect(number_fill.lesson.rounds.flatMap(validateNumberFill)).toEqual([]);
  expect(validateSort(sort.lesson)).toEqual([]);
});

test("everything the demos say is vocalised Arabic the voice can read", () => {
  const said = [DEMO_START, DEMO_END, ...DEMO_IDS.flatMap((id) => DEMOS[id].steps)].flatMap((s) =>
    typeof s === "string" ? [s] : "say" in s ? [s.say] : [],
  );
  for (const text of said) {
    expect(text).toMatch(/[ً-ْ]/);
    expect(text).not.toMatch(/[A-Za-z0-9✓✗]/);
  }
});

test("every demo does something: at least one tap or trace", () => {
  for (const id of DEMO_IDS) {
    expect(DEMOS[id].steps.some((s) => "tap" in s || "trace" in s)).toBe(true);
  }
});
