export type UiLanguage = "ar" | "en";

// Interface copy only. Lesson data, instructions, quiz answers and speech
// deliberately stay Arabic, even when the interface is English.
const english: Record<string, string> = {
  أهلاً: "Hello",
  "اختَر الكتاب": "Choose a book",
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
  "أقرأ وأتعلم": "Iqra – Read and learn",
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
  "🎉 أتممت الوحدة!": "🎉 Unit complete!",
  "الْوَحْدَة الأُولَى": "Unit 1",
  "الْوَحْدَة الثَّانِيَة": "Unit 2",
  "الْوَحْدَة الثَّالِثَة": "Unit 3",
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
  if (value.includes(" — "))
    return value
      .split(" — ")
      .map((part) => translateUi(part, language))
      .join(" — ");
  return text;
}
