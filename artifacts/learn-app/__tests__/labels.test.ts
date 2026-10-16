import { itemsLabel, streakLabel } from "@/lib/labels";

test("itemsLabel agrees with the number in Arabic and English", () => {
  expect([1, 2, 3, 10, 11, 0].map((n) => itemsLabel(n, "ar"))).toEqual([
    "عنصر واحد",
    "عنصران",
    "3 عناصر",
    "10 عناصر",
    "11 عنصرًا",
    "0 عنصرًا",
  ]);
  expect([1, 2, 5].map((n) => itemsLabel(n, "en"))).toEqual(["1 item", "2 items", "5 items"]);
});

test("streakLabel agrees with the number in Arabic and English", () => {
  expect([2, 3, 10, 11].map((n) => streakLabel(n, "ar"))).toEqual([
    "يَوْمَانِ مُتَتَالِيَانِ",
    "3 أَيَّام مُتَتَالِيَة",
    "10 أَيَّام مُتَتَالِيَة",
    "11 يَوْمًا مُتَتَالِيًا",
  ]);
  expect([2, 12].map((n) => streakLabel(n, "en"))).toEqual(["2 day streak", "12 day streak"]);
});
