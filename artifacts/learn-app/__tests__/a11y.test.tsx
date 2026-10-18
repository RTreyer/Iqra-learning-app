import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, screen } from "@testing-library/react-native";
import React from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import HomeScreen from "@/app/index";
import BookScreen from "@/app/book/[bookId]";
import GradeScreen from "@/app/grade/[gradeId]";
import LessonScreen from "@/app/lesson/[lessonId]";
import UnitScreen from "@/app/unit/[unitId]";
import { ProgressProvider } from "@/context/ProgressContext";
import { allItems } from "@/lib/reviewItems";
import { mockCanGoBack, renderScreen, setParams } from "@/test-utils/screens";
import { touchTarget } from "@/theme/tokens";

const KEY = "@kidlearn_progress_v1";
const NOW = new Date(2026, 9, 16, 10, 0, 0);
const DUE = new Date(2026, 9, 15).toISOString();

async function seed() {
  const item = { box: 2, dueAt: DUE, lastSeenAt: DUE, lapses: 0 };
  const ids = Array.from(allItems().keys()).slice(0, 2);
  const items = Object.fromEntries(ids.map((id) => [id, item]));
  const days = ["2026-10-14", "2026-10-15", "2026-10-16"];
  const lessons = { "u1-1": { completed: true, stars: 2 } };
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify({ version: 2, lessons, items, activity: { days }, totalStars: 2 }),
  );
}

function withProgress(ui: React.ReactElement) {
  return renderScreen(<ProgressProvider>{ui}</ProgressProvider>);
}

/** Every Pressable that can be pressed must be announced and large enough to hit. */
function expectAccessiblePressables(exactly: number) {
  // Pressable is a memo wrapper in jest-expo, so match the rendered component by its name.
  const pressables = screen.UNSAFE_root.findAll(
    (node: ReturnType<typeof screen.UNSAFE_root.findAll>[number]) =>
      typeof node.type !== "string" &&
      (node.type as { name?: string }).name === "Pressable" &&
      typeof node.props.onPress === "function",
  );
  expect(pressables.length).toBe(exactly);
  for (const node of pressables) {
    const where = String(node.props.testID ?? node.props.accessibilityLabel ?? "unnamed pressable");
    expect({ where, role: node.props.accessibilityRole }).toEqual({ where, role: "button" });
    const label = node.props.accessibilityLabel;
    expect({ where, label: typeof label === "string" && label.trim().length > 0 }).toEqual({
      where,
      label: true,
    });
    const style = node.props.style as
      StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
    const flat =
      StyleSheet.flatten(typeof style === "function" ? style({ pressed: false }) : style) ?? {};
    const sizes = [flat.minHeight, flat.height].filter((v): v is number => typeof v === "number");
    expect({ where, tall: sizes.length > 0 && Math.max(...sizes) >= touchTarget }).toEqual({
      where,
      tall: true,
    });
    // Rows that stretch (no numeric width, or a percentage) are as wide as their parent.
    const widths = [flat.minWidth, flat.width].filter((v): v is number => typeof v === "number");
    if (widths.length > 0)
      expect({ where, wide: Math.max(...widths) >= touchTarget }).toEqual({ where, wide: true });
  }
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  jest.useFakeTimers({ now: NOW });
  mockCanGoBack(true);
});
afterEach(() => jest.useRealTimers());

test("home: language switch, continue, review and grade cards", async () => {
  await seed();
  withProgress(<HomeScreen />);
  await screen.findByTestId("review-card");
  // 2 language buttons, continue, review and the 6 grade cards.
  expectAccessiblePressables(10);
});

test("grade: back button and book cards", async () => {
  setParams({ gradeId: "1" });
  withProgress(<GradeScreen />);
  await screen.findAllByTestId(/^book-/);
  // Back and the 6 grade 1 book cards.
  expectAccessiblePressables(7);
});

test("book: back button and unit cards", async () => {
  setParams({ bookId: "arabic-1" });
  withProgress(<BookScreen />);
  await screen.findAllByTestId(/^unit-/);
  expectAccessiblePressables(9);
});

test("unit: back button and lesson rows, including a completed one", async () => {
  await seed();
  setParams({ unitId: "a1" });
  withProgress(<UnitScreen />);
  await screen.findAllByTestId(/^lesson-row-/);
  expectAccessiblePressables(6);
});

test("lesson u2-2: back button and the activity controls", async () => {
  setParams({ lessonId: "u2-2" });
  withProgress(<LessonScreen />);
  await act(async () => {
    jest.advanceTimersByTime(2000);
  });
  expectAccessiblePressables(4);
});
