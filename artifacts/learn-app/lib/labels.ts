import type { UiLanguage } from "@/content/ui-translations";

/** "n items" with Arabic number agreement: 1 and 2 have their own forms, 3 to 10 plural, above 10 singular accusative. */
export function itemsLabel(n: number, language: UiLanguage): string {
  if (language === "en") return n === 1 ? "1 item" : `${n} items`;
  if (n === 1) return "عنصر واحد";
  if (n === 2) return "عنصران";
  if (n >= 3 && n <= 10) return `${n} عناصر`;
  return `${n} عنصرًا`;
}
