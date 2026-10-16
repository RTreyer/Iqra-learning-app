import mockReact from "react";
import "react-native-gesture-handler/jestSetup";

jest.mock("expo-speech", () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])),
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
    Soft: "soft",
    Rigid: "rigid",
  },
  NotificationFeedbackType: { Success: "success", Warning: "warning", Error: "error" },
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-router", () => {
  const params: Record<string, string | string[] | undefined> = {};
  return {
    __params: params,
    router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
    useLocalSearchParams: () => params,
    useFocusEffect: (cb: () => void | (() => void)) =>
      mockReact.useEffect(() => {
        cb();
      }, [cb]),
    Link: ({ children }: { children?: mockReact.ReactNode }) => children ?? null,
  };
});
