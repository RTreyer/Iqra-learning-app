import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import LessonScreen from "@/app/lesson/[lessonId]";
import { getLesson } from "@/content";
import { routes } from "@/lib/routes";
import { mockCanGoBack, renderScreen, setParams } from "@/test-utils/screens";

const mockCompleteLesson = jest.fn();
const mockRecordRoundResult = jest.fn();

jest.mock("@/context/ProgressContext", () => ({
  useProgress: () => ({
    completeLesson: mockCompleteLesson,
    recordRoundResult: mockRecordRoundResult,
  }),
}));

jest.mock("@/components/activities", () => {
  const { Pressable, Text } = jest.requireActual("react-native");
  type MockStubProps = {
    lesson: { type: string };
    onComplete: (s: { correct: number; total: number }) => void;
    onRoundResult?: (itemId: string, correct: boolean) => void;
  };
  const Stub = ({ lesson, onComplete, onRoundResult }: MockStubProps) => (
    <>
      <Pressable testID="stub-complete" onPress={() => onComplete({ correct: 5, total: 5 })}>
        <Text>{`stub:${lesson.type}`}</Text>
      </Pressable>
      <Pressable testID="stub-round" onPress={() => onRoundResult?.("letter:ب", false)} />
    </>
  );
  const types = [
    "story",
    "naming",
    "letter_pick",
    "word_read",
    "listen_pick",
    "behavior",
    "matching",
    "trace",
    "counting",
    "arithmetic",
  ];
  return { ACTIVITY_COMPONENTS: Object.fromEntries(types.map((type) => [type, Stub])) };
});

type SpeakOptions = { onDone?: () => void };
const speech = jest.requireMock("expo-speech") as { speak: jest.Mock; stop: jest.Mock };
const { router } = jest.requireMock("expo-router") as {
  router: { back: jest.Mock; replace: jest.Mock };
};
const lesson = getLesson("u2-2")!.lesson;

/** expo-speech finishes every utterance at once. */
const speechFinishes = () =>
  speech.speak.mockImplementation((_: string, options?: SpeakOptions) => options?.onDone?.());

beforeEach(() => {
  jest.clearAllMocks();
  speech.speak.mockReset();
  jest.useFakeTimers();
  mockCanGoBack(true);
  setParams({ lessonId: "u2-2" });
});
afterEach(() => jest.useRealTimers());

test("speaks the title first and mounts the activity once it has been spoken", () => {
  const order: string[] = [];
  speech.speak.mockImplementation((text: string, options?: SpeakOptions) => {
    order.push(`speak:${text}`);
    options?.onDone?.();
  });
  renderScreen(<LessonScreen />);
  expect(order[0]).toBe(`speak:${lesson.title}`);
  expect(screen.getByText(lesson.title)).toBeTruthy();
  expect(screen.getByText(lesson.subtitle)).toBeTruthy();
  expect(screen.getByText("stub:letter_pick")).toBeTruthy();
});

test("mounts the activity after the fallback when speech never reports back", () => {
  renderScreen(<LessonScreen />);
  expect(speech.speak).toHaveBeenCalledWith(lesson.title, expect.anything());
  expect(screen.queryByText("stub:letter_pick")).toBeNull();
  act(() => jest.advanceTimersByTime(1499));
  expect(screen.queryByText("stub:letter_pick")).toBeNull();
  act(() => jest.advanceTimersByTime(1));
  expect(screen.getByText("stub:letter_pick")).toBeTruthy();
});

test("stops speaking on unmount", () => {
  const { unmount } = renderScreen(<LessonScreen />);
  speech.stop.mockClear();
  unmount();
  expect(speech.stop).toHaveBeenCalled();
});

test("completing the activity shows the completion card with 3 stars", () => {
  speechFinishes();
  renderScreen(<LessonScreen />);

  fireEvent.press(screen.getByTestId("stub-complete"));
  expect(mockCompleteLesson).toHaveBeenCalledWith("u2-2", 3);
  expect(screen.getByTestId("lesson-complete")).toBeTruthy();
  expect(screen.getAllByTestId("star-earned")).toHaveLength(3);
  expect(screen.getByText(getLesson("u2-3")!.lesson.title)).toBeTruthy();

  fireEvent.press(screen.getByTestId("repeat-lesson"));
  expect(screen.getByText("stub:letter_pick")).toBeTruthy();
});

test("round results from the activity are recorded through the progress context", () => {
  speechFinishes();
  renderScreen(<LessonScreen />);
  fireEvent.press(screen.getByTestId("stub-round"));
  expect(mockRecordRoundResult).toHaveBeenCalledTimes(1);
  expect(mockRecordRoundResult).toHaveBeenCalledWith("letter:ب", false);
});

test("back falls back to the unit when there is no history", () => {
  speechFinishes();
  mockCanGoBack(false);
  renderScreen(<LessonScreen />);
  fireEvent.press(screen.getByLabelText("رجوع"));
  expect(router.back).not.toHaveBeenCalled();
  expect(router.replace).toHaveBeenCalledWith(routes.unit("a2"));
});

test("unknown lesson id shows the not found card", () => {
  setParams({ lessonId: "nope" });
  renderScreen(<LessonScreen />);
  expect(screen.getByTestId("not-found")).toBeTruthy();
  expect(screen.getByText("الدرس غير موجود")).toBeTruthy();
});
