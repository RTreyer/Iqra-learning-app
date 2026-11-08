/**
 * Hudhud's story (app/intro.tsx), told by Hudhud himself, in the spirit of a quiet journey.
 *
 * Hudhud lives on a roof in Sana'a. One hot summer, when he found no water, a girl, Rasha,
 * put out a clay bowl of water for the birds, though she did not know them: "you are thirsty".
 * Every morning he waited for her, and she came. One sad day her family packed their things
 * and moved far away; the bowl stayed empty. Under it she had tucked a note. Hudhud cannot
 * read. She gave them water when they were thirsty: now it is his turn, and he sets out to find
 * her. On the way he needs to read and to count. Two threads, one per subject:
 * - Arabic: in an old alley of Sana'a he meets an old, somewhat strange man who has spent his
 *   life carrying letters through Yemen, a bag with more patches than leather. Hudhud does not
 *   understand why anyone takes such pains over a piece of paper. "Bread is for the hunger of
 *   the body; letters are for another hunger, of the heart." The postman becomes his teacher,
 *   not by explaining the world but by letting him discover it: Hudhud learns to read, to carry
 *   the letters and to read Rasha's note. Every unit is a delivery and teaches a wisdom
 *   (not every tear is sad; not all we carry is ours; words reach where people no longer can;
 *   it is enough that a letter arrives; do you only sing when someone listens?). All along he
 *   learns the letters of Rasha's note under the bowl, «اِمْلَأِ الصَّحْنَ لِي» («fill the bowl
 *   for me») signed «رَشَا»: it becomes readable letter by letter (its letters come in units 2,
 *   3, 6, 7 and 8; the last, the ش of her name, in unit 8), and at the end he reads it;
 * - maths: in Mocha by the Red Sea he meets a coffee trader whose helper has gone; he cannot
 *   count his sacks, and the ship will not wait. Hudhud helps as Rasha helped him:
 *   sort the ripe cherries, count the sacks, add what the camel brings, give to the neighbours,
 *   load the ship. When it sails, the trader puts out a bowl of water for the birds.
 * The end: on his way home Hudhud sees bowls of water for the birds everywhere. He reads Rasha's
 * note at last, «fill the bowl for me», and cannot do it: a bird cannot fill a bowl. So, as the
 * postman taught him, he carries her words to someone who can: the little girl who now lives in
 * Rasha's house. She reads the note and fills the bowl. Rasha is gone, but her words arrived and
 * her kindness stayed. Spoken by the app's
 * voice, fully vocalised, simple Fusha. Native speaker review pending (docs/CONTENT_REVIEW.md).
 */

import type { StickerId } from "../lib/stickers.ts";
import type { GoalKind } from "./types";

export type StorySceneId =
  | "roof"
  | "thirst"
  | "girl"
  | "drink"
  | "why"
  | "days"
  | "leave"
  | "gone"
  | "inscription"
  | "turn"
  | "flyoff"
  | "map"
  | "alley"
  | "doors"
  | "ask"
  | "bread"
  | "comewith"
  | "bowl"
  | "trader"
  | "sacks"
  | "return"
  | "readnote"
  | "deliver"
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

/**
 * Chapter 1: the thirsty summer, the girl and her bowl, the day she left, the note Hudhud
 * cannot read, and his resolve. Ends in the choice. Each picture plays at least `minMs`.
 */
export const INTRO_STORY: readonly StoryScene[] = [
  { id: "roof", line: "أَنَا هُدْهُدٌ. أَسْكُنُ عَلَى سَطْحٍ فِي صَنْعَاءَ.", minMs: 3600 },
  {
    id: "thirst",
    line: "فِي الصَّيْفِ، كَانَ الْجَوُّ حَارًّا، وَلَمْ أَجِدْ مَاءً. كُنْتُ عَطْشَانَ جِدًّا.",
    minMs: 4200,
  },
  {
    id: "girl",
    line: "فِي صَبَاحٍ، جَاءَتْ بِنْتٌ، وَصَبَّتْ مَاءً فِي صَحْنٍ.",
    minMs: 4600,
  },
  {
    id: "drink",
    line: "شَرِبْتُ وَشَرِبْتُ! وَجَاءَتْ طُيُورٌ أُخْرَى تَشْرَبُ مَعِي.",
    minMs: 3800,
  },
  { id: "why", line: "قُلْتُ لَهَا: أَنْتِ لَا تَعْرِفِينَنَا! قَالَتْ: لَكِنَّكُمْ عِطَاشٌ." },
  {
    id: "days",
    line: "اِسْمُهَا رَشَا. كُلَّ صَبَاحٍ، كُنْتُ أَنْتَظِرُهَا، وَكَانَتْ تَأْتِي.",
    // Two whole days: she comes, waves, fills the bowl, goes; night; again.
    minMs: 7200,
  },
  {
    id: "leave",
    line: "ثُمَّ جَاءَ يَوْمٌ حَزِينٌ. حَمَلَ أَهْلُهَا أَغْرَاضَهُمْ، وَرَحَلُوا بَعِيدًا.",
    minMs: 6400,
  },
  {
    id: "gone",
    line: "فِي الصَّبَاحِ، بَقِيَ الصَّحْنُ فَارِغًا. اِنْتَظَرْتُ وَانْتَظَرْتُ، وَلَمْ تَأْتِ رَشَا.",
    minMs: 5000,
  },
  {
    id: "inscription",
    line: "ثُمَّ رَأَيْتُ تَحْتَ الصَّحْنِ وَرَقَةً مِنْهَا. لَكِنِّي لَا أَعْرِفُ الْقِرَاءَةَ!",
    minMs: 3600,
  },
  {
    id: "turn",
    line: "رَشَا سَقَتْنَا حِينَ كُنَّا عِطَاشًا. الْآنَ جَاءَ دَوْرِي: سَأَبْحَثُ عَنْهَا!",
    minMs: 3600,
  },
  {
    id: "flyoff",
    line: "وَضَعْتُ وَرَقَتَهَا تَحْتَ جَنَاحِي، وَخَرَجْتُ أَبْحَثُ عَنْهَا!",
    minMs: 4400,
  },
  // The choice: the places on the map are the buttons (components/world/YemenMap).
  {
    id: "map",
    line: "هَذَا هُوَ الْيَمَنُ. أَيْنَ أَبْحَثُ أَوَّلًا؟ اِخْتَرْ مَكَانًا!",
  },
];

/** The story's other parts: the two threads, told the first time, and the end. */
export type ChapterId = "arabic" | "math" | "end";

export const CHAPTERS: Record<ChapterId, readonly StoryScene[]> = {
  // Hudhud meets the old postman (Arabic): his bag, his letters, the bread, "come with me".
  arabic: [
    {
      id: "alley",
      line: "فِي زُقَاقٍ قَدِيمٍ فِي صَنْعَاءَ، رَأَيْتُ رَجُلًا عَجُوزًا يَحْمِلُ حَقِيبَةً كَبِيرَةً.",
      minMs: 4600,
    },
    {
      id: "doors",
      line: "كَانَ يَطْرُقُ الْأَبْوَابَ. بَعْضُ النَّاسِ يَبْتَسِمُونَ، وَبَعْضُهُمْ يَبْكُونَ.",
      minMs: 4000,
    },
    {
      id: "ask",
      line: "سَأَلْتُهُ: مَاذَا فِي حَقِيبَتِكَ؟ قَالَ: رَسَائِلُ. كَلِمَاتٌ تُسَافِرُ.",
      minMs: 4000,
    },
    {
      id: "bread",
      line: "أَعْطَانِي خُبْزًا، وَقَالَ: الْخُبْزُ لِجُوعِ الْبَطْنِ، وَالرَّسَائِلُ لِجُوعِ الْقَلْبِ.",
      minMs: 4200,
    },
    {
      id: "comewith",
      line: "قَالَ: تَعَالَ مَعِي، وَتَعَلَّمِ الْقِرَاءَةَ. سَتَقْرَأُ الْأَسْمَاءَ، وَوَرَقَةَ رَشَا!",
      minMs: 4400,
    },
    {
      id: "bowl",
      line: "كُلُّ حَرْفٍ نَتَعَلَّمُهُ يُضِيءُ فِي وَرَقَتِهَا!",
      minMs: 3600,
    },
  ],
  math: [
    {
      id: "trader",
      line: "فِي الْمُخَا، عِنْدَ الْبَحْرِ، وَجَدْتُ تَاجِرَ بُنٍّ حَزِينًا. ذَهَبَ مَنْ كَانَ يُسَاعِدُهُ.",
      minMs: 4000,
    },
    {
      id: "sacks",
      line: "لَا يَعْرِفُ كَمْ كِيسًا عِنْدَهُ، وَالسَّفِينَةُ لَا تَنْتَظِرُ. رَشَا سَاعَدَتْنَا، فَهَيَّا نُسَاعِدُهُ!",
      minMs: 4400,
    },
  ],
  end: [
    {
      id: "return",
      line: "رَجَعْتُ إِلَى صَنْعَاءَ. وَفِي الطَّرِيقِ، رَأَيْتُ صُحُونَ مَاءٍ لِلطُّيُورِ فِي كُلِّ مَكَانٍ!",
      minMs: 4400,
    },
    // At last he reads her note, and cannot do what it asks: a bird cannot fill a bowl.
    {
      id: "readnote",
      line: "قَرَأْتُ وَرَقَةَ رَشَا: اِمْلَأِ الصَّحْنَ لِي. لَكِنِّي طَائِرٌ، لَا أَسْتَطِيعُ!",
      minMs: 4600,
    },
    // So he carries her words, as the postman taught him, to someone who can.
    {
      id: "deliver",
      line: "فِي بَيْتِ رَشَا تَسْكُنُ الْآنَ بِنْتٌ صَغِيرَةٌ. حَمَلْتُ إِلَيْهَا الْوَرَقَةَ.",
      minMs: 4600,
    },
    {
      id: "newgirl",
      line: "قَرَأَتِ الْوَرَقَةَ، وَمَلَأَتِ الصَّحْنَ!",
      minMs: 4400,
    },
    {
      id: "home",
      line: "رَشَا ذَهَبَتْ، لَكِنَّ كَلِمَاتِهَا وَصَلَتْ، وَلُطْفَهَا بَقِيَ.",
      minMs: 4000,
    },
  ],
};

/** The thread a subject belongs to. */
export function chapterFor(subject: string | undefined): Thread | null {
  if (subject === "arabic" || subject === "lughati") return "arabic";
  if (subject === "math") return "math";
  return null;
}

/** A thread of the story: reading (Arabic) or counting (maths). */
export type Thread = "arabic" | "math";

/** The places on the map: one per thread, and places still being made. */
export type PlaceId = Thread | "socotra";

/** A place on the map of Yemen (components/world/YemenMap). */
export type MapPlace = {
  name: string;
  /** Who waits there for Hudhud, or that the place is still to come. */
  what: string;
  lon: number;
  lat: number;
  /** The picture on its badge: a drawing of components/pictures, or a sticker (lib/stickers). */
  picture: string;
  sticker?: StickerId;
  color: string;
  /** Still being made: shown on the map, not yet open. */
  soon?: boolean;
};

/** Hudhud's home: his roof in Sana'a, with Rasha's bowl. */
export const HOME_PLACE = { name: "صَنْعَاءُ", lon: 44.2, lat: 15.35 };

/**
 * Where Hudhud can go at the end of chapter 1, one place per thread: his own city, Sana'a, where
 * the old postman lets him carry letters and learn to read (reading), and Mocha,
 * the old coffee port on the Red Sea, where the coffee trader needs him (counting). Socotra is
 * on the map too, marked as coming soon. On the home screen the same map is the subject choice.
 */
export const MAP_PLACES: Record<PlaceId, MapPlace> = {
  arabic: {
    name: "صَنْعَاءُ",
    what: "سَاعِي الْبَرِيدِ",
    lon: 44.2,
    lat: 15.35,
    picture: "✉",
    color: "#1F5FA8",
  },
  math: {
    name: "الْمُخَا",
    what: "تَاجِرُ الْبُنِّ",
    lon: 43.25,
    lat: 13.32,
    picture: "🫘",
    color: "#6D3FC4",
  },
  // The island of the dragon blood trees: a place for a subject still to come.
  socotra: {
    name: "سُقُطْرَى",
    what: "قَرِيبًا",
    lon: 53.8,
    lat: 12.5,
    picture: "🌳",
    sticker: "dragon_tree",
    // Grey, still to come; dark enough for white writing (contrast 4.5 : 1 and more).
    color: "#635C53",
    soon: true,
  },
};

/** What Hudhud says when Socotra, still to come, is tapped on the map. */
export const SOON_LINE = "جَزِيرَةُ سُقُطْرَى! سَأَطِيرُ إِلَيْهَا قَرِيبًا.";

/** Rasha's message in the bowl, read at the end of the Arabic path, and her name. */
export const MESSAGE = { words: ["اِمْلَأِ", "الصَّحْنَ", "لِي"], name: "رَشَا" };

/** Where a station is, for its picture (components/world/RashaScenes). */
export type StationPlace =
  | "post"
  | "door"
  | "school"
  | "beach"
  | "road"
  | "garden"
  | "well"
  | "village"
  | "terraces"
  | "market"
  | "port";

/**
 * A stop on Hudhud's journey: one per unit. Told the first time the child opens the unit
 * (`scenes`); Hudhud's line on its path is `ask`; when the unit is done, `outro`: the clue
 * on Rasha's trail (Arabic) or what the station taught (maths).
 */
/** How a person of the story looks (components/world/Person). */
export type PersonMood = "smile" | "happy" | "wonder" | "sad";

export type Station = {
  place: StationPlace;
  /** Whom Hudhud meets (an emoji drawn by components/pictures). */
  person: string;
  /**
   * How they look when Hudhud arrives (smiling if not given); when he asks the child to help,
   * they are glad.
   */
  feels?: PersonMood;
  /** What there is to read or count. */
  thing: string;
  where: string;
  ask: string;
  outro: string;
};

export const STATIONS: Record<string, Station> = {
  // Arabic: the postman's letters, one delivery and one wisdom per unit.
  a1: {
    place: "post",
    person: "👴",
    thing: "✏",
    where:
      "سَاعِي الْبَرِيدِ يَكْتُبُ عَلَى الرَّسَائِلِ. قَبْلَ أَنْ أَقْرَأَ، أَتَعَلَّمُ الْخُطُوطَ.",
    ask: "هَيَّا نَرْسُمُ الْخُطُوطَ!",
    outro: "صِرْتُ أَرْسُمُ الْخُطُوطَ! هَيَّا نَتَعَلَّمُ الْحُرُوفَ.",
  },
  a2: {
    place: "door",
    person: "🧕",
    feels: "wonder",
    thing: "✉",
    where: "رِسَالَةٌ لِلْأُمِّ أَمِينَةَ، مِنِ ابْنِهَا الْبَعِيدِ.",
    ask: "هَيَّا نَتَعَلَّمُ الْحُرُوفَ، لِنَقْرَأَ اسْمَهَا!",
    outro: "بَكَتْ مِنَ الْفَرَحِ. قَالَ سَاعِي الْبَرِيدِ: لَيْسَتْ كُلُّ دَمْعَةٍ حُزْنًا.",
  },
  a3: {
    place: "school",
    person: "👩‍🏫",
    thing: "✉",
    where: "رِسَالَةٌ لِلْمُعَلِّمَةِ بَيَانَ. أُرِيدُ أَنْ أَفْتَحَهَا!",
    ask: "هَيَّا نَتَعَلَّمُ الْحُرُوفَ، لِنَقْرَأَ الْعُنْوَانَ!",
    outro: "لَمْ أَفْتَحْهَا. قَالَ سَاعِي الْبَرِيدِ: لَيْسَ كُلُّ مَا نَحْمِلُهُ لَنَا.",
  },
  a4: {
    place: "beach",
    person: "👨",
    feels: "wonder",
    thing: "⛵",
    where: "عِنْدَ الْبَحْرِ، عَلَى قَارِبِ الصَّيَّادِ اسْمٌ. الرِّسَالَةُ لَهُ!",
    ask: "هَيَّا نَتَعَلَّمُ الْحَرَكَاتِ، لِنَقْرَأَ الِاسْمَ!",
    outro:
      "الرِّسَالَةُ مِنْ أَخِيهِ الْبَعِيدِ. الْكَلِمَاتُ تَصِلُ إِلَى حَيْثُ لَا يَصِلُ النَّاسُ.",
  },
  a5: {
    place: "road",
    person: "👮",
    thing: "🚩",
    where:
      "أَوَّلُ رِسَالَةٍ أَحْمِلُهَا وَحْدِي، إِلَى جِبَالِ حَرَازٍ. رَجُلُ الْمُرُورِ يُشِيرُ إِلَى اللَّوْحَةِ.",
    ask: "هَيَّا نَتَعَلَّمُ الْحَرَكَاتِ، لِنَقْرَأَ اللَّوْحَةَ!",
    outro: "وَصَلَتِ الرِّسَالَةُ، وَلَمْ يَرَنِي أَحَدٌ. يَكْفِي أَنَّهَا وَصَلَتْ.",
  },
  a6: {
    place: "garden",
    person: "🐦",
    thing: "✉",
    where: "فِي الْحَدِيقَةِ يُغَنِّي بُلْبُلٌ وَحْدَهُ. وَمَعَنَا رِسَالَةٌ لَا نَعْرِفُ لِمَنْ.",
    ask: "هَيَّا نَتَعَلَّمُ الْحُرُوفَ، لِنَقْرَأَ الرِّسَالَةَ!",
    outro: "قَالَ سَاعِي الْبَرِيدِ: هَلْ تُغَنِّي فَقَطْ حِينَ يَسْمَعُكَ أَحَدٌ؟",
  },
  a7: {
    place: "well",
    person: "👴",
    feels: "wonder",
    thing: "💧",
    where: "عِنْدَ الْبِئْرِ كِتَابَةٌ قَدِيمَةٌ، مِنْ زَمَنٍ بَعِيدٍ.",
    ask: "هَيَّا نَتَعَلَّمُ الْحُرُوفَ، لِنَقْرَأَ الْكِتَابَةَ!",
    outro: "كَتَبَهَا أَحَدٌ قَبْلَ سِنِينَ، وَمَا زَالَتْ تُكَلِّمُنَا!",
  },
  a8: {
    place: "post",
    person: "👴",
    feels: "happy",
    thing: "📄",
    where: "بَقِيَ حَرْفٌ مِنِ اسْمِهَا، ثُمَّ أَقْرَأُ وَرَقَةَ رَشَا!",
    ask: "هَيَّا نَتَعَلَّمُ آخِرَ الْحُرُوفِ!",
    outro: "تَعَلَّمْنَا آخِرَ الْحُرُوفِ! الْآنَ نَقْرَأُ وَرَقَةَ رَشَا.",
  },

  "math-u1": {
    place: "market",
    person: "👨",
    thing: "🍒",
    where: "فِي سُوقِ الْمُخَا، جَاءَ الْمُزَارِعُونَ بِحَبَّاتِ الْبُنِّ مِنَ الْجِبَالِ.",
    ask: "الْحَمْرَاءُ هُنَا، وَالْخَضْرَاءُ هُنَاكَ. هَيَّا نُصَنِّفُ!",
    outro: "صَنَّفْنَا الْحَبَّاتِ! قَالَ التَّاجِرُ: الْحَمْرَاءُ نَاضِجَةٌ.",
  },
  "math-u2": {
    place: "market",
    person: "👨",
    feels: "sad",
    thing: "🫘",
    where: "فِي مَخْزَنِ التَّاجِرِ، أَكْيَاسُ الْبُنِّ كَثِيرَةٌ.",
    ask: "كَمْ كِيسًا عِنْدَهُ؟ هَيَّا نَعُدُّ!",
    outro: "عَدَدْنَا الْأَكْيَاسَ، وَابْتَسَمَ التَّاجِرُ لِأَوَّلِ مَرَّةٍ!",
  },
  "math-u3": {
    place: "road",
    person: "🐪",
    thing: "🫘",
    where: "مِنَ الْجِبَالِ إِلَى الْمُخَا، يَحْمِلُ الْجَمَلُ أَكْيَاسًا جَدِيدَةً.",
    ask: "كِيسٌ وَكِيسٌ: كَمْ مَعًا؟ هَيَّا نَجْمَعُ!",
    outro: "جَمَعْنَا الْأَكْيَاسَ، وَكُلُّهَا الْآنَ فِي الْمَخْزَنِ.",
  },
  "math-u4": {
    place: "beach",
    person: "👨",
    feels: "happy",
    thing: "☕",
    where: "عِنْدَ الْبَحْرِ، يُعْطِي التَّاجِرُ مِنْ بُنِّهِ لِلْجِيرَانِ.",
    ask: "كَمْ يَبْقَى مَعَهُ؟ هَيَّا نَطْرَحُ!",
    outro: "قَالَ التَّاجِرُ: مَنْ يُعْطِي، لَا يَصِيرُ أَفْقَرَ.",
  },
  "math-u5": {
    place: "port",
    person: "👨",
    feels: "wonder",
    thing: "⛵",
    where: "فِي مِينَاءِ الْمُخَا، السَّفِينَةُ تَنْتَظِرُ الْبُنَّ.",
    ask: "مُرَبَّعٌ، دَائِرَةٌ، مُثَلَّثٌ: هَيَّا نُحَمِّلُ السَّفِينَةَ!",
    outro: "أَبْحَرَتِ السَّفِينَةُ! وَوَضَعَ التَّاجِرُ صَحْنَ مَاءٍ لِلطُّيُورِ.",
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
  arabic: "هَيَّا نَحْمِلُ الرَّسَائِلَ مَعَ سَاعِي الْبَرِيدِ!",
  lughati: "هَيَّا نَحْمِلُ الرَّسَائِلَ مَعَ سَاعِي الْبَرِيدِ!",
  math: "هَيَّا نُسَاعِدُ تَاجِرَ الْبُنِّ!",
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
  sort: {
    path: "هَيَّا نُصَنِّفُ حَبَّاتِ الْبُنِّ!",
    missing: "الْحَمْرَاءُ أَمِ الْخَضْرَاءُ؟ نُصَنِّفُ مَعًا!",
    beat: "صَنَّفْنَا سَلَّةً أُخْرَى!",
    complete: "صَنَّفْنَا كُلَّ الْحَبَّاتِ!",
  },
  count: {
    path: "هَيَّا نَعُدُّ أَكْيَاسَ الْبُنِّ!",
    missing: "كَمْ كِيسًا عِنْدَهُ؟ نَعُدُّ مَعًا!",
    beat: "عَدَدْنَا كِيسًا آخَرَ!",
    complete: "عَدَدْنَا كُلَّ الْأَكْيَاسِ!",
  },
  add: {
    path: "هَيَّا نَجْمَعُ الْأَكْيَاسَ الْجَدِيدَةَ!",
    missing: "الْجَمَلُ يَحْمِلُ أَكْيَاسًا، نَجْمَعُهَا مَعًا!",
    beat: "وَصَلَ كِيسٌ جَدِيدٌ!",
    complete: "جَمَعْنَا كُلَّ الْأَكْيَاسِ!",
  },
  give: {
    path: "هَيَّا نُعْطِي مِمَّا عِنْدَنَا!",
    missing: "كَمْ يَبْقَى إِذَا أَعْطَيْنَا؟ نَعُدُّ مَعًا!",
    beat: "أَعْطَيْنَا الْجِيرَانَ بُنًّا!",
    complete: "أَعْطَيْنَا، وَمَا زَالَ عِنْدَنَا!",
  },
  ship: {
    path: "هَيَّا نُحَمِّلُ السَّفِينَةَ!",
    missing: "طَرْدًا بَعْدَ طَرْدٍ، نُحَمِّلُ مَعًا!",
    beat: "حَمَّلْنَا طَرْدًا آخَرَ!",
    complete: "حَمَّلْنَا السَّفِينَةَ!",
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
  arabic: "قَرَأْنَا وَرَقَةَ رَشَا: اِمْلَأِ الصَّحْنَ لِي! شُكْرًا لَكَ!",
  lughati: "قَرَأْنَا وَرَقَةَ رَشَا: اِمْلَأِ الصَّحْنَ لِي! شُكْرًا لَكَ!",
  math: "أَبْحَرَتِ السَّفِينَةُ، وَالتَّاجِرُ سَعِيدٌ! شُكْرًا لَكَ!",
  science: "مَا شَاءَ اللهُ! أَتْمَمْتَ كُلَّ الدُّرُوسِ",
};
