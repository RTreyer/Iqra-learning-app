import type { Unit } from "../types";

const unit6Letters = ["ص", "ض"];

// ── Unit 6: ص، ض ── أَنَا وَصِحَّتِي ──────────────────────────────────────────

export const unit6: Unit = {
  id: "a6",
  number: 6,
  title: "الوحدة السادسة",
  letters: unit6Letters,
  theme: "أَنَا وَصِحَّتِي",
  emoji: "💪",
  color: "#DC2626",
  badgeLabel: "ص ض",
  lessons: [
    {
      id: "u6-1", number: 1, type: "story",
      title: "أَقْرَأُ الْقِصَّة", subtitle: "اضغط على كل جملة لتسمعها",
      emoji: "📖", color: "#DC2626",
      storyTitle: "أَنَا وَصِحَّتِي",
      lines: [
        { text: "أَنَا أُحَافِظُ عَلَى صِحَّتِي", emoji: "💪" },
        { text: "أَغْسِلُ يَدَيَّ بِالصَّابُون دَائِمًا", emoji: "🧼" },
        { text: "صَدِيقِي يَسْبَحُ فِي الضَّوْء", emoji: "💡" },
        { text: "الضِّفْدَعُ يَقْفِزُ بِسَعَادَة", emoji: "🐸" },
      ],
    },
    {
      id: "u6-2", number: 2, type: "naming",
      title: "الْمُفْرَدَات", subtitle: "اضغط على كل كلمة لتسمعها",
      emoji: "💬", color: "#B91C1C",
      items: [
        { emoji: "🧼", word: "صَابُون" }, { emoji: "🦅", word: "صَقْر" },
        { emoji: "🐸", word: "ضِفْدَع" }, { emoji: "💡", word: "ضَوْء" },
        { emoji: "🍽️", word: "صَحْن" }, { emoji: "👤", word: "ضَيْف" },
      ],
    },
    {
      id: "u6-3", number: 3, type: "letter_pick",
      title: "أَعْرِفُ الْحُرُوف", subtitle: "اختَر الحرف الصحيح في كل سؤال",
      emoji: "🔤", color: "#7C3AED",
      rounds: [
        { targetLetter: "ص", letters: ["ص", "ض", "س"], correctIndex: 0 },
        { targetLetter: "ض", letters: ["ص", "ض", "ط"], correctIndex: 1 },
        { targetLetter: "ص", letters: ["ظ", "ص", "ض"], correctIndex: 1 },
        { targetLetter: "ض", letters: ["ض", "ذ", "ز"], correctIndex: 0 },
        { targetLetter: "ص", letters: ["ع", "ص", "غ"], correctIndex: 1 },
      ],
    },
    {
      id: "u6-4", number: 4, type: "word_read",
      title: "أَقْرَأُ الْكَلِمَات", subtitle: "اسمع الكلمة واختر الصواب",
      emoji: "👁️", color: "#D97706",
      rounds: [
        { word: "صَابُون", choices: ["صَابُون", "ضِفْدَع", "ضَوْء"], correctIndex: 0 },
        { word: "ضِفْدَع", choices: ["صَقْر", "ضِفْدَع", "صَحْن"], correctIndex: 1 },
        { word: "ضَوْء", choices: ["ضَوْء", "صَابُون", "صَقْر"], correctIndex: 0 },
        { word: "صَقْر", choices: ["ضَيْف", "صَقْر", "ضِفْدَع"], correctIndex: 1 },
        { word: "صَحْن", choices: ["صَابُون", "ضَوْء", "صَحْن"], correctIndex: 2 },
      ],
    },
    {
      id: "u6-5", number: 5, type: "listen_pick",
      title: "أَفْهَمُ الْقِصَّة", subtitle: "أجب عن أسئلة القصة",
      emoji: "🧠", color: "#DB2777",
      questions: [
        { word: "كَيْفَ يُحَافِظُ عَلَى صِحَّتِه؟", choices: [{ emoji: "🧼", word: "بِغَسْلِ الْيَدَيْن" }, { emoji: "🍔", word: "بِالأَكْلِ كَثِيرًا" }, { emoji: "😴", word: "بِالنَّوْمِ فَقَط" }], correctIndex: 0 },
        { word: "بِمَ يَغْسِلُ يَدَيْه؟", choices: [{ emoji: "🧼", word: "الصَّابُون" }, { emoji: "🏜️", word: "الرَّمْل" }, { emoji: "📄", word: "الْوَرَق" }], correctIndex: 0 },
        { word: "مَا الَّذِي يَقْفِز؟", choices: [{ emoji: "🐸", word: "الضِّفْدَع" }, { emoji: "🦅", word: "الصَّقْر" }, { emoji: "👤", word: "الضَّيْف" }], correctIndex: 0 },
      ],
    },
    {
      id: "u6-6", number: 6, type: "trace",
      title: "أَكْتُبُ الْحُرُوف", subtitle: "تتبّع الحرف بأصبعك",
      emoji: "✍️", color: "#7C3AED",
      targets: unit6Letters.map((l) => ({ guide: l, label: l, tts: l })),
    },
  ],
};
