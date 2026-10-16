/** Unified content model shared by every subject, book, unit and lesson. */

export type Subject = "arabic" | "math" | "science";

/** Single source of subject colors; theme/tokens.ts re-exports them as `subjects`. */
export const SUBJECT_COLORS: Record<Subject, string> = {
  arabic: "#2563EB",
  math: "#7C3AED",
  science: "#059669",
};

export type Choice = { emoji: string; word: string };

export type LessonBase = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
};

export type StoryLine = { text: string; emoji: string };
export type LetterPickRound = { targetLetter: string; letters: string[]; correctIndex: number };
export type WordReadRound = { word: string; choices: string[]; correctIndex: number };
export type ListenPickQuestion = { word: string; choices: Choice[]; correctIndex: number };
export type BehaviorItem = { emoji: string; description: string; isCorrect: boolean };
export type MatchPair = { left: Choice; right: Choice };
/** `emoji` is optional decoration carried over from the legacy drawing shapes. */
export type TraceTarget = {
  guide: string;
  label: string;
  tts: string;
  strokeCount?: number;
  emoji?: string;
};
export type CountingRound = { emoji: string; count: number; options: number[] };
export type ArithmeticRound = { a: number; b: number; op: "+" | "-"; options: number[] };

export type LessonBody =
  | { type: "story"; storyTitle: string; lines: StoryLine[] }
  | { type: "naming"; items: Choice[] }
  | { type: "letter_pick"; rounds: LetterPickRound[] }
  | { type: "word_read"; rounds: WordReadRound[] }
  | { type: "listen_pick"; questions: ListenPickQuestion[] }
  | { type: "behavior"; behaviors: BehaviorItem[] }
  | { type: "matching"; pairs: MatchPair[] }
  | { type: "trace"; targets: TraceTarget[] }
  | { type: "counting"; rounds: CountingRound[] }
  | { type: "arithmetic"; rounds: ArithmeticRound[] };

export type LessonType = LessonBody["type"];

export type Lesson = LessonBase & LessonBody;

export type Unit = {
  id: string;
  number: number;
  title: string;
  theme: string;
  emoji: string;
  color: string;
  badgeLabel: string;
  /** Letters introduced by the unit (Arabic units 2 to 8). */
  letters?: string[];
  lessons: Lesson[];
};

export type Book = {
  id: string;
  subject: Subject;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  available: boolean;
  units: Unit[];
};
