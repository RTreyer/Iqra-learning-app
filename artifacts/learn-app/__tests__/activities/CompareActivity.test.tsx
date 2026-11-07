import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { CompareActivity } from "@/components/activities/CompareActivity";
import type { Lesson } from "@/content/types";
import { renderActivity } from "@/test-utils/activities";

const fish = { emoji: "🐟" };
const lesson: Extract<Lesson, { type: "compare" }> = {
  id: "math-u2-1",
  number: 1,
  title: "أُقَارِنُ",
  subtitle: "",
  emoji: "⚖️",
  color: "#7C3AED",
  type: "compare",
  rounds: [
    {
      prompt: "أُقَارِنُ الْمَجْمُوعَتَيْنِ",
      first: { pics: [fish, fish, fish] },
      second: { pics: [fish] },
      mode: "words",
    },
    { prompt: "أَضَعُ الإِشَارَةَ", first: { number: 4 }, second: { number: 4 }, mode: "symbols" },
  ],
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

test("word buttons for groups, symbol buttons for numbers, first tap counts", () => {
  const onComplete = jest.fn();
  renderActivity(
    <CompareActivity lesson={lesson} color="#7C3AED" attemptKey="x:1" onComplete={onComplete} />,
  );
  expect(screen.getByTestId("compare-first")).toBeTruthy();
  expect(screen.getByTestId("compare-second")).toBeTruthy();
  fireEvent.press(screen.getByTestId("compare-answer-more"));
  expect(screen.getByTestId("compare-answer-less")).toBeDisabled();
  act(() => jest.advanceTimersByTime(900));
  expect(screen.getAllByText("٤")).toHaveLength(2);
  // Symbol buttons are named by the words, drawn as SVG.
  fireEvent.press(screen.getByRole("button", { name: "أَكْبَرُ مِنْ" }));
  expect(screen.getByRole("button", { name: "أَكْبَرُ مِنْ" })).toBeDisabled();
  act(() => jest.advanceTimersByTime(900));
  expect(onComplete).not.toHaveBeenCalled();
  fireEvent.press(screen.getByTestId("compare-answer-equal"));
  act(() => jest.advanceTimersByTime(900));
  expect(onComplete).toHaveBeenCalledWith({ correct: 1, total: 2 });
});

test("finding the answer after a wrong first tap does not count", () => {
  const onComplete = jest.fn();
  const single = { ...lesson, rounds: [lesson.rounds[0]] };
  renderActivity(
    <CompareActivity lesson={single} color="#7C3AED" attemptKey="x:2" onComplete={onComplete} />,
  );
  fireEvent.press(screen.getByTestId("compare-answer-less"));
  fireEvent.press(screen.getByTestId("compare-answer-more"));
  act(() => jest.advanceTimersByTime(900));
  expect(onComplete).toHaveBeenCalledWith({ correct: 0, total: 1 });
});

test("a number against a group uses the group words", () => {
  const mixed: Extract<Lesson, { type: "compare" }> = {
    ...lesson,
    rounds: [
      {
        prompt: "أُقَارِنُ",
        first: { number: 3 },
        second: { pics: [fish] },
        mode: "words",
      },
    ],
  };
  renderActivity(
    <CompareActivity lesson={mixed} color="#7C3AED" attemptKey="x:1" onComplete={jest.fn()} />,
  );
  expect(screen.getByText("أَكْثَرُ")).toBeTruthy();
  expect(screen.queryByText("أَكْبَرُ")).toBeNull();
});

test("the locked result symbol is announced by its words", () => {
  const sym: Extract<Lesson, { type: "compare" }> = { ...lesson, rounds: [lesson.rounds[1]] };
  renderActivity(
    <CompareActivity lesson={sym} color="#7C3AED" attemptKey="x:1" onComplete={jest.fn()} />,
  );
  fireEvent.press(screen.getByRole("button", { name: "يُسَاوِي" }));
  expect(screen.getAllByLabelText("يُسَاوِي").length).toBeGreaterThan(1);
});
