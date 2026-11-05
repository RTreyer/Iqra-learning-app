import { act, fireEvent, screen, within } from "@testing-library/react-native";
import React from "react";
import {
  PictureChoiceActivity,
  patternPicSize,
} from "@/components/activities/PictureChoiceActivity";
import type { Lesson } from "@/content/types";
import { renderActivity } from "@/test-utils/activities";

const lesson: Extract<Lesson, { type: "picture_choice" }> = {
  id: "math-u1-1",
  number: 1,
  title: "أُصَنِّفُ",
  subtitle: "",
  emoji: "🔺",
  color: "#7C3AED",
  type: "picture_choice",
  rounds: [
    {
      prompt: "مَا الشَّكْلُ الْمُخْتَلِفُ؟",
      choices: [
        [{ shape: "circle", color: "red" }],
        [{ shape: "triangle", color: "red" }],
        [{ shape: "circle", color: "blue" }],
      ],
      correctIndex: 1,
    },
    {
      prompt: "مَا الشَّكْلُ الْمُخْتَلِفُ؟",
      model: { emoji: "🍎" },
      choices: [[{ emoji: "🍎" }], [{ emoji: "🍌" }]],
      correctIndex: 0,
    },
  ],
};

const speech = jest.requireMock("expo-speech") as { speak: jest.Mock };

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

test("speaks the task once, scores the first tap and completes", () => {
  const onComplete = jest.fn();
  renderActivity(
    <PictureChoiceActivity
      lesson={lesson}
      color="#7C3AED"
      attemptKey="x:1"
      onComplete={onComplete}
    />,
  );
  act(() => jest.advanceTimersByTime(400));
  expect(speech.speak).toHaveBeenCalledWith("مَا الشَّكْلُ الْمُخْتَلِفُ؟", expect.anything());
  fireEvent.press(screen.getByRole("button", { name: "مُثَلَّثٌ أَحْمَرُ" }));
  expect(screen.getByRole("button", { name: "دَائِرَةٌ زَرْقَاءُ" })).toBeDisabled();
  // A second tap in the same round is ignored.
  fireEvent.press(screen.getByRole("button", { name: "دَائِرَةٌ زَرْقَاءُ" }));
  speech.speak.mockClear();
  act(() => jest.advanceTimersByTime(900));
  act(() => jest.advanceTimersByTime(400));
  // Same prompt in round 2: not spoken again.
  expect(speech.speak).not.toHaveBeenCalledWith("مَا الشَّكْلُ الْمُخْتَلِفُ؟", expect.anything());
  // Only the model carries the picture label; the choice cards are buttons.
  expect(screen.getByRole("image", { name: "🍎" })).toBeTruthy();
  fireEvent.press(screen.getByRole("button", { name: "🍌" }));
  act(() => jest.advanceTimersByTime(900));
  expect(onComplete).toHaveBeenCalledWith({ correct: 1, total: 2 });
});

const orderedLesson: Extract<Lesson, { type: "picture_choice" }> = {
  ...lesson,
  rounds: [
    {
      prompt: "أَيْنَ الرَّابِعُ؟",
      ordered: true,
      choices: ["🐇", "🐢", "🐐", "🐄", "🐓"].map((emoji) => [{ emoji }]),
      correctIndex: 3,
    },
    {
      prompt: "كَمْ سَمَكَةً؟",
      choices: [[{ emoji: "🐟" }, { emoji: "🐟" }], []],
      correctIndex: 1,
    },
  ],
};

test("an ordered round keeps reading order and completes on the right card", () => {
  for (const key of ["a:1", "b:2"]) {
    const onComplete = jest.fn();
    const { unmount } = renderActivity(
      <PictureChoiceActivity
        lesson={{ ...orderedLesson, rounds: [orderedLesson.rounds[0]] }}
        color="#7C3AED"
        attemptKey={key}
        onComplete={onComplete}
      />,
    );
    expect(screen.getByTestId("pic-card-3").props.accessibilityLabel).toBe("🐄");
    fireEvent.press(screen.getByTestId("pic-card-3"));
    act(() => jest.advanceTimersByTime(900));
    expect(onComplete).toHaveBeenCalledWith({ correct: 1, total: 1 });
    unmount();
  }
});

test("the empty card is a button named empty and can be the answer", () => {
  const onComplete = jest.fn();
  renderActivity(
    <PictureChoiceActivity
      lesson={{ ...orderedLesson, rounds: [orderedLesson.rounds[1]] }}
      color="#7C3AED"
      attemptKey="c:1"
      onComplete={onComplete}
    />,
  );
  fireEvent.press(screen.getByRole("button", { name: "فَارِغٌ" }));
  act(() => jest.advanceTimersByTime(900));
  expect(onComplete).toHaveBeenCalledWith({ correct: 1, total: 1 });
});

test("an ordered row wraps in reading order, five cards per line", () => {
  renderActivity(
    <PictureChoiceActivity
      lesson={{ ...orderedLesson, rounds: [orderedLesson.rounds[0]] }}
      color="#7C3AED"
      attemptKey="d:1"
      onComplete={jest.fn()}
    />,
  );
  expect(screen.getByTestId("picture-choice-ordered-row")).toHaveStyle({
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: 256,
  });
});

const patternLesson: Extract<Lesson, { type: "picture_choice" }> = {
  ...lesson,
  rounds: [
    {
      prompt: "مَا التَّالِي؟",
      pattern: [{ emoji: "🐸" }, { emoji: "🐢" }, { emoji: "🐸" }],
      choices: [[{ emoji: "🐢" }], [{ emoji: "🐸" }]],
      correctIndex: 0,
    },
  ],
};

test("a pattern row is shown in reading order with an empty slot after it", () => {
  const onComplete = jest.fn();
  renderActivity(
    <PictureChoiceActivity
      lesson={patternLesson}
      color="#7C3AED"
      attemptKey="e:1"
      onComplete={onComplete}
    />,
  );
  const row = screen.getByTestId("picture-choice-pattern");
  expect(row).toHaveStyle({ flexDirection: "row-reverse" });
  // The row's pictures are images with their labels, in order; the empty slot comes last.
  expect(screen.getAllByRole("image", { name: "🐸" })).toHaveLength(2);
  expect(screen.getByRole("image", { name: "🐢" })).toBeTruthy();
  const order = within(row)
    .getAllByTestId(/^pattern-(pic|slot)/)
    .map((v) => v.props.testID);
  expect(order).toEqual(["pattern-pic-0", "pattern-pic-1", "pattern-pic-2", "pattern-slot"]);
  fireEvent.press(screen.getByRole("button", { name: "🐢" }));
  act(() => jest.advanceTimersByTime(900));
  expect(onComplete).toHaveBeenCalledWith({ correct: 1, total: 1 });
});

test("a long pattern shrinks so the row and its slot fit a phone", () => {
  const eight = Array.from({ length: 8 }, (_, i) => ({ emoji: i % 2 ? "🍏" : "🍎" }));
  renderActivity(
    <PictureChoiceActivity
      lesson={{ ...patternLesson, rounds: [{ ...patternLesson.rounds[0], pattern: eight }] }}
      color="#7C3AED"
      attemptKey="f:1"
      onComplete={jest.fn()}
    />,
  );
  const size = patternPicSize(8);
  expect(size).toBeLessThanOrEqual(36);
  expect(9 * size + 8 * 4).toBeLessThanOrEqual(300);
  expect(screen.getAllByRole("image", { name: "🍎" })[0]).toHaveStyle({ width: size });
  expect(screen.getByTestId("pattern-slot")).toHaveStyle({ width: size, height: size });
});

test("a size pattern keeps big and small apart inside equal cells", () => {
  const candles = [
    { emoji: "🕯️", size: "big" as const },
    { emoji: "🕯️", size: "small" as const },
    { emoji: "🕯️", size: "big" as const },
  ];
  renderActivity(
    <PictureChoiceActivity
      lesson={{ ...patternLesson, rounds: [{ ...patternLesson.rounds[0], pattern: candles }] }}
      color="#7C3AED"
      attemptKey="h:1"
      onComplete={jest.fn()}
    />,
  );
  const size = patternPicSize(3);
  expect(screen.getAllByRole("image", { name: "🕯️ كَبِيرٌ" })[0]).toHaveStyle({ width: size });
  const small = screen.getByRole("image", { name: "🕯️ صَغِيرٌ" });
  expect(small.props.style.width).toBeLessThan(size * 0.6);
  expect(screen.getByTestId("pattern-pic-1")).toHaveStyle({ width: size, height: size });
});

test("a short pattern keeps the normal picture size", () => {
  expect(patternPicSize(3)).toBe(52);
});

test("no pattern row without a pattern", () => {
  renderActivity(
    <PictureChoiceActivity
      lesson={lesson}
      color="#7C3AED"
      attemptKey="g:1"
      onComplete={jest.fn()}
    />,
  );
  expect(screen.queryByTestId("picture-choice-pattern")).toBeNull();
});
