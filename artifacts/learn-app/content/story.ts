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
