// Book Unit 2 الأعداد (٠ - ١٠), الرياضيات Part 1 (Sana'a 2026), pp. 33 to 64.
// Notes: docs/content/textbooks/math-part1/unit-02.md. Review status: docs/CONTENT_REVIEW.md
// Every book lesson is a section of app lessons, in book order. The objects, numbers and
// examples are the book's; the Egyptian pyramids (9, p. 46) are left out for Yemeni and
// school objects. Zero is not traced: its digit is a dot, too small for the tracing pad.
import { numberToArabicWord, toArabicDigits } from "../../lib/arabicNumbers.ts";
import type {
  CompareRound,
  CountingRound,
  NumberFillRound,
  PictureChoiceRound,
  TraceTarget,
  Unit,
} from "../types.ts";
import {
  MATH_COLOR,
  bookSection,
  numberMathLessons,
  pics,
  type MathLessonDraft,
} from "./mathKit.ts";

const color = MATH_COLOR;

/** Numbers 0 to 10 as spoken nouns: nominative and genitive. */
const NOM = [
  "صِفْرٌ",
  "وَاحِدٌ",
  "اثْنَانِ",
  "ثَلَاثَةٌ",
  "أَرْبَعَةٌ",
  "خَمْسَةٌ",
  "سِتَّةٌ",
  "سَبْعَةٌ",
  "ثَمَانِيَةٌ",
  "تِسْعَةٌ",
  "عَشَرَةٌ",
];
/** The same numbers with the article, for "الْخَمْسَةُ أَكْبَرُ أَمْ أَصْغَرُ مِنَ الثَّلَاثَةِ؟". */
const DEF_NOM = [
  "الصِّفْرُ",
  "الْوَاحِدُ",
  "الاثْنَانِ",
  "الثَّلَاثَةُ",
  "الأَرْبَعَةُ",
  "الْخَمْسَةُ",
  "السِّتَّةُ",
  "السَّبْعَةُ",
  "الثَّمَانِيَةُ",
  "التِّسْعَةُ",
  "الْعَشَرَةُ",
];
const DEF_GEN = [
  "الصِّفْرِ",
  "الْوَاحِدِ",
  "الاثْنَيْنِ",
  "الثَّلَاثَةِ",
  "الأَرْبَعَةِ",
  "الْخَمْسَةِ",
  "السِّتَّةِ",
  "السَّبْعَةِ",
  "الثَّمَانِيَةِ",
  "التِّسْعَةِ",
  "الْعَشَرَةِ",
];
const GEN = [
  "صِفْرٍ",
  "وَاحِدٍ",
  "اثْنَيْنِ",
  "ثَلَاثَةٍ",
  "أَرْبَعَةٍ",
  "خَمْسَةٍ",
  "سِتَّةٍ",
  "سَبْعَةٍ",
  "ثَمَانِيَةٍ",
  "تِسْعَةٍ",
  "عَشَرَةٍ",
];

const COUNT_SUBTITLE = "أَعُدُّ وَأَخْتَارُ الْعَدَدَ";
const MISSING = "مَا الْعَدَدُ النَّاقِصُ؟";

/** A counting round: `count` pictures of `emoji`, answered from `options`. */
const count = (emoji: string, n: number, options: number[]): CountingRound => ({
  emoji,
  count: n,
  options,
});

/** "Which group has n?": one group of `emoji` per entry of `counts`. */
function whichGroup(emoji: string, n: number, counts: number[]): PictureChoiceRound {
  return {
    prompt: n === 0 ? "أَيُّ مَجْمُوعَةٍ عَدَدُهَا صِفْرٌ؟" : `أَيُّ مَجْمُوعَةٍ فِيهَا ${NOM[n]}؟`,
    choices: counts.map((c) => pics(emoji, c)),
    correctIndex: counts.indexOf(n),
  };
}

/** Trace the digits, hearing each number word. */
function digits(...ns: number[]): TraceTarget[] {
  return ns.map((n) => ({
    guide: toArabicDigits(n),
    label: toArabicDigits(n),
    tts: numberToArabicWord(n),
  }));
}

/**
 * Two groups with words: أَكْثَرُ / أَقَلُّ / يُسَاوِي, about the first group (on the right).
 * The question names the first group first: "الدَّعَاسِيقُ أَكْثَرُ أَمْ أَقَلُّ مِنَ السَّلَاحِفِ؟".
 */
function compareGroups(
  [firstEmoji, firstNoun, a]: [string, string, number],
  [secondEmoji, secondNoun, b]: [string, string, number],
): CompareRound {
  return {
    prompt: `${firstNoun} أَكْثَرُ أَمْ أَقَلُّ مِنَ ${secondNoun}؟`,
    first: { pics: pics(firstEmoji, a) },
    second: { pics: pics(secondEmoji, b) },
    mode: "words",
  };
}

/**
 * Two numbers, the first on the right, asked about the first: in words mode
 * "الْخَمْسَةُ أَكْبَرُ أَمْ أَصْغَرُ مِنَ الثَّلَاثَةِ؟", in symbols mode "أَيُّ إِشَارَةٍ بَيْنَ خَمْسَةٍ وَثَلَاثَةٍ؟".
 */
function compareNumbers(a: number, b: number, mode: "words" | "symbols"): CompareRound {
  return {
    prompt:
      mode === "symbols"
        ? `أَيُّ إِشَارَةٍ بَيْنَ ${GEN[a]} وَ${GEN[b]}؟`
        : `${DEF_NOM[a]} أَكْبَرُ أَمْ أَصْغَرُ مِنَ ${DEF_GEN[b]}؟`,
    first: { number: a },
    second: { number: b },
    mode,
  };
}

/** A counting row with one gap. */
const row = (
  cells: NumberFillRound["cells"],
  options: number[],
  prompt = MISSING,
): NumberFillRound => ({ prompt, cells, layout: "sequence", options });

/** An ordered row of pictures; the child taps the one at `position`, counted from 1. */
function nth(prompt: string, items: string[], position: number): PictureChoiceRound {
  return {
    prompt,
    choices: items.map((emoji) => [{ emoji }]),
    correctIndex: position - 1,
    ordered: true,
  };
}

// The five girls board the bus in this order (p. 56): أَرْوَى، بِلْقِيسُ، فَاطِمَةُ، سَارَةُ، زَيْنَبُ.
const GIRLS = ["🧕", "🧕", "🧕", "🧕", "🧕"];
// The ten animals of p. 57: camel, dog, cat, chick, turtle, cow, hen, tiger, rabbit, goat.
const ANIMALS = ["🐪", "🐕", "🐈", "🐥", "🐢", "🐄", "🐓", "🐅", "🐇", "🐐"];
const CATS = ["🐈", "🐈", "🐈", "🐈", "🐈", "🐈", "🐈", "🐈"];

const s1 = bookSection(2, 1, "الأَعْدَادُ ١، ٢، ٣");
const s2 = bookSection(2, 2, "الأَعْدَادُ ٤، ٥، ٠");
const s3 = bookSection(2, 3, "الأَعْدَادُ ٦، ٧، ٨");
const s4 = bookSection(2, 4, "الْعَدَدَانِ ٩، ١٠");
const s5 = bookSection(2, 5, "تَدْرِيبَاتٌ");
const s6 = bookSection(2, 6, "مُقَارَنَةُ الأَعْدَادِ");
const s7 = bookSection(2, 7, "تَرْتِيبُ الأَعْدَادِ");
const s8 = bookSection(2, 8, "الأَعْدَادُ التَّرْتِيبِيَّةُ");
const s9 = bookSection(2, 9, "حَلُّ الْمَسْأَلَةِ");
const s10 = bookSection(2, 10, "تَدْرِيبَاتٌ عَامَّةٌ");

const drafts: MathLessonDraft[] = [
  // ── 2-1 الأعداد ١، ٢، ٣ (pp. 34 to 37): birds, fish, balls, candles, glasses, rabbits ──
  {
    section: s1,
    type: "counting",
    title: "أَعُدُّ: ١، ٢، ٣",
    subtitle: COUNT_SUBTITLE,
    emoji: "🐦",
    color,
    rounds: [
      count("🐦", 2, [1, 2, 3]),
      count("🐟", 3, [3, 1, 2]),
      count("⚽", 1, [2, 1, 3]),
      count("🕯️", 3, [2, 3, 1]),
      count("👓", 1, [1, 3, 2]),
      count("🐇", 2, [3, 2, 1]),
    ],
  },
  {
    section: s1,
    type: "picture_choice",
    title: "أَيُّ مَجْمُوعَةٍ؟",
    subtitle: "أَعُدُّ وَأَخْتَارُ الْمَجْمُوعَةَ",
    emoji: "✏️",
    color,
    rounds: [
      whichGroup("✏️", 3, [1, 3, 2]),
      whichGroup("📕", 2, [2, 1, 3]),
      whichGroup("📏", 1, [2, 3, 1]),
      whichGroup("👧", 2, [3, 2, 1]),
      whichGroup("👦", 3, [3, 1, 2]),
    ],
  },
  {
    section: s1,
    type: "trace",
    title: "أَكْتُبُ الأَعْدَادَ",
    subtitle: "١  ،  ٢  ،  ٣",
    emoji: "✍️",
    color,
    targets: digits(1, 2, 3),
  },

  // ── 2-2 الأعداد ٤، ٥، ٠ (pp. 38 to 41): fishbowls, cows, flags, rabbit cages, glasses ──
  {
    section: s2,
    type: "counting",
    title: "أَعُدُّ: ٤، ٥، ٠",
    subtitle: COUNT_SUBTITLE,
    emoji: "🐟",
    color,
    rounds: [
      count("🐟", 4, [4, 5, 0]),
      count("🐄", 5, [0, 4, 5]),
      count("🐄", 0, [5, 0, 4]),
      count("🇾🇪", 4, [5, 4, 0]),
      count("🥛", 5, [4, 0, 5]),
      count("🍊", 0, [0, 5, 4]),
    ],
  },
  {
    section: s2,
    type: "picture_choice",
    title: "أَيُّ مَجْمُوعَةٍ؟",
    subtitle: "الصِّفْرُ: لَا شَيْءَ",
    emoji: "🐇",
    color,
    rounds: [
      whichGroup("🐟", 5, [4, 5, 0]),
      whichGroup("🇾🇪", 4, [5, 0, 4]),
      whichGroup("🐇", 0, [4, 0, 5]),
      whichGroup("🌸", 5, [5, 4, 0]),
      whichGroup("🐄", 0, [0, 5, 4]),
    ],
  },
  {
    section: s2,
    type: "trace",
    title: "أَكْتُبُ الْعَدَدَيْنِ",
    subtitle: "٤  ،  ٥",
    emoji: "✍️",
    color,
    targets: digits(4, 5),
  },

  // ── 2-3 الأعداد ٦، ٧، ٨ (pp. 42 to 45): balls, sorghum, eggs, corn, spoons, carrots ──
  {
    section: s3,
    type: "counting",
    title: "أَعُدُّ: ٦، ٧، ٨",
    subtitle: COUNT_SUBTITLE,
    emoji: "⚽",
    color,
    rounds: [
      count("🏀", 6, [6, 7, 8]),
      count("⚽", 7, [8, 6, 7]),
      count("🎾", 8, [7, 8, 6]),
      count("🌾", 6, [7, 6, 8]),
      count("🥚", 7, [7, 8, 6]),
      count("🌽", 8, [6, 7, 8]),
    ],
  },
  {
    section: s3,
    type: "picture_choice",
    title: "أَيُّ مَجْمُوعَةٍ؟",
    subtitle: "أَعُدُّ وَأَخْتَارُ الْمَجْمُوعَةَ",
    emoji: "🥕",
    color,
    rounds: [
      whichGroup("🥄", 6, [7, 6, 8]),
      whichGroup("🥕", 8, [8, 7, 6]),
      whichGroup("🍅", 7, [6, 8, 7]),
      whichGroup("☂️", 6, [6, 8, 7]),
    ],
  },
  {
    section: s3,
    type: "trace",
    title: "أَكْتُبُ الأَعْدَادَ",
    subtitle: "٦  ،  ٧  ،  ٨",
    emoji: "✍️",
    color,
    targets: digits(6, 7, 8),
  },

  // ── 2-4 العددان ٩، ١٠ (pp. 46 to 49): cars, Yemenia aircraft, straw hats, keys, limes ──
  // Groups of 9 and 10 are big, so the group choices come in twos to fit a phone screen.
  {
    section: s4,
    type: "counting",
    title: "أَعُدُّ: ٩، ١٠",
    subtitle: COUNT_SUBTITLE,
    emoji: "✈️",
    color,
    rounds: [
      count("🚗", 9, [8, 9, 10]),
      count("✈️", 10, [10, 8, 9]),
      count("👒", 10, [9, 10, 8]),
      count("🍬", 9, [9, 8, 10]),
      count("🍓", 10, [8, 10, 9]),
    ],
  },
  {
    section: s4,
    type: "picture_choice",
    title: "أَيُّ مَجْمُوعَةٍ؟",
    subtitle: "أَعُدُّ وَأَخْتَارُ الْمَجْمُوعَةَ",
    emoji: "🔑",
    color,
    rounds: [
      whichGroup("🔑", 9, [10, 9]),
      whichGroup("✈️", 10, [9, 10]),
      whichGroup("🍋", 9, [9, 10]),
      whichGroup("✏️", 10, [10, 8]),
    ],
  },
  {
    section: s4,
    type: "trace",
    title: "أَكْتُبُ الْعَدَدَيْنِ",
    subtitle: "٩  ،  ١٠",
    emoji: "✍️",
    color,
    targets: digits(9, 10),
  },

  // ── 2-5 تدريبات (pp. 50 to 51): shapes, beads, dominoes ──
  {
    section: s5,
    type: "counting",
    title: "أَعُدُّ الأَشْكَالَ",
    subtitle: COUNT_SUBTITLE,
    emoji: "🔺",
    color,
    rounds: [
      count("🔵", 7, [6, 7, 8]),
      count("🔺", 6, [6, 5, 7]),
      count("🟥", 8, [9, 7, 8]),
      count("🔺", 9, [10, 9, 8]),
      count("🔵", 4, [4, 3, 5]),
      count("🟥", 5, [6, 5, 4]),
    ],
  },
  {
    section: s5,
    type: "counting",
    title: "أَعُدُّ مِنْ ٠ إِلَى ١٠",
    subtitle: COUNT_SUBTITLE,
    emoji: "🐝",
    color,
    rounds: [
      count("🐝", 3, [2, 3, 4]),
      count("🌸", 10, [10, 9, 8]),
      count("🦋", 6, [5, 7, 6]),
      count("🐔", 0, [0, 1, 2]),
      count("🐪", 1, [2, 1, 0]),
      count("🐦", 8, [8, 6, 9]),
    ],
  },

  // ── 2-6 مقارنة الأعداد (pp. 52 to 53): ladybirds and turtles, bead towers ──
  {
    section: s6,
    type: "compare",
    title: "أَكْثَرُ أَمْ أَقَلُّ؟",
    subtitle: "أَكْثَرُ، أَقَلُّ، يُسَاوِي",
    emoji: "🐞",
    color,
    rounds: [
      compareGroups(["🐞", "الدَّعَاسِيقُ", 5], ["🐢", "السَّلَاحِفِ", 3]),
      compareGroups(["🐞", "الدَّعَاسِيقُ", 2], ["🐢", "السَّلَاحِفِ", 4]),
      compareGroups(["🐞", "الدَّعَاسِيقُ", 4], ["🐢", "السَّلَاحِفِ", 4]),
      compareGroups(["🐇", "الأَرَانِبُ", 6], ["🐐", "الْمَاعِزِ", 3]),
      compareGroups(["🐇", "الأَرَانِبُ", 2], ["🐐", "الْمَاعِزِ", 5]),
    ],
  },
  {
    section: s6,
    type: "compare",
    title: "أَكْبَرُ أَمْ أَصْغَرُ؟",
    subtitle: "أَكْبَرُ، أَصْغَرُ، يُسَاوِي",
    emoji: "⚖️",
    color,
    rounds: [
      compareNumbers(5, 3, "words"),
      compareNumbers(4, 6, "words"),
      compareNumbers(7, 4, "words"),
      compareNumbers(2, 3, "words"),
      compareNumbers(4, 4, "words"),
    ],
  },
  {
    section: s6,
    type: "compare",
    title: "أَخْتَارُ الإِشَارَةَ",
    subtitle: "أَكْبَرُ مِنْ، أَصْغَرُ مِنْ، يُسَاوِي",
    emoji: "🔢",
    color,
    rounds: [
      compareNumbers(3, 2, "symbols"),
      compareNumbers(5, 7, "symbols"),
      compareNumbers(4, 4, "symbols"),
      compareNumbers(9, 5, "symbols"),
      compareNumbers(6, 8, "symbols"),
      compareNumbers(10, 9, "symbols"),
    ],
  },

  // ── 2-7 ترتيب الأعداد (pp. 54 to 55): missing numbers, three numbers in order ──
  {
    section: s7,
    type: "number_fill",
    title: "أُرَتِّبُ الأَعْدَادَ",
    subtitle: MISSING,
    emoji: "🧮",
    color,
    rounds: [
      row([0, 1, "?", 3], [2, 4, 1]),
      row([6, "?", 8, 9], [5, 7, 10]),
      row([4, 5, "?", 7], [6, 8, 3]),
      row([2, "?", 4], [4, 3, 5]),
      row(["?", 4, 5], [6, 2, 3]),
      row([7, 8, "?"], [9, 6, 10]),
    ],
  },

  // ── 2-8 الأعداد الترتيبية (pp. 56 to 57): the girls and the bus, ten animals ──
  {
    section: s8,
    type: "picture_choice",
    title: "الْبَنَاتُ يَرْكَبْنَ الْحَافِلَةَ",
    subtitle: "الأُولَى عَلَى الْيَمِينِ",
    emoji: "🚌",
    color,
    rounds: [
      nth("أَرْوَى هِيَ الأُولَى. أَيْنَ أَرْوَى؟", GIRLS, 1),
      nth("مَنِ الثَّالِثَةُ فِي الصَّفِّ؟", GIRLS, 3),
      nth("سَارَةُ هِيَ الرَّابِعَةُ. أَيْنَ سَارَةُ؟", GIRLS, 4),
      nth("مَنِ الْخَامِسَةُ فِي الصَّفِّ؟", GIRLS, 5),
      nth("بِلْقِيسُ هِيَ الثَّانِيَةُ. أَيْنَ بِلْقِيسُ؟", GIRLS, 2),
    ],
  },
  {
    section: s8,
    type: "picture_choice",
    title: "عَشَرَةُ حَيَوَانَاتٍ",
    subtitle: "الأَوَّلُ عَلَى الْيَمِينِ",
    emoji: "🐪",
    color,
    rounds: [
      nth("أَيُّ حَيَوَانٍ هُوَ الأَوَّلُ؟", ANIMALS, 1),
      nth("أَيُّ حَيَوَانٍ هُوَ الْخَامِسُ؟", ANIMALS, 5),
      nth("أَيُّ حَيَوَانٍ هُوَ التَّاسِعُ؟", ANIMALS, 9),
      nth("أَيُّ حَيَوَانٍ هُوَ الثَّالِثُ؟", ANIMALS, 3),
      nth("أَيُّ حَيَوَانٍ هُوَ السَّابِعُ؟", ANIMALS, 7),
      nth("أَيُّ حَيَوَانٍ هُوَ الْعَاشِرُ؟", ANIMALS, 10),
    ],
  },
  {
    section: s8,
    type: "picture_choice",
    title: "أَيُّ قِطٍّ؟",
    subtitle: "أَعُدُّ مِنَ الْيَمِينِ",
    emoji: "🐈",
    color,
    rounds: [
      nth("أَيْنَ الْقِطُّ الرَّابِعُ؟", CATS, 4),
      nth("أَيْنَ الْقِطُّ الثَّانِي؟", CATS, 2),
      nth("أَيْنَ الْقِطُّ السَّادِسُ؟", CATS, 6),
      nth("أَيْنَ الْقِطُّ الثَّامِنُ؟", CATS, 8),
    ],
  },

  // ── 2-9 حل المسألة (p. 58): the maze from ٠ to ١٠ ──
  {
    section: s9,
    type: "number_fill",
    title: "الْمَتَاهَةُ",
    subtitle: "أَصِلُ مِنْ ٠ إِلَى ١٠",
    emoji: "🗺️",
    color,
    rounds: [
      row([0, 1, 2, "?"], [3, 4, 2], "مَا الْعَدَدُ التَّالِي؟"),
      row([3, 4, 5, "?"], [7, 6, 5], "مَا الْعَدَدُ التَّالِي؟"),
      row([6, 7, 8, "?"], [8, 10, 9], "مَا الْعَدَدُ التَّالِي؟"),
      row([8, 9, "?"], [10, 7, 8], "مَا الْعَدَدُ التَّالِي؟"),
    ],
  },

  // ── 2-10 تدريبات عامة (pp. 59 to 61): counting in twos, grain and flowers, < > = ──
  {
    section: s10,
    type: "number_fill",
    title: "أَعُدُّ اثْنَيْنِ اثْنَيْنِ",
    subtitle: MISSING,
    emoji: "🦶",
    color,
    rounds: [
      row([2, 4, "?", 8], [6, 5, 7], "أَعُدُّ اثْنَيْنِ اثْنَيْنِ: مَا الْعَدَدُ النَّاقِصُ؟"),
      row([4, 6, 8, "?"], [9, 10, 8], "أَعُدُّ اثْنَيْنِ اثْنَيْنِ: مَا الْعَدَدُ النَّاقِصُ؟"),
      row([9, 7, "?", 3], [6, 4, 5], "أَعُدُّ اثْنَيْنِ اثْنَيْنِ: مَا الْعَدَدُ النَّاقِصُ؟"),
      row([5, "?", 1], [2, 3, 4], "أَعُدُّ اثْنَيْنِ اثْنَيْنِ: مَا الْعَدَدُ النَّاقِصُ؟"),
    ],
  },
  {
    section: s10,
    type: "counting",
    title: "أَعُدُّ مَا فِي الْحَقْلِ",
    subtitle: "السَّنَابِلُ وَالأَزْهَارُ وَالْفَرَاشَاتُ",
    emoji: "🌾",
    color,
    rounds: [
      count("🌾", 9, [9, 7, 8]),
      count("🌼", 5, [4, 6, 5]),
      count("🦋", 7, [8, 7, 6]),
      count("🌾", 4, [3, 4, 5]),
      count("🌼", 10, [8, 9, 10]),
    ],
  },
  {
    section: s10,
    type: "compare",
    title: "أَخْتَارُ الإِشَارَةَ",
    subtitle: "أَكْبَرُ مِنْ، أَصْغَرُ مِنْ، يُسَاوِي",
    emoji: "🔢",
    color,
    rounds: [
      compareNumbers(8, 6, "symbols"),
      compareNumbers(2, 5, "symbols"),
      compareNumbers(7, 7, "symbols"),
      compareNumbers(10, 3, "symbols"),
      compareNumbers(1, 4, "symbols"),
    ],
  },

  // ── اختبار الوحدة (p. 62): frogs, roosters, bananas, strawberries ──
  {
    section: "اخْتِبَارُ الْوَحْدَةِ",
    type: "counting",
    title: "اخْتِبَارُ الْوَحْدَةِ",
    subtitle: COUNT_SUBTITLE,
    emoji: "📝",
    color,
    rounds: [
      count("🐸", 6, [5, 6, 7]),
      count("🐓", 4, [4, 3, 5]),
      count("🍌", 7, [8, 7, 6]),
      count("🍓", 9, [10, 8, 9]),
      count("🐸", 0, [1, 0, 2]),
    ],
  },
];

export const mathBookUnit2: Unit = {
  id: "math-u2",
  number: 2,
  title: "الْوَحْدَةُ الثَّانِيَةُ",
  theme: "الأَعْدَادُ مِنْ ٠ إِلَى ١٠",
  emoji: "🔢",
  color,
  badgeLabel: "أَعُدُّ",
  lessons: numberMathLessons(2, drafts),
};
