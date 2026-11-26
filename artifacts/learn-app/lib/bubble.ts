/** Short vowels and shadda, so "يُسَاوِي" and "يساوي" compare alike. */
const MARKS = /[\u064B-\u0652]/g;

/**
 * What Hudhud's bubble shows when the lesson has no spoken instruction (maths): the subtitle,
 * unless it is a solved example ("٣ زَائِد ٢ يُسَاوِي ٥"), which would show the first round's
 * answer (DSGN-02); then the lesson's name.
 */
export function bubbleSubtitle(subtitle: string, title: string): string {
  const bare = subtitle.replace(MARKS, "");
  return /=|يساوي/.test(bare) ? title : subtitle;
}
