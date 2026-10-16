import { todayKey } from "@/lib/dates";

function shiftDays(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
}

/**
 * Consecutive active days ending today or yesterday. Yesterday still counts so
 * the streak survives until today is over. Days are local YYYY-MM-DD keys and
 * may be unsorted or repeated.
 */
export function currentStreak(days: string[], today: Date): number {
  const active = new Set(days);
  let cursor = active.has(todayKey(today)) ? today : shiftDays(today, -1);
  let count = 0;
  while (active.has(todayKey(cursor))) {
    count += 1;
    cursor = shiftDays(cursor, -1);
  }
  return count;
}
