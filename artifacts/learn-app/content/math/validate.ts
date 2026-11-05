import type {
  CompareRound,
  CompareSide,
  MathPic,
  NumberFillRound,
  PictureChoiceRound,
  SortBox,
  SortItem,
} from "../types.ts";
import { numberFillAnswer } from "./answers.ts";

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

function checkSide(side: CompareSide): string[] {
  if ("pics" in side) {
    if (side.pics.length === 0) return ["empty group"];
    return [
      ...(side.pics.length > 10 ? ["value outside 0 to 10"] : []),
      ...side.pics.flatMap(checkPic),
    ];
  }
  return side.number < 0 || side.number > 10 ? ["value outside 0 to 10"] : [];
}

export function validateCompare(round: CompareRound): string[] {
  return [...checkPrompt(round.prompt), ...checkSide(round.first), ...checkSide(round.second)];
}

export function validateNumberFill(round: NumberFillRound): string[] {
  const problems = [...checkPrompt(round.prompt), ...(round.pics ?? []).flatMap(checkPic)];
  if (round.layout !== "sequence" && (round.cells.length !== 5 || round.cells[3] !== "=")) {
    problems.push("row and vertical need a op b = c");
    return problems;
  }
  const answer = numberFillAnswer(round.cells);
  if (answer === null || answer < 0) problems.push("no answer or negative answer");
  const numbers = round.cells.filter((c): c is number => typeof c === "number");
  if (numbers.some((n) => n < 0)) problems.push("negative number");
  if (!round.options.includes(answer as number)) problems.push(`answer ${answer} not in options`);
  if (new Set(round.options).size !== round.options.length) problems.push("options not unique");
  return problems;
}

export function validateSort(lesson: {
  prompt: string;
  boxes: [SortBox, SortBox];
  items: SortItem[];
}): string[] {
  const problems = [...checkPrompt(lesson.prompt)];
  if (lesson.items.length < 2) problems.push("needs at least 2 items");
  if (!lesson.items.some((i) => i.box === 0) || !lesson.items.some((i) => i.box === 1))
    problems.push("both boxes must be used");
  if (lesson.boxes.some((b) => !b.label.trim())) problems.push("empty box label");
  for (const item of lesson.items) problems.push(...checkPic(item.pic));
  for (const box of lesson.boxes) if (box.pic) problems.push(...checkPic(box.pic));
  return problems;
}
