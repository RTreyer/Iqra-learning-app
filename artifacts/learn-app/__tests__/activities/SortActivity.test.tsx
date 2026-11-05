import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { SortActivity } from "@/components/activities/SortActivity";
import type { Lesson } from "@/content/types";
import { renderActivity } from "@/test-utils/activities";

const lesson: Extract<Lesson, { type: "sort" }> = {
  id: "math-u1-2",
  number: 2,
  title: "أُصَنِّفُ",
  subtitle: "",
  emoji: "🎒",
  color: "#7C3AED",
  type: "sort",
  prompt: "أَضَعُ كُلَّ شَيْءٍ فِي مَكَانِهِ",
  boxes: [
    { label: "أَحْمَرُ", pic: { shape: "square", color: "red" } },
    { label: "أَزْرَقُ", pic: { shape: "square", color: "blue" } },
  ],
  items: [
    { pic: { shape: "circle", color: "red" }, box: 0 },
    { pic: { shape: "triangle", color: "blue" }, box: 1 },
  ],
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

test("tap an item then a box; a wrong box keeps the item and costs that item's point", () => {
  const onComplete = jest.fn();
  renderActivity(
    <SortActivity lesson={lesson} color="#7C3AED" attemptKey="x:1" onComplete={onComplete} />,
  );
  fireEvent.press(screen.getByRole("button", { name: "دَائِرَةٌ حَمْرَاءُ" }));
  fireEvent.press(screen.getByRole("button", { name: "أَزْرَقُ" }));
  expect(screen.getByRole("button", { name: "دَائِرَةٌ حَمْرَاءُ" })).toBeTruthy();
  fireEvent.press(screen.getByRole("button", { name: "أَحْمَرُ" }));
  expect(screen.queryByRole("button", { name: "دَائِرَةٌ حَمْرَاءُ" })).toBeNull();
  expect(onComplete).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole("button", { name: "مُثَلَّثٌ أَزْرَقُ" }));
  fireEvent.press(screen.getByRole("button", { name: "أَزْرَقُ" }));
  act(() => jest.advanceTimersByTime(900));
  expect(onComplete).toHaveBeenCalledWith({ correct: 1, total: 2 });
});

test("tapping a box with nothing selected does nothing", () => {
  const onComplete = jest.fn();
  renderActivity(
    <SortActivity lesson={lesson} color="#7C3AED" attemptKey="x:1" onComplete={onComplete} />,
  );
  fireEvent.press(screen.getByRole("button", { name: "أَحْمَرُ" }));
  expect(screen.getAllByRole("button", { name: /دَائِرَةٌ|مُثَلَّثٌ/ })).toHaveLength(2);
});

test("a perfect run completes exactly once, even after a re-render", () => {
  const onComplete = jest.fn();
  const ui = (
    <SortActivity lesson={lesson} color="#7C3AED" attemptKey="x:1" onComplete={onComplete} />
  );
  const view = renderActivity(ui);
  fireEvent.press(screen.getByRole("button", { name: "دَائِرَةٌ حَمْرَاءُ" }));
  fireEvent.press(screen.getByRole("button", { name: "أَحْمَرُ" }));
  fireEvent.press(screen.getByRole("button", { name: "مُثَلَّثٌ أَزْرَقُ" }));
  fireEvent.press(screen.getByRole("button", { name: "أَزْرَقُ" }));
  act(() => jest.advanceTimersByTime(300));
  view.rerenderActivity(ui);
  act(() => jest.advanceTimersByTime(2000));
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(onComplete).toHaveBeenCalledWith({ correct: 2, total: 2 });
});
