import { fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { WordReadActivity } from "@/components/activities/WordReadActivity";
import { lessonOf, renderActivity } from "@/test-utils/activities";

const speech = jest.requireMock("expo-speech") as { speak: jest.Mock };
const lesson = lessonOf("u2-3", "word_read");

beforeEach(() => jest.clearAllMocks());

test("scores first taps only, retries until found, and advances with the Next button", () => {
  const onComplete = jest.fn();
  const onRoundResult = jest.fn();
  renderActivity(
    <WordReadActivity
      lesson={lesson}
      color="#D97706"
      attemptKey="w:1"
      onComplete={onComplete}
      onRoundResult={onRoundResult}
    />,
  );
  const picks = ["مَامَا", "مَامَا", "أُحِبُّ"];
  picks.forEach((word, i) => {
    expect(screen.queryByTestId("activity-next")).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: word }));
    // A second tap on the correct answer is ignored: the round is locked.
    fireEvent.press(screen.getByRole("button", { name: lesson.rounds[i].word }));
    fireEvent.press(screen.getByTestId("activity-next"));
  });

  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(onComplete).toHaveBeenCalledWith({ correct: 2, total: 3 });
  expect(onRoundResult.mock.calls).toEqual([
    ["word:مَامَا", true],
    ["word:أَنَا", false],
    ["word:أُحِبُّ", true],
  ]);
});

test("asks again after a wrong tap without saying the answer, and shows the score at the end", () => {
  renderActivity(
    <WordReadActivity lesson={lesson} color="#D97706" attemptKey="w:1" onComplete={jest.fn()} />,
  );
  fireEvent.press(screen.getByRole("button", { name: "أَنَا" }));
  expect(speech.speak).toHaveBeenLastCalledWith(
    "حَاوِلْ مَرَّةً أُخْرَى، مَامَا",
    expect.anything(),
  );
  expect(screen.queryByTestId("activity-next")).toBeNull();
  fireEvent.press(screen.getByRole("button", { name: "مَامَا" }));
  expect(screen.getByLabelText("التالي ←")).toBeTruthy();
  fireEvent.press(screen.getByTestId("activity-next"));
  fireEvent.press(screen.getByRole("button", { name: "أَنَا" }));
  fireEvent.press(screen.getByTestId("activity-next"));
  fireEvent.press(screen.getByRole("button", { name: "أُحِبُّ" }));
  expect(screen.getByLabelText("أَحْسَنْت! ٢/٣ 🌟 تابع")).toBeTruthy();
});
