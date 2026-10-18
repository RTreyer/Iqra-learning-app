import { fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { NamingActivity } from "@/components/activities/NamingActivity";
import { lessonOf, renderActivity } from "@/test-utils/activities";

const speech = jest.requireMock("expo-speech") as { speak: jest.Mock };
const lesson = lessonOf("u1-1", "naming");

beforeEach(() => jest.clearAllMocks());

test("speaks each word and completes once every item was tapped", () => {
  const onComplete = jest.fn();
  renderActivity(
    <NamingActivity lesson={lesson} color="#1D4ED8" attemptKey="n:1" onComplete={onComplete} />,
  );
  expect(screen.getByText(`${lesson.items.length} كلمة متبقية`)).toBeTruthy();

  const [first, ...rest] = lesson.items;
  fireEvent.press(screen.getByRole("button", { name: first.word }));
  expect(speech.speak).toHaveBeenCalledWith(first.word, expect.anything());
  expect(screen.getByText(`${lesson.items.length - 1} كلمة متبقية`)).toBeTruthy();

  for (const item of rest) fireEvent.press(screen.getByRole("button", { name: item.word }));
  expect(screen.queryByText(/كلمة متبقية/)).toBeNull();
  fireEvent.press(screen.getByTestId("activity-done"));
  expect(onComplete).toHaveBeenCalledWith({ correct: 0, total: 0 });
});
