// STATUS: placeholder, align with Yemen MoE textbook before release. See docs/CONTENT_REVIEW.md
import { SUBJECT_COLORS, type Unit } from "../types.ts";

const color = SUBJECT_COLORS.science;

export const scienceUnit1: Unit = {
  id: "s1",
  number: 1,
  title: "الْوَحْدَة الأُولَى",
  theme: "جِسْمِي",
  emoji: "🧒",
  color,
  badgeLabel: "جِسْمِي",
  lessons: [
    {
      id: "s1-1", number: 1, type: "story",
      title: "أَقْرَأُ الْقِصَّة", subtitle: "اضغط على كل جملة لتسمعها",
      emoji: "📖", color,
      storyTitle: "جِسْمِي",
      lines: [
        { text: "هَٰذَا جِسْمِي", emoji: "🧒" },
        { text: "أَرَى بِعَيْنِي", emoji: "👀" },
        { text: "أَسْمَعُ بِأُذُنِي", emoji: "👂" },
        { text: "أَشُمُّ بِأَنْفِي", emoji: "👃" },
      ],
    },
    {
      id: "s1-2", number: 2, type: "naming",
      title: "أَجْزَاءُ جِسْمِي", subtitle: "اضغط على كل كلمة لتسمعها",
      emoji: "💬", color,
      items: [
        { emoji: "👀", word: "عَيْن" }, { emoji: "👂", word: "أُذُن" },
        { emoji: "👃", word: "أَنْف" }, { emoji: "👄", word: "فَم" },
        { emoji: "✋", word: "يَد" }, { emoji: "🦶", word: "قَدَم" },
      ],
    },
    {
      id: "s1-3", number: 3, type: "listen_pick",
      title: "أَسْمَعُ وَأَخْتَار", subtitle: "اسمع الكلمة واختر الصورة",
      emoji: "👂", color,
      questions: [
        { word: "عَيْن", choices: [{ emoji: "👂", word: "أُذُن" }, { emoji: "👀", word: "عَيْن" }, { emoji: "👄", word: "فَم" }], correctIndex: 1 },
        { word: "أُذُن", choices: [{ emoji: "👃", word: "أَنْف" }, { emoji: "👀", word: "عَيْن" }, { emoji: "👂", word: "أُذُن" }], correctIndex: 2 },
        { word: "أَنْف", choices: [{ emoji: "👃", word: "أَنْف" }, { emoji: "✋", word: "يَد" }, { emoji: "👄", word: "فَم" }], correctIndex: 0 },
      ],
    },
  ],
};
