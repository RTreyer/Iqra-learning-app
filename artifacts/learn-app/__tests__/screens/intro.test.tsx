import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";

import IntroScreen from "@/app/intro";
import { CHAPTERS, INTRO_STORY } from "@/content/story";
import { SETTINGS_KEY, SettingsProvider } from "@/context/SettingsContext";
import { routes } from "@/lib/routes";
import { mockCanGoBack, renderScreen, setParams } from "@/test-utils/screens";

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
  setParams({});
});
afterEach(() => jest.useRealTimers());

test("tells the story scene by scene with the voice, then waits on the choice", async () => {
  renderIntro();
  await act(async () => {});
  expect(screen.getByTestId(`intro-scene-${INTRO_STORY[0].id}`)).toBeTruthy();
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
  expect(screen.getByTestId(`intro-scene-${INTRO_STORY[1].id}`)).toBeTruthy();
  fireEvent.press(screen.getByTestId("intro-next"));
  expect(screen.getByTestId(`intro-scene-${INTRO_STORY[2].id}`)).toBeTruthy();
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
  // Today's job is told next: the coffee trader's chapter.
  expect(router.replace).toHaveBeenCalledWith(routes.intro("math"));
  expect(JSON.parse((await AsyncStorage.getItem(SETTINGS_KEY))!)).toMatchObject({
    introSeen: true,
    bookId: "math-1",
  });
});

test("Hudhud is a day worker with a dream, and today has two jobs to choose from", () => {
  expect(INTRO_STORY.map((s) => s.id)).toEqual(["dawn", "jobs", "dream", "today", "choose"]);
  expect(INTRO_STORY[2].line).toContain("مَدْرَسَةً");
  expect(CHAPTERS.arabic.map((s) => s.id)).toEqual(["postman", "wind", "waiting"]);
  expect(CHAPTERS.math.map((s) => s.id)).toEqual(["market", "beans", "ship"]);
});

test("a chapter tells its job, then opens its path and is remembered", async () => {
  setParams({ chapter: "math" });
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ introSeen: true, bookId: "math-1" }));
  renderIntro();
  await act(async () => {});
  expect(screen.getByTestId("intro-scene-market")).toBeTruthy();
  expect(screen.queryByTestId("choose-math-1")).toBeNull();
  for (const scene of CHAPTERS.math) {
    expect(screen.getByTestId(`intro-scene-${scene.id}`)).toBeTruthy();
    const options = Speech.speak.mock.calls.at(-1)![1] as { onDone: () => void };
    act(() => options.onDone());
    act(() => jest.advanceTimersByTime((scene.minMs ?? 0) + 1000));
  }
  expect(spoken()).toEqual(CHAPTERS.math.map((s) => s.line));
  expect(router.replace).toHaveBeenCalledWith(routes.book("math-1"));
  await act(async () => {});
  expect(JSON.parse((await AsyncStorage.getItem(SETTINGS_KEY))!).chaptersSeen).toEqual(["math"]);
});

test("skip in a chapter opens the job's path at once", async () => {
  setParams({ chapter: "arabic" });
  renderIntro();
  await act(async () => {});
  expect(screen.getByTestId("intro-scene-postman")).toBeTruthy();
  await act(async () => {
    fireEvent.press(screen.getByTestId("intro-skip"));
  });
  expect(router.replace).toHaveBeenCalledWith(routes.book("arabic-1"));
});
