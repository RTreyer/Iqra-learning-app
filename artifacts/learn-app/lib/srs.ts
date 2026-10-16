/**
 * Leitner scheduler. Pure: no React, no storage, the clock is passed in.
 * Dates are stored as ISO strings. Scheduling works in local calendar days:
 * dueAt is local midnight of the due day, so an item seen in the evening is
 * due the next morning.
 */

import { todayKey } from "@/lib/dates";
import type { ProgressItem } from "@/lib/progressState";

export const BOX_INTERVAL_DAYS = { 1: 1, 2: 2, 3: 4, 4: 7, 5: 14 } as const;

export type ItemState = ProgressItem;
type Box = ItemState["box"];

/** Longest interval; a dueAt further ahead than this means the clock moved backwards. */
const MAX_INTERVAL_DAYS = BOX_INTERVAL_DAYS[5];

/** Local midnight `days` calendar days after `now`. Built from date parts, so DST safe. */
function localMidnight(now: Date, days: number): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
}

function dueAfter(box: Box, now: Date): string {
  return localMidnight(now, BOX_INTERVAL_DAYS[box]).toISOString();
}

/** A newly seen item: box 1, due tomorrow. */
export function introduce(now: Date): ItemState {
  return { box: 1, dueAt: dueAfter(1, now), lastSeenAt: now.toISOString(), lapses: 0 };
}

/** Correct moves one box up (max 5); wrong goes back to box 1 and counts a lapse. */
export function review(state: ItemState, correct: boolean, now: Date): ItemState {
  const box: Box = correct ? (Math.min(5, state.box + 1) as Box) : 1;
  return {
    box,
    dueAt: dueAfter(box, now),
    lastSeenAt: now.toISOString(),
    lapses: correct ? state.lapses : state.lapses + 1,
  };
}

function dueTime(state: ItemState): number {
  const time = Date.parse(state.dueAt);
  return Number.isNaN(time) ? -Infinity : time;
}

/**
 * Due once the local day of `now` reaches the local day of dueAt. An
 * unparsable dueAt, or one more than MAX_INTERVAL_DAYS days ahead (the clock
 * was corrected backwards), counts as due so the item is never stuck.
 */
export function isDue(state: ItemState, now: Date): boolean {
  const time = dueTime(state);
  if (!Number.isFinite(time)) return true;
  const dueDay = todayKey(new Date(time));
  return todayKey(now) >= dueDay || dueDay > todayKey(localMidnight(now, MAX_INTERVAL_DAYS));
}

function kindOf(id: string): string {
  const colon = id.indexOf(":");
  return colon === -1 ? id : id.slice(0, colon);
}

/**
 * Due ids, oldest due first, then lowest box, then id (deterministic).
 * The kind of an id is its prefix before the first ":" (letter, word, count,
 * calc, q), as produced by lib/reviewItems.ts.
 * Kinds are interleaved: each pick takes the first remaining id whose kind
 * differs from the previous one, falling back to the first remaining id.
 */
export function pickDue(items: Record<string, ItemState>, now: Date, limit = 10): string[] {
  const remaining = Object.entries(items)
    .filter(([, state]) => isDue(state, now))
    .sort(
      ([idA, a], [idB, b]) =>
        dueTime(a) - dueTime(b) || a.box - b.box || (idA < idB ? -1 : idA > idB ? 1 : 0),
    )
    .map(([id]) => id);

  const picked: string[] = [];
  let lastKind: string | null = null;
  while (picked.length < limit && remaining.length > 0) {
    const index = Math.max(
      0,
      remaining.findIndex((id) => kindOf(id) !== lastKind),
    );
    const [id] = remaining.splice(index, 1);
    picked.push(id);
    lastKind = kindOf(id);
  }
  return picked;
}
