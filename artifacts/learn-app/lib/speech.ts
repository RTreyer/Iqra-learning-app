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
      languages = synth.getVoices().map((v) => v.lang);
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
