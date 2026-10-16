import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { VOICE_HINT_KEY, useVoiceHint } from "@/hooks/useVoiceHint";

const mockSpeech = jest.requireMock("expo-speech") as { getAvailableVoicesAsync: jest.Mock };

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
    expect(result.current.visible).toBe(false);
    expect(mockSpeech.getAvailableVoicesAsync).not.toHaveBeenCalled();
  });

  it("never shows when an Arabic voice exists", async () => {
    mockSpeech.getAvailableVoicesAsync.mockResolvedValue([{ language: "ar-SA" }]);
    const { result } = renderHook(() => useVoiceHint());
    await waitFor(() => expect(mockSpeech.getAvailableVoicesAsync).toHaveBeenCalled());
    expect(result.current.visible).toBe(false);
  });
});
