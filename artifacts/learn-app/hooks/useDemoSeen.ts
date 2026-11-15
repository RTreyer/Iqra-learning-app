import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import type { DemoId } from "@/content/demos";
import { useProfiles } from "@/context/ProfilesContext";
import { FIRST_PROFILE_ID, LEGACY_DEMO_SEEN_KEY, demoSeenKey } from "@/lib/profiles";

/** The first child's key; every other child has its own (lib/profiles.ts demoSeenKey). */
export const DEMO_SEEN_KEY = LEGACY_DEMO_SEEN_KEY;

/** Per child, shared by every screen of a session, so a demo is never shown twice for one type. */
const cache = new Map<string, ReadonlySet<string>>();
const loading = new Map<string, Promise<ReadonlySet<string>>>();

function load(profileId: string): Promise<ReadonlySet<string>> {
  let pending = loading.get(profileId);
  if (!pending) {
    pending = AsyncStorage.getItem(demoSeenKey(profileId))
      .then((raw) => {
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(parsed) ? parsed.filter((t) => typeof t === "string") : []);
      })
      // Unreadable storage: show the demos again rather than never.
      .catch(() => new Set<string>())
      .then((seen) => {
        cache.set(profileId, seen);
        return seen;
      });
    loading.set(profileId, pending);
  }
  return pending;
}

/** Tests only: forget what this session has loaded, or start the first child from `seen`. */
export function resetDemoSeenCache(seen?: Iterable<string>): void {
  cache.clear();
  loading.clear();
  if (seen) {
    const loaded = new Set(seen);
    cache.set(FIRST_PROFILE_ID, loaded);
    loading.set(FIRST_PROFILE_ID, Promise.resolve(loaded));
  }
}

/**
 * Demos the active child has seen (activity types, and `trace_lines`), persisted across
 * launches. `seen` is null while loading.
 */
export function useDemoSeen(): {
  seen: ReadonlySet<string> | null;
  markSeen: (id: DemoId) => void;
} {
  const { active } = useProfiles();
  const profileId = active.id;
  const [state, setState] = useState<{ id: string; seen: ReadonlySet<string> | null }>(() => ({
    id: profileId,
    seen: cache.get(profileId) ?? null,
  }));
  const seen = (state.id === profileId ? state.seen : null) ?? cache.get(profileId) ?? null;

  useEffect(() => {
    // Already loaded this session: `seen` above reads it from the cache.
    if (cache.has(profileId)) return;
    let alive = true;
    load(profileId).then((loaded) => {
      if (alive) setState({ id: profileId, seen: loaded });
    });
    return () => {
      alive = false;
    };
  }, [profileId]);

  const markSeen = useCallback(
    (id: DemoId) => {
      const next = new Set(cache.get(profileId) ?? []);
      if (next.has(id)) return;
      next.add(id);
      cache.set(profileId, next);
      setState({ id: profileId, seen: next });
      AsyncStorage.setItem(demoSeenKey(profileId), JSON.stringify([...next])).catch(() => {});
    },
    [profileId],
  );

  return { seen, markSeen };
}
