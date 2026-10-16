import React, { useEffect, type ComponentType } from "react";
import { stopSpeaking } from "@/lib/speech";

/**
 * Remounts the wrapped activity whenever `attemptKey` changes, so all internal state resets,
 * and stops any speech still playing when the activity unmounts or restarts.
 */
export function withAttemptReset<P extends { attemptKey: string }>(Inner: ComponentType<P>, name: string): ComponentType<P> {
  function AttemptReset(props: P) {
    const { attemptKey } = props;
    useEffect(() => () => stopSpeaking(), [attemptKey]);
    return <Inner key={attemptKey} {...props} />;
  }
  AttemptReset.displayName = name;
  return AttemptReset;
}
