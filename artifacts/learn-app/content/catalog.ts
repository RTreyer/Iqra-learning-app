import { SUBJECT_COLORS, type Book } from "./types.ts";
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

export const books: Book[] = [
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
    id: "math-1",
    subject: "math",
    title: "الرياضيات",
    subtitle: "الصف الأول",
    emoji: "🔢",
    color: SUBJECT_COLORS.math,
    available: true,
    units: [mathUnit1, mathUnit2, mathUnit3],
  },
  {
    id: "science-1",
    subject: "science",
    title: "العلوم",
    subtitle: "الصف الأول",
    emoji: "🔬",
    color: SUBJECT_COLORS.science,
    available: false,
    units: [],
  },
];
