import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { LetterPickActivity } from "@/components/activities/LetterPickActivity";
import { lessonOf, renderActivity } from "@/test-utils/activities";

const speech = jest.requireMock("expo-speech") as { speak: jest.Mock };
const lesson = lessonOf("u2-3", "letter_pick");

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

const tap = (letter: string) => fireEvent.press(screen.getByRole("button", { name: letter }));
const advance = () => act(() => jest.advanceTimersByTime(900));

test("first tap scoring: wrong, wrong, right, right, right", () => {
  const onComplete = jest.fn();
  const onRoundResult = jest.fn();
  renderActivity(
    <LetterPickActivity lesson={lesson} color="#7C3AED" attemptKey="a:1" onComplete={onComplete} onRoundResult={onRoundResult} />,
  );
  expect(screen.getByText("سؤال 1 من 5")).toBeTruthy();

  tap("ت"); // target ب
  tap("ب"); // locked: ignored
  advance();
  tap("ث"); // target ت
  advance();
  tap("ث");
  advance();
  tap("ب");
  advance();
  expect(onComplete).not.toHaveBeenCalled();
  tap("ت");
  advance();

  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(onComplete).toHaveBeenCalledWith({ correct: 3, total: 5 });
  expect(onRoundResult.mock.calls).toEqual([
    ["letter:ب", false],
    ["letter:ت", false],
    ["letter:ث", true],
    ["letter:ب", true],
    ["letter:ت", true],
  ]);
});

test("locks the round, highlights the correct letter and speaks the prompt", () => {
  renderActivity(<LetterPickActivity lesson={lesson} color="#7C3AED" attemptKey="a:1" onComplete={jest.fn()} />);
  act(() => jest.advanceTimersByTime(400));
  expect(speech.speak).toHaveBeenCalledWith("ب", expect.anything());
  tap("ن");
  expect(screen.getByRole("button", { name: "ب" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "ب" })).toHaveProp("accessibilityState", { disabled: true, selected: false });
});

test("resets when attemptKey changes", () => {
  const { rerenderActivity } = renderActivity(
    <LetterPickActivity lesson={lesson} color="#7C3AED" attemptKey="a:1" onComplete={jest.fn()} />,
  );
  tap("ب");
  advance();
  expect(screen.getByText("سؤال 2 من 5")).toBeTruthy();
  rerenderActivity(<LetterPickActivity lesson={lesson} color="#7C3AED" attemptKey="a:2" onComplete={jest.fn()} />);
  expect(screen.getByText("سؤال 1 من 5")).toBeTruthy();
  expect(screen.getByRole("button", { name: "ب" })).not.toBeDisabled();
});

test("uses the latest callbacks when the parent re-renders before the advance", () => {
  const single = { ...lesson, rounds: lesson.rounds.slice(0, 1) };
  const first = jest.fn();
  const latest = jest.fn();
  const { rerenderActivity } = renderActivity(
    <LetterPickActivity lesson={single} color="#7C3AED" attemptKey="a:1" onComplete={first} />,
  );
  tap("ب");
  rerenderActivity(<LetterPickActivity lesson={single} color="#7C3AED" attemptKey="a:1" onComplete={latest} />);
  advance();
  expect(first).not.toHaveBeenCalled();
  expect(latest).toHaveBeenCalledWith({ correct: 1, total: 1 });
});

test("only the tapped option is selected and revealed options announce the result", () => {
  renderActivity(<LetterPickActivity lesson={lesson} color="#7C3AED" attemptKey="a:1" onComplete={jest.fn()} />);
  tap("ت");
  const buttons = screen.getAllByRole("button");
  const byLetter = (l: string) => buttons.find((b) => String(b.props.accessibilityLabel).startsWith(l))!;
  expect(byLetter("ت").props.accessibilityLabel).toBe("ت، خطأ");
  expect(byLetter("ت").props.accessibilityState.selected).toBe(true);
  expect(byLetter("ب").props.accessibilityLabel).toBe("ب، صحيح");
  expect(byLetter("ب").props.accessibilityState.selected).toBe(false);
  expect(byLetter("ن").props.accessibilityLabel).toBe("ن");
});
