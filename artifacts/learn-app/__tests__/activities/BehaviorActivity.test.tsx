import { fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { BehaviorActivity } from "@/components/activities/BehaviorActivity";
import { lessonOf, renderActivity } from "@/test-utils/activities";

const lesson = lessonOf("u1-3", "behavior");

test("each behavior is answered once and scored against isCorrect", () => {
  const onComplete = jest.fn();
  renderActivity(
    <BehaviorActivity lesson={lesson} color="#D97706" attemptKey="b:1" onComplete={onComplete} />,
  );
  const answers = [true, true, true, false, false]; // right, wrong, right, wrong, right
  lesson.behaviors.forEach((item, i) => {
    fireEvent.press(
      screen.getByRole("button", {
        name: `${answers[i] ? "سلوك صحيح" : "سلوك خطأ"}: ${item.description}`,
      }),
    );
    expect(screen.queryByRole("button", { name: `سلوك صحيح: ${item.description}` })).toBeNull();
  });
  expect(screen.getByLabelText("أَحْسَنْت! ٣/٥ صحيح 🌟 تابع")).toBeTruthy();
  fireEvent.press(screen.getByTestId("activity-done"));
  expect(onComplete).toHaveBeenCalledWith({ correct: 3, total: 5 });
});

test("no Done button until every behavior is answered", () => {
  renderActivity(
    <BehaviorActivity lesson={lesson} color="#D97706" attemptKey="b:1" onComplete={jest.fn()} />,
  );
  fireEvent.press(
    screen.getByRole("button", { name: `سلوك صحيح: ${lesson.behaviors[0].description}` }),
  );
  expect(screen.queryByTestId("activity-done")).toBeNull();
});

const Speech = jest.requireMock("expo-speech") as { speak: jest.Mock };

describe("for children who cannot read yet", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Speech.speak.mockClear();
  });
  afterEach(() => jest.useRealTimers());

  const spoken = () => Speech.speak.mock.calls.map((c) => c[0] as string);

  test("every behavior of unit 1 has a picture that shows the deed", () => {
    expect(lesson.behaviors.map((b) => b.scene)).toEqual([
      "reading",
      "littering",
      "helpmother",
      "cleanschool",
      "takepen",
    ]);
  });

  test("one behavior at a time: its picture is shown and its sentence read aloud", () => {
    renderActivity(
      <BehaviorActivity lesson={lesson} color="#D97706" attemptKey="b:1" onComplete={jest.fn()} />,
    );
    expect(screen.getByTestId("behavior-scene-reading")).toBeTruthy();
    expect(screen.queryByTestId("behavior-right-1")).toBeNull();
    jest.advanceTimersByTime(500);
    expect(spoken()).toContain(lesson.behaviors[0].description);

    // Tapping the picture reads it again.
    Speech.speak.mockClear();
    fireEvent.press(screen.getByTestId("behavior-picture-0"));
    expect(spoken()).toEqual([lesson.behaviors[0].description]);
  });

  test("a wrong answer says what the behavior was, then the next one is read aloud", () => {
    renderActivity(
      <BehaviorActivity lesson={lesson} color="#D97706" attemptKey="b:1" onComplete={jest.fn()} />,
    );
    jest.advanceTimersByTime(500);
    Speech.speak.mockClear();
    // Reading a book is right; the child taps ✗.
    fireEvent.press(screen.getByTestId("behavior-wrong-0"));
    expect(spoken()[0]).toBe("هٰذَا سُلُوكٌ صَحِيحٌ.");
    // The feedback ends (onDone of the last part), then the next sentence follows.
    const options = Speech.speak.mock.calls[0][1] as { onDone?: () => void };
    options.onDone?.();
    expect(spoken()).toContain(lesson.behaviors[1].description);
    expect(screen.getByTestId("behavior-scene-littering")).toBeTruthy();
  });
});
