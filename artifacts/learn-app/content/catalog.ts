import { SUBJECT_COLORS, type Book, type Grade } from "./types.ts";
import { unit1 } from "./arabic/unit1.ts";
import { unit2 } from "./arabic/unit2.ts";
import { unit3 } from "./arabic/unit3.ts";
import { unit4 } from "./arabic/unit4.ts";
import { unit5 } from "./arabic/unit5.ts";
import { unit6 } from "./arabic/unit6.ts";
import { unit7 } from "./arabic/unit7.ts";
import { unit8 } from "./arabic/unit8.ts";
import { mathUnit1 } from "./math/unit1.ts";
import { mathUnit2 } from "./math/unit2.ts";
import { mathUnit3 } from "./math/unit3.ts";
import { scienceUnit1 } from "./science/unit1.ts";
import { scienceUnit2 } from "./science/unit2.ts";
import { scienceUnit3 } from "./science/unit3.ts";

const grade1Books: Book[] = [
  {
    id: "arabic-1",
    subject: "arabic",
    title: "أقرأ وأتعلم",
    subtitle: "اللغة العربية — الجزء الأول",
    emoji: "📖",
    color: SUBJECT_COLORS.arabic,
    available: true,
    units: [unit1, unit2, unit3, unit4, unit5, unit6, unit7, unit8],
  },
  {
    id: "arabic-2",
    subject: "arabic",
    title: "أقرأ وأتعلم",
    subtitle: "اللغة العربية — الجزء الثاني",
    emoji: "📖",
    color: SUBJECT_COLORS.arabic,
    available: false,
    units: [],
  },
  {
    id: "math-1",
    subject: "math",
    title: "الرياضيات",
    subtitle: "الجزء الأول",
    emoji: "🔢",
    color: SUBJECT_COLORS.math,
    available: true,
    units: [mathUnit1, mathUnit2, mathUnit3],
  },
  {
    id: "math-2",
    subject: "math",
    title: "الرياضيات",
    subtitle: "الجزء الثاني",
    emoji: "🔢",
    color: SUBJECT_COLORS.math,
    available: false,
    units: [],
  },
  // Placeholder content without a textbook source, kept out of the release until one exists.
  {
    id: "science-1",
    subject: "science",
    title: "العلوم",
    subtitle: "الجزء الأول",
    emoji: "🔬",
    color: SUBJECT_COLORS.science,
    available: false,
    units: [scienceUnit1, scienceUnit2, scienceUnit3],
  },
];

/** Grades 1 to 6 in display order. Grades 2 to 6 have no books yet and show as "قريباً". */
export const grades: Grade[] = [
  { number: 1, title: "الصف الأول", books: grade1Books },
  { number: 2, title: "الصف الثاني", books: [] },
  { number: 3, title: "الصف الثالث", books: [] },
  { number: 4, title: "الصف الرابع", books: [] },
  { number: 5, title: "الصف الخامس", books: [] },
  { number: 6, title: "الصف السادس", books: [] },
];

export const books: Book[] = grades.flatMap((grade) => grade.books);
