// Book Unit 1 التصنيف والأنماط, الرياضيات Part 1 (Sana'a 2026), pp. 7 to 32.
// Notes: docs/content/textbooks/math-part1/unit-01.md. Spec: docs/superpowers/specs/2026-11-05-math-unit1-design.md
// Pre number: every task is a picture. Every book lesson is a section of app lessons, in book
// order. Lesson 1-4 (فَوْقَ، تَحْتَ، دَاخِلَ، خَارِجَ) is left out: emoji cannot show one thing
// under or inside another without a drawn scene, and a child who hears "تَحْتَ" must see it.
// The book's hexagon, pentagon, rhombus and ellipse become the app's four shapes; colour is
// only the cue when the prompt names the colour.
import type {
  CompareRound,
  MathColor,
  MathPic,
  PictureChoiceRound,
  ShapeId,
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

/** An emoji picture, optionally small or big. */
const e = (emoji: string, size?: "small" | "big"): MathPic => (size ? { emoji, size } : { emoji });

/** Same as the model: the model is shown above, the answer is the choice equal to it. */
function sameAs(
  prompt: string,
  model: MathPic,
  choices: MathPic[],
  answer: number,
): PictureChoiceRound {
  return { prompt, model, choices: choices.map((c) => [c]), correctIndex: answer };
}

/** Odd one out among single pictures: shapes, or things. */
const ODD = "مَا الشَّكْلُ الْمُخْتَلِفُ؟";
const ODD_THING = "مَا الشَّيْءُ الْمُخْتَلِفُ؟";
function odd(choices: MathPic[], answer: number, prompt = ODD): PictureChoiceRound {
  return { prompt, choices: choices.map((c) => [c]), correctIndex: answer };
}

/** Pick one group among groups. */
function group(prompt: string, choices: MathPic[][], answer: number): PictureChoiceRound {
  return { prompt, choices, correctIndex: answer };
}

/** "What comes next?": the row is shown, then the choices. */
const NEXT = "مَا التَّالِي فِي النَّمَطِ؟";
function next(
  pattern: MathPic[],
  choices: MathPic[],
  answer: number,
  prompt = NEXT,
): PictureChoiceRound {
  return { prompt, pattern, choices: choices.map((c) => [c]), correctIndex: answer };
}

/** `n` copies of a shape, for patterns and groups. */
const shapes = (id: ShapeId, c: MathColor, n: number, size?: "small" | "big") =>
  Array.from({ length: n }, () => shape(id, c, size));

/** Repeat a unit of pictures until `length` pictures: [a, b] → a b a b a. */
function repeat(unit: MathPic[], length: number): MathPic[] {
  return Array.from({ length }, (_, i) => unit[i % unit.length]);
}

/**
 * Two groups with words, about the first group (on the right). The question names the first
 * group first and offers all three buttons, as in Unit 2:
 * "الْوُرُودُ أَكْثَرُ أَمْ أَقَلُّ أَمْ تُسَاوِي النَّحْلَ؟".
 */
function compareGroups(
  prompt: string,
  [firstEmoji, a]: [string, number],
  [secondEmoji, b]: [string, number],
): CompareRound {
  return {
    prompt,
    first: { pics: pics(firstEmoji, a) },
    second: { pics: pics(secondEmoji, b) },
    mode: "words",
  };
}

const ROSES_BEES = "الْوُرُودُ أَكْثَرُ أَمْ أَقَلُّ أَمْ تُسَاوِي النَّحْلَ؟";
const BEES_ROSES = "النَّحْلُ أَكْثَرُ أَمْ أَقَلُّ أَمْ يُسَاوِي الْوُرُودَ؟";
const COMPARE_SUBTITLE = "أَكْثَرُ مِنْ، أَقَلُّ مِنْ، يُسَاوِي";
const MORE = "أَيُّ مَجْمُوعَةٍ أَكْثَرُ؟";
const FEWER = "أَيُّ مَجْمُوعَةٍ أَقَلُّ؟";
const ALIKE = "أَيُّ مَجْمُوعَةٍ أَشْيَاؤُهَا مُتَشَابِهَةٌ؟";
const NEXT_SUBTITLE = "مَا التَّالِي؟";

const s1 = bookSection(1, 1, "التَّصْنِيفُ وَفْقَ خَاصِيَّةٍ");
const s2 = bookSection(1, 2, "التَّصْنِيفُ وَفْقَ خَاصِيَّتَيْنِ");
const s3 = bookSection(1, 3, "أَكْثَرُ مِنْ، أَقَلُّ مِنْ، يُسَاوِي");
const s5 = bookSection(1, 5, "اكْتِشَافُ الأَنْمَاطِ");
const s6 = bookSection(1, 6, "حَلُّ الْمَسْأَلَةِ");
const s7 = bookSection(1, 7, "تَدْرِيبَاتٌ عَامَّةٌ");
const TEST = "اخْتِبَارُ الْوَحْدَةِ";

const drafts: MathLessonDraft[] = [
  // ── 1-1 التصنيف وفق خاصية (pp. 8 to 11): size (footballs, hats, cans, mugs; school things
  // into a small pencil case and a big bag), colour (apples, flowers), shape (odd one out). ──
  {
    section: s1,
    type: "picture_choice",
    title: "الْحَجْمُ",
    subtitle: "أُصَنِّفُ وَفْقَ الْحَجْمِ",
    emoji: "⚽",
    color,
    rounds: [
      sameAs(
        "أَيُّ كُرَةٍ فِي حَجْمِ هَذِهِ الْكُرَةِ؟",
        e("⚽", "big"),
        [e("⚽", "small"), e("⚽"), e("⚽", "big")],
        2,
      ),
      sameAs(
        "أَيُّ قُبَّعَةٍ فِي حَجْمِ هَذِهِ الْقُبَّعَةِ؟",
        e("👒", "small"),
        [e("👒", "big"), e("👒", "small")],
        1,
      ),
      sameAs(
        "أَيُّ عُلْبَةٍ فِي حَجْمِ هَذِهِ الْعُلْبَةِ؟",
        e("🥫", "small"),
        [e("🥫", "big"), e("🥫"), e("🥫", "small")],
        2,
      ),
      sameAs(
        "أَيُّ كُوبٍ فِي حَجْمِ هَذَا الْكُوبِ؟",
        e("☕", "big"),
        [e("☕", "big"), e("☕", "small")],
        0,
      ),
      sameAs(
        "أَيُّ كُرَةٍ فِي حَجْمِ هَذِهِ الْكُرَةِ؟",
        e("⚽", "small"),
        [e("⚽", "big"), e("⚽", "small"), e("⚽")],
        1,
      ),
    ],
  },
  {
    section: s1,
    type: "sort",
    title: "الصَّغِيرُ وَالْكَبِيرُ",
    subtitle: "أُصَنِّفُ أَدَوَاتِي",
    emoji: "🎒",
    color,
    prompt:
      "أَضَعُ الأَشْيَاءَ الصَّغِيرَةَ فِي الْمِقْلَمَةِ، وَالأَشْيَاءَ الْكَبِيرَةَ فِي الْحَقِيبَةِ.",
    boxes: [
      { label: "الْمِقْلَمَةُ", pic: e("👝", "small") },
      { label: "الْحَقِيبَةُ", pic: e("🎒", "big") },
    ],
    items: [
      { pic: e("✏️", "small"), box: 0 },
      { pic: e("📕", "big"), box: 1 },
      { pic: e("🖍️", "small"), box: 0 },
      { pic: e("📓", "big"), box: 1 },
      { pic: e("🖊️", "small"), box: 0 },
      { pic: e("📗", "big"), box: 1 },
    ],
  },
  {
    section: s1,
    type: "picture_choice",
    title: "اللَّوْنُ",
    subtitle: "أُصَنِّفُ وَفْقَ اللَّوْنِ",
    emoji: "🍎",
    color,
    rounds: [
      sameAs("أَيْنَ التُّفَّاحَةُ الْحَمْرَاءُ؟", e("🍎"), [e("🍏"), e("🍎")], 1),
      sameAs("أَيْنَ الزَّهْرَةُ الصَّفْرَاءُ؟", e("🌻"), [e("🌹"), e("🌻"), e("🌷")], 1),
      sameAs(
        "أَيْنَ الْمُثَلَّثُ الأَحْمَرُ؟",
        shape("triangle", "red"),
        [shape("triangle", "blue"), shape("triangle", "yellow"), shape("triangle", "red")],
        2,
      ),
      sameAs(
        "أَيْنَ الدَّائِرَةُ الزَّرْقَاءُ؟",
        shape("circle", "blue"),
        [shape("circle", "blue"), shape("circle", "yellow"), shape("circle", "pink")],
        0,
      ),
      sameAs(
        "أَيْنَ الْمُرَبَّعُ الأَخْضَرُ؟",
        shape("square", "green"),
        [shape("square", "orange"), shape("square", "green")],
        1,
      ),
    ],
  },
  {
    section: s1,
    type: "sort",
    title: "أُصَنِّفُ الأَلْوَانَ",
    subtitle: "الأَحْمَرُ وَالأَزْرَقُ",
    emoji: "🎨",
    color,
    prompt:
      "أَضَعُ الأَشْكَالَ الْحَمْرَاءَ فِي صُنْدُوقٍ، وَالأَشْكَالَ الزَّرْقَاءَ فِي الصُّنْدُوقِ الآخَرِ.",
    boxes: [
      { label: "الأَحْمَرُ", pic: e("🔴") },
      { label: "الأَزْرَقُ", pic: e("🔵") },
    ],
    items: [
      { pic: shape("triangle", "red"), box: 0 },
      { pic: shape("square", "blue"), box: 1 },
      { pic: shape("rectangle", "red"), box: 0 },
      { pic: shape("triangle", "blue"), box: 1 },
      { pic: shape("square", "red"), box: 0 },
      { pic: shape("rectangle", "blue"), box: 1 },
    ],
  },
  {
    section: s1,
    type: "picture_choice",
    title: "الشَّكْلُ",
    subtitle: "أُصَنِّفُ وَفْقَ الشَّكْلِ",
    emoji: "🔺",
    color,
    rounds: [
      odd([shape("circle", "orange"), shape("circle", "orange"), shape("square", "orange")], 2),
      sameAs(
        "أَيُّ شَكْلٍ يُشْبِهُ هَذَا الشَّكْلَ؟",
        shape("triangle", "green"),
        [shape("square", "green"), shape("triangle", "green"), shape("circle", "green")],
        1,
      ),
      odd([shape("triangle", "blue"), shape("rectangle", "blue"), shape("triangle", "blue")], 1),
      sameAs(
        "أَيُّ شَكْلٍ يُشْبِهُ هَذَا الشَّكْلَ؟",
        shape("rectangle", "pink"),
        [shape("circle", "pink"), shape("rectangle", "pink")],
        1,
      ),
      odd(
        [
          shape("square", "yellow"),
          shape("square", "yellow"),
          shape("circle", "yellow"),
          shape("square", "yellow"),
        ],
        2,
      ),
    ],
  },

  // ── 1-2 التصنيف وفق خاصيتين (pp. 12 to 13): shape and colour (yellow triangles, pink circles,
  // blue squares), size and colour (plates), shape and size (clocks), identical groups. ──
  {
    section: s2,
    type: "picture_choice",
    title: "الشَّكْلُ وَاللَّوْنُ",
    subtitle: "أُصَنِّفُ وَفْقَ خَاصِيَّتَيْنِ",
    emoji: "🔶",
    color,
    rounds: [
      sameAs(
        "أَيْنَ الْمُثَلَّثُ الأَصْفَرُ؟",
        shape("triangle", "yellow"),
        [shape("triangle", "pink"), shape("triangle", "yellow"), shape("circle", "yellow")],
        1,
      ),
      sameAs(
        "أَيْنَ الدَّائِرَةُ الْوَرْدِيَّةُ؟",
        shape("circle", "pink"),
        [shape("circle", "pink"), shape("circle", "blue"), shape("square", "pink")],
        0,
      ),
      sameAs(
        "أَيْنَ الْمُرَبَّعُ الأَزْرَقُ؟",
        shape("square", "blue"),
        [shape("triangle", "blue"), shape("square", "yellow"), shape("square", "blue")],
        2,
      ),
      sameAs(
        "أَيْنَ الدَّائِرَةُ الْحَمْرَاءُ الْكَبِيرَةُ؟",
        shape("circle", "red", "big"),
        [
          shape("circle", "red", "small"),
          shape("circle", "blue", "big"),
          shape("circle", "red", "big"),
        ],
        2,
      ),
      sameAs(
        "أَيْنَ الْمُسْتَطِيلُ الصَّغِيرُ؟",
        shape("rectangle", "green", "small"),
        [
          shape("square", "green", "small"),
          shape("rectangle", "green", "small"),
          shape("rectangle", "green", "big"),
        ],
        1,
      ),
    ],
  },
  {
    section: s2,
    type: "sort",
    title: "أُصَنِّفُ فِي صُنْدُوقَيْنِ",
    subtitle: "الشَّكْلُ وَاللَّوْنُ مَعًا",
    emoji: "📦",
    color,
    prompt:
      "أَضَعُ الْمُثَلَّثَاتِ الْحَمْرَاءَ فِي صُنْدُوقٍ، وَكُلَّ شَكْلٍ آخَرَ فِي الصُّنْدُوقِ الثَّانِي.",
    boxes: [
      { label: "مُثَلَّثٌ أَحْمَرُ", pic: shape("triangle", "red") },
      { label: "شَكْلٌ آخَرُ" },
    ],
    items: [
      { pic: shape("triangle", "red"), box: 0 },
      { pic: shape("triangle", "blue"), box: 1 },
      { pic: shape("circle", "red"), box: 1 },
      { pic: shape("triangle", "red"), box: 0 },
      { pic: shape("square", "yellow"), box: 1 },
      { pic: shape("triangle", "red"), box: 0 },
    ],
  },
  {
    section: s2,
    type: "picture_choice",
    title: "مَجْمُوعَاتٌ مُتَشَابِهَةٌ",
    subtitle: "أَخْتَارُ الْمَجْمُوعَةَ الْمُتَشَابِهَةَ",
    emoji: "🐟",
    color,
    rounds: [
      group(ALIKE, [[e("⚽"), e("🏀"), e("⚽")], pics("⚽", 3)], 1),
      group(ALIKE, [pics("🐟", 3), [e("🐟"), e("🐠"), e("🐟")]], 0),
      group(ALIKE, [[e("🐔"), e("🐤"), e("🐔")], pics("🐔", 3)], 1),
      group(
        "أَيُّ مَجْمُوعَةٍ أَشْكَالُهَا مُتَشَابِهَةٌ فِي الشَّكْلِ وَاللَّوْنِ؟",
        [
          [shape("circle", "red"), shape("square", "red"), shape("circle", "red")],
          shapes("circle", "red", 3),
          [shape("circle", "red"), shape("circle", "blue"), shape("circle", "red")],
        ],
        1,
      ),
    ],
  },

  // ── 1-3 أكثر من، أقل من، يساوي (pp. 14 to 17): roses and bees, rabbits and carrots, rulers
  // and pencils; shirts and trousers, pens and notebooks, shoes and socks, girls and handbags,
  // children and chairs. ──
  {
    section: s3,
    type: "compare",
    title: "أَكْثَرُ أَمْ أَقَلُّ؟",
    subtitle: COMPARE_SUBTITLE,
    emoji: "🐝",
    color,
    rounds: [
      compareGroups(ROSES_BEES, ["🌹", 5], ["🐝", 4]),
      compareGroups(BEES_ROSES, ["🐝", 3], ["🌹", 4]),
      compareGroups(ROSES_BEES, ["🌹", 4], ["🐝", 4]),
      compareGroups(
        "الأَرَانِبُ أَكْثَرُ أَمْ أَقَلُّ أَمْ تُسَاوِي الْجَزَرَ؟",
        ["🐇", 3],
        ["🥕", 5],
      ),
      compareGroups(
        "الْمَسَاطِرُ أَكْثَرُ أَمْ أَقَلُّ أَمْ تُسَاوِي الأَقْلَامَ؟",
        ["📏", 4],
        ["✏️", 2],
      ),
    ],
  },
  {
    section: s3,
    type: "compare",
    title: "أُقَارِنُ الْمَجْمُوعَاتِ",
    subtitle: COMPARE_SUBTITLE,
    emoji: "👕",
    color,
    rounds: [
      compareGroups(
        "الْقُمْصَانُ أَكْثَرُ أَمْ أَقَلُّ أَمْ تُسَاوِي السَّرَاوِيلَ؟",
        ["👕", 5],
        ["👖", 4],
      ),
      compareGroups(
        "الأَقْلَامُ أَكْثَرُ أَمْ أَقَلُّ أَمْ تُسَاوِي الدَّفَاتِرَ؟",
        ["🖊️", 3],
        ["📓", 4],
      ),
      compareGroups(
        "الْبَنَاتُ أَكْثَرُ أَمْ أَقَلُّ أَمْ يُسَاوِينَ الْحَقَائِبَ؟",
        ["🧕", 4],
        ["👜", 4],
      ),
      compareGroups(
        "الأَحْذِيَةُ أَكْثَرُ أَمْ أَقَلُّ أَمْ تُسَاوِي الْجَوَارِبَ؟",
        ["👟", 4],
        ["🧦", 6],
      ),
      compareGroups(
        "الأَطْفَالُ أَكْثَرُ أَمْ أَقَلُّ أَمْ يُسَاوُونَ الْكَرَاسِيَّ؟",
        ["🧒", 4],
        ["🪑", 3],
      ),
    ],
  },
  {
    section: s3,
    type: "picture_choice",
    title: "أَيُّهَا أَكْثَرُ؟",
    subtitle: "أَكْثَرُ، أَقَلُّ",
    emoji: "🍎",
    color,
    rounds: [
      group(MORE, [pics("🍎", 3), pics("🍎", 5)], 1),
      group(FEWER, [shapes("square", "blue", 4), shapes("square", "blue", 2)], 1),
      group(MORE, [pics("🌸", 6), pics("🌸", 4)], 0),
      group(FEWER, [pics("⭐", 3), pics("⭐", 2), pics("⭐", 5)], 1),
    ],
  },

  // ── 1-5 اكتشاف الأنماط (pp. 22 to 25): frog and turtle, hen and two chicks, cow and calf,
  // tall and short candles, bee and two flowers, two leaves, red and green apples, half coloured
  // circles, circle triangle square. The م أ letter pattern is left out (pictures only). ──
  {
    section: s5,
    type: "picture_choice",
    title: "النَّمَطُ",
    subtitle: NEXT_SUBTITLE,
    emoji: "🐸",
    color,
    rounds: [
      next(
        repeat([e("🐸"), e("🐢")], 5),
        [e("🐢"), e("🐸"), e("🐇")],
        0,
        "هَذَا نَمَطٌ. مَا التَّالِي؟",
      ),
      next(repeat([e("🐔"), e("🐤"), e("🐤")], 7), [e("🐔"), e("🐤")], 1),
      next(repeat([e("🐄", "big"), e("🐄", "small")], 5), [e("🐄", "big"), e("🐄", "small")], 1),
      next(repeat([e("🐝"), e("🌸"), e("🌸")], 7), [e("🌸"), e("🐝")], 0),
    ],
  },
  {
    section: s5,
    type: "picture_choice",
    title: "أُكْمِلُ النَّمَطَ",
    subtitle: NEXT_SUBTITLE,
    emoji: "🍃",
    color,
    rounds: [
      next(repeat([e("🕯️", "big"), e("🕯️", "small")], 6), [e("🕯️", "small"), e("🕯️", "big")], 1),
      next(repeat([e("🍃"), e("🍂")], 5), [e("🍃"), e("🍂")], 1),
      next(
        repeat([e("🍎"), e("🍏")], 5),
        [e("🍎"), e("🍏")],
        1,
        "تُفَّاحَةٌ حَمْرَاءُ، ثُمَّ تُفَّاحَةٌ خَضْرَاءُ. مَا التَّالِي؟",
      ),
      next(
        repeat([shape("circle", "blue"), { shape: "circle", color: "blue", shaded: "half" }], 5),
        [shape("circle", "blue"), { shape: "circle", color: "blue", shaded: "half" }],
        1,
      ),
    ],
  },
  {
    section: s5,
    type: "picture_choice",
    title: "نَمَطُ الأَشْكَالِ",
    subtitle: NEXT_SUBTITLE,
    emoji: "🔺",
    color,
    rounds: [
      next(
        repeat([shape("circle", "yellow"), shape("triangle", "red"), shape("square", "blue")], 7),
        [shape("square", "blue"), shape("triangle", "red"), shape("circle", "yellow")],
        1,
      ),
      next(
        repeat([shape("triangle", "green"), shape("square", "green")], 5),
        [shape("triangle", "green"), shape("square", "green")],
        1,
      ),
      next(
        repeat([shape("circle", "orange", "big"), shape("circle", "orange", "small")], 6),
        [shape("circle", "orange", "small"), shape("circle", "orange", "big")],
        1,
      ),
      next(
        repeat(
          [
            shape("square", "pink"),
            shape("square", "pink"),
            shape("circle", "pink"),
            shape("circle", "pink"),
          ],
          7,
        ),
        [shape("square", "pink"), shape("circle", "pink")],
        1,
      ),
    ],
  },

  // ── 1-6 حل المسألة (pp. 26 to 27): the missing shape in a two property pattern, shapes with
  // the same shape and colour. Drawing and colouring tasks become choices. ──
  {
    section: s6,
    type: "picture_choice",
    title: "أُفَكِّرُ وَأَحُلُّ",
    subtitle: "الشَّكْلُ وَاللَّوْنُ وَالنَّمَطُ",
    emoji: "🧩",
    color,
    rounds: [
      next(
        repeat([shape("square", "red"), shape("circle", "blue")], 5),
        [shape("circle", "blue"), shape("circle", "red"), shape("square", "blue")],
        0,
        "مُرَبَّعٌ أَحْمَرُ، ثُمَّ دَائِرَةٌ زَرْقَاءُ. مَا التَّالِي؟",
      ),
      next(
        repeat(
          [shape("triangle", "yellow"), shape("triangle", "yellow"), shape("rectangle", "blue")],
          8,
        ),
        [shape("triangle", "yellow"), shape("rectangle", "blue")],
        1,
      ),
      group(
        "أَيُّ مَجْمُوعَةٍ أَشْكَالُهَا مُتَشَابِهَةٌ فِي الشَّكْلِ وَاللَّوْنِ؟",
        [
          [shape("square", "green"), shape("square", "green"), shape("triangle", "green")],
          [shape("triangle", "blue"), shape("triangle", "blue"), shape("triangle", "blue")],
        ],
        1,
      ),
      next(
        repeat(
          [
            shape("circle", "pink", "small"),
            shape("circle", "pink", "small"),
            shape("circle", "pink", "big"),
          ],
          7,
        ),
        [shape("circle", "pink", "big"), shape("circle", "pink", "small")],
        1,
      ),
    ],
  },

  // ── 1-7 تدريبات عامة (pp. 28 to 29): shapes into two boxes by shape and colour; rectangles of
  // the same size and colour; the group with more than the boys; a shape pattern. ──
  {
    section: s7,
    type: "sort",
    title: "أُصَنِّفُ الأَشْكَالَ",
    subtitle: "الشَّكْلُ وَاللَّوْنُ مَعًا",
    emoji: "📦",
    color,
    prompt:
      "أَضَعُ الدَّوَائِرَ الزَّرْقَاءَ فِي صُنْدُوقٍ، وَكُلَّ شَكْلٍ آخَرَ فِي الصُّنْدُوقِ الثَّانِي.",
    boxes: [
      { label: "دَائِرَةٌ زَرْقَاءُ", pic: shape("circle", "blue") },
      { label: "شَكْلٌ آخَرُ" },
    ],
    items: [
      { pic: shape("circle", "blue"), box: 0 },
      { pic: shape("square", "blue"), box: 1 },
      { pic: shape("circle", "yellow"), box: 1 },
      { pic: shape("circle", "blue"), box: 0 },
      { pic: shape("triangle", "orange"), box: 1 },
      { pic: shape("circle", "blue"), box: 0 },
    ],
  },
  {
    section: s7,
    type: "picture_choice",
    title: "أَتَدَرَّبُ",
    subtitle: "أُصَنِّفُ، أُقَارِنُ، أُكْمِلُ النَّمَطَ",
    emoji: "✏️",
    color,
    rounds: [
      sameAs(
        "أَيْنَ الْمُسْتَطِيلُ الْبُرْتُقَالِيُّ الْكَبِيرُ؟",
        shape("rectangle", "orange", "big"),
        [
          shape("rectangle", "orange", "small"),
          shape("rectangle", "orange", "big"),
          shape("rectangle", "blue", "big"),
        ],
        1,
      ),
      odd([e("👗"), e("👗"), e("👕"), e("👗")], 2, ODD_THING),
      group(MORE, [pics("👦", 3), pics("👧", 4)], 1),
      next(
        repeat([shape("circle", "green"), shape("square", "orange")], 5),
        [shape("circle", "green"), shape("square", "orange")],
        1,
      ),
    ],
  },

  // ── اختبار الوحدة (p. 30) with إعادة التعليم (p. 31): same shape and colour, the bigger group,
  // a triangle pattern (the rhombus becomes a square), the car among bicycles. The bird in
  // the cage and the vase on the table are position (left out). ──
  {
    section: TEST,
    type: "picture_choice",
    title: "اخْتِبَارُ الْوَحْدَةِ",
    subtitle: "أُصَنِّفُ وَأُكْمِلُ النَّمَطَ",
    emoji: "📝",
    color,
    rounds: [
      sameAs(
        "أَيْنَ الْمُثَلَّثُ الأَزْرَقُ؟",
        shape("triangle", "blue"),
        [shape("square", "blue"), shape("triangle", "orange"), shape("triangle", "blue")],
        2,
      ),
      odd([e("🚲"), e("🚲"), e("🚲"), e("🚗")], 3, ODD_THING),
      group(MORE, [pics("🍎", 5), pics("🍎", 3)], 0),
      next(
        repeat([shape("triangle", "red"), shape("square", "yellow")], 6),
        [shape("triangle", "red"), shape("square", "yellow")],
        0,
      ),
    ],
  },
  {
    section: TEST,
    type: "compare",
    title: "أُقَارِنُ",
    subtitle: COMPARE_SUBTITLE,
    emoji: "📝",
    color,
    rounds: [
      compareGroups(
        "التُّفَّاحُ أَكْثَرُ أَمْ أَقَلُّ أَمْ يُسَاوِي الأَوْلَادَ؟",
        ["🍎", 5],
        ["👦", 5],
      ),
      compareGroups(ROSES_BEES, ["🌹", 3], ["🐝", 4]),
      compareGroups(
        "الأَرَانِبُ أَكْثَرُ أَمْ أَقَلُّ أَمْ تُسَاوِي الْجَزَرَ؟",
        ["🐇", 4],
        ["🥕", 2],
      ),
    ],
  },
];

export const mathBookUnit1: Unit = {
  id: "math-u1",
  number: 1,
  title: "الْوَحْدَةُ الأُولَى",
  theme: "التَّصْنِيفُ وَالأَنْمَاطُ",
  emoji: "🧩",
  emblem: "basket",
  color,
  badgeLabel: "أُصَنِّفُ",
  lessons: numberMathLessons(1, drafts),
};
