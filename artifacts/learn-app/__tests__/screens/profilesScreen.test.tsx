import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";

import HomeScreen from "@/app/index";
import ProfilesScreen, { WHO_LEARNS } from "@/app/profiles";
import { ProfilesProvider } from "@/context/ProfilesContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { SETTINGS_KEY, SettingsProvider } from "@/context/SettingsContext";
import { PROFILES_KEY, createDefaultProfiles, type ProfilesState } from "@/lib/profiles";
import { routes } from "@/lib/routes";
import { mockCanGoBack, renderScreen } from "@/test-utils/screens";

const { router } = jest.requireMock("expo-router") as {
  router: { push: jest.Mock; replace: jest.Mock };
};
const Speech = jest.requireMock("expo-speech") as { speak: jest.Mock };

function renderWith(ui: React.ReactElement) {
  return renderScreen(
    <ProfilesProvider>
      <SettingsProvider>
        <ProgressProvider>{ui}</ProgressProvider>
      </SettingsProvider>
    </ProfilesProvider>,
  );
}

async function seedChildren(n: 1 | 2) {
  const state: ProfilesState = createDefaultProfiles();
  if (n === 2)
    state.profiles.push({ id: "c2", name: "سالم", avatar: "ibex", createdAt: "2026-11-15" });
  await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(state));
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ introSeen: true }));
}

afterEach(() => {
  jest.useRealTimers();
});

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  mockCanGoBack(true);
});

test("with one child the app opens at home, without asking who learns", async () => {
  await seedChildren(1);
  renderWith(<HomeScreen />);
  await act(async () => {});
  expect(router.replace).not.toHaveBeenCalledWith(routes.profiles());
  expect(screen.queryByTestId("profile-button")).toBeNull();
});

test("with two children the app first asks who learns today", async () => {
  await seedChildren(2);
  renderWith(<HomeScreen />);
  await act(async () => {});
  expect(router.replace).toHaveBeenCalledWith(routes.profiles());
});

test("the child taps its own picture; the names are for the parents", async () => {
  jest.useFakeTimers();
  // At the start there is nothing behind the question.
  mockCanGoBack(false);
  await seedChildren(2);
  renderWith(<ProfilesScreen />);
  await act(async () => {});
  // Hudhud speaks shortly after the screen appears.
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
  expect(Speech.speak).toHaveBeenCalledWith(WHO_LEARNS, expect.anything());
  // Before a child is chosen there is no way back past the question.
  expect(screen.queryByLabelText("رجوع")).toBeNull();
  expect(screen.getByTestId("profile-main").props.accessibilityLabel).toBe("جَمَل");
  expect(screen.getByTestId("profile-c2").props.accessibilityLabel).toBe("سالم");
  await act(async () => {
    fireEvent.press(screen.getByTestId("profile-c2"));
  });
  expect(router.replace).toHaveBeenCalledWith(routes.home());
  expect(JSON.parse((await AsyncStorage.getItem(PROFILES_KEY))!).activeId).toBe("c2");
});

test("home shows the active child's picture, which leads back to the question", async () => {
  await seedChildren(2);
  renderWith(
    <>
      <ProfilesScreen />
      <HomeScreen />
    </>,
  );
  await act(async () => {});
  await act(async () => {
    fireEvent.press(screen.getByTestId("profile-c2"));
  });
  const button = screen.getByTestId("profile-button");
  expect(button.props.accessibilityLabel).toBe("مَنْ يَتَعَلَّمُ؟ سالم");
  fireEvent.press(button);
  expect(router.push).toHaveBeenCalledWith(routes.profiles());
});
