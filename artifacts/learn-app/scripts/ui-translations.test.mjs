import assert from "node:assert/strict";
import { test } from "node:test";
import { translateUi } from "../content/ui-translations.ts";

test("Arabic is unchanged, including whitespace and lesson text", () => {
  for (const text of ["اختَر الكتاب", "  جاري التحميل...  ", "أَكَلَ أَحْمَدُ تُفَّاحَةً", "التالي ←"]) {
    assert.equal(translateUi(text, "ar"), text);
  }
});
test("English controls, auth errors and book menus", () => {
  assert.equal(translateUi("ابدأِ التَّعَلُّم 🚀", "en"), "Start learning 🚀");
  assert.equal(translateUi("مسح", "en"), "Clear");
  assert.equal(translateUi("إعادة الدرس", "en"), "Repeat lesson");
  assert.equal(translateUi("إعادة الوحدة", "en"), "Repeat unit");
  assert.equal(translateUi("3 جملة متبقية", "en"), "3 sentences left");
  assert.equal(translateUi("2 كلمة متبقية", "en"), "2 words left");
  assert.equal(translateUi("تعذّر تسجيل الدخول. حاول مرة أخرى.", "en"), "Sign-in failed. Please try again.");
});
test("Dynamic labels keep scores and Arabic lesson titles", () => {
  assert.equal(translateUi("2 / 5 مكتمل", "en"), "2 / 5 complete");
  assert.equal(translateUi("أَحْسَنْت! 3/4 🌟 تابع", "en"), "3/4 🌟 Continue");
  assert.equal(translateUi("أَحْسَنْت! 2/3 صحيح 🌟 تابع", "en"), "2/3 correct 🌟 Continue");
  assert.equal(translateUi("النشاط التالي: أَقْرَأُ الْقِصَّة ←", "en"), "Next activity: أَقْرَأُ الْقِصَّة →");
  assert.equal(translateUi("🎉 أتممت الوحدة الثانية!", "en"), "🎉 Completed Unit 2!");
});
test("Arabic lesson content is not translated in English mode", () => {
  for (const text of ["أَكَلَ أَحْمَدُ تُفَّاحَةً", "اضغط على كل جملة لتسمعها 🔊", "ب", "ابحث عن الحرف"]) {
    assert.equal(translateUi(text, "en"), text);
  }
});
test("Content model labels translate", () => {
  assert.equal(translateUi("أَكْتُبُ الْحُرُوف", "en"), "I write the letters");
  assert.equal(translateUi("تتبّع الحرف بأصبعك", "en"), "Trace the letter with your finger");
  assert.equal(translateUi("مكتمل", "en"), "complete");
  assert.equal(translateUi("قريباً", "en"), "Coming soon");
});
test("Catalog book titles and subtitles translate", async () => {
  const { books } = await import("../content/index.ts");
  for (const book of books) {
    assert.doesNotMatch(translateUi(book.title, "en"), /[؀-ۿ]/);
    assert.doesNotMatch(translateUi(book.subtitle, "en"), /[؀-ۿ]/);
  }
});
test("Catalog unit titles and lesson screen chrome translate", async () => {
  const { books } = await import("../content/index.ts");
  for (const book of books) {
    for (const unit of book.units) assert.doesNotMatch(translateUi(unit.title, "en"), /[؀-ۿ]/);
  }
  assert.equal(translateUi("أَحْسَنْت!", "en"), "Well done!");
  assert.equal(translateUi("النشاط التالي:", "en"), "Next activity:");
  assert.equal(translateUi("🎉 أتممت الوحدة!", "en"), "🎉 Unit complete!");
  assert.equal(translateUi("العودة إلى القائمة", "en"), "Back to the list");
  assert.equal(translateUi("اختَر الكتاب", "en"), "Choose a book");
});
