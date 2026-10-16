import { fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { LessonCompleteCard } from "@/components/LessonCompleteCard";
import { getLesson } from "@/content";
import { routes } from "@/lib/routes";
import { mockCanGoBack, renderScreen } from "@/test-utils/screens";

const { router } = jest.requireMock("expo-router") as { router: { push: jest.Mock; replace: jest.Mock; back: jest.Mock } };
const next = getLesson("u2-4")!.lesson;
const backTo = routes.unit("a2");

beforeEach(() => {
  jest.clearAllMocks();
  mockCanGoBack(true);
});

test("shows earned and dimmed stars and the next lesson title", () => {
  const onRepeat = jest.fn();
  renderScreen(<LessonCompleteCard stars={2} onRepeat={onRepeat} next={next} backTo={backTo} />);
  expect(screen.getAllByTestId("star-earned")).toHaveLength(2);
  expect(screen.getAllByTestId("star-dimmed")).toHaveLength(1);
  expect(screen.getByText(next.title)).toBeTruthy();

  fireEvent.press(screen.getByTestId("repeat-lesson"));
  expect(onRepeat).toHaveBeenCalledTimes(1);
  fireEvent.press(screen.getByTestId("next-lesson"));
  expect(router.replace).toHaveBeenCalledWith(routes.lesson(next.id));
  expect(router.push).not.toHaveBeenCalled();
  fireEvent.press(screen.getByTestId("back-to-list"));
  expect(router.back).toHaveBeenCalledTimes(1);
});

test("celebrates the finished unit when there is no next lesson", () => {
  renderScreen(<LessonCompleteCard stars={3} onRepeat={jest.fn()} next={null} backTo={backTo} />);
  expect(screen.getAllByTestId("star-earned")).toHaveLength(3);
  expect(screen.queryByTestId("next-lesson")).toBeNull();
  expect(screen.getByText("🎉 أتممت الوحدة!")).toBeTruthy();
  expect(screen.getAllByRole("button")).toHaveLength(2);
  fireEvent.press(screen.getByTestId("back-to-list"));
  expect(router.back).toHaveBeenCalledTimes(1);
});

test("back to the list replaces with the unit when there is no history", () => {
  mockCanGoBack(false);
  renderScreen(<LessonCompleteCard stars={1} onRepeat={jest.fn()} next={null} backTo={backTo} />);
  fireEvent.press(screen.getByTestId("back-to-list"));
  expect(router.back).not.toHaveBeenCalled();
  expect(router.replace).toHaveBeenCalledWith(backTo);
});
