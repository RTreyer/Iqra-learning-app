import { render } from "@testing-library/react-native";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LanguageProvider } from "@/context/LanguageContext";

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

/** Renders a screen inside the providers screens need (safe area, language, gesture root). */
export function renderScreen(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <LanguageProvider initial="ar">
        <GestureHandlerRootView>{ui}</GestureHandlerRootView>
      </LanguageProvider>
    </SafeAreaProvider>,
  );
}

/** The mutable params object behind the mocked useLocalSearchParams. */
export function setParams(next: Record<string, string>) {
  const params = (
    jest.requireMock("expo-router") as { __params: Record<string, string | undefined> }
  ).__params;
  for (const key of Object.keys(params)) delete params[key];
  Object.assign(params, next);
}

/** The jest.setup router mock has no canGoBack; screens call it before going back. */
export function mockCanGoBack(value: boolean) {
  const { router } = jest.requireMock("expo-router") as { router: Record<string, unknown> };
  router.canGoBack = jest.fn(() => value);
}
