import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";

import ParentsScreen from "@/app/parents";
import { FORGOT_HOLD_MS, MAX_TRIES, WAIT_MS } from "@/components/parents/ParentsLock";
import { ProfilesProvider } from "@/context/ProfilesContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { SETTINGS_KEY, SettingsProvider } from "@/context/SettingsContext";
import {
  MAX_PROFILES,
  PROFILES_KEY,
  createDefaultProfiles,
  makePin,
  progressKey,
  type ProfilesState,
} from "@/lib/profiles";
import { getLesson } from "@/content";
import { routes } from "@/lib/routes";
import { mockCanGoBack, renderScreen } from "@/test-utils/screens";

const { router } = jest.requireMock("expo-router") as { router: { replace: jest.Mock } };

const KEY = "@kidlearn_progress_v1";
const PIN = "2580";

function progressBlob(stars: number) {
  const lessons = { "u1-1": { completed: true, stars, completedAt: new Date().toISOString() } };
  return JSON.stringify({
    version: 2,
    lessons,
    items: {},
    activity: { days: [] },
    totalStars: stars,
  });
}

function renderParents() {
  return renderScreen(
    <ProfilesProvider>
      <SettingsProvider>
        <ProgressProvider>
          <ParentsScreen />
        </ProgressProvider>
      </SettingsProvider>
    </ProfilesProvider>,
  );
}

async function storedProfiles(): Promise<ProfilesState> {
  return JSON.parse((await AsyncStorage.getItem(PROFILES_KEY))!) as ProfilesState;
}

/** Two children and the PIN, as a family that has set the app up. */
async function seedFamily(extra: Partial<ProfilesState> = {}) {
  const state: ProfilesState = {
    ...createDefaultProfiles(),
    profiles: [
      { id: "main", name: "أمل", avatar: "camel", createdAt: "2026-11-01T00:00:00.000Z" },
      { id: "c2", name: "سالم", avatar: "ibex", createdAt: "2026-11-02T00:00:00.000Z" },
    ],
    pin: makePin(PIN, new Date("2026-11-01T00:00:00.000Z")),
    ...extra,
  };
  await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(state));
}

async function typePin(pin: string) {
  await act(async () => {
    for (const digit of pin) fireEvent.press(screen.getByTestId(`pin-key-${digit}`));
  });
}

async function openWithPin() {
  renderParents();
  await act(async () => {});
  await typePin(PIN);
  expect(screen.getByTestId("parents-content")).toBeTruthy();
}

beforeEach(async () => {
  await AsyncStorage.clear();
  mockCanGoBack(true);
});

afterEach(() => {
  jest.useRealTimers();
});

test("the first time, the gate is held and the parents choose a PIN, typed twice", async () => {
  renderParents();
  await act(async () => {});
  expect(screen.queryByTestId("parents-content")).toBeNull();
  fireEvent.press(screen.getByTestId("parents-gate"));
  expect(screen.queryByTestId("parents-content")).toBeNull();
  await act(async () => {
    fireEvent(screen.getByTestId("parents-gate"), "longPress");
  });
  // Two different PINs: try again.
  await typePin("1111");
  await typePin("2222");
  expect(screen.getByTestId("pin-message")).toHaveTextContent("الرمزان مختلفان. حاول مرة أخرى.");
  expect(screen.queryByTestId("parents-content")).toBeNull();
  await typePin(PIN);
  await typePin(PIN);
  expect(screen.getByTestId("parents-content")).toBeTruthy();
  expect(screen.getByTestId("grade-1").props.accessibilityState).toEqual({
    disabled: false,
    selected: true,
  });
  expect(screen.getByTestId("grade-2").props.accessibilityLabel).toMatch(/قريباً/);
  // Stored hashed, never as typed.
  const stored = await AsyncStorage.getItem(PROFILES_KEY);
  expect(stored).not.toContain(PIN);
  expect((await storedProfiles()).pin).not.toBeNull();
});

test("with a PIN, a wrong one keeps the corner closed and the right one opens it", async () => {
  await seedFamily();
  renderParents();
  await act(async () => {});
  expect(screen.queryByTestId("parents-gate")).toBeNull();
  await typePin("0000");
  expect(screen.getByTestId("pin-message")).toHaveTextContent("الرمز غير صحيح.");
  expect(screen.queryByTestId("parents-content")).toBeNull();
  await typePin(PIN);
  expect(screen.getByTestId("parents-content")).toBeTruthy();
});

test("after five wrong PINs the pad waits half a minute", async () => {
  jest.useFakeTimers();
  await seedFamily();
  renderParents();
  await act(async () => {});
  for (let i = 0; i < MAX_TRIES; i++) await typePin("0000");
  expect(screen.getByTestId("pin-message")).toHaveTextContent("انتظر قليلاً ثم حاول مرة أخرى.");
  // Even the right PIN does nothing while waiting.
  await typePin(PIN);
  expect(screen.queryByTestId("parents-content")).toBeNull();
  await act(async () => {
    jest.advanceTimersByTime(WAIT_MS);
  });
  await typePin(PIN);
  expect(screen.getByTestId("parents-content")).toBeTruthy();
});

test("a forgotten PIN is replaced after a long hold; children and progress stay", async () => {
  await seedFamily();
  await AsyncStorage.setItem(KEY, progressBlob(3));
  await AsyncStorage.setItem(progressKey("c2"), progressBlob(2));
  renderParents();
  await act(async () => {});
  fireEvent.press(screen.getByTestId("forgot-pin"));
  expect(screen.getByTestId("forgot-gate")).toBeTruthy();
  expect(FORGOT_HOLD_MS).toBeGreaterThanOrEqual(5000);
  await act(async () => {
    fireEvent(screen.getByTestId("forgot-gate"), "longPress");
  });
  await typePin("1357");
  await typePin("1357");
  expect(screen.getByTestId("parents-content")).toBeTruthy();

  const profiles = await storedProfiles();
  expect(profiles.profiles.map((p) => p.id)).toEqual(["main", "c2"]);
  expect(profiles.pin!.changedAt).not.toBe("2026-11-01T00:00:00.000Z");
  expect(JSON.parse((await AsyncStorage.getItem(KEY))!).totalStars).toBe(3);
  expect(JSON.parse((await AsyncStorage.getItem(progressKey("c2")))!).totalStars).toBe(2);
  // The corner shows when the PIN was changed, so parents notice a change they did not make.
  expect(screen.getByTestId("pin-changed-at")).toBeTruthy();
});

test("the voice switch is saved for the whole phone", async () => {
  await seedFamily();
  await openWithPin();
  const sound = screen.getByTestId("setting-sound");
  expect(sound.props.accessibilityState).toEqual({ checked: true });
  await act(async () => {
    fireEvent.press(sound);
  });
  expect(screen.getByTestId("setting-sound").props.accessibilityState).toEqual({ checked: false });
  expect(JSON.parse((await AsyncStorage.getItem(SETTINGS_KEY))!).sound).toBe(false);
});

test("each child is listed with its own stars", async () => {
  await seedFamily();
  await AsyncStorage.setItem(KEY, progressBlob(3));
  await AsyncStorage.setItem(progressKey("c2"), progressBlob(1));
  await openWithPin();
  await act(async () => {});
  expect(screen.getByTestId("child-main").props.accessibilityLabel).toBe("أمل، النجوم ٣، الدروس ١");
  expect(screen.getByTestId("child-c2").props.accessibilityLabel).toBe("سالم، النجوم ١، الدروس ١");
});

test("adding a child stores its name and a picture no other child has", async () => {
  await seedFamily();
  await openWithPin();
  fireEvent.press(screen.getByTestId("child-add"));
  // The pictures of the other children are not offered.
  expect(screen.queryByTestId("choose-avatar-camel")).toBeNull();
  expect(screen.queryByTestId("choose-avatar-ibex")).toBeNull();
  fireEvent.changeText(screen.getByTestId("child-name"), "  نور  ");
  fireEvent.press(screen.getByTestId("choose-avatar-dhow"));
  await act(async () => {
    fireEvent.press(screen.getByTestId("child-add-save"));
  });
  const { profiles } = await storedProfiles();
  expect(profiles).toHaveLength(3);
  expect(profiles[2]).toMatchObject({ name: "نور", avatar: "dhow" });
});

test("a phone with eight children offers no ninth", async () => {
  const avatars = [
    "camel",
    "palm",
    "dhow",
    "coffee",
    "house",
    "turtle",
    "leopard",
    "ibex",
  ] as const;
  await seedFamily({
    profiles: avatars.map((avatar, i) => ({
      id: i === 0 ? "main" : `c${i}`,
      name: "",
      avatar,
      createdAt: "2026-11-01T00:00:00.000Z",
    })),
  });
  expect(avatars).toHaveLength(MAX_PROFILES);
  await openWithPin();
  expect(screen.queryByTestId("child-add")).toBeNull();
});

test("resetting one child's progress asks once more and leaves the other child alone", async () => {
  await seedFamily();
  await AsyncStorage.setItem(KEY, progressBlob(3));
  await AsyncStorage.setItem(progressKey("c2"), progressBlob(2));
  await openWithPin();
  fireEvent.press(screen.getByTestId("child-c2"));
  fireEvent.press(screen.getByTestId("child-reset-c2"));
  fireEvent.press(screen.getByTestId("child-cancel"));
  expect(await AsyncStorage.getItem(progressKey("c2"))).not.toBeNull();

  fireEvent.press(screen.getByTestId("child-reset-c2"));
  await act(async () => {
    fireEvent.press(screen.getByTestId("child-confirm"));
  });
  expect(await AsyncStorage.getItem(progressKey("c2"))).toBeNull();
  expect(JSON.parse((await AsyncStorage.getItem(KEY))!).totalStars).toBe(3);
});

test("removing a child removes what was stored for it; the last child cannot be removed", async () => {
  await seedFamily();
  await AsyncStorage.setItem(KEY, progressBlob(3));
  await AsyncStorage.setItem(progressKey("c2"), progressBlob(2));
  await AsyncStorage.setItem(`${SETTINGS_KEY}:c2`, JSON.stringify({ introSeen: true }));
  await openWithPin();
  fireEvent.press(screen.getByTestId("child-c2"));
  fireEvent.press(screen.getByTestId("child-remove-c2"));
  await act(async () => {
    fireEvent.press(screen.getByTestId("child-confirm"));
  });
  expect((await storedProfiles()).profiles.map((p) => p.id)).toEqual(["main"]);
  expect(await AsyncStorage.getItem(progressKey("c2"))).toBeNull();
  expect(await AsyncStorage.getItem(`${SETTINGS_KEY}:c2`)).toBeNull();
  expect(JSON.parse((await AsyncStorage.getItem(KEY))!).totalStars).toBe(3);

  fireEvent.press(screen.getByTestId("child-main"));
  expect(screen.queryByTestId("child-remove-main")).toBeNull();
  expect(screen.getByTestId("child-reset-main")).toBeTruthy();
});

test("watching the story again forgets only what was told, not the progress", async () => {
  await seedFamily();
  await AsyncStorage.setItem(KEY, progressBlob(3));
  await AsyncStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({ introSeen: true, bookId: "math-1", chaptersSeen: ["arabic", "math", "a2"] }),
  );
  await openWithPin();
  await act(async () => {
    fireEvent.press(screen.getByTestId("story-restart"));
  });
  expect(JSON.parse((await AsyncStorage.getItem(SETTINGS_KEY))!)).toMatchObject({
    introSeen: false,
    chaptersSeen: [],
  });
  // The lessons and stars stay; home tells the story on the next play.
  expect(JSON.parse((await AsyncStorage.getItem(KEY))!).totalStars).toBe(3);
  expect(router.replace).toHaveBeenCalledWith(routes.home());
});

test("what the child learned: each subject today, this week and in all, and the last lesson", async () => {
  await seedFamily();
  const now = Date.now();
  const at = (daysAgo: number) => new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  const lessons = {
    "u1-1": { completed: true, stars: 3, completedAt: at(0) },
    "u1-2": { completed: true, stars: 2, completedAt: at(10) },
    "math-u1-1": { completed: true, stars: 3, completedAt: at(3) },
  };
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify({ version: 2, lessons, items: {}, activity: { days: [] }, totalStars: 8 }),
  );
  await openWithPin();
  expect(screen.getByTestId("today-arabic-1")).toHaveTextContent(/١/);
  expect(screen.getByTestId("week-arabic-1")).toHaveTextContent(/١/);
  expect(screen.getByTestId("subject-row-arabic-1")).toHaveTextContent(/اللغة العربية/);
  expect(screen.getByTestId("today-math-1")).toHaveTextContent(/٠/);
  expect(screen.getByTestId("week-math-1")).toHaveTextContent(/١/);
  expect(screen.getByTestId("last-lesson")).toHaveTextContent(/اللغة العربية/);
  expect(String(screen.getByTestId("last-lesson").props.children)).toContain(
    getLesson("u1-1")!.lesson.title,
  );
});
