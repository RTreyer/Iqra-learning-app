// Book Unit 4 الطرح ضمن العدد ١٠, الرياضيات Part 1 (Sana'a 2026), pp. 91 to 116.
// Notes: docs/content/textbooks/math-part1/unit-04.md. Review status: docs/CONTENT_REVIEW.md
// Every book lesson is a section of app lessons, in book order. Subtraction is shown the
// book's way: the taken objects are crossed out, and the child reads the sentence
// (٥ - ٢ = ٣); only the task is spoken. The subtraction triangle, joining lines, the
// riddle and the enrichment page are left out (see the Unit 4 design spec).
import type { FillCell, MathPic, NumberFillRound, PictureChoiceRound, Unit } from "../types.ts";
import {
  MATH_COLOR,
  bookSection,
  numberMathLessons,
  shape,
  type MathLessonDraft,
} from "./mathKit.ts";

const color = MATH_COLOR;

/** Numbers 0 to 10 as spoken nouns (nominative), for "الْبَاقِي ثَلَاثَةٌ". */
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

const LEFT = "كَمِ الْبَاقِي؟";
const ACROSS = "أَطْرَحُ أُفُقِيًّا: كَمِ الْبَاقِي؟";
const DOWN = "أَطْرَحُ رَأْسِيًّا: كَمِ الْبَاقِي؟";
const COMPLETE = "أُكْمِلُ بِالْعَدَدِ الْمُنَاسِبِ.";
const AT_START = "كَمْ كَانَ فِي الْبِدَايَةِ؟";
const TAKEN = "كَمْ ذَهَبَ؟";
const BACK = "أَعُدُّ إِلَى الْوَرَاءِ وَأُكْمِلُ.";
const BY_TWOS = "أَعُدُّ اثْنَيْنِ اثْنَيْنِ وَأُكْمِلُ.";
const BACK_2 = "أَعُدُّ إِلَى الْوَرَاءِ اثْنَيْنِ اثْنَيْنِ وَأُكْمِلُ.";

/** `total` pictures; the last `taken` are crossed out (taken away). */
function take(pic: MathPic | string, total: number, taken: number): MathPic[] {
  const base: MathPic = typeof pic === "string" ? { emoji: pic } : pic;
  return Array.from({ length: total }, (_, i) =>
    i >= total - taken ? { ...base, crossed: true } : { ...base },
  );
}

/** Three answer choices around `answer`, all from 0 to 10 (shuffled on screen). */
function near(answer: number): number[] {
  if (answer <= 0) return [0, 1, 2];
  if (answer >= 10) return [8, 9, 10];
  return [answer - 1, answer, answer + 1];
}

type Hide = "a" | "b" | "c";

/** The sentence a - b = c with one number hidden. */
function sentence(a: number, b: number, hide: Hide): FillCell[] {
  return [hide === "a" ? "?" : a, "-", hide === "b" ? "?" : b, "=", hide === "c" ? "?" : a - b];
}

const answerOf = (a: number, b: number, hide: Hide) =>
  hide === "a" ? a : hide === "b" ? b : a - b;

/** A plain difference, in a row or written vertically. */
function fact(
  a: number,
  b: number,
  prompt: string,
  layout: "row" | "vertical" = "row",
  hide: Hide = "c",
): NumberFillRound {
  return { prompt, cells: sentence(a, b, hide), layout, options: near(answerOf(a, b, hide)) };
}

/** A take away story: `a` pictures, `b` of them crossed out, and the sentence below. */
function story(
  prompt: string,
  pic: MathPic | string,
  a: number,
  b: number,
  layout: "row" | "vertical" = "row",
  hide: Hide = "c",
): NumberFillRound {
  return { ...fact(a, b, prompt, layout, hide), pics: take(pic, a, b) };
}

/**
 * "In which picture are n left?": one group per `[total, taken]`, the taken ones crossed out.
 * Groups of 9 or 10 come as 2 choices to fit a phone screen.
 */
function leftChoice(
  pic: MathPic | string,
  left: number,
  groups: [number, number][],
  prompt = `فِي أَيِّ صُورَةٍ الْبَاقِي ${NOM[left]}؟`,
): PictureChoiceRound {
  return {
    prompt,
    choices: groups.map(([total, taken]) => take(pic, total, taken)),
    correctIndex: groups.findIndex(([total, taken]) => total - taken === left),
  };
}

/** A counting row with one gap; `answer` is checked by the content tests. */
const row = (cells: FillCell[], answer: number, prompt: string): NumberFillRound => ({
  prompt,
  cells,
  layout: "sequence",
  options: near(answer),
});

const COUNTER = shape("circle", "red");
const MARBLE = shape("circle", "blue");
const TRIANGLE = shape("triangle", "green");

const s1 = bookSection(4, 1, "التَّهْيِئَةُ لِلطَّرْحِ");
const s2 = bookSection(4, 2, "الطَّرْحُ ضِمْنَ ٥");
const s3 = bookSection(4, 3, "حَقَائِقُ الطَّرْحِ ضِمْنَ ٥");
const s4 = bookSection(4, 4, "الطَّرْحُ ضِمْنَ ١٠");
const s5 = bookSection(4, 5, "حَقَائِقُ الطَّرْحِ ضِمْنَ ١٠");
const s6 = bookSection(4, 6, "حَلُّ الْمَسْأَلَةِ");
const s7 = bookSection(4, 7, "اكْتِشَافُ الأَنْمَاطِ");
const s8 = bookSection(4, 8, "تَدْرِيبَاتٌ عَامَّةٌ");
const TEST = "اخْتِبَارُ الْوَحْدَةِ";

const drafts: MathLessonDraft[] = [
  // ── 4-1 التهيئة للطرح (pp. 92 to 93): chicks, apples, flowers; balloons, turtles, eggs ──
  {
    section: s1,
    type: "picture_choice",
    title: "مَا الْبَاقِي؟",
    subtitle: "الْمَشْطُوبُ ذَهَبَ",
    emoji: "🐥",
    color,
    rounds: [
      leftChoice(
        "🐥",
        3,
        [
          [4, 2],
          [4, 1],
          [4, 3],
        ],
        "الْمَشْطُوبُ ذَهَبَ. فِي أَيِّ صُورَةٍ الْبَاقِي ثَلَاثَةٌ؟",
      ),
      leftChoice("🍎", 3, [
        [5, 2],
        [5, 4],
        [5, 1],
      ]),
      leftChoice("🌸", 2, [
        [3, 2],
        [3, 0],
        [3, 1],
      ]),
      leftChoice("🎈", 2, [
        [3, 1],
        [3, 2],
        [3, 3],
      ]),
      leftChoice("🐢", 3, [
        [5, 1],
        [5, 2],
        [5, 3],
      ]),
      leftChoice("🥚", 3, [
        [4, 1],
        [4, 4],
        [4, 2],
      ]),
    ],
  },

  // ── 4-2 الطرح ضمن ٥ (pp. 94 to 97): horses, bees, trees, candles, boys, circles ──
  {
    section: s2,
    type: "number_fill",
    title: "الْخُيُولُ تَخْرُجُ",
    subtitle: "٥ نَاقِص ٢ يُسَاوِي ٣",
    emoji: "🐎",
    color,
    rounds: [
      story("خَرَجَتْ خُيُولٌ مِنَ الْحَقْلِ. كَمِ الْبَاقِي؟", "🐎", 5, 2),
      story("طَارَ نَحْلٌ. كَمِ الْبَاقِي؟", "🐝", 4, 2),
      story("قُطِعَتْ شَجَرَةٌ. كَمِ الْبَاقِي؟", "🌳", 5, 1),
      story("انْطَفَأَتْ شُمُوعٌ. كَمِ الْبَاقِي؟", "🕯️", 5, 3),
      story("ذَهَبَ وَلَدٌ. كَمِ الْبَاقِي؟", "👦", 4, 1),
      story(LEFT, COUNTER, 4, 4),
    ],
  },
  {
    section: s2,
    type: "number_fill",
    title: "أُفُقِيًّا وَرَأْسِيًّا",
    subtitle: "الْجَوَابُ نَفْسُهُ فِي الطَّرِيقَتَيْنِ",
    emoji: "↕️",
    color,
    rounds: [
      fact(5, 2, ACROSS),
      fact(5, 2, DOWN, "vertical"),
      fact(4, 1, ACROSS),
      fact(4, 1, DOWN, "vertical"),
      fact(3, 2, DOWN, "vertical"),
      story("طَارَتْ بَالُونَاتٌ. كَمِ الْبَاقِي؟", "🎈", 5, 2, "vertical"),
    ],
  },
  {
    section: s2,
    type: "number_fill",
    title: "أُفَكِّرُ",
    subtitle: "أُكْمِلُ بِالْعَدَدِ الْمُنَاسِبِ",
    emoji: "🤔",
    color,
    rounds: [
      fact(5, 2, COMPLETE, "row", "b"),
      fact(3, 2, COMPLETE, "row", "b"),
      fact(4, 3, COMPLETE, "row", "b"),
      fact(2, 2, COMPLETE, "row", "b"),
      fact(5, 1, COMPLETE, "row", "b"),
    ],
  },

  // ── 4-3 حقائق الطرح ضمن ٥ (pp. 98 to 101): counters, dominoes, marbles from jars ──
  {
    section: s3,
    type: "number_fill",
    title: "أَطْرَحُ مِنْ ٢ وَ٣",
    subtitle: "أَشْطُبُ وَأَعُدُّ الْبَاقِي",
    emoji: "🔴",
    color,
    rounds: [
      story(LEFT, COUNTER, 2, 1),
      story(LEFT, COUNTER, 2, 2),
      story(LEFT, COUNTER, 3, 1),
      story(LEFT, COUNTER, 3, 2),
      story(LEFT, COUNTER, 3, 3),
    ],
  },
  {
    section: s3,
    type: "number_fill",
    title: "أَطْرَحُ مِنْ ٤ وَ٥",
    subtitle: "أَطْرَحُ أُفُقِيًّا وَرَأْسِيًّا",
    emoji: "🎲",
    color,
    rounds: [
      fact(4, 2, ACROSS),
      fact(5, 3, DOWN, "vertical"),
      fact(4, 3, ACROSS),
      fact(5, 1, DOWN, "vertical"),
      fact(5, 4, ACROSS),
      fact(4, 4, DOWN, "vertical"),
    ],
  },
  {
    section: s3,
    type: "number_fill",
    title: "الْكُرَاتُ تَخْرُجُ",
    subtitle: "كَمِ الْبَاقِي فِي الْعُلْبَةِ؟",
    emoji: "🫙",
    color,
    rounds: [
      story("خَرَجَتْ كُرَاتٌ مِنَ الْعُلْبَةِ. كَمِ الْبَاقِي؟", MARBLE, 5, 2),
      story(LEFT, MARBLE, 3, 1),
      story(LEFT, MARBLE, 4, 2),
      story(LEFT, MARBLE, 5, 0),
      story(LEFT, MARBLE, 4, 1),
      story(LEFT, MARBLE, 5, 3),
    ],
  },
  {
    section: s3,
    type: "picture_choice",
    title: "الْبَاقِي اثْنَانِ",
    subtitle: "أَيُّ طَرْحٍ يُعْطِي ٢؟",
    emoji: "🔵",
    color,
    rounds: [
      leftChoice(MARBLE, 2, [
        [5, 2],
        [4, 2],
        [3, 2],
      ]),
      leftChoice(MARBLE, 2, [
        [3, 1],
        [5, 1],
        [4, 4],
      ]),
      leftChoice(MARBLE, 2, [
        [5, 5],
        [4, 1],
        [5, 3],
      ]),
      leftChoice(MARBLE, 2, [
        [2, 0],
        [3, 3],
        [5, 2],
      ]),
    ],
  },

  // ── 4-4 الطرح ضمن ١٠ (pp. 102 to 103): crossed pictures, then the race ──
  {
    section: s4,
    type: "number_fill",
    title: "أَشْطُبُ وَأَطْرَحُ",
    subtitle: "الطَّرْحُ ضِمْنَ ١٠",
    emoji: "✖️",
    color,
    rounds: [
      story(LEFT, "🐟", 10, 1),
      story(LEFT, "⭐", 10, 3),
      story(LEFT, "🚗", 8, 2),
      story(LEFT, "🍊", 7, 0),
      story(LEFT, "🐦", 9, 3),
      story(LEFT, "🍬", 6, 6),
    ],
  },
  {
    section: s4,
    type: "number_fill",
    title: "لِنَتَسَابَقْ فِي الْحَلِّ",
    subtitle: "مِنَ الْبِدَايَةِ إِلَى النِّهَايَةِ",
    emoji: "🏁",
    color,
    rounds: [
      fact(9, 2, DOWN, "vertical"),
      fact(8, 4, DOWN, "vertical"),
      fact(10, 5, DOWN, "vertical"),
      fact(7, 3, DOWN, "vertical"),
      fact(6, 1, DOWN, "vertical"),
      fact(10, 8, DOWN, "vertical"),
    ],
  },

  // ── 4-5 حقائق الطرح ضمن ١٠ (pp. 104 to 107): balloons, flowers, facts, أفكر ──
  {
    section: s5,
    type: "number_fill",
    title: "بَالُونَاتٌ وَوُرُودٌ",
    subtitle: "٧ نَاقِص ٣ يُسَاوِي ٤",
    emoji: "🎈",
    color,
    rounds: [
      story("طَارَتْ بَالُونَاتٌ. كَمِ الْبَاقِي؟", "🎈", 7, 3),
      story("أَهْدَتِ الْبِنْتُ وُرُودًا. كَمِ الْبَاقِي؟", "🌹", 7, 2),
      story("طَارَتْ بَالُونَاتٌ. كَمِ الْبَاقِي؟", "🎈", 6, 2),
      story("طَارَتْ بَالُونَاتٌ. كَمِ الْبَاقِي؟", "🎈", 7, 4, "vertical"),
    ],
  },
  {
    section: s5,
    type: "number_fill",
    title: "أَطْرَحُ مِنْ ٦ إِلَى ١٠",
    subtitle: "أَطْرَحُ أُفُقِيًّا وَرَأْسِيًّا",
    emoji: "➖",
    color,
    rounds: [
      fact(8, 3, LEFT),
      fact(9, 4, DOWN, "vertical"),
      fact(10, 6, LEFT),
      fact(6, 4, DOWN, "vertical"),
      fact(7, 5, LEFT),
      fact(9, 9, DOWN, "vertical"),
    ],
  },
  {
    section: s5,
    type: "picture_choice",
    title: "أَيْنَ الْبَاقِي؟",
    subtitle: "الْبَاقِي ٤، ١، ٧",
    emoji: "🎈",
    color,
    rounds: [
      leftChoice("🎈", 4, [
        [6, 2],
        [7, 4],
        [8, 3],
      ]),
      leftChoice("🎈", 1, [
        [7, 5],
        [6, 5],
        [8, 8],
      ]),
      leftChoice("🎈", 7, [
        [10, 3],
        [9, 3],
      ]),
      leftChoice("🎈", 4, [
        [10, 6],
        [9, 3],
      ]),
    ],
  },
  {
    section: s5,
    type: "number_fill",
    title: "أُكْمِلُ الْجُمْلَةَ",
    subtitle: "كَمْ كَانَ؟ كَمْ ذَهَبَ؟",
    emoji: "🤔",
    color,
    rounds: [
      story(AT_START, "🎈", 8, 3, "row", "a"),
      story(TAKEN, "🎈", 7, 2, "row", "b"),
      story(AT_START, "🌹", 6, 4, "row", "a"),
      story(TAKEN, "🌹", 9, 5, "row", "b"),
    ],
  },

  // ── 4-6 حل المسألة (pp. 108 to 109): the countryside, the schoolyard, the bricks ──
  {
    section: s6,
    type: "number_fill",
    title: "فِي الرِّيفِ",
    subtitle: "أَكْتُبُ جُمْلَةَ الطَّرْحِ",
    emoji: "🌄",
    color,
    rounds: [
      story("طَارَ عُصْفُورٌ. كَمِ الْبَاقِي عَلَى الشَّجَرَةِ؟", "🐦", 5, 1),
      story("سَقَطَ تُفَّاحٌ عَلَى الأَرْضِ. كَمِ الْبَاقِي عَلَى الشَّجَرَةِ؟", "🍎", 7, 3),
      story("قَفَزَتْ أَرَانِبُ بَعِيدًا. كَمِ الْبَاقِي؟", "🐇", 6, 2),
      story("ذَهَبَ لَاعِبَانِ. كَمِ الْبَاقِي فِي الْمَلْعَبِ؟", "🏃", 8, 2),
      story("فِي سَاحَةِ الْمَدْرَسَةِ ذَهَبَ وَلَدٌ وَبِنْتٌ. كَمِ الْبَاقِي؟", "🧒", 8, 2),
    ],
  },
  {
    section: s6,
    type: "number_fill",
    title: "الطُّوبُ يَسْقُطُ",
    subtitle: "كَمِ الْبَاقِي؟",
    emoji: "🧱",
    color,
    rounds: [
      story("سَقَطَ طُوبٌ. كَمِ الْبَاقِي؟", "🧱", 5, 3),
      story(LEFT, "🧱", 6, 2),
      story(LEFT, "🧱", 4, 1),
      story(LEFT, "🧱", 7, 4),
      story(LEFT, "🧱", 9, 6),
    ],
  },

  // ── 4-7 اكتشاف الأنماط (pp. 110 to 111): one more each time, counting back. One round is on
  // screen at a time, so the book's pattern of differences cannot be seen at once: the first
  // lesson is plain "take away one" with growing numbers. ──
  {
    section: s7,
    type: "number_fill",
    title: "أَطْرَحُ وَاحِدًا",
    subtitle: LEFT,
    emoji: "🔁",
    color,
    rounds: [
      fact(2, 1, LEFT),
      fact(3, 1, LEFT),
      fact(4, 1, LEFT),
      fact(5, 1, LEFT),
      fact(6, 1, LEFT),
      fact(7, 1, LEFT),
    ],
  },
  {
    section: s7,
    type: "number_fill",
    title: "أَعُدُّ إِلَى الْوَرَاءِ",
    subtitle: "١٠، ٩، ٨ …",
    emoji: "🔙",
    color,
    rounds: [
      row([10, 9, 8, "?"], 7, BACK),
      row([7, 6, "?", 4], 5, BACK),
      row([4, 3, 2, "?"], 1, BACK),
      row([10, 8, 6, "?"], 4, BACK_2),
      row([6, "?", 2, 0], 4, BACK_2),
    ],
  },

  // ── 4-8 تدريبات عامة (pp. 112 to 113): triangles, pens, balloons, footballs, the butterflies ──
  {
    section: s8,
    type: "number_fill",
    title: "تَدْرِيبَاتٌ",
    subtitle: "أَكْتُبُ الْبَاقِي",
    emoji: "✏️",
    color,
    rounds: [
      story(LEFT, TRIANGLE, 4, 1),
      story(LEFT, "✏️", 6, 2),
      story("لَمْ يَطِرْ أَيُّ بَالُونٍ. كَمِ الْبَاقِي؟", "🎈", 4, 0),
      story(LEFT, "⚽", 5, 3),
      fact(10, 4, LEFT),
      fact(8, 7, DOWN, "vertical"),
    ],
  },
  {
    section: s8,
    type: "number_fill",
    title: "الْفَرَاشَةُ وَالنَّجْمَةُ",
    subtitle: "أُفَكِّرُ",
    emoji: "🦋",
    color,
    rounds: [
      fact(7, 5, LEFT),
      fact(9, 5, LEFT),
      fact(8, 2, LEFT),
      fact(10, 2, LEFT),
      fact(8, 5, COMPLETE, "row", "b"),
      fact(6, 3, COMPLETE, "row", "a"),
    ],
  },

  // ── اختبار الوحدة (p. 114) ──
  {
    section: TEST,
    type: "number_fill",
    title: "اخْتِبَارُ الْوَحْدَةِ",
    subtitle: "أَشْطُبُ وَأَعُدُّ الْبَاقِي",
    emoji: "📝",
    color,
    rounds: [
      story(LEFT, "🐦", 3, 1),
      story(LEFT, "🍎", 6, 3),
      story(LEFT, "🎾", 7, 2),
      story(LEFT, TRIANGLE, 5, 4),
    ],
  },
  {
    section: TEST,
    type: "number_fill",
    title: "أَطْرَحُ",
    subtitle: "أُفُقِيًّا وَرَأْسِيًّا",
    emoji: "📝",
    color,
    rounds: [
      fact(8, 4, LEFT),
      fact(7, 1, LEFT),
      fact(9, 5, DOWN, "vertical"),
      fact(10, 3, DOWN, "vertical"),
      fact(6, 0, LEFT),
      fact(5, 5, DOWN, "vertical"),
    ],
  },
  {
    section: TEST,
    type: "number_fill",
    title: "أُكْمِلُ النَّمَطَ",
    subtitle: "أَعُدُّ وَأُكْمِلُ",
    emoji: "📝",
    color,
    rounds: [
      row([2, 4, 6, "?"], 8, BY_TWOS),
      row([9, 8, "?", 6], 7, BACK),
      row([8, 6, "?", 2], 4, BACK_2),
      row([5, 4, 3, "?"], 2, BACK),
    ],
  },
];

export const mathBookUnit4: Unit = {
  id: "math-u4",
  number: 4,
  title: "الْوَحْدَةُ الرَّابِعَةُ",
  theme: "الطَّرْحُ ضِمْنَ الْعَدَدِ ١٠",
  emoji: "➖",
  emblem: "pomegranates",
  color,
  badgeLabel: "أَطْرَحُ",
  lessons: numberMathLessons(4, drafts),
};
