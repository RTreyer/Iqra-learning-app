import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, screen } from "@testing-library/react-native";
import React from "react";

import IntroScreen from "@/app/intro";
import { INTRO_STORY, stationScenes } from "@/content/story";
import { SettingsProvider } from "@/context/SettingsContext";
import { mockCanGoBack, renderScreen, setParams } from "@/test-utils/screens";

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  mockCanGoBack(true);
});

test("inherited names are no station", () => {
  expect(stationScenes("constructor")).toBeNull();
  expect(stationScenes("__proto__")).toBeNull();
  expect(stationScenes("toString")).toBeNull();
});

test.each(["constructor", "__proto__", "toString"])(
  "/intro?chapter=%s tells chapter 1 instead of crashing",
  async (chapter) => {
    setParams({ chapter });
    renderScreen(
      <SettingsProvider>
        <IntroScreen />
      </SettingsProvider>,
    );
    await act(async () => {});
    expect(screen.getByTestId(`intro-scene-${INTRO_STORY[0].id}`)).toBeTruthy();
  },
);
