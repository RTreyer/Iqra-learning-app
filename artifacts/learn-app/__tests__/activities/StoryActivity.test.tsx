import { fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { toArabicDigits } from "@/lib/arabicNumbers";
import { StoryActivity } from "@/components/activities/StoryActivity";
import { lessonOf, renderActivity } from "@/test-utils/activities";

const speech = jest.requireMock("expo-speech") as { speak: jest.Mock };
const lesson = lessonOf("u2-1", "story");

beforeEach(() => jest.clearAllMocks());

test("completes with an empty score once every line was heard", () => {
  const onComplete = jest.fn();
  renderActivity(
    <StoryActivity lesson={lesson} color="#2563EB" attemptKey="s:1" onComplete={onComplete} />,
  );
  expect(screen.getByText(lesson.storyTitle)).toBeTruthy();
  expect(screen.getByText(`${toArabicDigits(lesson.lines.length)} جملة متبقية`)).toBeTruthy();

  const first = lesson.lines[0].text;
  fireEvent.press(screen.getByRole("button", { name: first }));
  fireEvent.press(screen.getByRole("button", { name: first }));
  expect(speech.speak).toHaveBeenCalledWith(first, expect.anything());
  expect(screen.getByText(`${toArabicDigits(lesson.lines.length - 1)} جملة متبقية`)).toBeTruthy();
  expect(screen.queryByTestId("activity-done")).toBeNull();

  for (const line of lesson.lines.slice(1))
    fireEvent.press(screen.getByRole("button", { name: line.text }));
  fireEvent.press(screen.getByTestId("activity-done"));
  expect(onComplete).toHaveBeenCalledWith({ correct: 0, total: 0 });
});

test("resets heard lines when attemptKey changes", () => {
  const { rerenderActivity } = renderActivity(
    <StoryActivity lesson={lesson} color="#2563EB" attemptKey="s:1" onComplete={jest.fn()} />,
  );
  fireEvent.press(screen.getByRole("button", { name: lesson.lines[0].text }));
  rerenderActivity(
    <StoryActivity lesson={lesson} color="#2563EB" attemptKey="s:2" onComplete={jest.fn()} />,
  );
  expect(screen.getByText(`${toArabicDigits(lesson.lines.length)} جملة متبقية`)).toBeTruthy();
});

test("Done fires onComplete once even when tapped twice", () => {
  const onComplete = jest.fn();
  renderActivity(
    <StoryActivity lesson={lesson} color="#2563EB" attemptKey="s:1" onComplete={onComplete} />,
  );
  for (const line of lesson.lines) fireEvent.press(screen.getByRole("button", { name: line.text }));
  const done = screen.getByTestId("activity-done");
  fireEvent.press(done);
  fireEvent.press(done);
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId("activity-done")).toBeDisabled();
});

test("stops speech on a new attempt but not on unmount", () => {
  const stop = (jest.requireMock("expo-speech") as { stop: jest.Mock }).stop;
  const view = renderActivity(
    <StoryActivity lesson={lesson} color="#2563EB" attemptKey="s:1" onComplete={jest.fn()} />,
  );
  stop.mockClear();
  view.rerenderActivity(
    <StoryActivity lesson={lesson} color="#2563EB" attemptKey="s:1" onComplete={jest.fn()} />,
  );
  expect(stop).not.toHaveBeenCalled();
  view.rerenderActivity(
    <StoryActivity lesson={lesson} color="#2563EB" attemptKey="s:2" onComplete={jest.fn()} />,
  );
  expect(stop).toHaveBeenCalledTimes(1);
  stop.mockClear();
  // The lesson screen speaks its completion message while the activity unmounts.
  view.unmount();
  expect(stop).not.toHaveBeenCalled();
});
