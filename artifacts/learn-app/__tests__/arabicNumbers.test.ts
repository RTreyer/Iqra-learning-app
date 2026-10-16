import { numberToArabicWord, toArabicDigits } from "@/lib/arabicNumbers";

test("toArabicDigits converts every digit", () => {
  expect(toArabicDigits(1234567890)).toBe("١٢٣٤٥٦٧٨٩٠");
});

test("numberToArabicWord covers 0 to 20", () => {
  expect(numberToArabicWord(0)).toBe("صِفْر");
  expect(numberToArabicWord(2)).toBe("اثْنَان");
  expect(numberToArabicWord(10)).toBe("عَشَرَة");
  expect(numberToArabicWord(12)).toBe("اثْنَا عَشَر");
  expect(numberToArabicWord(20)).toBe("عِشْرُون");
  const words = Array.from({ length: 21 }, (_, n) => numberToArabicWord(n));
  expect(new Set(words).size).toBe(21);
});

test("numberToArabicWord falls back to digits out of range", () => {
  expect(numberToArabicWord(21)).toBe("٢١");
  expect(numberToArabicWord(-1)).toBe("-١");
  expect(numberToArabicWord(2.5)).toBe("٢.٥");
});
