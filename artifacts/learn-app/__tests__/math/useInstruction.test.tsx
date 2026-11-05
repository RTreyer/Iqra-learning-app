import { act, renderHook } from "@testing-library/react-native";
import { useInstruction } from "@/components/activities/math/useInstruction";

const speech = jest.requireMock("expo-speech") as { speak: jest.Mock };

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

test("speaks a prompt once and again only when it changes", () => {
  const { rerender } = renderHook(({ p }: { p: string }) => useInstruction(p), {
    initialProps: { p: "أُحَوِّطُ الأَكْبَرَ" },
  });
  act(() => jest.advanceTimersByTime(400));
  expect(speech.speak).toHaveBeenCalledTimes(1);
  rerender({ p: "أُحَوِّطُ الأَكْبَرَ" });
  act(() => jest.advanceTimersByTime(400));
  expect(speech.speak).toHaveBeenCalledTimes(1);
  rerender({ p: "أُحَوِّطُ الأَصْغَرَ" });
  act(() => jest.advanceTimersByTime(400));
  expect(speech.speak).toHaveBeenCalledTimes(2);
  expect(speech.speak).toHaveBeenLastCalledWith("أُحَوِّطُ الأَصْغَرَ", expect.anything());
});
