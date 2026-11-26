import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import { useVoiceState } from "@/hooks/useVoiceState";

/** Stored by the parents (parents' corner) to stop the hint for good. */
export const VOICE_HINT_KEY = "@iqra_voice_hint_shown";

/** A child's ✕ hides the hint until the app is opened again, not for good (UX-03). */
let dismissedThisSession = false;

/** For tests: a fresh app start. */
export function resetVoiceHintSession(): void {
  dismissedThisSession = false;
}

/**
 * Shows the no-voice hint when the device has no Arabic voice, or when the app's lines end
 * without a sound. A child closing it only hides it until the next start; the parents can turn
 * it off for good in their corner.
 */
export function useVoiceHint(): { visible: boolean; dismiss: () => void } {
  const voice = useVoiceState();
  const [silenced, setSilenced] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(dismissedThisSession);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(VOICE_HINT_KEY)
      .then((flag) => {
        if (!cancelled) setSilenced(flag !== null);
      })
      .catch(() => {
        if (!cancelled) setSilenced(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = useCallback(() => {
    dismissedThisSession = true;
    setDismissed(true);
  }, []);

  return { visible: voice === "missing" && silenced === false && !dismissed, dismiss };
}
