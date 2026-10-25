/** Unified content model shared by every subject, book, unit and lesson. */

export type Subject = "arabic" | "lughati" | "math" | "science";

/** Single source of subject colors; theme/tokens.ts re-exports them as `subjects`. */
export const SUBJECT_COLORS: Record<Subject, string> = {
  arabic: "#2563EB",
  lughati: "#EA580C",
  math: "#7C3AED",
  science: "#059669",
};

/**
 * Illustrations drawn in the app (components/art) for things emoji cannot show
 * the Yemeni way: tower houses, qamariya windows, dress, the jambiya.
 */
export type ArtId =
  | "house"
  | "qamariya"
  | "door"
  | "mosque"
  | "school"
  | "mother"
  | "father"
  | "boy"
  | "girl"
  | "dates"
  | "palm";

/**
 * Wide story pictures (16:10) redrawn from the textbook story page, one per story
 * (components/art/scenes). Described first in docs/content/textbooks, never copied.
 */
export type SceneId = "grocery" | "birdcage" | "kitchen" | "classroom" | "toothache" | "sickbed";

export type Choice = { emoji: string; word: string };

export type LessonBase = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  /** Group heading on the unit screen, e.g. the letter and story of a textbook lesson. */
  section?: string;
};

/** `art` replaces the emoji when set; the emoji stays as the fallback. */
export type StoryLine = { text: string; emoji: string; art?: ArtId };
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
/**
 * The child hears `word` and loads its `syllables` into a train in reading order;
 * `extras` are decoy tiles, usually the same letter with another vowel.
 */
export type BuildWordRound = {
  word: string;
  syllables: string[];
  extras: string[];
  /** Indices of syllables already in the train: the child only fills the gaps ("complete the word"). */
  given?: number[];
  emoji?: string;
};
export type CountingRound = { emoji: string; count: number; options: number[] };
export type ArithmeticRound = { a: number; b: number; op: "+" | "-"; options: number[] };

export type LessonBody =
  | {
      type: "story";
      storyTitle: string;
      lines: StoryLine[];
      scene?: ArtId;
      /** The book's story picture; shown instead of `scene` when set. */
      picture?: SceneId;
    }
  | { type: "naming"; items: Choice[] }
  | { type: "letter_pick"; rounds: LetterPickRound[] }
  | { type: "word_read"; rounds: WordReadRound[] }
  | { type: "listen_pick"; questions: ListenPickQuestion[] }
  | { type: "behavior"; behaviors: BehaviorItem[] }
  | { type: "matching"; pairs: MatchPair[] }
  | { type: "trace"; targets: TraceTarget[] }
  | { type: "build_word"; rounds: BuildWordRound[] }
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

/** A school grade on the home screen. A grade without books shows as "قريباً". */
export type Grade = {
  number: number;
  title: string;
  /** Picture and color of the grade card on the home screen. */
  emoji: string;
  color: string;
  books: Book[];
};
