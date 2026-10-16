import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

// Saved progress records achievement, not whether this visit should skip content.
export function useLessonAttempt(lessonKey: string) {
  const [finishedKey, setFinishedKey] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const restartAttempt = useCallback(() => {
    setFinishedKey(null);
    setAttempt((previous) => previous + 1);
  }, []);

  // Keyed on lessonKey: a new key on the same focused screen must also reset the attempt.
  const onFocus = useCallback(() => {
    setFinishedKey((current) => (current === lessonKey ? null : current));
    setAttempt((previous) => previous + 1);
  }, [lessonKey]);
  useFocusEffect(onFocus);

  const completeAttempt = useCallback(() => setFinishedKey(lessonKey), [lessonKey]);
  return {
    completed: lessonKey !== "" && finishedKey === lessonKey,
    completeAttempt,
    restartAttempt,
    activityKey: `${lessonKey}:${attempt}`,
  };
}
