import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import LessonScreen from "@/app/lesson/[lessonId]";
import { getLesson } from "@/content";
import { renderScreen, setParams } from "@/test-utils/screens";

const mockCompleteLesson = jest.fn();

jest.mock("@/context/ProgressContext", () => ({
  useProgress: () => ({ completeLesson: mockCompleteLesson }),
}));

jest.mock("@/components/activities", () => {
  const { Pressable, Text } = jest.requireActual("react-native");
  const Stub = ({ lesson, onComplete }: { lesson: { type: string }; onComplete: (s: { correct: number; total: number }) => void }) => (
    <Pressable testID="stub-complete" onPress={() => onComplete({ correct: 5, total: 5 })}>
      <Text>{`stub:${lesson.type}`}</Text>
    </Pressable>
  );
  const types = ["story", "naming", "letter_pick", "word_read", "listen_pick", "behavior", "matching", "trace", "counting", "arithmetic"];
  return { ACTIVITY_COMPONENTS: Object.fromEntries(types.map((type) => [type, Stub])) };
});

const speech = jest.requireMock("expo-speech") as { speak: jest.Mock };

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});
afterEach(() => jest.useRealTimers());

test("plays the lesson activity and shows the completion card with 3 stars", () => {
  setParams({ lessonId: "u2-3" });
  const lesson = getLesson("u2-3")!.lesson;
  renderScreen(<LessonScreen />);

  expect(screen.getByText(lesson.title)).toBeTruthy();
  expect(screen.getByText(lesson.subtitle)).toBeTruthy();
  expect(screen.getByText("stub:letter_pick")).toBeTruthy();
  act(() => jest.advanceTimersByTime(500));
  expect(speech.speak).toHaveBeenCalledWith(lesson.title, expect.anything());

  fireEvent.press(screen.getByTestId("stub-complete"));
  expect(mockCompleteLesson).toHaveBeenCalledWith("u2-3", 3);
  expect(screen.getByTestId("lesson-complete")).toBeTruthy();
  expect(screen.getAllByTestId("star-earned")).toHaveLength(3);
  expect(screen.getByText(getLesson("u2-4")!.lesson.title)).toBeTruthy();

  fireEvent.press(screen.getByTestId("repeat-lesson"));
  expect(screen.getByText("stub:letter_pick")).toBeTruthy();
});

test("unknown lesson id shows the not found card", () => {
  setParams({ lessonId: "nope" });
  renderScreen(<LessonScreen />);
  expect(screen.getByTestId("not-found")).toBeTruthy();
  expect(screen.getByText("الدرس غير موجود")).toBeTruthy();
});
