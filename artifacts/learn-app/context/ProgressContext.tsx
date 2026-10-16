/**
 * ProgressContext — tracks completed lessons and earned stars.
 *
 * Fully offline: progress lives in React state and is persisted to
 * AsyncStorage on the device. There is no server, login or sync.
 * The state rules live in lib/progressState.ts; this file only wires
 * them to React and storage.
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

import {
  applyCompletion,
  createEmptyState,
  mergeProgress,
  needsUpgrade,
  unitProgress,
  upgradeState,
  type LessonProgress,
  type ProgressState,
  type UnitProgress,
} from "@/lib/progressState";

export type { LessonProgress, ProgressItem, ProgressState, UnitProgress } from "@/lib/progressState";

// ─── AsyncStorage keys ────────────────────────────────────────────────────────

// Legacy name kept on purpose: renaming the key would wipe existing progress.
// The blob itself carries `version: 2` since the schema upgrade.
const STORAGE_KEY = "@kidlearn_progress_v1";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Lesson lookup result; completedAt is absent for lessons never completed. */
export type LessonStatus = Omit<LessonProgress, "completedAt"> & { completedAt?: string };

type ProgressContextValue = {
  progress: ProgressState;
  completeLesson: (lessonId: string, stars: number) => Promise<void>;
  getLessonProgress: (lessonId: string) => LessonStatus;
  getUnitProgress: (lessonIds: string[]) => UnitProgress;
  resetProgress: () => Promise<void>;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

// Identity matters: the provider compares against this object to know whether
// anything happened before the stored state finished loading.
const initialState: ProgressState = createEmptyState();

const notCompleted: LessonStatus = { completed: false, stars: 0 };

const ProgressContext = createContext<ProgressContextValue>({
  progress: initialState,
  completeLesson: async () => {},
  getLessonProgress: () => notCompleted,
  getUnitProgress: (lessonIds) => ({ done: 0, total: lessonIds.length, stars: 0 }),
  resetProgress: async () => {},
});

// ─── AsyncStorage helpers ─────────────────────────────────────────────────────

/** Loads and upgrades the stored blob. `upgraded` means it must be written back as v2. */
async function loadLocalProgress(): Promise<{ state: ProgressState; upgraded: boolean }> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return { state: createEmptyState(), upgraded: false };
    const raw: unknown = JSON.parse(json);
    return { state: upgradeState(raw), upgraded: needsUpgrade(raw) };
  } catch {
    return { state: createEmptyState(), upgraded: false };
  }
}

async function saveLocalProgress(state: ProgressState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(initialState);

  // Lessons completed before the stored state finished loading are merged in
  // once it arrives, so nothing is overwritten by the initial load.
  const loadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadLocalProgress().then(({ state: stored, upgraded }) => {
      if (cancelled) return;
      loadedRef.current = true;
      setProgress((current) => {
        const changedBeforeLoad = current !== initialState;
        const next = changedBeforeLoad ? mergeProgress(stored, current) : stored;
        if (changedBeforeLoad || upgraded) saveLocalProgress(next);
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const completeLesson = useCallback(async (lessonId: string, stars: number) => {
    setProgress((prev) => {
      const next = applyCompletion(prev, lessonId, stars, new Date());
      if (loadedRef.current) saveLocalProgress(next);
      return next;
    });
  }, []);

  const getLessonProgress = useCallback(
    (lessonId: string): LessonStatus => progress.lessons[lessonId] ?? notCompleted,
    [progress],
  );

  const getUnitProgress = useCallback(
    (lessonIds: string[]): UnitProgress => unitProgress(progress, lessonIds),
    [progress],
  );

  const resetProgress = useCallback(async () => {
    setProgress(createEmptyState());
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return (
    <ProgressContext.Provider
      value={{ progress, completeLesson, getLessonProgress, getUnitProgress, resetProgress }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  return useContext(ProgressContext);
}
