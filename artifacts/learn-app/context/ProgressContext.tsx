/**
 * ProgressContext: tracks completed lessons, earned stars and review items.
 *
 * Fully offline: progress lives in React state and is persisted to
 * AsyncStorage on the device. There is no server, login or sync.
 * Each child on the phone has its own progress (context/ProfilesContext.tsx);
 * switching the child loads that child's progress.
 * The state rules live in lib/progressState.ts; this file only wires
 * them to React and storage.
 *
 * Data safety rules:
 * - Nothing is written until the stored blob has been read successfully
 *   ("hydrated"). A failed read never leads to an overwrite.
 * - A corrupt blob is copied to a backup key before it can be overwritten.
 * - All writes go through one promise chain, so the last write wins.
 * - Every write first re-reads the stored blob and merges it in (mergeProgress), and the
 *   storage events of other tabs are folded in: two tabs of the app (a parent who opens the
 *   shared link again) can no longer erase each other's lessons.
 * - The state remembers whose progress it is (its storage key), and is only
 *   ever written to that key, so one child's stars never land with another.
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
import { useProfiles } from "@/context/ProfilesContext";
import { todayKey } from "@/lib/dates";
import { progressKey } from "@/lib/profiles";
import { allItems } from "@/lib/reviewItems";
import { pickDue } from "@/lib/srs";
import { enqueueWrite } from "@/lib/storageQueue";

export type {
  LessonProgress,
  ProgressItem,
  ProgressState,
  UnitProgress,
} from "@/lib/progressState";

// ─── AsyncStorage keys ────────────────────────────────────────────────────────

// The first child keeps the legacy key "@kidlearn_progress_v1" (lib/profiles.ts progressKey):
// renaming it would wipe existing progress. The blob carries `version: 2` since the schema upgrade.
const CORRUPT_BACKUP_PREFIX = "@kidlearn_progress_corrupt_";
const RETRY_DELAY_MS = 300;

// ─── Types ────────────────────────────────────────────────────────────────────

/** Lesson lookup result; completedAt is absent for lessons never completed. */
export type LessonStatus = Omit<LessonProgress, "completedAt"> & { completedAt?: string };

type ProgressContextValue = {
  progress: ProgressState;
  /** True once the stored progress has been read; before that, progress is only what happened this session. */
  hydrated: boolean;
  /** True once loading has finished, successfully or not (a failed load leaves `hydrated` false). */
  loadSettled: boolean;
  /** The last save failed (e.g. the phone's storage is full): stars shown are not kept. */
  saveFailed: boolean;
  /** Updates state synchronously; persistence happens asynchronously afterwards. */
  completeLesson: (lessonId: string, stars: number) => void;
  getLessonProgress: (lessonId: string) => LessonStatus;
  getUnitProgress: (lessonIds: string[]) => UnitProgress;
  /** Records one answered lesson round for an item; synchronous like completeLesson. */
  recordRoundResult: (itemId: string, correct: boolean) => void;
  /** Records one answer in a review session; synchronous like completeLesson. */
  recordReview: (itemId: string, correct: boolean) => void;
  /**
   * Ids of items due at `now` (default: the current time), in review order.
   * Memoised per items and local day, so the same array comes back until the
   * items change. The day is read at call time: a render caller sees a new day
   * on the next state change or re-render (e.g. app foreground).
   */
  getDueItemIds: (now?: Date) => string[];
  /** Resolves once the stored blob has been removed. */
  resetProgress: () => Promise<void>;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

const notCompleted: LessonStatus = { completed: false, stars: 0 };

const ProgressContext = createContext<ProgressContextValue>({
  progress: createEmptyState(),
  hydrated: false,
  // Without a provider (isolated screens in tests) there is nothing to wait for.
  loadSettled: true,
  saveFailed: false,
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

async function loadLocalProgress(key: string): Promise<LoadResult> {
  let json: string | null;
  try {
    json = await AsyncStorage.getItem(key);
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

// ─── Reducer ──────────────────────────────────────────────────────────────────

type State = {
  /** Whose progress this is: the storage key it was read from and is written to. */
  key: string;
  progress: ProgressState;
  /** True once storage was read successfully; nothing is persisted before. */
  hydrated: boolean;
  /** A reset happened before hydration: the stored state must be discarded. */
  resetPending: boolean;
  /** Whether the current progress should be written; false right after a reset (the blob was removed). */
  dirty: boolean;
  /** Loading has finished, successfully or not. */
  loadSettled: boolean;
  /** The last save failed (e.g. storage full): what the child sees is not stored. */
  saveFailed: boolean;
};

type Action =
  | { type: "SWITCH"; key: string }
  | { type: "LOADED"; key: string; stored: ProgressState }
  | { type: "SETTLED"; key: string }
  | { type: "COMPLETE"; lessonId: string; stars: number; now: Date }
  | { type: "ROUND_RESULT"; itemId: string; correct: boolean; now: Date }
  | { type: "REVIEW"; itemId: string; correct: boolean; now: Date }
  | { type: "RESET" }
  /** Another copy of this child's progress (stored by another tab, or found while saving). */
  | { type: "SYNCED"; key: string; stored: ProgressState }
  /** Another tab removed this child's progress (reset in the parents' corner). */
  | { type: "CLEARED"; key: string }
  | { type: "SAVE_RESULT"; key: string; failed: boolean };

function initialState(key: string): State {
  return {
    key,
    progress: createEmptyState(),
    hydrated: false,
    resetPending: false,
    dirty: false,
    loadSettled: false,
    saveFailed: false,
  };
}

/** Whether two copies of the progress hold the same lessons, items, days and stars. */
const sameProgress = (a: ProgressState, b: ProgressState) =>
  a === b || JSON.stringify(a) === JSON.stringify(b);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SWITCH":
      return action.key === state.key ? state : initialState(action.key);
    case "SETTLED":
      return action.key === state.key ? { ...state, loadSettled: true } : state;
    case "LOADED": {
      // A load for another child (switched meanwhile) is dropped.
      if (state.hydrated || action.key !== state.key) return state;
      // After an early reset, keep only what happened since the reset.
      const base = state.resetPending ? createEmptyState() : action.stored;
      const progress = mergeProgress(base, state.progress);
      const dirty = !state.resetPending || state.dirty;
      return { ...state, progress, hydrated: true, resetPending: false, dirty };
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
    case "SYNCED": {
      // Before hydration the load merges the stored progress anyway.
      if (action.key !== state.key || !state.hydrated) return state;
      const progress = mergeProgress(action.stored, state.progress);
      if (sameProgress(progress, state.progress)) return state;
      // What came in is already stored; anything of ours not yet written has its save queued.
      return { ...state, progress };
    }
    case "CLEARED":
      if (action.key !== state.key || !state.hydrated) return state;
      return { ...state, progress: createEmptyState(), dirty: false };
    case "SAVE_RESULT":
      if (action.key !== state.key || action.failed === state.saveFailed) return state;
      return { ...state, saveFailed: action.failed };
    case "RESET":
      return {
        ...state,
        progress: createEmptyState(),
        hydrated: state.hydrated,
        resetPending: !state.hydrated,
        dirty: false,
      };
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { active } = useProfiles();
  const storageKey = progressKey(active.id);
  const [state, dispatch] = useReducer(reducer, storageKey, initialState);
  // Right after a switch, until the reducer has caught up, the old child's progress is not shown.
  const current = state.key === storageKey ? state : initialState(storageKey);
  const { progress, hydrated, loadSettled, saveFailed } = current;

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const key = storageKey;
    dispatch({ type: "SWITCH", key });

    const hydrate = async (attempt: number) => {
      const result = await loadLocalProgress(key);
      if (cancelled) return;
      switch (result.kind) {
        case "missing":
          dispatch({ type: "LOADED", key, stored: createEmptyState() });
          break;
        case "ok":
          // The LOADED save below also rewrites an upgraded v1 blob as v2.
          dispatch({ type: "LOADED", key, stored: result.state });
          break;
        case "corrupt": {
          const backupKey = `${CORRUPT_BACKUP_PREFIX}${Date.now()}`;
          try {
            await AsyncStorage.setItem(backupKey, result.raw);
          } catch (err) {
            // Without a backup, stay unhydrated so the corrupt blob is not overwritten.
            warn("corrupt progress backup failed", err);
            break;
          }
          if (cancelled) return;
          dispatch({ type: "LOADED", key, stored: createEmptyState() });
          break;
        }
        case "error":
          // Keep working in memory without persisting; retry once, a later
          // successful read merges the stored progress in.
          if (attempt === 0) {
            retryTimer = setTimeout(() => void hydrate(1), RETRY_DELAY_MS);
            return;
          }
          break;
      }
      // Loading is over, whether or not it hydrated.
      if (!cancelled) dispatch({ type: "SETTLED", key });
    };

    void hydrate(0);
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [storageKey]);

  // Another tab of the app wrote or removed this child's progress (web only): fold it in.
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.addEventListener !== "function") return;
    const key = storageKey;
    const onStorage = (event: StorageEvent) => {
      // `key` is null when the other tab cleared all storage.
      if (event.key !== null && event.key !== key) return;
      if (event.key === null || event.newValue === null) {
        dispatch({ type: "CLEARED", key });
        return;
      }
      try {
        dispatch({ type: "SYNCED", key, stored: upgradeState(JSON.parse(event.newValue)) });
      } catch {
        // An unreadable value is left for the next load (with its backup).
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey]);

  // Written to the key stored with the progress, never to the key of the child shown next.
  // The stored blob is read and merged in first: another tab may have saved lessons since.
  const { key: savedKey, progress: toSave, hydrated: canSave, dirty } = state;
  useEffect(() => {
    if (!canSave || !dirty) return;
    void enqueueWrite("save", async () => {
      let merged = toSave;
      try {
        const json = await AsyncStorage.getItem(savedKey);
        if (json != null) merged = mergeProgress(upgradeState(JSON.parse(json)), toSave);
      } catch {
        // Unreadable: write ours (a corrupt blob was backed up when it was loaded).
      }
      try {
        await AsyncStorage.setItem(savedKey, JSON.stringify(merged));
      } catch (err) {
        dispatch({ type: "SAVE_RESULT", key: savedKey, failed: true });
        throw err;
      }
      dispatch({ type: "SAVE_RESULT", key: savedKey, failed: false });
      if (merged !== toSave) dispatch({ type: "SYNCED", key: savedKey, stored: merged });
    });
  }, [savedKey, toSave, canSave, dirty]);

  const completeLesson = useCallback((lessonId: string, stars: number) => {
    dispatch({ type: "COMPLETE", lessonId, stars, now: new Date() });
  }, []);

  const recordRoundResult = useCallback((itemId: string, correct: boolean) => {
    dispatch({ type: "ROUND_RESULT", itemId, correct, now: new Date() });
  }, []);

  const recordReview = useCallback((itemId: string, correct: boolean) => {
    dispatch({ type: "REVIEW", itemId, correct, now: new Date() });
  }, []);

  // Due state depends only on the local day, so one list per day is exact.
  const dueCache = useMemo(
    () => ({ items: progress.items, byDay: new Map<string, string[]>() }),
    [progress.items],
  );

  const getDueItemIds = useCallback(
    (now: Date = new Date()): string[] => {
      const day = todayKey(now);
      let ids = dueCache.byDay.get(day);
      if (!ids) {
        ids = pickDue(dueCache.items, now, 10, allItems());
        dueCache.byDay.set(day, ids);
      }
      return ids;
    },
    [dueCache],
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
    return enqueueWrite("reset", () => AsyncStorage.removeItem(storageKey));
  }, [storageKey]);

  const value = useMemo(
    () => ({
      progress,
      hydrated,
      loadSettled,
      saveFailed,
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
      hydrated,
      loadSettled,
      saveFailed,
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
