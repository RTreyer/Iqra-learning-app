import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";

import HomeScreen, { windowLine } from "@/app/index";
import { getLesson } from "@/content";
import { ProgressProvider } from "@/context/ProgressContext";
import { SETTINGS_KEY, SettingsProvider } from "@/context/SettingsContext";
import { routes } from "@/lib/routes";
import { allItems } from "@/lib/reviewItems";
import { renderScreen } from "@/test-utils/screens";

const KEY = "@kidlearn_progress_v1";
const NOW = new Date(2026, 9, 16, 10, 0, 0);
const DUE = new Date(2026, 9, 15).toISOString();
const { router } = jest.requireMock("expo-router") as { router: { push: jest.Mock } };
const Speech = jest.requireMock("expo-speech") as { speak: jest.Mock };

async function seed(
  dueCount: number,
  lessons: Record<string, { completed: boolean; stars: number; completedAt: string }> = {},
) {
  const item = { box: 2, dueAt: DUE, lastSeenAt: DUE, lapses: 0 };
  const ids = Array.from(allItems().keys()).slice(0, dueCount);
  const items = Object.fromEntries(ids.map((id) => [id, item]));
  const totalStars = Object.values(lessons).reduce((sum, l) => sum + l.stars, 0);
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify({ version: 2, lessons, items, activity: { days: [] }, totalStars }),
  );
}

function renderHome() {
  return renderScreen(
    <SettingsProvider>
      <ProgressProvider>
        <HomeScreen />
      </ProgressProvider>
    </SettingsProvider>,
  );
}

/** After the story: the child chose `bookId` (or nothing yet). */
async function storyTold(bookId: string | null = null) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ introSeen: true, bookId }));
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  jest.useFakeTimers({ now: NOW });
});
afterEach(() => jest.useRealTimers());

test("first launch: Hudhud invites to his story, and play tells it", async () => {
  renderHome();
  const play = await screen.findByTestId("continue-card");
  expect(play.props.accessibilityLabel).toBe("قصة هدهد");
  expect(screen.queryByTestId("review-card")).toBeNull();
  expect(screen.queryByTestId("intro-button")).toBeNull();
  // Hudhud speaks once the stored settings are read.
  await act(async () => {});
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
  expect(Speech.speak).toHaveBeenCalledWith(
    "اِضْغَطْ عَلَى الزِّرِّ، وَاسْمَعْ قِصَّتِي!",
    expect.anything(),
  );
  fireEvent.press(play);
  expect(router.push).toHaveBeenCalledWith(routes.intro());
});

test("after the story, play opens the next lesson of the chosen subject", async () => {
  await storyTold("math-1");
  renderHome();
  await screen.findByTestId("intro-button");
  const play = screen.getByTestId("continue-card");
  const { unit, lesson } = getLesson("math-u1-1")!;
  expect(play.props.accessibilityLabel).toContain(lesson.title);
  expect(play.props.accessibilityLabel).toContain(unit.title);
  expect(screen.getByTestId("play-subject")).toHaveTextContent("١");
  expect(screen.getByTestId("book-math-1").props.accessibilityState).toMatchObject({
    selected: true,
  });
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
  expect(Speech.speak).toHaveBeenCalledWith("بِسْمِ اللهِ! هَيَّا نَتَعَلَّمُ", expect.anything());
  fireEvent.press(play);
  expect(router.push).toHaveBeenCalledWith(routes.lesson("math-u1-1"));
  fireEvent.press(screen.getByTestId("intro-button"));
  expect(router.push).toHaveBeenCalledWith(routes.intro());
});

test("an island switches the subject: play then continues there", async () => {
  await storyTold("math-1");
  renderHome();
  await screen.findByTestId("intro-button");
  await act(async () => {
    fireEvent.press(screen.getByTestId("book-arabic-1"));
  });
  expect(router.push).toHaveBeenCalledWith(routes.book("arabic-1"));
  expect(screen.getByTestId("play-subject")).toHaveTextContent("أ");
  expect(screen.getByTestId("continue-card").props.accessibilityLabel).toContain(
    getLesson("u1-1")!.lesson.title,
  );
  expect(JSON.parse((await AsyncStorage.getItem(SETTINGS_KEY))!).bookId).toBe("arabic-1");
});

test("two due items show the review tile, which opens the review", async () => {
  await seed(2);
  renderHome();
  const review = await screen.findByTestId("review-card");
  expect(screen.getByText("عُنْصُرَان")).toBeTruthy();
  fireEvent.press(review);
  expect(router.push).toHaveBeenCalledWith(routes.review());
});

test("one and three due items use the singular and the plural", async () => {
  await seed(1);
  const first = renderHome();
  await screen.findByTestId("review-card");
  expect(screen.getByText("عُنْصُر وَاحِد")).toBeTruthy();
  first.unmount();
  await seed(3);
  renderHome();
  await screen.findByTestId("review-card");
  expect(screen.getByText("٣ عَنَاصِر")).toBeTruthy();
});

test("today's window counts lessons finished today and says what is left", async () => {
  const today = NOW.toISOString();
  const yesterday = new Date(2026, 9, 15, 10).toISOString();
  await seed(0, {
    "u1-1": { completed: true, stars: 3, completedAt: today },
    "u1-2": { completed: true, stars: 2, completedAt: yesterday },
  });
  renderHome();
  const window = await screen.findByLabelText(windowLine(1));
  fireEvent.press(window);
  expect(Speech.speak).toHaveBeenLastCalledWith(
    "دَرْسَانِ، وَتُضِيءُ الْقَمَرِيَّةُ!",
    expect.anything(),
  );
});

test("the window lines name what is left, and glow at three", () => {
  expect(windowLine(0)).toBe("ثَلَاثَةُ دُرُوسٍ، وَتُضِيءُ الْقَمَرِيَّةُ!");
  expect(windowLine(2)).toBe("دَرْسٌ وَاحِدٌ، وَتُضِيءُ الْقَمَرِيَّةُ!");
  expect(windowLine(3)).toBe("أَضَاءَتِ الْقَمَرِيَّةُ الْيَوْمَ!");
  expect(windowLine(5)).toBe("أَضَاءَتِ الْقَمَرِيَّةُ الْيَوْمَ!");
});

test("the album tile shows how many stickers the stars have earned", async () => {
  const at = NOW.toISOString();
  const lessons = Object.fromEntries(
    ["u1-1", "u1-2", "u1-3", "u1-4", "u1-5", "u2-1", "u2-2", "u2-3", "u2-4"].map((id) => [
      id,
      { completed: true, stars: 3, completedAt: at },
    ]),
  );
  await seed(0, lessons);
  renderHome();
  // 27 stars: two stickers at 12 stars each.
  await screen.findByText("٢٧");
  expect(screen.getByTestId("album-button")).toHaveTextContent("٢");
});
