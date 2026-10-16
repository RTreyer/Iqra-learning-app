import type { Unit } from "../types";

const unit7Letters = ["ط", "ظ"];

// ── Unit 7: ط، ظ ── الطَّعَام اللَّذِيذ ────────────────────────────────────────

export const unit7: Unit = {
  id: "a7",
  number: 7,
  title: "الوحدة السابعة",
  letters: unit7Letters,
  theme: "الطَّعَام اللَّذِيذ",
  emoji: "🍽️",
  color: "#0891B2",
  badgeLabel: "ط ظ",
  lessons: [
    {
      id: "u7-1",
      number: 1,
      type: "story",
      title: "أَقْرَأُ الْقِصَّة",
      subtitle: "اضغط على كل جملة لتسمعها",
      emoji: "📖",
      color: "#0891B2",
      storyTitle: "الطَّعَام اللَّذِيذ",
      lines: [
        { text: "أُمِّي تَطْبُخُ طَعَامًا لَذِيذًا", emoji: "🍲" },
        { text: "طَمَاطِمٌ حَمْرَاء فِي الطَّبَق", emoji: "🍅" },
        { text: "ظَهَرَ الطَّعَامُ شَهِيًّا وَجَمِيلًا", emoji: "🍽️" },
        { text: "نَأْكُلُ تَحْتَ الظِّلَالِ الْوَارِفَة", emoji: "🌿" },
      ],
    },
    {
      id: "u7-2",
      number: 2,
      type: "naming",
      title: "الْمُفْرَدَات",
      subtitle: "اضغط على كل كلمة لتسمعها",
      emoji: "💬",
      color: "#0E7490",
      items: [
        { emoji: "🍅", word: "طَمَاطِم" },
        { emoji: "✈️", word: "طَائِرَة" },
        { emoji: "🦌", word: "ظَبِي" },
        { emoji: "📩", word: "ظَرْف" },
        { emoji: "👶", word: "طِفْل" },
        { emoji: "🌿", word: "ظِلّ" },
      ],
    },
    {
      id: "u7-3",
      number: 3,
      type: "letter_pick",
      title: "أَعْرِفُ الْحُرُوف",
      subtitle: "اختَر الحرف الصحيح في كل سؤال",
      emoji: "🔤",
      color: "#7C3AED",
      rounds: [
        { targetLetter: "ط", letters: ["ط", "ظ", "ت"], correctIndex: 0 },
        { targetLetter: "ظ", letters: ["ط", "ظ", "ذ"], correctIndex: 1 },
        { targetLetter: "ط", letters: ["ض", "ط", "ص"], correctIndex: 1 },
        { targetLetter: "ظ", letters: ["ظ", "ض", "ذ"], correctIndex: 0 },
        { targetLetter: "ط", letters: ["ف", "ق", "ط"], correctIndex: 2 },
      ],
    },
    {
      id: "u7-4",
      number: 4,
      type: "word_read",
      title: "أَقْرَأُ الْكَلِمَات",
      subtitle: "اسمع الكلمة واختر الصواب",
      emoji: "👁️",
      color: "#D97706",
      rounds: [
        { word: "طَمَاطِم", choices: ["طَمَاطِم", "ظَبِي", "ظَرْف"], correctIndex: 0 },
        { word: "ظَبِي", choices: ["طِفْل", "ظَبِي", "طَائِرَة"], correctIndex: 1 },
        { word: "ظَرْف", choices: ["ظَرْف", "طِفْل", "طَمَاطِم"], correctIndex: 0 },
        { word: "طِفْل", choices: ["ظِلّ", "طِفْل", "ظَبِي"], correctIndex: 1 },
        { word: "طَائِرَة", choices: ["طَمَاطِم", "ظَرْف", "طَائِرَة"], correctIndex: 2 },
      ],
    },
    {
      id: "u7-5",
      number: 5,
      type: "listen_pick",
      title: "أَفْهَمُ الْقِصَّة",
      subtitle: "أجب عن أسئلة القصة",
      emoji: "🧠",
      color: "#DB2777",
      questions: [
        {
          word: "مَنِ الَّذِي يَطْبُخ؟",
          choices: [
            { emoji: "👩", word: "أُمِّي" },
            { emoji: "👨", word: "أَبِي" },
            { emoji: "👦", word: "أَخِي" },
          ],
          correctIndex: 0,
        },
        {
          word: "مَاذَا يُوجَدُ فِي الطَّبَق؟",
          choices: [
            { emoji: "🍅", word: "طَمَاطِم" },
            { emoji: "🐟", word: "سَمَك" },
            { emoji: "🍎", word: "فَاكِهَة" },
          ],
          correctIndex: 0,
        },
        {
          word: "أَيْنَ يَأْكُلُون؟",
          choices: [
            { emoji: "🌿", word: "تَحْتَ الظِّلَال" },
            { emoji: "🏠", word: "فِي الْبَيْت" },
            { emoji: "🏪", word: "فِي السُّوق" },
          ],
          correctIndex: 0,
        },
      ],
    },
    {
      id: "u7-6",
      number: 6,
      type: "trace",
      title: "أَكْتُبُ الْحُرُوف",
      subtitle: "تتبّع الحرف بأصبعك",
      emoji: "✍️",
      color: "#7C3AED",
      targets: unit7Letters.map((l) => ({ guide: l, label: l, tts: l })),
    },
  ],
};
