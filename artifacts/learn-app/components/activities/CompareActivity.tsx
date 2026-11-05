import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { compareAnswer, type CompareAnswer } from "@/content/math/answers";
import type { CompareSide } from "@/content/types";
import { toArabicDigits } from "@/lib/arabicNumbers";
import { speak } from "@/lib/speech";
import { colors, touchTarget } from "@/theme/tokens";
import { CompareSymbol } from "./math/CompareSymbol";
import { PicGroup } from "./math/MathPic";
import { useInstruction } from "./math/useInstruction";
import { ListenButton } from "./shared/ListenButton";
import { ProgressDots } from "./shared/ProgressDots";
import { PRAISE } from "./shared/strings";
import { act } from "./shared/styles";
import { ADVANCE_MS, choiceState, useQuiz } from "./shared/useQuiz";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";

/** Buttons keep a fixed order, like the book, so the child learns where each answer lives. */
const ANSWERS: CompareAnswer[] = ["more", "less", "equal"];
const GROUP_WORDS: Record<CompareAnswer, string> = {
  more: "أَكْثَرُ",
  less: "أَقَلُّ",
  equal: "يُسَاوِي",
};
const NUMBER_WORDS: Record<CompareAnswer, string> = {
  more: "أَكْبَرُ",
  less: "أَصْغَرُ",
  equal: "يُسَاوِي",
};
const SYMBOL_WORDS: Record<CompareAnswer, string> = {
  more: "أَكْبَرُ مِنْ",
  less: "أَصْغَرُ مِنْ",
  equal: "يُسَاوِي",
};

function Side({ side }: { side: CompareSide }) {
  return "number" in side ? (
    <Text style={styles.number}>{toArabicDigits(side.number)}</Text>
  ) : (
    <PicGroup pics={side.pics} />
  );
}

/** More, fewer or equal: two groups or numbers, the first on the right. */
function Compare({ lesson, color, onComplete, onRoundResult }: ActivityProps<"compare">) {
  const total = lesson.rounds.length;
  const quiz = useQuiz({ lesson, total, onComplete, onRoundResult, autoAdvanceMs: ADVANCE_MS });
  const { pick } = quiz;
  const round = lesson.rounds[quiz.roundIndex];
  const answer = compareAnswer(round.first, round.second);
  const correctIndex = ANSWERS.indexOf(answer);
  const bothNumbers = "number" in round.first && "number" in round.second;
  const words = round.mode === "symbols" ? SYMBOL_WORDS : bothNumbers ? NUMBER_WORDS : GROUP_WORDS;
  useInstruction(round.prompt);

  const handlePick = useCallback(
    (idx: number) => {
      const correct = idx === correctIndex;
      if (!pick(idx, correct)) return;
      if (correct) speak(PRAISE);
    },
    [correctIndex, pick],
  );

  return (
    <View style={act.container}>
      <ProgressDots count={total} current={quiz.roundIndex} color={color} />
      <ListenButton text={round.prompt} color={color} showText />
      <View style={styles.sides}>
        <View style={styles.side} testID="compare-first">
          <Side side={round.first} />
        </View>
        <View style={styles.gap}>
          {quiz.locked && round.mode === "symbols" ? (
            <View accessible accessibilityLabel={SYMBOL_WORDS[answer]}>
              <CompareSymbol answer={answer} color={colors.successText} />
            </View>
          ) : null}
        </View>
        <View style={styles.side} testID="compare-second">
          <Side side={round.second} />
        </View>
      </View>
      <View style={styles.buttons}>
        {ANSWERS.map((a, idx) => {
          const state = choiceState(idx, quiz.picked, correctIndex);
          return (
            <Pressable
              key={a}
              testID={`compare-answer-${a}`}
              accessibilityRole="button"
              accessibilityLabel={words[a]}
              accessibilityState={{ disabled: quiz.locked, selected: quiz.picked === idx }}
              disabled={quiz.locked}
              onPress={() => handlePick(idx)}
              style={[styles.button, stateStyles[state]]}
            >
              {round.mode === "symbols" ? (
                <CompareSymbol answer={a} color={colors.text} />
              ) : (
                <Text style={styles.word}>{words[a]}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export const CompareActivity = withAttemptReset(Compare, "CompareActivity");

const styles = StyleSheet.create({
  sides: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  side: {
    flex: 1,
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 8,
  },
  gap: { width: 44, alignItems: "center" },
  number: { fontSize: 56, fontWeight: "900", color: colors.text },
  buttons: {
    flexDirection: "row-reverse",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  button: {
    minWidth: touchTarget * 2,
    minHeight: touchTarget * 1.5,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  word: { fontSize: 22, fontWeight: "800", color: colors.text },
});

const stateStyles = StyleSheet.create({
  idle: { backgroundColor: colors.surface, borderColor: colors.border },
  correct: { backgroundColor: colors.successSoft, borderColor: colors.success },
  wrong: { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
});
