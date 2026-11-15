/**
 * SettingsContext: the parents' switches (voice and vibration) for the whole phone, and what
 * belongs to the active child (Hudhud's story told, the chosen subject, the chapters told).
 * lib/speech and lib/haptics are not React, so the provider mirrors each switch into them.
 *
 * Storage: the shared blob SETTINGS_KEY holds the switches and, as before profiles existed, the
 * first child's fields. Every other child has its own blob (lib/profiles.ts childSettingsKey).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useProfiles } from "@/context/ProfilesContext";
import { setHapticsEnabled } from "@/lib/haptics";
import { FIRST_PROFILE_ID, LEGACY_SETTINGS_KEY, childSettingsKey } from "@/lib/profiles";
import { setSpeechMuted } from "@/lib/speech";

export const SETTINGS_KEY = LEGACY_SETTINGS_KEY;

export type Settings = {
  /** The voice reads instructions and praise. Off silences every spoken line. */
  sound: boolean;
  haptics: boolean;
  /** Hudhud's story has been told (app/intro.tsx); the play button then goes to lessons. */
  introSeen: boolean;
  /** The subject (book) the child chose to help with; the play button continues there. */
  bookId: string | null;
  /** Hudhud's jobs (content/story.ts CHAPTERS) already told: each is told once, first time. */
  chaptersSeen: string[];
};

/** What belongs to one child; the rest are the phone's switches. */
const CHILD_FIELDS = ["introSeen", "bookId", "chaptersSeen"] as const;
type ChildField = (typeof CHILD_FIELDS)[number];
export type ChildSettings = Pick<Settings, ChildField>;

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  haptics: true,
  introSeen: false,
  bookId: null,
  chaptersSeen: [],
};

type SettingsContextValue = {
  settings: Settings;
  /** True once the stored settings (the phone's and the active child's) have been read. */
  loaded: boolean;
  update: (patch: Partial<Settings>) => void;
};

// Without a provider (tests, isolated screens) there is nothing to load: the defaults are final.
const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  loaded: true,
  update: () => {},
});

/** Keeps only known settings of the right type from whatever was stored. */
export function parseSettings(raw: string | null): Settings {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (typeof parsed !== "object" || parsed === null) return DEFAULT_SETTINGS;
    const value = parsed as Record<string, unknown>;
    return {
      sound: typeof value.sound === "boolean" ? value.sound : DEFAULT_SETTINGS.sound,
      haptics: typeof value.haptics === "boolean" ? value.haptics : DEFAULT_SETTINGS.haptics,
      introSeen: value.introSeen === true,
      bookId: typeof value.bookId === "string" ? value.bookId : null,
      chaptersSeen: Array.isArray(value.chaptersSeen)
        ? value.chaptersSeen.filter((c): c is string => typeof c === "string")
        : [],
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function childPart(settings: Partial<Settings>): Partial<ChildSettings> {
  const out: Partial<ChildSettings> = {};
  for (const field of CHILD_FIELDS)
    if (field in settings) (out as Record<string, unknown>)[field] = settings[field];
  return out;
}

function phonePart(settings: Partial<Settings>): Partial<Settings> {
  const out: Partial<Settings> = { ...settings };
  for (const field of CHILD_FIELDS) delete out[field];
  return out;
}

function pickChild(settings: Settings): ChildSettings {
  return {
    introSeen: settings.introSeen,
    bookId: settings.bookId,
    chaptersSeen: settings.chaptersSeen,
  };
}

const isEmpty = (patch: object) => Object.keys(patch).length === 0;

/** A blob remembers whose it is (its key), so a late patch never lands with another child. */
type Store<T> = { key: string | null; value: T; loaded: boolean; pending: Partial<T>[] };

function emptyStore<T>(key: string | null, parse: (raw: string | null) => T): Store<T> {
  return { key, value: parse(null), loaded: key === null, pending: [] };
}

/**
 * One stored blob: patches made before it was read are shown at once and stored merged with
 * what was stored, so an early switch never loses the stored values.
 */
function useBlob<T extends object>(
  key: string | null,
  parse: (raw: string | null) => T,
): [T, boolean, (patch: Partial<T>) => void] {
  const [stored, setStore] = useState<Store<T>>(() => emptyStore(key, parse));
  // After a key change (another child) the blob is reloaded; until then nothing old shows.
  const store = stored.key === key ? stored : emptyStore(key, parse);
  // The key of the child shown now; a patch bound to another key is for a child not in memory.
  const shownKey = useRef(key);
  useEffect(() => {
    shownKey.current = key;
  }, [key]);

  useEffect(() => {
    if (key === null) return;
    let alive = true;
    AsyncStorage.getItem(key)
      .catch(() => null)
      .then((raw) => {
        if (!alive) return;
        setStore((latest) => {
          const current = latest.key === key ? latest : emptyStore(key, parse);
          const value = current.pending.reduce<T>(
            (acc, patch) => ({ ...acc, ...patch }),
            parse(raw),
          );
          if (current.pending.length > 0)
            AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
          return { key, value, loaded: true, pending: [] };
        });
      });
    return () => {
      alive = false;
    };
  }, [key, parse]);

  // Bound to its key: a patch always lands in the blob of the child it was made for.
  const update = useCallback(
    (patch: Partial<T>) => {
      if (key === null) return;
      if (key !== shownKey.current) {
        // Made for a child that is not the one shown any more: merge it into that child's blob.
        AsyncStorage.getItem(key)
          .catch(() => null)
          .then((raw) => AsyncStorage.setItem(key, JSON.stringify({ ...parse(raw), ...patch })))
          .catch(() => {});
        return;
      }
      setStore((latest) => {
        const current = latest.key === key ? latest : emptyStore(key, parse);
        const value = { ...current.value, ...patch };
        if (!current.loaded) return { ...current, value, pending: [...current.pending, patch] };
        AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
        return { ...current, value };
      });
    },
    [key, parse],
  );

  return [store.value, store.loaded, update];
}

function parseChild(raw: string | null): ChildSettings {
  return pickChild(parseSettings(raw));
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { active } = useProfiles();
  const first = active.id === FIRST_PROFILE_ID;
  // The shared blob: the phone's switches and the first child's fields.
  const [shared, sharedLoaded, updateShared] = useBlob<Settings>(SETTINGS_KEY, parseSettings);
  // Any other child's own blob.
  const [own, ownLoaded, updateOwn] = useBlob<ChildSettings>(
    first ? null : childSettingsKey(active.id),
    parseChild,
  );

  const settings = useMemo(
    (): Settings => (first ? shared : { ...shared, ...own }),
    [first, shared, own],
  );
  const loaded = sharedLoaded && ownLoaded;

  useEffect(() => {
    setSpeechMuted(!settings.sound);
    setHapticsEnabled(settings.haptics);
  }, [settings.sound, settings.haptics]);

  const update = useCallback(
    (patch: Partial<Settings>) => {
      if (first) return updateShared(patch);
      const phone = phonePart(patch);
      const child = childPart(patch);
      if (!isEmpty(phone)) updateShared(phone);
      if (!isEmpty(child)) updateOwn(child);
    },
    [first, updateShared, updateOwn],
  );

  const value = useMemo(() => ({ settings, loaded, update }), [settings, loaded, update]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
