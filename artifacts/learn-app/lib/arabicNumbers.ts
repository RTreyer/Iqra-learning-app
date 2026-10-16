const EASTERN_ARABIC = "٠١٢٣٤٥٦٧٨٩";

/** Formats a number with Eastern Arabic digits, as used in the Yemeni textbooks. */
export function toArabicDigits(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => EASTERN_ARABIC[Number(d)]);
}
