import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import {
  BuildWordActivity,
  DEPART_MS,
  spokenSyllable,
} from "@/components/activities/BuildWordActivity";
import { lessonOf, renderActivity } from "@/test-utils/activities";

const speech = jest.requireMock("expo-speech") as { speak: jest.Mock };
// Round 1: بَيَانُ = بَ / يَا / نُ, decoy يُو. Round 2: يَدُ = يَ / دُ, decoys يُ and دَا.
const lesson = lessonOf("u3-3", "build_word");

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

const tap = (syllable: string) => fireEvent.press(screen.getByRole("button", { name: syllable }));
const depart = () => act(() => jest.advanceTimersByTime(DEPART_MS));
const spoken = () => speech.speak.mock.calls.map(([text]) => text);

function render(onRoundResult = jest.fn(), onComplete = jest.fn()) {
  renderActivity(
    <BuildWordActivity
      lesson={lesson}
      color="#EA580C"
      attemptKey="a:1"
      onComplete={onComplete}
      onRoundResult={onRoundResult}
    />,
  );
  return { onRoundResult, onComplete };
}

test("loads the syllables in reading order and says the word", () => {
  const { onRoundResult } = render();
  // The train is not a review item: rounds count for the score only.
  act(() => jest.advanceTimersByTime(400));
  expect(spoken()).toContain("بَيَانُ");

  tap("بَ");
  tap("يَا");
  expect(screen.getByTestId("wagon-0")).toHaveProp("accessibilityLabel", "بَ");
  expect(screen.getByTestId("wagon-2")).toHaveProp("accessibilityLabel", "؟");
  expect(screen.getByTestId("wagon-1")).toHaveProp("accessibilityLabel", "يَا");
  tap("نُ");

  expect(screen.getByText("بَيَانُ")).toBeTruthy();
  expect(spoken().at(-1)).toContain("بَيَانُ");
  expect(screen.queryByRole("button", { name: "يُو" })).toBeNull();
  expect(onRoundResult).not.toHaveBeenCalled();
});

test("a wrong tile shakes, says the needed syllable and costs the round", () => {
  const { onComplete } = render();
  tap("يُو"); // decoy: بَ was needed
  expect(spoken().at(-1)).toBe("بَ");
  expect(screen.getByTestId("wagon-0")).toHaveProp("accessibilityLabel", "؟");
  tap("بَ");
  tap("يَا");
  tap("نُ");
  depart();

  expect(screen.getByText("سؤال 2 من 5")).toBeTruthy();
  for (const s of ["يَ", "دُ"]) tap(s);
  depart();
  for (const s of ["يُو", "لَـ", "دُ"]) tap(s);
  depart();
  for (const s of ["بَيْـ", "تُ"]) tap(s);
  depart();
  for (const s of ["يُـ", "دَا", "رُ"]) tap(s);
  depart();

  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(onComplete).toHaveBeenCalledWith({ correct: 4, total: 5 });
});

test("tatweel is dropped from spoken syllables", () => {
  expect(spokenSyllable("يُـ")).toBe("يُ");
  expect(spokenSyllable("بَيْـ")).toBe("بَيْ");
});

test("complete the word: given wagons start full, only the gap is loaded", () => {
  // u6-5 round 1: قِدْرُ = قِدْ / رُ with رُ given; decoys قَا and قُو.
  const gapLesson = lessonOf("u6-5", "build_word");
  const onComplete = jest.fn();
  renderActivity(
    <BuildWordActivity
      lesson={gapLesson}
      color="#EA580C"
      attemptKey="a:1"
      onComplete={onComplete}
    />,
  );
  expect(screen.getByText("أكمل القطار بالمقطع الناقص 🚂")).toBeTruthy();
  expect(screen.getByTestId("wagon-1")).toHaveProp("accessibilityLabel", "رُ");
  expect(screen.getByTestId("wagon-0")).toHaveProp("accessibilityLabel", "؟");
  expect(screen.queryByRole("button", { name: "رُ" })).toBeNull();
  tap("قِدْ");
  expect(screen.getByTestId("wagon-0")).toHaveProp("accessibilityLabel", "قِدْ");
  expect(screen.getByText("قِدْرُ")).toBeTruthy();
});
