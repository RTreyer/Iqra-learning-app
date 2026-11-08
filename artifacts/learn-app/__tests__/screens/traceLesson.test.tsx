import { fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { ScrollView } from "react-native";
import LessonScreen from "@/app/lesson/[lessonId]";
import { books } from "@/content";
import { DEMO_IDS } from "@/content/demos";
import { resetDemoSeenCache } from "@/hooks/useDemoSeen";
import { mockCanGoBack, renderScreen, setParams } from "@/test-utils/screens";

jest.mock("@/context/ProgressContext", () => {
  const progress = { version: 2, lessons: {}, items: {}, activity: { days: [] }, totalStars: 0 };
  return {
    useProgress: () => ({
      progress,
      completeLesson: jest.fn(),
      recordRoundResult: jest.fn(),
      getLessonProgress: () => ({ completed: false, stars: 0 }),
    }),
  };
});

jest.mock("@/components/activities", () => {
  const { Pressable, Text } = jest.requireActual("react-native");
  type MockStubProps = {
    lesson: { type: string };
    onComplete: (s: { correct: number; total: number }) => void;
  };
  const Stub = ({ lesson, onComplete }: MockStubProps) => (
    <Pressable testID="stub-complete" onPress={() => onComplete({ correct: 5, total: 5 })}>
      <Text>{`stub:${lesson.type}`}</Text>
    </Pressable>
  );
  return { ACTIVITY_COMPONENTS: { trace: Stub } };
});

type SpeakOptions = { onDone?: () => void };
const speech = jest.requireMock("expo-speech") as { speak: jest.Mock };
const trace = books
  .flatMap((b) => b.units.flatMap((u) => u.lessons))
  .find((l) => l.type === "trace")!;

beforeEach(() => {
  jest.clearAllMocks();
  speech.speak.mockImplementation((_: string, options?: SpeakOptions) => options?.onDone?.());
  jest.useFakeTimers();
  mockCanGoBack(true);
  resetDemoSeenCache(DEMO_IDS);
  setParams({ lessonId: trace.id });
});
afterEach(() => jest.useRealTimers());

test("a trace lesson does not scroll while drawing, but its completion card does", () => {
  renderScreen(<LessonScreen />);
  expect(screen.getByText("stub:trace")).toBeTruthy();
  expect(screen.UNSAFE_queryAllByType(ScrollView)).toHaveLength(0);
  fireEvent.press(screen.getByTestId("stub-complete"));
  expect(screen.getByTestId("lesson-complete")).toBeTruthy();
  const [scroll] = screen.UNSAFE_queryAllByType(ScrollView);
  expect(scroll).toBeTruthy();
  expect(scroll.props.scrollEnabled).not.toBe(false);
});
