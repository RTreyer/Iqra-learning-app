import type { Unit } from "../types";

// ── Unit 5: س، ش ── فِي السُّوق ───────────────────────────────────────────────

export const unit5: Unit = {
  id: "a5",
  number: 5,
  title: "الوحدة الخامسة",
  letters: ["س", "ش"],
  theme: "فِي السُّوق",
  emoji: "🏪",
  color: "#D97706",
  badgeLabel: "س ش",
  lessons: [
    {
      id: "u5-1", number: 1, type: "story",
      title: "أَقْرَأُ الْقِصَّة", subtitle: "اضغط على كل جملة لتسمعها",
      emoji: "📖", color: "#D97706",
      storyTitle: "فِي السُّوق",
      lines: [
        { text: "نَحْنُ فِي السُّوقِ الْكَبِير", emoji: "🏪" },
        { text: "نَشْتَرِي السَّمَك وَالْخُضَار", emoji: "🐟" },
        { text: "الشَّمْسُ مُشْرِقَة وَالأَجْوَاء جَمِيلَة", emoji: "☀️" },
        { text: "شَجَرَة كَبِيرَة تُظَلِّلُنَا فِي السُّوق", emoji: "🌳" },
      ],
    },
    {
      id: "u5-2", number: 2, type: "naming",
      title: "الْمُفْرَدَات", subtitle: "اضغط على كل كلمة لتسمعها",
      emoji: "💬", color: "#B45309",
      items: [
        { emoji: "🐟", word: "سَمَكَة" }, { emoji: "🚗", word: "سَيَّارَة" },
        { emoji: "🌳", word: "شَجَرَة" }, { emoji: "☀️", word: "شَمْس" },
        { emoji: "☁️", word: "سَحَاب" }, { emoji: "🐑", word: "شَاة" },
      ],
    },
    {
      id: "u5-3", number: 3, type: "letter_pick",
      title: "أَعْرِفُ الْحُرُوف", subtitle: "اختَر الحرف الصحيح في كل سؤال",
      emoji: "🔤", color: "#7C3AED",
      rounds: [
        { targetLetter: "س", letters: ["س", "ش", "ص"], correctIndex: 0 },
        { targetLetter: "ش", letters: ["ص", "ش", "س"], correctIndex: 1 },
        { targetLetter: "س", letters: ["ش", "ض", "س"], correctIndex: 2 },
        { targetLetter: "ش", letters: ["ش", "ف", "ق"], correctIndex: 0 },
        { targetLetter: "س", letters: ["ك", "س", "ط"], correctIndex: 1 },
      ],
    },
    {
      id: "u5-4", number: 4, type: "word_read",
      title: "أَقْرَأُ الْكَلِمَات", subtitle: "اسمع الكلمة واختر الصواب",
      emoji: "👁️", color: "#D97706",
      rounds: [
        { word: "سَمَكَة", choices: ["سَمَكَة", "شَجَرَة", "سَحَاب"], correctIndex: 0 },
        { word: "شَجَرَة", choices: ["سَيَّارَة", "شَجَرَة", "شَمْس"], correctIndex: 1 },
        { word: "شَمْس", choices: ["شَمْس", "سَحَاب", "شَاة"], correctIndex: 0 },
        { word: "سَيَّارَة", choices: ["شَاة", "سَيَّارَة", "شَجَرَة"], correctIndex: 1 },
        { word: "سَحَاب", choices: ["سَمَكَة", "شَمْس", "سَحَاب"], correctIndex: 2 },
      ],
    },
    {
      id: "u5-5", number: 5, type: "listen_pick",
      title: "أَفْهَمُ الْقِصَّة", subtitle: "أجب عن أسئلة القصة",
      emoji: "🧠", color: "#DB2777",
      questions: [
        { word: "أَيْنَ نَحْن؟", choices: [{ emoji: "🏪", word: "السُّوق" }, { emoji: "🌳", word: "الْحَدِيقَة" }, { emoji: "🌾", word: "الْمَزْرَعَة" }], correctIndex: 0 },
        { word: "مَاذَا نَشْتَرِي؟", choices: [{ emoji: "🐟", word: "السَّمَك وَالْخُضَار" }, { emoji: "📚", word: "الْكُتُب" }, { emoji: "👕", word: "الْمَلَابِس" }], correctIndex: 0 },
        { word: "كَيْفَ الشَّمْس؟", choices: [{ emoji: "☀️", word: "مُشْرِقَة" }, { emoji: "🌧️", word: "غَائِبَة" }, { emoji: "🌑", word: "مُظْلِمَة" }], correctIndex: 0 },
      ],
    },
  ],
};
