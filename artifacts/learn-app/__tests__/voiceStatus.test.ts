import { onVoiceStatus, speak, stopSpeaking, voiceStatus } from "@/lib/speech";

type Callbacks = {
  onStart?: () => void;
  onDone?: () => void;
  onError?: (e: unknown) => void;
  onStopped?: () => void;
};
const Speech = jest.requireMock("expo-speech") as { speak: jest.Mock };
const last = (): Callbacks => Speech.speak.mock.calls.at(-1)![1];

test("no sound twice in a row means no voice; a heard line means the voice works (UX-03)", () => {
  const seen: boolean[] = [];
  const unsubscribe = onVoiceStatus((works) => seen.push(works));
  expect(voiceStatus()).toBeNull();

  // Blocked until the first tap, or stopped by newer speech: says nothing about the voice.
  speak("أ");
  last().onError?.({ error: "not-allowed" });
  speak("ب");
  last().onStopped?.();
  speak("ت");
  const cut = last();
  speak("ث");
  cut.onDone?.();
  expect(voiceStatus()).toBeNull();

  // Two lines that end by themselves without a sound.
  speak("ج");
  last().onDone?.();
  expect(voiceStatus()).toBeNull();
  speak("ح");
  last().onError?.({ error: "synthesis-failed" });
  expect(voiceStatus()).toBe(false);

  // Then a voice is heard (installed meanwhile): it works.
  speak("خ");
  last().onStart?.();
  last().onDone?.();
  expect(voiceStatus()).toBe(true);
  expect(seen).toEqual([false, true]);
  unsubscribe();
  stopSpeaking();
});
