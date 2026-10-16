import type { Unit } from "../types";

const unit3Letters = ["ج", "ح", "خ"];

// ── Unit 3: ج، ح، خ ── فِي الْحَدِيقَة ────────────────────────────────────────

export const unit3: Unit = {
  id: "a3",
  number: 3,
  title: "الوحدة الثالثة",
  letters: unit3Letters,
  theme: "فِي الْحَدِيقَة",
  emoji: "🌳",
  color: "#059669",
  badgeLabel: "ج ح خ",
  lessons: [
    {
      id: "u3-1", number: 1, type: "story",
      title: "أَقْرَأُ الْقِصَّة", subtitle: "اضغط على كل جملة لتسمعها",
      emoji: "📖", color: "#059669",
      storyTitle: "فِي الْحَدِيقَة",
      lines: [
        { text: "نَحْنُ فِي الْحَدِيقَةِ الْجَمِيلَة", emoji: "🌳" },
        { text: "الْجَوُّ جَمِيل وَمُشْمِس", emoji: "☀️" },
        { text: "نَرَى حِصَانًا وَحَمَامًا يَطِيرَان", emoji: "🐴" },
        { text: "خَرُوف يَأْكُلُ الْخُضَارَ بِسَعَادَة", emoji: "🐑" },
      ],
    },
    {
      id: "u3-2", number: 2, type: "naming",
      title: "الْمُفْرَدَات", subtitle: "اضغط على كل كلمة لتسمعها",
      emoji: "💬", color: "#047857",
      items: [
        { emoji: "🐪", word: "جَمَل" }, { emoji: "🏔️", word: "جَبَل" },
        { emoji: "🐴", word: "حِصَان" }, { emoji: "🕊️", word: "حَمَام" },
        { emoji: "🐑", word: "خَرُوف" }, { emoji: "🥦", word: "خُضَار" },
      ],
    },
    {
      id: "u3-3", number: 3, type: "letter_pick",
      title: "أَعْرِفُ الْحُرُوف", subtitle: "اختَر الحرف الصحيح في كل سؤال",
      emoji: "🔤", color: "#7C3AED",
      rounds: [
        { targetLetter: "ج", letters: ["ج", "خ", "ح"], correctIndex: 0 },
        { targetLetter: "ح", letters: ["خ", "ح", "ب"], correctIndex: 1 },
        { targetLetter: "خ", letters: ["ت", "ج", "خ"], correctIndex: 2 },
        { targetLetter: "ج", letters: ["ح", "ج", "ن"], correctIndex: 1 },
        { targetLetter: "خ", letters: ["خ", "ص", "ف"], correctIndex: 0 },
      ],
    },
    {
      id: "u3-4", number: 4, type: "word_read",
      title: "أَقْرَأُ الْكَلِمَات", subtitle: "اسمع الكلمة واختر الصواب",
      emoji: "👁️", color: "#D97706",
      rounds: [
        { word: "جَمَل", choices: ["جَمَل", "حِصَان", "خَرُوف"], correctIndex: 0 },
        { word: "حِصَان", choices: ["جَبَل", "حِصَان", "خُضَار"], correctIndex: 1 },
        { word: "خَرُوف", choices: ["خَرُوف", "جَمَل", "حَمَام"], correctIndex: 0 },
        { word: "حَمَام", choices: ["خُضَار", "حَمَام", "جَبَل"], correctIndex: 1 },
        { word: "جَبَل", choices: ["حِصَان", "خَرُوف", "جَبَل"], correctIndex: 2 },
      ],
    },
    {
      id: "u3-5", number: 5, type: "listen_pick",
      title: "أَفْهَمُ الْقِصَّة", subtitle: "أجب عن أسئلة القصة",
      emoji: "🧠", color: "#DB2777",
      questions: [
        { word: "أَيْنَ نَحْن؟", choices: [{ emoji: "🌳", word: "الْحَدِيقَة" }, { emoji: "🏪", word: "السُّوق" }, { emoji: "🏫", word: "الْمَدْرَسَة" }], correctIndex: 0 },
        { word: "مَا الَّذِي يَأْكُلُ الْخُضَار؟", choices: [{ emoji: "🐑", word: "الْخَرُوف" }, { emoji: "🐴", word: "الْحِصَان" }, { emoji: "🐪", word: "الْجَمَل" }], correctIndex: 0 },
        { word: "كَيْفَ الْجَوّ؟", choices: [{ emoji: "☀️", word: "جَمِيل وَمُشْمِس" }, { emoji: "🌧️", word: "مُمْطِر" }, { emoji: "❄️", word: "بَارِد" }], correctIndex: 0 },
      ],
    },
    {
      id: "u3-6", number: 6, type: "trace",
      title: "أَكْتُبُ الْحُرُوف", subtitle: "تتبّع الحرف بأصبعك",
      emoji: "✍️", color: "#7C3AED",
      targets: unit3Letters.map((l) => ({ guide: l, label: l, tts: l })),
    },
  ],
};
