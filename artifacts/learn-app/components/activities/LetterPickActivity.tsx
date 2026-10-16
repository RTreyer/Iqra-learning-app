import React, { useCallback, useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { speak } from "@/lib/speech";
import { colors } from "@/theme/tokens";
import { ChoiceCard } from "./shared/ChoiceCard";
import { ProgressDots } from "./shared/ProgressDots";
import { act } from "./shared/styles";
import { ADVANCE_MS, PROMPT_DELAY_MS, choiceState, useBounce, useQuiz } from "./shared/useQuiz";
import { useShuffled } from "./shared/useShuffled";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";

function LetterPick({ lesson, color, attemptKey, onComplete, onRoundResult }: ActivityProps<"letter_pick">) {
  const { rounds } = lesson;
  const quiz = useQuiz({ lesson, total: rounds.length, onComplete, onRoundResult, autoAdvanceMs: ADVANCE_MS });
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
      if (!quiz.pick(idx, correct)) return;
      if (correct) {
        speak("أحسنت!");
        bounce(idx);
      } else {
        speak(round.targetLetter);
      }
    },
    [options.correctIndex, quiz, bounce, round.targetLetter],
  );

  return (
    <View style={act.container}>
      <ProgressDots count={rounds.length} current={quiz.roundIndex} color={color} />
      <View style={[styles.display, { borderColor: color }]}>
        <Text style={styles.displayHint}>ابحث عن الحرف</Text>
        <Text style={[styles.displayBig, { color }]}>{round.targetLetter}</Text>
      </View>
      <Text style={act.instruction}>
        سؤال {quiz.roundIndex + 1} من {rounds.length}
      </Text>
      <View style={act.letterChoicesRow}>
        {options.items.map((letter, idx) => (
          <ChoiceCard
            key={idx}
            index={idx}
            word={letter}
            variant="letter"
            state={choiceState(idx, quiz.picked, options.correctIndex)}
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

const styles = StyleSheet.create({
  display: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 3,
    width: "75%",
    gap: 2,
  },
  displayHint: { fontSize: 13, color: colors.muted, fontWeight: "600" },
  displayBig: { fontSize: 72, fontWeight: "900", lineHeight: 88 },
});
