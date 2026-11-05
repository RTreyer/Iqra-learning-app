import { toArabicDigits } from "../../lib/arabicNumbers.ts";
import type { Lesson, MathColor, MathPic, ShapeId } from "../types.ts";
import { SUBJECT_COLORS } from "../types.ts";

// Building blocks for the math units rebuilt from الرياضيات Part 1: each book lesson
// becomes a section of app lessons under the book's lesson code.

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
/** A lesson before `numberMathLessons` gives it its id and position. */
export type MathLessonDraft = DistributiveOmit<Lesson, "id" | "number">;

export const MATH_COLOR = SUBJECT_COLORS.math;

/** Ids `math-u{unit}-{n}`, numbered from 1 in order. */
export function numberMathLessons(unit: number, drafts: MathLessonDraft[]): Lesson[] {
  return drafts.map((d, i) => ({ ...d, id: `math-u${unit}-${i + 1}`, number: i + 1 }) as Lesson);
}

/** Section heading from the book lesson, e.g. "٢-١ · الأَعْدَادُ ١، ٢، ٣". */
export function bookSection(unit: number, lesson: number, title: string): string {
  return `${toArabicDigits(unit)}-${toArabicDigits(lesson)} · ${title}`;
}

export function pics(emoji: string, count: number): MathPic[] {
  return Array.from({ length: count }, () => ({ emoji }));
}

export function shape(id: ShapeId, color: MathColor, size?: "small" | "big"): MathPic {
  return size ? { shape: id, color, size } : { shape: id, color };
}
