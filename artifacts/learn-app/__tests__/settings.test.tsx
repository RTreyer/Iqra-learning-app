import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, render } from "@testing-library/react-native";
import React, { useEffect } from "react";

import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  SettingsProvider,
  parseSettings,
  useSettings,
} from "@/context/SettingsContext";
import * as haptics from "@/lib/haptics";
import { isSpeechMuted, speak } from "@/lib/speech";

const Speech = jest.requireMock("expo-speech") as { speak: jest.Mock };

let api: ReturnType<typeof useSettings> | null = null;
function Probe() {
  const value = useSettings();
  useEffect(() => {
    api = value;
  }, [value]);
  return null;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  api = null;
});

test("parseSettings keeps known switches and ignores anything else", () => {
  expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
  expect(parseSettings("not json")).toEqual(DEFAULT_SETTINGS);
  expect(parseSettings('{"sound":false,"haptics":"yes"}')).toEqual({
    ...DEFAULT_SETTINGS,
    sound: false,
    haptics: true,
  });
  expect(parseSettings('{"introSeen":true,"bookId":"math-1"}')).toEqual({
    ...DEFAULT_SETTINGS,
    introSeen: true,
    bookId: "math-1",
  });
  expect(parseSettings('{"introSeen":"yes","bookId":7}')).toEqual(DEFAULT_SETTINGS);
});

test("turning the voice off silences speech but still reports done", async () => {
  render(
    <SettingsProvider>
      <Probe />
    </SettingsProvider>,
  );
  await act(async () => {});
  await act(async () => api!.update({ sound: false }));
  expect(isSpeechMuted()).toBe(true);
  const onDone = jest.fn();
  speak("مَرْحَبًا", { onDone });
  expect(Speech.speak).not.toHaveBeenCalled();
  expect(onDone).toHaveBeenCalledTimes(1);
  expect(JSON.parse((await AsyncStorage.getItem(SETTINGS_KEY))!)).toMatchObject({
    sound: false,
    haptics: true,
  });

  await act(async () => api!.update({ sound: true }));
  speak("مَرْحَبًا");
  expect(Speech.speak).toHaveBeenCalledTimes(1);
});

test("stored settings are read at start", async () => {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ sound: true, haptics: false }));
  render(
    <SettingsProvider>
      <Probe />
    </SettingsProvider>,
  );
  await act(async () => {});
  expect(api!.settings).toEqual({ ...DEFAULT_SETTINGS, haptics: false });
  expect(api!.loaded).toBe(true);
  const Haptics = jest.requireMock("expo-haptics") as { impactAsync: jest.Mock };
  haptics.tap();
  expect(Haptics.impactAsync).not.toHaveBeenCalled();
  await act(async () => api!.update({ haptics: true }));
});
