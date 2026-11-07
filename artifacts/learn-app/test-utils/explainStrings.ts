/**
 * Every Arabic text the English explanation mode (lib/explain.ts) has to cover, in two kinds:
 * - lines: what Hudhud and the app say and show about the learning (instructions, prompts,
 *   titles, the story); in English mode they are shown and spoken in English;
 * - glosses: the learning itself (words, sentences); they stay Arabic, with English below.
 * Letters, syllables and tracing guides are neither: they are what the child learns to read.
 * Used by the completeness test and to list the texts for translation.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { books } from "../content/catalog.ts";
import { DEMOS, DEMO_END, DEMO_START } from "../content/demos.ts";
import { ACTIVITY_INSTRUCTIONS } from "../content/instructions.ts";
import * as story from "../content/story.ts";
import { translateUi } from "../content/ui-translations.ts";
import { STICKERS } from "../lib/stickers.ts";

const ARABIC = /[؀-ۿ]/;
const LINE_FIELDS = new Set([
  "title",
  "subtitle",
  "section",
  "storyTitle",
  "prompt",
  "tts",
  "label",
  "theme",
  "badgeLabel",
  "to",
]);
const GLOSS_FIELDS = new Set(["text", "word", "description", "choices", "sentence"]);

/** "مَ - مَا", "يَ  يَا  يُ  يُو", "مـ ، ـمـ": a row of letters or syllables, nothing to translate. */
export function isLetterRow(text: string): boolean {
  // Marks or digits alone (code constants) carry nothing to translate either.
  if (!/[ء-ي]/.test(text)) return true;
  const bare = text.replace(/[ً-ْٰـ]/g, "");
  const tokens = bare.split(/[\s،,\-←→/:]+/).filter(Boolean);
  return tokens.length > 0 && tokens.every((t) => t.length <= 2);
}

function walk(value: unknown, field: string, lines: Set<string>, gloss: Set<string>): void {
  if (Array.isArray(value)) return value.forEach((v) => walk(v, field, lines, gloss));
  if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value)) walk(v, key, lines, gloss);
    return;
  }
  if (typeof value !== "string" || !ARABIC.test(value)) return;
  const text = value.trim();
  if (LINE_FIELDS.has(field) && !isLetterRow(text)) lines.add(text);
  else if (GLOSS_FIELDS.has(field) && !isLetterRow(text)) gloss.add(text);
}

/** Every string value in a module's exports (the story's lines and their builders' results). */
function strings(value: unknown, out: Set<string>): void {
  if (typeof value === "string") {
    if (ARABIC.test(value)) out.add(value.trim());
  } else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => strings(v, out));
}

/** The pieces a line is split into when it is not translated as a whole (lib/explain.ts). */
export const PIECES = /(?<=[،:!؟.])\s+/;

const SOURCE_DIRS = ["app", "components", "lib", "context", "hooks"];
const ROOT = typeof __dirname === "undefined" ? process.cwd() : path.resolve(__dirname, "..");

/** Arabic string literals in the app's code, and the fixed parts of its template strings. */
function codeLiterals(out: Set<string>): void {
  const files: string[] = [];
  const visit = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
    }
  };
  for (const dir of SOURCE_DIRS) visit(path.join(ROOT, dir));
  for (const file of files) {
    const source = fs
      .readFileSync(file, "utf8")
      // Comments mention texts as examples; only code counts.
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "")
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
    for (const match of source.matchAll(/"([^"\n]*)"|`([^`]*)`/g)) {
      const literal = match[1] ?? match[2] ?? "";
      for (const part of literal.split(/\$\{[^}]*\}/)) {
        const text = part.replace(/^[\s،:!.]+|[\s،:]+$/g, "").trim();
        if (text && ARABIC.test(text) && !isLetterRow(text)) out.add(text);
      }
    }
  }
}

export function collectExplainStrings(): { lines: string[]; gloss: string[] } {
  const lines = new Set<string>();
  const gloss = new Set<string>();
  for (const book of books) {
    walk({ title: book.title, subtitle: book.subtitle }, "", lines, gloss);
    for (const unit of book.units) {
      walk(
        {
          title: unit.title,
          theme: unit.theme,
          badgeLabel: unit.badgeLabel,
          recipient: unit.recipient,
        },
        "",
        lines,
        gloss,
      );
      for (const lesson of unit.lessons) walk(lesson, "", lines, gloss);
      const kind = story.GOAL_LINES && unit.goal;
      if (kind) {
        lines.add(story.finishLine(unit, kind));
        lines.add(story.goalLine(unit, kind, true));
      }
    }
  }
  for (const demo of Object.values(DEMOS)) {
    walk(demo.lesson, "", lines, gloss);
    for (const step of demo.steps) if ("say" in step) lines.add(step.say.trim());
  }
  strings([DEMO_START, DEMO_END], lines);
  strings(story.INTRO_STORY, lines);
  strings(story.SUBJECT_LINES, lines);
  strings(story.GOAL_LINES, lines);
  strings(story.SUBJECT_DONE, lines);
  strings(ACTIVITY_INSTRUCTIONS, lines);
  for (const sticker of STICKERS) {
    lines.add(sticker.name);
    lines.add(story.giftLine(sticker.name));
  }
  codeLiterals(lines);
  // Menu labels already have their English (content/ui-translations.ts).
  for (const text of [...lines]) if (!ARABIC.test(translateUi(text, "en"))) lines.delete(text);
  // A learning word is never replaced: it stays Arabic and gets a gloss.
  for (const text of gloss) lines.delete(text);
  return { lines: [...lines].sort(), gloss: [...gloss].sort() };
}
