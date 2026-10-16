/**
 * ProgressContext — tracks completed lessons, earned stars and review items.
 *
 * Fully offline: progress lives in React state and is persisted to
 * AsyncStorage on the device. There is no server, login or sync.
 * The state rules live in lib/progressState.ts; this file only wires
 * them to React and storage.
 *
 * Data safety rules:
 * - Nothing is written until the stored blob has been read successfully
 *   ("hydrated"). A failed read never leads to an overwrite.
 * - A corrupt blob is copied to a backup key before it can be overwritten.
 * - All writes go through one promise chain, so the last write wins.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import {
  applyCompletion,
  applyReview,
  applyRoundResult,
  createEmptyState,
  mergeProgress,
  needsUpgrade,
  unitProgress,
  upgradeState,
  type LessonProgress,
  type ProgressState,
  type UnitProgress,
} from "@/lib/progressState";
import { pickDue } from "@/lib/srs";

export type { LessonProgress, ProgressItem, ProgressState, UnitProgress } from "@/lib/progressState";

// ─── AsyncStorage keys ────────────────────────────────────────────────────────

// Legacy name kept on purpose: renaming the key would wipe existing progress.
// The blob itself carries `version: 2` since the schema upgrade.
const STORAGE_KEY = "@kidlearn_progress_v1";
const CORRUPT_BACKUP_PREFIX = "@kidlearn_progress_corrupt_";
const RETRY_DELAY_MS = 300;

// ─── Types ────────────────────────────────────────────────────────────────────

/** Lesson lookup result; completedAt is absent for lessons never completed. */
export type LessonStatus = Omit<LessonProgress, "completedAt"> & { completedAt?: string };

type ProgressContextValue = {
  progress: ProgressState;
  /** Updates state synchronously; persistence happens asynchronously afterwards. */
  completeLesson: (lessonId: string, stars: number) => void;
  getLessonProgress: (lessonId: string) => LessonStatus;
  getUnitProgress: (lessonIds: string[]) => UnitProgress;
  /** Records one answered lesson round for an item; synchronous like completeLesson. */
  recordRoundResult: (itemId: string, correct: boolean) => void;
  /** Records one answer in a review session; synchronous like completeLesson. */
  recordReview: (itemId: string, correct: boolean) => void;
  /** Ids of items due at `now` (default: the current time), in review order. */
  getDueItemIds: (now?: Date) => string[];
  /** Resolves once the stored blob has been removed. */
  resetProgress: () => Promise<void>;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

const notCompleted: LessonStatus = { completed: false, stars: 0 };

const ProgressContext = createContext<ProgressContextValue>({
  progress: createEmptyState(),
  completeLesson: () => {},
  getLessonProgress: () => notCompleted,
  getUnitProgress: (lessonIds) => ({ done: 0, total: lessonIds.length, stars: 0 }),
  recordRoundResult: () => {},
  recordReview: () => {},
  getDueItemIds: () => [],
  resetProgress: async () => {},
});

// ─── Storage ──────────────────────────────────────────────────────────────────

type LoadResult =
  | { kind: "missing" }
  | { kind: "ok"; state: ProgressState; upgraded: boolean }
  | { kind: "corrupt"; raw: string }
  | { kind: "error" };

async function loadLocalProgress(): Promise<LoadResult> {
  let json: string | null;
  try {
    json = await AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    return { kind: "error" };
  }
  if (json == null) return { kind: "missing" };
  try {
    const raw: unknown = JSON.parse(json);
    return { kind: "ok", state: upgradeState(raw), upgraded: needsUpgrade(raw) };
  } catch {
    return { kind: "corrupt", raw: json };
  }
}

function warn(message: string, err: unknown) {
  if (__DEV__) console.warn(`[progress] ${message}`, err);
}

// One chain for every write, so writes land in the order they were requested.
let writeQueue: Promise<void> = Promise.resolve();

function enqueueWrite(label: string, write: () => Promise<void>): Promise<void> {
  writeQueue = writeQueue.then(write).catch((err) => warn(`${label} failed`, err));
  return writeQueue;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

type State = {
  progress: ProgressState;
  /** True once storage was read successfully; nothing is persisted before. */
  hydrated: boolean;
  /** A reset happened before hydration: the stored state must be discarded. */
  resetPending: boolean;
  /** Whether the current progress should be written; false right after a reset (the blob was removed). */
  dirty: boolean;
};

type Action =
  | { type: "LOADED"; stored: ProgressState }
  | { type: "COMPLETE"; lessonId: string; stars: number; now: Date }
  | { type: "ROUND_RESULT"; itemId: string; correct: boolean; now: Date }
  | { type: "REVIEW"; itemId: string; correct: boolean; now: Date }
  | { type: "RESET" };

const initialState: State = {
  progress: createEmptyState(),
  hydrated: false,
  resetPending: false,
  dirty: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOADED": {
      if (state.hydrated) return state;
      // After an early reset, keep only what happened since the reset.
      const base = state.resetPending ? createEmptyState() : action.stored;
      const progress = mergeProgress(base, state.progress);
      const dirty = !state.resetPending || state.dirty;
      return { progress, hydrated: true, resetPending: false, dirty };
    }
    case "COMPLETE":
      return {
        ...state,
        progress: applyCompletion(state.progress, action.lessonId, action.stars, action.now),
        dirty: true,
      };
    case "ROUND_RESULT":
      return {
        ...state,
        progress: applyRoundResult(state.progress, action.itemId, action.correct, action.now),
        dirty: true,
      };
    case "REVIEW":
      return {
        ...state,
        progress: applyReview(state.progress, action.itemId, action.correct, action.now),
        dirty: true,
      };
    case "RESET":
      return {
        progress: createEmptyState(),
        hydrated: state.hydrated,
        resetPending: !state.hydrated,
        dirty: false,
      };
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [{ progress, hydrated, dirty }, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const hydrate = async (attempt: number) => {
      const result = await loadLocalProgress();
      if (cancelled) return;
      switch (result.kind) {
        case "missing":
          dispatch({ type: "LOADED", stored: createEmptyState() });
          return;
        case "ok":
          // The LOADED save below also rewrites an upgraded v1 blob as v2.
          dispatch({ type: "LOADED", stored: result.state });
          return;
        case "corrupt": {
          const backupKey = `${CORRUPT_BACKUP_PREFIX}${Date.now()}`;
          try {
            await AsyncStorage.setItem(backupKey, result.raw);
          } catch (err) {
            // Without a backup, stay unhydrated so the corrupt blob is not overwritten.
            warn("corrupt progress backup failed", err);
            return;
          }
          if (!cancelled) dispatch({ type: "LOADED", stored: createEmptyState() });
          return;
        }
        case "error":
          // Keep working in memory without persisting; retry once, a later
          // successful read merges the stored progress in.
          if (attempt === 0) retryTimer = setTimeout(() => void hydrate(1), RETRY_DELAY_MS);
          return;
      }
    };

    void hydrate(0);
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !dirty) return;
    void enqueueWrite("save", () => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress)));
  }, [progress, hydrated, dirty]);

  const completeLesson = useCallback((lessonId: string, stars: number) => {
    dispatch({ type: "COMPLETE", lessonId, stars, now: new Date() });
  }, []);

  const recordRoundResult = useCallback((itemId: string, correct: boolean) => {
    dispatch({ type: "ROUND_RESULT", itemId, correct, now: new Date() });
  }, []);

  const recordReview = useCallback((itemId: string, correct: boolean) => {
    dispatch({ type: "REVIEW", itemId, correct, now: new Date() });
  }, []);

  const getDueItemIds = useCallback(
    (now: Date = new Date()): string[] => pickDue(progress.items, now),
    [progress],
  );

  const getLessonProgress = useCallback(
    (lessonId: string): LessonStatus => progress.lessons[lessonId] ?? notCompleted,
    [progress],
  );

  const getUnitProgress = useCallback(
    (lessonIds: string[]): UnitProgress => unitProgress(progress, lessonIds),
    [progress],
  );

  const resetProgress = useCallback(() => {
    dispatch({ type: "RESET" });
    return enqueueWrite("reset", () => AsyncStorage.removeItem(STORAGE_KEY));
  }, []);

  const value = useMemo(
    () => ({
      progress,
      completeLesson,
      getLessonProgress,
      getUnitProgress,
      recordRoundResult,
      recordReview,
      getDueItemIds,
      resetProgress,
    }),
    [
      progress,
      completeLesson,
      getLessonProgress,
      getUnitProgress,
      recordRoundResult,
      recordReview,
      getDueItemIds,
      resetProgress,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  return useContext(ProgressContext);
}
