import * as Speech from "expo-speech";

import { hasArabicVoice, speak } from "@/lib/speech";

const mockSpeech = jest.requireMock("expo-speech") as {
  speak: jest.Mock;
  stop: jest.Mock;
  getAvailableVoicesAsync: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("speak", () => {
  it("stops current speech, then speaks Arabic at rate 0.8", () => {
    speak("ب");
    expect(Speech.stop).toHaveBeenCalledTimes(1);
    expect(Speech.speak).toHaveBeenCalledWith("ب", { language: "ar", rate: 0.8 });
    expect(mockSpeech.stop.mock.invocationCallOrder[0]).toBeLessThan(
      mockSpeech.speak.mock.invocationCallOrder[0],
    );
  });

  it("passes a custom rate through", () => {
    speak("x", 0.5);
    expect(Speech.speak).toHaveBeenCalledWith("x", { language: "ar", rate: 0.5 });
  });

  it("does not throw when Speech.speak throws", () => {
    mockSpeech.speak.mockImplementationOnce(() => {
      throw new Error("tts failure");
    });
    expect(() => speak("ب")).not.toThrow();
  });
});

describe("hasArabicVoice", () => {
  it("returns true when an ar-SA voice exists", async () => {
    mockSpeech.getAvailableVoicesAsync.mockResolvedValueOnce([{ language: "ar-SA" }]);
    await expect(hasArabicVoice()).resolves.toBe(true);
  });

  it("returns false when only en-US voices exist", async () => {
    mockSpeech.getAvailableVoicesAsync.mockResolvedValueOnce([{ language: "en-US" }]);
    await expect(hasArabicVoice()).resolves.toBe(false);
  });

  it("returns true when the voice list is empty (unknown)", async () => {
    mockSpeech.getAvailableVoicesAsync.mockResolvedValueOnce([]);
    await expect(hasArabicVoice()).resolves.toBe(true);
  });
});
