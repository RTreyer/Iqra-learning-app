import { fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { WordReadActivity } from "@/components/activities/WordReadActivity";
import { lessonOf, renderActivity } from "@/test-utils/activities";

const speech = jest.requireMock("expo-speech") as { speak: jest.Mock };
const lesson = lessonOf("u2-4", "word_read");

beforeEach(() => jest.clearAllMocks());

test("scores first taps only and advances with the Next button", () => {
  const onComplete = jest.fn();
  const onRoundResult = jest.fn();
  renderActivity(
    <WordReadActivity lesson={lesson} color="#D97706" attemptKey="w:1" onComplete={onComplete} onRoundResult={onRoundResult} />,
  );
  const picks = ["بَيْت", "بَاب", "ثَعْلَب", "بَاب", "ثَوْر"];
  picks.forEach((word, i) => {
    expect(screen.queryByTestId("activity-next")).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: word }));
    // A second tap on the correct answer is ignored: the round is locked.
    fireEvent.press(screen.getByRole("button", { name: lesson.rounds[i].word }));
    fireEvent.press(screen.getByTestId("activity-next"));
  });

  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(onComplete).toHaveBeenCalledWith({ correct: 3, total: 5 });
  expect(onRoundResult.mock.calls).toEqual([
    ["word:بَيْت", true],
    ["word:تِين", false],
    ["word:ثَعْلَب", true],
    ["word:بَاب", true],
    ["word:تُفَّاحَة", false],
  ]);
});

test("speaks the right answer after a wrong first tap and shows the score on the last round", () => {
  renderActivity(<WordReadActivity lesson={lesson} color="#D97706" attemptKey="w:1" onComplete={jest.fn()} />);
  fireEvent.press(screen.getByRole("button", { name: "تِين" }));
  expect(speech.speak).toHaveBeenLastCalledWith("بَيْت", expect.anything());
  expect(screen.getByText("التالي ←")).toBeTruthy();
  fireEvent.press(screen.getByTestId("activity-next"));
  for (const word of ["تِين", "ثَعْلَب", "بَاب"]) {
    fireEvent.press(screen.getByRole("button", { name: word }));
    fireEvent.press(screen.getByTestId("activity-next"));
  }
  fireEvent.press(screen.getByRole("button", { name: "تُفَّاحَة" }));
  expect(screen.getByText("أَحْسَنْت! 4/5 🌟 تابع")).toBeTruthy();
});
