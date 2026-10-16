import { numberToArabicWord, toArabicDigits } from "@/lib/arabicNumbers";

/** Counting question, shown and spoken as is. */
export const COUNT_PROMPT = "كَمْ عَدَدُهَا؟";

/** Result of `a op b`. */
export function answerOf({ a, b, op }: { a: number; b: number; op: "+" | "-" }): number {
  return op === "+" ? a + b : a - b;
}

/**
 * Arithmetic question: `shown` uses Eastern Arabic digits and symbols, `spoken` reads it
 * as the textbook does, e.g. "ثَلاثَة زَائِد اثْنَان يُسَاوِي كَمْ؟".
 */
export function arithmeticPrompt(a: number, op: "+" | "-", b: number): { shown: string; spoken: string } {
  return {
    shown: `${toArabicDigits(a)} ${op} ${toArabicDigits(b)} = ؟`,
    spoken: `${numberToArabicWord(a)} ${op === "+" ? "زَائِد" : "نَاقِص"} ${numberToArabicWord(b)} يُسَاوِي كَمْ؟`,
  };
}
