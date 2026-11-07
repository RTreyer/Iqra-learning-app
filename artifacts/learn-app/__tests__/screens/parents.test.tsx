import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";

import ParentsScreen from "@/app/parents";
import { ProgressProvider } from "@/context/ProgressContext";
import { SETTINGS_KEY, SettingsProvider } from "@/context/SettingsContext";
import { mockCanGoBack, renderScreen } from "@/test-utils/screens";

const KEY = "@kidlearn_progress_v1";

function renderParents() {
  return renderScreen(
    <SettingsProvider>
      <ProgressProvider>
        <ParentsScreen />
      </ProgressProvider>
    </SettingsProvider>,
  );
}

async function open() {
  await act(async () => {
    fireEvent(screen.getByTestId("parents-gate"), "longPress");
  });
}

beforeEach(async () => {
  await AsyncStorage.clear();
  mockCanGoBack(true);
});

test("the corner stays closed until the gate is held", async () => {
  renderParents();
  await act(async () => {});
  expect(screen.queryByTestId("parents-content")).toBeNull();
  fireEvent.press(screen.getByTestId("parents-gate"));
  expect(screen.queryByTestId("parents-content")).toBeNull();
  await open();
  expect(screen.getByTestId("parents-content")).toBeTruthy();
  expect(screen.getByTestId("grade-1").props.accessibilityState).toEqual({
    disabled: false,
    selected: true,
  });
  expect(screen.getByTestId("grade-2").props.accessibilityLabel).toMatch(/قريباً/);
});

test("the voice switch is saved", async () => {
  renderParents();
  await act(async () => {});
  await open();
  const sound = screen.getByTestId("setting-sound");
  expect(sound.props.accessibilityState).toEqual({ checked: true });
  await act(async () => {
    fireEvent.press(sound);
  });
  expect(screen.getByTestId("setting-sound").props.accessibilityState).toEqual({ checked: false });
  expect(JSON.parse((await AsyncStorage.getItem(SETTINGS_KEY))!).sound).toBe(false);
  await act(async () => {
    fireEvent.press(screen.getByTestId("setting-sound"));
  });
});

test("resetting progress asks once more, and cancel keeps everything", async () => {
  const lessons = { "u1-1": { completed: true, stars: 3, completedAt: new Date().toISOString() } };
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify({ version: 2, lessons, items: {}, activity: { days: [] }, totalStars: 3 }),
  );
  renderParents();
  await act(async () => {});
  await open();
  fireEvent.press(screen.getByTestId("reset-progress"));
  fireEvent.press(screen.getByTestId("reset-cancel"));
  expect(await AsyncStorage.getItem(KEY)).not.toBeNull();

  fireEvent.press(screen.getByTestId("reset-progress"));
  await act(async () => {
    fireEvent.press(screen.getByTestId("reset-confirm"));
  });
  expect(await AsyncStorage.getItem(KEY)).toBeNull();
  expect(screen.getByText("تم مسح التقدم")).toBeTruthy();
});
