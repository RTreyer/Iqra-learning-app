import type { Unit } from "../types";

const unit2Letters = ["ب", "ت", "ث"];

// ── Unit 2: ب، ت، ث ── بَيْتُنَا ──────────────────────────────────────────────

export const unit2: Unit = {
  id: "a2",
  number: 2,
  title: "الوحدة الثانية",
  letters: unit2Letters,
  theme: "بَيْتُنَا",
  emoji: "🏠",
  color: "#2563EB",
  badgeLabel: "ب ت ث",
  lessons: [
    {
      id: "u2-1",
      number: 1,
      type: "story",
      title: "أَقْرَأُ الْقِصَّة",
      subtitle: "اضغط على كل جملة لتسمعها",
      emoji: "📖",
      color: "#2563EB",
      storyTitle: "بَيْتُنَا",
      lines: [
        { text: "هَذَا بَيْتُنَا الْجَمِيل", emoji: "🏠" },
        { text: "بَابُنَا أَبْيَض وَنَظِيف", emoji: "🚪" },
        { text: "عِنْدَنَا تُفَّاح وَتِين لَذِيذ", emoji: "🍎" },
        { text: "أَمَامَ الْبَيْتِ ثَعْلَبٌ صَغِير", emoji: "🦊" },
      ],
    },
    {
      id: "u2-2",
      number: 2,
      type: "naming",
      title: "الْمُفْرَدَات",
      subtitle: "اضغط على كل كلمة لتسمعها",
      emoji: "💬",
      color: "#1D4ED8",
      items: [
        { emoji: "🏠", word: "بَيْت" },
        { emoji: "🚪", word: "بَاب" },
        { emoji: "🍎", word: "تُفَّاحَة" },
        { emoji: "🫐", word: "تِين" },
        { emoji: "🦊", word: "ثَعْلَب" },
        { emoji: "🐂", word: "ثَوْر" },
      ],
    },
    {
      id: "u2-3",
      number: 3,
      type: "letter_pick",
      title: "أَعْرِفُ الْحُرُوف",
      subtitle: "اختَر الحرف الصحيح في كل سؤال",
      emoji: "🔤",
      color: "#7C3AED",
      rounds: [
        { targetLetter: "ب", letters: ["ب", "ت", "ن"], correctIndex: 0 },
        { targetLetter: "ت", letters: ["ث", "ت", "ب"], correctIndex: 1 },
        { targetLetter: "ث", letters: ["ث", "س", "ج"], correctIndex: 0 },
        { targetLetter: "ب", letters: ["د", "ر", "ب"], correctIndex: 2 },
        { targetLetter: "ت", letters: ["ت", "خ", "ز"], correctIndex: 0 },
      ],
    },
    {
      id: "u2-4",
      number: 4,
      type: "word_read",
      title: "أَقْرَأُ الْكَلِمَات",
      subtitle: "اسمع الكلمة واختر الصواب",
      emoji: "👁️",
      color: "#D97706",
      rounds: [
        { word: "بَيْت", choices: ["بَيْت", "تِين", "ثَعْلَب"], correctIndex: 0 },
        { word: "تِين", choices: ["بَاب", "تِين", "ثَعْلَب"], correctIndex: 1 },
        { word: "ثَعْلَب", choices: ["ثَعْلَب", "بِنْت", "تُفَّاحَة"], correctIndex: 0 },
        { word: "بَاب", choices: ["تِين", "بَاب", "ثَوْر"], correctIndex: 1 },
        { word: "تُفَّاحَة", choices: ["بُسْتَان", "ثَوْر", "تُفَّاحَة"], correctIndex: 2 },
      ],
    },
    {
      id: "u2-5",
      number: 5,
      type: "listen_pick",
      title: "أَفْهَمُ الْقِصَّة",
      subtitle: "أجب عن أسئلة القصة",
      emoji: "🧠",
      color: "#DB2777",
      questions: [
        {
          word: "مَا الَّذِي أَمَامَ الْبَيْت؟",
          choices: [
            { emoji: "🦊", word: "ثَعْلَب" },
            { emoji: "🚪", word: "بَاب" },
            { emoji: "🍎", word: "تُفَّاحَة" },
          ],
          correctIndex: 0,
        },
        {
          word: "مَا لَوْنُ الْبَاب؟",
          choices: [
            { emoji: "🤍", word: "أَبْيَض" },
            { emoji: "❤️", word: "أَحْمَر" },
            { emoji: "💛", word: "أَصْفَر" },
          ],
          correctIndex: 0,
        },
        {
          word: "مَاذَا عِنْدَنَا فِي الْبَيْت؟",
          choices: [
            { emoji: "🍎", word: "تُفَّاح وَتِين" },
            { emoji: "🥦", word: "خُضَار" },
            { emoji: "🥩", word: "لَحْم" },
          ],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "u2-6",
      number: 6,
      type: "trace",
      title: "أَكْتُبُ الْحُرُوف",
      subtitle: "تتبّع الحرف بأصبعك",
      emoji: "✍️",
      color: "#7C3AED",
      targets: unit2Letters.map((l) => ({ guide: l, label: l, tts: l })),
    },
  ],
};
