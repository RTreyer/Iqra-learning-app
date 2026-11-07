import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { CountingActivity } from "@/components/activities/CountingActivity";
import { PRAISE } from "@/components/activities/shared/strings";
import type { Lesson } from "@/content/types";
import { renderActivity } from "@/test-utils/activities";

// No math content ships yet (the math book is unavailable), so the lesson is built here.
const lesson: Extract<Lesson, { type: "counting" }> = {
  id: "m1-1",
  number: 1,
  title: "عدّ",
  subtitle: "",
  emoji: "🔢",
  color: "#7C3AED",
  type: "counting",
  rounds: [
    { emoji: "🍎", count: 3, options: [2, 3, 4] },
    { emoji: "⭐", count: 5, options: [5, 6, 4] },
    { emoji: "🐟", count: 2, options: [1, 3, 2] },
  ],
};
const speech = jest.requireMock("expo-speech") as { speak: jest.Mock };

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

test("shows Eastern Arabic digits, scores first taps and completes", () => {
  const onComplete = jest.fn();
  const onRoundResult = jest.fn();
  renderActivity(
    <CountingActivity
      lesson={lesson}
      color="#7C3AED"
      attemptKey="c:1"
      onComplete={onComplete}
      onRoundResult={onRoundResult}
    />,
  );
  expect(screen.getAllByText("🍎")).toHaveLength(3);
  act(() => jest.advanceTimersByTime(400));
  expect(speech.speak).toHaveBeenLastCalledWith("كَمْ عَدَدُهَا؟", expect.anything());
  expect(screen.getByRole("button", { name: "٣" })).toBeTruthy();
  expect(screen.queryByText("3")).toBeNull();

  fireEvent.press(screen.getByRole("button", { name: "٣" }));
  expect(speech.speak).toHaveBeenLastCalledWith(PRAISE, expect.anything());
  expect(screen.getByText("✓")).toBeTruthy(); // glyph next to the colour feedback
  act(() => jest.advanceTimersByTime(900));
  fireEvent.press(screen.getByRole("button", { name: "٦" }));
  // Asked again, without saying the answer; the child finds it.
  expect(speech.speak).toHaveBeenLastCalledWith("حَاوِلْ مَرَّةً أُخْرَى", expect.anything());
  expect(screen.getByRole("button", { name: "٦، خطأ" })).toBeDisabled();
  fireEvent.press(screen.getByRole("button", { name: "٥" })); // found: not scored
  act(() => jest.advanceTimersByTime(900));
  fireEvent.press(screen.getByRole("button", { name: "٢" }));
  act(() => jest.advanceTimersByTime(900));

  expect(onComplete).toHaveBeenCalledWith({ correct: 2, total: 3 });
  expect(onRoundResult.mock.calls).toEqual([
    ["count:3", true],
    ["count:5", false],
    ["count:2", true],
  ]);
});
