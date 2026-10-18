import { fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { ListenPickActivity } from "@/components/activities/ListenPickActivity";
import { lessonOf, renderActivity } from "@/test-utils/activities";

const lesson = lessonOf("u2-30", "listen_pick");
/** The choice card for `word` (the listen button may show the same word); revealed cards add "، صحيح/خطأ". */
const choice = (word: string) => {
  const node = screen
    .getAllByRole("button")
    .find(
      (n) =>
        n.props.accessibilityLabel === word ||
        String(n.props.accessibilityLabel).startsWith(`${word}، `),
    );
  if (!node) throw new Error(`No choice ${word}`);
  return node;
};

test("first tap scoring and itemIds per question", () => {
  const onComplete = jest.fn();
  const onRoundResult = jest.fn();
  renderActivity(
    <ListenPickActivity
      lesson={lesson}
      color="#DB2777"
      attemptKey="l:1"
      onComplete={onComplete}
      onRoundResult={onRoundResult}
    />,
  );
  expect(screen.getByText(lesson.questions[0].word)).toBeTruthy();
  for (const word of ["بَـ", "دَا", "تَـ", "لَا", "دَا", "نَا"]) {
    fireEvent.press(choice(word));
    expect(choice(word)).toBeDisabled();
    fireEvent.press(screen.getByTestId("activity-next"));
  }
  expect(onComplete).toHaveBeenCalledWith({ correct: 5, total: 6 });
  expect(onRoundResult.mock.calls).toEqual([
    ["q:u2-30:0", true],
    ["q:u2-30:1", false],
    ["q:u2-30:2", true],
    ["q:u2-30:3", true],
    ["q:u2-30:4", true],
    ["q:u2-30:5", true],
  ]);
});

test("works on a Unit 1 listen_pick lesson", () => {
  const unit1 = lessonOf("u1-2", "listen_pick");
  const onComplete = jest.fn();
  renderActivity(
    <ListenPickActivity lesson={unit1} color="#000" attemptKey="l:1" onComplete={onComplete} />,
  );
  for (const q of unit1.questions) {
    fireEvent.press(choice(q.choices[q.correctIndex].word));
    fireEvent.press(screen.getByTestId("activity-next"));
  }
  expect(onComplete).toHaveBeenCalledWith({
    correct: unit1.questions.length,
    total: unit1.questions.length,
  });
});
