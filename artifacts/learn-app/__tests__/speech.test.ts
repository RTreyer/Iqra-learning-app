import * as Speech from "expo-speech";

import { Platform } from "react-native";

import { hasArabicVoice, speak, stopSpeaking } from "@/lib/speech";

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

  it("accepts an options object with a rate", () => {
    speak("x", { rate: 0.6 });
    expect(Speech.speak).toHaveBeenCalledWith("x", { language: "ar", rate: 0.6 });
  });

  it("calls onDone when speech finishes, fails or is stopped", () => {
    const onDone = jest.fn();
    speak("ب", { onDone });
    const options = mockSpeech.speak.mock.calls[0][1];
    expect(options).toMatchObject({ language: "ar", rate: 0.8 });
    options.onDone();
    options.onError(new Error("x"));
    options.onStopped();
    expect(onDone).toHaveBeenCalledTimes(3);
  });

  it("calls onDone when Speech.speak throws", () => {
    mockSpeech.speak.mockImplementationOnce(() => {
      throw new Error("tts failure");
    });
    const onDone = jest.fn();
    expect(() => speak("ب", { onDone })).not.toThrow();
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("does not throw when Speech.speak throws", () => {
    mockSpeech.speak.mockImplementationOnce(() => {
      throw new Error("tts failure");
    });
    expect(() => speak("ب")).not.toThrow();
  });
});

describe("stopSpeaking", () => {
  it("calls Speech.stop", () => {
    stopSpeaking();
    expect(Speech.stop).toHaveBeenCalledTimes(1);
  });
});

describe("hasArabicVoice", () => {
  it("returns true when getAvailableVoicesAsync rejects", async () => {
    mockSpeech.getAvailableVoicesAsync.mockRejectedValueOnce(new Error("no engine"));
    await expect(hasArabicVoice()).resolves.toBe(true);
  });

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

describe("hasArabicVoice on web", () => {
  type Listener = () => void;
  let voices: { lang: string }[];
  let listeners: Listener[];
  const synth = {
    getVoices: () => voices,
    addEventListener: (_: string, cb: Listener) => listeners.push(cb),
    removeEventListener: (_: string, cb: Listener) => {
      listeners = listeners.filter((l) => l !== cb);
    },
  };

  let platformOS: { restore: () => void } | undefined;

  beforeEach(() => {
    voices = [];
    listeners = [];
    platformOS = jest.replaceProperty(Platform, "OS", "web");
    Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
  });

  afterEach(() => {
    platformOS?.restore();
    jest.useRealTimers();
    delete (window as { speechSynthesis?: unknown }).speechSynthesis;
  });

  it("waits for voiceschanged when the first list is empty", async () => {
    const result = hasArabicVoice();
    await Promise.resolve();
    expect(listeners).toHaveLength(1);
    voices = [{ lang: "en-US" }];
    listeners[0]();
    await expect(result).resolves.toBe(false);
    expect(listeners).toHaveLength(0);
  });

  it("returns true after the timeout when no voices load", async () => {
    jest.useFakeTimers();
    const result = hasArabicVoice();
    await Promise.resolve();
    jest.advanceTimersByTime(1500);
    await expect(result).resolves.toBe(true);
    expect(listeners).toHaveLength(0);
  });

  it("returns true when speechSynthesis has no addEventListener", async () => {
    Object.defineProperty(window, "speechSynthesis", {
      value: { getVoices: () => [] },
      configurable: true,
    });
    await expect(hasArabicVoice()).resolves.toBe(true);
  });
});
