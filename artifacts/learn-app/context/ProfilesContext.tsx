/**
 * ProfilesContext: the children who learn on this phone, the active child and the parents' PIN
 * (docs/KINDERPROFILE.md). Stored only on the phone; the rules live in lib/profiles.ts.
 *
 * Data safety, as in ProgressContext: the profile list is written only after it was read (or
 * found missing). If it cannot be read, the app works with one profile in memory and writes
 * nothing, so a passing read error never wipes the list of children.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  PROFILES_KEY,
  activeProfile,
  addProfile,
  checkPin,
  createDefaultProfiles,
  makePin,
  newProfileId,
  parseProfiles,
  profileStorageKeys,
  progressKey,
  removeProfile,
  setActiveProfile,
  setPin as withPin,
  updateProfile,
  type AvatarId,
  type Profile,
  type ProfilesState,
} from "@/lib/profiles";
import { enqueueWrite } from "@/lib/storageQueue";

type ProfilesContextValue = {
  /** True once the stored list has been read (or reading failed). */
  loaded: boolean;
  profiles: Profile[];
  active: Profile;
  /** A child has been chosen this session, or there is only one: no need to ask who learns. */
  chosen: boolean;
  hasPin: boolean;
  /** When the PIN was set or last changed (ISO), so parents notice a change they did not make. */
  pinChangedAt: string | null;
  choose: (id: string) => void;
  /** Adds a child and returns its id, or null when the phone is full or the picture taken. */
  add: (input: { name: string; avatar: AvatarId }) => string | null;
  update: (id: string, patch: { name?: string; avatar?: AvatarId }) => void;
  /** Removes a child and everything stored for it. The last child cannot be removed. */
  remove: (id: string) => Promise<void>;
  /** Removes a child's lessons and stars that are not loaded now (the active child resets via useProgress). */
  removeStoredProgress: (id: string) => Promise<void>;
  setPin: (pin: string) => void;
  checkPin: (pin: string) => boolean;
};

const DEFAULT_STATE = createDefaultProfiles(new Date(0));

// Without a provider (tests, isolated screens): one child, already chosen, nothing stored.
const ProfilesContext = createContext<ProfilesContextValue>({
  loaded: true,
  profiles: DEFAULT_STATE.profiles,
  active: DEFAULT_STATE.profiles[0],
  chosen: true,
  hasPin: false,
  pinChangedAt: null,
  choose: () => {},
  add: () => null,
  update: () => {},
  remove: async () => {},
  removeStoredProgress: async () => {},
  setPin: () => {},
  checkPin: () => false,
});

type Loaded = { state: ProfilesState; writable: boolean };

async function loadProfiles(): Promise<Loaded> {
  let json: string | null;
  try {
    json = await AsyncStorage.getItem(PROFILES_KEY);
  } catch {
    return { state: createDefaultProfiles(), writable: false };
  }
  if (json == null) return { state: createDefaultProfiles(), writable: true };
  try {
    const parsed = parseProfiles(JSON.parse(json));
    if (parsed) return { state: parsed, writable: true };
  } catch {
    // Not JSON: handled below like an unknown shape.
  }
  // Unknown content: keep it, work with one profile in memory.
  return { state: createDefaultProfiles(), writable: false };
}

export function ProfilesProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Loaded | null>(null);
  const [chosenThisSession, setChosenThisSession] = useState(false);

  useEffect(() => {
    let alive = true;
    void loadProfiles().then((loaded) => {
      if (alive) setStore(loaded);
    });
    return () => {
      alive = false;
    };
  }, []);

  /** Applies a rule to the state and stores the result. */
  const change = useCallback((rule: (state: ProfilesState) => ProfilesState) => {
    setStore((current) => {
      if (!current) return current;
      const next = rule(current.state);
      if (next === current.state) return current;
      if (current.writable)
        void enqueueWrite("profiles", () =>
          AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(next)),
        );
      return { ...current, state: next };
    });
  }, []);

  const choose = useCallback(
    (id: string) => {
      change((state) => setActiveProfile(state, id));
      setChosenThisSession(true);
    },
    [change],
  );

  const add = useCallback(
    (input: { name: string; avatar: AvatarId }) => {
      if (!store) return null;
      const id = newProfileId();
      const next = addProfile(store.state, input, id);
      if (next === store.state) return null;
      change((state) => addProfile(state, input, id));
      return id;
    },
    [change, store],
  );

  const update = useCallback(
    (id: string, patch: { name?: string; avatar?: AvatarId }) =>
      change((state) => updateProfile(state, id, patch)),
    [change],
  );

  const remove = useCallback(
    (id: string) => {
      if (!store || removeProfile(store.state, id) === store.state) return Promise.resolve();
      change((state) => removeProfile(state, id));
      // Queued after any pending save of this child, so nothing of it is written back.
      return enqueueWrite("remove child", () => AsyncStorage.multiRemove(profileStorageKeys(id)));
    },
    [change, store],
  );

  const removeStoredProgress = useCallback(
    (id: string) => enqueueWrite("reset child", () => AsyncStorage.removeItem(progressKey(id))),
    [],
  );

  const setPin = useCallback(
    (pin: string) => change((state) => withPin(state, makePin(pin))),
    [change],
  );

  const value = useMemo((): ProfilesContextValue | null => {
    if (!store) return null;
    const { state } = store;
    return {
      loaded: true,
      profiles: state.profiles,
      active: activeProfile(state),
      chosen: chosenThisSession || state.profiles.length < 2,
      hasPin: state.pin !== null,
      pinChangedAt: state.pin?.changedAt ?? null,
      choose,
      add,
      update,
      remove,
      removeStoredProgress,
      setPin,
      checkPin: (pin: string) => checkPin(state.pin, pin),
    };
  }, [store, chosenThisSession, choose, add, update, remove, removeStoredProgress, setPin]);

  // Settings and progress belong to a child: nothing below renders before it is known whose.
  if (!value) return null;
  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>;
}

export function useProfiles(): ProfilesContextValue {
  return useContext(ProfilesContext);
}
