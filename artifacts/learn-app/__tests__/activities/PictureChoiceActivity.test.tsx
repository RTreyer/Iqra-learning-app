import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { PictureChoiceActivity } from "@/components/activities/PictureChoiceActivity";
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
