import React, { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Lesson } from "@/content/types";
import { numberToArabicWord, toArabicDigits } from "@/lib/arabicNumbers";
import { useLanguage } from "@/context/LanguageContext";
import { speak } from "@/lib/speech";
import { colors, touchTarget } from "@/theme/tokens";
import { ChoiceCard } from "../shared/ChoiceCard";
import { ProgressDots } from "../shared/ProgressDots";
import { PRAISE } from "../shared/strings";
import { act } from "../shared/styles";
import { ADVANCE_MS, PROMPT_DELAY_MS, choiceState, useBounce, useQuiz } from "../shared/useQuiz";
import { useShuffled } from "../shared/useShuffled";
import type { ActivityProps } from "../types";

type MathLesson = Extract<Lesson, { type: "counting" | "arithmetic" }>;

type Props = Omit<ActivityProps<MathLesson["type"]>, "lesson"> & {
  lesson: MathLesson;
  /** Options and answer of each round. */
  roundOf: (index: number) => { options: number[]; answer: number };
  /** Question for a round: `shown` uses digits and symbols, `spoken` reads numbers as words. */
  promptOf: (index: number) => { shown: string; spoken: string };
  renderVisual: (index: number) => ReactNode;
};

/** Shared round flow for counting and arithmetic: numbers shown with Eastern Arabic digits. */
export function NumberQuiz({
  lesson,
  color,
  attemptKey,
  onComplete,
  onRoundResult,
  roundOf,
  promptOf,
  renderVisual,
}: Props) {
  const { t } = useLanguage();
  const total = lesson.rounds.length;
  const quiz = useQuiz({ lesson, total, onComplete, onRoundResult, autoAdvanceMs: ADVANCE_MS });
  const { pick } = quiz;
  const { options, answer } = roundOf(quiz.roundIndex);
  const correctIndex = options.indexOf(answer);
  const shuffled = useShuffled(options, correctIndex, attemptKey, quiz.roundIndex);
  const labels = useMemo(() => shuffled.items.map(toArabicDigits), [shuffled.items]);
  const maxOptions = useMemo(
    () => Math.max(...lesson.rounds.map((r) => r.options.length)),
    [lesson.rounds],
  );
  const { values, bounce } = useBounce(maxOptions);
  const { shown, spoken } = promptOf(quiz.roundIndex);

  useEffect(() => {
    const t = setTimeout(() => speak(spoken), PROMPT_DELAY_MS);
    return () => clearTimeout(t);
  }, [spoken, quiz.roundIndex]);

  const handlePick = useCallback(
    (idx: number) => {
      const correct = idx === shuffled.correctIndex;
      if (!pick(idx, correct)) return;
      if (correct) {
        speak(PRAISE);
        bounce(idx, 1.2);
      } else {
        speak(numberToArabicWord(answer));
      }
    },
    [shuffled.correctIndex, pick, bounce, answer],
  );

  return (
    <View style={act.container}>
      <ProgressDots count={total} current={quiz.roundIndex} color={color} />
      <View style={styles.visual}>{renderVisual(quiz.roundIndex)}</View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t("اضغط للاستماع")}: ${shown}`}
        style={styles.question}
        onPress={() => speak(spoken)}
      >
        <Text style={styles.speaker}>🔊</Text>
        <Text style={styles.questionText}>{shown}</Text>
      </Pressable>
      <View style={styles.options}>
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

export const mathStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  countEmoji: { fontSize: 52 },
  dotGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    maxWidth: 100,
    justifyContent: "center",
  },
  dot: { width: 28, height: 28, borderRadius: 14 },
  operator: { fontSize: 40, fontWeight: "800", color: colors.mutedStrong },
  questionMark: { fontSize: 52, fontWeight: "800", color: colors.successText },
});

const styles = StyleSheet.create({
  visual: { alignItems: "center", justifyContent: "center", minHeight: 160, maxWidth: 260 },
  question: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(209,250,229,0.9)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: touchTarget,
  },
  speaker: { fontSize: 22 },
  questionText: { fontSize: 20, fontWeight: "600", color: "#065F46", textAlign: "center" },
  options: { flexDirection: "row", justifyContent: "center", gap: 16, flexWrap: "wrap" },
});
