/** FNV-1a 32 bit string hash. */
export function hashString(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Small seeded PRNG returning floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Shuffled<T> = {
  items: T[];
  /** Display index of the correct item, or -1 when `correctIndex` was out of range. */
  correctIndex: number;
  /** order[displayIndex] = original index. */
  order: number[];
};

/** Seeded Fisher Yates on a copy; the input array is never mutated. */
export function shuffleWithSeed<T>(items: readonly T[], correctIndex: number, seed: number): Shuffled<T> {
  const random = mulberry32(seed);
  const order = items.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { items: order.map((i) => items[i]), correctIndex: order.indexOf(correctIndex), order };
}

export function seedFor(attemptKey: string, roundIndex: number | string): number {
  return hashString(`${attemptKey}:${roundIndex}`);
}
