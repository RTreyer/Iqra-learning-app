import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import { ProgressProvider, useProgress } from "@/context/ProgressContext";

const KEY = "@kidlearn_progress_v1";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ProgressProvider>{children}</ProgressProvider>
);

async function stored() {
  const json = await AsyncStorage.getItem(KEY);
  return json ? JSON.parse(json) : null;
}

async function renderLoaded() {
  const hook = renderHook(() => useProgress(), { wrapper });
  await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalledWith(KEY));
  await act(async () => {});
  return hook;
}

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

describe("ProgressContext", () => {
  it("keeps the best stars: 2 then 3 gives 3", async () => {
    const { result } = await renderLoaded();
    await act(async () => {
      await result.current.completeLesson("a", 2);
    });
    await act(async () => {
      await result.current.completeLesson("a", 3);
    });
    expect(result.current.getLessonProgress("a").stars).toBe(3);
    expect(result.current.progress.totalStars).toBe(3);
    await waitFor(async () => expect((await stored()).lessons.a.stars).toBe(3));
  });

  it("keeps the best stars: 3 then 1 gives 3", async () => {
    const { result } = await renderLoaded();
    await act(async () => {
      await result.current.completeLesson("a", 3);
    });
    await act(async () => {
      await result.current.completeLesson("a", 1);
    });
    expect(result.current.getLessonProgress("a").stars).toBe(3);
    expect(result.current.progress.totalStars).toBe(3);
  });

  it("keeps a completion made before storage finishes loading", async () => {
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify({ lessons: { old: { completed: true, stars: 2 } }, totalStars: 2 }),
    );
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const getItem = AsyncStorage.getItem as jest.Mock;
    const realImpl = getItem.getMockImplementation();
    getItem.mockImplementationOnce(async (key: string) => {
      await gate;
      return realImpl ? realImpl(key) : null;
    });

    const { result } = renderHook(() => useProgress(), { wrapper });
    await act(async () => {
      await result.current.completeLesson("new", 3);
    });
    await act(async () => {
      release();
    });

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
    await act(async () => {
      await first.result.current.completeLesson("a", 2);
    });
    await waitFor(async () => expect((await stored())?.lessons.a.stars).toBe(2));
    first.unmount();

    const { result } = await renderLoaded();
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
    const { result } = await renderLoaded();
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
    await act(async () => {
      await result.current.completeLesson("a", 3);
    });
    await act(async () => {
      await result.current.completeLesson("b", 1);
    });
    expect(result.current.getUnitProgress(["a", "b", "c"])).toEqual({
      done: 2,
      total: 3,
      stars: 4,
    });
  });
});
