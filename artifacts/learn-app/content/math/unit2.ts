// STATUS: exemplary content derived from the Yemen MoE Grade 1 Math textbook outline (docs/content/MATH_TEXTBOOK_OUTLINE.md). Review against the book pages before release. See docs/CONTENT_REVIEW.md
import { SUBJECT_COLORS, type Unit } from "../types.ts";

const color = SUBJECT_COLORS.math;

export const mathUnit2: Unit = {
  id: "m2",
  number: 2,
  title: "الْوَحْدَة الثَّانِيَة",
  theme: "الْجَمْع وَالطَّرْح ضِمْنَ ١٠",
  emoji: "➕",
  color,
  badgeLabel: "أَجْمَعُ وَأَطْرَحُ",
  lessons: [
    {
      id: "m2-1",
      number: 1,
      type: "arithmetic",
      title: "أَجْمَعُ ضِمْنَ ٥",
      subtitle: "٣ زَائِد ١ يُسَاوِي ٤",
      emoji: "➕",
      color,
      rounds: [
        { a: 1, b: 2, op: "+", options: [2, 3, 4] },
        { a: 2, b: 2, op: "+", options: [4, 3, 5] },
        { a: 3, b: 2, op: "+", options: [4, 6, 5] },
        { a: 1, b: 1, op: "+", options: [3, 1, 2] },
        { a: 1, b: 4, op: "+", options: [5, 4, 6] },
      ],
    },
    {
      id: "m2-2",
      number: 2,
      type: "arithmetic",
      title: "أَجْمَعُ ضِمْنَ ١٠",
      subtitle: "٦ زَائِد ٣ يُسَاوِي ٩",
      emoji: "➕",
      color,
      rounds: [
        { a: 4, b: 3, op: "+", options: [6, 7, 8] },
        { a: 5, b: 4, op: "+", options: [9, 8, 10] },
        { a: 6, b: 2, op: "+", options: [7, 9, 8] },
        { a: 5, b: 5, op: "+", options: [9, 10, 8] },
        { a: 7, b: 3, op: "+", options: [10, 9, 8] },
      ],
    },
    {
      id: "m2-3",
      number: 3,
      type: "arithmetic",
      title: "أَطْرَحُ ضِمْنَ ٥",
      subtitle: "٤ نَاقِص ٢ يُسَاوِي ٢",
      emoji: "➖",
      color,
      rounds: [
        { a: 3, b: 1, op: "-", options: [1, 2, 3] },
        { a: 4, b: 3, op: "-", options: [2, 0, 1] },
        { a: 5, b: 2, op: "-", options: [3, 2, 4] },
        { a: 5, b: 5, op: "-", options: [1, 0, 2] },
        { a: 4, b: 1, op: "-", options: [2, 4, 3] },
      ],
    },
    {
      id: "m2-4",
      number: 4,
      type: "arithmetic",
      title: "أَطْرَحُ ضِمْنَ ١٠",
      subtitle: "٩ نَاقِص ٣ يُسَاوِي ٦",
      emoji: "➖",
      color,
      rounds: [
        { a: 8, b: 3, op: "-", options: [4, 5, 6] },
        { a: 10, b: 4, op: "-", options: [6, 5, 7] },
        { a: 9, b: 5, op: "-", options: [3, 5, 4] },
        { a: 9, b: 2, op: "-", options: [8, 6, 7] },
        { a: 7, b: 4, op: "-", options: [2, 3, 4] },
      ],
    },
  ],
};
