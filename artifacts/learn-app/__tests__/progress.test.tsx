import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import { ProgressProvider, useProgress } from "@/context/ProgressContext";

const KEY = "@kidlearn_progress_v1";
const V1_BLOB = JSON.stringify({ lessons: { old: { completed: true, stars: 2 } }, totalStars: 2 });

const getItem = AsyncStorage.getItem as jest.Mock;
const setItem = AsyncStorage.setItem as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ProgressProvider>{children}</ProgressProvider>
);

async function stored() {
  const json = await AsyncStorage.getItem(KEY);
  return json ? JSON.parse(json) : null;
}

/** Renders the hook and waits until the provider has hydrated and written to storage. */
async function renderLoaded() {
  const hook = renderHook(() => useProgress(), { wrapper });
  await waitFor(() => expect(setItem).toHaveBeenCalledWith(KEY, expect.any(String)));
  return hook;
}

/**
 * Makes the next getItem read storage immediately (like a read already in
 * flight) but resolve only when the returned release function is called.
 */
function gateNextRead() {
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const realImpl = getItem.getMockImplementation();
  getItem.mockImplementationOnce(async (key: string) => {
    const value = realImpl ? await realImpl(key) : null;
    await gate;
    return value;
  });
  return release;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe("ProgressContext", () => {
  it("keeps the best stars: 2 then 3 gives 3", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.completeLesson("a", 2));
    act(() => result.current.completeLesson("a", 3));
    expect(result.current.getLessonProgress("a").stars).toBe(3);
    expect(result.current.progress.totalStars).toBe(3);
    await waitFor(async () => expect((await stored()).lessons.a.stars).toBe(3));
  });

  it("keeps the best stars: 3 then 1 gives 3", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.completeLesson("a", 3));
    act(() => result.current.completeLesson("a", 1));
    expect(result.current.getLessonProgress("a").stars).toBe(3);
    expect(result.current.progress.totalStars).toBe(3);
    await waitFor(async () => expect((await stored()).lessons.a.stars).toBe(3));
  });

  it("keeps a completion made before storage finishes loading", async () => {
    await AsyncStorage.setItem(KEY, V1_BLOB);
    const release = gateNextRead();

    const { result } = renderHook(() => useProgress(), { wrapper });
    act(() => result.current.completeLesson("new", 3));
    await act(async () => release());

    await waitFor(() => expect(result.current.getLessonProgress("old").stars).toBe(2));
    expect(result.current.getLessonProgress("new").stars).toBe(3);
    expect(result.current.progress.totalStars).toBe(5);
    await waitFor(async () => {
      const s = await stored();
      expect(s.version).toBe(2);
      expect(s.lessons.new.stars).toBe(3);
      expect(s.lessons.old.stars).toBe(2);
    });
  });

  it("restores state after a reload", async () => {
    const first = await renderLoaded();
    act(() => first.result.current.completeLesson("a", 2));
    await waitFor(async () => expect((await stored())?.lessons.a.stars).toBe(2));
    first.unmount();

    const { result } = renderHook(() => useProgress(), { wrapper });
    await waitFor(() => expect(result.current.getLessonProgress("a").stars).toBe(2));
    expect(result.current.progress.totalStars).toBe(2);
    expect(result.current.progress.activity.days).toHaveLength(1);
  });

  it("loads a v1 blob and rewrites it as v2 with stars intact", async () => {
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify({
        lessons: { a: { completed: true, stars: 3 }, b: { completed: true, stars: 1 } },
        totalStars: 4,
      }),
    );
    const { result } = renderHook(() => useProgress(), { wrapper });
    await waitFor(() => expect(result.current.progress.totalStars).toBe(4));
    await waitFor(async () => {
      const s = await stored();
      expect(s.version).toBe(2);
      expect(s.items).toEqual({});
      expect(s.activity).toEqual({ days: [] });
      expect(s.lessons.a.stars).toBe(3);
      expect(s.lessons.b.stars).toBe(1);
      expect(typeof s.lessons.a.completedAt).toBe("string");
      expect(s.totalStars).toBe(4);
    });
  });

  it("getUnitProgress reports done, total and stars for a unit", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.completeLesson("a", 3));
    act(() => result.current.completeLesson("b", 1));
    expect(result.current.getUnitProgress(["a", "b", "c"])).toEqual({
      done: 2,
      total: 3,
      stars: 4,
    });
  });

  it("does not overwrite stored progress after a read error, then merges on retry", async () => {
    await AsyncStorage.setItem(KEY, V1_BLOB);
    setItem.mockClear();
    getItem.mockRejectedValueOnce(new Error("database is locked"));

    const { result } = renderHook(() => useProgress(), { wrapper });
    await waitFor(() => expect(getItem).toHaveBeenCalledTimes(1));
    act(() => result.current.completeLesson("new", 3));
    expect(result.current.getLessonProgress("new").stars).toBe(3);
    expect(setItem).not.toHaveBeenCalled();
    expect(await AsyncStorage.getItem(KEY)).toBe(V1_BLOB);

    await waitFor(() => expect(result.current.getLessonProgress("old").stars).toBe(2));
    expect(result.current.getLessonProgress("new").stars).toBe(3);
    await waitFor(async () => {
      const s = await stored();
      expect(s.lessons.old.stars).toBe(2);
      expect(s.lessons.new.stars).toBe(3);
    });
  });

  it("backs up a corrupt blob before overwriting it", async () => {
    await AsyncStorage.setItem(KEY, "{not json");
    const { result } = await renderLoaded();
    const keys = await AsyncStorage.getAllKeys();
    const backupKey = keys.find((k) => k.startsWith("@kidlearn_progress_corrupt_"));
    expect(backupKey).toBeDefined();
    expect(await AsyncStorage.getItem(backupKey as string)).toBe("{not json");

    act(() => result.current.completeLesson("a", 2));
    await waitFor(async () => expect((await stored())?.lessons.a.stars).toBe(2));
  });

  it("a reset before the load resolves discards the stored progress", async () => {
    await AsyncStorage.setItem(KEY, V1_BLOB);
    const release = gateNextRead();

    const { result } = renderHook(() => useProgress(), { wrapper });
    await act(async () => {
      await result.current.resetProgress();
    });
    act(() => result.current.completeLesson("new", 1));
    await act(async () => release());

    await waitFor(async () => expect((await stored())?.lessons.new.stars).toBe(1));
    expect(result.current.getLessonProgress("old").completed).toBe(false);
    expect(result.current.progress.totalStars).toBe(1);
    expect((await stored()).lessons.old).toBeUndefined();
  });

  it("a reset before the load resolves leaves storage empty", async () => {
    await AsyncStorage.setItem(KEY, V1_BLOB);
    const release = gateNextRead();

    const { result } = renderHook(() => useProgress(), { wrapper });
    await act(async () => {
      await result.current.resetProgress();
    });
    await act(async () => release());

    await waitFor(() => expect(getItem).toHaveBeenCalledWith(KEY));
    await waitFor(async () => expect(await AsyncStorage.getItem(KEY)).toBeNull());
    expect(result.current.progress.totalStars).toBe(0);
  });

  it("reset after load clears memory and storage", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.completeLesson("a", 3));
    await waitFor(async () => expect((await stored())?.lessons.a.stars).toBe(3));
    await act(async () => {
      await result.current.resetProgress();
    });
    expect(result.current.progress.totalStars).toBe(0);
    expect(await AsyncStorage.getItem(KEY)).toBeNull();
  });

  it("recordRoundResult introduces, then reviews, and persists items", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.recordRoundResult("letter:ب", false));
    expect(result.current.progress.items["letter:ب"]).toMatchObject({ box: 1, lapses: 0 });
    act(() => result.current.recordRoundResult("letter:ب", true));
    expect(result.current.progress.items["letter:ب"].box).toBe(2);
    expect(result.current.progress.activity.days).toHaveLength(1);
    await waitFor(async () => expect((await stored())?.items["letter:ب"]?.box).toBe(2));
  });

  it("recordReview moves the box and resets on a wrong answer", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.recordReview("word:x", true));
    expect(result.current.progress.items["word:x"].box).toBe(2);
    act(() => result.current.recordReview("word:x", false));
    expect(result.current.progress.items["word:x"]).toMatchObject({ box: 1, lapses: 1 });
    await waitFor(async () => expect((await stored())?.items["word:x"]?.lapses).toBe(1));
  });

  it("getDueItemIds lists items due at the given time", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.recordRoundResult("count:3", true));
    expect(result.current.getDueItemIds()).toEqual([]);
    const later = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    expect(result.current.getDueItemIds(later)).toEqual(["count:3"]);
  });

  it("a reset before the load resolves keeps only items recorded since", async () => {
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify({
        version: 2,
        lessons: {},
        items: { "word:old": { box: 3, dueAt: "2026-01-01T00:00:00.000Z", lastSeenAt: "2026-01-01T00:00:00.000Z", lapses: 0 } },
        activity: { days: [] },
        totalStars: 0,
      }),
    );
    const release = gateNextRead();
    const { result } = renderHook(() => useProgress(), { wrapper });
    await act(async () => {
      await result.current.resetProgress();
    });
    act(() => result.current.recordRoundResult("word:new", true));
    await act(async () => release());

    await waitFor(async () => expect((await stored())?.items["word:new"]).toBeDefined());
    expect((await stored()).items["word:old"]).toBeUndefined();
    expect(result.current.progress.items["word:old"]).toBeUndefined();
  });
});
