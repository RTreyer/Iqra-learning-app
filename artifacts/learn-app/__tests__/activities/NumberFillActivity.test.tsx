import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { NumberFillActivity } from "@/components/activities/NumberFillActivity";
import { groupLabel } from "@/content/math/picLabel";
import type { Lesson } from "@/content/types";
import { renderActivity } from "@/test-utils/activities";

const lesson: Extract<Lesson, { type: "number_fill" }> = {
  id: "math-u3-1",
  number: 1,
  title: "أُكْمِلُ",
  subtitle: "",
  emoji: "➕",
  color: "#7C3AED",
  type: "number_fill",
  rounds: [
    {
      prompt: "أُكْمِلُ",
      cells: [2, "+", "?", "=", 5],
      layout: "row",
      options: [2, 3, 4],
      pics: [{ emoji: "🍎" }, { emoji: "🍎" }],
    },
    { prompt: "أُكْمِلُ", cells: [6, "-", 2, "=", "?"], layout: "vertical", options: [3, 4, 8] },
    { prompt: "أُرَتِّبُ", cells: [1, 2, "?", 4], layout: "sequence", options: [3, 5, 6] },
  ],
};

const speech = jest.requireMock("expo-speech") as { speak: jest.Mock };

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

test("shows each layout with an empty box, never reads the sum aloud", () => {
  const onComplete = jest.fn();
  renderActivity(
    <NumberFillActivity lesson={lesson} color="#7C3AED" attemptKey="x:1" onComplete={onComplete} />,
  );
  act(() => jest.advanceTimersByTime(400));
  expect(speech.speak.mock.calls.map((c) => c[0])).toEqual(["أُكْمِلُ"]);
  expect(screen.getByTestId("number-fill-sentence")).toBeTruthy();
  expect(screen.getByTestId("number-fill-box")).toBeTruthy();
  expect(screen.getByLabelText("مربع فارغ")).toBeTruthy();
  expect(screen.getByLabelText(groupLabel(lesson.rounds[0].pics ?? []))).toBeTruthy();
  fireEvent.press(screen.getByRole("button", { name: "٣" }));
  act(() => jest.advanceTimersByTime(900));
  expect(screen.getByTestId("number-fill-sentence")).toBeTruthy();
  fireEvent.press(screen.getByRole("button", { name: "٨" }));
  expect(screen.getByRole("button", { name: "٤" })).toBeDisabled();
  act(() => jest.advanceTimersByTime(900));
  fireEvent.press(screen.getByRole("button", { name: "٣" }));
  act(() => jest.advanceTimersByTime(900));
  expect(onComplete).toHaveBeenCalledWith({ correct: 2, total: 3 });
});

test("a wrong first tap is not undone by pressing the right option", () => {
  const onComplete = jest.fn();
  const single = { ...lesson, rounds: [lesson.rounds[1]] };
  renderActivity(
    <NumberFillActivity lesson={single} color="#7C3AED" attemptKey="x:2" onComplete={onComplete} />,
  );
  fireEvent.press(screen.getByRole("button", { name: "٨" }));
  fireEvent.press(screen.getByRole("button", { name: "٤" }));
  act(() => jest.advanceTimersByTime(900));
  expect(onComplete).toHaveBeenCalledWith({ correct: 0, total: 1 });
});
