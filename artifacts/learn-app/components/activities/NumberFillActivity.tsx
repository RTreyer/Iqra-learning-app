import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { numberFillAnswer } from "@/content/math/answers";
import type { FillCell } from "@/content/types";
import { toArabicDigits } from "@/lib/arabicNumbers";
import { speak } from "@/lib/speech";
import { colors } from "@/theme/tokens";
import { PicGroup } from "./math/MathPic";
import { useInstruction } from "./math/useInstruction";
import { ChoiceCard } from "./shared/ChoiceCard";
import { ListenButton } from "./shared/ListenButton";
import { ProgressDots } from "./shared/ProgressDots";
import { PRAISE } from "./shared/strings";
import { act } from "./shared/styles";
import { ADVANCE_MS, choiceState, useBounce, useQuiz } from "./shared/useQuiz";
import { useShuffled } from "./shared/useShuffled";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";

const EMPTY_LABEL = "مربع فارغ";

/** One cell: a number, a sign, or the empty box (filled with the answer once the round locks). */
function Cell({ cell, filled }: { cell: FillCell; filled: number | null }) {
  if (cell === "?")
    return (
      <View
        testID="number-fill-box"
        accessible
        accessibilityLabel={filled === null ? EMPTY_LABEL : toArabicDigits(filled)}
        style={styles.box}
      >
        <Text style={styles.cell}>{filled === null ? "" : toArabicDigits(filled)}</Text>
      </View>
    );
  return <Text style={styles.cell}>{typeof cell === "number" ? toArabicDigits(cell) : cell}</Text>;
}

/** The missing number in a sum, a difference or a counting row. The child reads; only the task is spoken. */
function NumberFill({
  lesson,
  color,
  attemptKey,
  onComplete,
  onRoundResult,
}: ActivityProps<"number_fill">) {
  const total = lesson.rounds.length;
  const quiz = useQuiz({ lesson, total, onComplete, onRoundResult, autoAdvanceMs: ADVANCE_MS });
  const { pick } = quiz;
  const round = lesson.rounds[quiz.roundIndex];
  const answer = numberFillAnswer(round.cells);
  const correct = round.options.indexOf(answer as number);
  const shuffled = useShuffled(round.options, correct, attemptKey, quiz.roundIndex);
  const labels = useMemo(() => shuffled.items.map(toArabicDigits), [shuffled.items]);
  const { values, bounce } = useBounce(Math.max(...lesson.rounds.map((r) => r.options.length)));
  const filled = quiz.locked ? answer : null;
  useInstruction(round.prompt);

  const handlePick = useCallback(
    (idx: number) => {
      const ok = idx === shuffled.correctIndex;
      if (!pick(idx, ok)) return;
      if (ok) {
        speak(PRAISE);
        bounce(idx, 1.2);
      }
    },
    [shuffled.correctIndex, pick, bounce],
  );

  const [a, op, b, , c] = round.cells;
  return (
    <View style={act.container}>
      <ProgressDots count={total} current={quiz.roundIndex} color={color} />
      <ListenButton text={round.prompt} color={color} showText />
      {round.pics ? <PicGroup pics={round.pics} /> : null}
      {round.layout === "vertical" ? (
        <View style={styles.vertical} testID="number-fill-sentence">
          <Cell cell={a} filled={filled} />
          <View style={styles.row}>
            <Cell cell={b} filled={filled} />
            <Cell cell={op} filled={filled} />
          </View>
          <View style={styles.rule} />
          <Cell cell={c} filled={filled} />
        </View>
      ) : (
        <View style={styles.row} testID="number-fill-sentence">
          {round.cells.map((cell, i) => (
            <Cell key={i} cell={cell} filled={filled} />
          ))}
        </View>
      )}
      <View style={[act.choicesRow, styles.rtl]}>
        {labels.map((label, idx) => (
          <ChoiceCard
            key={idx}
            index={idx}
            word={label}
            variant="number"
            state={choiceState(idx, quiz.picked, shuffled.correctIndex)}
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

export const NumberFillActivity = withAttemptReset(NumberFill, "NumberFillActivity");

const styles = StyleSheet.create({
  row: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 12 },
  rtl: { flexDirection: "row-reverse" },
  vertical: { alignItems: "flex-start", gap: 4 },
  rule: { height: 4, alignSelf: "stretch", backgroundColor: colors.text, borderRadius: 2 },
  cell: { fontSize: 44, fontWeight: "900", color: colors.text, minWidth: 36, textAlign: "center" },
  box: {
    minWidth: 64,
    minHeight: 64,
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: colors.mutedStrong,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
