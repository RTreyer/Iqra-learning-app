import { fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { LessonCompleteCard } from "@/components/LessonCompleteCard";
import { getLesson } from "@/content";
import { routes } from "@/lib/routes";
import { renderScreen } from "@/test-utils/screens";

const { router } = jest.requireMock("expo-router") as { router: { push: jest.Mock; back: jest.Mock } };
const next = getLesson("u2-4")!.lesson;

beforeEach(() => jest.clearAllMocks());

test("shows earned and dimmed stars and the next lesson title", () => {
  const onRepeat = jest.fn();
  renderScreen(<LessonCompleteCard stars={2} onRepeat={onRepeat} next={next} />);
  expect(screen.getAllByTestId("star-earned")).toHaveLength(2);
  expect(screen.getAllByTestId("star-dimmed")).toHaveLength(1);
  expect(screen.getByText(next.title)).toBeTruthy();

  fireEvent.press(screen.getByTestId("repeat-lesson"));
  expect(onRepeat).toHaveBeenCalledTimes(1);
  fireEvent.press(screen.getByTestId("next-lesson"));
  expect(router.push).toHaveBeenCalledWith(routes.lesson(next.id));
  fireEvent.press(screen.getByTestId("back-to-list"));
  expect(router.back).toHaveBeenCalledTimes(1);
});

test("celebrates the finished unit when there is no next lesson", () => {
  renderScreen(<LessonCompleteCard stars={3} onRepeat={jest.fn()} next={null} />);
  expect(screen.getAllByTestId("star-earned")).toHaveLength(3);
  expect(screen.queryByTestId("next-lesson")).toBeNull();
  fireEvent.press(screen.getByText("🎉 أتممت الوحدة!"));
  expect(router.back).toHaveBeenCalledTimes(1);
});
