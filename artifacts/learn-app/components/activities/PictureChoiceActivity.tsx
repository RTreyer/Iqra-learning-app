import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { speak } from "@/lib/speech";
import { colors } from "@/theme/tokens";
import { MathPic } from "./math/MathPic";
import { PicCard } from "./math/PicCard";
import { useInstruction } from "./math/useInstruction";
import { ListenButton } from "./shared/ListenButton";
import { ProgressDots } from "./shared/ProgressDots";
import { PRAISE } from "./shared/strings";
import { act } from "./shared/styles";
import { ADVANCE_MS, choiceState, useBounce, useQuiz } from "./shared/useQuiz";
import { useShuffled } from "./shared/useShuffled";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";

/** Tap the right picture: odd one out, same as the model, what comes next, the bigger group. */
function PictureChoice({
  lesson,
  color,
  attemptKey,
  onComplete,
  onRoundResult,
}: ActivityProps<"picture_choice">) {
  const total = lesson.rounds.length;
  const quiz = useQuiz({ lesson, total, onComplete, onRoundResult, autoAdvanceMs: ADVANCE_MS });
  const { pick } = quiz;
  const round = lesson.rounds[quiz.roundIndex];
  const shuffledChoices = useShuffled(
    round.choices,
    round.correctIndex,
    attemptKey,
    quiz.roundIndex,
  );
  const shuffled = round.ordered
    ? { items: round.choices, correctIndex: round.correctIndex }
    : shuffledChoices;
  const { values, bounce } = useBounce(10);
  useInstruction(round.prompt);

  const handlePick = useCallback(
    (idx: number) => {
      const correct = idx === shuffled.correctIndex;
      if (!pick(idx, correct)) return;
      if (correct) {
        speak(PRAISE);
        bounce(idx, 1.15);
      }
    },
    [shuffled.correctIndex, pick, bounce],
  );

  return (
    <View style={act.container}>
      <ProgressDots count={total} current={quiz.roundIndex} color={color} />
      <ListenButton text={round.prompt} color={color} showText />
      {round.model ? (
        <View style={styles.model} testID="picture-choice-model">
          <MathPic pic={round.model} />
        </View>
      ) : null}
      <View style={[act.choicesRow, styles.rtl, round.ordered && styles.nowrap]}>
        {shuffled.items.map((pics, idx) => (
          <PicCard
            key={idx}
            index={idx}
            pics={pics}
            state={choiceState(idx, quiz.picked, shuffled.correctIndex)}
            selected={quiz.picked === idx}
            locked={quiz.locked}
            onPick={handlePick}
            scale={values[idx]}
            compact={round.ordered}
          />
        ))}
      </View>
    </View>
  );
}

export const PictureChoiceActivity = withAttemptReset(PictureChoice, "PictureChoiceActivity");

const styles = StyleSheet.create({
  model: {
    padding: 10,
    borderRadius: 16,
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: colors.border,
  },
  nowrap: { flexWrap: "nowrap", gap: 4 },
  rtl: { flexDirection: "row-reverse" },
});
