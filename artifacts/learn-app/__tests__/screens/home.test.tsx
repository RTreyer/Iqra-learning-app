import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, screen } from "@testing-library/react-native";
import React from "react";

import HomeScreen from "@/app/index";
import { getLesson } from "@/content";
import { ProgressProvider } from "@/context/ProgressContext";
import { routes } from "@/lib/routes";
import { allItems } from "@/lib/reviewItems";
import { renderScreen } from "@/test-utils/screens";

const KEY = "@kidlearn_progress_v1";
const NOW = new Date(2026, 9, 16, 10, 0, 0);
const DUE = new Date(2026, 9, 15).toISOString();
const { router } = jest.requireMock("expo-router") as { router: { push: jest.Mock } };

async function seed(dueCount: number, days: string[]) {
  const item = { box: 2, dueAt: DUE, lastSeenAt: DUE, lapses: 0 };
  const ids = Array.from(allItems().keys()).slice(0, dueCount);
  const items = Object.fromEntries(ids.map((id) => [id, item]));
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify({ version: 2, lessons: {}, items, activity: { days }, totalStars: 0 }),
  );
}

function renderHome() {
  return renderScreen(
    <ProgressProvider>
      <HomeScreen />
    </ProgressProvider>,
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  jest.useFakeTimers({ now: NOW });
});
afterEach(() => jest.useRealTimers());

test("first launch shows only the continue card, pointing at u1-1", async () => {
  renderHome();
  const card = await screen.findByTestId("continue-card");
  const { unit, lesson } = getLesson("u1-1")!;
  expect(card).toHaveTextContent(new RegExp(lesson.title));
  expect(card).toHaveTextContent(new RegExp(unit.title));
  expect(screen.queryByTestId("review-card")).toBeNull();
  expect(screen.queryByTestId("streak-badge")).toBeNull();
  fireEvent.press(card);
  expect(router.push).toHaveBeenCalledWith(routes.lesson("u1-1"));
});

test("home shows grades 1 to 6; only grade 1 opens, the others are coming soon", async () => {
  renderHome();
  await screen.findByTestId("continue-card");
  expect(screen.getByText("اختَر صفّك")).toBeTruthy();
  expect(screen.getByTestId("grade-1")).toHaveTextContent(/١.*الصف الأول/);
  expect(screen.getByTestId("grade-1")).not.toHaveTextContent(/قريباً/);
  for (const n of [2, 3, 4, 5, 6])
    expect(screen.getByTestId(`grade-${n}`)).toHaveTextContent(/قريباً/);
  expect(screen.queryByTestId(/^book-/)).toBeNull();
  fireEvent.press(screen.getByTestId("grade-2"));
  expect(router.push).not.toHaveBeenCalled();
  fireEvent.press(screen.getByTestId("grade-1"));
  expect(router.push).toHaveBeenCalledWith(routes.grade(1));
});

test("two due items and a two day streak show the review card and streak badge", async () => {
  await seed(2, ["2026-10-15", "2026-10-16"]);
  renderHome();
  const review = await screen.findByTestId("review-card");
  expect(screen.getByText("عُنْصُرَان")).toBeTruthy();
  expect(screen.getByTestId("streak-badge")).toHaveTextContent("🔥 ٢");
  expect(screen.getByLabelText("يَوْمَانِ مُتَتَالِيَانِ")).toBeTruthy();
  fireEvent.press(review);
  expect(router.push).toHaveBeenCalledWith(routes.review());
});

test("one due item uses the singular and a one day streak hides the badge", async () => {
  await seed(1, ["2026-10-16"]);
  renderHome();
  await screen.findByTestId("review-card");
  expect(screen.getByText("عُنْصُر وَاحِد")).toBeTruthy();
  expect(screen.queryByTestId("streak-badge")).toBeNull();
});

test("three due items and a three day streak use the plural", async () => {
  await seed(3, ["2026-10-14", "2026-10-15", "2026-10-16"]);
  renderHome();
  await screen.findByTestId("review-card");
  expect(screen.getByText("٣ عَنَاصِر")).toBeTruthy();
  expect(screen.getByLabelText("٣ أَيَّام مُتَتَالِيَة")).toBeTruthy();
});
