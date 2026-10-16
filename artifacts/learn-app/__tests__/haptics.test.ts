import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import * as haptics from "@/lib/haptics";

const mockHaptics = jest.requireMock("expo-haptics") as {
  impactAsync: jest.Mock;
  notificationAsync: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("haptics on native", () => {
  it("tap triggers a light impact", () => {
    haptics.tap();
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });

  it.each([
    ["success", haptics.success, Haptics.NotificationFeedbackType.Success],
    ["error", haptics.error, Haptics.NotificationFeedbackType.Error],
    ["warning", haptics.warning, Haptics.NotificationFeedbackType.Warning],
  ] as const)("%s triggers the matching notification", (_name, fn, type) => {
    fn();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(type);
  });

  it("swallows a rejected promise", async () => {
    mockHaptics.impactAsync.mockRejectedValueOnce(new Error("unsupported"));
    expect(() => haptics.tap()).not.toThrow();
    await new Promise((r) => setImmediate(r));
  });
});

describe("haptics on web", () => {
  it("calls nothing", () => {
    jest.replaceProperty(Platform, "OS", "web");
    haptics.tap();
    haptics.success();
    haptics.error();
    haptics.warning();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });
});
