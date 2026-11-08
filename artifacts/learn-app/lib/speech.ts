import * as Speech from "expo-speech";
import { Platform } from "react-native";

import { explainLine, isExplainMode, lineParts } from "@/lib/explain";

export const ARABIC_RATE = 0.8;

export type SpeakOptions = {
  rate?: number;
  /** Called once speech ends, fails or is stopped, so a chain waiting on it never hangs. */
  onDone?: () => void;
};

let muted = false;

/** Parents' switch (context/SettingsContext): when muted, speak() stays silent and reports done at once. */
export function setSpeechMuted(value: boolean): void {
  muted = value;
  if (value) stopSpeaking();
}

export function isSpeechMuted(): boolean {
  return muted;
}

/** Rate of the English voice in the explanation mode (lib/explain.ts). */
export const ENGLISH_RATE = 0.95;

/** Each speak() call gets a number; parts of an older call stop once a newer one starts. */
let generation = 0;

/**
 * Speaks a line, stopping any current speech first. A number is read as the rate. In the
 * English explanation mode (lib/explain.ts) a line is spoken in English, part by part around
 * the Arabic learning in it, which keeps the Arabic voice.
 */
export function speak(text: string, options: number | SpeakOptions = {}): void {
  const { rate = ARABIC_RATE, onDone } = typeof options === "number" ? { rate: options } : options;
  if (muted) {
    onDone?.();
    return;
  }
  const parts = lineParts(text);
  const mine = ++generation;
  try {
    Speech.stop();
    const say = (i: number) => {
      const part = parts[i];
      const last = i === parts.length - 1;
      const next = () => {
        if (generation !== mine) return onDone?.();
        if (last) onDone?.();
        else say(i + 1);
      };
      const voice =
        part.lang === "en" ? { language: "en-US", rate: ENGLISH_RATE } : { language: "ar", rate };
      if (!onDone && last) Speech.speak(part.text, voice);
      else Speech.speak(part.text, { ...voice, onDone: next, onError: next, onStopped: next });
    };
    say(0);
  } catch {
    onDone?.();
  }
}

/** Short vowels, shadda, sukun and dagger alif: written, but not spoken as sounds of their own. */
const HARAKAT = /[ً-ٰٟ]/g;
const MS_PER_CHAR = 110;
const MIN_SPEECH_MS = 1500;
const MAX_SPEECH_MS = 8000;

/**
 * Generous guess of how long `text` takes to speak, for a fallback timer when the
 * engine never reports back. Too long only delays the next step on a silent device.
 */
export function estimateSpeechMs(text: string, rate: number = ARABIC_RATE): number {
  // English words are longer in letters than the vocalised Arabic, and spoken a little faster.
  const english = isExplainMode();
  const chars = english ? explainLine(text).length * 0.75 : text.replace(HARAKAT, "").length;
  const ms = (chars * MS_PER_CHAR) / rate;
  return Math.round(Math.min(MAX_SPEECH_MS, Math.max(MIN_SPEECH_MS, ms)));
}

/** True while the engine is speaking; false when it cannot tell. */
export async function isSpeaking(): Promise<boolean> {
  try {
    return await Speech.isSpeakingAsync();
  } catch {
    return false;
  }
}

/** Stops speech; a multi part line ends here (its caller still gets onDone) instead of going on. */
export function stopSpeaking(): void {
  generation++;
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
