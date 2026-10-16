import * as Speech from "expo-speech";
import { Platform } from "react-native";

export const ARABIC_RATE = 0.8;

export function speak(text: string, rate: number = ARABIC_RATE): void {
  try {
    Speech.stop();
    Speech.speak(text, { language: "ar", rate });
  } catch {}
}

export function stopSpeaking(): void {
  try {
    Speech.stop();
  } catch {}
}

const ARABIC = /^ar/i;
const VOICES_TIMEOUT_MS = 1500;

function waitForVoices(synth: SpeechSynthesis, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      synth.removeEventListener("voiceschanged", done);
      resolve();
    };
    const timer = setTimeout(done, timeoutMs);
    synth.addEventListener("voiceschanged", done);
  });
}

/**
 * True when an Arabic TTS voice is available.
 * An empty or unavailable voice list means "unknown" (Android engines often
 * report late, some browsers load voices lazily), so we return true to avoid
 * false warnings. Only a non empty list without any Arabic voice yields false.
 */
export async function hasArabicVoice(): Promise<boolean> {
  try {
    let languages: string[];
    if (Platform.OS === "web") {
      const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
      if (!synth) return true;
      let voices = synth.getVoices();
      // Chromium loads voices lazily: wait once for voiceschanged, then re-read.
      // Without event support we cannot wait, so the empty list means "unknown".
      if (voices.length === 0) {
        if (typeof synth.addEventListener !== "function") return true;
        await waitForVoices(synth, VOICES_TIMEOUT_MS);
        voices = synth.getVoices();
      }
      languages = voices.map((v) => v.lang);
    } else {
      const voices = await Speech.getAvailableVoicesAsync();
      languages = voices.map((v) => v.language);
    }
    if (languages.length === 0) return true;
    return languages.some((lang) => ARABIC.test(lang));
  } catch {
    return true;
  }
}
