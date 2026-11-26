import { setAudioModeAsync } from "expo-audio";
import * as Speech from "expo-speech";
import { Platform } from "react-native";

import { explainLine, isExplainMode, lineParts } from "@/lib/explain";

export const ARABIC_RATE = 0.8;

export type SpeakOptions = {
  rate?: number;
  /** Called when the voice actually starts (engines that report it). */
  onStart?: () => void;
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

/**
 * On iPhone the voice follows the app's audio session, which by default is muted by the
 * ring/silent switch. Children do not know the switch, so the voice plays anyway.
 */
export async function prepareSpeech(): Promise<void> {
  if (Platform.OS !== "ios") return;
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
  } catch {}
}

/** Rate of the English voice in the explanation mode (lib/explain.ts). */
export const ENGLISH_RATE = 0.95;

/** Short vowels, shadda, sukun and dagger alif: written, but not spoken as sounds of their own. */
const HARAKAT = /[ً-ٰٟ]/g;
const MS_PER_CHAR = 110;
const MIN_SPEECH_MS = 1500;
const MAX_SPEECH_MS = 8000;

/** Each speak() call gets a number; parts of an older call stop once a newer one starts. */
let generation = 0;

/**
 * Whether the voice works, as heard: true once a line has started, false once two lines in a
 * row ended without ever starting (no text to speech engine, or no voice at all, which the
 * voice list cannot tell: it is often just empty). null until then.
 */
let voiceWorks: boolean | null = null;
let silentLines = 0;
const voiceListeners = new Set<(works: boolean) => void>();

function setVoiceWorks(works: boolean) {
  if (voiceWorks === works) return;
  voiceWorks = works;
  for (const listener of voiceListeners) listener(works);
}

/** What the voice has shown so far: works, does not, or not known yet (null). */
export function voiceStatus(): boolean | null {
  return voiceWorks;
}

/** Calls `listener` whenever voiceStatus() changes; returns the unsubscribe. */
export function onVoiceStatus(listener: (works: boolean) => void): () => void {
  voiceListeners.add(listener);
  return () => {
    voiceListeners.delete(listener);
  };
}

/** The speak() call whose voice has started and not ended yet (engines that report a start). */
let activeLine: number | null = null;
/** Waiting for the active line to end (afterCurrentLine). */
let lineWaiters: (() => void)[] = [];

function lineEnded(line: number | "all") {
  if (line !== "all" && activeLine !== line) return;
  activeLine = null;
  const waiters = lineWaiters;
  lineWaiters = [];
  for (const waiter of waiters) waiter();
}

/**
 * Speaks a line, stopping any current speech first. A number is read as the rate. In the
 * English explanation mode (lib/explain.ts) a line is spoken in English, part by part around
 * the Arabic learning in it, which keeps the Arabic voice.
 */
export function speak(text: string, options: number | SpeakOptions = {}): void {
  const {
    rate = ARABIC_RATE,
    onStart,
    onDone,
  } = typeof options === "number" ? { rate: options } : options;
  if (muted) {
    onDone?.();
    return;
  }
  const parts = lineParts(text);
  const mine = ++generation;
  try {
    Speech.stop();
    let heard = false;
    const started = () => {
      heard = true;
      silentLines = 0;
      setVoiceWorks(true);
      if (generation !== mine) return;
      activeLine = mine;
      onStart?.();
    };
    const say = (i: number) => {
      const part = parts[i];
      const last = i === parts.length - 1;
      let reported = false;
      /** `silent`: the line ended by itself (or failed) without a sound being reported. */
      const next = (silent: boolean) => {
        // Engines may report a stopped part twice (stopped, then error): move on once.
        if (reported) return;
        reported = true;
        if (generation !== mine || last) {
          // Two lines in a row that ended without a sound: there is no voice. A line stopped
          // by newer speech, or blocked until the first tap, says nothing about the voice.
          if (silent && generation === mine && !heard && ++silentLines >= 2) setVoiceWorks(false);
          lineEnded(mine);
          return onDone?.();
        }
        say(i + 1);
      };
      const voice =
        part.lang === "en" ? { language: "en-US", rate: ENGLISH_RATE } : { language: "ar", rate };
      Speech.speak(part.text, {
        ...voice,
        ...(i === 0 ? { onStart: started } : {}),
        onDone: () => next(true),
        onError: (error: unknown) => next(!isBlocked(error)),
        onStopped: () => next(false),
      });
    };
    say(0);
  } catch {
    lineEnded(mine);
    onDone?.();
  }
}

/**
 * Errors that say nothing about the voice: the browser blocks speech until the first tap
 * ("not-allowed"), or the line was cut ("interrupted", "canceled").
 */
function isBlocked(error: unknown): boolean {
  const code =
    typeof error === "object" && error !== null && "error" in error
      ? String((error as { error: unknown }).error)
      : String(error ?? "");
  return /not-allowed|interrupted|cancel/i.test(code);
}

/** Pause between two lines that follow each other, so they do not run together. */
export const LINE_PAUSE_MS = 300;
/** A voice that has not started by then (and not within its estimate) is taken as silent. */
const NO_START_MS = 2500;

/** How long speakThen waits for a voice that never starts before it moves on. */
export function silentLineMs(text: string, rate: number = ARABIC_RATE): number {
  return Math.max(NO_START_MS, estimateSpeechMs(text, rate));
}

/**
 * Speaks a line and calls `onEnd` once it has really ended (or was stopped by newer speech),
 * after a short pause. A slow or late voice is never cut by a timer: timers only cover a voice
 * that never starts (silentLineMs) or that never reports its end once started (twice the
 * uncapped estimate plus a second). Returns a cancel function; after it `onEnd` is not called.
 */
export function speakThen(
  text: string,
  onEnd: () => void,
  { rate = ARABIC_RATE, pauseMs = LINE_PAUSE_MS }: { rate?: number; pauseMs?: number } = {},
): () => void {
  let started = false;
  let ended = false;
  let cancelled = false;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const end = () => {
    if (ended || cancelled) return;
    ended = true;
    timers.forEach(clearTimeout);
    timers.push(
      setTimeout(() => {
        if (!cancelled) onEnd();
      }, pauseMs),
    );
  };
  timers.push(
    setTimeout(() => {
      if (!started) end();
    }, silentLineMs(text, rate)),
  );
  timers.push(setTimeout(end, 2 * rawSpeechMs(text, rate) + 1000));
  speak(text, {
    rate,
    onStart: () => {
      started = true;
    },
    onDone: end,
  });
  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
  };
}

/**
 * Calls `then` once the line the voice is speaking now has ended, plus a short pause; at once
 * when nothing is being spoken. Used before moving on (the next round), so praise is never cut.
 * A cap of `maxWaitMs` keeps a voice that never reports its end from holding the lesson up.
 * Returns a cancel function.
 */
export function afterCurrentLine(
  then: () => void,
  { pauseMs = LINE_PAUSE_MS, maxWaitMs = MAX_SPEECH_MS } = {},
): () => void {
  if (activeLine === null) {
    then();
    return () => {};
  }
  let done = false;
  let pause: ReturnType<typeof setTimeout> | undefined;
  const finish = () => {
    if (done) return;
    done = true;
    clearTimeout(cap);
    pause = setTimeout(then, pauseMs);
  };
  const cap = setTimeout(finish, maxWaitMs);
  lineWaiters.push(finish);
  return () => {
    done = true;
    clearTimeout(cap);
    clearTimeout(pause);
    lineWaiters = lineWaiters.filter((waiter) => waiter !== finish);
  };
}

/**
 * Speaks `text` after `delayMs`, unless anything else was spoken in between (the child already
 * answered and hears praise, or tapped to hear something): a late prompt must not cut that.
 * Returns the cleanup for an effect.
 */
export function speakLater(text: string, delayMs: number): () => void {
  const at = generation;
  const timer = setTimeout(() => {
    if (generation === at) speak(text);
  }, delayMs);
  return () => clearTimeout(timer);
}


/**
 * Generous guess of how long `text` takes to speak, for a fallback timer when the
 * engine never reports back. Too long only delays the next step on a silent device.
 */
export function estimateSpeechMs(text: string, rate: number = ARABIC_RATE): number {
  return Math.round(Math.min(MAX_SPEECH_MS, Math.max(MIN_SPEECH_MS, rawSpeechMs(text, rate))));
}

/** The guess without its bounds: for a safety cap on long lines. */
function rawSpeechMs(text: string, rate: number): number {
  // English words are longer in letters than the vocalised Arabic, and spoken a little faster.
  const english = isExplainMode();
  const chars = english ? explainLine(text).length * 0.75 : text.replace(HARAKAT, "").length;
  return (chars * MS_PER_CHAR) / rate;
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
  lineEnded("all");
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
