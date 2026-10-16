import type { Unit } from "../types";

// ── Unit 8: ع، غ، ف، ق ── فِي الْقَرْيَة ─────────────────────────────────────

export const unit8: Unit = {
  id: "a8",
  number: 8,
  title: "الوحدة الثامنة",
  letters: ["ع", "غ", "ف", "ق"],
  theme: "فِي الْقَرْيَة",
  emoji: "🏡",
  color: "#9333EA",
  badgeLabel: "ع غ ف ق",
  lessons: [
    {
      id: "u8-1", number: 1, type: "story",
      title: "أَقْرَأُ الْقِصَّة", subtitle: "اضغط على كل جملة لتسمعها",
      emoji: "📖", color: "#9333EA",
      storyTitle: "فِي الْقَرْيَة",
      lines: [
        { text: "قَرْيَتُنَا جَمِيلَة وَهَادِئَة", emoji: "🏡" },
        { text: "عُصْفُور يُغَنِّي عَلَى الشَّجَرَة", emoji: "🐦" },
        { text: "غُرَاب أَسْوَد يَطِيرُ فِي السَّمَاء", emoji: "🐦‍⬛" },
        { text: "فَرَاشَة قَرِيبَة مِنَ الزُّهُور", emoji: "🦋" },
      ],
    },
    {
      id: "u8-2", number: 2, type: "naming",
      title: "الْمُفْرَدَات", subtitle: "اضغط على كل كلمة لتسمعها",
      emoji: "💬", color: "#7E22CE",
      items: [
        { emoji: "🍇", word: "عِنَب" }, { emoji: "🐦", word: "عُصْفُور" },
        { emoji: "☁️", word: "غَيْم" }, { emoji: "🐦‍⬛", word: "غُرَاب" },
        { emoji: "🦋", word: "فَرَاشَة" }, { emoji: "🐱", word: "قِطَّة" },
      ],
    },
    {
      id: "u8-3", number: 3, type: "letter_pick",
      title: "أَعْرِفُ الْحُرُوف", subtitle: "اختَر الحرف الصحيح في كل سؤال",
      emoji: "🔤", color: "#7C3AED",
      rounds: [
        { targetLetter: "ع", letters: ["ع", "غ", "ح"], correctIndex: 0 },
        { targetLetter: "غ", letters: ["ف", "غ", "ع"], correctIndex: 1 },
        { targetLetter: "ف", letters: ["ف", "ق", "غ"], correctIndex: 0 },
        { targetLetter: "ق", letters: ["ف", "ق", "ع"], correctIndex: 1 },
        { targetLetter: "ع", letters: ["غ", "ع", "ق"], correctIndex: 1 },
      ],
    },
    {
      id: "u8-4", number: 4, type: "word_read",
      title: "أَقْرَأُ الْكَلِمَات", subtitle: "اسمع الكلمة واختر الصواب",
      emoji: "👁️", color: "#D97706",
      rounds: [
        { word: "عُصْفُور", choices: ["عُصْفُور", "غُرَاب", "فَرَاشَة"], correctIndex: 0 },
        { word: "غُرَاب", choices: ["عِنَب", "غُرَاب", "قِطَّة"], correctIndex: 1 },
        { word: "فَرَاشَة", choices: ["فَرَاشَة", "قِطَّة", "عِنَب"], correctIndex: 0 },
        { word: "قِطَّة", choices: ["غَيْم", "قِطَّة", "عُصْفُور"], correctIndex: 1 },
        { word: "عِنَب", choices: ["فَرَاشَة", "غُرَاب", "عِنَب"], correctIndex: 2 },
      ],
    },
    {
      id: "u8-5", number: 5, type: "listen_pick",
      title: "أَفْهَمُ الْقِصَّة", subtitle: "أجب عن أسئلة القصة",
      emoji: "🧠", color: "#DB2777",
      questions: [
        { word: "أَيْنَ يُغَنِّي الْعُصْفُور؟", choices: [{ emoji: "🌳", word: "عَلَى الشَّجَرَة" }, { emoji: "🏠", word: "فِي الْبَيْت" }, { emoji: "🏪", word: "فِي السُّوق" }], correctIndex: 0 },
        { word: "مَا لَوْنُ الْغُرَاب؟", choices: [{ emoji: "🖤", word: "أَسْوَد" }, { emoji: "🤍", word: "أَبْيَض" }, { emoji: "❤️", word: "أَحْمَر" }], correctIndex: 0 },
        { word: "أَيْنَ الْفَرَاشَة؟", choices: [{ emoji: "🦋", word: "قَرِيبَة مِنَ الزُّهُور" }, { emoji: "🏠", word: "فِي الْبَيْت" }, { emoji: "🌊", word: "فِي الْبَحْر" }], correctIndex: 0 },
      ],
    },
  ],
};
