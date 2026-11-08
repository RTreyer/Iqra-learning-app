import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";

import IntroScreen from "@/app/intro";
import { CHAPTERS, INTRO_STORY, MAP_PLACES, STATIONS } from "@/content/story";
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
  expect(screen.getByTestId("intro-scene-map")).toBeTruthy();
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
  expect(screen.getByTestId("intro-scene-map")).toBeTruthy();
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

test("Hudhud's story: Rasha, her bowl and the note he cannot read, then two threads", () => {
  expect(INTRO_STORY.map((s) => s.id)).toEqual([
    "roof",
    "thirst",
    "girl",
    "drink",
    "why",
    "days",
    "leave",
    "gone",
    "inscription",
    "turn",
    "flyoff",
    "map",
  ]);
  const line = (id: string) => INTRO_STORY.find((s) => s.id === id)!.line;
  expect(line("inscription")).toContain("لَا أَعْرِفُ الْقِرَاءَةَ");
  // Her name is told once she is known, and the turn: she gave water, now it is his turn.
  expect(line("days")).toContain("رَشَا");
  expect(line("turn")).toContain("دَوْرِي");
  // No seed: under the bowl there is only her note; the maths thread is the coffee trader.
  for (const scene of [...INTRO_STORY, ...CHAPTERS.math, ...CHAPTERS.end])
    expect(scene.line).not.toMatch(/بِذْر|السِّدْر/);
  expect(CHAPTERS.math[0].line).toContain("تَاجِرَ بُنٍّ");
  // He takes her note with him (under his wing: the bag comes later, from the postman).
  expect(line("flyoff")).toContain("جَنَاحِي");
  // Where he can go: the old postman in his own city, the coffee port on the Red Sea.
  expect(MAP_PLACES.arabic.name).toBe("صَنْعَاءُ");
  expect(MAP_PLACES.math.name).toBe("الْمُخَا");
  expect(CHAPTERS.arabic[0].line).toContain("صَنْعَاءَ");
  // The postman teaches Hudhud to read: the names on the letters, and Rasha's note.
  expect(CHAPTERS.arabic.map((s) => s.line).join(" ")).toContain("تَعَلَّمِ الْقِرَاءَةَ");
  expect(CHAPTERS.math[0].line).toContain(MAP_PLACES.math.name);
  // Every picture with a slow animation plays long enough to be seen.
  for (const id of ["thirst", "girl", "days", "leave", "gone"])
    expect(INTRO_STORY.find((s) => s.id === id)!.minMs).toBeGreaterThanOrEqual(3800);
  expect(CHAPTERS.arabic.map((s) => s.id)).toEqual([
    "alley",
    "doors",
    "ask",
    "bread",
    "comewith",
    "bowl",
  ]);
  expect(CHAPTERS.math.map((s) => s.id)).toEqual(["trader", "sacks"]);
  expect(CHAPTERS.end.map((s) => s.id)).toEqual([
    "return",
    "readnote",
    "deliver",
    "newgirl",
    "home",
  ]);
  // The end: he reads her note at last, cannot do what it asks, and carries it to the girl.
  const end = (id: string) => CHAPTERS.end.find((s) => s.id === id)!.line;
  expect(end("readnote")).toContain("اِمْلَأِ الصَّحْنَ لِي");
  expect(end("deliver")).toContain("حَمَلْتُ إِلَيْهَا الْوَرَقَةَ");
});

test("a thread tells its beginning, then opens its path and is remembered", async () => {
  setParams({ chapter: "math" });
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ introSeen: true, bookId: "math-1" }));
  renderIntro();
  await act(async () => {});
  expect(screen.getByTestId("intro-scene-trader")).toBeTruthy();
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

test("skip in a chapter opens the thread's path at once", async () => {
  setParams({ chapter: "arabic" });
  renderIntro();
  await act(async () => {});
  expect(screen.getByTestId("intro-scene-alley")).toBeTruthy();
  await act(async () => {
    fireEvent.press(screen.getByTestId("intro-skip"));
  });
  expect(router.replace).toHaveBeenCalledWith(routes.book("arabic-1"));
});

test("a station tells where Hudhud is and what to read, then opens the unit", async () => {
  setParams({ chapter: "a2" });
  renderIntro();
  await act(async () => {});
  expect(screen.getByTestId("intro-scene-station")).toBeTruthy();
  expect(spoken()).toEqual([STATIONS.a2.where]);
  await act(async () => {
    fireEvent.press(screen.getByTestId("intro-skip"));
  });
  expect(router.replace).toHaveBeenCalledWith(routes.unit("a2"));
  expect(JSON.parse((await AsyncStorage.getItem(SETTINGS_KEY))!).chaptersSeen).toEqual(["a2"]);
});
