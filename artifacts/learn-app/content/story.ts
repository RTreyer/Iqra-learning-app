/**
 * Hudhud's story (app/intro.tsx), told by Hudhud himself, in the spirit of a quiet journey.
 *
 * Hudhud lives on a roof in Sana'a. Every morning a girl, Rasha, put out a clay bowl of water
 * for the birds, though she did not know them: "you are thirsty". One day the bowl was empty
 * and she was gone. Under the bowl she had tucked a note, and left a sidr seed. Hudhud
 * cannot read. Two threads, one per subject:
 * - Arabic: he follows Rasha's trail through the stories of the textbook (one station per
 *   unit) and learns the letters; the note under the bowl, «اِسْقِ الطُّيُورَ» signed «رَشَا»,
 *   becomes readable letter by letter (its letters come in units 2, 3, 6, 7 and 8);
 * - maths: water is scarce; who can count can share. Each unit is a station with the seed, and
 *   the sidr tree grows with the maths path.
 * The end: the tree stands in a courtyard, a little girl waters it with him; Rasha is gone,
 * her kindness stayed. Spoken by the app's voice, fully vocalised, simple Fusha. Native
 * speaker review pending (docs/CONTENT_REVIEW.md).
 */

import type { GoalKind } from "./types";

export type StorySceneId =
  | "roof"
  | "girl"
  | "why"
  | "gone"
  | "inscription"
  | "choose"
  | "trail"
  | "bowl"
  | "seed"
  | "share"
  | "tree"
  | "newgirl"
  | "home"
  | "station";

export type StoryScene = {
  id: StorySceneId;
  line: string;
  /** The picture plays this long at least before the story moves on by itself (ms). */
  minMs?: number;
  /** A station scene: the unit whose place it shows (STATIONS). */
  unit?: string;
};

/** Chapter 1: the girl, the bowl, the message Hudhud cannot read. Ends in the choice. */
export const INTRO_STORY: readonly StoryScene[] = [
  { id: "roof", line: "أَنَا هُدْهُدٌ. أَسْكُنُ عَلَى سَطْحٍ فِي صَنْعَاءَ.", minMs: 3600 },
  {
    id: "girl",
    line: "كُلَّ صَبَاحٍ، كَانَتْ بِنْتٌ تَضَعُ مَاءً لِلطُّيُورِ فِي صَحْنٍ.",
    minMs: 3200,
  },
  { id: "why", line: "قُلْتُ لَهَا: أَنْتِ لَا تَعْرِفِينَنَا! قَالَتْ: لَكِنَّكُمْ عِطَاشٌ." },
  { id: "gone", line: "وَفِي يَوْمٍ، كَانَ الصَّحْنُ فَارِغًا، وَالْبِنْتُ ذَهَبَتْ.", minMs: 3600 },
  {
    id: "inscription",
    line: "تَحْتَ الصَّحْنِ وَرَقَةٌ مِنْهَا، وَبِذْرَةٌ. لَكِنِّي لَا أَعْرِفُ الْقِرَاءَةَ!",
  },
  {
    id: "choose",
    line: "هَلْ تُسَاعِدُنِي؟ نَقْرَأُ رِسَالَتَهَا، أَوْ نَزْرَعُ بِذْرَتَهَا. اِخْتَرْ!",
  },
];

/** The story's other parts: the two threads, told the first time, and the end. */
export type ChapterId = "arabic" | "math" | "end";

export const CHAPTERS: Record<ChapterId, readonly StoryScene[]> = {
  arabic: [
    {
      id: "trail",
      line: "سَأَتْبَعُ طَرِيقَهَا، وَفِي الطَّرِيقِ أَتَعَلَّمُ الْحُرُوفَ.",
      minMs: 3600,
    },
    { id: "bowl", line: "كُلُّ حَرْفٍ نَتَعَلَّمُهُ، يُضِيءُ فِي الْوَرَقَةِ!", minMs: 3600 },
  ],
  math: [
    { id: "seed", line: "الْبِذْرَةُ تَحْتَاجُ مَاءً، وَالْمَاءُ قَلِيلٌ.", minMs: 3200 },
    { id: "share", line: "مَنْ يَعُدُّ، يَعْرِفُ كَيْفَ يَقْسِمُ الْمَاءَ. هَيَّا نَعُدُّ!", minMs: 3600 },
  ],
  end: [
    { id: "tree", line: "كَبِرَتْ شَجَرَةُ السِّدْرِ، وَجَاءَتِ الطُّيُورُ إِلَيْهَا.", minMs: 3600 },
    { id: "newgirl", line: "وَجَاءَتْ بِنْتٌ صَغِيرَةٌ، وَسَقَتِ الشَّجَرَةَ مَعِي.", minMs: 3600 },
    {
      id: "home",
      line: "رَشَا ذَهَبَتْ، لَكِنَّ لُطْفَهَا بَقِيَ. اِسْقِ الطُّيُورَ، يَا صَدِيقِي!",
      minMs: 4000,
    },
  ],
};

/** The thread a subject belongs to. */
export function chapterFor(subject: string | undefined): "arabic" | "math" | null {
  if (subject === "arabic" || subject === "lughati") return "arabic";
  if (subject === "math") return "math";
  return null;
}

/** Rasha's message in the bowl, read at the end of the Arabic path, and her name. */
export const MESSAGE = { words: ["اِسْقِ", "الطُّيُورَ"], name: "رَشَا" };

/** Where a station is, for its picture (components/world/RashaScenes). */
export type StationPlace =
  | "roof"
  | "door"
  | "school"
  | "beach"
  | "road"
  | "garden"
  | "well"
  | "village"
  | "terraces"
  | "rain"
  | "courtyard";

/**
 * A stop on Hudhud's journey: one per unit. Told the first time the child opens the unit
 * (`scenes`); Hudhud's line on its path is `ask`; when the unit is done, `outro`: the clue
 * on Rasha's trail (Arabic) or what the station taught (maths).
 */
export type Station = {
  place: StationPlace;
  /** Whom Hudhud meets (an emoji drawn by components/pictures). */
  person: string;
  /** What there is to read or count. */
  thing: string;
  where: string;
  ask: string;
  outro: string;
};

export const STATIONS: Record<string, Station> = {
  a1: {
    place: "roof",
    person: "🐦",
    thing: "✏",
    where: "قَبْلَ أَنْ أَقْرَأَ، أَتَعَلَّمُ الْخُطُوطَ، مِثْلَ خُطُوطِ رَشَا.",
    ask: "هَيَّا نَرْسُمُ الْخُطُوطَ!",
    outro: "صِرْتُ أَرْسُمُ الْخُطُوطَ! هَيَّا نَتَعَلَّمُ الْحُرُوفَ.",
  },
  a2: {
    place: "door",
    person: "🧕",
    thing: "🚪",
    where: "هَذَا بَيْتُ رَشَا. عَلَى الْبَابِ لَوْحَةٌ.",
    ask: "هَيَّا نَتَعَلَّمُ الْحُرُوفَ، لِنَقْرَأَ اللَّوْحَةَ!",
    outro: "قَرَأْنَا اللَّوْحَةَ: انْتَقَلَ أَهْلُ رَشَا إِلَى بَيْتٍ جَدِيدٍ.",
  },
  a3: {
    place: "school",
    person: "👩‍🏫",
    thing: "📓",
    where: "الْمُعَلِّمَةُ بَيَانُ عِنْدَهَا دَفْتَرُ رَشَا.",
    ask: "هَيَّا نَتَعَلَّمُ الْحُرُوفَ، لِنَقْرَأَ الدَّفْتَرَ!",
    outro: "فِي الدَّفْتَرِ، كَتَبَتْ رَشَا عَنِ الطُّيُورِ!",
  },
  a4: {
    place: "beach",
    person: "👨",
    thing: "⛵",
    where: "عِنْدَ الْبَحْرِ، عَلَى قَارِبِ الصَّيَّادِ اسْمٌ.",
    ask: "هَيَّا نَتَعَلَّمُ الْحَرَكَاتِ، لِنَقْرَأَ الِاسْمَ!",
    outro: "قَالَ الصَّيَّادُ: رَأَيْتُ هُنَا بِنْتًا مَعَهَا صَحْنٌ.",
  },
  a5: {
    place: "road",
    person: "👮",
    thing: "🚩",
    where: "رَجُلُ الْمُرُورِ يُشِيرُ إِلَى لَوْحَةِ الطَّرِيقِ.",
    ask: "هَيَّا نَتَعَلَّمُ الْحَرَكَاتِ، لِنَقْرَأَ اللَّوْحَةَ!",
    outro: "قَرَأْنَا اللَّوْحَةَ: هَذَا الطَّرِيقُ إِلَى الْجِبَالِ.",
  },
  a6: {
    place: "garden",
    person: "🐦",
    thing: "📄",
    where: "فِي الْحَدِيقَةِ يُغَنِّي بُلْبُلُ صَابِرٍ. عَلَى الْغُصْنِ وَرَقَةٌ.",
    ask: "هَيَّا نَتَعَلَّمُ الْحُرُوفَ، لِنَقْرَأَ الْوَرَقَةَ!",
    outro: "قَالَ الْبُلْبُلُ: رَشَا كَانَتْ تُطْعِمُنِي، مِثْلَكَ!",
  },
  a7: {
    place: "well",
    person: "👴",
    thing: "💧",
    where: "عِنْدَ الْبِئْرِ كِتَابَةٌ قَدِيمَةٌ.",
    ask: "هَيَّا نَتَعَلَّمُ الْحُرُوفَ، لِنَقْرَأَ الْكِتَابَةَ!",
    outro: "مِنْ هَذِهِ الْبِئْرِ، أَخَذَتْ رَشَا مَاءً لِلطُّيُورِ!",
  },
  a8: {
    place: "village",
    person: "👴",
    thing: "✉",
    where: "فِي الْقَرْيَةِ، عِنْدَ الْجَدِّ رِسَالَةٌ مِنْ رَشَا.",
    ask: "هَيَّا نَتَعَلَّمُ الْحُرُوفَ، لِنَقْرَأَ الرِّسَالَةَ!",
    outro: "رَشَا فِي بَيْتٍ جَدِيدٍ، وَهِيَ بِخَيْرٍ! الْآنَ أَرْجِعُ إِلَى الصَّحْنِ.",
  },
  "math-u1": {
    place: "terraces",
    person: "👨",
    thing: "🌱",
    where: "فِي الْمُدَرَّجَاتِ، عِنْدَ الْمُزَارِعِ بُذُورٌ كَثِيرَةٌ.",
    ask: "أَيُّهَا بِذْرَةُ السِّدْرِ؟ هَيَّا نُصَنِّفُ!",
    outro: "قَالَ الْمُزَارِعُ: نَزْرَعُ لِلْغَدِ، لَا لِلْيَوْمِ فَقَطْ.",
  },
  "math-u2": {
    place: "rain",
    person: "👨",
    thing: "💧",
    where: "رَجُلٌ يَعُدُّ الْمَطَرَ، وَعِنْدَهُ جِرَارٌ كَثِيرَةٌ.",
    ask: "كَمْ جَرَّةً عِنْدَهُ؟ هَيَّا نَعُدُّ!",
    outro: "عَدَدْنَا الْجِرَارَ، وَرَأَيْنَا الشَّجَرَةَ الْعَطْشَى. أَعْطَاهَا مَاءً!",
  },
  "math-u3": {
    place: "courtyard",
    person: "🕊",
    thing: "💧",
    where: "جَاءَ الْعُصْفُورُ بِقَطْرَةٍ، وَجَاءَتِ الْحَمَامَةُ بِقَطْرَةٍ.",
    ask: "كَمْ قَطْرَةً مَعًا؟ هَيَّا نَجْمَعُ!",
    outro: "قَطْرَةٌ وَقَطْرَةٌ، صَارَ الْمَاءُ كَافِيًا!",
  },
  "math-u4": {
    place: "beach",
    person: "👨",
    thing: "🐟",
    where: "الصَّيَّادُ يُعْطِي مِنْ سَمَكِهِ لِلْجِيرَانِ.",
    ask: "كَمْ يَبْقَى مَعَهُ؟ هَيَّا نَطْرَحُ!",
    outro: "مَنْ يُعْطِي، لَا يَصِيرُ أَفْقَرَ.",
  },
  "math-u5": {
    place: "courtyard",
    person: "🌱",
    thing: "🔺",
    where: "نَبْنِي حَوْلَ النَّبْتَةِ دَائِرَةً مِنَ الْحِجَارَةِ.",
    ask: "دَائِرَةٌ، مُرَبَّعٌ، مُثَلَّثٌ: هَيَّا نَبْنِي!",
    outro: "نِصْفُ الْمَاءِ لِلطُّيُورِ، وَنِصْفُهُ لِلشَّجَرَةِ!",
  },
};

/** The scenes told the first time a unit is opened: where Hudhud is, and what to do. */
export function stationScenes(unitId: string): StoryScene[] | null {
  const station = STATIONS[unitId];
  if (!station) return null;
  return [
    { id: "station", unit: unitId, line: station.where, minMs: 2400 },
    { id: "station", unit: unitId, line: station.ask },
  ];
}

/** What Hudhud says when the child picks or switches a subject, by book subject. */
export const SUBJECT_LINES: Record<string, string> = {
  arabic: "هَيَّا نَتْبَعُ طَرِيقَ رَشَا!",
  lughati: "هَيَّا نَتْبَعُ طَرِيقَ رَشَا!",
  math: "هَيَّا نَسْقِي بِذْرَةَ السِّدْرِ!",
  science: "هَيَّا نَتَعَلَّمُ!",
};

/** Hudhud's lines about a unit's goal (GoalKind, lib/storyProgress.ts). */
type GoalLines = {
  /** On the unit's path, beside Hudhud, when the unit has no station. */
  path: string;
  /** Tapping the goal while it is not finished. */
  missing: string;
  /** On the finish card, when the lesson filled a place of the goal. */
  beat: string;
  /** When the unit is finished, when the unit has no station. */
  complete: string;
};

export const GOAL_LINES: Record<GoalKind, GoalLines> = {
  writing: {
    path: "هَيَّا نَرْسُمُ الْخُطُوطَ!",
    missing: "نَرْسُمُ خَطًّا بَعْدَ خَطٍّ!",
    beat: "رَسَمْنَا خَطًّا جَدِيدًا!",
    complete: "صِرْتُ أَرْسُمُ الْخُطُوطَ!",
  },
  letters: {
    path: "هَيَّا نَتَعَلَّمُ الْحُرُوفَ، لِنَقْرَأَ!",
    missing: "نَتَعَلَّمُ الْحُرُوفَ، ثُمَّ نَقْرَأُ!",
    beat: "تَعَلَّمْنَا حَرْفًا جَدِيدًا!",
    complete: "قَرَأْنَا!",
  },
  vowels: {
    path: "هَيَّا نَتَعَلَّمُ الْحَرَكَاتِ، لِنَقْرَأَ!",
    missing: "الْحُرُوفُ تَحْتَاجُ حَرَكَاتِهَا، لِنَقْرَأَ!",
    beat: "تَعَلَّمْنَا حَرَكَاتِ حَرْفٍ!",
    complete: "قَرَأْنَا!",
  },
  seeds: {
    path: "هَيَّا نُصَنِّفُ الْبُذُورَ!",
    missing: "أَيُّهَا بِذْرَةُ السِّدْرِ؟ نُصَنِّفُ مَعًا!",
    beat: "صَنَّفْنَا سَلَّةً أُخْرَى!",
    complete: "وَجَدْنَا بِذْرَةَ السِّدْرِ!",
  },
  jars: {
    path: "هَيَّا نَعُدُّ جِرَارَ الْمَاءِ!",
    missing: "كَمْ جَرَّةً عِنْدَهُ؟ نَعُدُّ مَعًا!",
    beat: "عَدَدْنَا جَرَّةً أُخْرَى!",
    complete: "عَدَدْنَا كُلَّ الْجِرَارِ!",
  },
  drops: {
    path: "هَيَّا نَجْمَعُ الْقَطَرَاتِ!",
    missing: "قَطْرَةٌ وَقَطْرَةٌ، نَجْمَعُ مَعًا!",
    beat: "جَاءَتْ قَطْرَةٌ أُخْرَى!",
    complete: "جَمَعْنَا مَاءً كَافِيًا!",
  },
  give: {
    path: "هَيَّا نُعْطِي مِمَّا عِنْدَنَا!",
    missing: "كَمْ يَبْقَى إِذَا أَعْطَيْنَا؟ نَعُدُّ مَعًا!",
    beat: "أَعْطَيْنَا سَمَكَةً لِلْجِيرَانِ!",
    complete: "أَعْطَيْنَا، وَمَا زَالَ عِنْدَنَا!",
  },
  stones: {
    path: "هَيَّا نَبْنِي دَائِرَةً حَوْلَ النَّبْتَةِ!",
    missing: "حَجَرًا بَعْدَ حَجَرٍ، نَبْنِي مَعًا!",
    beat: "وَضَعْنَا حَجَرًا آخَرَ!",
    complete: "بَنَيْنَا الدَّائِرَةَ!",
  },
};

/** Hudhud's line on a unit's path: what this station asks of the child. */
export function pathLine(unitId: string, kind: GoalKind): string {
  return STATIONS[unitId]?.ask ?? GOAL_LINES[kind].path;
}

/** Said on the finish card of the lesson that finishes a unit: the clue or the lesson learnt. */
export function finishLine(unitId: string, kind: GoalKind): string {
  return STATIONS[unitId]?.outro ?? GOAL_LINES[kind].complete;
}

/** Said when the goal at the end of a path is tapped. */
export function goalLine(unitId: string, kind: GoalKind, complete: boolean): string {
  if (!complete) return GOAL_LINES[kind].missing;
  return finishLine(unitId, kind);
}

/** The daily bowl (BowlGoal): three lessons fill it, and the birds come to drink. */
const LESSONS_LEFT = ["", "دَرْسٌ وَاحِدٌ", "دَرْسَانِ", "ثَلَاثَةُ دُرُوسٍ"];
export function bowlLine(done: number, goal: number): string {
  if (done >= goal) return "اِمْتَلَأَ الصَّحْنُ، وَشَرِبَتِ الطُّيُورُ!";
  return `${LESSONS_LEFT[goal - done] ?? ""}، وَيَمْتَلِئُ الصَّحْنُ!`;
}

/** A won sticker is a keepsake from Hudhud's journey. */
export const giftLine = (sticker: string) => `تِذْكَارٌ مِنَ الرِّحْلَةِ: ${sticker}`;

/** The end of a subject's thread: every lesson done with three stars. */
export const SUBJECT_DONE: Record<string, string> = {
  arabic: "قَرَأْنَا رِسَالَةَ رَشَا: اِسْقِ الطُّيُورَ! شُكْرًا لَكَ!",
  lughati: "قَرَأْنَا رِسَالَةَ رَشَا: اِسْقِ الطُّيُورَ! شُكْرًا لَكَ!",
  math: "كَبِرَتْ شَجَرَةُ السِّدْرِ! شُكْرًا لَكَ!",
  science: "مَا شَاءَ اللهُ! أَتْمَمْتَ كُلَّ الدُّرُوسِ",
};
