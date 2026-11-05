import { useEffect } from "react";
import { speak } from "@/lib/speech";
import { PROMPT_DELAY_MS } from "../shared/useQuiz";

/**
 * Speaks the task when it first appears and again only when it changes between rounds:
 * the voice gives the task, the child does the maths by looking. A ListenButton replays it.
 */
export function useInstruction(prompt: string): void {
  useEffect(() => {
    const t = setTimeout(() => speak(prompt), PROMPT_DELAY_MS);
    return () => clearTimeout(t);
  }, [prompt]);
}
