/**
 * SettingsContext: the parents' switches (voice and vibration), stored on the device.
 * lib/speech and lib/haptics are not React, so the provider mirrors each value into them.
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

import { setHapticsEnabled } from "@/lib/haptics";
import { setSpeechMuted } from "@/lib/speech";

export const SETTINGS_KEY = "@iqra_settings_v1";

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

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  haptics: true,
  introSeen: false,
  bookId: null,
  chaptersSeen: [],
};

type SettingsContextValue = {
  settings: Settings;
  /** True once the stored settings have been read (or reading failed). */
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

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const changed = useRef(false);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((raw) => {
        // A switch flipped before storage answered wins over the stored value.
        if (alive && !changed.current) setSettings(parseSettings(raw));
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setSpeechMuted(!settings.sound);
    setHapticsEnabled(settings.haptics);
  }, [settings]);

  const update = useCallback((patch: Partial<Settings>) => {
    changed.current = true;
    setSettings((current) => {
      const next = { ...current, ...patch };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(() => ({ settings, loaded, update }), [settings, loaded, update]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
