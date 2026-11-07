import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import HomeScreen from "@/app/index";
import BookScreen from "@/app/book/[bookId]";
import AlbumScreen from "@/app/album";
import IntroScreen from "@/app/intro";
import LessonScreen from "@/app/lesson/[lessonId]";
import ParentsScreen from "@/app/parents";
import UnitScreen from "@/app/unit/[unitId]";
import { DEMO_IDS } from "@/content/demos";
import { resetDemoSeenCache } from "@/hooks/useDemoSeen";
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
      (typeof node.props.onPress === "function" || typeof node.props.onLongPress === "function"),
  );
  expect(pressables.length).toBe(exactly);
  for (const node of pressables) {
    const where = String(node.props.testID ?? node.props.accessibilityLabel ?? "unnamed pressable");
    // Switches in the parents' corner announce themselves as switches.
    const role =
      node.props.accessibilityRole === "switch" ? "button" : node.props.accessibilityRole;
    expect({ where, role }).toEqual({ where, role: "button" });
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

test("home: play, islands, tiles, Hudhud and the parents' gear", async () => {
  await seed();
  withProgress(<HomeScreen />);
  await screen.findByTestId("review-card");
  // Gear, Hudhud, play, 2 islands, today's window, album and review.
  expectAccessiblePressables(8);
});

test("book: back button, Hudhud and the unit stations", async () => {
  setParams({ bookId: "arabic-1" });
  withProgress(<BookScreen />);
  await screen.findAllByTestId(/^unit-/);
  expectAccessiblePressables(10);
});

test("unit: back button, Hudhud, the lesson stops (one completed) and Hudhud's letter", async () => {
  await seed();
  setParams({ unitId: "a1" });
  withProgress(<UnitScreen />);
  await screen.findAllByTestId(/^lesson-row-/);
  expectAccessiblePressables(8);
});

test("unit with letters: each letter is a button that says itself", async () => {
  setParams({ unitId: "a2" });
  withProgress(<UnitScreen />);
  await screen.findAllByTestId(/^lesson-row-/);
  // Back, 7 letters, Hudhud, 31 lessons and Hudhud's letter at the end.
  expectAccessiblePressables(41);
});

test("album: back button, nine stickers and Hudhud", async () => {
  withProgress(<AlbumScreen />);
  await screen.findByTestId("sticker-qamariya");
  expectAccessiblePressables(11);
});

test("parents: the gate, then every control behind it", async () => {
  withProgress(<ParentsScreen />);
  // Back and the hold-to-open gate.
  expectAccessiblePressables(2);
  await act(async () => {
    fireEvent(screen.getByTestId("parents-gate"), "longPress");
  });
  // Back, 2 languages, voice, vibration and reset.
  expectAccessiblePressables(6);
});

test("lesson u2-2: back button, Hudhud, help button and the activity controls", async () => {
  resetDemoSeenCache(DEMO_IDS);
  setParams({ lessonId: "u2-2" });
  withProgress(<LessonScreen />);
  // Past the fallbacks of the spoken title and instruction.
  await act(async () => {
    jest.advanceTimersByTime(10000);
  });
  expectAccessiblePressables(6);
});

test("lesson u2-2 with its worked example: the Skip button is accessible too", async () => {
  resetDemoSeenCache([]);
  setParams({ lessonId: "u2-2" });
  withProgress(<LessonScreen />);
  await act(async () => {
    jest.advanceTimersByTime(10000);
  });
  expect(screen.getByTestId("demo-skip").props.accessibilityLabel).toBe("تخطَّ");
  expect(screen.getByTestId("demo-skip").props.accessibilityRole).toBe("button");
});

test("intro: home, skip and the scene to tap on; then the two choices", async () => {
  withProgress(<IntroScreen />);
  // Home, skip and the scene.
  expectAccessiblePressables(3);
  await act(async () => {
    fireEvent.press(screen.getByTestId("intro-skip"));
  });
  // Home, the scene (disabled while choosing, still labelled) and the two subjects.
  expectAccessiblePressables(4);
});
