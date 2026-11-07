/**
 * The English explanation mode, for adults who do not read Arabic (parents abroad, teachers,
 * reviewers), switched on with the menu language in the parents' corner:
 * - lines (what Hudhud and the app say and show: instructions, questions, titles, the story)
 *   are shown and spoken in English (content/translations/lines.ts);
 * - the learning itself stays Arabic (letters, syllables, words, sentences) and gets its
 *   English meaning, or for letters and syllables a Latin reading, small below it
 *   (content/translations/gloss.ts, lib/transliterate.ts).
 * A line built from parts ("حَاوِلْ مَرَّةً أُخْرَى، مَ") is translated part by part, so the
 * child's letter in it stays Arabic and is spoken with the Arabic voice.
 */

import { EN_GLOSS } from "@/content/translations/gloss";
import { EN_LINES } from "@/content/translations/lines";
import { numberToArabicWord } from "@/lib/arabicNumbers";
import { readingOf } from "@/lib/transliterate";

let english = false;

/** Set by the language context: the parents chose English menus. */
export function setExplainMode(on: boolean): void {
  english = on;
}

export function isExplainMode(): boolean {
  return english;
}

export type Part = { text: string; lang: "ar" | "en" };

const ARABIC = /[؀-ۿ]/;
/** Where a line is cut into parts when it has no translation as a whole. */
const PIECES = /(?<=[،:!؟.])\s+/;

const ENGLISH_NUMBERS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];
const NUMBER_OF = new Map(ENGLISH_NUMBERS.map((word, n) => [numberToArabicWord(n), n]));

/** Lines made by code rather than written: the spoken sums, a number on its own. */
function dynamicLine(text: string): string | undefined {
  const sum = text.match(/^(\S+) (زَائِد|نَاقِص) (\S+) يُسَاوِي كَمْ؟$/);
  if (sum && NUMBER_OF.has(sum[1]) && NUMBER_OF.has(sum[3]))
    return `${ENGLISH_NUMBERS[NUMBER_OF.get(sum[1])!]} ${sum[2] === "زَائِد" ? "plus" : "minus"} ${ENGLISH_NUMBERS[NUMBER_OF.get(sum[3])!]} makes how many?`;
  const n = NUMBER_OF.get(text);
  return n === undefined ? undefined : ENGLISH_NUMBERS[n];
}

/** The English of one line or part, keeping a trailing comma or colon. */
function lookup(text: string): string | undefined {
  const trimmed = text.trim();
  const direct = EN_LINES[trimmed] ?? dynamicLine(trimmed);
  if (direct) return direct;
  const tail = trimmed.match(/[،:]$/);
  if (!tail) return undefined;
  const english = EN_LINES[trimmed.slice(0, -1).trim()];
  return english ? `${english}${tail[0] === "،" ? "," : ":"}` : undefined;
}

/** A line as shown and spoken now: one part in Arabic, or English parts around Arabic ones. */
export function lineParts(text: string): Part[] {
  if (!english || !ARABIC.test(text)) return [{ text, lang: english ? "en" : "ar" }];
  // Learning content is never replaced, even where it also serves as a title.
  if (EN_GLOSS[text.trim()]) return [{ text, lang: "ar" }];
  const whole = lookup(text);
  if (whole) return [{ text: whole, lang: "en" }];
  const parts: Part[] = text.split(PIECES).map((piece) => {
    const english = lookup(piece);
    if (english) return { text: english, lang: "en" };
    return { text: piece, lang: ARABIC.test(piece) ? "ar" : "en" };
  });
  // Neighbours in the same language are spoken in one go.
  return parts.reduce<Part[]>((merged, part) => {
    const last = merged[merged.length - 1];
    if (last && last.lang === part.lang) last.text = `${last.text} ${part.text}`;
    else merged.push({ ...part });
    return merged;
  }, []);
}

/** A line as shown on screen in the current mode. */
export function explainLine(text: string): string {
  const parts = lineParts(text);
  const shown = parts.map((part) => part.text).join(" ");
  // English reads left to right even inside the app's right-to-left layout: isolate it, so
  // its full stop and question mark stay at its end.
  return parts.some((part) => part.lang === "en") && ARABIC.test(text)
    ? `\u2066${shown}\u2069`
    : shown;
}

/**
 * What a piece of learning means, shown small below it in English mode: the translation of a
 * word or sentence, or the Latin reading of a letter or syllable. Null in Arabic mode.
 */
export function gloss(text: string): string | null {
  if (!english || !ARABIC.test(text)) return null;
  const trimmed = text.trim();
  if (EN_GLOSS[trimmed]) return EN_GLOSS[trimmed];
  // A title in the reading text (a story's title) stays Arabic too, with its line as meaning.
  if (EN_LINES[trimmed]) return EN_LINES[trimmed];
  // Letters and syllables have no meaning of their own; their sound is what they teach.
  return [...trimmed.replace(/[ً-ْـ]/g, "")].length <= 3 ? readingOf(trimmed) : null;
}
