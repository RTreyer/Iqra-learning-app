import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { LetterPickActivity } from "@/components/activities/LetterPickActivity";
import { lessonOf, renderActivity } from "@/test-utils/activities";

const speech = jest.requireMock("expo-speech") as { speak: jest.Mock };
const lesson = lessonOf("u2-2", "letter_pick");

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

/** The answer card for `letter` (the target card above says it too, as "🔊 letter"). */
const choice = (letter: string) =>
  screen.getAllByRole("button", { name: letter }).find((n) => n.props.testID !== "letter-target")!;
const tap = (letter: string) => fireEvent.press(choice(letter));
const advance = () => act(() => jest.advanceTimersByTime(900));

test("first tap scoring: wrong then found, wrong then found, right, right", () => {
  const onComplete = jest.fn();
  const onRoundResult = jest.fn();
  renderActivity(
    <LetterPickActivity
      lesson={lesson}
      color="#7C3AED"
      attemptKey="a:1"
      onComplete={onComplete}
      onRoundResult={onRoundResult}
    />,
  );
  expect(screen.getByTestId("progress-train")).toHaveProp("aria-valuenow", 1);

  tap("بَ"); // target مَ: wrong, the round stays open
  advance();
  expect(screen.getByTestId("progress-train")).toHaveProp("aria-valuenow", 1);
  tap("مَ"); // found on the second try: does not count
  advance();
  tap("مَ"); // target مَا: wrong
  tap("مَا"); // found
  advance();
  tap("مَ");
  advance();
  expect(onComplete).not.toHaveBeenCalled();
  tap("مَا");
  advance();

  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(onComplete).toHaveBeenCalledWith({ correct: 2, total: 4 });
  expect(onRoundResult.mock.calls).toEqual([
    ["letter:مَ", false],
    ["letter:مَا", false],
    ["letter:مَ", true],
    ["letter:مَا", true],
  ]);
});

test("a wrong letter greys out, the voice asks again, and the child tries again", () => {
  renderActivity(
    <LetterPickActivity lesson={lesson} color="#7C3AED" attemptKey="a:1" onComplete={jest.fn()} />,
  );
  act(() => jest.advanceTimersByTime(400));
  expect(speech.speak).toHaveBeenCalledWith("مَ", expect.anything());
  tap("نَ");
  expect(speech.speak).toHaveBeenLastCalledWith("حَاوِلْ مَرَّةً أُخْرَى، مَ", expect.anything());
  // The wrong letter cannot be tapped again; the answer is not revealed and stays open.
  expect(screen.getByRole("button", { name: "نَ، خطأ" })).toBeDisabled();
  expect(choice("مَ")).not.toBeDisabled();
  tap("نَ");
  expect(speech.speak).toHaveBeenCalledTimes(2);
  tap("مَ");
  expect(screen.getByRole("button", { name: "مَ، صحيح" })).toHaveProp("accessibilityState", {
    disabled: true,
    selected: true,
  });
});

test("resets when attemptKey changes", () => {
  const { rerenderActivity } = renderActivity(
    <LetterPickActivity lesson={lesson} color="#7C3AED" attemptKey="a:1" onComplete={jest.fn()} />,
  );
  tap("مَ");
  advance();
  expect(screen.getByTestId("progress-train")).toHaveProp("aria-valuenow", 2);
  rerenderActivity(
    <LetterPickActivity lesson={lesson} color="#7C3AED" attemptKey="a:2" onComplete={jest.fn()} />,
  );
  expect(screen.getByTestId("progress-train")).toHaveProp("aria-valuenow", 1);
  expect(choice("مَ")).not.toBeDisabled();
});

test("uses the latest callbacks when the parent re-renders before the advance", () => {
  const single = { ...lesson, rounds: lesson.rounds.slice(0, 1) };
  const first = jest.fn();
  const latest = jest.fn();
  const { rerenderActivity } = renderActivity(
    <LetterPickActivity lesson={single} color="#7C3AED" attemptKey="a:1" onComplete={first} />,
  );
  tap("مَ");
  rerenderActivity(
    <LetterPickActivity lesson={single} color="#7C3AED" attemptKey="a:1" onComplete={latest} />,
  );
  advance();
  expect(first).not.toHaveBeenCalled();
  expect(latest).toHaveBeenCalledWith({ correct: 1, total: 1 });
});

test("options announce their result: wrong ones as they are tapped, the answer once found", () => {
  renderActivity(
    <LetterPickActivity lesson={lesson} color="#7C3AED" attemptKey="a:1" onComplete={jest.fn()} />,
  );
  tap("بَ");
  const label = (l: string) =>
    screen
      .getAllByRole("button")
      .map((b) => String(b.props.accessibilityLabel))
      .find((t) => t.startsWith(l));
  expect(label("بَ")).toBe("بَ، خطأ");
  expect(label("مَ")).toBe("مَ");
  expect(label("نَ")).toBe("نَ");
  tap("مَ");
  expect(label("مَ")).toBe("مَ، صحيح");
  expect(label("بَ")).toBe("بَ، خطأ");
  expect(label("نَ")).toBe("نَ");
});
