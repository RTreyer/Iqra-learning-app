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

test("due items and a two day streak show the review card and streak badge", async () => {
  const ids = Array.from(allItems().keys()).slice(0, 2);
  const item = { box: 2, dueAt: DUE, lastSeenAt: DUE, lapses: 0 };
  const items = Object.fromEntries(ids.map((id) => [id, item]));
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify({ version: 2, lessons: {}, items, activity: { days: ["2026-10-15", "2026-10-16"] }, totalStars: 0 }),
  );
  renderHome();
  const review = await screen.findByTestId("review-card");
  expect(screen.getByText("2 عناصر")).toBeTruthy();
  expect(screen.getByTestId("streak-badge")).toHaveTextContent("🔥 2");
  expect(screen.getByLabelText("2 يَوْم مُتَتَالٍ")).toBeTruthy();
  fireEvent.press(review);
  expect(router.push).toHaveBeenCalledWith(routes.review());
});
