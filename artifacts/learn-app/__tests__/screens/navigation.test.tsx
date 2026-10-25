import { fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import HomeScreen from "@/app/index";
import GradeScreen from "@/app/grade/[gradeId]";
import BookScreen from "@/app/book/[bookId]";
import UnitScreen from "@/app/unit/[unitId]";
import { getGrade, getUnit, grades } from "@/content";
import { routes } from "@/lib/routes";
import { mockCanGoBack, renderScreen, setParams } from "@/test-utils/screens";

const { router } = jest.requireMock("expo-router") as {
  router: { push: jest.Mock; replace: jest.Mock };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockCanGoBack(false);
});

test("home renders one card per grade and opens a grade", () => {
  renderScreen(<HomeScreen />);
  expect(screen.getAllByTestId(/^grade-\d$/)).toHaveLength(grades.length);
  fireEvent.press(screen.getByTestId("grade-1"));
  expect(router.push).toHaveBeenCalledWith(routes.grade(1));
});

test("grade screen renders one card per book and opens an available book", () => {
  setParams({ gradeId: "1" });
  renderScreen(<GradeScreen />);
  expect(screen.getByTestId("grade-title")).toHaveTextContent("الصف الأول");
  expect(screen.getAllByTestId(/^book-/)).toHaveLength(getGrade(1)!.books.length);
  expect(screen.getByTestId("book-lughati-1")).toHaveTextContent(/لغتي العربية.*قريباً/);
  fireEvent.press(screen.getByTestId("book-arabic-2"));
  expect(router.push).not.toHaveBeenCalled();
  fireEvent.press(screen.getByTestId("book-arabic-1"));
  expect(router.push).toHaveBeenCalledWith(routes.book("arabic-1"));
});

test("grade screen shows not found for a grade without books", () => {
  setParams({ gradeId: "2" });
  renderScreen(<GradeScreen />);
  expect(screen.getByText("الصف غير موجود")).toBeTruthy();
});

test("book screen renders unit cards with progress pills", () => {
  setParams({ bookId: "arabic-1" });
  renderScreen(<BookScreen />);
  expect(screen.getAllByTestId(/^unit-/)).toHaveLength(8);
  const a2 = screen.getByTestId("unit-a2");
  expect(screen.getAllByText("٠ / ٦").length).toBeGreaterThan(0);
  expect(a2).toHaveTextContent(/٠ \/ ٣١/);
  fireEvent.press(a2);
  expect(router.push).toHaveBeenCalledWith(routes.unit("a2"));
});

test("book screen shows not found for an unknown id", () => {
  setParams({ bookId: "nope" });
  renderScreen(<BookScreen />);
  expect(screen.getByText("الكتاب غير موجود")).toBeTruthy();
});

test("unit screen renders one row per lesson and opens a lesson", () => {
  setParams({ unitId: "a2" });
  renderScreen(<UnitScreen />);
  expect(getUnit("a2")!.lessons).toHaveLength(31);
  expect(screen.getAllByTestId(/^lesson-row-/)).toHaveLength(31);
  // Lessons are grouped by textbook lesson: one heading per letter plus the exercises.
  expect(screen.getAllByTestId(/^section-/)).toHaveLength(8);
  expect(screen.getByTestId("section-u2-1")).toHaveTextContent("م · أُحِبُّ مَامَا");
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
  const book = renderScreen(<BookScreen />);
  fireEvent.press(screen.getByLabelText("رجوع"));
  expect(router.replace).toHaveBeenLastCalledWith(routes.grade(1));
  book.unmount();

  setParams({ gradeId: "1" });
  renderScreen(<GradeScreen />);
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
