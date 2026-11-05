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
  speech.speak.mockClear();
  act(() => jest.advanceTimersByTime(900));
  act(() => jest.advanceTimersByTime(400));
  // Same prompt in round 2: not spoken again.
  expect(speech.speak).not.toHaveBeenCalledWith("مَا الشَّكْلُ الْمُخْتَلِفُ؟", expect.anything());
  // The model and the matching choice both carry the apple label.
  expect(screen.getAllByLabelText("🍎").length).toBeGreaterThanOrEqual(2);
  fireEvent.press(screen.getByRole("button", { name: "🍌" }));
  act(() => jest.advanceTimersByTime(900));
  expect(onComplete).toHaveBeenCalledWith({ correct: 1, total: 2 });
});
