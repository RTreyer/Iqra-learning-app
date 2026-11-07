import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { DEMO_SEEN_KEY, resetDemoSeenCache, useDemoSeen } from "@/hooks/useDemoSeen";

beforeEach(async () => {
  resetDemoSeenCache();
  await AsyncStorage.clear();
});

test("loads the seen types from storage", async () => {
  await AsyncStorage.setItem(DEMO_SEEN_KEY, JSON.stringify(["story", "trace"]));
  const { result } = renderHook(() => useDemoSeen());
  expect(result.current.seen).toBeNull();
  await waitFor(() => expect(result.current.seen).not.toBeNull());
  expect([...result.current.seen!].sort()).toEqual(["story", "trace"]);
});

test("markSeen updates at once and persists", async () => {
  const { result } = renderHook(() => useDemoSeen());
  await waitFor(() => expect(result.current.seen).not.toBeNull());
  act(() => result.current.markSeen("matching"));
  expect(result.current.seen!.has("matching")).toBe(true);
  await waitFor(async () =>
    expect(JSON.parse((await AsyncStorage.getItem(DEMO_SEEN_KEY))!)).toEqual(["matching"]),
  );
});

test("a broken value means nothing seen: the demos play again", async () => {
  await AsyncStorage.setItem(DEMO_SEEN_KEY, "{not json");
  const { result } = renderHook(() => useDemoSeen());
  await waitFor(() => expect(result.current.seen).not.toBeNull());
  expect(result.current.seen!.size).toBe(0);
});

test("a second screen in the same session starts from what the first marked", async () => {
  const first = renderHook(() => useDemoSeen());
  await waitFor(() => expect(first.result.current.seen).not.toBeNull());
  act(() => first.result.current.markSeen("sort"));
  const second = renderHook(() => useDemoSeen());
  expect(second.result.current.seen!.has("sort")).toBe(true);
});
