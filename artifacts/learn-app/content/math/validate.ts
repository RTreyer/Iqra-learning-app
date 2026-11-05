import type { MathPic, PictureChoiceRound } from "../types.ts";

// Pure checks of math rounds, used by Jest and by scripts/content.test.mjs on the catalog.
// Each returns the problems found; [] means valid.

export function checkPrompt(prompt: string): string[] {
  return prompt.trim() ? [] : ["empty prompt"];
}

export const MAX_CHOICES = 4;

/** Quarter shading is drawn as the top right 50x50 square, which only fits circle, square, rectangle. */
export function checkPic(pic: MathPic): string[] {
  return "shape" in pic && pic.shape === "triangle" && pic.shaded === "quarter"
    ? ["quarter not allowed on a triangle"]
    : [];
}

export function validatePictureChoice(round: PictureChoiceRound): string[] {
  const problems = checkPrompt(round.prompt);
  const n = round.choices.length;
  if (n < 2 || n > MAX_CHOICES) problems.push("needs 2 to 4 choices");
  if (round.correctIndex < 0 || round.correctIndex >= n) problems.push("correctIndex out of range");
  if (round.choices.some((c) => c.length === 0)) problems.push("empty choice");
  if (round.model) problems.push(...checkPic(round.model));
  for (const choice of round.choices) for (const pic of choice) problems.push(...checkPic(pic));
  return problems;
}
