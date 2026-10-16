// STATUS: placeholder, align with Yemen MoE textbook before release. See docs/CONTENT_REVIEW.md
import { SUBJECT_COLORS, type Unit } from "../types.ts";

const color = SUBJECT_COLORS.science;

export const scienceUnit2: Unit = {
  id: "s2",
  number: 2,
  title: "الْوَحْدَة الثَّانِيَة",
  theme: "الْحَيَوَانَات",
  emoji: "🐄",
  color,
  badgeLabel: "حَيَوَانَات",
  lessons: [
    {
      id: "s2-1", number: 1, type: "story",
      title: "أَقْرَأُ الْقِصَّة", subtitle: "اضغط على كل جملة لتسمعها",
      emoji: "📖", color,
      storyTitle: "الْحَيَوَانَات",
      lines: [
        { text: "الْقِطَّةُ تَشْرَبُ اللَّبَن", emoji: "🐱" },
        { text: "الْعُصْفُورُ يَطِيرُ فِي الْهَوَاء", emoji: "🐦" },
        { text: "السَّمَكَةُ تَسْبَحُ فِي الْمَاء", emoji: "🐟" },
        { text: "الْبَقَرَةُ تُعْطِينَا الْحَلِيب", emoji: "🐄" },
      ],
    },
    {
      id: "s2-2", number: 2, type: "naming",
      title: "أَسْمَاءُ الْحَيَوَانَات", subtitle: "اضغط على كل كلمة لتسمعها",
      emoji: "💬", color,
      items: [
        { emoji: "🐱", word: "قِطَّة" }, { emoji: "🐦", word: "عُصْفُور" },
        { emoji: "🐟", word: "سَمَكَة" }, { emoji: "🐄", word: "بَقَرَة" },
        { emoji: "🐑", word: "خَرُوف" }, { emoji: "🐓", word: "دَجَاجَة" },
      ],
    },
    {
      id: "s2-3", number: 3, type: "listen_pick",
      title: "أَسْمَعُ وَأَخْتَار", subtitle: "اسمع الكلمة واختر الصورة",
      emoji: "👂", color,
      questions: [
        { word: "عُصْفُور", choices: [{ emoji: "🐟", word: "سَمَكَة" }, { emoji: "🐦", word: "عُصْفُور" }, { emoji: "🐄", word: "بَقَرَة" }], correctIndex: 1 },
        { word: "سَمَكَة", choices: [{ emoji: "🐱", word: "قِطَّة" }, { emoji: "🐓", word: "دَجَاجَة" }, { emoji: "🐟", word: "سَمَكَة" }], correctIndex: 2 },
        { word: "بَقَرَة", choices: [{ emoji: "🐄", word: "بَقَرَة" }, { emoji: "🐑", word: "خَرُوف" }, { emoji: "🐦", word: "عُصْفُور" }], correctIndex: 0 },
      ],
    },
  ],
};
