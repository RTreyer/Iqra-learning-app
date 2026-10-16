const EASTERN_ARABIC = "٠١٢٣٤٥٦٧٨٩";

/** Formats a number with Eastern Arabic digits, as used in the Yemeni textbooks. */
export function toArabicDigits(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => EASTERN_ARABIC[Number(d)]);
}

const WORDS = [
  "صِفْر",
  "وَاحِد",
  "اثْنَان",
  "ثَلاثَة",
  "أَرْبَعَة",
  "خَمْسَة",
  "سِتَّة",
  "سَبْعَة",
  "ثَمَانِيَة",
  "تِسْعَة",
  "عَشَرَة",
  "أَحَدَ عَشَر",
  "اثْنَا عَشَر",
  "ثَلاثَةَ عَشَر",
  "أَرْبَعَةَ عَشَر",
  "خَمْسَةَ عَشَر",
  "سِتَّةَ عَشَر",
  "سَبْعَةَ عَشَر",
  "ثَمَانِيَةَ عَشَر",
  "تِسْعَةَ عَشَر",
  "عِشْرُون",
] as const;

/** Spoken Arabic word for 0 to 20 as read in the first grade textbook; other values fall back to digits. */
export function numberToArabicWord(n: number): string {
  return Number.isInteger(n) && n >= 0 && n < WORDS.length ? WORDS[n] : toArabicDigits(n);
}
