export type UiLanguage = "ar" | "en";

// Interface copy only. Lesson data, instructions, quiz answers and speech
// deliberately stay Arabic, even when the interface is English.
const english: Record<string, string> = {
  "ركن الأهل": "Parents' corner",
  "قصة هدهد": "Hudhud's story",
  "ألبوم الملصقات": "Sticker album",
  "قمرية اليوم": "Today's window",
  "هذا الركن للأهل. اضغط على الزر مطوّلاً.":
    "This corner is for parents. Press and hold the button.",
  "اضغط مطوّلاً": "Press and hold",
  الصف: "Grade",
  "الصفوف ٢ إلى ٦ قريباً.": "Grades 2 to 6 are coming soon.",
  "لغة القوائم": "Menu language",
  الصوت: "Voice",
  الاهتزاز: "Vibration",
  التقدم: "Progress",
  "سيُمسح كل التقدم: النجوم والدروس والملصقات. لا يمكن التراجع.":
    "All progress will be deleted: stars, lessons and stickers. This cannot be undone.",
  "نعم، امسح التقدم": "Yes, delete progress",
  إلغاء: "Cancel",
  "مسح التقدم": "Delete progress",
  "تم مسح التقدم": "Progress deleted",
  أهلاً: "Hello",
  "اختَر الكتاب": "Choose a book",
  "اختَر صفّك": "Choose your grade",
  "الصف غير موجود": "Grade not found",
  "أنت رائع! 🌟": "You're doing great! 🌟",
  رجوع: "Back",
  العودة: "Back",
  "العودة إلى القائمة": "Back to the list",
  "إعادة الدرس": "Repeat lesson",
  "التالي ←": "Next →",
  مسح: "Clear",
  تم: "Done",
  "مرة أخرى": "Try again",
  "حاول مرة أخرى": "Try again",
  "أَحْسَنْت! 🌟 تابع": "Continue 🌟",
  "اضغط للاستماع": "Tap to listen",
  "شاهد مثالاً": "Show me how",
  مثال: "Example",
  تخطَّ: "Skip",
  "الكتاب غير موجود": "Book not found",
  "الوحدة غير موجودة": "Unit not found",
  "الدرس غير موجود": "Lesson not found",
  "الصفحة غير موجودة": "Page not found",
  "العودة إلى الرئيسية": "Back to home",
  "حدث خطأ": "Something went wrong",
  "أعد تحميل التطبيق للمتابعة.": "Please reload the app to continue.",
  "تفاصيل الخطأ": "Error details",
  "إغلاق تفاصيل الخطأ": "Close error details",
  "عرض تفاصيل الخطأ": "View error details",
  قريباً: "Coming soon",
  "اختَر ماذا تريد أن تتعلّم اليوم": "Choose what to learn today",
  "هيّا نتعلّم! 🌟": "Let's learn! 🌟",
  الرياضيات: "Math",
  العلوم: "Science",
  "اللغة العربية": "Arabic",
  "لغتي العربية": "My Arabic Language",
  "أقرأ وأتعلم": "Iqra: Read and learn",
  "الجزء الأول": "Part 1",
  "الجزء الثاني": "Part 2",
  "الصف الأول": "Grade 1",
  "الصف الثاني": "Grade 2",
  "الصف الثالث": "Grade 3",
  "الصف الرابع": "Grade 4",
  "الصف الخامس": "Grade 5",
  "الصف السادس": "Grade 6",
  "الوحدة الأولى": "Unit 1",
  "الوحدة الثانية": "Unit 2",
  "الوحدة الثالثة": "Unit 3",
  "الوحدة الرابعة": "Unit 4",
  "الوحدة الخامسة": "Unit 5",
  "الوحدة السادسة": "Unit 6",
  "الوحدة السابعة": "Unit 7",
  "الوحدة الثامنة": "Unit 8",
  تَمْهِيدِيَّة: "Introduction",
  السُّلُوك: "Behavior",
  الْمُفْرَدَات: "Vocabulary",
  الْحُرُوف: "Letters",
  "أَكْتُبُ الْحُرُوف": "I write the letters",
  "تتبّع الحرف بأصبعك": "Trace the letter with your finger",
  "جملة متبقية": "sentences left",
  "كلمة متبقية": "words left",
  مكتمل: "complete",
  "لقد أتممت هذا النشاط بنجاح": "You finished this activity",
  "أَحْسَنْت!": "Well done!",
  "النشاط التالي:": "Next activity:",
  "أتممت الوحدة!": "Unit complete!",
  "الْوَحْدَة الأُولَى": "Unit 1",
  "الْوَحْدَة الثَّانِيَة": "Unit 2",
  "الْوَحْدَة الثَّالِثَة": "Unit 3",
  "الْوَحْدَةُ الأُولَى": "Unit 1",
  "الْوَحْدَةُ الثَّانِيَةُ": "Unit 2",
  "الْوَحْدَةُ الثَّالِثَةُ": "Unit 3",
  "الْوَحْدَةُ الرَّابِعَةُ": "Unit 4",
  "الْوَحْدَةُ الْخَامِسَةُ": "Unit 5",
  // Unit card chips (theme and badge). Letter badges such as "م ب ل" are lesson content and stay Arabic.
  "أُحِبُّ مَامَا وَبَابَا": "I love Mama and Baba",
  "الْمُعَلِّمَةُ بَيَانُ، أَخِي مَرِيضٌ، دَارُ الأَيْتَامِ":
    "Teacher Bayan, My Brother Is Sick, The Orphanage",
  "بَيْتٌ مِنْ رَمْلٍ، ابْنَةٌ أَمِينَةٌ، الْبَقَرَةُ":
    "A House of Sand, An Honest Daughter, The Cow",
  "تَرْتِيبُ الصَّفِّ، رَجُلُ الْمُرُورِ، بَدْرٌ وَاللُّعْبَةُ، مَنَالُ وَالْمَزْرَعَةُ":
    "Lining Up, The Traffic Officer, Badr and the Toy, Manal and the Farm",
  "مُنِيرٌ وَالْقِرَاءَةُ، صَابِرٌ وَالْبُلْبُلُ، مِصْيَدَةُ مُفِيدٍ":
    "Munir and Reading, Sabir and the Nightingale, Mufid's Mousetrap",
  "النَّظَافَةُ، أَسْنَانُ وَسِيمٍ، جَارُ الْمَسْجِدِ":
    "Cleanliness, Waseem's Teeth, The Mosque Neighbor",
  "فِي الْقَرْيَة": "In the Village",
  "الأَعْدَادُ مِنْ ٠ إِلَى ١٠": "Numbers 0 to 10",
  أَعُدُّ: "Count",
  "الْجَمْعُ ضِمْنَ الْعَدَدِ ١٠": "Adding within 10",
  "التَّصْنِيفُ وَالأَنْمَاطُ": "Sorting and patterns",
  أُصَنِّفُ: "Sort",
  أَجْمَعُ: "Add",
  "الطَّرْحُ ضِمْنَ الْعَدَدِ ١٠": "Subtracting within 10",
  أَطْرَحُ: "Subtract",
  "الأَشْكَالُ الْهَنْدَسِيَّةُ وَالْكُسُورُ": "Shapes and fractions",
  أَشْكَالٌ: "Shapes",
  جِسْمِي: "My body",
  الْحَيَوَانَات: "Animals",
  حَيَوَانَات: "Animals",
  "النَّبَاتَات وَالْمَاء": "Plants and water",
  نَبَات: "Plants",
  مُرَاجَعَة: "Review",
  "مُرَاجَعَة الْيَوْم": "Today's review",
  تَابِعْ: "Continue",
  "لا شَيْءَ لِلْمُرَاجَعَةِ الْيَوْم": "Nothing to review today",
  "أَحْسَنْت! مُرَاجَعَة الْيَوْم مُكْتَمِلَة": "Well done! Today's review is complete",
  "يَوْم مُتَتَالٍ": "day streak",
  "تَابِعْ:": "Continue:",
  "اضغط على كل جملة لتسمعها 🔊": "Tap each sentence to hear it 🔊",
  "اضغط على كل كلمة لتسمعها 🔊": "Tap each word to hear it 🔊",
  "اضغط ✓ للسلوك الصحيح و ✗ للسلوك الخطأ": "Tap ✓ for good behavior and ✗ for bad behavior",
  // The matching columns are mirrored in Arabic, so the sides swap in English.
  "اضغط على شيء في اليمين ثم ما يناسبه في اليسار":
    "Tap an item on the left, then its match on the right",
  "ابحث عن الحرف": "Find the letter",
  "اضغط للاستماع ثم اختر": "Tap to listen, then choose",
  "سلوك صحيح": "Good behavior",
  "سلوك خطأ": "Bad behavior",
  "إجابة صحيحة": "Correct answer",
  "إجابة خطأ": "Wrong answer",
  "ارسم بإصبعك": "Draw with your finger",
};

export function translateUi(text: string, language: UiLanguage): string {
  if (language === "ar") return text;
  const value = text.trim();
  if (english[value]) return english[value];
  // Dynamic navigation labels preserve the Arabic lesson title.
  if (value.startsWith("النشاط التالي: "))
    return `Next activity: ${value.slice("النشاط التالي: ".length).replace(/\s*←$/, "")} →`;
  const completed = value.match(/^(\d+)\s*\/\s*(\d+)\s+مكتمل$/);
  if (completed) return `${completed[1]} / ${completed[2]} complete`;
  const remaining = value.match(/^(\d+)\s+(جملة متبقية|كلمة متبقية|يَوْم مُتَتَالٍ)$/);
  if (remaining) return `${remaining[1]} ${english[remaining[2]]}`;
  const question = value.match(/^سؤال (\d+) من (\d+)$/);
  if (question) return `Question ${question[1]} of ${question[2]}`;
  const scoredContinue = value.match(/^أَحْسَنْت!\s*(\d+\/\d+)\s*🌟 تابع$/);
  if (scoredContinue) return `${scoredContinue[1]} 🌟 Continue`;
  const behaviorContinue = value.match(/^أَحْسَنْت!\s*(\d+\/\d+)\s*صحيح 🌟 تابع$/);
  if (behaviorContinue) return `${behaviorContinue[1]} correct 🌟 Continue`;
  const unitComplete = value.match(/^🎉 أتممت (.+)!$/);
  if (unitComplete) return `🎉 Completed ${translateUi(unitComplete[1], language)}!`;
  // Book metadata is translated for navigation without modifying its source.
  // An Arabic comma joins two parts ("اللغة العربية، الجزء الأول"), a full stop two sentences.
  for (const [arabic, english] of [
    ["، ", ", "],
    [". ", ". "],
  ])
    if (value.includes(arabic))
      return value
        .split(arabic)
        .map((part) => translateUi(part, language))
        .join(english);
  return text;
}
