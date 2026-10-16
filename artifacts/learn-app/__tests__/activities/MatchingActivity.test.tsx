import { fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { MatchingActivity } from "@/components/activities/MatchingActivity";
import { lessonOf, renderActivity } from "@/test-utils/activities";

const lesson = lessonOf("u1-4", "matching");
const left = (i: number) => fireEvent.press(screen.getByTestId(`match-left-${i}`));
const right = (i: number) => fireEvent.press(screen.getByTestId(`match-right-${i}`));

test("a pair counts only when its first right tap is correct", () => {
  const onComplete = jest.fn();
  renderActivity(<MatchingActivity lesson={lesson} color="#7C3AED" attemptKey="m:1" onComplete={onComplete} />);
  left(0);
  right(1); // wrong first try for pair 0
  left(0);
  right(0);
  left(1);
  right(1);
  left(2);
  right(2);
  left(3);
  right(0); // already matched: ignored, not a miss
  expect(screen.queryByTestId("activity-done")).toBeNull();
  right(3);
  fireEvent.press(screen.getByTestId("activity-done"));
  expect(onComplete).toHaveBeenCalledWith({ correct: 3, total: 4 });
});

test("right taps without a selected left item do nothing", () => {
  const onComplete = jest.fn();
  renderActivity(<MatchingActivity lesson={lesson} color="#7C3AED" attemptKey="m:1" onComplete={onComplete} />);
  right(0);
  lesson.pairs.forEach((_, i) => {
    left(i);
    right(i);
  });
  fireEvent.press(screen.getByTestId("activity-done"));
  expect(onComplete).toHaveBeenCalledWith({ correct: 4, total: 4 });
});

test("right column order is seeded by attemptKey", () => {
  const order = (key: string) => {
    const view = renderActivity(<MatchingActivity lesson={lesson} color="#7C3AED" attemptKey={key} onComplete={jest.fn()} />);
    const ids = screen.getAllByTestId(/^match-right-/).map((n) => n.props.testID as string);
    view.unmount();
    return ids.join(",");
  };
  expect(order("m:1")).toBe(order("m:1"));
  const keys = Array.from({ length: 8 }, (_, i) => order(`m:${i}`));
  expect(new Set(keys).size).toBeGreaterThan(1);
});
