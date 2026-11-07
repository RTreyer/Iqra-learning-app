/**
 * Hudhud's story, told once before the first lesson (app/intro.tsx). Hudhud is the postman of
 * Yemen; a gust of wind blows the letters out of his messages, and in the market of Mocha the
 * trader cannot count his coffee sacks. The child helps: collecting letters (Arabic) or
 * counting in the market (Math). Spoken by the app's voice, fully vocalised, simple Fusha.
 * Native speaker review pending (docs/CONTENT_REVIEW.md); the lines are the first candidates
 * for recorded audio.
 */

import type { GoalKind, Recipient } from "./types";

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
    line: "هَبَّتْ عَاصِفَةٌ قَوِيَّةٌ، فَطَارَتِ الْحُرُوفُ وَحَرَكَاتُهَا مِنْ رَسَائِلِي!",
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
  math: "هَيَّا نُسَاعِدُ التَّاجِرَ فِي السُّوقِ!",
  science: "هَيَّا نَتَعَلَّمُ!",
};

/** Hudhud's lines about a unit's goal (GoalKind, lib/storyProgress.ts). */
type GoalLines = {
  /** On the unit's path, beside Hudhud. */
  path: string;
  /** Tapping the goal while it is not finished. */
  missing: string;
  /** On the finish card, when the lesson filled a place of the goal. */
  beat: string;
  /** When the unit is finished (letters: before the delivery). */
  complete: string;
};

export const GOAL_LINES: Record<GoalKind, GoalLines> = {
  writing: {
    path: "هَيَّا نَتَعَلَّمُ كِتَابَةَ الرَّسَائِلِ!",
    missing: "نَكْتُبُ سَطْرًا بَعْدَ سَطْرٍ!",
    beat: "كَتَبْنَا سَطْرًا جَدِيدًا!",
    complete: "تَعَلَّمْنَا الْكِتَابَةَ! هَيَّا نَجْمَعُ الْحُرُوفَ!",
  },
  letters: {
    path: "هَيَّا نَجْمَعُ حُرُوفَ رِسَالَتِي!",
    missing: "فِي آخِرِ الطَّرِيقِ رِسَالَتِي، نُكْمِلُهَا مَعًا!",
    beat: "رَجَعَ حَرْفٌ إِلَى رِسَالَتِي!",
    complete: "اِكْتَمَلَتِ الرِّسَالَةُ!",
  },
  vowels: {
    path: "هَيَّا نُعِيدُ إِلَى الْحُرُوفِ حَرَكَاتِهَا!",
    missing: "حُرُوفُ رِسَالَتِي بِلَا حَرَكَاتٍ، نُعِيدُهَا مَعًا!",
    beat: "رَجَعَتْ حَرَكَاتُ حَرْفٍ!",
    complete: "اِكْتَمَلَتِ الرِّسَالَةُ بِحَرَكَاتِهَا!",
  },
  sort: {
    path: "هَيَّا نُرَتِّبُ بَضَائِعَ التَّاجِرِ!",
    missing: "التَّاجِرُ يَنْتَظِرُ، نُرَتِّبُ بَضَائِعَهُ مَعًا!",
    beat: "رَتَّبْنَا سَلَّةً أُخْرَى!",
    complete: "رَتَّبْنَا كُلَّ الْبَضَائِعِ! أَحْسَنْت!",
  },
  count: {
    path: "هَيَّا نَعُدُّ أَكْيَاسَ الْبُنِّ لِلتَّاجِرِ!",
    missing: "التَّاجِرُ يَنْتَظِرُ، نَعُدُّ أَكْيَاسَهُ مَعًا!",
    beat: "عَدَدْنَا كِيسًا آخَرَ!",
    complete: "عَدَدْنَا كُلَّ الْأَكْيَاسِ! أَحْسَنْت!",
  },
  add: {
    path: "وَصَلَتْ أَكْيَاسٌ جَدِيدَةٌ، هَيَّا نَجْمَعُهَا!",
    missing: "الْجَمَلُ يَحْمِلُ أَكْيَاسًا جَدِيدَةً، نَجْمَعُهَا مَعًا!",
    beat: "وَصَلَ كِيسٌ جَدِيدٌ!",
    complete: "جَمَعْنَا كُلَّ الْأَكْيَاسِ الْجَدِيدَةِ! أَحْسَنْت!",
  },
  carry: {
    path: "هَيَّا نَحْمِلُ الْأَكْيَاسَ إِلَى السَّفِينَةِ!",
    missing: "الْأَكْيَاسُ تَنْتَظِرُ، نَحْمِلُهَا إِلَى السَّفِينَةِ!",
    beat: "حَمَلْنَا كِيسًا إِلَى السَّفِينَةِ!",
    complete: "حَمَلْنَا كُلَّ الْأَكْيَاسِ إِلَى السَّفِينَةِ! أَحْسَنْت!",
  },
  pack: {
    path: "هَيَّا نُغَلِّفُ الْبَضَائِعَ لِلسَّفَرِ!",
    missing: "نُغَلِّفُ الْبَضَائِعَ، ثُمَّ تُبْحِرُ السَّفِينَةُ!",
    beat: "غَلَّفْنَا طَرْدًا آخَرَ!",
    complete: "غَلَّفْنَا كُلَّ الْبَضَائِعِ، وَأَبْحَرَتِ السَّفِينَةُ! شُكْرًا لَكَ!",
  },
};

type StoryUnit = { recipient?: Recipient };

/** Said on the finish card of the lesson that finishes a unit: a letter is also delivered. */
export function finishLine(unit: StoryUnit, kind: GoalKind): string {
  const { complete } = GOAL_LINES[kind];
  return unit.recipient ? `${complete} سَأُوصِلُهَا ${unit.recipient.to}.` : complete;
}

/** Said when the goal at the end of a path is tapped. */
export function goalLine(unit: StoryUnit, kind: GoalKind, complete: boolean): string {
  if (!complete) return GOAL_LINES[kind].missing;
  if (unit.recipient) return `أَوْصَلْتُ رِسَالَتِي ${unit.recipient.to}. شُكْرًا لَكَ!`;
  return GOAL_LINES[kind].complete;
}

/** A won sticker is a thank-you gift from the people Hudhud and the child help. */
export const giftLine = (sticker: string) => `هَدِيَّةُ شُكْرٍ لَكَ: ${sticker}`;

/** The end of the story in a subject: every lesson done with three stars. */
export const SUBJECT_DONE: Record<string, string> = {
  arabic: "وَصَلَتْ كُلُّ رَسَائِلِي! شُكْرًا لَكَ!",
  lughati: "وَصَلَتْ كُلُّ رَسَائِلِي! شُكْرًا لَكَ!",
  math: "أَبْحَرَتِ السَّفِينَةُ، وَالتَّاجِرُ سَعِيدٌ! شُكْرًا لَكَ!",
  science: "مَا شَاءَ اللهُ! أَتْمَمْتَ كُلَّ الدُّرُوسِ",
};
