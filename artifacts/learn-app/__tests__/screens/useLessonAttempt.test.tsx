import { act, renderHook } from "@testing-library/react-native";
import { useLessonAttempt } from "@/hooks/useLessonAttempt";

test("the first focus does not remount the activity", () => {
  const { result, rerender } = renderHook(() => useLessonAttempt("u2-3"));
  const first = result.current.activityKey;
  rerender({});
  expect(result.current.activityKey).toBe(first);
  expect(first).toBe("u2-3:0");
});

test("stores stars, restarts, and resets on a new key", () => {
  const { result, rerender } = renderHook(({ id }: { id: string }) => useLessonAttempt(id), {
    initialProps: { id: "u2-3" },
  });
  act(() => result.current.completeAttempt(2));
  expect(result.current.completed).toBe(true);
  expect(result.current.stars).toBe(2);

  act(() => result.current.restartAttempt());
  expect(result.current.completed).toBe(false);
  expect(result.current.activityKey).toBe("u2-3:1");

  rerender({ id: "u2-4" });
  expect(result.current.activityKey).toBe("u2-4:2");
});
