import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { VOICE_HINT_KEY, useVoiceHint } from "@/hooks/useVoiceHint";

const mockSpeech = jest.requireMock("expo-speech") as { getAvailableVoicesAsync: jest.Mock };

const settle = () =>
  act(async () => {
    await new Promise((r) => setImmediate(r));
  });

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

describe("useVoiceHint", () => {
  it("shows the hint when no Arabic voice and no flag, and dismiss stores the flag", async () => {
    mockSpeech.getAvailableVoicesAsync.mockResolvedValue([{ language: "en-US" }]);
    const { result } = renderHook(() => useVoiceHint());
    await waitFor(() => expect(result.current.visible).toBe(true));

    await act(async () => {
      result.current.dismiss();
    });
    expect(result.current.visible).toBe(false);
    await waitFor(async () => expect(await AsyncStorage.getItem(VOICE_HINT_KEY)).toBe("1"));
  });

  it("never shows when the flag is already stored", async () => {
    await AsyncStorage.setItem(VOICE_HINT_KEY, "1");
    mockSpeech.getAvailableVoicesAsync.mockResolvedValue([{ language: "en-US" }]);
    const { result } = renderHook(() => useVoiceHint());
    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalledWith(VOICE_HINT_KEY));
    await settle();
    expect(result.current.visible).toBe(false);
    expect(mockSpeech.getAvailableVoicesAsync).not.toHaveBeenCalled();
  });

  it("never shows when an Arabic voice exists", async () => {
    mockSpeech.getAvailableVoicesAsync.mockResolvedValue([{ language: "ar-SA" }]);
    const { result } = renderHook(() => useVoiceHint());
    await waitFor(() => expect(mockSpeech.getAvailableVoicesAsync).toHaveBeenCalled());
    await settle();
    expect(result.current.visible).toBe(false);
  });

  it("does nothing when unmounted before the voice check resolves", async () => {
    let resolveVoices: (v: { language: string }[]) => void = () => {};
    mockSpeech.getAvailableVoicesAsync.mockReturnValue(
      new Promise((r) => {
        resolveVoices = r;
      }),
    );
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const { unmount } = renderHook(() => useVoiceHint());
      await waitFor(() => expect(mockSpeech.getAvailableVoicesAsync).toHaveBeenCalled());
      unmount();
      resolveVoices([{ language: "en-US" }]);
      await settle();
      expect(errorSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
      warnSpy.mockRestore();
    }
  });
});
