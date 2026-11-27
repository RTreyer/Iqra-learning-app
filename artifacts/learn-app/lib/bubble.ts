/** Short vowels and shadda, so "يُسَاوِي" and "يساوي" compare alike. */
const MARKS = /[\u064B-\u0652]/g;

/**
 * What Hudhud's bubble shows when the lesson has no spoken instruction (maths): the subtitle,
 * unless it is a solved example or a row of numbers ("٣ زَائِد ٢ يُسَاوِي ٥", "١، ٣، ٥"), which
 * would show rounds' answers (DSGN-02); then the lesson's name.
 */
export function bubbleSubtitle(subtitle: string, title: string): string {
  const bare = subtitle.replace(MARKS, "");
  // Any number counts: "٥ + ٠، ٤ + ١، ٣ + ٢" or "١، ٣، ٥، ٧، ٩" answer rounds too (CONT-R2-01).
  return /=|يساوي|[0-9٠-٩]/.test(bare) ? title : subtitle;
}
