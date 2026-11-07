import React, { useCallback, useEffect, useMemo } from "react";
import { View } from "react-native";
import { speak } from "@/lib/speech";
import { PRAISE } from "./shared/strings";
import { ChoiceCard } from "./shared/ChoiceCard";
import { ProgressDots } from "./shared/ProgressDots";
import { act } from "./shared/styles";
import {
  ADVANCE_MS,
  PROMPT_DELAY_MS,
  TRY_AGAIN,
  choiceState,
  useBounce,
  useQuiz,
} from "./shared/useQuiz";
import { useShuffled } from "./shared/useShuffled";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";
import { TargetCard } from "./shared/TargetCard";

function LetterPick({
  lesson,
  color,
  attemptKey,
  onComplete,
  onRoundResult,
}: ActivityProps<"letter_pick">) {
  const { rounds } = lesson;
  const quiz = useQuiz({
    lesson,
    total: rounds.length,
    onComplete,
    onRoundResult,
    autoAdvanceMs: ADVANCE_MS,
  });
  const { pick } = quiz;
  const round = rounds[quiz.roundIndex];
  const options = useShuffled(round.letters, round.correctIndex, attemptKey, quiz.roundIndex);
  const maxOptions = useMemo(() => Math.max(...rounds.map((r) => r.letters.length)), [rounds]);
  const { values, bounce } = useBounce(maxOptions);

  useEffect(() => {
    const t = setTimeout(() => speak(round.targetLetter), PROMPT_DELAY_MS);
    return () => clearTimeout(t);
  }, [round.targetLetter, quiz.roundIndex]);

  const handlePick = useCallback(
    (idx: number) => {
      const correct = idx === options.correctIndex;
      if (!pick(idx, correct)) return;
      if (correct) {
        speak(PRAISE);
        bounce(idx);
      } else {
        speak(`${TRY_AGAIN}، ${round.targetLetter}`);
      }
    },
    [options.correctIndex, pick, bounce, round.targetLetter],
  );

  return (
    <View style={act.container}>
      <ProgressDots count={rounds.length} current={quiz.roundIndex} color={color} />
      <TargetCard text={round.targetLetter} color={color} testID="letter-target" />
      <View style={act.letterChoicesRow}>
        {options.items.map((letter, idx) => (
          <ChoiceCard
            key={idx}
            index={idx}
            word={letter}
            variant="letter"
            state={choiceState(idx, quiz.picked, options.correctIndex, quiz.wrong)}
            selected={quiz.picked === idx}
            locked={quiz.locked}
            onPick={handlePick}
            scale={values[idx]}
          />
        ))}
      </View>
    </View>
  );
}

export const LetterPickActivity = withAttemptReset(LetterPick, "LetterPickActivity");
