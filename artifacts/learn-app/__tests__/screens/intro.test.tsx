import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";

import IntroScreen from "@/app/intro";
import { INTRO_STORY } from "@/content/story";
import { SETTINGS_KEY, SettingsProvider } from "@/context/SettingsContext";
import { routes } from "@/lib/routes";
import { mockCanGoBack, renderScreen } from "@/test-utils/screens";

const { router } = jest.requireMock("expo-router") as { router: { replace: jest.Mock } };
const Speech = jest.requireMock("expo-speech") as { speak: jest.Mock };

function renderIntro() {
  return renderScreen(
    <SettingsProvider>
      <IntroScreen />
    </SettingsProvider>,
  );
}

const spoken = () => Speech.speak.mock.calls.map((c) => c[0]);

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockCanGoBack(true);
});
afterEach(() => jest.useRealTimers());

test("tells the story scene by scene with the voice, then waits on the choice", async () => {
  renderIntro();
  await act(async () => {});
  expect(screen.getByTestId("intro-scene-postman")).toBeTruthy();
  expect(spoken()).toEqual([INTRO_STORY[0].line]);
  // The voice reports done: after a short pause the next scene is told.
  const finish = () => {
    const options = Speech.speak.mock.calls.at(-1)![1] as { onDone: () => void };
    act(() => options.onDone());
    // A short pause after each line; the storm scene plays at least its own length.
    act(() => jest.advanceTimersByTime(1000));
  };
  for (let i = 1; i < INTRO_STORY.length; i++) {
    if (INTRO_STORY[i - 1].minMs) {
      // Not yet: the storm is still blowing.
      finish();
      expect(screen.getByTestId(`intro-scene-${INTRO_STORY[i - 1].id}`)).toBeTruthy();
      act(() => jest.advanceTimersByTime(INTRO_STORY[i - 1].minMs!));
    } else finish();
    expect(screen.getByTestId(`intro-scene-${INTRO_STORY[i].id}`)).toBeTruthy();
  }
  expect(spoken()).toEqual(INTRO_STORY.map((s) => s.line));
  // The last scene does not move on by itself: the child chooses.
  finish();
  act(() => jest.advanceTimersByTime(20000));
  expect(screen.getByTestId("intro-scene-choose")).toBeTruthy();
  expect(screen.getByTestId("choose-arabic-1")).toBeTruthy();
  expect(screen.getByTestId("choose-math-1")).toBeTruthy();
});

test("moves on after the fallback when the voice never reports back, and a tap moves on too", async () => {
  renderIntro();
  await act(async () => {});
  act(() => jest.advanceTimersByTime(10000));
  expect(screen.getByTestId("intro-scene-wind")).toBeTruthy();
  fireEvent.press(screen.getByTestId("intro-next"));
  expect(screen.getByTestId("intro-scene-market")).toBeTruthy();
});

test("skip jumps to the choice; choosing saves the subject and opens its path", async () => {
  renderIntro();
  await act(async () => {});
  fireEvent.press(screen.getByTestId("intro-skip"));
  expect(screen.getByTestId("intro-scene-choose")).toBeTruthy();
  expect(screen.queryByTestId("intro-skip")).toBeNull();
  await act(async () => {
    fireEvent.press(screen.getByTestId("choose-math-1"));
  });
  expect(router.replace).toHaveBeenCalledWith(routes.book("math-1"));
  expect(JSON.parse((await AsyncStorage.getItem(SETTINGS_KEY))!)).toMatchObject({
    introSeen: true,
    bookId: "math-1",
  });
});
