import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, screen } from "@testing-library/react-native";
import React from "react";

import UnitScreen from "@/app/unit/[unitId]";
import { getUnit } from "@/content";
import { GOAL_LINES, goalLine } from "@/content/story";
import { ProgressProvider } from "@/context/ProgressContext";
import { renderScreen, setParams } from "@/test-utils/screens";

const Speech = jest.requireMock("expo-speech") as { speak: jest.Mock };

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

test("a unit path ends with Hudhud's letter, still missing letters while lessons are left", () => {
  setParams({ unitId: "a2" });
  renderScreen(<UnitScreen />);
  const letter = screen.getByTestId("unit-letter");
  expect(letter.props.accessibilityLabel).toBe(GOAL_LINES.letters.missing);
  expect(letter.props.accessibilityState).toMatchObject({ checked: false });
  fireEvent.press(letter);
  expect(Speech.speak).toHaveBeenLastCalledWith(GOAL_LINES.letters.missing, expect.anything());
  // Whom the letter is for already shows, faint, below it.
  expect(screen.getByTestId("goal-recipient")).toBeTruthy();
});

test("with every lesson done the clue is read: Hudhud tells what it says", async () => {
  const at = new Date().toISOString();
  const lessons = Object.fromEntries(
    getUnit("a3")!.lessons.map((l) => [l.id, { completed: true, stars: 3, completedAt: at }]),
  );
  await AsyncStorage.setItem(
    "@kidlearn_progress_v1",
    JSON.stringify({ version: 2, lessons, items: {}, activity: { days: [] }, totalStars: 0 }),
  );
  setParams({ unitId: "a3" });
  renderScreen(
    <ProgressProvider>
      <UnitScreen />
    </ProgressProvider>,
  );
  const letter = await screen.findByLabelText(goalLine("a3", "letters", true));
  expect(letter.props.accessibilityState).toMatchObject({ checked: true });
  for (const l of getUnit("a3")!.letters!) expect(screen.getAllByText(l).length).toBeGreaterThan(1);
});

test("a vowels unit shows its letters bare, and a letter wears its mark once its lessons are done", async () => {
  const unit = getUnit("a4")!;
  const at = new Date().toISOString();
  const first = unit.lessons.filter((l) => l.section === unit.lessons[0].section);
  const lessons = Object.fromEntries(
    first.map((l) => [l.id, { completed: true, stars: 3, completedAt: at }]),
  );
  await AsyncStorage.setItem(
    "@kidlearn_progress_v1",
    JSON.stringify({ version: 2, lessons, items: {}, activity: { days: [] }, totalStars: 0 }),
  );
  setParams({ unitId: "a4" });
  renderScreen(
    <ProgressProvider>
      <UnitScreen />
    </ProgressProvider>,
  );
  const letter = await screen.findByTestId("goal-letter-0");
  const first0 = unit.letters![0];
  expect(letter).toHaveTextContent(first0 + "\u064F");
  expect(screen.queryByTestId("goal-letter-1")).toBeNull();
  // The letter chip above the path agrees with the goal.
  expect(screen.getByTestId(`letter-${first0}`).props.accessibilityState).toMatchObject({
    checked: true,
  });
  expect(screen.getByTestId(`letter-${unit.letters![1]}`).props.accessibilityState).toMatchObject({
    checked: false,
  });
  expect(screen.getByTestId("unit-letter").props.accessibilityLabel).toBe(
    GOAL_LINES.vowels.missing,
  );
});

test("a maths unit ends with its station of the seed's journey", () => {
  setParams({ unitId: "math-u4" });
  renderScreen(<UnitScreen />);
  expect(screen.getByTestId("unit-letter").props.accessibilityLabel).toBe(GOAL_LINES.give.missing);
  // The neighbours who get the fish.
  expect(screen.getByTestId("goal-neighbours")).toBeTruthy();
  setParams({ unitId: "math-u2" });
  renderScreen(<UnitScreen />);
  expect(screen.getAllByTestId("unit-letter").pop()!.props.accessibilityLabel).toBe(
    GOAL_LINES.jars.missing,
  );
});
