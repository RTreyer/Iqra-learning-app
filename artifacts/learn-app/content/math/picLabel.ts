import type { MathColor, MathPic, ShapeId } from "../types.ts";

/** Fill colour of each named math colour. */
export const MATH_COLORS: Record<MathColor, string> = {
  red: "#DC2626",
  blue: "#2563EB",
  green: "#16A34A",
  yellow: "#EAB308",
  orange: "#EA580C",
  pink: "#DB2777",
};

const SHAPES: Record<ShapeId, { word: string; feminine: boolean }> = {
  circle: { word: "دَائِرَةٌ", feminine: true },
  square: { word: "مُرَبَّعٌ", feminine: false },
  triangle: { word: "مُثَلَّثٌ", feminine: false },
  rectangle: { word: "مُسْتَطِيلٌ", feminine: false },
};

const COLOR_WORDS: Record<MathColor, [string, string]> = {
  red: ["أَحْمَرُ", "حَمْرَاءُ"],
  blue: ["أَزْرَقُ", "زَرْقَاءُ"],
  green: ["أَخْضَرُ", "خَضْرَاءُ"],
  yellow: ["أَصْفَرُ", "صَفْرَاءُ"],
  orange: ["بُرْتُقَالِيٌّ", "بُرْتُقَالِيَّةٌ"],
  pink: ["وَرْدِيٌّ", "وَرْدِيَّةٌ"],
};

const SIZE_WORDS = { big: ["كَبِيرٌ", "كَبِيرَةٌ"], small: ["صَغِيرٌ", "صَغِيرَةٌ"] } as const;
const SHADED = { half: "النِّصْفُ مُلَوَّنٌ", quarter: "الرُّبْعُ مُلَوَّنٌ" } as const;
const CROSSED = ["مَشْطُوبٌ", "مَشْطُوبَةٌ"] as const;

/** Spoken and accessibility label of one picture, e.g. "مُثَلَّثٌ أَحْمَرُ كَبِيرٌ". */
export function picLabel(pic: MathPic): string {
  if ("emoji" in pic) {
    const parts: string[] = [pic.emoji];
    if (pic.size) parts.push(SIZE_WORDS[pic.size][0]);
    if (pic.crossed) parts.push(CROSSED[0]);
    return parts.join(" ");
  }
  const { word, feminine } = SHAPES[pic.shape];
  const g = feminine ? 1 : 0;
  const parts: string[] = [word, COLOR_WORDS[pic.color][g]];
  if (pic.size) parts.push(SIZE_WORDS[pic.size][g]);
  if (pic.crossed) parts.push(CROSSED[g]);
  let label = parts.join(" ");
  if (pic.shaded) label += `، ${SHADED[pic.shaded]}`;
  return label;
}

export function groupLabel(pics: MathPic[]): string {
  return pics.map(picLabel).join(" ");
}
