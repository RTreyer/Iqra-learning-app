/**
 * A simple Latin reading of Arabic letters and syllables for the English explanation mode
 * (lib/explain.ts): "مَ" → "ma", "مَا" → "mā", "بُو" → "bū". A bare letter is named instead:
 * "م" → "the letter mīm". Not a scholarly transliteration, just enough for an adult to follow.
 */

const CONSONANTS: Record<string, string> = {
  ب: "b",
  ت: "t",
  ث: "th",
  ج: "j",
  ح: "ḥ",
  خ: "kh",
  د: "d",
  ذ: "dh",
  ر: "r",
  ز: "z",
  س: "s",
  ش: "sh",
  ص: "ṣ",
  ض: "ḍ",
  ط: "ṭ",
  ظ: "ẓ",
  ع: "ʿ",
  غ: "gh",
  ف: "f",
  ق: "q",
  ك: "k",
  ل: "l",
  م: "m",
  ن: "n",
  ه: "h",
  و: "w",
  ي: "y",
  ء: "ʾ",
  أ: "ʾ",
  إ: "ʾ",
  ؤ: "ʾ",
  ئ: "ʾ",
  ة: "h",
};

const NAMES: Record<string, string> = {
  ا: "alif",
  أ: "alif with hamza",
  إ: "alif with hamza",
  آ: "alif madda",
  ب: "bāʾ",
  ت: "tāʾ",
  ث: "thāʾ",
  ج: "jīm",
  ح: "ḥāʾ",
  خ: "khāʾ",
  د: "dāl",
  ذ: "dhāl",
  ر: "rāʾ",
  ز: "zāy",
  س: "sīn",
  ش: "shīn",
  ص: "ṣād",
  ض: "ḍād",
  ط: "ṭāʾ",
  ظ: "ẓāʾ",
  ع: "ʿayn",
  غ: "ghayn",
  ف: "fāʾ",
  ق: "qāf",
  ك: "kāf",
  ل: "lām",
  م: "mīm",
  ن: "nūn",
  ه: "hāʾ",
  و: "wāw",
  ي: "yāʾ",
  ء: "hamza",
  ة: "tāʾ marbūṭa",
  ى: "alif maqṣūra",
};

const FATHA = "َ";
const DAMMA = "ُ";
const KASRA = "ِ";
const SUKUN = "ْ";
const SHADDA = "ّ";
const TANWEEN: Record<string, string> = { "ً": "an", "ٌ": "un", "ٍ": "in" };
const TATWEEL = "ـ";

/** The Latin reading of a letter, syllable or short word. */
export function transliterate(arabic: string): string {
  let out = "";
  const chars = [...arabic.replace(new RegExp(TATWEEL, "g"), "")];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const last = out.slice(-1);
    if (c === FATHA) out += "a";
    else if (c === DAMMA) out += "u";
    else if (c === KASRA) out += "i";
    else if (c === SUKUN) continue;
    else if (c === SHADDA) out += out.replace(/[aiuāīū]+$/, "").slice(-1);
    else if (TANWEEN[c]) out += TANWEEN[c];
    else if (c === "ا" || c === "ى") out = last === "a" ? out.slice(0, -1) + "ā" : out + "ā";
    else if (c === "آ") out += "ʾā";
    else if (c === "و" && last === "u" && !isHaraka(chars[i + 1])) out = out.slice(0, -1) + "ū";
    else if (c === "ي" && last === "i" && !isHaraka(chars[i + 1])) out = out.slice(0, -1) + "ī";
    else if (CONSONANTS[c]) out += CONSONANTS[c];
    else if (c === " ") out += " ";
  }
  return out;
}

function isHaraka(c: string | undefined): boolean {
  return c !== undefined && /[ً-ْ]/.test(c);
}

/** "the letter mīm" for a bare letter (also its joined forms مـ ـمـ ـم), else its reading. */
export function readingOf(arabic: string): string {
  const bare = arabic.replace(new RegExp(TATWEEL, "g"), "").trim();
  if ([...bare].length === 1 && NAMES[bare]) return `the letter ${NAMES[bare]}`;
  return transliterate(arabic);
}
