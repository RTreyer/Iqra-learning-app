/**
 * ProgressContext — tracks completed lessons and earned stars.
 *
 * Storage layers (offline-first priority order):
 *  1. React state — in-memory, instant reads
 *  2. AsyncStorage — per-account, persists across app restarts
 *  3. API server — synced on login / connectivity; server keeps highest stars
 *
 * Account isolation:
 *  All AsyncStorage keys are scoped by userId so that switching accounts on
 *  the same device never mixes one user's progress into another's.
 *
 * Sync invariants:
 *  - Remote merge only runs after we know the authenticated userId
 *  - Remote merge is bidirectional: server→local AND local→server (highest wins)
 *  - Failed POSTs are queued in the user-scoped AsyncStorage key and retried
 *    on the next syncFromServer call (never silently lost)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

// ─── AsyncStorage key factories (per-account) ─────────────────────────────────

const storageKey = (userId: string) => `@kidlearn_progress_v1_${userId}`;
const pendingSyncKey = (userId: string) => `@kidlearn_pending_sync_v1_${userId}`;

/** Legacy global key used before per-account scoping was introduced. */
const LEGACY_STORAGE_KEY = "@kidlearn_progress_v1";

// ─── Types ────────────────────────────────────────────────────────────────────

type LessonProgress = {
  completed: boolean;
  stars: number;
};

type ProgressState = {
  lessons: Record<string, LessonProgress>;
  totalStars: number;
};

/** lessonId → best local star count waiting to be uploaded */
type PendingSync = Record<string, number>;

type SyncSession = {
  apiBase: string;
  token: string;
  userId: string;
};

type ProgressContextValue = {
  progress: ProgressState;
  completeLesson: (lessonId: string, stars: number) => Promise<void>;
  getLessonProgress: (lessonId: string) => LessonProgress;
  resetProgress: () => Promise<void>;
  /**
   * Called once after a successful auth with the api base URL, bearer token,
   * and the authenticated user's ID.
   *
   * - Loads the user-scoped local cache (per-account isolation)
   * - Flushes the offline retry queue
   * - Performs bidirectional merge with server (highest stars wins)
   * - Pushes locally-better entries back to server
   */
  syncFromServer: (apiBase: string, token: string, userId: string) => Promise<void>;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultState: ProgressState = { lessons: {}, totalStars: 0 };

const ProgressContext = createContext<ProgressContextValue>({
  progress: defaultState,
  completeLesson: async () => {},
  getLessonProgress: () => ({ completed: false, stars: 0 }),
  resetProgress: async () => {},
  syncFromServer: async () => {},
});

// ─── AsyncStorage helpers ─────────────────────────────────────────────────────

async function loadLocalProgress(userId: string): Promise<ProgressState> {
  try {
    const json = await AsyncStorage.getItem(storageKey(userId));
    return json ? (JSON.parse(json) as ProgressState) : defaultState;
  } catch {
    return defaultState;
  }
}

/**
 * One-time migration: if the user-scoped key is empty and the legacy global
 * key (`@kidlearn_progress_v1`) contains data, copy it to the user-scoped key
 * and delete the legacy key. This preserves progress for users upgrading from
 * the version that stored progress in a single shared bucket.
 */
async function migrateLegacyProgress(userId: string): Promise<ProgressState | null> {
  try {
    const userScopedExists = await AsyncStorage.getItem(storageKey(userId));
    if (userScopedExists !== null) return null; // already migrated

    const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return null; // nothing to migrate

    const legacyState = JSON.parse(legacy) as ProgressState;
    await AsyncStorage.setItem(storageKey(userId), legacy);
    await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
    return legacyState;
  } catch {
    return null;
  }
}

async function saveLocalProgress(userId: string, state: ProgressState): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(userId), JSON.stringify(state));
  } catch {}
}

async function loadPending(userId: string): Promise<PendingSync> {
  try {
    const json = await AsyncStorage.getItem(pendingSyncKey(userId));
    return json ? (JSON.parse(json) as PendingSync) : {};
  } catch {
    return {};
  }
}

async function savePending(userId: string, pending: PendingSync): Promise<void> {
  try {
    if (Object.keys(pending).length === 0) {
      await AsyncStorage.removeItem(pendingSyncKey(userId));
    } else {
      await AsyncStorage.setItem(pendingSyncKey(userId), JSON.stringify(pending));
    }
  } catch {}
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  // Progress starts empty — populated by syncFromServer after auth
  const [progress, setProgress] = useState<ProgressState>(defaultState);

  // Keep a stable ref to the latest progress so fire-and-forget callbacks
  // always see current state without stale closure issues.
  const progressRef = useRef<ProgressState>(defaultState);

  // Authenticated session — set by syncFromServer, used by completeLesson
  const sessionRef = useRef<SyncSession | null>(null);

  // ── Internal helpers ───────────────────────────────────────────────────────

  function applyState(next: ProgressState) {
    progressRef.current = next;
    setProgress(next);
  }

  /**
   * Attempt to upload a single lesson entry to the server.
   * Returns true on success, false on network/server failure.
   */
  const postProgress = useCallback(
    async (session: SyncSession, lessonId: string, stars: number): Promise<boolean> => {
      try {
        const res = await fetch(`${session.apiBase}/api/progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify({ lessonId, stars }),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
    [],
  );

  /**
   * Retry all queued offline completions for this user.
   * Successful uploads are removed from the queue; failures stay for next retry.
   */
  const flushPendingSync = useCallback(
    async (session: SyncSession) => {
      const pending = await loadPending(session.userId);
      if (Object.keys(pending).length === 0) return;

      const remaining: PendingSync = {};
      await Promise.all(
        Object.entries(pending).map(async ([lessonId, stars]) => {
          const ok = await postProgress(session, lessonId, stars);
          if (!ok) remaining[lessonId] = stars;
        }),
      );
      await savePending(session.userId, remaining);
    },
    [postProgress],
  );

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Bidirectional sync on login or app-start token recovery.
   *
   * Per-account: all AsyncStorage keys are scoped to userId, so switching
   * accounts never leaks one user's progress into another's.
   *
   * Order of operations:
   *  1. Load user-scoped local cache (account isolation)
   *  2. Flush offline retry queue for this user
   *  3. GET server state
   *  4. Merge: highest stars wins for every lesson
   *  5. Push local-better entries back to server (with retry on failure)
   *  6. Persist merged state to user-scoped AsyncStorage + React state
   */
  const syncFromServer = useCallback(
    async (apiBase: string, token: string, userId: string) => {
      const session: SyncSession = { apiBase, token, userId };
      sessionRef.current = session;

      // 1a. One-time legacy migration (global key → per-user key).
      //     migrateLegacyProgress returns non-null only on the first login
      //     after upgrading from an older app version; otherwise it's a no-op.
      await migrateLegacyProgress(userId);

      // 1b. Load this user's local cache (may now include migrated data)
      const localState = await loadLocalProgress(userId);
      applyState(localState);

      // 2. Flush the offline retry queue so server is up-to-date before fetch
      await flushPendingSync(session);

      // 3. Fetch server state
      let serverEntries: { lessonId: string; stars: number }[] = [];
      try {
        const res = await fetch(`${apiBase}/api/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = (await res.json()) as {
            entries: { lessonId: string; stars: number; completedAt: string }[];
          };
          serverEntries = data.entries;
        }
      } catch {
        // Offline — local state is already loaded and current, stop here
        return;
      }

      // 4. Merge: highest stars wins
      const serverMap = Object.fromEntries(
        serverEntries.map((e) => [e.lessonId, e.stars]),
      );

      // Start from the freshly loaded local state (not potentially-stale progressRef)
      const merged: ProgressState["lessons"] = { ...localState.lessons };

      for (const { lessonId, stars: serverStars } of serverEntries) {
        const localStars = merged[lessonId]?.stars ?? -1;
        if (serverStars > localStars) {
          merged[lessonId] = { completed: true, stars: serverStars };
        }
      }

      let totalStars = 0;
      for (const { stars } of Object.values(merged)) {
        totalStars += stars;
      }

      const next: ProgressState = { lessons: merged, totalStars };
      applyState(next);
      await saveLocalProgress(userId, next);

      // 5. Push local-better entries to server (fire-and-forget with retry)
      const toUpload = Object.entries(merged).filter(([lessonId, local]) => {
        const serverStars = serverMap[lessonId] ?? -1;
        return local.stars > serverStars;
      });

      await Promise.all(
        toUpload.map(async ([lessonId, { stars }]) => {
          const ok = await postProgress(session, lessonId, stars);
          if (!ok) {
            const pending = await loadPending(userId);
            pending[lessonId] = Math.max(pending[lessonId] ?? 0, stars);
            await savePending(userId, pending);
          }
        }),
      );
    },
    [flushPendingSync, postProgress],
  );

  const completeLesson = useCallback(
    async (lessonId: string, stars: number) => {
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

        progressRef.current = next;

        const session = sessionRef.current;
        if (session) {
          // Persist locally to user-scoped key
          saveLocalProgress(session.userId, next);

          // Upload to server — on failure, queue for retry
          postProgress(session, lessonId, newStars).then((ok) => {
            if (!ok) {
              loadPending(session.userId).then((pending) => {
                pending[lessonId] = Math.max(pending[lessonId] ?? 0, newStars);
                savePending(session.userId, pending);
              });
            }
          });
        }
        // If not yet authenticated, in-memory update only (app requires login
        // before lesson interaction, so this branch is not reached in practice)

        return next;
      });
    },
    [postProgress],
  );

  const getLessonProgress = useCallback(
    (lessonId: string): LessonProgress => {
      return progress.lessons[lessonId] ?? { completed: false, stars: 0 };
    },
    [progress],
  );

  const resetProgress = useCallback(async () => {
    applyState(defaultState);
    const session = sessionRef.current;
    if (session) {
      await AsyncStorage.multiRemove([
        storageKey(session.userId),
        pendingSyncKey(session.userId),
      ]);
    }
  }, []);

  return (
    <ProgressContext.Provider
      value={{ progress, completeLesson, getLessonProgress, resetProgress, syncFromServer }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  return useContext(ProgressContext);
}
