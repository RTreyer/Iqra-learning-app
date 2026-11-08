// Book Unit 5 الأشكال الهندسية والكسور, الرياضيات Part 1 (Sana'a 2026), pp. 117 to 139.
// Notes: docs/content/textbooks/math-part1/unit-05.md. Review status: docs/CONTENT_REVIEW.md
// Every book lesson is a section of app lessons, in book order. Solids have no drawing in
// the app: each is shown by an everyday object from the book (dice, tin can, ice cream cone,
// box, sponge, orange). The pyramid has no fitting emoji and is left out of the pictures.
// Plane shapes, halves and quarters are drawn shapes (MathPic); shading is always in equal
// parts, so the book's unequal halves are left out.
import type {
  ListenPickQuestion,
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
  shape,
  type MathLessonDraft,
} from "./mathKit.ts";

const color = MATH_COLOR;

const e = (emoji: string): MathPic => ({ emoji });
const half = (id: ShapeId, c: MathColor): MathPic => ({ shape: id, color: c, shaded: "half" });
const quarter = (id: ShapeId, c: MathColor): MathPic => ({
  shape: id,
  color: c,
  shaded: "quarter",
});

/** One picture per choice card. */
function choose(
  prompt: string,
  choices: MathPic[],
  correctIndex: number,
  model?: MathPic,
): PictureChoiceRound {
  return { prompt, choices: choices.map((p) => [p]), correctIndex, ...(model ? { model } : {}) };
}

/** Groups of pictures per choice card. */
function chooseGroup(
  prompt: string,
  choices: MathPic[][],
  correctIndex: number,
): PictureChoiceRound {
  return { prompt, choices, correctIndex };
}

/** "What comes next?": the row is shown, then one picture per choice (as in Unit 1). */
const NEXT = "مَا التَّالِي فِي النَّمَطِ؟";
const NEXT_SUBTITLE = "مَا التَّالِي؟";
function next(
  pattern: MathPic[],
  choices: MathPic[],
  correctIndex: number,
  prompt = NEXT,
): PictureChoiceRound {
  return { prompt, pattern, choices: choices.map((p) => [p]), correctIndex };
}

// The everyday objects of the book's solids (pp. 118 to 120).
const SPHERE = { emoji: "⚽", word: "كُرَةٌ" };
const CUBE = { emoji: "🎲", word: "مُكَعَّبٌ" };
const CYLINDER = { emoji: "🥫", word: "أُسْطُوَانَةٌ" };
const CONE = { emoji: "🍦", word: "مَخْرُوطٌ" };
const CUBOID = { emoji: "📦", word: "مُتَوَازِي مُسْتَطِيلَاتٍ" };

const listen = (
  word: string,
  choices: ListenPickQuestion["choices"],
  correctIndex: number,
): ListenPickQuestion => ({ word, choices, correctIndex });

const IS_HALF = "هَلِ الْجُزْءُ الْمُلَوَّنُ نِصْفُ الشَّكْلِ؟ نَعَمْ أَمْ لَا؟";
const IS_QUARTER = "هَلِ الْجُزْءُ الْمُلَوَّنُ رُبْعُ الشَّكْلِ؟ نَعَمْ أَمْ لَا؟";
const YES = e("👍");
const NO = e("👎");
const AHMAD = e("👦");
// Girls are shown as 🧕, as in Unit 2 (owner decision).
const FATIMA = e("🧕");
const WHO_ATE_MORE =
  "مَنْ أَكَلَ أَكْثَرَ: أَحْمَدُ، أَمْ فَاطِمَةُ، أَمْ أَكَلَا الْقَدْرَ نَفْسَهُ؟";

const s1 = bookSection(5, 1, "الْمُجَسَّمَاتُ");
const s2 = bookSection(5, 2, "الأَشْكَالُ الْمُسْتَوِيَةُ");
const s3 = bookSection(5, 3, "اكْتِشَافُ الأَنْمَاطِ");
const s4 = bookSection(5, 4, "حَلُّ الْمَسْأَلَةِ");
const s5 = bookSection(5, 5, "النِّصْفُ");
const s6 = bookSection(5, 6, "الرُّبْعُ");
const s7 = bookSection(5, 7, "تَدْرِيبَاتٌ عَامَّةٌ");
const s8 = bookSection(5, 8, "هَيَّا بِنَا نَلْعَبُ وَنَتَعَلَّمُ");
const TEST = "اخْتِبَارُ الْوَحْدَةِ";

const drafts: MathLessonDraft[] = [
  // ── 5-1 المجسمات (pp. 118 to 121): the solids introduce themselves, objects of the same shape ──
  {
    section: s1,
    type: "naming",
    title: "مَنْ أَنَا؟",
    subtitle: "أَتَعَرَّفُ الْمُجَسَّمَاتِ",
    emoji: "🎲",
    color,
    items: [
      { emoji: "⚽", word: "أَنَا الْكُرَةُ" },
      { emoji: "🎲", word: "أَنَا الْمُكَعَّبُ" },
      { emoji: "🥫", word: "أَنَا الأُسْطُوَانَةُ" },
      { emoji: "🍦", word: "أَنَا الْمَخْرُوطُ" },
      { emoji: "📦", word: "أَنَا مُتَوَازِي الْمُسْتَطِيلَاتِ" },
    ],
  },
  {
    section: s1,
    type: "listen_pick",
    title: "أَيْنَ الْمُجَسَّمُ؟",
    subtitle: "أَسْمَعُ الاسْمَ وَأَخْتَارُ",
    emoji: "👂",
    color,
    questions: [
      listen("أَيْنَ الْمُكَعَّبُ؟", [SPHERE, CUBE, CYLINDER], 1),
      listen("أَيْنَ الأُسْطُوَانَةُ؟", [CYLINDER, CONE, CUBOID], 0),
      listen("أَيْنَ الْمَخْرُوطُ؟", [CUBE, CONE, SPHERE], 1),
      listen("أَيْنَ مُتَوَازِي الْمُسْتَطِيلَاتِ؟", [CUBE, SPHERE, CUBOID], 2),
      listen("أَيْنَ الْكُرَةُ؟", [CYLINDER, SPHERE, CONE], 1),
    ],
  },
  {
    section: s1,
    type: "picture_choice",
    title: "لَهُ الشَّكْلُ نَفْسُهُ",
    subtitle: "أَخْتَارُ الشَّيْءَ الَّذِي يُشْبِهُ الْمُجَسَّمَ",
    emoji: "🥫",
    color,
    rounds: [
      choose(
        "أَيُّ شَيْءٍ لَهُ شَكْلُ هَذَا الْمُجَسَّمِ؟",
        [e("🧊"), e("⚽"), e("🥫")],
        0,
        e("🎲"),
      ),
      choose(
        "أَيُّ شَيْءٍ لَهُ شَكْلُ هَذَا الْمُجَسَّمِ؟",
        [e("🍦"), e("🔋"), e("🎲")],
        1,
        e("🥫"),
      ),
      choose(
        "أَيُّ شَيْءٍ لَهُ شَكْلُ هَذَا الْمُجَسَّمِ؟",
        [e("📦"), e("🥫"), e("🍊")],
        2,
        e("⚽"),
      ),
      choose(
        "أَيُّ شَيْءٍ لَهُ شَكْلُ هَذَا الْمُجَسَّمِ؟",
        [e("🧽"), e("⚽"), e("🍦")],
        0,
        e("📦"),
      ),
      choose(
        "أَيُّ شَيْءٍ لَهُ شَكْلُ هَذَا الْمُجَسَّمِ؟",
        [e("📦"), e("🏀"), e("🔋")],
        1,
        e("🍊"),
      ),
    ],
  },
  {
    section: s1,
    type: "sort",
    title: "كُرَةٌ أَمْ أُسْطُوَانَةٌ؟",
    subtitle: "أَضَعُ كُلَّ شَيْءٍ مَعَ شَكْلِهِ",
    emoji: "⚽",
    color,
    prompt: "أَضَعُ كُلَّ شَيْءٍ مَعَ شَكْلِهِ: كُرَةٌ أَمْ أُسْطُوَانَةٌ؟",
    boxes: [
      { label: "كُرَةٌ", pic: e("⚽") },
      { label: "أُسْطُوَانَةٌ", pic: e("🥫") },
    ],
    items: [
      { pic: e("🍊"), box: 0 },
      { pic: e("🔋"), box: 1 },
      { pic: e("🏀"), box: 0 },
      { pic: e("🪵"), box: 1 },
      { pic: e("🎱"), box: 0 },
      { pic: e("🕯️"), box: 1 },
    ],
  },
  {
    section: s1,
    type: "sort",
    title: "مُكَعَّبٌ أَمْ مُتَوَازِي مُسْتَطِيلَاتٍ؟",
    subtitle: "أَضَعُ كُلَّ شَيْءٍ مَعَ شَكْلِهِ",
    emoji: "📦",
    color,
    prompt: "أَضَعُ كُلَّ شَيْءٍ مَعَ شَكْلِهِ: مُكَعَّبٌ أَمْ مُتَوَازِي مُسْتَطِيلَاتٍ؟",
    boxes: [
      { label: "مُكَعَّبٌ", pic: e("🎲") },
      { label: "مُتَوَازِي مُسْتَطِيلَاتٍ", pic: e("📦") },
    ],
    items: [
      { pic: e("🧊"), box: 0 },
      { pic: e("📕"), box: 1 },
      { pic: e("🎲"), box: 0 },
      { pic: e("🧽"), box: 1 },
    ],
  },

  // ── 5-2 الأشكال المستوية (pp. 122 to 125): names, everyday objects, same kind, counting ──
  {
    section: s2,
    type: "picture_choice",
    title: "أَتَعَرَّفُ الأَشْكَالَ",
    subtitle: "دَائِرَةٌ، مُرَبَّعٌ، مُثَلَّثٌ، مُسْتَطِيلٌ",
    emoji: "🔷",
    color,
    rounds: [
      choose(
        "أَيْنَ الدَّائِرَةُ؟",
        [shape("triangle", "red"), shape("circle", "yellow"), shape("square", "blue")],
        1,
      ),
      choose(
        "أَيْنَ الْمُثَلَّثُ؟",
        [shape("rectangle", "green"), shape("circle", "red"), shape("triangle", "orange")],
        2,
      ),
      choose(
        "أَيْنَ الْمُرَبَّعُ؟",
        [shape("square", "pink"), shape("triangle", "blue"), shape("circle", "green")],
        0,
      ),
      choose(
        "أَيْنَ الْمُسْتَطِيلُ؟",
        [shape("square", "yellow"), shape("rectangle", "blue"), shape("triangle", "green")],
        1,
      ),
      choose(
        "أَيْنَ الْمُرَبَّعُ؟",
        [shape("rectangle", "red"), shape("circle", "orange"), shape("square", "red")],
        2,
      ),
    ],
  },
  {
    section: s2,
    type: "picture_choice",
    title: "أَشْيَاءُ حَوْلِي",
    subtitle: "أَصِلُ الشَّيْءَ بِشَكْلِهِ",
    emoji: "🚪",
    color,
    rounds: [
      choose(
        "أَيُّ شَكْلٍ يُشْبِهُ الْبَابَ؟",
        [shape("circle", "orange"), shape("rectangle", "orange"), shape("triangle", "orange")],
        1,
        e("🚪"),
      ),
      choose(
        "أَيُّ شَكْلٍ يُشْبِهُ النَّافِذَةَ؟",
        [shape("square", "blue"), shape("triangle", "blue"), shape("circle", "blue")],
        0,
        e("🪟"),
      ),
      choose(
        "أَيُّ شَكْلٍ يُشْبِهُ إِشَارَةَ الطَّرِيقِ؟",
        [shape("square", "red"), shape("circle", "red"), shape("triangle", "red")],
        2,
        e("⚠️"),
      ),
      choose(
        "أَيُّ شَكْلٍ يُشْبِهُ السَّاعَةَ؟",
        [shape("rectangle", "green"), shape("circle", "green"), shape("square", "green")],
        1,
        e("🕒"),
      ),
      choose(
        "أَيُّ شَكْلٍ يُشْبِهُ عَلَمَ الْيَمَنِ؟",
        [shape("rectangle", "red"), shape("triangle", "red"), shape("circle", "red")],
        0,
        e("🇾🇪"),
      ),
    ],
  },
  {
    section: s2,
    type: "sort",
    title: "دَوَائِرُ وَمُثَلَّثَاتٌ",
    subtitle: "أَضَعُ الأَشْكَالَ مِنَ النَّوْعِ نَفْسِهِ مَعًا",
    emoji: "🔺",
    color,
    prompt: "أَضَعُ كُلَّ شَكْلٍ فِي مَكَانِهِ: دَائِرَةٌ أَمْ مُثَلَّثٌ؟",
    boxes: [
      { label: "دَوَائِرُ", pic: shape("circle", "yellow") },
      { label: "مُثَلَّثَاتٌ", pic: shape("triangle", "red") },
    ],
    items: [
      { pic: shape("circle", "blue"), box: 0 },
      { pic: shape("triangle", "green"), box: 1 },
      { pic: shape("circle", "red", "big"), box: 0 },
      { pic: shape("triangle", "yellow", "small"), box: 1 },
      { pic: shape("circle", "green", "small"), box: 0 },
      { pic: shape("triangle", "blue", "big"), box: 1 },
    ],
  },
  {
    section: s2,
    type: "sort",
    title: "مُرَبَّعَاتٌ وَمُسْتَطِيلَاتٌ",
    subtitle: "أَضَعُ الأَشْكَالَ مِنَ النَّوْعِ نَفْسِهِ مَعًا",
    emoji: "🟦",
    color,
    prompt: "أَضَعُ كُلَّ شَكْلٍ فِي مَكَانِهِ: مُرَبَّعٌ أَمْ مُسْتَطِيلٌ؟",
    boxes: [
      { label: "مُرَبَّعَاتٌ", pic: shape("square", "blue") },
      { label: "مُسْتَطِيلَاتٌ", pic: shape("rectangle", "green") },
    ],
    items: [
      { pic: shape("rectangle", "red"), box: 1 },
      { pic: shape("square", "yellow"), box: 0 },
      { pic: shape("rectangle", "blue", "big"), box: 1 },
      { pic: shape("square", "green", "small"), box: 0 },
      { pic: shape("square", "red", "big"), box: 0 },
      { pic: shape("rectangle", "yellow", "small"), box: 1 },
    ],
  },
  {
    section: s2,
    type: "picture_choice",
    title: "أَعُدُّ الأَشْكَالَ",
    subtitle: "كَمْ شَكْلًا مِنْ كُلِّ نَوْعٍ؟",
    emoji: "🔢",
    color,
    rounds: [
      chooseGroup(
        "أَيُّ مَجْمُوعَةٍ فِيهَا ثَلَاثُ دَوَائِرَ؟",
        [
          [
            shape("circle", "yellow"),
            shape("square", "blue"),
            shape("circle", "yellow"),
            shape("circle", "yellow"),
          ],
          [
            shape("circle", "yellow"),
            shape("triangle", "red"),
            shape("square", "blue"),
            shape("circle", "yellow"),
          ],
          [
            shape("triangle", "red"),
            shape("circle", "yellow"),
            shape("triangle", "red"),
            shape("triangle", "red"),
          ],
        ],
        0,
      ),
      chooseGroup(
        "أَيُّ مَجْمُوعَةٍ فِيهَا مُثَلَّثَانِ؟",
        [
          [
            shape("triangle", "red"),
            shape("triangle", "red"),
            shape("circle", "yellow"),
            shape("triangle", "red"),
          ],
          [
            shape("square", "blue"),
            shape("triangle", "red"),
            shape("circle", "yellow"),
            shape("square", "blue"),
          ],
          [
            shape("triangle", "red"),
            shape("square", "blue"),
            shape("triangle", "red"),
            shape("circle", "yellow"),
          ],
        ],
        2,
      ),
      chooseGroup(
        "أَيُّ مَجْمُوعَةٍ فِيهَا ثَلَاثَةُ مُرَبَّعَاتٍ؟",
        [
          [
            shape("square", "blue"),
            shape("rectangle", "green"),
            shape("square", "blue"),
            shape("circle", "yellow"),
          ],
          [
            shape("square", "blue"),
            shape("square", "blue"),
            shape("rectangle", "green"),
            shape("square", "blue"),
          ],
          [
            shape("rectangle", "green"),
            shape("square", "blue"),
            shape("triangle", "red"),
            shape("rectangle", "green"),
          ],
        ],
        1,
      ),
      chooseGroup(
        "أَيُّ مَجْمُوعَةٍ فِيهَا أَرْبَعَةُ مُسْتَطِيلَاتٍ؟",
        [
          [
            shape("rectangle", "green"),
            shape("rectangle", "green"),
            shape("square", "blue"),
            shape("rectangle", "green"),
          ],
          [
            shape("rectangle", "green"),
            shape("square", "blue"),
            shape("square", "blue"),
            shape("rectangle", "green"),
          ],
          [
            shape("rectangle", "green"),
            shape("rectangle", "green"),
            shape("rectangle", "green"),
            shape("rectangle", "green"),
          ],
        ],
        2,
      ),
    ],
  },

  // ── 5-3 اكتشاف الأنماط (pp. 126 to 127): the row is shown, then what comes next. The book's
  // green and red colour pattern is green and yellow here, so red and green are never the cue. ──
  {
    section: s3,
    type: "picture_choice",
    title: "أُكْمِلُ نَمَطَ الْمُجَسَّمَاتِ",
    subtitle: NEXT_SUBTITLE,
    emoji: "🎲",
    color,
    rounds: [
      next([e("⚽"), e("🎲"), e("⚽"), e("🎲")], [e("🎲"), e("⚽"), e("🥫")], 1),
      next([e("🥫"), e("🥫"), e("🎲"), e("🥫")], [e("🎲"), e("⚽"), e("🥫")], 2),
      next([e("🍦"), e("⚽"), e("🍦"), e("⚽")], [e("⚽"), e("🍦"), e("📦")], 1),
      next([e("📦"), e("🎲"), e("🎲"), e("📦")], [e("📦"), e("🍦"), e("🎲")], 2),
    ],
  },
  {
    section: s3,
    type: "picture_choice",
    title: "أُكْمِلُ نَمَطَ الأَشْكَالِ",
    subtitle: NEXT_SUBTITLE,
    emoji: "🔺",
    color,
    rounds: [
      next(
        [
          shape("rectangle", "blue"),
          shape("circle", "yellow"),
          shape("triangle", "red"),
          shape("rectangle", "blue"),
        ],
        [shape("triangle", "red"), shape("circle", "yellow"), shape("rectangle", "blue")],
        1,
      ),
      next(
        // The book's colour pattern: the prompt names the colours, the shapes are all the same.
        [
          shape("triangle", "green"),
          shape("triangle", "green"),
          shape("triangle", "yellow"),
          shape("triangle", "green"),
        ],
        [shape("triangle", "yellow"), shape("triangle", "green")],
        1,
        "مُثَلَّثَانِ أَخْضَرَانِ، ثُمَّ مُثَلَّثٌ أَصْفَرُ. مَا التَّالِي؟",
      ),
      next(
        [
          shape("circle", "yellow"),
          shape("square", "blue"),
          shape("circle", "yellow"),
          shape("square", "blue"),
        ],
        [shape("circle", "yellow"), shape("square", "blue"), shape("triangle", "red")],
        0,
      ),
      next(
        [
          shape("square", "blue"),
          shape("triangle", "red"),
          shape("triangle", "red"),
          shape("square", "blue"),
        ],
        [shape("square", "blue"), shape("triangle", "red"), shape("circle", "yellow")],
        1,
      ),
    ],
  },

  // ── 5-4 حل المسألة (p. 128): colour the boat by the key ──
  {
    section: s4,
    type: "picture_choice",
    title: "أُلَوِّنُ الْقَارِبَ",
    subtitle: "الْمُسْتَطِيلَاتُ صَفْرَاءُ، وَالْمُثَلَّثَاتُ خَضْرَاءُ، وَالدَّوَائِرُ حَمْرَاءُ",
    emoji: "⛵",
    color,
    rounds: [
      choose(
        "أُلَوِّنُ الْمُسْتَطِيلَاتِ بِالأَصْفَرِ. أَيُّ شَكْلٍ لُوِّنَ صَحِيحًا؟",
        [shape("triangle", "yellow"), shape("rectangle", "yellow"), shape("rectangle", "green")],
        1,
      ),
      choose(
        "أُلَوِّنُ الْمُثَلَّثَاتِ بِالأَخْضَرِ. أَيُّ شَكْلٍ لُوِّنَ صَحِيحًا؟",
        [shape("triangle", "green"), shape("triangle", "red"), shape("circle", "green")],
        0,
      ),
      choose(
        "أُلَوِّنُ الدَّوَائِرَ بِالأَحْمَرِ. أَيُّ شَكْلٍ لُوِّنَ صَحِيحًا؟",
        [shape("rectangle", "red"), shape("circle", "yellow"), shape("circle", "red")],
        2,
      ),
      choose(
        "شِرَاعُ الْقَارِبِ مُثَلَّثٌ، وَالْمُثَلَّثَاتُ خَضْرَاءُ. أَيْنَ الشِّرَاعُ؟",
        [shape("triangle", "yellow"), shape("triangle", "green"), shape("triangle", "red")],
        1,
      ),
      choose(
        "نَافِذَةُ الْقَارِبِ دَائِرَةٌ، وَالدَّوَائِرُ حَمْرَاءُ. أَيْنَ النَّافِذَةُ؟",
        [shape("circle", "red"), shape("square", "red"), shape("circle", "yellow")],
        0,
      ),
    ],
  },

  // ── 5-5 النصف (pp. 130 to 131): two equal parts ──
  {
    section: s5,
    type: "story",
    title: "مَا النِّصْفُ؟",
    subtitle: "جُزْءٌ مِنْ جُزْأَيْنِ مُتَسَاوِيَيْنِ",
    emoji: "🍊",
    color,
    storyTitle: "النِّصْفُ",
    lines: [
      { text: "قَسَمَتْ أُمِّي الْبُرْتُقَالَةَ جُزْأَيْنِ مُتَسَاوِيَيْنِ.", emoji: "🍊" },
      { text: "كُلُّ جُزْءٍ نِصْفُ الْبُرْتُقَالَةِ.", emoji: "🍊" },
      { text: "وَقَسَمَتِ التُّفَّاحَةَ نِصْفَيْنِ.", emoji: "🍎" },
      { text: "جُزْءٌ مِنْ جُزْأَيْنِ مُتَسَاوِيَيْنِ هُوَ النِّصْفُ.", emoji: "🍎" },
    ],
  },
  {
    section: s5,
    type: "picture_choice",
    title: "أَيُّ شَكْلٍ نِصْفُهُ مُلَوَّنٌ؟",
    subtitle: "أَخْتَارُ النِّصْفَ",
    emoji: "🌓",
    color,
    rounds: [
      choose(
        "أَيُّ شَكْلٍ نِصْفُهُ مُلَوَّنٌ؟",
        [quarter("circle", "blue"), half("circle", "blue"), shape("circle", "blue")],
        1,
      ),
      choose(
        "أَيُّ شَكْلٍ نِصْفُهُ مُلَوَّنٌ؟",
        [half("square", "red"), shape("square", "red"), quarter("square", "red")],
        0,
      ),
      choose(
        "أَيُّ شَكْلٍ نِصْفُهُ مُلَوَّنٌ؟",
        [shape("triangle", "green"), quarter("rectangle", "green"), half("triangle", "green")],
        2,
      ),
      choose(
        "أَيُّ شَكْلٍ نِصْفُهُ مُلَوَّنٌ؟",
        [quarter("square", "orange"), half("rectangle", "orange"), shape("circle", "orange")],
        1,
      ),
      choose(
        "أَيُّ شَكْلٍ نِصْفُهُ مُلَوَّنٌ؟",
        [shape("rectangle", "pink"), quarter("circle", "pink"), half("circle", "pink")],
        2,
      ),
    ],
  },
  {
    section: s5,
    type: "picture_choice",
    title: "هَلْ هُوَ نِصْفٌ؟",
    subtitle: "👍 نَعَمْ، 👎 لَا",
    emoji: "🤔",
    color,
    rounds: [
      choose(IS_HALF, [YES, NO], 0, half("circle", "yellow")),
      choose(IS_HALF, [YES, NO], 1, quarter("square", "blue")),
      choose(IS_HALF, [YES, NO], 0, half("triangle", "red")),
      choose(IS_HALF, [YES, NO], 1, shape("rectangle", "green")),
      choose(IS_HALF, [YES, NO], 0, half("square", "orange")),
    ],
  },

  // ── 5-6 الربع (pp. 132 to 133): four equal parts ──
  {
    section: s6,
    type: "story",
    title: "مَا الرُّبْعُ؟",
    subtitle: "جُزْءٌ مِنْ أَرْبَعَةِ أَجْزَاءٍ مُتَسَاوِيَةٍ",
    emoji: "🍎",
    color,
    storyTitle: "الرُّبْعُ",
    lines: [
      { text: "قَسَمَ أَبِي التُّفَّاحَةَ أَرْبَعَةَ أَجْزَاءٍ مُتَسَاوِيَةٍ.", emoji: "🍎" },
      { text: "كُلُّ جُزْءٍ رُبْعُ التُّفَّاحَةِ.", emoji: "🍎" },
      { text: "جُزْءٌ مِنْ أَرْبَعَةِ أَجْزَاءٍ مُتَسَاوِيَةٍ هُوَ الرُّبْعُ.", emoji: "🍎" },
    ],
  },
  {
    section: s6,
    type: "picture_choice",
    title: "أَيُّ شَكْلٍ رُبْعُهُ مُلَوَّنٌ؟",
    subtitle: "أَخْتَارُ الرُّبْعَ",
    emoji: "🟦",
    color,
    rounds: [
      choose(
        "أَيُّ شَكْلٍ رُبْعُهُ مُلَوَّنٌ؟",
        [half("square", "blue"), quarter("square", "blue"), shape("square", "blue")],
        1,
      ),
      choose(
        "أَيُّ شَكْلٍ رُبْعُهُ مُلَوَّنٌ؟",
        [quarter("circle", "red"), half("circle", "red"), shape("circle", "red")],
        0,
      ),
      choose(
        "أَيُّ شَكْلٍ رُبْعُهُ مُلَوَّنٌ؟",
        [half("triangle", "green"), shape("rectangle", "green"), quarter("rectangle", "green")],
        2,
      ),
      choose(
        "أَيُّ شَكْلٍ رُبْعُهُ مُلَوَّنٌ؟",
        [half("rectangle", "yellow"), quarter("circle", "yellow"), half("square", "yellow")],
        1,
      ),
      choose(
        "أَيُّ شَكْلٍ رُبْعُهُ مُلَوَّنٌ؟",
        [shape("square", "pink"), half("circle", "pink"), quarter("square", "pink")],
        2,
      ),
    ],
  },
  {
    section: s6,
    type: "picture_choice",
    title: "هَلْ هُوَ رُبْعٌ؟",
    subtitle: "👍 نَعَمْ، 👎 لَا",
    emoji: "🤔",
    color,
    rounds: [
      choose(IS_QUARTER, [YES, NO], 0, quarter("square", "green")),
      choose(IS_QUARTER, [YES, NO], 1, half("circle", "blue")),
      choose(IS_QUARTER, [YES, NO], 0, quarter("circle", "orange")),
      choose(IS_QUARTER, [YES, NO], 1, half("triangle", "yellow")),
      choose(IS_QUARTER, [YES, NO], 0, quarter("rectangle", "red")),
    ],
  },

  // ── 5-7 تدريبات عامة (pp. 134 to 135): half or quarter, who ate more ──
  {
    section: s7,
    type: "sort",
    title: "نِصْفٌ أَمْ رُبْعٌ؟",
    subtitle: "١/٢ أَوْ ١/٤",
    emoji: "🌓",
    color,
    prompt: "أَضَعُ كُلَّ شَكْلٍ فِي مَكَانِهِ: نِصْفُهُ مُلَوَّنٌ أَمْ رُبْعُهُ مُلَوَّنٌ؟",
    boxes: [
      { label: "النِّصْفُ ١/٢", pic: half("circle", "orange") },
      { label: "الرُّبْعُ ١/٤", pic: quarter("circle", "orange") },
    ],
    items: [
      { pic: half("square", "blue"), box: 0 },
      { pic: quarter("rectangle", "green"), box: 1 },
      { pic: half("triangle", "red"), box: 0 },
      { pic: quarter("square", "pink"), box: 1 },
      { pic: half("rectangle", "yellow"), box: 0 },
      { pic: quarter("circle", "blue"), box: 1 },
    ],
  },
  {
    section: s7,
    type: "picture_choice",
    title: "مَنْ أَكَلَ أَكْثَرَ؟",
    subtitle: "أَحُلُّ الْمَسْأَلَةَ",
    emoji: "🍎",
    color,
    rounds: [
      chooseGroup(
        `أَكَلَ أَحْمَدُ نِصْفَ تُفَّاحَةٍ، وَأَكَلَتْ أُخْتُهُ فَاطِمَةُ نِصْفَ التُّفَّاحَةِ الأُخْرَى. ${WHO_ATE_MORE}`,
        [[AHMAD], [FATIMA], [AHMAD, FATIMA]],
        2,
      ),
      chooseGroup(
        `أَكَلَ أَحْمَدُ نِصْفَ رَغِيفٍ، وَأَكَلَتْ فَاطِمَةُ رُبْعَ رَغِيفٍ مِثْلِهِ. ${WHO_ATE_MORE}`,
        [[AHMAD], [FATIMA], [AHMAD, FATIMA]],
        0,
      ),
      chooseGroup(
        `أَكَلَ أَحْمَدُ رُبْعَ بُرْتُقَالَةٍ، وَأَكَلَتْ فَاطِمَةُ نِصْفَ بُرْتُقَالَةٍ مِثْلِهَا. ${WHO_ATE_MORE}`,
        [[AHMAD], [FATIMA], [AHMAD, FATIMA]],
        1,
      ),
      chooseGroup(
        `أَكَلَ أَحْمَدُ رُبْعَ كَعْكَةٍ، وَأَكَلَتْ فَاطِمَةُ رُبْعَ كَعْكَةٍ مِثْلِهَا. ${WHO_ATE_MORE}`,
        [[AHMAD], [FATIMA], [AHMAD, FATIMA]],
        2,
      ),
    ],
  },

  // ── 5-8 هيا بنا نلعب ونتعلم (p. 136): jump to the shape the teacher names ──
  {
    section: s8,
    type: "picture_choice",
    title: "أَقْفِزُ إِلَى الشَّكْلِ",
    subtitle: "يَقُولُ الْمُعَلِّمُ، وَأَنَا أَقْفِزُ",
    emoji: "🤸",
    color,
    rounds: [
      choose(
        "أَقْفِزُ إِلَى الْمُثَلَّثِ.",
        [
          shape("circle", "blue"),
          shape("triangle", "blue"),
          shape("square", "blue"),
          shape("rectangle", "blue"),
        ],
        1,
      ),
      choose(
        "أَقْفِزُ إِلَى الدَّائِرَةِ الَّتِي نِصْفُهَا مُلَوَّنٌ.",
        [quarter("circle", "red"), shape("circle", "red"), half("circle", "red")],
        2,
      ),
      choose(
        "أَقْفِزُ إِلَى الْمُسْتَطِيلِ.",
        [shape("rectangle", "green"), shape("square", "green"), shape("triangle", "green")],
        0,
      ),
      choose(
        "أَقْفِزُ إِلَى الْمُرَبَّعِ الَّذِي رُبْعُهُ مُلَوَّنٌ.",
        [half("square", "yellow"), quarter("square", "yellow"), quarter("circle", "yellow")],
        1,
      ),
      choose("أَقْفِزُ إِلَى الْمُكَعَّبِ.", [e("⚽"), e("🥫"), e("🎲")], 2),
    ],
  },

  // ── اختبار الوحدة (p. 137) ──
  {
    section: TEST,
    type: "listen_pick",
    title: "اخْتِبَارُ الْوَحْدَةِ",
    subtitle: "الْمُجَسَّمَاتُ: أَسْمَعُ الاسْمَ وَأَخْتَارُ",
    emoji: "📝",
    color,
    questions: [
      listen("أَيْنَ الْمُكَعَّبُ؟", [CYLINDER, SPHERE, CUBE], 2),
      listen("أَيْنَ الْكُرَةُ؟", [SPHERE, CUBOID, CONE], 0),
      listen("أَيْنَ الأُسْطُوَانَةُ؟", [CUBE, CYLINDER, SPHERE], 1),
      listen("أَيْنَ الْمَخْرُوطُ؟", [CONE, CYLINDER, CUBOID], 0),
    ],
  },
  {
    section: TEST,
    type: "picture_choice",
    title: "الأَشْكَالُ وَالْكُسُورُ",
    subtitle: "أَخْتَارُ الْجَوَابَ",
    emoji: "📝",
    color,
    rounds: [
      choose(
        "عَجَلَةُ السَّيَّارَةِ دَائِرَةٌ. أَيْنَ الدَّائِرَةُ؟",
        [shape("square", "yellow"), shape("circle", "yellow"), shape("triangle", "yellow")],
        1,
      ),
      choose(
        "أَيْنَ الْمُسْتَطِيلُ؟",
        [shape("rectangle", "red"), shape("triangle", "blue"), shape("square", "red")],
        0,
      ),
      choose(
        "أَيْنَ الْمُثَلَّثُ؟",
        [shape("circle", "blue"), shape("rectangle", "red"), shape("triangle", "blue")],
        2,
      ),
      choose(
        "أَيُّ شَكْلٍ رُبْعُهُ مُلَوَّنٌ؟",
        [half("rectangle", "green"), quarter("rectangle", "green"), shape("rectangle", "green")],
        1,
      ),
      choose(
        "أَيُّ شَكْلٍ نِصْفُهُ مُلَوَّنٌ؟",
        [half("square", "pink"), quarter("circle", "pink"), shape("triangle", "pink")],
        0,
      ),
    ],
  },
];

export const mathBookUnit5: Unit = {
  id: "math-u5",
  number: 5,
  title: "الْوَحْدَةُ الْخَامِسَةُ",
  theme: "الأَشْكَالُ الْهَنْدَسِيَّةُ وَالْكُسُورُ",
  emoji: "🔺",
  emblem: "shapes_window",
  goal: "ship",
  color,
  badgeLabel: "أَشْكَالٌ",
  lessons: numberMathLessons(5, drafts),
};
