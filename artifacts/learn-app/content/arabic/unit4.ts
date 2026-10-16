import type { Unit } from "../types";

const unit4Letters = ["د", "ذ", "ر", "ز"];

// ── Unit 4: د، ذ، ر، ز ── فِي الْمَزْرَعَة ────────────────────────────────────

export const unit4: Unit = {
  id: "a4",
  number: 4,
  title: "الوحدة الرابعة",
  letters: unit4Letters,
  theme: "فِي الْمَزْرَعَة",
  emoji: "🌾",
  color: "#7C3AED",
  badgeLabel: "د ذ ر ز",
  lessons: [
    {
      id: "u4-1",
      number: 1,
      type: "story",
      title: "أَقْرَأُ الْقِصَّة",
      subtitle: "اضغط على كل جملة لتسمعها",
      emoji: "📖",
      color: "#7C3AED",
      storyTitle: "فِي الْمَزْرَعَة",
      lines: [
        { text: "زُرْنَا مَزْرَعَةً كَبِيرَة", emoji: "🌾" },
        { text: "فِيهَا دَجَاج وَأَرَانِب كَثِيرَة", emoji: "🐔" },
        { text: "ذَهَبْنَا إِلَى النَّهْرِ الصَّافِي", emoji: "🏞️" },
        { text: "رَأَيْنَا رُمَّانًا وَزَيْتُونًا عَلَى الأَشْجَار", emoji: "🍎" },
      ],
    },
    {
      id: "u4-2",
      number: 2,
      type: "naming",
      title: "الْمُفْرَدَات",
      subtitle: "اضغط على كل كلمة لتسمعها",
      emoji: "💬",
      color: "#6D28D9",
      items: [
        { emoji: "🐔", word: "دَجَاجَة" },
        { emoji: "🐻", word: "دُبّ" },
        { emoji: "🐺", word: "ذِئْب" },
        { emoji: "🌽", word: "ذَرَة" },
        { emoji: "🍎", word: "رُمَّان" },
        { emoji: "🫒", word: "زَيْتُون" },
      ],
    },
    {
      id: "u4-3",
      number: 3,
      type: "letter_pick",
      title: "أَعْرِفُ الْحُرُوف",
      subtitle: "اختَر الحرف الصحيح في كل سؤال",
      emoji: "🔤",
      color: "#7C3AED",
      rounds: [
        { targetLetter: "د", letters: ["د", "ر", "ذ"], correctIndex: 0 },
        { targetLetter: "ر", letters: ["ز", "ر", "ذ"], correctIndex: 1 },
        { targetLetter: "ذ", letters: ["ذ", "د", "ز"], correctIndex: 0 },
        { targetLetter: "ز", letters: ["ر", "ذ", "ز"], correctIndex: 2 },
        { targetLetter: "د", letters: ["ن", "د", "ب"], correctIndex: 1 },
      ],
    },
    {
      id: "u4-4",
      number: 4,
      type: "word_read",
      title: "أَقْرَأُ الْكَلِمَات",
      subtitle: "اسمع الكلمة واختر الصواب",
      emoji: "👁️",
      color: "#D97706",
      rounds: [
        { word: "دَجَاجَة", choices: ["دَجَاجَة", "ذِئْب", "رُمَّان"], correctIndex: 0 },
        { word: "ذِئْب", choices: ["زَيْتُون", "ذِئْب", "دُبّ"], correctIndex: 1 },
        { word: "رُمَّان", choices: ["رُمَّان", "ذَرَة", "زَيْتُون"], correctIndex: 0 },
        { word: "زَيْتُون", choices: ["دَجَاجَة", "زَيْتُون", "ذَرَة"], correctIndex: 1 },
        { word: "دُبّ", choices: ["رُمَّان", "ذِئْب", "دُبّ"], correctIndex: 2 },
      ],
    },
    {
      id: "u4-5",
      number: 5,
      type: "listen_pick",
      title: "أَفْهَمُ الْقِصَّة",
      subtitle: "أجب عن أسئلة القصة",
      emoji: "🧠",
      color: "#DB2777",
      questions: [
        {
          word: "مَاذَا يُوجَدُ فِي الْمَزْرَعَة؟",
          choices: [
            { emoji: "🐔", word: "دَجَاج وَأَرَانِب" },
            { emoji: "🐟", word: "أَسْمَاك" },
            { emoji: "🦁", word: "أُسُود" },
          ],
          correctIndex: 0,
        },
        {
          word: "أَيْنَ ذَهَبْنَا؟",
          choices: [
            { emoji: "🏞️", word: "النَّهْر" },
            { emoji: "🏠", word: "الْبَيْت" },
            { emoji: "🏪", word: "السُّوق" },
          ],
          correctIndex: 0,
        },
        {
          word: "مَاذَا رَأَيْنَا عَلَى الأَشْجَار؟",
          choices: [
            { emoji: "🍎", word: "رُمَّان وَزَيْتُون" },
            { emoji: "🍌", word: "مَوْز وَبُرْتُقَال" },
            { emoji: "🥦", word: "خُضَار فَقَط" },
          ],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "u4-6",
      number: 6,
      type: "trace",
      title: "أَكْتُبُ الْحُرُوف",
      subtitle: "تتبّع الحرف بأصبعك",
      emoji: "✍️",
      color: "#7C3AED",
      targets: unit4Letters.map((l) => ({ guide: l, label: l, tts: l })),
    },
  ],
};
