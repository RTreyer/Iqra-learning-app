// Book Unit 3 الجمع ضمن العدد ١٠, الرياضيات Part 1 (Sana'a 2026), pp. 65 to 90.
// Notes: docs/content/textbooks/math-part1/unit-03.md. Review status: docs/CONTENT_REVIEW.md
// Every book lesson is a section of app lessons, in book order, with the book's objects and
// sums. Sums are cells in reading order: [3, "+", 2, "=", "?"] shows ٣ + ٢ = ؟ from the right.
// Prompts give the task only; the child reads the number sentence. The two `arithmetic`
// lessons keep their spoken word form, the book's "٣ زائد ٢ يساوي ٥".
import type {
  ArithmeticRound,
  MathPic,
  NumberFillRound,
  PictureChoiceRound,
  Unit,
} from "../types.ts";
import {
  MATH_COLOR,
  bookSection,
  numberMathLessons,
  pics,
  shape,
  type MathLessonDraft,
} from "./mathKit.ts";

const color = MATH_COLOR;

const SUM = "كَمِ الْمَجْمُوعُ؟";
const MISSING = "مَا الْعَدَدُ النَّاقِصُ؟";
const COMPLETE = "أُكْمِلُ: مَا الْعَدَدُ النَّاقِصُ؟";
const SWAPPED = "بَدَّلْنَا الْعَدَدَيْنِ. كَمِ الْمَجْمُوعُ؟";
const PICK_GROUP = "أَسْتَمِعُ وَأَخْتَارُ الْمَجْمُوعَةَ";

/** "أَجْمَعُ الزَّرَافَاتِ. كَمِ الْمَجْمُوعُ؟" for a picture story; the noun is accusative. */
const addThe = (nounAcc: string) => `أَجْمَعُ ${nounAcc}. ${SUM}`;

type Opts = { prompt?: string; pics?: MathPic[]; vertical?: boolean };

/** a + b = ?, in a row or vertical, with an optional picture story. */
function add(a: number, b: number, options: number[], opts: Opts = {}): NumberFillRound {
  return sentence([a, "+", b, "=", "?"], options, { prompt: SUM, ...opts });
}

/** A sum with one addend missing: a + ? = c or ? + b = c. */
function addend(
  a: number | "?",
  b: number | "?",
  c: number,
  options: number[],
  opts: Opts = {},
): NumberFillRound {
  return sentence([a, "+", b, "=", c], options, { prompt: COMPLETE, ...opts });
}

function sentence(cells: NumberFillRound["cells"], options: number[], opts: Opts): NumberFillRound {
  return {
    prompt: opts.prompt ?? SUM,
    cells,
    layout: opts.vertical ? "vertical" : "row",
    options,
    ...(opts.pics ? { pics: opts.pics } : {}),
  };
}

/** A counting row with one gap. */
const pattern = (cells: NumberFillRound["cells"], options: number[]): NumberFillRound => ({
  prompt: "أَكْتَشِفُ النَّمَطَ. مَا الْعَدَدُ النَّاقِصُ؟",
  cells,
  layout: "sequence",
  options,
});

/** Two parts of a story, the first part on the right: `a` of one picture, `b` of another. */
const two = (first: string, a: number, second: string, b: number): MathPic[] => [
  ...pics(first, a),
  ...pics(second, b),
];

/** Two coloured parts of drawn shapes (cubes, dots, circles). */
const parts = (
  id: "circle" | "square",
  a: number,
  b: number,
  colors: ["red" | "yellow", "blue" | "yellow"] = ["red", "blue"],
): MathPic[] => [
  ...Array.from({ length: a }, () => shape(id, colors[0])),
  ...Array.from({ length: b }, () => shape(id, colors[1])),
];

/** Hear a joining story, then tap the group with all of them. */
function joinStory(prompt: string, emoji: string, n: number, counts: number[]): PictureChoiceRound {
  return { prompt, choices: counts.map((c) => pics(emoji, c)), correctIndex: counts.indexOf(n) };
}

const plus = (a: number, b: number, options: number[]): ArithmeticRound => ({
  a,
  b,
  op: "+",
  options,
});

const s1 = bookSection(3, 1, "التَّهْيِئَةُ لِلْجَمْعِ");
const s2 = bookSection(3, 2, "الْجَمْعُ ضِمْنَ ٥");
const s3 = bookSection(3, 3, "حَقَائِقُ الْجَمْعِ ضِمْنَ ٥");
const s4 = bookSection(3, 4, "الْجَمْعُ ضِمْنَ ١٠");
const s5 = bookSection(3, 5, "الْجَمْعُ الرَّأْسِيُّ ضِمْنَ ١٠");
const s6 = bookSection(3, 6, "حَقَائِقُ الْجَمْعِ ضِمْنَ ١٠");
const s7 = bookSection(3, 7, "حَلُّ الْمَسْأَلَةِ");
const s8 = bookSection(3, 8, "اكْتِشَافُ الأَنْمَاطِ");
const s9 = bookSection(3, 9, "تَدْرِيبَاتٌ عَامَّةٌ");
const TEST = "اخْتِبَارُ الْوَحْدَةِ";

const drafts: MathLessonDraft[] = [
  // ── 3-1 التهيئة للجمع (pp. 65 to 67): who joins, how many now ──
  {
    section: s1,
    type: "picture_choice",
    title: "كَمْ صَارُوا؟",
    subtitle: PICK_GROUP,
    emoji: "⚽",
    color,
    rounds: [
      joinStory(
        "ثَلَاثَةُ أَوْلَادٍ يَلْعَبُونَ، وَجَاءَ وَلَدَانِ. أَيُّ مَجْمُوعَةٍ فِيهَا كُلُّ الأَوْلَادِ؟",
        "👦",
        5,
        [4, 5, 6],
      ),
      joinStory(
        "ثَلَاثَةُ كَتَاكِيتَ عَلَى الْغُصْنِ، وَجَاءَ كَتْكُوتٌ. أَيُّ مَجْمُوعَةٍ فِيهَا كُلُّ الْكَتَاكِيتِ؟",
        "🐤",
        4,
        [3, 5, 4],
      ),
      joinStory(
        "أَرْبَعُ سَلَاحِفَ فِي الْمَاءِ، وَسُلَحْفَاةٌ عَلَى الشَّاطِئِ. أَيُّ مَجْمُوعَةٍ فِيهَا كُلُّ السَّلَاحِفِ؟",
        "🐢",
        5,
        [5, 3, 4],
      ),
      joinStory(
        "حَمَامَتَانِ عَلَى الشَّجَرَةِ، وَجَاءَتْ ثَلَاثُ حَمَامَاتٍ. أَيُّ مَجْمُوعَةٍ فِيهَا كُلُّ الْحَمَامِ؟",
        "🕊️",
        5,
        [4, 6, 5],
      ),
    ],
  },
  {
    section: s1,
    type: "picture_choice",
    title: "الأَرَانِبُ وَالْبَطُّ",
    subtitle: PICK_GROUP,
    emoji: "🐇",
    color,
    rounds: [
      joinStory(
        "أَرْنَبَانِ، وَجَاءَ أَرْنَبَانِ. أَيُّ مَجْمُوعَةٍ فِيهَا كُلُّ الأَرَانِبِ؟",
        "🐇",
        4,
        [3, 4, 5],
      ),
      joinStory(
        "نَعْجَةٌ وَكَبْشٌ. أَيُّ مَجْمُوعَةٍ فِيهَا الْغَنَمُ كُلُّهَا؟",
        "🐑",
        2,
        [2, 1, 3],
      ),
      joinStory(
        "خَمْسُ بَطَّاتٍ فِي الْبِرْكَةِ، وَجَاءَتْ بَطَّةٌ. أَيُّ مَجْمُوعَةٍ فِيهَا كُلُّ الْبَطِّ؟",
        "🦆",
        6,
        [5, 7, 6],
      ),
    ],
  },

  // ── 3-2 الجمع ضمن ٥ (pp. 68 to 71): the family at the table, giraffes, flowers, flags ──
  {
    section: s2,
    type: "number_fill",
    title: "أَجْمَعُ ضِمْنَ ٥",
    subtitle: "٣ زَائِدُ ٢ يُسَاوِي ٥",
    emoji: "➕",
    color,
    rounds: [
      add(3, 2, [4, 5, 6], {
        prompt: `الأُسْرَةُ حَوْلَ الْمَائِدَةِ. ${SUM}`,
        pics: [{ emoji: "👨" }, { emoji: "🧕" }, { emoji: "🧕" }, { emoji: "👧" }, { emoji: "👦" }],
      }),
      add(1, 3, [4, 3, 5], { prompt: addThe("الزَّرَافَاتِ"), pics: pics("🦒", 4) }),
      add(4, 1, [5, 4, 3], { prompt: addThe("الأَزْهَارَ"), pics: two("🌷", 4, "🌹", 1) }),
      add(2, 3, [4, 6, 5], { prompt: addThe("الأَطْفَالَ"), pics: two("👦", 2, "👧", 3) }),
      add(3, 2, [5, 4, 6], { prompt: addThe("الأَرَانِبَ"), pics: pics("🐇", 5) }),
      add(4, 1, [3, 5, 4], {
        prompt: `الْبِنْتُ تَحْمِلُ أَعْلَامَ الْيَمَنِ. ${SUM}`,
        pics: pics("🇾🇪", 5),
      }),
    ],
  },
  {
    section: s2,
    type: "number_fill",
    title: "أَعُدُّ وَأَجْمَعُ",
    subtitle: SUM,
    emoji: "🍎",
    color,
    rounds: [
      add(1, 1, [2, 1, 3], { prompt: addThe("الْبَنَاتِ"), pics: pics("👧", 2) }),
      add(2, 1, [3, 2, 4], { prompt: addThe("التُّفَّاحَ"), pics: pics("🍎", 3) }),
      add(3, 1, [4, 5, 3], { prompt: addThe("النُّجُومَ"), pics: pics("⭐", 4) }),
      add(2, 2, [3, 4, 5], { prompt: addThe("الْمُكَعَّبَاتِ"), pics: parts("square", 2, 2) }),
      add(3, 1, [5, 3, 4], { prompt: addThe("الْعَصَافِيرَ"), pics: pics("🐦", 4) }),
      add(3, 2, [5, 6, 4], { prompt: addThe("الطَّمَاطِمَ"), pics: pics("🍅", 5) }),
    ],
  },
  {
    section: s2,
    type: "arithmetic",
    title: "زَائِدُ وَيُسَاوِي",
    subtitle: "٣ زَائِدُ ٢ يُسَاوِي ٥",
    emoji: "🗣️",
    color,
    rounds: [
      plus(1, 2, [3, 2, 4]),
      plus(2, 2, [4, 3, 5]),
      plus(3, 2, [5, 4, 6]),
      plus(1, 4, [5, 6, 4]),
      plus(2, 3, [4, 5, 6]),
    ],
  },
  {
    section: s2,
    type: "number_fill",
    title: "أُفَكِّرُ: الْعَدَدُ النَّاقِصُ",
    subtitle: "أُكْمِلُ الْجُمْلَةَ",
    emoji: "🤔",
    color,
    rounds: [
      addend(2, "?", 3, [1, 2, 3]),
      addend("?", 4, 5, [1, 0, 2]),
      addend(1, "?", 3, [2, 1, 3]),
      addend(3, "?", 5, [2, 3, 1]),
      addend("?", 2, 4, [2, 1, 3]),
      addend(2, "?", 5, [3, 2, 4]),
    ],
  },

  // ── 3-3 حقائق الجمع ضمن ٥ (pp. 72 to 73): apples on plates, the order does not matter ──
  {
    section: s3,
    type: "number_fill",
    title: "أُبَدِّلُ الْعَدَدَيْنِ",
    subtitle: "٢ + ١ = ١ + ٢",
    emoji: "🔁",
    color,
    rounds: [
      add(2, 1, [3, 2, 4], { prompt: addThe("التُّفَّاحَ"), pics: two("🍎", 2, "🍏", 1) }),
      add(1, 2, [2, 3, 4], { prompt: SWAPPED, pics: two("🍏", 1, "🍎", 2) }),
      add(3, 1, [4, 3, 5], { prompt: addThe("الأَزْهَارَ"), pics: two("🌷", 3, "🌹", 1) }),
      add(1, 3, [5, 4, 3], { prompt: SWAPPED, pics: two("🌹", 1, "🌷", 3) }),
      addend(3, "?", 4, [1, 2, 0]),
      addend("?", 3, 4, [2, 1, 3]),
    ],
  },
  {
    section: s3,
    type: "number_fill",
    title: "حَقَائِقُ الْعَدَدِ ٥",
    subtitle: "٤ + ١ = ٥",
    emoji: "🇾🇪",
    color,
    rounds: [
      addend(4, "?", 5, [1, 2, 0]),
      addend(1, "?", 5, [4, 3, 5]),
      addend(3, "?", 5, [2, 1, 3]),
      addend(2, "?", 5, [3, 2, 4]),
      addend(1, "?", 4, [3, 2, 4]),
      addend(2, "?", 4, [2, 1, 3]),
    ],
  },

  // ── 3-4 الجمع ضمن ١٠ (pp. 74 to 75): the football team, adding zero ──
  {
    section: s4,
    type: "number_fill",
    title: "أَجْمَعُ ضِمْنَ ١٠",
    subtitle: "٦ + ٢ = ٨",
    emoji: "⚽",
    color,
    rounds: [
      add(6, 2, [7, 8, 9], { prompt: addThe("اللَّاعِبِينَ"), pics: two("👦", 6, "🏃", 2) }),
      add(5, 0, [5, 6, 4], {
        prompt: `صَحْنٌ فِيهِ تُفَّاحٌ، وَصَحْنٌ فَارِغٌ. ${SUM}`,
        pics: pics("🍎", 5),
      }),
      add(4, 3, [6, 7, 8], { prompt: addThe("الطُّيُورَ"), pics: pics("🐦", 7) }),
      add(5, 3, [8, 9, 7], { prompt: addThe("الْكُرَاتِ"), pics: pics("⚽", 8) }),
    ],
  },
  {
    section: s4,
    type: "number_fill",
    title: "أَجْمَعُ",
    subtitle: SUM,
    emoji: "➕",
    color,
    rounds: [
      add(5, 4, [9, 8, 10]),
      add(8, 2, [10, 9, 8]),
      add(7, 3, [9, 10, 7]),
      add(9, 0, [9, 10, 0]),
      add(0, 6, [0, 7, 6]),
      add(4, 4, [8, 7, 9]),
    ],
  },
  {
    section: s4,
    type: "number_fill",
    title: "أُفَكِّرُ: الْعَدَدُ النَّاقِصُ",
    subtitle: "أُكْمِلُ الْجُمْلَةَ",
    emoji: "🤔",
    color,
    rounds: [
      addend(4, "?", 6, [2, 3, 1]),
      addend(6, "?", 8, [1, 2, 3]),
      addend(4, "?", 10, [6, 5, 4]),
      addend(5, "?", 7, [3, 2, 1]),
      addend("?", 3, 9, [6, 5, 7]),
      addend(7, "?", 10, [3, 2, 4]),
    ],
  },

  // ── 3-5 الجمع الرأسي ضمن ١٠ (pp. 76 to 77): red and yellow flowers, balls, marbles ──
  {
    section: s5,
    type: "number_fill",
    title: "الْجَمْعُ الرَّأْسِيُّ",
    subtitle: "٤ + ٣ = ٧",
    emoji: "🌹",
    color,
    rounds: [
      add(4, 3, [7, 6, 8], {
        prompt: addThe("الأَزْهَارَ"),
        pics: two("🌹", 4, "🌼", 3),
        vertical: true,
      }),
      add(6, 2, [7, 8, 9], { prompt: addThe("الْكُرَاتِ"), pics: pics("⚽", 8), vertical: true }),
      add(2, 6, [8, 9, 7], { prompt: SWAPPED, pics: pics("⚽", 8), vertical: true }),
      add(3, 5, [8, 7, 9], {
        prompt: addThe("الدَّوَائِرَ"),
        pics: parts("circle", 3, 5),
        vertical: true,
      }),
      add(3, 4, [6, 7, 8], {
        prompt: addThe("الأَزْهَارَ"),
        pics: two("🌹", 3, "🌼", 4),
        vertical: true,
      }),
      add(4, 3, [8, 6, 7], { prompt: SWAPPED, pics: two("🌹", 4, "🌼", 3), vertical: true }),
    ],
  },
  {
    section: s5,
    type: "number_fill",
    title: "أَجْمَعُ رَأْسِيًّا",
    subtitle: SUM,
    emoji: "⬇️",
    color,
    rounds: [
      add(4, 6, [10, 9, 8], { vertical: true }),
      add(10, 0, [10, 0, 9], { vertical: true }),
      add(7, 2, [8, 9, 10], { vertical: true }),
      add(3, 2, [5, 6, 4], { vertical: true }),
      add(9, 0, [9, 10, 8], { vertical: true }),
      add(0, 9, [0, 9, 10], { vertical: true }),
    ],
  },

  // ── 3-6 حقائق الجمع ضمن ١٠ (pp. 78 to 81): ways to make 6 to 10, part and whole ──
  {
    section: s6,
    type: "number_fill",
    title: "حَقَائِقُ ٦ وَ٧",
    subtitle: "أُكْمِلُ الْجُمْلَةَ",
    emoji: "🌼",
    color,
    rounds: [
      addend(0, "?", 6, [6, 5, 0], {
        prompt: `أَعُدُّ الأَزْهَارَ الصَّفْرَاءَ. ${MISSING}`,
        pics: pics("🌼", 6),
      }),
      addend(1, "?", 6, [4, 5, 6], {
        prompt: `أَعُدُّ الأَزْهَارَ الصَّفْرَاءَ. ${MISSING}`,
        pics: two("🌹", 1, "🌼", 5),
      }),
      addend(2, "?", 6, [4, 3, 5], {
        prompt: `أَعُدُّ الأَزْهَارَ الصَّفْرَاءَ. ${MISSING}`,
        pics: two("🌹", 2, "🌼", 4),
      }),
      addend(3, "?", 6, [2, 3, 4], {
        prompt: `أَعُدُّ الأَزْهَارَ الصَّفْرَاءَ. ${MISSING}`,
        pics: two("🌹", 3, "🌼", 3),
      }),
      addend(2, "?", 7, [5, 4, 6], {
        prompt: `أَعُدُّ الدَّوَائِرَ الزَّرْقَاءَ. ${MISSING}`,
        pics: parts("circle", 2, 5),
      }),
      addend(4, "?", 7, [2, 3, 4], {
        prompt: `أَعُدُّ الدَّوَائِرَ الزَّرْقَاءَ. ${MISSING}`,
        pics: parts("circle", 4, 3),
      }),
    ],
  },
  {
    section: s6,
    type: "number_fill",
    title: "حَقَائِقُ ٨ وَ٩",
    subtitle: "أُكْمِلُ الْجُمْلَةَ",
    emoji: "🌸",
    color,
    rounds: [
      addend(1, "?", 8, [7, 6, 8]),
      addend(2, "?", 8, [5, 6, 7]),
      addend(5, "?", 8, [3, 4, 2]),
      addend(3, "?", 9, [6, 5, 7]),
      addend(6, "?", 9, [2, 3, 4]),
      addend(4, "?", 9, [5, 4, 6]),
    ],
  },
  {
    section: s6,
    type: "number_fill",
    title: "حَقَائِقُ ١٠",
    subtitle: "أُكْمِلُ الْجُمْلَةَ",
    emoji: "🔟",
    color,
    rounds: [
      addend(0, "?", 10, [10, 9, 0]),
      addend(3, "?", 10, [6, 7, 8]),
      addend(5, "?", 10, [5, 4, 6]),
      addend("?", 8, 10, [2, 3, 1]),
      addend(6, "?", 10, [3, 4, 5]),
      addend(1, "?", 10, [9, 8, 10]),
    ],
  },
  {
    section: s6,
    type: "number_fill",
    title: "الْجُزْءُ وَالْكُلُّ",
    subtitle: "٣ + ٤ = ٧",
    emoji: "🧩",
    color,
    rounds: [
      add(3, 4, [7, 6, 8], { prompt: "مَا الْكُلُّ؟", pics: parts("circle", 3, 4) }),
      addend(3, "?", 7, [3, 4, 5], {
        prompt: "مَا الْجُزْءُ النَّاقِصُ؟",
        pics: pics("🟡", 7),
      }),
      add(2, 4, [5, 6, 7], { prompt: "مَا الْكُلُّ؟", pics: parts("circle", 2, 4) }),
      addend(5, "?", 8, [3, 2, 4], {
        prompt: "مَا الْجُزْءُ النَّاقِصُ؟",
        pics: pics("🟡", 8),
      }),
      addend("?", 4, 9, [4, 5, 6], {
        prompt: "مَا الْجُزْءُ النَّاقِصُ؟",
        pics: pics("🟡", 9),
      }),
    ],
  },

  // ── 3-7 حل المسألة (pp. 82 to 83): balls in baskets, shirts, school things ──
  {
    section: s7,
    type: "number_fill",
    title: "أَحُلُّ الْمَسْأَلَةَ",
    subtitle: "أَنْظُرُ إِلَى الصُّورَةِ وَأَجْمَعُ",
    emoji: "🎒",
    color,
    rounds: [
      add(4, 2, [6, 5, 7], {
        prompt: "يَضَعُ الْوَلَدُ الْكُرَاتِ فِي السَّلَّةِ. كَمْ كُرَةً صَارَتْ فِي السَّلَّةِ؟",
        pics: pics("⚽", 6),
      }),
      add(5, 0, [5, 6, 0], {
        prompt: "سَلَّةٌ فِيهَا كُرَاتٌ، وَسَلَّةٌ فَارِغَةٌ. كَمْ كُرَةً فِي السَّلَّتَيْنِ؟",
        pics: pics("⚽", 5),
      }),
      add(4, 4, [7, 8, 9], {
        prompt: "قُمْصَانٌ صَفْرَاءُ وَقُمْصَانٌ زَرْقَاءُ. كَمْ قَمِيصًا مَعًا؟",
        pics: pics("👕", 8),
      }),
      add(2, 3, [5, 4, 6], {
        prompt: "مَعَ الْبِنْتِ مَسَاطِرُ، وَمَعَ الْوَلَدِ مَسَاطِرُ. كَمْ مِسْطَرَةً مَعَهُمَا؟",
        pics: pics("📏", 5),
      }),
      add(4, 3, [8, 7, 6], {
        prompt: "مَعَ الْبِنْتِ أَقْلَامٌ، وَمَعَ الْوَلَدِ أَقْلَامٌ. كَمْ قَلَمًا مَعَهُمَا؟",
        pics: pics("✏️", 7),
      }),
      add(1, 1, [2, 1, 3], {
        prompt: "لِلْبِنْتِ حَقِيبَةٌ، وَلِلْوَلَدِ حَقِيبَةٌ. كَمْ حَقِيبَةً مَعَهُمَا؟",
        pics: pics("🎒", 2),
      }),
    ],
  },

  // ── 3-8 اكتشاف الأنماط (pp. 84 to 85): red and blue cubes, odd and even numbers, +١ ──
  {
    section: s8,
    type: "number_fill",
    title: "أَكْتَشِفُ النَّمَطَ",
    subtitle: "٥ + ٠، ٤ + ١، ٣ + ٢",
    emoji: "🧱",
    color,
    rounds: [
      addend(5, "?", 5, [0, 1, 5], {
        prompt: `أَعُدُّ الْمُكَعَّبَاتِ الزَّرْقَاءَ. ${MISSING}`,
        pics: parts("square", 5, 0),
      }),
      addend(4, "?", 5, [1, 0, 2], {
        prompt: `أَعُدُّ الْمُكَعَّبَاتِ الزَّرْقَاءَ. ${MISSING}`,
        pics: parts("square", 4, 1),
      }),
      addend(3, "?", 5, [2, 1, 3], {
        prompt: `أَعُدُّ الْمُكَعَّبَاتِ الزَّرْقَاءَ. ${MISSING}`,
        pics: parts("square", 3, 2),
      }),
      addend(2, "?", 5, [3, 2, 4], {
        prompt: `أَعُدُّ الْمُكَعَّبَاتِ الزَّرْقَاءَ. ${MISSING}`,
        pics: parts("square", 2, 3),
      }),
      addend(1, "?", 5, [4, 3, 5], {
        prompt: `أَعُدُّ الْمُكَعَّبَاتِ الزَّرْقَاءَ. ${MISSING}`,
        pics: parts("square", 1, 4),
      }),
    ],
  },
  {
    section: s8,
    type: "number_fill",
    title: "أَنْمَاطُ الأَعْدَادِ",
    subtitle: "١، ٣، ٥، ٧، ٩",
    emoji: "🔢",
    color,
    rounds: [
      pattern([1, 3, "?", 7], [5, 4, 6]),
      pattern([5, 7, "?"], [9, 8, 10]),
      pattern([2, "?", 6, 8], [4, 3, 5]),
      pattern([6, 8, "?"], [10, 9, 7]),
      add(5, 1, [6, 5, 7], { prompt: `أَجْمَعُ وَاحِدًا. ${SUM}` }),
      add(6, 1, [8, 7, 6], { prompt: `أَجْمَعُ وَاحِدًا. ${SUM}` }),
    ],
  },

  // ── 3-9 تدريبات عامة (pp. 86 to 87): dominoes, two coloured circles, the pencils ──
  {
    section: s9,
    type: "number_fill",
    title: "أَجْمَعُ النِّقَاطَ",
    subtitle: SUM,
    emoji: "🎲",
    color,
    rounds: [
      add(5, 2, [7, 6, 8], { prompt: addThe("النِّقَاطَ"), pics: parts("circle", 5, 2) }),
      add(3, 3, [5, 6, 7], { prompt: addThe("النِّقَاطَ"), pics: parts("circle", 3, 3) }),
      add(6, 0, [6, 0, 7], { prompt: addThe("الدَّوَائِرَ"), pics: parts("circle", 6, 0) }),
      add(5, 1, [5, 6, 4], { prompt: addThe("الدَّوَائِرَ"), pics: parts("circle", 5, 1) }),
      add(4, 2, [6, 7, 5], { prompt: addThe("الدَّوَائِرَ"), pics: parts("circle", 4, 2) }),
      add(7, 3, [9, 10, 8], {
        prompt: "مَعَ الْوَلَدِ أَقْلَامٌ، وَمَعَ الْبِنْتِ أَقْلَامٌ. كَمْ قَلَمًا مَعَهُمَا؟",
        pics: two("✏️", 7, "🖍️", 3),
      }),
    ],
  },
  {
    section: s9,
    type: "arithmetic",
    title: "أَقْرَأُ وَأَجْمَعُ",
    subtitle: SUM,
    emoji: "➕",
    color,
    rounds: [
      plus(5, 3, [8, 7, 9]),
      plus(2, 7, [8, 9, 10]),
      plus(6, 4, [10, 9, 8]),
      plus(8, 1, [7, 8, 9]),
      plus(0, 7, [7, 0, 8]),
      plus(3, 3, [5, 7, 6]),
    ],
  },

  // ── اختبار الوحدة (p. 88): sums in rows and vertical, the chicks, missing addends to ٦ ──
  {
    section: TEST,
    type: "number_fill",
    title: "اخْتِبَارُ الْوَحْدَةِ",
    subtitle: SUM,
    emoji: "📝",
    color,
    rounds: [
      add(3, 4, [7, 6, 8]),
      add(6, 2, [9, 8, 7]),
      add(1, 5, [6, 5, 7]),
      add(4, 0, [0, 4, 5]),
      add(2, 7, [9, 8, 10]),
      add(5, 5, [10, 9, 8]),
    ],
  },
  {
    section: TEST,
    type: "number_fill",
    title: "أَجْمَعُ رَأْسِيًّا",
    subtitle: SUM,
    emoji: "📝",
    color,
    rounds: [
      add(5, 2, [7, 6, 8], { prompt: addThe("الْكَتَاكِيتَ"), pics: pics("🐤", 7) }),
      add(5, 1, [6, 5, 7], { vertical: true }),
      add(1, 5, [5, 6, 7], { vertical: true }),
      add(4, 2, [6, 7, 5], { vertical: true }),
      add(2, 4, [7, 5, 6], { vertical: true }),
    ],
  },
  {
    section: TEST,
    type: "number_fill",
    title: "أُكْمِلُ الْجُمْلَةَ",
    subtitle: "أُكْمِلُ: مَا الْعَدَدُ النَّاقِصُ؟",
    emoji: "📝",
    color,
    rounds: [
      addend(4, "?", 6, [2, 3, 1]),
      addend("?", 1, 6, [5, 4, 6]),
      addend(3, "?", 6, [3, 2, 4]),
      addend(2, "?", 6, [4, 3, 5]),
      addend(5, "?", 6, [1, 0, 2]),
    ],
  },
];

export const mathBookUnit3: Unit = {
  id: "math-u3",
  number: 3,
  title: "الْوَحْدَةُ الثَّالِثَةُ",
  theme: "الْجَمْعُ ضِمْنَ الْعَدَدِ ١٠",
  emoji: "➕",
  color,
  badgeLabel: "أَجْمَعُ",
  lessons: numberMathLessons(3, drafts),
};
