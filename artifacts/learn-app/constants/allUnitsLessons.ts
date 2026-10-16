/**
 * الوحدات 2–8 — Letter-phonics units for Grade 1 Arabic Part 1.
 * Each unit: story → vocabulary → letter recognition → word reading → comprehension.
 * Textbook: أقرأ وأتعلم — الجزء الأول
 */

// ── Shared types ──────────────────────────────────────────────────────────────

export type StoryLine = { text: string; emoji: string };
export type NamingItem = { emoji: string; word: string };
export type LetterPickRound = {
  targetLetter: string;   // letter to find this round
  letters: string[];      // 3 options shown
  correctIndex: number;
};
export type WordReadRound = {
  word: string;
  choices: string[];
  correctIndex: number;
};
export type ComprehensionQuestion = {
  word: string;
  choices: { emoji: string; word: string }[];
  correctIndex: number;
};

export type UnitLesson =
  | { id: string; number: number; title: string; subtitle: string; emoji: string; color: string; type: "story"; storyTitle: string; lines: StoryLine[] }
  | { id: string; number: number; title: string; subtitle: string; emoji: string; color: string; type: "naming"; items: NamingItem[] }
  | { id: string; number: number; title: string; subtitle: string; emoji: string; color: string; type: "letter_pick"; rounds: LetterPickRound[] }
  | { id: string; number: number; title: string; subtitle: string; emoji: string; color: string; type: "word_read"; rounds: WordReadRound[] }
  | { id: string; number: number; title: string; subtitle: string; emoji: string; color: string; type: "listen_pick"; questions: ComprehensionQuestion[] };

export type UnitData = {
  id: string;         // "2", "3", …
  unitNumber: number;
  title: string;
  letters: string[];
  theme: string;
  emoji: string;
  color: string;
  badgeLabel: string;
  lessons: UnitLesson[];
};

// ── Unit 2: ب، ت، ث ── بَيْتُنَا ──────────────────────────────────────────────

const unit2: UnitData = {
  id: "2",
  unitNumber: 2,
  title: "الوحدة الثانية",
  letters: ["ب", "ت", "ث"],
  theme: "بَيْتُنَا",
  emoji: "🏠",
  color: "#2563EB",
  badgeLabel: "ب ت ث",
  lessons: [
    {
      id: "u2-1", number: 1, type: "story",
      title: "أَقْرَأُ الْقِصَّة", subtitle: "اضغط على كل جملة لتسمعها",
      emoji: "📖", color: "#2563EB",
      storyTitle: "بَيْتُنَا",
      lines: [
        { text: "هَذَا بَيْتُنَا الْجَمِيل", emoji: "🏠" },
        { text: "بَابُنَا أَبْيَض وَنَظِيف", emoji: "🚪" },
        { text: "عِنْدَنَا تُفَّاح وَتِين لَذِيذ", emoji: "🍎" },
        { text: "أَمَامَ الْبَيْتِ ثَعْلَبٌ صَغِير", emoji: "🦊" },
      ],
    },
    {
      id: "u2-2", number: 2, type: "naming",
      title: "الْمُفْرَدَات", subtitle: "اضغط على كل كلمة لتسمعها",
      emoji: "💬", color: "#1D4ED8",
      items: [
        { emoji: "🏠", word: "بَيْت" }, { emoji: "🚪", word: "بَاب" },
        { emoji: "🍎", word: "تُفَّاحَة" }, { emoji: "🫐", word: "تِين" },
        { emoji: "🦊", word: "ثَعْلَب" }, { emoji: "🐂", word: "ثَوْر" },
      ],
    },
    {
      id: "u2-3", number: 3, type: "letter_pick",
      title: "أَعْرِفُ الْحُرُوف", subtitle: "اختَر الحرف الصحيح في كل سؤال",
      emoji: "🔤", color: "#7C3AED",
      rounds: [
        { targetLetter: "ب", letters: ["ب", "ت", "ن"], correctIndex: 0 },
        { targetLetter: "ت", letters: ["ث", "ت", "ب"], correctIndex: 1 },
        { targetLetter: "ث", letters: ["ث", "س", "ج"], correctIndex: 0 },
        { targetLetter: "ب", letters: ["د", "ر", "ب"], correctIndex: 2 },
        { targetLetter: "ت", letters: ["ت", "خ", "ز"], correctIndex: 0 },
      ],
    },
    {
      id: "u2-4", number: 4, type: "word_read",
      title: "أَقْرَأُ الْكَلِمَات", subtitle: "اسمع الكلمة واختر الصواب",
      emoji: "👁️", color: "#D97706",
      rounds: [
        { word: "بَيْت", choices: ["بَيْت", "تِين", "ثَعْلَب"], correctIndex: 0 },
        { word: "تِين", choices: ["بَاب", "تِين", "ثَعْلَب"], correctIndex: 1 },
        { word: "ثَعْلَب", choices: ["ثَعْلَب", "بِنْت", "تُفَّاحَة"], correctIndex: 0 },
        { word: "بَاب", choices: ["تِين", "بَاب", "ثَوْر"], correctIndex: 1 },
        { word: "تُفَّاحَة", choices: ["بُسْتَان", "ثَوْر", "تُفَّاحَة"], correctIndex: 2 },
      ],
    },
    {
      id: "u2-5", number: 5, type: "listen_pick",
      title: "أَفْهَمُ الْقِصَّة", subtitle: "أجب عن أسئلة القصة",
      emoji: "🧠", color: "#DB2777",
      questions: [
        { word: "مَا الَّذِي أَمَامَ الْبَيْت؟", choices: [{ emoji: "🦊", word: "ثَعْلَب" }, { emoji: "🚪", word: "بَاب" }, { emoji: "🍎", word: "تُفَّاحَة" }], correctIndex: 0 },
        { word: "مَا لَوْنُ الْبَاب؟", choices: [{ emoji: "🤍", word: "أَبْيَض" }, { emoji: "❤️", word: "أَحْمَر" }, { emoji: "💛", word: "أَصْفَر" }], correctIndex: 0 },
        { word: "مَاذَا عِنْدَنَا فِي الْبَيْت؟", choices: [{ emoji: "🍎", word: "تُفَّاح وَتِين" }, { emoji: "🥦", word: "خُضَار" }, { emoji: "🥩", word: "لَحْم" }], correctIndex: 0 },
      ],
    },
  ],
};

// ── Unit 3: ج، ح، خ ── فِي الْحَدِيقَة ────────────────────────────────────────

const unit3: UnitData = {
  id: "3",
  unitNumber: 3,
  title: "الوحدة الثالثة",
  letters: ["ج", "ح", "خ"],
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
  ],
};

// ── Unit 4: د، ذ، ر، ز ── فِي الْمَزْرَعَة ────────────────────────────────────

const unit4: UnitData = {
  id: "4",
  unitNumber: 4,
  title: "الوحدة الرابعة",
  letters: ["د", "ذ", "ر", "ز"],
  theme: "فِي الْمَزْرَعَة",
  emoji: "🌾",
  color: "#7C3AED",
  badgeLabel: "د ذ ر ز",
  lessons: [
    {
      id: "u4-1", number: 1, type: "story",
      title: "أَقْرَأُ الْقِصَّة", subtitle: "اضغط على كل جملة لتسمعها",
      emoji: "📖", color: "#7C3AED",
      storyTitle: "فِي الْمَزْرَعَة",
      lines: [
        { text: "زُرْنَا مَزْرَعَةً كَبِيرَة", emoji: "🌾" },
        { text: "فِيهَا دَجَاج وَأَرَانِب كَثِيرَة", emoji: "🐔" },
        { text: "ذَهَبْنَا إِلَى النَّهْرِ الصَّافِي", emoji: "🏞️" },
        { text: "رَأَيْنَا رُمَّانًا وَزَيْتُونًا عَلَى الأَشْجَار", emoji: "🍎" },
      ],
    },
    {
      id: "u4-2", number: 2, type: "naming",
      title: "الْمُفْرَدَات", subtitle: "اضغط على كل كلمة لتسمعها",
      emoji: "💬", color: "#6D28D9",
      items: [
        { emoji: "🐔", word: "دَجَاجَة" }, { emoji: "🐻", word: "دُبّ" },
        { emoji: "🐺", word: "ذِئْب" }, { emoji: "🌽", word: "ذَرَة" },
        { emoji: "🍎", word: "رُمَّان" }, { emoji: "🫒", word: "زَيْتُون" },
      ],
    },
    {
      id: "u4-3", number: 3, type: "letter_pick",
      title: "أَعْرِفُ الْحُرُوف", subtitle: "اختَر الحرف الصحيح في كل سؤال",
      emoji: "🔤", color: "#7C3AED",
      rounds: [
        { targetLetter: "د", letters: ["د", "ر", "ذ"], correctIndex: 0 },
        { targetLetter: "ر", letters: ["ز", "ر", "ذ"], correctIndex: 1 },
        { targetLetter: "ذ", letters: ["ذ", "د", "ز"], correctIndex: 0 },
        { targetLetter: "ز", letters: ["ر", "ذ", "ز"], correctIndex: 2 },
        { targetLetter: "د", letters: ["ن", "د", "ب"], correctIndex: 1 },
      ],
    },
    {
      id: "u4-4", number: 4, type: "word_read",
      title: "أَقْرَأُ الْكَلِمَات", subtitle: "اسمع الكلمة واختر الصواب",
      emoji: "👁️", color: "#D97706",
      rounds: [
        { word: "دَجَاجَة", choices: ["دَجَاجَة", "ذِئْب", "رُمَّان"], correctIndex: 0 },
        { word: "ذِئْب", choices: ["زَيْتُون", "ذِئْب", "دُبّ"], correctIndex: 1 },
        { word: "رُمَّان", choices: ["رُمَّان", "ذَرَة", "زَيْتُون"], correctIndex: 0 },
        { word: "زَيْتُون", choices: ["دَجَاجَة", "زَيْتُون", "ذَرَة"], correctIndex: 1 },
        { word: "دُبّ", choices: ["رُمَّان", "ذِئْب", "دُبّ"], correctIndex: 2 },
      ],
    },
    {
      id: "u4-5", number: 5, type: "listen_pick",
      title: "أَفْهَمُ الْقِصَّة", subtitle: "أجب عن أسئلة القصة",
      emoji: "🧠", color: "#DB2777",
      questions: [
        { word: "مَاذَا يُوجَدُ فِي الْمَزْرَعَة؟", choices: [{ emoji: "🐔", word: "دَجَاج وَأَرَانِب" }, { emoji: "🐟", word: "أَسْمَاك" }, { emoji: "🦁", word: "أُسُود" }], correctIndex: 0 },
        { word: "أَيْنَ ذَهَبْنَا؟", choices: [{ emoji: "🏞️", word: "النَّهْر" }, { emoji: "🏠", word: "الْبَيْت" }, { emoji: "🏪", word: "السُّوق" }], correctIndex: 0 },
        { word: "مَاذَا رَأَيْنَا عَلَى الأَشْجَار؟", choices: [{ emoji: "🍎", word: "رُمَّان وَزَيْتُون" }, { emoji: "🍌", word: "مَوْز وَبُرْتُقَال" }, { emoji: "🥦", word: "خُضَار فَقَط" }], correctIndex: 0 },
      ],
    },
  ],
};

// ── Unit 5: س، ش ── فِي السُّوق ───────────────────────────────────────────────

const unit5: UnitData = {
  id: "5",
  unitNumber: 5,
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

// ── Unit 6: ص، ض ── أَنَا وَصِحَّتِي ──────────────────────────────────────────

const unit6: UnitData = {
  id: "6",
  unitNumber: 6,
  title: "الوحدة السادسة",
  letters: ["ص", "ض"],
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
  ],
};

// ── Unit 7: ط، ظ ── الطَّعَام اللَّذِيذ ────────────────────────────────────────

const unit7: UnitData = {
  id: "7",
  unitNumber: 7,
  title: "الوحدة السابعة",
  letters: ["ط", "ظ"],
  theme: "الطَّعَام اللَّذِيذ",
  emoji: "🍽️",
  color: "#0891B2",
  badgeLabel: "ط ظ",
  lessons: [
    {
      id: "u7-1", number: 1, type: "story",
      title: "أَقْرَأُ الْقِصَّة", subtitle: "اضغط على كل جملة لتسمعها",
      emoji: "📖", color: "#0891B2",
      storyTitle: "الطَّعَام اللَّذِيذ",
      lines: [
        { text: "أُمِّي تَطْبُخُ طَعَامًا لَذِيذًا", emoji: "🍲" },
        { text: "طَمَاطِمٌ حَمْرَاء فِي الطَّبَق", emoji: "🍅" },
        { text: "ظَهَرَ الطَّعَامُ شَهِيًّا وَجَمِيلًا", emoji: "🍽️" },
        { text: "نَأْكُلُ تَحْتَ الظِّلَالِ الْوَارِفَة", emoji: "🌿" },
      ],
    },
    {
      id: "u7-2", number: 2, type: "naming",
      title: "الْمُفْرَدَات", subtitle: "اضغط على كل كلمة لتسمعها",
      emoji: "💬", color: "#0E7490",
      items: [
        { emoji: "🍅", word: "طَمَاطِم" }, { emoji: "✈️", word: "طَائِرَة" },
        { emoji: "🦌", word: "ظَبِي" }, { emoji: "📩", word: "ظَرْف" },
        { emoji: "👶", word: "طِفْل" }, { emoji: "🌿", word: "ظِلّ" },
      ],
    },
    {
      id: "u7-3", number: 3, type: "letter_pick",
      title: "أَعْرِفُ الْحُرُوف", subtitle: "اختَر الحرف الصحيح في كل سؤال",
      emoji: "🔤", color: "#7C3AED",
      rounds: [
        { targetLetter: "ط", letters: ["ط", "ظ", "ت"], correctIndex: 0 },
        { targetLetter: "ظ", letters: ["ط", "ظ", "ذ"], correctIndex: 1 },
        { targetLetter: "ط", letters: ["ض", "ط", "ص"], correctIndex: 1 },
        { targetLetter: "ظ", letters: ["ظ", "ض", "ذ"], correctIndex: 0 },
        { targetLetter: "ط", letters: ["ف", "ق", "ط"], correctIndex: 2 },
      ],
    },
    {
      id: "u7-4", number: 4, type: "word_read",
      title: "أَقْرَأُ الْكَلِمَات", subtitle: "اسمع الكلمة واختر الصواب",
      emoji: "👁️", color: "#D97706",
      rounds: [
        { word: "طَمَاطِم", choices: ["طَمَاطِم", "ظَبِي", "ظَرْف"], correctIndex: 0 },
        { word: "ظَبِي", choices: ["طِفْل", "ظَبِي", "طَائِرَة"], correctIndex: 1 },
        { word: "ظَرْف", choices: ["ظَرْف", "طِفْل", "طَمَاطِم"], correctIndex: 0 },
        { word: "طِفْل", choices: ["ظِلّ", "طِفْل", "ظَبِي"], correctIndex: 1 },
        { word: "طَائِرَة", choices: ["طَمَاطِم", "ظَرْف", "طَائِرَة"], correctIndex: 2 },
      ],
    },
    {
      id: "u7-5", number: 5, type: "listen_pick",
      title: "أَفْهَمُ الْقِصَّة", subtitle: "أجب عن أسئلة القصة",
      emoji: "🧠", color: "#DB2777",
      questions: [
        { word: "مَنِ الَّذِي يَطْبُخ؟", choices: [{ emoji: "👩", word: "أُمِّي" }, { emoji: "👨", word: "أَبِي" }, { emoji: "👦", word: "أَخِي" }], correctIndex: 0 },
        { word: "مَاذَا يُوجَدُ فِي الطَّبَق؟", choices: [{ emoji: "🍅", word: "طَمَاطِم" }, { emoji: "🐟", word: "سَمَك" }, { emoji: "🍎", word: "فَاكِهَة" }], correctIndex: 0 },
        { word: "أَيْنَ يَأْكُلُون؟", choices: [{ emoji: "🌿", word: "تَحْتَ الظِّلَال" }, { emoji: "🏠", word: "فِي الْبَيْت" }, { emoji: "🏪", word: "فِي السُّوق" }], correctIndex: 0 },
      ],
    },
  ],
};

// ── Unit 8: ع، غ، ف، ق ── فِي الْقَرْيَة ─────────────────────────────────────

const unit8: UnitData = {
  id: "8",
  unitNumber: 8,
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

// ── Export ─────────────────────────────────────────────────────────────────────

export const allUnitsLessons: UnitData[] = [unit2, unit3, unit4, unit5, unit6, unit7, unit8];

export function getUnitById(id: string): UnitData | undefined {
  return allUnitsLessons.find((u) => u.id === id);
}

export function getLessonById(unitId: string, lessonId: string): UnitLesson | undefined {
  return getUnitById(unitId)?.lessons.find((l) => l.id === lessonId);
}
