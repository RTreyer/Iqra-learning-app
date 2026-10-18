import type {
  ArtId,
  Lesson,
  LetterPickRound,
  StoryLine,
  TraceTarget,
  Unit,
  WordReadRound,
} from "../types";

// ── Unit 2: م ب ل ن ر د ت ── from أَقْرَأُ وَأَتَعَلَّمُ, Part 1, Unit 2 (pp. 36 to 59) ────
// Source notes: docs/content/textbooks/arabic-part1/unit-02.md.
// Each textbook lesson (one letter, one story) becomes four app lessons:
// story, syllables with fatha and long alif, words, and writing the letter forms.
// Story sentences complete the book's picture words (rebus); a teacher still has to confirm them.

const COLOR = "#2563EB";
const unit2Letters = ["م", "ب", "ل", "ن", "ر", "د", "ت"];

type LetterLesson = {
  letter: string;
  /** The letter with fatha, spoken when the child writes it. */
  sound: string;
  storyTitle: string;
  scene?: ArtId;
  lines: StoryLine[];
  syllables: LetterPickRound[];
  words: WordReadRound[];
  forms: string[];
};

/** Four lessons for one textbook lesson, numbered from `first`. */
function letterLessons(first: number, l: LetterLesson): Lesson[] {
  const section = `${l.letter} · ${l.storyTitle}`;
  const id = (n: number) => `u2-${first + n}`;
  const forms: TraceTarget[] = l.forms.map((form) => ({ guide: form, label: form, tts: l.sound }));
  return [
    {
      id: id(0),
      number: first,
      section,
      type: "story",
      title: "أَقْرَأُ الْقِصَّة",
      subtitle: l.storyTitle,
      emoji: "📖",
      color: COLOR,
      storyTitle: l.storyTitle,
      scene: l.scene,
      lines: l.lines,
    },
    {
      id: id(1),
      number: first + 1,
      section,
      type: "letter_pick",
      title: "أَقْرَأُ الْمَقَاطِع",
      subtitle: `${l.sound} - ${l.syllables[1].targetLetter}`,
      emoji: "🔤",
      color: "#7C3AED",
      rounds: l.syllables,
    },
    {
      id: id(2),
      number: first + 2,
      section,
      type: "word_read",
      title: "أَقْرَأُ الْكَلِمَات",
      subtitle: "اسمع الكلمة واختر الصواب",
      emoji: "👁️",
      color: "#D97706",
      rounds: l.words,
    },
    {
      id: id(3),
      number: first + 3,
      section,
      type: "trace",
      title: "أَكْتُبُ الْحَرْف",
      subtitle: l.forms.join("  ،  "),
      emoji: "✍️",
      color: "#7C3AED",
      targets: forms,
    },
  ];
}

/** Round where `target` is among `letters`; the correct index is found, not typed. */
const pick = (target: string, letters: string[]): LetterPickRound => ({
  targetLetter: target,
  letters,
  correctIndex: letters.indexOf(target),
});

const read = (word: string, choices: string[]): WordReadRound => ({
  word,
  choices,
  correctIndex: choices.indexOf(word),
});

const mim = letterLessons(1, {
  letter: "م",
  sound: "مَ",
  storyTitle: "أُحِبُّ مَامَا",
  scene: "mother",
  lines: [
    { text: "مَامَا تُوصِلُنِي إِلَى الْمَدْرَسَةِ", emoji: "🏫", art: "school" },
    { text: "أَنَا أَقْرَأُ", emoji: "📖", art: "boy" },
    { text: "أَنَا أُحِبُّ مَامَا", emoji: "🧕", art: "mother" },
    { text: "أَنَا أَكْتُبُ", emoji: "✏️" },
  ],
  syllables: [
    pick("مَ", ["مَ", "بَ", "نَ"]),
    pick("مَا", ["مَا", "مَ", "نَا"]),
    pick("مَ", ["لَ", "مَ", "رَ"]),
    pick("مَا", ["تَا", "دَا", "مَا"]),
  ],
  words: [
    read("مَامَا", ["مَامَا", "أَنَا", "أُحِبُّ"]),
    read("أَنَا", ["أُحِبُّ", "أَنَا", "مَامَا"]),
    read("أُحِبُّ", ["مَامَا", "أَنَا", "أُحِبُّ"]),
  ],
  forms: ["مـ", "ـمـ", "ـم", "م"],
});

const ba = letterLessons(5, {
  letter: "ب",
  sound: "بَ",
  storyTitle: "أُحِبُّ بَابَا",
  scene: "father",
  lines: [
    { text: "بَابَا يُعَلِّمُنِي", emoji: "👨", art: "father" },
    { text: "أَنَا أَقْرَأُ", emoji: "📖", art: "girl" },
    { text: "أَنَا أُحِبُّ بَابَا", emoji: "❤️", art: "father" },
    { text: "نَحْنُ نَقْرَأُ", emoji: "📚" },
  ],
  syllables: [
    pick("بَ", ["بَ", "مَ", "تَ"]),
    pick("بَا", ["مَا", "بَا", "بَ"]),
    pick("بَ", ["نَ", "بَ", "مَ"]),
    pick("بَا", ["بَا", "تَا", "مَا"]),
  ],
  words: [
    read("بَابَا", ["مَامَا", "بَابَا", "نَحْنُ"]),
    read("نَحْنُ", ["نَحْنُ", "أَقْرَأُ", "بَابَا"]),
    read("أَقْرَأُ", ["أَنَا", "نَحْنُ", "أَقْرَأُ"]),
    read("مَامَا", ["بَابَا", "مَامَا", "أُحِبُّ"]),
  ],
  forms: ["بـ", "ـبـ", "ـب", "ب"],
});

const lam = letterLessons(9, {
  letter: "ل",
  sound: "لَ",
  storyTitle: "اللَّبَنُ",
  scene: "mother",
  lines: [
    { text: "مَامَا تُعْطِينِي مَالًا", emoji: "💵", art: "mother" },
    { text: "أَنَا أَشْتَرِي اللَّبَنَ", emoji: "🥛", art: "boy" },
    { text: "أَنَا أَشْرَبُ اللَّبَنَ، بَابَا يَشْرَبُ اللَّبَنَ", emoji: "🥛" },
    { text: "مَامَا تَشْرَبُ اللَّبَنَ", emoji: "🥛", art: "mother" },
    { text: "نَحْنُ نَقُولُ: الْحَمْدُ لِلّهِ", emoji: "🤲" },
  ],
  syllables: [
    pick("لَ", ["لَ", "مَ", "بَ"]),
    pick("لَا", ["لَا", "لَ", "بَا"]),
    pick("لَ", ["بَ", "لَ", "مَ"]),
    pick("لَا", ["مَا", "بَا", "لَا"]),
  ],
  words: [
    read("مَالَا", ["مَالَا", "مَامَا", "بَابَا"]),
    read("اللَّبَنُ", ["نَحْنُ", "اللَّبَنُ", "أَنَا"]),
    read("الْحَمْدُ لِلّهِ", ["أُحِبُّ", "أَقْرَأُ", "الْحَمْدُ لِلّهِ"]),
  ],
  forms: ["لـ", "ـلـ", "ـل", "ل"],
});

const nun = letterLessons(13, {
  letter: "ن",
  sound: "نَ",
  storyTitle: "النَّمْلُ",
  scene: "girl",
  lines: [
    { text: "مَنَالُ تُشَاهِدُ النَّمْلَ، النَّمْلُ يَمْشِي", emoji: "🐜", art: "girl" },
    { text: "ثَلَاثُ نَمَلَاتٍ سَقَطَتْ فِي الْمَاءِ", emoji: "💧" },
    { text: "النَّمْلُ يَتَعَاوَنُ، النَّمْلُ يُنْقِذُ النَّمَلَاتِ", emoji: "🐜" },
    { text: "مَنَالُ تُعْجَبُ بِالنَّمْلِ", emoji: "😊", art: "girl" },
  ],
  syllables: [
    pick("نَ", ["نَ", "بَ", "تَ"]),
    pick("نَا", ["بَا", "نَا", "نَ"]),
    pick("نَ", ["لَ", "مَ", "نَ"]),
    pick("نَا", ["نَا", "لَا", "مَا"]),
  ],
  words: [
    read("مَنَالُ", ["مَنَالُ", "مَالَا", "مَامَا"]),
    read("نَمَلَاتُ", ["النَّمْلُ", "نَمَلَاتُ", "نَحْنُ"]),
    read("ثَلَاثُ", ["أَنَا", "ثَلَاثُ", "اللَّبَنُ"]),
    read("النَّمْلُ", ["اللَّبَنُ", "مَنَالُ", "النَّمْلُ"]),
  ],
  forms: ["نـ", "ـنـ", "ـن", "ن"],
});

const ra = letterLessons(17, {
  letter: "ر",
  sound: "رَ",
  storyTitle: "رَبَابُ",
  scene: "door",
  lines: [
    { text: "رَبَابُ تَطْرُقُ الْبَابَ", emoji: "🚪", art: "door" },
    { text: "أُخْتِي مَرَامُ تَسْتَقْبِلُ رَبَابَ", emoji: "🤝", art: "girl" },
    {
      text: "مَامَا تُقَدِّمُ لَنَا الْمَوْزَ، نَحْنُ نَأْكُلُ الْمَوْزَ",
      emoji: "🍌",
      art: "mother",
    },
    {
      text: "أُخْتِي مَرَامُ تَرْمِي الْقِشْرَ، رَبَابُ تَتَزَحْلَقُ بِقِشْرِ الْمَوْزِ",
      emoji: "🍌",
    },
    {
      text: "أُخْتِي تَعْتَذِرُ لِرَبَابَ، أُخْتِي تَرْمِي الْقِشْرَ فِي السَّلَّةِ",
      emoji: "🗑️",
      art: "girl",
    },
  ],
  syllables: [
    pick("رَ", ["رَ", "دَ", "بَ"]),
    pick("رَا", ["رَا", "دَا", "رَ"]),
    pick("رَ", ["نَ", "رَ", "لَ"]),
    pick("رَا", ["مَا", "بَا", "رَا"]),
  ],
  words: [
    read("رَبَابُ", ["رَبَابُ", "مَرَامُ", "بَابَا"]),
    read("مَرَامُ", ["مَنَالُ", "مَرَامُ", "رَبَابُ"]),
    read("أُخْتِي", ["أُخْتِي", "أُحِبُّ", "أَنَا"]),
    read("الْمَوْزُ", ["النَّمْلُ", "اللَّبَنُ", "الْمَوْزُ"]),
  ],
  forms: ["ر", "ـر"],
});

const dal = letterLessons(21, {
  letter: "د",
  sound: "دَ",
  storyTitle: "دَارُ خَالِي",
  scene: "house",
  lines: [
    { text: "نَزُورُ دَارَ خَالِي، أَخِي يَنْظُرُ إِلَى الْكُرَةِ", emoji: "🏠", art: "house" },
    { text: "أَخِي يَتَسَلَّقُ الشَّجَرَةَ", emoji: "🌳", art: "boy" },
    {
      text: "أَخِي لَا يَسْتَطِيعُ النُّزُولَ، أُخْتِي دَلَالُ تُنَادِي",
      emoji: "📣",
      art: "girl",
    },
    {
      text: "أُخْتِي أَعْطَتْ خَالِي السُّلَّمَ، خَالِي يُنْزِلُ أَخِي",
      emoji: "🪜",
      art: "father",
    },
    { text: "أَخِي يَعْتَذِرُ لَنَا", emoji: "🙏", art: "boy" },
  ],
  syllables: [
    pick("دَ", ["دَ", "رَ", "لَ"]),
    pick("دَا", ["رَا", "دَا", "دَ"]),
    pick("دَ", ["مَ", "بَ", "دَ"]),
    pick("دَا", ["دَا", "نَا", "لَا"]),
  ],
  words: [
    read("دَارُ", ["دَارُ", "رَبَابُ", "بَابَا"]),
    read("دَلَالُ", ["مَنَالُ", "دَلَالُ", "مَرَامُ"]),
    read("خَالِي", ["أُخْتِي", "خَالِي", "أَخِي"]),
    read("أَخِي", ["أَخِي", "أُخْتِي", "أَنَا"]),
    read("أَعْطَتْ", ["أُحِبُّ", "أَقْرَأُ", "أَعْطَتْ"]),
  ],
  forms: ["د", "ـد"],
});

const ta = letterLessons(25, {
  letter: "ت",
  sound: "تَ",
  storyTitle: "التَّمْرُ",
  scene: "dates",
  lines: [
    { text: "أَخِي مَتَابُ يَخْرُجُ، مَتَابُ يَرَى جَارَنَا", emoji: "👦", art: "boy" },
    {
      text: "مَتَابُ يَعُودُ إِلَى الْبَيْتِ، مَامَا تُقَدِّمُ التَّمْرَ",
      emoji: "🏠",
      art: "dates",
    },
    { text: "بَابَا يَأْكُلُ ثَلَاثَ تَمَرَاتٍ", emoji: "🌴", art: "palm" },
    { text: "قَالَ مَتَابُ: بَابَا بَابَا، جَارُنَا جَائِعٌ", emoji: "👦", art: "boy" },
    {
      text: "بَابَا يَأْخُذُ التَّمْرَ، بَابَا يُعْطِي الْجَارَ تَمْرًا",
      emoji: "🤲",
      art: "father",
    },
    { text: "نَحْنُ نَذْهَبُ إِلَى الْمَسْجِدِ", emoji: "🕌", art: "mosque" },
  ],
  syllables: [
    pick("تَ", ["تَ", "بَ", "نَ"]),
    pick("تَا", ["بَا", "تَا", "تَ"]),
    pick("تَ", ["دَ", "تَ", "رَ"]),
    pick("تَا", ["لَا", "رَا", "تَا"]),
  ],
  words: [
    read("مَتَابُ", ["مَتَابُ", "مَرَامُ", "رَبَابُ"]),
    read("تَمَرَاتُ", ["نَمَلَاتُ", "تَمَرَاتُ", "ثَلَاثُ"]),
    read("التَّمْرُ", ["اللَّبَنُ", "الْمَوْزُ", "التَّمْرُ"]),
    read("قَالَ", ["قَالَ", "خَالِي", "دَارُ"]),
    read("تَمْرًا", ["مَالَا", "تَمْرًا", "أَعْطَتْ"]),
  ],
  forms: ["تـ", "ـتـ", "ـت", "ت", "ـة", "ة"],
});

/** تَدْرِيبَات, pp. 58 to 59: syllables, first sound, names. */
const EXERCISES = "تَدْرِيبَات";
const exercises: Lesson[] = [
  {
    id: "u2-29",
    number: 29,
    section: EXERCISES,
    type: "letter_pick",
    title: "أَقْرَأُ الْمَقَاطِع",
    subtitle: "م ب ل ن ر د ت",
    emoji: "🐝",
    color: "#7C3AED",
    rounds: [
      pick("رَ", ["رَ", "دَ", "تَ"]),
      pick("لَا", ["نَا", "لَا", "بَا"]),
      pick("دَا", ["مَا", "رَا", "دَا"]),
      pick("نَ", ["نَ", "تَ", "بَ"]),
      pick("تَا", ["بَا", "تَا", "نَا"]),
      pick("مَا", ["لَا", "دَا", "مَا"]),
    ],
  },
  {
    id: "u2-30",
    number: 30,
    section: EXERCISES,
    type: "listen_pick",
    title: "أَقْرَأُ الصَّوْتَ الأَوَّلَ",
    subtitle: "اسمع الكلمة واختر الصوت الأول",
    emoji: "👂",
    color: "#DB2777",
    questions: [
      {
        word: "بَدْرٌ",
        choices: [
          { emoji: "", word: "بَـ" },
          { emoji: "", word: "دَا" },
          { emoji: "", word: "تَـ" },
        ],
        correctIndex: 0,
      },
      {
        word: "رَامِي",
        choices: [
          { emoji: "", word: "دَا" },
          { emoji: "", word: "رَا" },
          { emoji: "", word: "لَا" },
        ],
        correctIndex: 1,
      },
      {
        word: "تَمْرٌ",
        choices: [
          { emoji: "", word: "بَـ" },
          { emoji: "", word: "نَا" },
          { emoji: "", word: "تَـ" },
        ],
        correctIndex: 2,
      },
      {
        word: "لَامَ",
        choices: [
          { emoji: "", word: "لَا" },
          { emoji: "", word: "رَا" },
          { emoji: "", word: "بَـ" },
        ],
        correctIndex: 0,
      },
      {
        word: "دَارُ",
        choices: [
          { emoji: "", word: "نَا" },
          { emoji: "", word: "دَا" },
          { emoji: "", word: "تَـ" },
        ],
        correctIndex: 1,
      },
      {
        word: "نَارُ",
        choices: [
          { emoji: "", word: "رَا" },
          { emoji: "", word: "لَا" },
          { emoji: "", word: "نَا" },
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: "u2-31",
    number: 31,
    section: EXERCISES,
    type: "word_read",
    title: "أَقْرَأُ الْأَسْمَاء",
    subtitle: "اسمع الكلمة واختر الصواب",
    emoji: "👁️",
    color: "#D97706",
    rounds: [
      read("دَلَالُ", ["دَلَالُ", "مَنَالُ", "دَارُ"]),
      read("مَتَابُ", ["رَبَابُ", "مَتَابُ", "مَرَامُ"]),
      read("مَنَالُ", ["مَالَا", "دَلَالُ", "مَنَالُ"]),
      read("تَمَرَاتُ", ["تَمَرَاتُ", "نَمَلَاتُ", "مَتَابُ"]),
      read("رَبَابُ", ["بَابَا", "رَبَابُ", "مَرَامُ"]),
    ],
  },
];

export const unit2: Unit = {
  id: "a2",
  number: 2,
  title: "الوحدة الثانية",
  letters: unit2Letters,
  theme: "أُحِبُّ مَامَا وَبَابَا",
  emoji: "🏠",
  color: COLOR,
  badgeLabel: "م ب ل ن ر د ت",
  lessons: [...mim, ...ba, ...lam, ...nun, ...ra, ...dal, ...ta, ...exercises],
};
