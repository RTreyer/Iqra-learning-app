/**
 * ProgressContext — tracks completed lessons and earned stars.
 *
 * Fully offline: progress lives in React state and is persisted to
 * AsyncStorage on the device. There is no server, login or sync.
 *
 * Migration:
 *  Earlier versions scoped progress per logged-in account
 *  (`@kidlearn_progress_v1_<userId>`). On first start without a device-wide
 *  entry, the account entry with the most stars is copied over so children
 *  keep their stars after the update.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ─── AsyncStorage keys ────────────────────────────────────────────────────────

const STORAGE_KEY = "@kidlearn_progress_v1";
const LEGACY_ACCOUNT_KEY_PREFIX = "@kidlearn_progress_v1_";
const LEGACY_PENDING_KEY_PREFIX = "@kidlearn_pending_sync_v1_";

// ─── Types ────────────────────────────────────────────────────────────────────

type LessonProgress = {
  completed: boolean;
  stars: number;
};

type ProgressState = {
  lessons: Record<string, LessonProgress>;
  totalStars: number;
};

type ProgressContextValue = {
  progress: ProgressState;
  completeLesson: (lessonId: string, stars: number) => Promise<void>;
  getLessonProgress: (lessonId: string) => LessonProgress;
  resetProgress: () => Promise<void>;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultState: ProgressState = { lessons: {}, totalStars: 0 };

const ProgressContext = createContext<ProgressContextValue>({
  progress: defaultState,
  completeLesson: async () => {},
  getLessonProgress: () => ({ completed: false, stars: 0 }),
  resetProgress: async () => {},
});

// ─── AsyncStorage helpers ─────────────────────────────────────────────────────

/**
 * One-time migration from per-account keys to the device-wide key.
 * Picks the account with the most stars and removes the old account keys.
 */
async function migrateAccountProgress(): Promise<ProgressState | null> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const accountKeys = keys.filter((k) => k.startsWith(LEGACY_ACCOUNT_KEY_PREFIX));
    const pendingKeys = keys.filter((k) => k.startsWith(LEGACY_PENDING_KEY_PREFIX));
    if (accountKeys.length === 0) return null;

    let best: ProgressState | null = null;
    for (const [, json] of await AsyncStorage.multiGet(accountKeys)) {
      if (!json) continue;
      const state = JSON.parse(json) as ProgressState;
      if (!best || state.totalStars > best.totalStars) best = state;
    }

    if (best) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(best));
    await AsyncStorage.multiRemove([...accountKeys, ...pendingKeys]);
    return best;
  } catch {
    return null;
  }
}

async function loadLocalProgress(): Promise<ProgressState> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) return JSON.parse(json) as ProgressState;
    return (await migrateAccountProgress()) ?? defaultState;
  } catch {
    return defaultState;
  }
}

async function saveLocalProgress(state: ProgressState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(defaultState);

  // Lessons completed before the stored state finished loading are merged in
  // once it arrives, so nothing is overwritten by the initial load.
  const loadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadLocalProgress().then((stored) => {
      if (cancelled) return;
      loadedRef.current = true;
      setProgress((current) => {
        const lessons = { ...stored.lessons };
        for (const [lessonId, entry] of Object.entries(current.lessons)) {
          if (entry.stars > (lessons[lessonId]?.stars ?? -1)) lessons[lessonId] = entry;
        }
        const totalStars = Object.values(lessons).reduce((sum, l) => sum + l.stars, 0);
        const next = { lessons, totalStars };
        if (current !== defaultState) saveLocalProgress(next);
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const completeLesson = useCallback(async (lessonId: string, stars: number) => {
    setProgress((prev) => {
      const existing = prev.lessons[lessonId];
      const prevStars = existing?.stars ?? 0;
      const newStars = Math.max(prevStars, stars);
      const starsGained = newStars - prevStars;

      const next: ProgressState = {
        totalStars: prev.totalStars + starsGained,
        lessons: {
          ...prev.lessons,
          [lessonId]: { completed: true, stars: newStars },
        },
      };

      if (loadedRef.current) saveLocalProgress(next);
      return next;
    });
  }, []);

  const getLessonProgress = useCallback(
    (lessonId: string): LessonProgress => {
      return progress.lessons[lessonId] ?? { completed: false, stars: 0 };
    },
    [progress],
  );

  const resetProgress = useCallback(async () => {
    setProgress(defaultState);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return (
    <ProgressContext.Provider
      value={{ progress, completeLesson, getLessonProgress, resetProgress }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  return useContext(ProgressContext);
}
