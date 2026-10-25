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
  expect(screen.getByText("أَحْسَنْت! ٣/٥ صحيح 🌟 تابع")).toBeTruthy();
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
