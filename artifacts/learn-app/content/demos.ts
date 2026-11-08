import { toArabicDigits } from "../lib/arabicNumbers.ts";
import { groupLabel } from "./math/picLabel.ts";
import type { Lesson, LessonType, MathPic } from "./types.ts";

/**
 * Worked examples: before a child plays an activity type for the first time, a hand shows
 * how it works on an example of its own, while the voice says what it does. The example
 * is not a lesson round and never counts. Each step is spoken (`say`), or the hand taps
 * an element (`tap`) or traces the letter on the pad (`trace`). Elements are found by
 * their testID or accessibility label, so a demo plays the real activity.
 *
 * All Arabic here is spoken; it is vocalised for the TTS voice and needs the same native
 * speaker review as the lessons (docs/VOICE.md).
 */

export type DemoTarget = { testID: string } | { label: string };
/** A point on the tracing pad as a share of its side, 0 to 1. */
export type PadPoint = { x: number; y: number };
/** `path` traces a drawn line; without it the hand follows the letter's guide. */
export type DemoStep =
  { say: string } | { tap: DemoTarget } | { trace: DemoTarget; path?: PadPoint[] };
export type Demo<T extends LessonType = LessonType> = {
  lesson: Extract<Lesson, { type: T }>;
  steps: DemoStep[];
};

/** Spoken before the example starts, and once it is done. */
export const DEMO_START = "اُنْظُرْ، سَأُرِيكَ مِثَالًا.";
export const DEMO_END = "اَلْآنَ دَوْرُكَ!";

/** Before a Continue or Next button: its label is chrome and may be English. */
const THEN_HERE = "ثُمَّ أَضْغَطُ هُنَا.";

const base = (type: string) => ({
  id: `demo-${type}`,
  number: 0,
  title: "مِثَالٌ",
  subtitle: "",
  emoji: "👆",
  color: "#2563EB",
});

const tap = (testID: string): DemoStep => ({ tap: { testID } });
const tapLabel = (label: string): DemoStep => ({ tap: { label } });
const say = (text: string): DemoStep => ({ say: text });
const tapNumber = (n: number): DemoStep => tapLabel(toArabicDigits(n));
const tapPics = (pics: MathPic[]): DemoStep => tapLabel(groupLabel(pics));

const oranges = (n: number): MathPic[] => Array.from({ length: n }, () => ({ emoji: "🍊" }));

/**
 * One demo per activity type, plus a second tracing demo: the Unit 1 lessons trace lines,
 * not letters, and get a line of their own.
 */
export const DEMOS: { [K in LessonType]: Demo<K> } & { trace_lines: Demo<"trace"> } = {
  story: {
    lesson: {
      ...base("story"),
      type: "story",
      storyTitle: "فِي الْحَدِيقَةِ",
      lines: [
        { text: "هٰذِهِ شَجَرَةٌ كَبِيرَةٌ.", emoji: "🌳" },
        { text: "وَهٰذِهِ وَرْدَةٌ حَمْرَاءُ.", emoji: "🌹" },
      ],
    },
    steps: [
      say("أَضْغَطُ عَلَى كُلِّ جُمْلَةٍ، فَأَسْمَعُهَا."),
      tap("story-line-0"),
      tap("story-line-1"),
      say(THEN_HERE),
      tap("activity-done"),
    ],
  },
  naming: {
    lesson: {
      ...base("naming"),
      type: "naming",
      items: [
        { emoji: "🌙", word: "قَمَرٌ" },
        { emoji: "☀️", word: "شَمْسٌ" },
      ],
    },
    steps: [
      say("أَضْغَطُ عَلَى كُلِّ صُورَةٍ، فَأَسْمَعُ اسْمَهَا."),
      tap("naming-item-0"),
      tap("naming-item-1"),
      say(THEN_HERE),
      tap("activity-done"),
    ],
  },
  letter_pick: {
    lesson: {
      ...base("letter_pick"),
      type: "letter_pick",
      rounds: [{ targetLetter: "ل", letters: ["ن", "ل", "ك"], correctIndex: 1 }],
    },
    steps: [say("أَسْمَعُ الْحَرْفَ، وَأَضْغَطُ عَلَيْهِ."), tapLabel("ل")],
  },
  word_read: {
    lesson: {
      ...base("word_read"),
      type: "word_read",
      rounds: [{ word: "قَلَمٌ", choices: ["كِتَابٌ", "قَلَمٌ", "بَابٌ"], correctIndex: 1 }],
    },
    steps: [
      say("أَسْمَعُ الْكَلِمَةَ، وَأَضْغَطُ عَلَيْهَا."),
      tapLabel("قَلَمٌ"),
      say(THEN_HERE),
      tap("activity-next"),
    ],
  },
  listen_pick: {
    lesson: {
      ...base("listen_pick"),
      type: "listen_pick",
      questions: [
        {
          word: "سَمَكَةٌ",
          choices: [
            { emoji: "🐈", word: "قِطَّةٌ" },
            { emoji: "🐟", word: "سَمَكَةٌ" },
            { emoji: "🐦", word: "عُصْفُورٌ" },
          ],
          correctIndex: 1,
        },
      ],
    },
    steps: [
      say("أَسْمَعُ، وَأَضْغَطُ عَلَى الصُّورَةِ الصَّحِيحَةِ."),
      tapLabel("سَمَكَةٌ"),
      say(THEN_HERE),
      tap("activity-next"),
    ],
  },
  behavior: {
    lesson: {
      ...base("behavior"),
      type: "behavior",
      behaviors: [
        { emoji: "🧹", description: "أُسَاعِدُ أُمِّي فِي الْبَيْتِ.", isCorrect: true },
        { emoji: "🗑️", description: "أَرْمِي الْأَوْسَاخَ فِي الشَّارِعِ.", isCorrect: false },
      ],
    },
    steps: [
      say("هٰذَا سُلُوكٌ صَحِيحٌ، أَضْغَطُ عَلَامَةَ الصَّحِّ."),
      tap("behavior-right-0"),
      say("وَهٰذَا سُلُوكٌ خَاطِئٌ، أَضْغَطُ عَلَامَةَ الْخَطَأِ."),
      tap("behavior-wrong-1"),
      say(THEN_HERE),
      tap("activity-done"),
    ],
  },
  matching: {
    lesson: {
      ...base("matching"),
      type: "matching",
      pairs: [
        { left: { emoji: "🐄", word: "بَقَرَةٌ" }, right: { emoji: "🥛", word: "حَلِيبٌ" } },
        { left: { emoji: "🐝", word: "نَحْلَةٌ" }, right: { emoji: "🍯", word: "عَسَلٌ" } },
      ],
    },
    steps: [
      say("أَضْغَطُ عَلَى شَيْءٍ،"),
      tap("match-left-0"),
      say("ثُمَّ عَلَى مَا يُنَاسِبُهُ."),
      tap("match-right-0"),
      tap("match-left-1"),
      tap("match-right-1"),
      say(THEN_HERE),
      tap("activity-done"),
    ],
  },
  trace: {
    lesson: {
      ...base("trace"),
      type: "trace",
      // A letter no lesson traces; its guide is generated with the others (npm run guides).
      targets: [{ guide: "ه", label: "ه", tts: "هَ" }],
    },
    steps: [
      say("أَمْشِي بِإِصْبَعِي عَلَى الْحَرْفِ."),
      { trace: { testID: "trace-pad" } },
      say("ثُمَّ أَضْغَطُ تَمَّ."),
      tap("trace-done"),
    ],
  },
  trace_lines: {
    lesson: {
      ...base("trace_lines"),
      type: "trace",
      // An em dash: a line no lesson traces.
      targets: [
        { guide: "—", label: "خَطٌّ", tts: "أَرْسُمُ خَطًّا مِنَ الْيَمِينِ إِلَى الْيَسَارِ." },
      ],
    },
    steps: [
      say("أَمْشِي بِإِصْبَعِي عَلَى الْخَطِّ، مِنَ الْيَمِينِ إِلَى الْيَسَارِ."),
      {
        trace: { testID: "trace-pad" },
        path: [
          { x: 0.78, y: 0.5 },
          { x: 0.22, y: 0.5 },
        ],
      },
      say("ثُمَّ أَضْغَطُ تَمَّ."),
      tap("trace-done"),
    ],
  },
  build_word: {
    lesson: {
      ...base("build_word"),
      type: "build_word",
      rounds: [{ word: "كَتَبَ", syllables: ["كَـ", "تَـ", "بَ"], extras: ["كُـ"], emoji: "✍️" }],
    },
    steps: [
      say("أَسْمَعُ الْكَلِمَةَ، وَأَكْتُبُ مَقَاطِعَهَا فِي الرِّسَالَةِ بِالتَّرْتِيبِ."),
      tapLabel("كَـ"),
      tapLabel("تَـ"),
      tapLabel("بَ"),
    ],
  },
  counting: {
    lesson: {
      ...base("counting"),
      type: "counting",
      rounds: [{ emoji: "🍎", count: 3, options: [2, 3, 5] }],
    },
    steps: [say("أَعُدُّ: وَاحِدٌ، اثْنَانِ، ثَلَاثَةٌ."), tapNumber(3)],
  },
  arithmetic: {
    lesson: {
      ...base("arithmetic"),
      type: "arithmetic",
      rounds: [{ a: 2, b: 1, op: "+", options: [2, 3, 4] }],
    },
    steps: [say("اِثْنَانِ وَوَاحِدٌ، يُسَاوِي ثَلَاثَةً."), tapNumber(3)],
  },
  picture_choice: {
    lesson: {
      ...base("picture_choice"),
      type: "picture_choice",
      rounds: [
        {
          prompt: "أَيْنَ الْقَمَرُ؟",
          choices: [[{ emoji: "☀️" }], [{ emoji: "🌙" }], [{ emoji: "⭐" }]],
          correctIndex: 1,
        },
      ],
    },
    steps: [say("هٰذَا هُوَ الْقَمَرُ."), tapPics([{ emoji: "🌙" }])],
  },
  compare: {
    lesson: {
      ...base("compare"),
      type: "compare",
      rounds: [
        {
          prompt: "أَكْثَرُ أَمْ أَقَلُّ؟",
          first: { pics: oranges(4) },
          second: { pics: oranges(2) },
          mode: "words",
        },
      ],
    },
    steps: [say("أَرْبَعَةٌ أَكْثَرُ مِنِ اثْنَيْنِ."), tap("compare-answer-more")],
  },
  number_fill: {
    lesson: {
      ...base("number_fill"),
      type: "number_fill",
      rounds: [
        {
          prompt: "أُكْمِلُ بِالْعَدَدِ الْمُنَاسِبِ.",
          cells: [1, 2, "?", 4],
          layout: "sequence",
          options: [5, 3, 6],
        },
      ],
    },
    steps: [say("بَعْدَ اثْنَيْنِ يَأْتِي ثَلَاثَةٌ."), tapNumber(3)],
  },
  sort: {
    lesson: {
      ...base("sort"),
      type: "sort",
      prompt: "أَضَعُ الْفَوَاكِهَ فِي صُنْدُوقٍ، وَالْحَيَوَانَاتِ فِي الصُّنْدُوقِ الْآخَرِ.",
      boxes: [{ label: "فَوَاكِهُ" }, { label: "حَيَوَانَاتٌ" }],
      items: [
        { pic: { emoji: "🍌" }, box: 0 },
        { pic: { emoji: "🐈" }, box: 1 },
      ],
    },
    steps: [
      say("أَضْغَطُ عَلَى الشَّيْءِ، ثُمَّ عَلَى صُنْدُوقِهِ."),
      tap("sort-item-0"),
      tap("sort-box-0"),
      tap("sort-item-1"),
      tap("sort-box-1"),
    ],
  },
};

export type DemoId = keyof typeof DEMOS;
export const DEMO_IDS = Object.keys(DEMOS) as DemoId[];

/** Any letter, not counting the tatweel that the Unit 1 horizontal line is drawn with. */
const LETTER = /[\u0621-\u063F\u0641-\u064A]/;

/** The demo a lesson gets: the one of its type, or the line demo for tracing lines. */
export function demoIdFor(lesson: Lesson): DemoId {
  if (
    lesson.type === "trace" &&
    !lesson.targets.some((t) => LETTER.test(t.guide) || /[\u0660-\u0669]/.test(t.guide))
  )
    return "trace_lines";
  return lesson.type;
}

export function demoFor(id: DemoId): Demo {
  return DEMOS[id] as Demo;
}
