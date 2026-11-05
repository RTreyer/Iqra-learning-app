import {
  checkPic,
  validateCompare,
  validateNumberFill,
  validatePictureChoice,
} from "@/content/math/validate";

const apple = { emoji: "🍎" };

test("a valid picture choice round has no problems", () => {
  expect(
    validatePictureChoice({
      prompt: "أَيُّهَا أَكْثَرُ؟",
      choices: [[apple], [apple, apple]],
      correctIndex: 1,
    }),
  ).toEqual([]);
});

test("picture choice problems are reported", () => {
  expect(validatePictureChoice({ prompt: "", choices: [[apple]], correctIndex: 3 })).toEqual([
    "empty prompt",
    "needs 2 to 4 choices",
    "correctIndex out of range",
  ]);
  expect(validatePictureChoice({ prompt: "x", choices: [[apple], []], correctIndex: 0 })).toEqual([
    "empty choice",
  ]);
});

test("quarter shading is not allowed on a triangle", () => {
  const tri = { shape: "triangle", color: "red", shaded: "quarter" } as const;
  expect(checkPic(tri)).toEqual(["quarter not allowed on a triangle"]);
  expect(checkPic({ ...tri, shaded: "half" })).toEqual([]);
  expect(
    validatePictureChoice({ prompt: "x", model: tri, choices: [[apple], [tri]], correctIndex: 0 }),
  ).toEqual(["quarter not allowed on a triangle", "quarter not allowed on a triangle"]);
});

test("compare sides must be non empty and within 0 to 10", () => {
  expect(
    validateCompare({ prompt: "x", first: { number: 3 }, second: { number: 10 }, mode: "symbols" }),
  ).toEqual([]);
  expect(
    validateCompare({ prompt: "x", first: { pics: [] }, second: { number: 11 }, mode: "words" }),
  ).toEqual(["empty group", "value outside 0 to 10"]);
});

test("compare runs the picture checks on every pic of a side", () => {
  const bad = { shape: "triangle" as const, color: "red" as const, shaded: "quarter" as const };
  expect(
    validateCompare({ prompt: "x", first: { pics: [bad] }, second: { number: 1 }, mode: "words" }),
  ).toEqual(["quarter not allowed on a triangle"]);
});

test("number fill needs a solvable sentence whose answer is an option", () => {
  expect(
    validateNumberFill({
      prompt: "x",
      cells: [3, "+", "?", "=", 5],
      layout: "row",
      options: [1, 2, 3],
    }),
  ).toEqual([]);
  expect(
    validateNumberFill({
      prompt: "x",
      cells: [3, "+", "?", "=", 5],
      layout: "row",
      options: [1, 3, 3],
    }),
  ).toEqual(["answer 2 not in options", "options not unique"]);
  expect(
    validateNumberFill({ prompt: "x", cells: [3, "?", 5], layout: "row", options: [4] }),
  ).toEqual(["row and vertical need a op b = c"]);
  expect(
    validateNumberFill({
      prompt: "x",
      cells: [5, "-", 7, "=", "?"],
      layout: "vertical",
      options: [2],
    }),
  ).toEqual(["no answer or negative answer", "answer -2 not in options"]);
  expect(
    validateNumberFill({
      prompt: "x",
      cells: [3, "+", "?", "=", 5],
      layout: "row",
      options: [2, 3],
      pics: [{ shape: "triangle", color: "red", shaded: "quarter" }],
    }),
  ).toEqual(["quarter not allowed on a triangle"]);
});
