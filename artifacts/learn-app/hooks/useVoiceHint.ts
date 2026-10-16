import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import { hasArabicVoice } from "@/lib/speech";

export const VOICE_HINT_KEY = "@iqra_voice_hint_shown";

/** Shows a one time hint when the device has no Arabic TTS voice. */
export function useVoiceHint(): { visible: boolean; dismiss: () => void } {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (await AsyncStorage.getItem(VOICE_HINT_KEY)) return;
        const ok = await hasArabicVoice();
        if (!cancelled && !ok) setVisible(true);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    AsyncStorage.setItem(VOICE_HINT_KEY, "1").catch(() => {});
  }, []);

  return { visible, dismiss };
}
