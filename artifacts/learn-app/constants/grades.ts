/**
 * Grade and book catalog for أَقْرَأُ وَأَتَعَلَّمُ.
 *
 * Grades 1–6 with their available books and modules.
 * Grade 1 has 5 categories; others show "coming soon".
 */

export type BookModule = "reading" | "math" | "writing" | "islamic" | "unit1" | "unit2" | "unit3" | "unit4" | "unit5" | "unit6" | "unit7" | "unit8";

export type BookData = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  available: boolean;
  modules: BookModule[];
};

export type GradeData = {
  id: string;
  label: string;
  emoji: string;
  color: string;
  lightColor: string;
  books: BookData[];
};

export const grades: GradeData[] = [
  {
    id: "1",
    label: "الصف الأول",
    emoji: "🌱",
    color: "#059669",
    lightColor: "#D1FAE5",
    books: [
      {
        id: "arabic-1-part1",
        title: "أقرأ وأتعلم",
        subtitle: "اللغة العربية — الجزء الأول",
        emoji: "📖",
        color: "#2563EB",
        available: true,
        modules: ["unit1", "unit2", "unit3", "unit4", "unit5", "unit6", "unit7", "unit8"] as BookModule[],
      },
      {
        id: "arabic-1-part2",
        title: "أقرأ وأتعلم",
        subtitle: "اللغة العربية — الجزء الثاني",
        emoji: "📗",
        color: "#059669",
        available: true,
        modules: ["reading"],
      },
      {
        id: "islamic-1",
        title: "التربية الإسلامية",
        subtitle: "التربية الإسلامية — الجزء الأول",
        emoji: "🕌",
        color: "#B45309",
        available: false,
        modules: [],
      },
      {
        id: "math-1-part1",
        title: "الرياضيات",
        subtitle: "الرياضيات — الجزء الأول",
        emoji: "🔢",
        color: "#7C3AED",
        available: true,
        modules: ["math"],
      },
      {
        id: "math-1-part2",
        title: "الرياضيات",
        subtitle: "الرياضيات — الجزء الثاني",
        emoji: "🧮",
        color: "#DB2777",
        available: false,
        modules: [],
      },
      {
        id: "science-1-part1",
        title: "العلوم",
        subtitle: "العلوم — الجزء الأول",
        emoji: "🔬",
        color: "#0D9488",
        available: false,
        modules: [],
      },
      {
        id: "science-1-part2",
        title: "العلوم",
        subtitle: "العلوم — الجزء الثاني",
        emoji: "🧪",
        color: "#0891B2",
        available: false,
        modules: [],
      },
      {
        id: "reading-1-part1",
        title: "القراءة",
        subtitle: "القراءة — الجزء الأول",
        emoji: "📚",
        color: "#1D4ED8",
        available: false,
        modules: [],
      },
      {
        id: "reading-1-part2",
        title: "القراءة",
        subtitle: "القراءة — الجزء الثاني",
        emoji: "📘",
        color: "#0369A1",
        available: false,
        modules: [],
      },
      {
        id: "quran-1",
        title: "القرآن الكريم وعلومه",
        subtitle: "القرآن الكريم وعلومه",
        emoji: "🌙",
        color: "#065F46",
        available: false,
        modules: [],
      },
      {
        id: "quran-islamic-1-part1",
        title: "القرآن والتربية الإسلامية",
        subtitle: "القرآن الكريم وعلومه والتربية الإسلامية — الجزء الأول",
        emoji: "🤲",
        color: "#92400E",
        available: false,
        modules: [],
      },
      {
        id: "quran-islamic-1-part2",
        title: "القرآن والتربية الإسلامية",
        subtitle: "القرآن الكريم وعلومه والتربية الإسلامية — الجزء الثاني",
        emoji: "🕌",
        color: "#7C2D12",
        available: false,
        modules: [],
      },
      {
        id: "arabic-language-1-part1",
        title: "لغتي العربية",
        subtitle: "لغتي العربية — الجزء الأول",
        emoji: "📝",
        color: "#EA580C",
        available: false,
        modules: [],
      },
    ],
  },
  {
    id: "2",
    label: "الصف الثاني",
    emoji: "🌊",
    color: "#2563EB",
    lightColor: "#DBEAFE",
    books: [
      {
        id: "arabic-2",
        title: "لُغَتِي الجَمِيلَة",
        subtitle: "اللغة العربية",
        emoji: "📚",
        color: "#2563EB",
        available: false,
        modules: [],
      },
    ],
  },
  {
    id: "3",
    label: "الصف الثالث",
    emoji: "🌸",
    color: "#DB2777",
    lightColor: "#FCE7F3",
    books: [
      {
        id: "arabic-3",
        title: "لُغَتِي الجَمِيلَة",
        subtitle: "اللغة العربية",
        emoji: "📚",
        color: "#DB2777",
        available: false,
        modules: [],
      },
    ],
  },
  {
    id: "4",
    label: "الصف الرابع",
    emoji: "🌟",
    color: "#D97706",
    lightColor: "#FEF3C7",
    books: [
      {
        id: "arabic-4",
        title: "لُغَتِي الجَمِيلَة",
        subtitle: "اللغة العربية",
        emoji: "📚",
        color: "#D97706",
        available: false,
        modules: [],
      },
    ],
  },
  {
    id: "5",
    label: "الصف الخامس",
    emoji: "🦋",
    color: "#7C3AED",
    lightColor: "#EDE9FE",
    books: [
      {
        id: "arabic-5",
        title: "لُغَتِي الجَمِيلَة",
        subtitle: "اللغة العربية",
        emoji: "📚",
        color: "#7C3AED",
        available: false,
        modules: [],
      },
    ],
  },
  {
    id: "6",
    label: "الصف السادس",
    emoji: "🔭",
    color: "#EA580C",
    lightColor: "#FFEDD5",
    books: [
      {
        id: "arabic-6",
        title: "لُغَتِي الجَمِيلَة",
        subtitle: "اللغة العربية",
        emoji: "📚",
        color: "#EA580C",
        available: false,
        modules: [],
      },
    ],
  },
];
