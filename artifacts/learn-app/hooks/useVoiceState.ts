import { useEffect, useState } from "react";

import { hasArabicVoice, onVoiceStatus, voiceStatus } from "@/lib/speech";

/** "works": a line was heard; "missing": no Arabic voice, or lines end without a sound. */
export type VoiceState = "works" | "missing" | "unknown";

/**
 * The Arabic voice as far as the app can tell: the device's voice list (when it lists any) and
 * what happened when the app spoke (lib/speech.ts voiceStatus). Many phones report an empty
 * voice list, so only speaking can show that there is no voice (UX-03).
 */
export function useVoiceState(): VoiceState {
  const [listed, setListed] = useState<boolean | null>(null);
  const [heard, setHeard] = useState(voiceStatus);
  useEffect(() => {
    let cancelled = false;
    hasArabicVoice()
      .then((ok) => {
        if (!cancelled) setListed(ok);
      })
      .catch(() => {});
    const unsubscribe = onVoiceStatus(setHeard);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);
  if (heard === false || listed === false) return "missing";
  return heard === true ? "works" : "unknown";
}
