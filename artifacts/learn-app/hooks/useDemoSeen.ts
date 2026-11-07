import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import type { LessonType } from "@/content/types";

export const DEMO_SEEN_KEY = "@iqra_demo_seen_v1";

/** Shared by every screen of a session, so a demo is never shown twice for one type. */
let cache: ReadonlySet<string> | null = null;
let loading: Promise<ReadonlySet<string>> | null = null;

function load(): Promise<ReadonlySet<string>> {
  loading ??= AsyncStorage.getItem(DEMO_SEEN_KEY)
    .then((raw) => {
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed.filter((t) => typeof t === "string") : []);
    })
    // Unreadable storage: show the demos again rather than never.
    .catch(() => new Set<string>())
    .then((seen) => (cache = seen));
  return loading;
}

/** Tests only: forget what this session has loaded, or start from `seen` as if loaded. */
export function resetDemoSeenCache(seen?: Iterable<string>): void {
  const loaded = seen ? new Set(seen) : null;
  cache = loaded;
  loading = loaded ? Promise.resolve(loaded) : null;
}

/**
 * Activity types whose demo the child has seen, persisted across launches.
 * `seen` is null while loading.
 */
export function useDemoSeen(): {
  seen: ReadonlySet<string> | null;
  markSeen: (type: LessonType) => void;
} {
  const [seen, setSeen] = useState<ReadonlySet<string> | null>(cache);

  useEffect(() => {
    if (cache) return;
    let alive = true;
    load().then((loaded) => {
      if (alive) setSeen(loaded);
    });
    return () => {
      alive = false;
    };
  }, []);

  const markSeen = useCallback((type: LessonType) => {
    const next = new Set(cache ?? []);
    if (next.has(type)) return;
    next.add(type);
    cache = next;
    setSeen(next);
    AsyncStorage.setItem(DEMO_SEEN_KEY, JSON.stringify([...next])).catch(() => {});
  }, []);

  return { seen, markSeen };
}
