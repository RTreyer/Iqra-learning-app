import { act, render } from "@testing-library/react-native";
import React from "react";

import { Guide } from "@/components/world/Guide";
import { PathMap, resetPathMemory, type Stop } from "@/components/world/PathMap";
import { LanguageProvider } from "@/context/LanguageContext";

const router = jest.requireMock("expo-router") as { useIsFocused: () => boolean };
const Speech = jest.requireMock("expo-speech") as { speak: jest.Mock };
const realIsFocused = router.useIsFocused;
let focused = true;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  resetPathMemory();
  focused = true;
  router.useIsFocused = () => focused;
});
afterEach(() => {
  jest.useRealTimers();
  router.useIsFocused = realIsFocused;
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider initial="ar">{children}</LanguageProvider>
);
const spoken = () => Speech.speak.mock.calls.map((c) => c[0]);

test("Guide waits while its screen is behind a lesson and says a new line once back", () => {
  focused = false;
  const view = render(<Guide text="أَوَّلُ" speakOnMount />, { wrapper });
  act(() => jest.advanceTimersByTime(2000));
  expect(Speech.speak).not.toHaveBeenCalled();
  focused = true;
  view.rerender(<Guide text="أَوَّلُ" speakOnMount />);
  act(() => jest.advanceTimersByTime(400));
  expect(spoken()).toEqual(["أَوَّلُ"]);
  // Behind a lesson again and back: a line already said is not said again.
  focused = false;
  view.rerender(<Guide text="أَوَّلُ" speakOnMount />);
  focused = true;
  view.rerender(<Guide text="أَوَّلُ" speakOnMount />);
  act(() => jest.advanceTimersByTime(400));
  expect(spoken()).toEqual(["أَوَّلُ"]);
});

test("the path guide does not speak over a lesson and speaks once the path is in front", () => {
  const stop = (key: string, state: Stop["state"]): Stop => ({
    key,
    testID: key,
    accessibilityLabel: key,
    state,
    picture: () => null,
  });
  const stops = [stop("a", "done"), stop("b", "current")];
  focused = false;
  const map = <PathMap stops={stops} color="#000" onPress={() => {}} guide="هَيَّا" pathKey="p" />;
  const view = render(map, { wrapper });
  act(() => jest.advanceTimersByTime(5000));
  expect(Speech.speak).not.toHaveBeenCalled();
  focused = true;
  view.rerender(
    <PathMap stops={stops} color="#000" onPress={() => {}} guide="هَيَّا" pathKey="p" />,
  );
  act(() => jest.advanceTimersByTime(5000));
  expect(spoken()).toEqual(["هَيَّا"]);
});
