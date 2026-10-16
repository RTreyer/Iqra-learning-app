import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import React from "react";

import ReviewScreen from "@/app/review";
import { ReviewRound } from "@/components/activities/ReviewRound";
import { books } from "@/content";
import { ProgressProvider, type ProgressItem } from "@/context/ProgressContext";
import { numberToArabicWord } from "@/lib/arabicNumbers";
import { routes } from "@/lib/routes";
import { allItems, itemsForLesson, type ReviewItem } from "@/lib/reviewItems";
import { pickDue } from "@/lib/srs";
import { mockCanGoBack, renderScreen } from "@/test-utils/screens";

const KEY = "@kidlearn_progress_v1";
const NOW = new Date(2026, 9, 16, 10, 0, 0);
const YESTERDAY = new Date(2026, 9, 15).toISOString();
const { router } = jest.requireMock("expo-router") as {
  router: { back: jest.Mock; replace: jest.Mock };
};

const unitA2 = books.flatMap((b) => b.units).find((u) => u.id === "a2")!;
const a2Items = unitA2.lessons.flatMap(itemsForLesson);
const letterIds = Array.from(
  new Set(a2Items.filter((i) => i.kind === "letter").map((i) => i.id)),
).slice(0, 2);
const wordId = a2Items.find((i) => i.kind === "word")!.id;
const seededIds = [...letterIds, wordId];

const seeded: ProgressItem = { box: 2, dueAt: YESTERDAY, lastSeenAt: YESTERDAY, lapses: 0 };

async function seed(ids: string[]) {
  const items = Object.fromEntries(ids.map((id) => [id, seeded]));
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify({ version: 2, lessons: {}, items, activity: { days: [] }, totalStars: 0 }),
  );
  return items;
}

async function stored() {
  const json = await AsyncStorage.getItem(KEY);
  return json ? JSON.parse(json) : null;
}

function labels(item: ReviewItem): { right: string; wrong: string } {
  switch (item.kind) {
    case "letter":
      return {
        right: item.letters[item.correctIndex],
        wrong: item.letters.find((_, i) => i !== item.correctIndex)!,
      };
    case "word":
      return {
        right: item.choices[item.correctIndex],
        wrong: item.choices.find((_, i) => i !== item.correctIndex)!,
      };
    default:
      throw new Error(`unexpected kind ${item.kind}`);
  }
}

/** Taps the right or wrong option of the shown item, then lets the 900 ms advance run. */
function answer(id: string, correct: boolean) {
  const { right, wrong } = labels(allItems().get(id)!);
  fireEvent.press(screen.getByRole("button", { name: correct ? right : wrong }));
  act(() => jest.advanceTimersByTime(900));
}

function renderReview() {
  return renderScreen(
    <ProgressProvider>
      <ReviewScreen />
    </ProgressProvider>,
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  jest.useFakeTimers({ now: NOW });
  mockCanGoBack(false);
});
afterEach(() => jest.useRealTimers());

test("the seeded ids exist in the catalog", () => {
  expect(letterIds).toHaveLength(2);
  for (const id of seededIds) expect(allItems().has(id)).toBe(true);
});

test("plays due items, repeats a wrong one once and records first answers only", async () => {
  const items = await seed(seededIds);
  const order = pickDue(items, NOW);
  expect(order).toHaveLength(3);
  renderReview();
  await screen.findByTestId("review-round");
  expect(screen.getByText("مُرَاجَعَة الْيَوْم")).toBeTruthy();
  expect(screen.getByText("3 عَنَاصِر")).toBeTruthy();

  const [first, second, third] = order;
  answer(first, false);
  answer(second, true);
  answer(third, true);
  // The wrong item comes back once at the end; this answer is not recorded again.
  answer(first, true);

  expect(screen.getByTestId("review-complete")).toBeTruthy();
  expect(screen.getByText("2/3")).toBeTruthy();
  expect(screen.getByText("أَحْسَنْت! مُرَاجَعَة الْيَوْم مُكْتَمِلَة")).toBeTruthy();

  await waitFor(async () =>
    expect((await stored()).items[first]).toMatchObject({ box: 1, lapses: 1 }),
  );
  const saved = (await stored()).items;
  for (const id of [second, third]) expect(saved[id]).toMatchObject({ box: 3, lapses: 0 });
  for (const id of order)
    expect(Date.parse(saved[id].lastSeenAt)).toBeGreaterThanOrEqual(NOW.getTime());

  fireEvent.press(screen.getByTestId("review-back"));
  expect(router.replace).toHaveBeenCalledWith(routes.home());
});

test("renders no card before stored progress has loaded, then the session", async () => {
  await seed(seededIds);
  renderReview();
  expect(screen.queryByTestId("review-empty")).toBeNull();
  expect(screen.queryByTestId("review-round")).toBeNull();
  expect(await screen.findByTestId("review-round")).toBeTruthy();
  expect(screen.queryByTestId("review-empty")).toBeNull();
});

test("an answer is recorded at the tap, even when the child leaves before the advance", async () => {
  const items = await seed(seededIds);
  const [first] = pickDue(items, NOW);
  const { unmount } = renderReview();
  await screen.findByTestId("review-round");
  const { wrong } = labels(allItems().get(first)!);
  fireEvent.press(screen.getByRole("button", { name: wrong }));
  act(() => jest.advanceTimersByTime(100));
  unmount();
  await waitFor(async () =>
    expect((await stored()).items[first]).toMatchObject({ box: 1, lapses: 1 }),
  );
});

test("shows the empty state when nothing is due", async () => {
  renderReview();
  await waitFor(() => expect(screen.getByTestId("review-empty")).toBeTruthy());
  expect(screen.getByText("لا شَيْءَ لِلْمُرَاجَعَةِ الْيَوْم")).toBeTruthy();
  expect(screen.queryByTestId("review-round")).toBeNull();
  fireEvent.press(screen.getByTestId("review-back"));
  expect(router.replace).toHaveBeenCalledWith(routes.home());
});

describe("ReviewRound", () => {
  const speech = jest.requireMock("expo-speech") as { speak: jest.Mock };
  const calc: ReviewItem = {
    id: "calc:3+2",
    kind: "calc",
    a: 3,
    b: 2,
    op: "+",
    options: [4, 5, 6],
  };
  const count: ReviewItem = {
    id: "count:3",
    kind: "count",
    emoji: "🍎",
    count: 3,
    options: [2, 3, 4],
  };

  test("calc: Eastern digits, first tap only, reports at the tap and advances after 900 ms", () => {
    const onFirstTap = jest.fn();
    const onAdvance = jest.fn();
    renderScreen(
      <ReviewRound item={calc} attemptKey="t:0" onFirstTap={onFirstTap} onAdvance={onAdvance} />,
    );
    expect(screen.getByText("٣ + ٢ = ؟")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "٤" }));
    expect(onFirstTap).toHaveBeenCalledWith(false);
    fireEvent.press(screen.getByRole("button", { name: "٥، صحيح" }));
    expect(onFirstTap).toHaveBeenCalledTimes(1);
    expect(speech.speak).toHaveBeenLastCalledWith(numberToArabicWord(5), expect.anything());
    act(() => jest.advanceTimersByTime(899));
    expect(onAdvance).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1));
    expect(onAdvance).toHaveBeenCalledTimes(1);
  });

  test("count: shows the objects and a right first tap reports true", () => {
    const onFirstTap = jest.fn();
    renderScreen(
      <ReviewRound item={count} attemptKey="t:1" onFirstTap={onFirstTap} onAdvance={jest.fn()} />,
    );
    expect(screen.getAllByText("🍎")).toHaveLength(3);
    fireEvent.press(screen.getByRole("button", { name: "٣" }));
    expect(onFirstTap).toHaveBeenCalledWith(true);
  });
});
