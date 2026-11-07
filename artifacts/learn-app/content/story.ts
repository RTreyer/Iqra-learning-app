/**
 * Hudhud's story, told once before the first lesson (app/intro.tsx). Hudhud is the postman of
 * Yemen; a gust of wind blows the letters out of his messages, and in the market of Mocha the
 * trader cannot count his coffee sacks. The child helps: collecting letters (Arabic) or
 * counting in the market (Math). Spoken by the app's voice, fully vocalised, simple Fusha.
 * Native speaker review pending (docs/CONTENT_REVIEW.md); the lines are the first candidates
 * for recorded audio.
 */

export type StorySceneId = "postman" | "wind" | "market" | "waiting" | "choose";

export type StoryScene = {
  id: StorySceneId;
  line: string;
  /** The picture plays this long at least before the story moves on by itself (ms). */
  minMs?: number;
};

export const INTRO_STORY: readonly StoryScene[] = [
  {
    id: "postman",
    line: "أَنَا هُدْهُدٌ، سَاعِي الْبَرِيدِ فِي الْيَمَنِ. أَحْمِلُ الرَّسَائِلَ إِلَى كُلِّ الْبُيُوتِ.",
  },
  // The storm tears out the three letters one by one: let it finish (components/world/StoryScenes).
  {
    id: "wind",
    line: "هَبَّتْ عَاصِفَةٌ قَوِيَّةٌ، فَطَارَتِ الْحُرُوفُ مِنْ رَسَائِلِي!",
    minMs: 5600,
  },
  {
    id: "market",
    line: "وَفِي سُوقِ الْمُخَا، التَّاجِرُ لَا يَعْرِفُ كَمْ كِيسًا مِنَ الْبُنِّ عِنْدَهُ.",
  },
  {
    id: "waiting",
    line: "النَّاسُ يَنْتَظِرُونَ، وَالسَّفِينَةُ تَنْتَظِرُ. أَحْتَاجُ مُسَاعَدَتَكَ!",
  },
  {
    id: "choose",
    line: "هَلْ تُسَاعِدُنِي؟ نَجْمَعُ الْحُرُوفَ، أَوْ نَعُدُّ فِي السُّوقِ. اِخْتَرْ!",
  },
];

/** What Hudhud says when the child picks or switches a subject, by book subject. */
export const SUBJECT_LINES: Record<string, string> = {
  arabic: "هَيَّا نَجْمَعُ الْحُرُوفَ!",
  lughati: "هَيَّا نَجْمَعُ الْحُرُوفَ!",
  math: "هَيَّا إِلَى السُّوقِ نَعُدُّ!",
  science: "هَيَّا نَتَعَلَّمُ!",
};

/**
 * Hudhud's letter at the end of every unit's path: the storm blew its letters away, each
 * lesson done brings some back, and with the whole unit done the letter is complete.
 */
export const LETTER_LINES = {
  missing: "فِي آخِرِ الطَّرِيقِ رِسَالَتِي، نُكْمِلُهَا مَعًا!",
  complete: "اِكْتَمَلَتِ الرِّسَالَةُ! أَحْسَنْت!",
};

/** At the end of a maths unit: the trader's coffee sacks, counted, and the ship that can sail. */
export const MARKET_LINES = {
  missing: "التَّاجِرُ يَنْتَظِرُ، نَعُدُّ أَكْيَاسَهُ مَعًا!",
  complete: "عَدَدْنَا كُلَّ الْأَكْيَاسِ، وَأَبْحَرَتِ السَّفِينَةُ! أَحْسَنْت!",
};

/** What a lesson brings back to the story, said on its finish card. */
export const STORY_BEATS = {
  letterBack: "رَجَعَ حَرْفٌ إِلَى رِسَالَتِي!",
  sackCounted: "عَدَدْنَا كِيسًا آخَرَ!",
};

/** The letters (or numbers) a unit's goal holds: its own letters, else by subject. */
export function storySymbols(unit: { letters?: string[] }, subject: string): string[] {
  if (unit.letters?.length) return unit.letters;
  return subject === "math" ? ["١", "٢", "٣", "٤", "٥"] : ["أ", "ب", "ت", "ث", "ج"];
}

/** Hudhud's line on a unit's path, in the story: collecting letters, or counting in the market. */
export function unitStoryLine(unit: { letters?: string[] }, subject: string): string {
  if (subject === "math") return "هَيَّا نَعُدُّ أَكْيَاسَ الْبُنِّ لِلتَّاجِرِ!";
  // The letters themselves stand above the path; the line stays short.
  if (unit.letters?.length) return "هَيَّا نَجْمَعُ حُرُوفَ رِسَالَتِي!";
  return "هَيَّا نَبْدَأُ رِحْلَتَنَا!";
}
