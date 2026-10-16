import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

type Finished = { key: string; stars: number };

// Saved progress records achievement, not whether this visit should skip content.
export function useLessonAttempt(lessonKey: string) {
  const [finished, setFinished] = useState<Finished | null>(null);
  const [attempt, setAttempt] = useState(0);
  const restartAttempt = useCallback(() => {
    setFinished(null);
    setAttempt((previous) => previous + 1);
  }, []);

  // Keyed on lessonKey: a new key on the same focused screen must also reset the attempt.
  const onFocus = useCallback(() => {
    setFinished((current) => (current?.key === lessonKey ? null : current));
    setAttempt((previous) => previous + 1);
  }, [lessonKey]);
  useFocusEffect(onFocus);

  /** Stores the stars earned by this attempt; they are shown until the next restart or focus. */
  const completeAttempt = useCallback(
    (stars: number) => setFinished({ key: lessonKey, stars }),
    [lessonKey],
  );
  const completed = lessonKey !== "" && finished?.key === lessonKey;
  return {
    completed,
    stars: completed ? finished.stars : 0,
    completeAttempt,
    restartAttempt,
    activityKey: `${lessonKey}:${attempt}`,
  };
}
