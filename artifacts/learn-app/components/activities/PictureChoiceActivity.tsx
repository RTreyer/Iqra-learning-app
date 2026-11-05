import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { MAX_ORDERED_CHOICES } from "@/content/math/validate";
import { speak } from "@/lib/speech";
import type { MathPic as Pic } from "@/content/types";
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

const ORDERED_GAP = 4;
const ORDERED_CARD = 48;
const ORDERED_PER_LINE = 5;

/** Width that fits up to 5 compact cards per line, so 10 read 1 to 5, then 6 to 10. */
function orderedRowWidth(count: number) {
  const n = Math.min(count, ORDERED_PER_LINE);
  return n * ORDERED_CARD + (n - 1) * ORDERED_GAP;
}

const PATTERN_GAP = 4;
/** Width a pattern row and its slot may take on a 360 px phone (20 px padding each side). */
const PATTERN_WIDTH = 300;
const PATTERN_MAX_PIC = 52;
/** Share of the cell a picture takes in a pattern that uses sizes. */
const PATTERN_SCALE = { big: 1, normal: 0.8, small: 0.55 } as const;

/** Picture size of a pattern of `count` pictures, so the pictures and the empty slot fit one line. */
export function patternPicSize(count: number) {
  const cells = count + 1;
  return Math.min(PATTERN_MAX_PIC, Math.floor((PATTERN_WIDTH - (cells - 1) * PATTERN_GAP) / cells));
}

/** The pattern in reading order (first on the right), then a dashed slot for what comes next. */
function PatternRow({ pattern }: { pattern: Pic[] }) {
  const size = patternPicSize(pattern.length);
  // A size pattern (tall and short candles) keeps its sizes within the cell.
  const sized = pattern.some((p) => p.size);
  return (
    <View testID="picture-choice-pattern" style={styles.pattern}>
      {pattern.map((pic, i) => (
        <View
          key={i}
          testID={`pattern-pic-${i}`}
          style={[styles.patternCell, { width: size, height: size }]}
        >
          <MathPic
            pic={pic}
            size={sized ? Math.round(size * PATTERN_SCALE[pic.size ?? "normal"]) : size}
          />
        </View>
      ))}
      <View
        testID="pattern-slot"
        style={[styles.slot, { width: size, height: size }]}
        accessible={false}
      />
    </View>
  );
}

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
  const { values, bounce } = useBounce(MAX_ORDERED_CHOICES);
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
      {round.pattern ? <PatternRow pattern={round.pattern} /> : null}
      {round.model ? (
        <View style={styles.model} testID="picture-choice-model">
          <MathPic pic={round.model} />
        </View>
      ) : null}
      <View
        testID={round.ordered ? "picture-choice-ordered-row" : undefined}
        style={[
          act.choicesRow,
          styles.rtl,
          round.ordered && [styles.ordered, { width: orderedRowWidth(shuffled.items.length) }],
        ]}
      >
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
  ordered: {
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: ORDERED_GAP,
    alignSelf: "center",
  },
  rtl: { flexDirection: "row-reverse" },
  pattern: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: PATTERN_GAP,
  },
  patternCell: { alignItems: "center", justifyContent: "flex-end" },
  slot: {
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.mutedStrong,
  },
});
