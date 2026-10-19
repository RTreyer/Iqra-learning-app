import assert from "node:assert/strict";
import { test } from "node:test";
import { books, getBook, getLesson, getUnit, unitLessonIds } from "../content/index.ts";

const units = books.flatMap((book) => book.units);
const lessons = units.flatMap((unit) => unit.lessons);
const byType = (type) => lessons.filter((lesson) => lesson.type === type);

test("unit and lesson IDs are globally unique", () => {
  assert.equal(new Set(units.map((u) => u.id)).size, units.length);
  assert.equal(new Set(lessons.map((l) => l.id)).size, lessons.length);
});

test("every stored legacy lesson ID still exists", () => {
  for (let unit = 1; unit <= 8; unit++) {
    for (let n = 1; n <= 5; n++) assert.ok(getLesson(`u${unit}-${n}`), `u${unit}-${n}`);
  }
});

test("lesson numbers match their position in the unit", () => {
  for (const unit of units) {
    unit.lessons.forEach((lesson, i) => assert.equal(lesson.number, i + 1, lesson.id));
  }
});

test("books are the grade 1 to 6 books in order, with unique IDs", async () => {
  const { grades } = await import("../content/index.ts");
  assert.deepEqual(
    books.map((b) => b.id),
    grades.flatMap((g) => g.books.map((b) => b.id)),
  );
  assert.equal(new Set(books.map((b) => b.id)).size, books.length);
  assert.deepEqual(
    books.filter((b) => b.available).map((b) => b.id),
    ["arabic-1", "math-1"],
  );
});

test("every available book has lessons", () => {
  for (const book of books.filter((b) => b.available)) {
    assert.ok(
      book.units.some((u) => u.lessons.length > 0),
      book.id,
    );
  }
});

test("letter_pick answers point at the target letter", () => {
  for (const lesson of byType("letter_pick")) {
    for (const r of lesson.rounds) {
      assert.ok(r.correctIndex >= 0 && r.correctIndex < r.letters.length, lesson.id);
      assert.equal(r.letters[r.correctIndex], r.targetLetter, lesson.id);
    }
  }
});

test("word_read answers point at the word", () => {
  for (const lesson of byType("word_read")) {
    for (const r of lesson.rounds) {
      assert.ok(r.correctIndex >= 0 && r.correctIndex < r.choices.length, lesson.id);
      assert.equal(r.choices[r.correctIndex], r.word, lesson.id);
    }
  }
});

test("listen_pick answers are in range and are choices", () => {
  for (const lesson of byType("listen_pick")) {
    for (const q of lesson.questions) {
      assert.ok(q.correctIndex >= 0 && q.correctIndex < q.choices.length, lesson.id);
      const choice = q.choices[q.correctIndex];
      assert.equal(typeof choice.word, "string", lesson.id);
      assert.ok(choice.word.length > 0, lesson.id);
    }
  }
});

test("trace lessons have non empty targets", () => {
  for (const lesson of byType("trace")) {
    assert.ok(lesson.targets.length > 0, lesson.id);
    for (const t of lesson.targets) assert.ok(t.guide && t.label && t.tts, lesson.id);
  }
});

test("build_word syllables spell the word and every tile fits the train", () => {
  const letters = (s) => s.replace(/[ً-ْـ]/g, "");
  for (const lesson of byType("build_word")) {
    for (const r of lesson.rounds) {
      assert.ok(r.syllables.length >= 2 && r.syllables.length <= 4, `${lesson.id}: ${r.word}`);
      assert.ok(r.syllables.length + r.extras.length <= 6, `${lesson.id}: ${r.word}`);
      assert.equal(letters(r.syllables.join("")), letters(r.word), `${lesson.id}: ${r.word}`);
      for (const extra of r.extras)
        assert.ok(!r.syllables.includes(extra), `${lesson.id}: decoy ${extra} is in ${r.word}`);
    }
  }
});

test("counting answers are among the options", () => {
  for (const lesson of byType("counting")) {
    for (const r of lesson.rounds) assert.ok(r.options.includes(r.count), lesson.id);
  }
});

test("arithmetic results are non negative and among the options", () => {
  for (const lesson of byType("arithmetic")) {
    for (const r of lesson.rounds) {
      const result = r.op === "+" ? r.a + r.b : r.a - r.b;
      assert.ok(result >= 0, lesson.id);
      assert.ok(r.options.includes(result), lesson.id);
    }
  }
});

test("lookups resolve books, units, lessons and next lessons", () => {
  assert.equal(getBook("arabic-1")?.subject, "arabic");
  assert.equal(getBook("missing"), null);
  assert.equal(getUnit("a2")?.number, 2);
  assert.equal(getUnit("missing"), null);
  const found = getLesson("u2-1");
  assert.equal(found.book.id, "arabic-1");
  assert.equal(found.unit.id, "a2");
  assert.equal(found.next?.id, "u2-2");
  const last = getUnit("a1").lessons.at(-1);
  assert.equal(getLesson(last.id).next, null);
  assert.equal(getLesson("missing"), null);
  assert.deepEqual(unitLessonIds(getUnit("a1")), ["u1-1", "u1-2", "u1-3", "u1-4", "u1-5"]);
});

test("quiz options are unique within each round", () => {
  const unique = (values, id) =>
    assert.equal(new Set(values).size, values.length, `${id}: ${values.join(", ")}`);
  for (const lesson of byType("counting"))
    for (const r of lesson.rounds) unique(r.options, lesson.id);
  for (const lesson of byType("arithmetic"))
    for (const r of lesson.rounds) unique(r.options, lesson.id);
  for (const lesson of byType("letter_pick"))
    for (const r of lesson.rounds) unique(r.letters, lesson.id);
  for (const lesson of byType("word_read"))
    for (const r of lesson.rounds) unique(r.choices, lesson.id);
  for (const lesson of byType("listen_pick")) {
    for (const q of lesson.questions)
      unique(
        q.choices.map((c) => c.word),
        lesson.id,
      );
  }
});
