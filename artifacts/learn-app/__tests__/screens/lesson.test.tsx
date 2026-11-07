import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import LessonScreen from "@/app/lesson/[lessonId]";
import { getLesson } from "@/content";
import { DEMOS } from "@/content/demos";
import { instructionFor } from "@/content/instructions";
import { routes } from "@/lib/routes";
import { resetDemoSeenCache } from "@/hooks/useDemoSeen";
import { estimateSpeechMs } from "@/lib/speech";
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
    "build_word",
    "picture_choice",
    "compare",
    "number_fill",
    "sort",
  ];
  return { ACTIVITY_COMPONENTS: Object.fromEntries(types.map((type) => [type, Stub])) };
});

/** The demo player is tested on its own; here it is a stub that ends on a press. */
jest.mock("@/components/demo/DemoPlayer", () => {
  const { Pressable, Text } = jest.requireActual("react-native");
  type MockDemoProps = { type: string; preface?: string; onDone: () => void };
  return {
    DemoPlayer: ({ type, preface, onDone }: MockDemoProps) => (
      <Pressable testID="demo-stub" onPress={onDone}>
        <Text>{`demo:${type}:${preface ?? ""}`}</Text>
      </Pressable>
    ),
  };
});

type SpeakOptions = { onDone?: () => void };
const speech = jest.requireMock("expo-speech") as { speak: jest.Mock; stop: jest.Mock };
const { router } = jest.requireMock("expo-router") as {
  router: { back: jest.Mock; replace: jest.Mock };
};
const lesson = getLesson("u2-2")!.lesson;
const instruction = instructionFor(lesson)!;

/** expo-speech finishes every utterance at once. */
const speechFinishes = () =>
  speech.speak.mockImplementation((_: string, options?: SpeakOptions) => options?.onDone?.());

beforeEach(() => {
  jest.clearAllMocks();
  speech.speak.mockReset();
  jest.useFakeTimers();
  mockCanGoBack(true);
  setParams({ lessonId: "u2-2" });
  // Every demo seen, unless a test says otherwise.
  resetDemoSeenCache(Object.keys(DEMOS));
});
afterEach(() => jest.useRealTimers());

test("speaks the title, then the instruction, and mounts the activity once both are spoken", () => {
  const order: string[] = [];
  speech.speak.mockImplementation((text: string, options?: SpeakOptions) => {
    order.push(`speak:${text}`);
    options?.onDone?.();
  });
  renderScreen(<LessonScreen />);
  expect(order).toEqual([`speak:${lesson.title}`, `speak:${instruction}`]);
  expect(screen.getByText(lesson.title)).toBeTruthy();
  expect(screen.getByText(lesson.subtitle)).toBeTruthy();
  expect(screen.getByText("stub:letter_pick")).toBeTruthy();
});

test("waits for the instruction before mounting the activity", () => {
  let finishInstruction: (() => void) | undefined;
  speech.speak.mockImplementation((text: string, options?: SpeakOptions) => {
    if (text === instruction) finishInstruction = options?.onDone;
    else options?.onDone?.();
  });
  renderScreen(<LessonScreen />);
  expect(screen.queryByText("stub:letter_pick")).toBeNull();
  act(() => finishInstruction?.());
  expect(screen.getByText("stub:letter_pick")).toBeTruthy();
});

test("mounts the activity after the fallbacks when speech never reports back", () => {
  renderScreen(<LessonScreen />);
  expect(speech.speak).toHaveBeenCalledWith(lesson.title, expect.anything());
  expect(screen.queryByText("stub:letter_pick")).toBeNull();
  act(() => jest.advanceTimersByTime(1499));
  expect(speech.speak).not.toHaveBeenCalledWith(instruction, expect.anything());
  act(() => jest.advanceTimersByTime(1));
  expect(speech.speak).toHaveBeenCalledWith(instruction, expect.anything());
  expect(screen.queryByText("stub:letter_pick")).toBeNull();
  act(() => jest.advanceTimersByTime(estimateSpeechMs(instruction)));
  expect(screen.getByText("stub:letter_pick")).toBeTruthy();
});

test("a late report from the stopped title does not skip the instruction", () => {
  const callbacks: (() => void)[] = [];
  speech.speak.mockImplementation((_: string, options?: SpeakOptions) => {
    if (options?.onDone) callbacks.push(options.onDone);
  });
  renderScreen(<LessonScreen />);
  act(() => callbacks[0]());
  act(() => callbacks[0]());
  expect(screen.queryByText("stub:letter_pick")).toBeNull();
  act(() => callbacks[1]());
  expect(screen.getByText("stub:letter_pick")).toBeTruthy();
});

test("maths lessons speak only the title: their rounds speak the task", () => {
  speechFinishes();
  setParams({ lessonId: "math-u3-1" });
  renderScreen(<LessonScreen />);
  expect(speech.speak).toHaveBeenCalledTimes(1);
});

describe("worked example", () => {
  test("plays after the intro the first time a type comes up, then the activity starts", () => {
    resetDemoSeenCache([]);
    speechFinishes();
    renderScreen(<LessonScreen />);
    expect(screen.getByText("demo:letter_pick:")).toBeTruthy();
    expect(screen.queryByText("stub:letter_pick")).toBeNull();
    fireEvent.press(screen.getByTestId("demo-stub"));
    expect(screen.queryByTestId("demo-stub")).toBeNull();
    expect(screen.getByText("stub:letter_pick")).toBeTruthy();
  });

  test("waits for the intro before it starts", () => {
    resetDemoSeenCache([]);
    renderScreen(<LessonScreen />);
    expect(screen.queryByTestId("demo-stub")).toBeNull();
  });

  test("is not shown again for a type the child has seen", () => {
    resetDemoSeenCache([]);
    speechFinishes();
    const first = renderScreen(<LessonScreen />);
    fireEvent.press(screen.getByTestId("demo-stub"));
    first.unmount();
    renderScreen(<LessonScreen />);
    expect(screen.queryByTestId("demo-stub")).toBeNull();
    expect(screen.getByText("stub:letter_pick")).toBeTruthy();
  });

  test("other types still get their own demo", () => {
    resetDemoSeenCache(["letter_pick"]);
    speechFinishes();
    setParams({ lessonId: "u2-3" });
    renderScreen(<LessonScreen />);
    expect(screen.getByText("demo:word_read:")).toBeTruthy();
  });

  test("the help button replays it with the instruction, keeping the activity's place", () => {
    speechFinishes();
    renderScreen(<LessonScreen />);
    const activity = screen.getByText("stub:letter_pick");
    fireEvent.press(screen.getByTestId("help-button"));
    expect(screen.getByText(`demo:letter_pick:${instruction}`)).toBeTruthy();
    // Hidden, not unmounted.
    expect(screen.queryByText("stub:letter_pick")).toBeNull();
    expect(screen.getByText("stub:letter_pick", { includeHiddenElements: true })).toBe(activity);
    expect(screen.getByTestId("help-button").props.accessibilityState.disabled).toBe(true);
    fireEvent.press(screen.getByTestId("demo-stub"));
    expect(screen.queryByTestId("demo-stub")).toBeNull();
    expect(screen.getByText("stub:letter_pick")).toBe(activity);
  });

  test("the help button waits for the intro", () => {
    renderScreen(<LessonScreen />);
    expect(screen.getByTestId("help-button").props.accessibilityState.disabled).toBe(true);
  });

  test("maths types get a demo too, without an instruction before it", () => {
    speechFinishes();
    setParams({ lessonId: "math-u3-1" });
    renderScreen(<LessonScreen />);
    fireEvent.press(screen.getByTestId("help-button"));
    expect(screen.getByText(/^demo:[a-z_]+:$/)).toBeTruthy();
  });
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
