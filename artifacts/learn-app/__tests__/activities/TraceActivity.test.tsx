import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { State, type PanGesture } from "react-native-gesture-handler";
import { fireGestureHandler, getByGestureTestId } from "react-native-gesture-handler/jest-utils";
import { TraceActivity } from "@/components/activities/TraceActivity";
import { lessonOf, renderActivity } from "@/test-utils/activities";

const speech = jest.requireMock("expo-speech") as { speak: jest.Mock };
const haptics = jest.requireMock("expo-haptics") as { notificationAsync: jest.Mock };
const lesson = lessonOf("u2-4", "trace");

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

/** Simulates the first layout pass; strokes are ignored before it. */
function layout(width = 300) {
  fireEvent(screen.getByTestId("trace-measure"), "layout", {
    nativeEvent: { layout: { x: 0, y: 0, width, height: 500 } },
  });
}

/** Draws a diagonal across a 300 px pad through the real Pan gesture callbacks. */
function drawDiagonal() {
  const points = Array.from({ length: 12 }, (_, i) => ({ x: 30 + i * 20, y: 30 + i * 20 }));
  act(() =>
    fireGestureHandler<PanGesture>(getByGestureTestId("trace-pad"), [
      { state: State.BEGAN, ...points[0] },
      ...points.slice(1, -1).map((p) => ({ state: State.ACTIVE, ...p })),
      { state: State.END, ...points[points.length - 1] },
    ]),
  );
  act(() => jest.runOnlyPendingTimers());
}

test("renders the guide and label and speaks the first target", () => {
  renderActivity(
    <TraceActivity lesson={lesson} color="#7C3AED" attemptKey="t:1" onComplete={jest.fn()} />,
  );
  expect(screen.getAllByText(lesson.targets[0].guide).length).toBeGreaterThanOrEqual(2); // label + guide
  expect(speech.speak).toHaveBeenCalledWith(lesson.targets[0].tts, expect.anything());
  expect(screen.getByText("مسح")).toBeTruthy();
  expect(screen.getByText("تم")).toBeTruthy();
});

test("Done with no strokes shows the error banner and does not complete", () => {
  const onComplete = jest.fn();
  renderActivity(
    <TraceActivity lesson={lesson} color="#7C3AED" attemptKey="t:1" onComplete={onComplete} />,
  );
  fireEvent.press(screen.getByTestId("trace-done"));
  expect(screen.getByTestId("trace-error")).toHaveTextContent("اِرسم خطاً واحداً على الأقل ✏️");
  expect(haptics.notificationAsync).toHaveBeenCalledWith("warning");
  expect(speech.speak).toHaveBeenLastCalledWith("حاول مرة أخرى", expect.anything());
  act(() => jest.advanceTimersByTime(3000));
  expect(screen.queryByTestId("trace-error")).toBeNull();
  expect(onComplete).not.toHaveBeenCalled();
});

test("valid strokes advance through every target and complete with an empty score", () => {
  const onComplete = jest.fn();
  renderActivity(
    <TraceActivity lesson={lesson} color="#7C3AED" attemptKey="t:1" onComplete={onComplete} />,
  );
  layout();
  lesson.targets.forEach((target, i) => {
    expect(speech.speak).toHaveBeenCalledWith(target.tts, expect.anything());
    drawDiagonal();
    fireEvent.press(screen.getByTestId("trace-done"));
    expect(screen.queryByTestId("trace-error")).toBeNull();
    // Locked while the success feedback shows.
    fireEvent.press(screen.getByTestId("trace-done"));
    act(() => jest.advanceTimersByTime(900));
    if (i < lesson.targets.length - 1) expect(onComplete).not.toHaveBeenCalled();
  });
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(onComplete).toHaveBeenCalledWith({ correct: 0, total: 0 });
});

test("Clear removes the drawn strokes", () => {
  renderActivity(
    <TraceActivity lesson={lesson} color="#7C3AED" attemptKey="t:1" onComplete={jest.fn()} />,
  );
  layout();
  drawDiagonal();
  fireEvent.press(screen.getByTestId("trace-clear"));
  fireEvent.press(screen.getByTestId("trace-done"));
  expect(screen.getByTestId("trace-error")).toBeTruthy();
});

test("ignores strokes before the first layout and clears them when the pad is resized", () => {
  renderActivity(
    <TraceActivity lesson={lesson} color="#7C3AED" attemptKey="t:1" onComplete={jest.fn()} />,
  );
  drawDiagonal(); // not measured yet: ignored
  fireEvent.press(screen.getByTestId("trace-done"));
  expect(screen.getByTestId("trace-error")).toHaveTextContent("اِرسم خطاً واحداً على الأقل ✏️");

  layout(300);
  drawDiagonal();
  layout(320); // resize drops the strokes
  fireEvent.press(screen.getByTestId("trace-done"));
  expect(screen.getByTestId("trace-error")).toHaveTextContent("اِرسم خطاً واحداً على الأقل ✏️");
});

test("pad exposes the target label and a drawing hint", () => {
  renderActivity(
    <TraceActivity lesson={lesson} color="#7C3AED" attemptKey="t:1" onComplete={jest.fn()} />,
  );
  const pad = screen.getByTestId("trace-pad");
  expect(pad.props.accessibilityLabel).toBe(lesson.targets[0].label);
  expect(pad.props.accessibilityHint).toBe("ارسم بإصبعك");
});

test("completes through the latest onComplete when the parent re-renders during the delay", () => {
  const one = lessonOf("u2-4", "trace");
  const single = { ...one, targets: one.targets.slice(0, 1) };
  const first = jest.fn();
  const latest = jest.fn();
  const view = renderActivity(
    <TraceActivity lesson={single} color="#7C3AED" attemptKey="t:1" onComplete={first} />,
  );
  layout();
  drawDiagonal();
  fireEvent.press(screen.getByTestId("trace-done"));
  view.rerenderActivity(
    <TraceActivity lesson={single} color="#7C3AED" attemptKey="t:1" onComplete={latest} />,
  );
  act(() => jest.advanceTimersByTime(900));
  expect(first).not.toHaveBeenCalled();
  expect(latest).toHaveBeenCalledWith({ correct: 0, total: 0 });
});
