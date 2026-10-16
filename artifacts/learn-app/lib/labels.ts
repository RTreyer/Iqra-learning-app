import type { UiLanguage } from "@/content/ui-translations";

/** "n items" with Arabic number agreement: 1 and 2 have their own forms, 3 to 10 plural, above 10 singular accusative. */
export function itemsLabel(n: number, language: UiLanguage): string {
  if (language === "en") return n === 1 ? "1 item" : `${n} items`;
  if (n === 1) return "عنصر واحد";
  if (n === 2) return "عنصران";
  if (n >= 3 && n <= 10) return `${n} عناصر`;
  return `${n} عنصرًا`;
}

/** Spoken streak for the badge (n >= 2; the badge hides below 2), with Arabic dual and plural forms. */
export function streakLabel(n: number, language: UiLanguage): string {
  if (language === "en") return `${n} day streak`;
  if (n === 2) return "يَوْمَانِ مُتَتَالِيَانِ";
  if (n >= 3 && n <= 10) return `${n} أَيَّام مُتَتَالِيَة`;
  return `${n} يَوْمًا مُتَتَالِيًا`;
}
