import { fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import HomeScreen from "@/app/index";
import BookScreen from "@/app/book/[bookId]";
import UnitScreen from "@/app/unit/[unitId]";
import { books, getUnit } from "@/content";
import { resetPathMemory } from "@/components/world/PathMap";
import { routes } from "@/lib/routes";
import { STATIONS } from "@/content/story";
import { mockCanGoBack, renderScreen, setParams } from "@/test-utils/screens";

const { router } = jest.requireMock("expo-router") as {
  router: { push: jest.Mock; replace: jest.Mock };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockCanGoBack(false);
  resetPathMemory();
});

test("home shows one island per available book and opens it; no grade cards", () => {
  renderScreen(<HomeScreen />);
  const available = books.filter((book) => book.available);
  expect(screen.getAllByTestId(/^book-/)).toHaveLength(available.length);
  expect(screen.queryByTestId(/^grade-/)).toBeNull();
  expect(screen.queryByTestId("language-en")).toBeNull();
  // The first time, Hudhud tells the job first (the chapter opens the path when it ends).
  fireEvent.press(screen.getByTestId("book-arabic-1"));
  expect(router.push).toHaveBeenCalledWith(routes.intro("arabic"));
  fireEvent.press(screen.getByTestId("book-math-1"));
  expect(router.push).toHaveBeenCalledWith(routes.intro("math"));
});

test("home opens the album and the parents' corner", () => {
  renderScreen(<HomeScreen />);
  fireEvent.press(screen.getByTestId("album-button"));
  expect(router.push).toHaveBeenCalledWith(routes.album());
  fireEvent.press(screen.getByTestId("parents-button"));
  expect(router.push).toHaveBeenCalledWith(routes.parents());
});

test("book screen shows the units as stations with their progress", () => {
  setParams({ bookId: "arabic-1" });
  renderScreen(<BookScreen />);
  expect(screen.getAllByTestId(/^unit-/)).toHaveLength(8);
  const a2 = screen.getByTestId("unit-a2");
  expect(a2.props.accessibilityLabel).toMatch(/٠ \/ ٣١/);
  // Units 2 and 8 both have 31 lessons.
  expect(screen.getAllByText("٠ / ٣١")).toHaveLength(2);
  // The first time, Hudhud tells the station of his journey before the unit's path opens.
  fireEvent.press(a2);
  expect(router.push).toHaveBeenCalledWith(routes.intro("a2"));
});

test("book screen shows not found for an unknown id", () => {
  setParams({ bookId: "nope" });
  renderScreen(<BookScreen />);
  expect(screen.getByText("الكتاب غير موجود")).toBeTruthy();
});

test("unit screen shows one stop per lesson on the path and opens a lesson", () => {
  setParams({ unitId: "a2" });
  renderScreen(<UnitScreen />);
  expect(getUnit("a2")!.lessons).toHaveLength(31);
  expect(screen.getAllByTestId(/^lesson-row-/)).toHaveLength(31);
  // Lessons are grouped by textbook lesson: one flag per letter plus the exercises.
  expect(screen.getAllByTestId(/^section-/)).toHaveLength(8);
  // A letter's lessons start with a small flag with the letter; its name is announced.
  expect(screen.getByTestId("section-u2-1")).toHaveTextContent("م");
  expect(screen.getByTestId("section-u2-1").props.accessibilityLabel).toBe("م: أُحِبُّ مَامَا");
  fireEvent.press(screen.getByTestId("lesson-row-u2-3"));
  expect(router.push).toHaveBeenCalledWith(routes.lesson("u2-3"));
});

test("back buttons fall back up the hierarchy without history", () => {
  setParams({ unitId: "a2" });
  const unit = renderScreen(<UnitScreen />);
  fireEvent.press(screen.getByLabelText("رجوع"));
  expect(router.replace).toHaveBeenLastCalledWith(routes.book("arabic-1"));
  unit.unmount();

  setParams({ bookId: "math-1" });
  renderScreen(<BookScreen />);
  fireEvent.press(screen.getByLabelText("رجوع"));
  expect(router.replace).toHaveBeenLastCalledWith(routes.home());
});

test("array params use the first value", () => {
  const params = (jest.requireMock("expo-router") as { __params: Record<string, unknown> })
    .__params;
  setParams({});
  params.unitId = ["a2", "a3"];
  renderScreen(<UnitScreen />);
  expect(screen.getAllByTestId(/^lesson-row-/)).toHaveLength(31);
});

test("Hudhud stands beside the next stop of a path, once, and says its line", () => {
  jest.useFakeTimers();
  const Speech = jest.requireMock("expo-speech") as { speak: jest.Mock };
  setParams({ unitId: "a2" });
  renderScreen(<UnitScreen />);
  expect(screen.getAllByTestId("guide")).toHaveLength(1);
  // In the story: what this station asks (Rasha's door sign).
  const line = STATIONS.a2.ask;
  expect(screen.getByTestId("guide").props.accessibilityLabel).toBe(line);
  // On a first visit he flies in from the stop before; he speaks once he has landed.
  jest.advanceTimersByTime(2000);
  expect(Speech.speak).toHaveBeenCalledWith(line, expect.anything());
  jest.useRealTimers();
});
