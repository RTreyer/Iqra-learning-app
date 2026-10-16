import { useEffect, useRef } from "react";

/** Ref that always holds the latest value; read `.current` from timers and handlers, never during render. */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}
