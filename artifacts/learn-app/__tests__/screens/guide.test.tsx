import { act, fireEvent, renderHook, screen } from "@testing-library/react-native";
import React from "react";

import { useQuiz } from "@/components/activities/shared/useQuiz";
import {
  GuideProvider,
  LessonGuide,
  useGuide,
  useGuideState,
} from "@/components/world/LessonGuide";
import { lessonOf } from "@/test-utils/activities";
import { renderScreen } from "@/test-utils/screens";

const Speech = jest.requireMock("expo-speech") as { speak: jest.Mock };

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

/** A lesson screen in miniature: Hudhud above, an activity below reporting to him. */
function Lesson({ onReady }: { onReady: (api: ReturnType<typeof useGuide>) => void }) {
  const guide = useGuideState();
  return (
    <GuideProvider api={guide.api}>
      <LessonGuide text={guide.line ?? "اِسْمَعِ الْحَرْفَ، وَابْحَثْ عَنْهُ."} mood={guide.mood} />
      <Activity onReady={onReady} />
    </GuideProvider>
  );
}
function Activity({ onReady }: { onReady: (api: ReturnType<typeof useGuide>) => void }) {
  onReady(useGuide());
  return null;
}

test("Hudhud tells the task, says it again when tapped, and reacts to answers", () => {
  let api: ReturnType<typeof useGuide> | null = null;
  renderScreen(<Lesson onReady={(a) => (api = a)} />);
  const guide = screen.getByTestId("lesson-guide");
  expect(guide).toHaveTextContent("اِسْمَعِ الْحَرْفَ، وَابْحَثْ عَنْهُ.");
  fireEvent.press(guide);
  expect(Speech.speak).toHaveBeenLastCalledWith(
    "اِسْمَعِ الْحَرْفَ، وَابْحَثْ عَنْهُ.",
    expect.anything(),
  );

  act(() => api!.react("right"));
  expect(screen.getByTestId("lesson-guide-right")).toBeTruthy();
  act(() => jest.advanceTimersByTime(1000));
  expect(screen.getByTestId("lesson-guide-idle")).toBeTruthy();
  act(() => api!.react("wrong"));
  expect(screen.getByTestId("lesson-guide-wrong")).toBeTruthy();
});

test("during a worked example the bubble shows what Hudhud explains, then the task again", () => {
  let api: ReturnType<typeof useGuide> | null = null;
  renderScreen(<Lesson onReady={(a) => (api = a)} />);
  act(() => api!.say("شَاهِدْ: أَضْغَطُ عَلَى الْحَرْفِ."));
  expect(screen.getByTestId("lesson-guide")).toHaveTextContent(
    "شَاهِدْ: أَضْغَطُ عَلَى الْحَرْفِ.",
  );
  act(() => api!.say(null));
  expect(screen.getByTestId("lesson-guide")).toHaveTextContent(
    "اِسْمَعِ الْحَرْفَ، وَابْحَثْ عَنْهُ.",
  );
});

test("every quiz answer reaches Hudhud", () => {
  const react = jest.fn();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <GuideProvider api={{ react, say: jest.fn() }}>{children}</GuideProvider>
  );
  const lesson = lessonOf("u2-2", "letter_pick");
  const { result } = renderHook(
    () => useQuiz({ lesson, total: 2, onComplete: jest.fn(), autoAdvanceMs: 900 }),
    { wrapper },
  );
  act(() => {
    result.current.pick(0, false);
  });
  act(() => {
    result.current.pick(1, true);
  });
  expect(react.mock.calls).toEqual([["wrong"], ["right"]]);
});
