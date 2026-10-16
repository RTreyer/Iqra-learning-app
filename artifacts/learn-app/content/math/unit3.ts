// STATUS: exemplary content derived from the Yemen MoE Grade 1 Math textbook outline (docs/content/MATH_TEXTBOOK_OUTLINE.md). Review against the book pages before release. See docs/CONTENT_REVIEW.md
import { SUBJECT_COLORS, type Unit } from "../types.ts";

const color = SUBJECT_COLORS.math;

const circle = { emoji: "⚪", word: "دَائِرَة" };
const square = { emoji: "🔲", word: "مُرَبَّع" };
const triangle = { emoji: "🔺", word: "مُثَلَّث" };
const rectangle = { emoji: "▬", word: "مُسْتَطِيل" };

export const mathUnit3: Unit = {
  id: "m3",
  number: 3,
  title: "الْوَحْدَة الثَّالِثَة",
  theme: "الأَشْكَال الْهَنْدَسِيَّة",
  emoji: "🔺",
  color,
  badgeLabel: "أَشْكَال",
  lessons: [
    {
      id: "m3-1",
      number: 1,
      type: "naming",
      title: "أَتَعَرَّفُ الأَشْكَال",
      subtitle: "اضغط على كل شكل لتسمع اسمه",
      emoji: "⚪",
      color,
      items: [circle, square, triangle, rectangle],
    },
    {
      id: "m3-2",
      number: 2,
      type: "matching",
      title: "أَصِلُ الشَّيْءَ بِشَكْلِه",
      subtitle: "أَيُّ شَكْلٍ يُشْبِهُ هَٰذَا الشَّيْء؟",
      emoji: "🔗",
      color,
      pairs: [
        { left: { emoji: "🚪", word: "بَاب" }, right: rectangle },
        { left: { emoji: "⚽", word: "كُرَة" }, right: circle },
        { left: { emoji: "⚠️", word: "إِشَارَة" }, right: triangle },
        { left: { emoji: "🎁", word: "هَدِيَّة" }, right: square },
      ],
    },
    {
      id: "m3-3",
      number: 3,
      type: "listen_pick",
      title: "أَيُّ شَكْلٍ هَٰذَا؟",
      subtitle: "أَسْمَعُ الاِسْمَ وَأَخْتَارُ الشَّكْل",
      emoji: "👂",
      color,
      questions: [
        { word: "مُثَلَّث", choices: [circle, triangle, square], correctIndex: 1 },
        { word: "دَائِرَة", choices: [triangle, rectangle, circle], correctIndex: 2 },
        { word: "مُسْتَطِيل", choices: [square, rectangle, circle], correctIndex: 1 },
      ],
    },
  ],
};
