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
/** Ordered rows (ordinal numbers) show up to ten pictures. */
export const MAX_ORDERED_CHOICES = 10;
/** A pattern row ("what comes next?") shows 2 to 8 pictures and its empty slot on one line. */
export const MIN_PATTERN = 2;
export const MAX_PATTERN = 8;

/** Quarter shading is drawn as the top right 50x50 square, which only fits circle, square, rectangle. */
export function checkPic(pic: MathPic): string[] {
  return "shape" in pic && pic.shape === "triangle" && pic.shaded === "quarter"
    ? ["quarter not allowed on a triangle"]
    : [];
}

export function validatePictureChoice(round: PictureChoiceRound): string[] {
  const problems = checkPrompt(round.prompt);
  const n = round.choices.length;
  const max = round.ordered ? MAX_ORDERED_CHOICES : MAX_CHOICES;
  if (n < 2 || n > max) problems.push(`needs 2 to ${max} choices`);
  if (round.correctIndex < 0 || round.correctIndex >= n) problems.push("correctIndex out of range");
  if (round.choices.filter((c) => c.length === 0).length > 1)
    problems.push("more than one empty choice");
  if (round.model) problems.push(...checkPic(round.model));
  if (round.pattern) {
    const len = round.pattern.length;
    if (len < MIN_PATTERN || len > MAX_PATTERN)
      problems.push(`pattern needs ${MIN_PATTERN} to ${MAX_PATTERN} pictures`);
    for (const pic of round.pattern) problems.push(...checkPic(pic));
    if (round.model || round.ordered) problems.push("pattern cannot go with model or ordered");
  }
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
  if (round.layout === "sequence" && round.cells.some((c) => c !== "?" && typeof c !== "number"))
    problems.push("sequence cells must be numbers");
  const answer = numberFillAnswer(round.cells);
  if (answer === null || answer < 0) problems.push("no answer or negative answer");
  const whole = (n: number) => Number.isInteger(n) && n >= 0;
  if (round.options.length < 2 || round.options.length > MAX_CHOICES)
    problems.push("needs 2 to 4 options");
  if (!round.options.every(whole)) problems.push("options must be whole numbers 0 or more");
  if (!round.cells.every((c) => typeof c !== "number" || whole(c)))
    problems.push("cells must be whole numbers 0 or more");
  if (answer !== null && !round.options.includes(answer))
    problems.push(`answer ${answer} not in options`);
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
