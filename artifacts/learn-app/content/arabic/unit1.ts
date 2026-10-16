import type { Unit } from "../types";

/**
 * الوحدة الأولى: pre-reading preparatory unit (5 lessons).
 * Each lesson maps to one activity type, mirroring the textbook pages 9 to 35.
 */
export const unit1: Unit = {
  id: "a1",
  number: 1,
  title: "الوحدة الأولى",
  theme: "تَمْهِيدِيَّة",
  emoji: "🌱",
  color: "#059669",
  badgeLabel: "تَمْهِيدِيَّة",
  lessons: [
    {
      id: "u1-1",
      number: 1,
      title: "أُسَمِّي الصُّوَر",
      subtitle: "اضغط على كل صورة لتسمع اسمها",
      emoji: "🖼️",
      color: "#2563EB",
      type: "naming",
      items: [
        { emoji: "📚", word: "كِتَاب" },
        { emoji: "✏️", word: "قَلَم" },
        { emoji: "🎒", word: "حَقِيبَة" },
        { emoji: "🏫", word: "مَدْرَسَة" },
        { emoji: "👩‍🏫", word: "مُعَلِّمَة" },
        { emoji: "👦", word: "طَالِب" },
        { emoji: "🪑", word: "كُرْسِي" },
        { emoji: "🌸", word: "زَهْرَة" },
      ],
    },
    {
      id: "u1-2",
      number: 2,
      title: "أَسْتَمِعُ وَأُسَمِّي",
      subtitle: "اسمع الكلمة واختر الصورة الصحيحة",
      emoji: "👂",
      color: "#059669",
      type: "listen_pick",
      questions: [
        {
          word: "قِطَّة",
          choices: [
            { emoji: "🐱", word: "قِطَّة" },
            { emoji: "🐕", word: "كَلْب" },
            { emoji: "🐟", word: "سَمَكَة" },
          ],
          correctIndex: 0,
        },
        {
          word: "سَمَكَة",
          choices: [
            { emoji: "🐱", word: "قِطَّة" },
            { emoji: "🐟", word: "سَمَكَة" },
            { emoji: "🐦", word: "طَيْر" },
          ],
          correctIndex: 1,
        },
        {
          word: "تُفَّاحَة",
          choices: [
            { emoji: "🍊", word: "بُرْتُقَال" },
            { emoji: "🍌", word: "مَوْز" },
            { emoji: "🍎", word: "تُفَّاحَة" },
          ],
          correctIndex: 2,
        },
        {
          word: "شَمْس",
          choices: [
            { emoji: "☀️", word: "شَمْس" },
            { emoji: "🌙", word: "قَمَر" },
            { emoji: "⭐", word: "نَجْمَة" },
          ],
          correctIndex: 0,
        },
        {
          word: "بَيْت",
          choices: [
            { emoji: "🏫", word: "مَدْرَسَة" },
            { emoji: "🏠", word: "بَيْت" },
            { emoji: "🌳", word: "شَجَرَة" },
          ],
          correctIndex: 1,
        },
      ],
    },
    {
      id: "u1-3",
      number: 3,
      title: "السُّلُوكُ الصَّحِيح",
      subtitle: "اضغط ✓ للصحيح و ✗ للخطأ",
      emoji: "⭐",
      color: "#D97706",
      type: "behavior",
      behaviors: [
        { emoji: "📚", description: "يَقْرَأُ الطَّالِبُ كِتَابَه", isCorrect: true },
        { emoji: "🗑️", description: "يَرْمِي الطَّالِبُ الْقُمَامَةَ فِي الشَّارِع", isCorrect: false },
        { emoji: "🤝", description: "تُسَاعِدُ الطَّالِبَةُ أُمَّهَا", isCorrect: true },
        {
          emoji: "🏫",
          description: "يُحَافِظُ الطَّالِبُ عَلَى نَظَافَةِ الْمَدْرَسَة",
          isCorrect: true,
        },
        {
          emoji: "😤",
          description: "يَأْخُذُ الطَّالِبُ قَلَمَ زَمِيلِه بِدُونِ إِذْن",
          isCorrect: false,
        },
      ],
    },
    {
      id: "u1-4",
      number: 4,
      title: "أَرْبِطُ بَيْنَ الأَشْيَاء",
      subtitle: "اضغط على شيء ثم ما يناسبه",
      emoji: "🔗",
      color: "#7C3AED",
      type: "matching",
      pairs: [
        { left: { emoji: "✏️", word: "قَلَم" }, right: { emoji: "📄", word: "وَرَقَة" } },
        { left: { emoji: "🥤", word: "كُوب" }, right: { emoji: "💧", word: "مَاء" } },
        { left: { emoji: "☀️", word: "شَمْس" }, right: { emoji: "🌅", word: "نَهَار" } },
        { left: { emoji: "📚", word: "كِتَاب" }, right: { emoji: "🎒", word: "حَقِيبَة" } },
      ],
    },
    {
      id: "u1-5",
      number: 5,
      title: "أَرْسُمُ خُطُوطَاً",
      subtitle: "اتبع كل خط بإصبعك",
      emoji: "✏️",
      color: "#DB2777",
      type: "trace",
      targets: [
        { guide: "ـــ", label: "خَط أُفُقِي", tts: "ارسم خطاً من اليمين إلى اليسار", emoji: "➡️" },
        { guide: "|", label: "خَط عَمُودِي", tts: "ارسم خطاً من الأعلى إلى الأسفل", emoji: "⬇️" },
        { guide: "/", label: "خَط مَائِل", tts: "ارسم خطاً مائلاً", emoji: "↗️" },
        { guide: "◯", label: "دَائِرَة", tts: "ارسم دائرة كاملة", emoji: "⭕" },
        { guide: "〰", label: "خَط مُنْكَسِر", tts: "ارسم خطاً منكسراً مثل الموجة", emoji: "〰️" },
      ],
    },
  ],
};
