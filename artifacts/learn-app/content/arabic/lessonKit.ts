import type {
  ArtId,
  BuildWordRound,
  LetterPickRound,
  Lesson,
  ListenPickQuestion,
  MatchPair,
  SceneId,
  StoryLine,
  TraceTarget,
  WordReadRound,
} from "../types";

// Building blocks for the Arabic units rebuilt from أَقْرَأُ وَأَتَعَلَّمُ (Units 3 onwards):
// each textbook lesson (one letter, one story) becomes a fixed run of app lessons.

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
/** A lesson before `numberLessons` gives it its id and position. */
export type LessonDraft = DistributiveOmit<Lesson, "id" | "number">;

export const COLOR = "#2563EB";
export const EXERCISES = "تَدْرِيبَات";

export type LetterLesson = {
  letter: string;
  /** The letter with fatha, spoken when the child writes it. */
  sound: string;
  storyTitle: string;
  scene?: ArtId;
  /** The book's story picture, redrawn wide (components/art/scenes). */
  picture?: SceneId;
  lines: StoryLine[];
  /** Syllables of the letter heard without their text; the child picks the vowel. */
  vowels: WordReadRound[];
  /** The book's split words (بَ / يَا / نُ → بَيَانُ) as the syllable train. */
  train: BuildWordRound[];
  /** The book's "match the split word to the word" exercise (Unit 4 onwards). */
  matching?: MatchPair[];
  /** The book's "fill in the missing syllable" exercise (Unit 6 onwards): trains with `given` wagons. */
  fill?: BuildWordRound[];
  sightWords: WordReadRound[];
  forms: string[];
  /** The book's word writing page: [as printed, as spoken]. */
  words: [string, string][];
};

/**
 * One textbook lesson as app lessons: story, "which vowel do you hear?", syllable train,
 * syllables to words and the missing syllable (when given), sight words, writing the letter, writing whole words.
 */
export function letterLessons(l: LetterLesson): LessonDraft[] {
  const section = `${l.letter} · ${l.storyTitle}`;
  const forms: TraceTarget[] = l.forms.map((form) => ({ guide: form, label: form, tts: l.sound }));
  const words: TraceTarget[] = l.words.map(([guide, tts]) => ({ guide, label: tts, tts }));
  const lessons: LessonDraft[] = [
    {
      section,
      type: "story",
      title: "أَقْرَأُ الْقِصَّة",
      subtitle: l.storyTitle,
      emoji: "📖",
      color: COLOR,
      storyTitle: l.storyTitle,
      scene: l.scene,
      picture: l.picture,
      lines: l.lines,
    },
    {
      section,
      type: "word_read",
      title: "أَسْمَعُ الْحَرَكَة",
      subtitle: l.vowels.map((r) => r.word).join("  "),
      emoji: "👂",
      color: "#DB2777",
      rounds: l.vowels,
    },
    {
      section,
      type: "build_word",
      title: "قِطَارُ الْمَقَاطِع",
      subtitle: "اسمع الكلمة وحمّل القطار",
      emoji: "🚂",
      color: "#EA580C",
      rounds: l.train,
    },
  ];
  if (l.matching)
    lessons.push({
      section,
      type: "matching",
      title: "أَصِلُ الْمَقَاطِعَ بِالْكَلِمَة",
      subtitle: "مقاطع ← كلمة",
      emoji: "🔗",
      color: "#0891B2",
      pairs: l.matching,
    });
  if (l.fill)
    lessons.push({
      section,
      type: "build_word",
      title: "أُكْمِلُ الْكَلِمَة",
      subtitle: "المقطع الناقص",
      emoji: "🧩",
      color: "#EA580C",
      rounds: l.fill,
    });
  lessons.push(
    {
      section,
      type: "word_read",
      title: "أَقْرَأُ الْكَلِمَات",
      subtitle: "اسمع الكلمة واختر الصواب",
      emoji: "👁️",
      color: "#D97706",
      rounds: l.sightWords,
    },
    {
      section,
      type: "trace",
      title: "أَكْتُبُ الْحَرْف",
      subtitle: l.forms.join("  ،  "),
      emoji: "✍️",
      color: "#7C3AED",
      targets: forms,
    },
    {
      section,
      type: "trace",
      title: "أَكْتُبُ الْكَلِمَات",
      subtitle: l.words.map(([guide]) => guide).join("  ،  "),
      emoji: "📝",
      color: "#7C3AED",
      targets: words,
    },
  );
  return lessons;
}

/** Ids `${prefix}-1`, `${prefix}-2`, ... and numbers in unit order. */
export function numberLessons(prefix: string, drafts: LessonDraft[]): Lesson[] {
  return drafts.map(
    (draft, i) => ({ ...draft, id: `${prefix}-${i + 1}`, number: i + 1 }) as Lesson,
  );
}

/** Round where `target` is among `letters`; the correct index is found, not typed. */
export const pick = (target: string, letters: string[]): LetterPickRound => ({
  targetLetter: target,
  letters,
  correctIndex: letters.indexOf(target),
});

export const read = (word: string, choices: string[]): WordReadRound => ({
  word,
  choices,
  correctIndex: choices.indexOf(word),
});

export const train = (
  word: string,
  syllables: string[],
  extras: string[],
  emoji?: string,
): BuildWordRound => ({ word, syllables, extras, emoji });

/** The book prints split words with slashes: "مُـ/رَا/دُ" → "مُرَادُ". */
export const split = (syllables: string, word: string): MatchPair => ({
  left: { emoji: "", word: syllables.split("/").join(" / ") },
  right: { emoji: "", word },
});

/** "First sound" question; the answer is listed first and shuffled on screen. */
export const firstSound = (word: string, answer: string, others: string[]): ListenPickQuestion => ({
  word,
  choices: [answer, ...others].map((s) => ({ emoji: "", word: s })),
  correctIndex: 0,
});

/** "Fill in the missing syllable": the wagons at `given` start full, the child loads the rest. */
export const gap = (
  word: string,
  syllables: string[],
  given: number[],
  extras: string[],
  emoji?: string,
): BuildWordRound => ({ word, syllables, extras, given, emoji });

/**
 * The book's sentence copying (أَنَا أَكْتُبُ, Unit 7 onwards) as two lessons: load the words
 * into the train in order, then write them one by one while the sentence fills in.
 * `words` are [as printed, as spoken]; `extras` are decoy words for the train.
 */
export function sentenceLessons(
  words: [string, string][],
  extras: string[],
  emoji?: string,
): LessonDraft[] {
  const sentence = words.map(([, spoken]) => spoken).join(" ");
  return [
    {
      section: EXERCISES,
      type: "build_word",
      title: "قِطَارُ الْجُمْلَة",
      subtitle: sentence,
      emoji: "🚂",
      color: "#EA580C",
      rounds: [
        train(
          sentence,
          words.map(([, spoken]) => spoken),
          extras,
          emoji,
        ),
      ],
    },
    {
      section: EXERCISES,
      type: "trace",
      title: "أَكْتُبُ الْجُمْلَة",
      subtitle: words.map(([printed]) => printed).join(" "),
      emoji: "📝",
      color: "#7C3AED",
      sentence,
      targets: words.map(([guide, tts]) => ({ guide, label: tts, tts })),
    },
  ];
}
