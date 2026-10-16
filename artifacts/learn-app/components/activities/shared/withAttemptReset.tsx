import React, { type ComponentType } from "react";

/** Remounts the wrapped activity whenever `attemptKey` changes, so all internal state resets. */
export function withAttemptReset<P extends { attemptKey: string }>(Inner: ComponentType<P>, name: string): ComponentType<P> {
  function AttemptReset(props: P) {
    return <Inner key={props.attemptKey} {...props} />;
  }
  AttemptReset.displayName = name;
  return AttemptReset;
}
