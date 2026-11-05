import type { PictureChoiceRound } from "../types.ts";

// Pure checks of math rounds, used by Jest and by scripts/content.test.mjs on the catalog.
// Each returns the problems found; [] means valid.

export function checkPrompt(prompt: string): string[] {
  return prompt.trim() ? [] : ["empty prompt"];
}

export function validatePictureChoice(round: PictureChoiceRound): string[] {
  const problems = checkPrompt(round.prompt);
  const n = round.choices.length;
  if (n < 2 || n > 4) problems.push("needs 2 to 4 choices");
  if (round.correctIndex < 0 || round.correctIndex >= n) problems.push("correctIndex out of range");
  if (round.choices.some((c) => c.length === 0)) problems.push("empty choice");
  return problems;
}
