import { validatePictureChoice } from "@/content/math/validate";

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
