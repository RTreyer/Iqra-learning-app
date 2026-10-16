import React, { useEffect, useRef, type ComponentType } from "react";
import { stopSpeaking } from "@/lib/speech";

/**
 * Remounts the wrapped activity whenever `attemptKey` changes, so all internal state resets,
 * and stops speech left over from the previous attempt. Unmount does not stop speech: the
 * lesson screen speaks its completion message while swapping the activity for the result card.
 */
export function withAttemptReset<P extends { attemptKey: string }>(
  Inner: ComponentType<P>,
  name: string,
): ComponentType<P> {
  function AttemptReset(props: P) {
    const { attemptKey } = props;
    const previousKey = useRef(attemptKey);
    useEffect(() => {
      if (previousKey.current === attemptKey) return;
      previousKey.current = attemptKey;
      stopSpeaking();
    }, [attemptKey]);
    return <Inner key={attemptKey} {...props} />;
  }
  AttemptReset.displayName = name;
  return AttemptReset;
}
