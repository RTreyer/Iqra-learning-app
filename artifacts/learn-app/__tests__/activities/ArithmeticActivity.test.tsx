import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { ArithmeticActivity } from "@/components/activities/ArithmeticActivity";
import type { Lesson } from "@/content/types";
import { renderActivity } from "@/test-utils/activities";

const lesson: Extract<Lesson, { type: "arithmetic" }> = {
  id: "m1-2", number: 2, title: "جمع", subtitle: "", emoji: "➕", color: "#7C3AED", type: "arithmetic",
  rounds: [
    { a: 2, b: 3, op: "+", options: [4, 5, 6] },
    { a: 7, b: 4, op: "-", options: [3, 2, 11] },
  ],
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test("renders the equation with Arabic digits and scores the rounds", () => {
  const onComplete = jest.fn();
  const onRoundResult = jest.fn();
  renderActivity(
    <ArithmeticActivity lesson={lesson} color="#7C3AED" attemptKey="x:1" onComplete={onComplete} onRoundResult={onRoundResult} />,
  );
  expect(screen.getByText("٢ + ٣ = ؟")).toBeTruthy();
  fireEvent.press(screen.getByRole("button", { name: "٦" }));
  expect(screen.getByRole("button", { name: "٥" })).toBeDisabled();
  act(() => jest.advanceTimersByTime(900));
  expect(screen.getByText("٧ - ٤ = ؟")).toBeTruthy();
  fireEvent.press(screen.getByRole("button", { name: "٣" }));
  act(() => jest.advanceTimersByTime(900));
  expect(onComplete).toHaveBeenCalledWith({ correct: 1, total: 2 });
  expect(onRoundResult.mock.calls).toEqual([
    ["calc:2+3", false],
    ["calc:7-4", true],
  ]);
});
