import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, screen } from "@testing-library/react-native";
import React from "react";

import UnitScreen from "@/app/unit/[unitId]";
import { symbolsBack } from "@/components/world/LetterGoal";
import { getUnit } from "@/content";
import { LETTER_LINES } from "@/content/story";
import { ProgressProvider } from "@/context/ProgressContext";
import { renderScreen, setParams } from "@/test-utils/screens";

const Speech = jest.requireMock("expo-speech") as { speak: jest.Mock };

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

test("the letters come back into Hudhud's letter as the unit is done, all of them only at the end", () => {
  expect([0, 0.2, 0.5, 0.99, 1].map((share) => symbolsBack(7, share))).toEqual([0, 1, 3, 6, 7]);
});

test("a unit path ends with Hudhud's letter, still missing letters while lessons are left", () => {
  setParams({ unitId: "a2" });
  renderScreen(<UnitScreen />);
  const letter = screen.getByTestId("unit-letter");
  expect(letter.props.accessibilityLabel).toBe(LETTER_LINES.missing);
  expect(letter.props.accessibilityState).toMatchObject({ checked: false });
  fireEvent.press(letter);
  expect(Speech.speak).toHaveBeenLastCalledWith(LETTER_LINES.missing, expect.anything());
});

test("with every lesson done the letter is complete", async () => {
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
  const letter = await screen.findByLabelText(LETTER_LINES.complete);
  expect(letter.props.accessibilityState).toMatchObject({ checked: true });
  for (const l of getUnit("a3")!.letters!) expect(screen.getAllByText(l).length).toBeGreaterThan(1);
});
