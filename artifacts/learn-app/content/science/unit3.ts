// STATUS: placeholder, align with Yemen MoE textbook before release. See docs/CONTENT_REVIEW.md
import { SUBJECT_COLORS, type Unit } from "../types.ts";

const color = SUBJECT_COLORS.science;

export const scienceUnit3: Unit = {
  id: "s3",
  number: 3,
  title: "الْوَحْدَة الثَّالِثَة",
  theme: "النَّبَاتَات وَالْمَاء",
  emoji: "🌱",
  color,
  badgeLabel: "نَبَات",
  lessons: [
    {
      id: "s3-1", number: 1, type: "story",
      title: "أَقْرَأُ الْقِصَّة", subtitle: "اضغط على كل جملة لتسمعها",
      emoji: "📖", color,
      storyTitle: "النَّبَاتُ يَنْمُو",
      lines: [
        { text: "الْمَطَرُ يَنْزِلُ مِنَ السَّمَاء", emoji: "🌧️" },
        { text: "الْمَاءُ يَسْقِي النَّبَات", emoji: "💧" },
        { text: "الشَّمْسُ تُعْطِينَا الضَّوْء", emoji: "☀️" },
        { text: "النَّبْتَةُ تَنْمُو وَتَكْبُر", emoji: "🌱" },
      ],
    },
    {
      id: "s3-2", number: 2, type: "naming",
      title: "أَسْمَاءُ الأَشْيَاء", subtitle: "اضغط على كل كلمة لتسمعها",
      emoji: "💬", color,
      items: [
        { emoji: "💧", word: "مَاء" }, { emoji: "☀️", word: "شَمْس" },
        { emoji: "🌱", word: "نَبْتَة" }, { emoji: "🌸", word: "زَهْرَة" },
        { emoji: "🌳", word: "شَجَرَة" }, { emoji: "🌧️", word: "مَطَر" },
      ],
    },
    {
      id: "s3-3", number: 3, type: "listen_pick",
      title: "أَسْمَعُ وَأَخْتَار", subtitle: "اسمع الكلمة واختر الصورة",
      emoji: "👂", color,
      questions: [
        { word: "مَطَر", choices: [{ emoji: "🌧️", word: "مَطَر" }, { emoji: "☀️", word: "شَمْس" }, { emoji: "🌳", word: "شَجَرَة" }], correctIndex: 0 },
        { word: "شَمْس", choices: [{ emoji: "💧", word: "مَاء" }, { emoji: "🌸", word: "زَهْرَة" }, { emoji: "☀️", word: "شَمْس" }], correctIndex: 2 },
        { word: "نَبْتَة", choices: [{ emoji: "🌧️", word: "مَطَر" }, { emoji: "🌱", word: "نَبْتَة" }, { emoji: "💧", word: "مَاء" }], correctIndex: 1 },
      ],
    },
  ],
};
