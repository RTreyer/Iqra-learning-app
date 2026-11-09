import { setAudioModeAsync } from "expo-audio";
import { Platform } from "react-native";

import { prepareSpeech } from "@/lib/speech";

const setMode = setAudioModeAsync as jest.Mock;
const os = Platform.OS;

afterEach(() => {
  setMode.mockClear();
  Platform.OS = os;
});

test("on iPhone the voice plays with the silent switch on", async () => {
  Platform.OS = "ios";
  await prepareSpeech();
  expect(setMode).toHaveBeenCalledWith({ playsInSilentMode: true });
});

test("other platforms keep their audio settings", async () => {
  Platform.OS = "android";
  await prepareSpeech();
  expect(setMode).not.toHaveBeenCalled();
});

test("a failing audio session does not break the app", async () => {
  Platform.OS = "ios";
  setMode.mockRejectedValueOnce(new Error("no session"));
  await expect(prepareSpeech()).resolves.toBeUndefined();
});
