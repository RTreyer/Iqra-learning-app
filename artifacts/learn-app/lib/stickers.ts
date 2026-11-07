/**
 * Sticker album: pictures of Yemen the child earns with stars. Every sticker is earned at a
 * fixed number of stars, never by chance (no wheel, no surprise box), and each one speaks its
 * name, so the album also teaches words.
 */

export type StickerId =
  | "house"
  | "qamariya"
  | "dragon_tree"
  | "coffee"
  | "dhow"
  | "honey"
  | "palm"
  | "bint_al_sahn"
  | "dates";

export type Sticker = {
  id: StickerId;
  /** Spoken and shown name, fully vocalised for the voice. */
  name: string;
};

/** Album order: the first sticker comes after a few lessons, the next ones every few more. */
export const STICKERS: readonly Sticker[] = [
  { id: "qamariya", name: "الْقَمَرِيَّةُ" },
  { id: "house", name: "بَيْتٌ مِنْ صَنْعَاءَ" },
  { id: "coffee", name: "قَهْوَةُ الْمُخَا" },
  { id: "dhow", name: "السَّنْبُوقُ" },
  { id: "honey", name: "عَسَلُ السِّدْرِ" },
  { id: "dragon_tree", name: "شَجَرَةُ دَمِ الْأَخَوَيْنِ" },
  { id: "palm", name: "النَّخْلَةُ" },
  { id: "dates", name: "التَّمْرُ" },
  { id: "bint_al_sahn", name: "بِنْتُ الصَّحْنِ" },
];

export const STARS_PER_STICKER = 12;

/** How many stickers `totalStars` has earned. */
export function stickersEarned(totalStars: number): number {
  return Math.max(0, Math.min(STICKERS.length, Math.floor(totalStars / STARS_PER_STICKER)));
}

/** The sticker newly earned when the total goes from `before` to `after`, if any. */
export function newSticker(before: number, after: number): Sticker | null {
  const from = stickersEarned(before);
  const to = stickersEarned(after);
  return to > from ? STICKERS[to - 1] : null;
}

/** Stars still missing for the next sticker, and the share already collected (0 to 1). */
export function nextStickerProgress(totalStars: number): { missing: number; share: number } | null {
  if (stickersEarned(totalStars) >= STICKERS.length) return null;
  const into = totalStars % STARS_PER_STICKER;
  return { missing: STARS_PER_STICKER - into, share: into / STARS_PER_STICKER };
}
