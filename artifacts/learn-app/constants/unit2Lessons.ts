/**
 * الوحدة الثانية — Letter ب unit (6 lessons).
 * Theme: بَيْتُنَا (Our House)
 * Textbook: أقرأ وأتعلم — الجزء الأول
 */

export type StoryLine = {
  text: string;
  emoji: string;
};

export type NamingItem2 = { emoji: string; word: string };

export type LetterPickRound = {
  letters: string[];
  correctIndex: number;
};

export type WordReadRound = {
  word: string;
  choices: string[];
  correctIndex: number;
};

export type ListenPickQuestion2 = {
  word: string;
  choices: { emoji: string; word: string }[];
  correctIndex: number;
};

export type Unit2Lesson =
  | {
      id: string;
      number: number;
      title: string;
      subtitle: string;
      emoji: string;
      color: string;
      type: "story";
      storyTitle: string;
      lines: StoryLine[];
    }
  | {
      id: string;
      number: number;
      title: string;
      subtitle: string;
      emoji: string;
      color: string;
      type: "naming";
      items: NamingItem2[];
    }
  | {
      id: string;
      number: number;
      title: string;
      subtitle: string;
      emoji: string;
      color: string;
      type: "letter_pick";
      targetLetter: string;
      targetWord: string;
      rounds: LetterPickRound[];
    }
  | {
      id: string;
      number: number;
      title: string;
      subtitle: string;
      emoji: string;
      color: string;
      type: "word_read";
      rounds: WordReadRound[];
    }
  | {
      id: string;
      number: number;
      title: string;
      subtitle: string;
      emoji: string;
      color: string;
      type: "listen_pick";
      questions: ListenPickQuestion2[];
    };

export const unit2Lessons: Unit2Lesson[] = [
  {
    id: "u2-1",
    number: 1,
    title: "أَقْرَأُ الْقِصَّة",
    subtitle: "اضغط على كل جملة لتسمعها",
    emoji: "📖",
    color: "#2563EB",
    type: "story",
    storyTitle: "بَيْتُنَا",
    lines: [
      { text: "هَذَا بَيْتُنَا الْجَمِيل", emoji: "🏠" },
      { text: "بَابُ الْبَيْتِ لَوْنُهُ أَبْيَض", emoji: "🚪" },
      { text: "فِي الْبَيْتِ بُسْتَان صَغِير", emoji: "🌳" },
      { text: "أَنَا وَأَخِي نَلْعَبُ فِي الْبُسْتَان", emoji: "👦" },
    ],
  },
  {
    id: "u2-2",
    number: 2,
    title: "الْمُفْرَدَات",
    subtitle: "اضغط على كل كلمة لتسمعها",
    emoji: "💬",
    color: "#059669",
    type: "naming",
    items: [
      { emoji: "🏠", word: "بَيْت" },
      { emoji: "🚪", word: "بَاب" },
      { emoji: "🌿", word: "بُسْتَان" },
      { emoji: "👧", word: "بِنْت" },
      { emoji: "🦆", word: "بَطَّة" },
      { emoji: "🥚", word: "بَيْضَة" },
    ],
  },
  {
    id: "u2-3",
    number: 3,
    title: "أَعْرِفُ الْحَرْف",
    subtitle: "اختَر الحرف ب في كل سؤال",
    emoji: "🔤",
    color: "#7C3AED",
    type: "letter_pick",
    targetLetter: "ب",
    targetWord: "بَاب",
    rounds: [
      { letters: ["ب", "ت", "ن"], correctIndex: 0 },
      { letters: ["ث", "ب", "س"], correctIndex: 1 },
      { letters: ["ج", "د", "ب"], correctIndex: 2 },
      { letters: ["ب", "ر", "ز"], correctIndex: 0 },
      { letters: ["ش", "ب", "ط"], correctIndex: 1 },
    ],
  },
  {
    id: "u2-4",
    number: 4,
    title: "أَقْرَأُ الْكَلِمَات",
    subtitle: "اسمع الكلمة واختر الصواب",
    emoji: "👁️",
    color: "#D97706",
    type: "word_read",
    rounds: [
      { word: "بَيْت", choices: ["بَيْت", "بِنْت", "بَاب"], correctIndex: 0 },
      { word: "بَاب", choices: ["بَيْت", "بَاب", "بَطَّة"], correctIndex: 1 },
      { word: "بِنْت", choices: ["بُسْتَان", "بِنْت", "بَيْضَة"], correctIndex: 1 },
      { word: "بُسْتَان", choices: ["بُسْتَان", "بَيْت", "بَاب"], correctIndex: 0 },
      { word: "بَطَّة", choices: ["بِنْت", "بَاب", "بَطَّة"], correctIndex: 2 },
    ],
  },
  {
    id: "u2-5",
    number: 5,
    title: "أَفْهَمُ الْقِصَّة",
    subtitle: "أجب عن أسئلة القصة",
    emoji: "🧠",
    color: "#DB2777",
    type: "listen_pick",
    questions: [
      {
        word: "أَيْنَ يَلْعَبُ الأَطْفَال؟",
        choices: [
          { emoji: "🌿", word: "الْبُسْتَان" },
          { emoji: "🏫", word: "الْمَدْرَسَة" },
          { emoji: "🛣️", word: "الشَّارِع" },
        ],
        correctIndex: 0,
      },
      {
        word: "مَا لَوْنُ الْبَاب؟",
        choices: [
          { emoji: "❤️", word: "أَحْمَر" },
          { emoji: "🤍", word: "أَبْيَض" },
          { emoji: "💛", word: "أَصْفَر" },
        ],
        correctIndex: 1,
      },
      {
        word: "مَاذَا يُوجَدُ فِي الْبَيْت؟",
        choices: [
          { emoji: "🏊", word: "حَمَّام" },
          { emoji: "🏪", word: "دُكَّان" },
          { emoji: "🌳", word: "بُسْتَان" },
        ],
        correctIndex: 2,
      },
    ],
  },
];
