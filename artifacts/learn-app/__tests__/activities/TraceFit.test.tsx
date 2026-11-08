import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { StyleSheet } from "react-native";
import { State } from "react-native-gesture-handler";
import { fireGestureHandler, getByGestureTestId } from "react-native-gesture-handler/jest-utils";
import { TraceActivity } from "@/components/activities/TraceActivity";
import { lessonOf, renderActivity } from "@/test-utils/activities";

const lesson = lessonOf("u2-4", "trace");

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

function render() {
  renderActivity(
    <TraceActivity lesson={lesson} color="#7C3AED" attemptKey="t:1" onComplete={jest.fn()} />,
  );
}

const padWidth = () => StyleSheet.flatten(screen.getByTestId("trace-pad").props.style).width;

function layout(width: number, height: number) {
  fireEvent(screen.getByTestId("trace-measure"), "layout", {
    nativeEvent: { layout: { x: 0, y: 0, width, height } },
  });
}

function draw() {
  const points = Array.from({ length: 6 }, (_, i) => ({ x: 20 + i * 20, y: 20 + i * 20 }));
  act(() =>
    fireGestureHandler(getByGestureTestId("trace-pad"), [
      { state: State.BEGAN, ...points[0] },
      ...points.slice(1, -1).map((p) => ({ state: State.ACTIVE, ...p })),
      { state: State.END, ...points[points.length - 1] },
    ]),
  );
  act(() => jest.runOnlyPendingTimers());
}

test("on a short screen the pad shrinks so the Clear and Done buttons stay on it", () => {
  render();
  layout(320, 1000);
  expect(padWidth()).toBe(320);
  // A 360 x 640 phone leaves little height below the header and Hudhud.
  layout(320, 300);
  expect(padWidth()).toBeLessThanOrEqual(300 - 62 - 12);
  // Once the buttons have measured themselves, the pad uses exactly the room left.
  fireEvent(screen.getByTestId("trace-controls"), "layout", {
    nativeEvent: { layout: { x: 0, y: 0, width: 320, height: 70 } },
  });
  expect(padWidth()).toBe(300 - 70 - 12);
  // Never more than the maximum on a big screen.
  layout(800, 1200);
  expect(padWidth()).toBe(340);
});

test("the touch box and the drawing share one box: the border is drawn over the pad", () => {
  render();
  const pad = StyleSheet.flatten(screen.getByTestId("trace-pad").props.style);
  expect(pad.borderWidth ?? 0).toBe(0);
});

test("one finger draws: the pan gesture takes a single pointer", () => {
  render();
  const gesture = getByGestureTestId("trace-pad") as unknown as Record<string, unknown>;
  expect(JSON.stringify(gesture, (_k, v) => (typeof v === "function" ? undefined : v))).toMatch(
    /"maxPointers":1/,
  );
});

test("the red pad clears together with the message", () => {
  render();
  layout(300, 600);
  draw();
  fireEvent.press(screen.getByTestId("trace-done"));
  expect(screen.getByTestId("trace-error")).toBeTruthy();
  const red = () => StyleSheet.flatten(screen.getByTestId("trace-pad").props.style).backgroundColor;
  const error = red();
  act(() => jest.advanceTimersByTime(3000));
  expect(screen.queryByTestId("trace-error")).toBeNull();
  expect(red()).not.toBe(error);
});

test("the message does not change the pad's size, so the drawing stays", () => {
  render();
  layout(300, 400);
  const before = padWidth();
  draw();
  fireEvent.press(screen.getByTestId("trace-done"));
  expect(screen.getByTestId("trace-error")).toBeTruthy();
  expect(padWidth()).toBe(before);
});
