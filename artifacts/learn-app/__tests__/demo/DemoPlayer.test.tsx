import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";

import { PRAISE } from "@/components/activities/shared/strings";
import { DemoPlayer } from "@/components/demo/DemoPlayer";
import { DEMOS, DEMO_END, DEMO_IDS, DEMO_START, type DemoId } from "@/content/demos";
import { renderScreen } from "@/test-utils/screens";

type SpeakOptions = { onDone?: () => void };
const speech = jest.requireMock("expo-speech") as { speak: jest.Mock; stop: jest.Mock };

const spoken = () => speech.speak.mock.calls.map(([text]) => text as string);

/** Advances fake time until the demo reports that it is done. */
async function playThrough(onDone: jest.Mock) {
  for (let i = 0; i < 600 && onDone.mock.calls.length === 0; i++) {
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
  }
}

let warn: jest.SpyInstance;
beforeEach(() => {
  jest.useFakeTimers();
  speech.speak.mockReset();
  speech.speak.mockImplementation((_: string, options?: SpeakOptions) => options?.onDone?.());
  warn = jest.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  warn.mockRestore();
  jest.useRealTimers();
});

/** Types where every tap answers a question, so each tap must be praised as right. */
const PRAISES: Partial<Record<DemoId, number>> = {
  letter_pick: 1,
  word_read: 1,
  listen_pick: 1,
  behavior: 2,
  matching: 2,
  trace: 1,
  trace_lines: 1,
  counting: 1,
  arithmetic: 1,
  picture_choice: 1,
  compare: 1,
  number_fill: 1,
  sort: 1,
};

test.each(DEMO_IDS)("the %s demo finds every element, solves the example and ends", async (id) => {
  const onDone = jest.fn();
  renderScreen(<DemoPlayer id={id} color="#2563EB" onDone={onDone} />);
  await playThrough(onDone);

  expect(onDone).toHaveBeenCalledTimes(1);
  expect(warn).not.toHaveBeenCalled();
  const said = spoken();
  expect(said[0]).toBe(DEMO_START);
  expect(said[said.length - 1]).toBe(DEMO_END);
  // Every narration is spoken, in order.
  const narration = DEMOS[id].steps.flatMap((s) => ("say" in s ? [s.say] : []));
  expect(said.filter((text) => narration.includes(text))).toEqual(narration);
  const praised = said.filter((text) => text.includes(PRAISE)).length;
  expect(praised).toBeGreaterThanOrEqual(PRAISES[id] ?? 0);
  expect(said).not.toContain("حاول مرة أخرى");
});

test("the child's touches do not reach the example", async () => {
  const onDone = jest.fn();
  renderScreen(<DemoPlayer id="letter_pick" color="#2563EB" onDone={onDone} />);
  await act(async () => {
    jest.advanceTimersByTime(100);
  });
  expect(screen.getByTestId("demo-blocker").props.onStartShouldSetResponder()).toBe(true);
});

test("a preface is spoken first, before the demo starts", async () => {
  const onDone = jest.fn();
  renderScreen(<DemoPlayer id="naming" color="#2563EB" preface="تعليمات" onDone={onDone} />);
  await playThrough(onDone);
  expect(spoken().slice(0, 2)).toEqual(["تعليمات", DEMO_START]);
});

test("Skip ends the demo at once and stops speech", async () => {
  const onDone = jest.fn();
  speech.speak.mockImplementation(() => {});
  renderScreen(<DemoPlayer id="matching" color="#2563EB" onDone={onDone} />);
  speech.stop.mockClear();
  fireEvent.press(screen.getByTestId("demo-skip"));
  expect(onDone).toHaveBeenCalledTimes(1);
  expect(speech.stop).toHaveBeenCalled();
});

test("unmounting stops the demo: nothing more is spoken", async () => {
  const onDone = jest.fn();
  const { unmount } = renderScreen(<DemoPlayer id="story" color="#2563EB" onDone={onDone} />);
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
  unmount();
  const before = speech.speak.mock.calls.length;
  await act(async () => {
    jest.advanceTimersByTime(20000);
  });
  expect(speech.speak.mock.calls.length).toBe(before);
  expect(onDone).not.toHaveBeenCalled();
});
