import { fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import HomeScreen from "@/app/index";
import BookScreen from "@/app/book/[bookId]";
import UnitScreen from "@/app/unit/[unitId]";
import { books, getUnit } from "@/content";
import { routes } from "@/lib/routes";
import { renderScreen, setParams } from "@/test-utils/screens";

const { router } = jest.requireMock("expo-router") as { router: { push: jest.Mock } };

beforeEach(() => jest.clearAllMocks());

test("home renders one card per book and opens a book", () => {
  renderScreen(<HomeScreen />);
  expect(screen.getAllByTestId(/^book-/)).toHaveLength(books.length);
  fireEvent.press(screen.getByTestId("book-arabic-1"));
  expect(router.push).toHaveBeenCalledWith(routes.book("arabic-1"));
});

test("book screen renders unit cards with progress pills", () => {
  setParams({ bookId: "arabic-1" });
  renderScreen(<BookScreen />);
  expect(screen.getAllByTestId(/^unit-/)).toHaveLength(8);
  const a2 = screen.getByTestId("unit-a2");
  expect(screen.getAllByText("0 / 6").length).toBeGreaterThan(0);
  expect(a2).toHaveTextContent(/0 \/ 6/);
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
  expect(getUnit("a2")!.lessons).toHaveLength(6);
  expect(screen.getAllByTestId(/^lesson-row-/)).toHaveLength(6);
  fireEvent.press(screen.getByTestId("lesson-row-u2-3"));
  expect(router.push).toHaveBeenCalledWith(routes.lesson("u2-3"));
});
