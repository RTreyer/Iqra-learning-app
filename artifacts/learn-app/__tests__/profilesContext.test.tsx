/**
 * Several children on one phone: each keeps its own lessons, stars, story and worked examples,
 * and an update from the app without profiles keeps the first child's progress where it was.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, render } from "@testing-library/react-native";
import React, { useEffect } from "react";

import { ProfilesProvider, useProfiles } from "@/context/ProfilesContext";
import { ProgressProvider, useProgress } from "@/context/ProgressContext";
import { SETTINGS_KEY, SettingsProvider, useSettings } from "@/context/SettingsContext";
import { resetDemoSeenCache, useDemoSeen } from "@/hooks/useDemoSeen";
import { PROFILES_KEY, progressKey, type ProfilesState } from "@/lib/profiles";

type Api = {
  profiles: ReturnType<typeof useProfiles>;
  progress: ReturnType<typeof useProgress>;
  settings: ReturnType<typeof useSettings>;
  demos: ReturnType<typeof useDemoSeen>;
};

let api: Api;
function Probe() {
  const value: Api = {
    profiles: useProfiles(),
    progress: useProgress(),
    settings: useSettings(),
    demos: useDemoSeen(),
  };
  useEffect(() => {
    api = value;
  });
  return null;
}

async function renderApp() {
  render(
    <ProfilesProvider>
      <SettingsProvider>
        <ProgressProvider>
          <Probe />
        </ProgressProvider>
      </SettingsProvider>
    </ProfilesProvider>,
  );
  await act(async () => {});
}

async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

const stored = async (key: string) => JSON.parse((await AsyncStorage.getItem(key)) ?? "null");

beforeEach(async () => {
  await AsyncStorage.clear();
  resetDemoSeenCache();
});

test("an update keeps the first child's progress and story under the old keys", async () => {
  const lessons = { "u1-1": { completed: true, stars: 3, completedAt: "2026-11-01T00:00:00Z" } };
  await AsyncStorage.setItem(
    "@kidlearn_progress_v1",
    JSON.stringify({ version: 2, lessons, items: {}, activity: { days: [] }, totalStars: 3 }),
  );
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ introSeen: true, bookId: "math-1" }));
  await renderApp();
  expect(api.profiles.profiles).toHaveLength(1);
  expect(api.profiles.active.id).toBe("main");
  expect(api.profiles.chosen).toBe(true);
  expect(api.progress.hydrated).toBe(true);
  expect(api.progress.progress.totalStars).toBe(3);
  expect(api.settings.settings).toMatchObject({ introSeen: true, bookId: "math-1" });
  // Nothing was moved or copied.
  expect(await AsyncStorage.getItem(PROFILES_KEY)).toBeNull();
});

test("each child keeps its own lessons and stars", async () => {
  await renderApp();
  act(() => api.progress.completeLesson("u1-1", 3));
  await settle();
  let second = "";
  act(() => {
    second = api.profiles.add({ name: "سالم", avatar: "ibex" })!;
  });
  await settle();
  expect(api.profiles.chosen).toBe(false);

  act(() => api.profiles.choose(second));
  await settle();
  expect(api.profiles.active.id).toBe(second);
  expect(api.progress.hydrated).toBe(true);
  expect(api.progress.progress.totalStars).toBe(0);
  act(() => api.progress.completeLesson("u1-2", 2));
  await settle();

  expect((await stored(progressKey("main"))).totalStars).toBe(3);
  expect((await stored(progressKey(second))).totalStars).toBe(2);
  expect(Object.keys((await stored(progressKey(second))).lessons)).toEqual(["u1-2"]);

  act(() => api.profiles.choose("main"));
  await settle();
  expect(api.progress.progress.totalStars).toBe(3);
  expect(((await stored(PROFILES_KEY)) as ProfilesState).activeId).toBe("main");
});

test("a new child hears Hudhud's story; the voice switch stays for the whole phone", async () => {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ introSeen: true, sound: false }));
  await renderApp();
  let second = "";
  act(() => {
    second = api.profiles.add({ name: "", avatar: "palm" })!;
  });
  act(() => api.profiles.choose(second));
  await settle();
  expect(api.settings.loaded).toBe(true);
  expect(api.settings.settings).toMatchObject({ introSeen: false, sound: false });

  act(() => api.settings.update({ introSeen: true, bookId: "math-1", sound: true }));
  await settle();
  expect(await stored(`${SETTINGS_KEY}:${second}`)).toEqual({
    introSeen: true,
    bookId: "math-1",
    chaptersSeen: [],
  });
  // The first child's own fields are untouched; the switch is shared.
  expect(await stored(SETTINGS_KEY)).toMatchObject({ introSeen: true, bookId: null, sound: true });

  act(() => api.profiles.choose("main"));
  await settle();
  expect(api.settings.settings).toMatchObject({ introSeen: true, bookId: null, sound: true });
});

test("each child sees the worked examples once for itself", async () => {
  await renderApp();
  await settle();
  act(() => api.demos.markSeen("letter_pick"));
  let second = "";
  act(() => {
    second = api.profiles.add({ name: "", avatar: "dhow" })!;
  });
  act(() => api.profiles.choose(second));
  await settle();
  expect(api.demos.seen?.has("letter_pick")).toBe(false);
  act(() => api.profiles.choose("main"));
  await settle();
  expect(api.demos.seen?.has("letter_pick")).toBe(true);
});

test("removing the active child switches to another and removes its progress", async () => {
  await renderApp();
  let second = "";
  act(() => {
    second = api.profiles.add({ name: "", avatar: "turtle" })!;
  });
  act(() => api.profiles.choose(second));
  await settle();
  act(() => api.progress.completeLesson("u1-1", 1));
  await settle();
  expect(await AsyncStorage.getItem(progressKey(second))).not.toBeNull();
  await act(async () => {
    await api.profiles.remove(second);
  });
  await settle();
  expect(api.profiles.active.id).toBe("main");
  expect(await AsyncStorage.getItem(progressKey(second))).toBeNull();
});

test("an unreadable profile list is kept, not overwritten", async () => {
  await AsyncStorage.setItem(PROFILES_KEY, "{not json");
  await renderApp();
  expect(api.profiles.profiles).toHaveLength(1);
  act(() => {
    api.profiles.add({ name: "", avatar: "palm" });
  });
  await settle();
  expect(await AsyncStorage.getItem(PROFILES_KEY)).toBe("{not json");
});
