// LEGACY: superseded by content/*, deleted in Task 4.4
/**
 * Lesson content data — Yemen MoE Grade 1.
 * Arrays are intentionally empty — content will be added subject by subject.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type VocabWord = {
  word: string;
  emoji: string;
};

export type ReadingLesson = {
  id: string;
  bookId?: string;
  unit: string;
  title: string;
  letter: string;
  storyText: string;
  fullStory: string;
  vocabulary: VocabWord[];
  exampleWord: string;
  wordMeaning: string;
  emoji: string;
  ttsLetter: string;
  ttsWord: string;
  ttsQuestion: string;
  options: string[];
  answer: string;
  stars: number;
};

export type WritingLesson = {
  id: string;
  title: string;
  letter: string;
  emoji: string;
  strokeCount: number;
  strokes: string[];
  ttsLearn: string;
  stars: number;
};

export type MathLesson = {
  id: string;
  title: string;
  type: "counting" | "addition" | "subtraction";
  ttsLearn: string;
  ttsQuestion: string;
  countEmoji?: string;
  count?: number;
  num1?: number;
  num2?: number;
  operator?: "+" | "-";
  answer: number;
  options: number[];
  stars: number;
};

// ── Data — to be filled step by step ──────────────────────────────────────────

export const readingLessons: ReadingLesson[] = [];

export const writingLessons: WritingLesson[] = [];

export const mathLessons: MathLesson[] = [];
