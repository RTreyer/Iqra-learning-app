import { useCallback, useRef, useState } from "react";

/** Wraps a completion handler so it runs at most once; `done` disables the button after the press. */
export function useOnce(run: () => void) {
  const fired = useRef(false);
  const [done, setDone] = useState(false);
  const fire = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    setDone(true);
    run();
  }, [run]);
  return { fire, done };
}
