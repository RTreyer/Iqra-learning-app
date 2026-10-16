import type { Book } from "./types";
import { unit1 } from "./arabic/unit1.ts";
import { unit2 } from "./arabic/unit2.ts";
import { unit3 } from "./arabic/unit3.ts";
import { unit4 } from "./arabic/unit4.ts";
import { unit5 } from "./arabic/unit5.ts";
import { unit6 } from "./arabic/unit6.ts";
import { unit7 } from "./arabic/unit7.ts";
import { unit8 } from "./arabic/unit8.ts";

// Book colors equal `subjects` in theme/tokens.ts. They are literals here because
// tokens imports react-native and this module must load in plain Node (test:data);
// __tests__/content.test.ts guards that they stay in sync.
export const books: Book[] = [
  {
    id: "arabic-1",
    subject: "arabic",
    title: "أقرأ وأتعلم",
    subtitle: "اللغة العربية — الجزء الأول",
    emoji: "📖",
    color: "#2563EB",
    available: true,
    units: [unit1, unit2, unit3, unit4, unit5, unit6, unit7, unit8],
  },
  {
    id: "math-1",
    subject: "math",
    title: "الرياضيات",
    subtitle: "الصف الأول",
    emoji: "🔢",
    color: "#7C3AED",
    available: false,
    units: [],
  },
  {
    id: "science-1",
    subject: "science",
    title: "العلوم",
    subtitle: "الصف الأول",
    emoji: "🔬",
    color: "#059669",
    available: false,
    units: [],
  },
];
