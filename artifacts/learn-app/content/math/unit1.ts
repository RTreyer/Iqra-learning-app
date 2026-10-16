// STATUS: exemplary content derived from the Yemen MoE Grade 1 Math textbook outline (docs/content/MATH_TEXTBOOK_OUTLINE.md). Review against the book pages before release. See docs/CONTENT_REVIEW.md
import { SUBJECT_COLORS, type Unit } from "../types.ts";

const color = SUBJECT_COLORS.math;

export const mathUnit1: Unit = {
  id: "m1",
  number: 1,
  title: "الْوَحْدَة الأُولَى",
  theme: "الأَعْدَاد مِنْ ٠ إِلَى ١٠",
  emoji: "🔢",
  color,
  badgeLabel: "أَعُدُّ",
  lessons: [
    {
      id: "m1-1",
      number: 1,
      type: "counting",
      title: "أَعُدُّ مِنْ ١ إِلَى ٣",
      subtitle: "أَعُدُّ وَأَخْتَارُ الْعَدَد",
      emoji: "🐟",
      color,
      rounds: [
        { emoji: "🐟", count: 2, options: [1, 2, 3] },
        { emoji: "🐥", count: 3, options: [2, 4, 3] },
        { emoji: "🌸", count: 1, options: [1, 3, 2] },
        { emoji: "🍎", count: 3, options: [3, 2, 1] },
        { emoji: "⭐", count: 2, options: [3, 1, 2] },
      ],
    },
    {
      id: "m1-2",
      number: 2,
      type: "counting",
      title: "أَعُدُّ مِنْ ٤ إِلَى ٦",
      subtitle: "أَعُدُّ وَأَخْتَارُ الْعَدَد",
      emoji: "🐥",
      color,
      rounds: [
        { emoji: "🐥", count: 4, options: [3, 4, 5] },
        { emoji: "🍎", count: 6, options: [6, 5, 7] },
        { emoji: "🌸", count: 5, options: [4, 6, 5] },
        { emoji: "🐟", count: 4, options: [4, 5, 6] },
        { emoji: "⭐", count: 6, options: [5, 7, 6] },
      ],
    },
    {
      id: "m1-3",
      number: 3,
      type: "counting",
      title: "أَعُدُّ مِنْ ٧ إِلَى ١٠",
      subtitle: "أَعُدُّ وَأَخْتَارُ الْعَدَد",
      emoji: "🌸",
      color,
      rounds: [
        { emoji: "🌸", count: 7, options: [6, 7, 8] },
        { emoji: "🐟", count: 9, options: [9, 8, 10] },
        { emoji: "⭐", count: 8, options: [7, 9, 8] },
        { emoji: "🍎", count: 10, options: [9, 10, 8] },
        { emoji: "🐥", count: 7, options: [7, 6, 8] },
      ],
    },
    {
      id: "m1-4",
      number: 4,
      type: "listen_pick",
      title: "أَيُّ عَدَدٍ هَٰذَا؟",
      subtitle: "أَسْمَعُ الْعَدَدَ وَأَخْتَارُ الرَّقْم",
      emoji: "👂",
      color,
      questions: [
        {
          word: "خَمْسَة",
          choices: [
            { emoji: "٣", word: "٣" },
            { emoji: "٥", word: "٥" },
            { emoji: "٧", word: "٧" },
          ],
          correctIndex: 1,
        },
        {
          word: "ثَمَانِيَة",
          choices: [
            { emoji: "٨", word: "٨" },
            { emoji: "٦", word: "٦" },
            { emoji: "٩", word: "٩" },
          ],
          correctIndex: 0,
        },
        {
          word: "اثْنَان",
          choices: [
            { emoji: "٤", word: "٤" },
            { emoji: "٣", word: "٣" },
            { emoji: "٢", word: "٢" },
          ],
          correctIndex: 2,
        },
      ],
    },
  ],
};
