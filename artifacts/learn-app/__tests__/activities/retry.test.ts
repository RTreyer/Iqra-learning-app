import { act, renderHook } from "@testing-library/react-native";

import { choiceState, useQuiz } from "@/components/activities/shared/useQuiz";
import { lessonOf } from "@/test-utils/activities";

const lesson = lessonOf("u2-2", "letter_pick");

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

function setup(options: { retry?: boolean } = {}) {
  const onComplete = jest.fn();
  const onRoundResult = jest.fn();
  const hook = renderHook(() =>
    useQuiz({ lesson, total: 2, onComplete, onRoundResult, autoAdvanceMs: 900, ...options }),
  );
  return { hook, onComplete, onRoundResult };
}

test("a wrong tap keeps the round open; only the first tap is scored and reported", () => {
  const { hook, onComplete, onRoundResult } = setup();
  act(() => {
    hook.result.current.pick(0, false);
  });
  expect(hook.result.current.wrong).toEqual([0]);
  expect(hook.result.current.locked).toBe(false);
  // The same wrong option again is ignored.
  let accepted = true;
  act(() => {
    accepted = hook.result.current.pick(0, false);
  });
  expect(accepted).toBe(false);
  act(() => {
    hook.result.current.pick(2, false);
  });
  act(() => {
    hook.result.current.pick(1, true);
  });
  expect(hook.result.current.locked).toBe(true);
  act(() => jest.advanceTimersByTime(900));
  expect(hook.result.current.roundIndex).toBe(1);
  expect(hook.result.current.wrong).toEqual([]);
  act(() => {
    hook.result.current.pick(0, true);
  });
  act(() => jest.advanceTimersByTime(900));
  expect(onComplete).toHaveBeenCalledWith({ correct: 1, total: 2 });
  expect(onRoundResult.mock.calls.map((c) => c[1])).toEqual([false, true]);
});

test("without retry a wrong tap ends the round, as the syllable train needs", () => {
  const { hook, onComplete } = setup({ retry: false });
  act(() => {
    hook.result.current.pick(0, false);
  });
  expect(hook.result.current.locked).toBe(true);
  act(() => jest.advanceTimersByTime(900));
  act(() => {
    hook.result.current.pick(0, true);
  });
  act(() => jest.advanceTimersByTime(900));
  expect(onComplete).toHaveBeenCalledWith({ correct: 1, total: 2 });
});

test("choiceState greys out wrong taps and shows the answer only once found", () => {
  expect(choiceState(0, null, 1, [0])).toBe("wrong");
  expect(choiceState(1, null, 1, [0])).toBe("idle");
  expect(choiceState(1, 1, 1, [0])).toBe("correct");
  expect(choiceState(2, 1, 1, [0])).toBe("idle");
});
