import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { UiText } from "@/components/UiText";
import { useLanguage } from "@/context/LanguageContext";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { colors, touchTarget } from "@/theme/tokens";
import { PRAISE } from "./shared/strings";
import { DoneButton } from "./shared/DoneButton";
import { act } from "./shared/styles";
import { useOnce } from "./shared/useOnce";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";

function Behavior({ lesson, color, onComplete }: ActivityProps<"behavior">) {
  const { behaviors } = lesson;
  const { t } = useLanguage();
  /** index -> whether the single answer matched `isCorrect`. */
  const [results, setResults] = useState<Readonly<Record<number, boolean>>>({});

  const handleAnswer = useCallback(
    (index: number, answer: boolean) => {
      if (results[index] !== undefined) return;
      const right = answer === behaviors[index].isCorrect;
      setResults((prev) => (prev[index] !== undefined ? prev : { ...prev, [index]: right }));
      if (right) {
        haptics.success();
        speak(PRAISE);
      } else {
        haptics.error();
        speak("حاول مرة أخرى");
      }
    },
    [results, behaviors],
  );

  const answered = Object.keys(results).length;
  const correct = Object.values(results).filter(Boolean).length;
  const finish = useOnce(
    useCallback(() => onComplete({ correct, total: behaviors.length }), [onComplete, correct, behaviors.length]),
  );

  return (
    <View style={act.container}>
      <UiText style={act.instruction}>اضغط ✓ للسلوك الصحيح و ✗ للسلوك الخطأ</UiText>
      {behaviors.map((item, i) => {
        const result = results[i];
        return (
          <View
            key={i}
            accessible={result !== undefined ? true : undefined}
            accessibilityLabel={
              result !== undefined ? `${item.description}، ${t(result ? "إجابة صحيحة" : "إجابة خطأ")}` : undefined
            }
            accessibilityState={result !== undefined ? { selected: true, disabled: true } : undefined}
            style={[styles.card, result === true && styles.cardRight, result === false && styles.cardWrong]}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.text}>{item.description}</Text>
            {result !== undefined ? (
              <Text style={styles.resultIcon}>{result ? "✅" : "❌"}</Text>
            ) : (
              <View style={styles.buttons}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${t("سلوك صحيح")}: ${item.description}`}
                  style={[styles.round, styles.check]}
                  onPress={() => handleAnswer(i, true)}
                >
                  <Text style={styles.checkText}>✓</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${t("سلوك خطأ")}: ${item.description}`}
                  style={[styles.round, styles.cross]}
                  onPress={() => handleAnswer(i, false)}
                >
                  <Text style={styles.crossText}>✗</Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}
      {answered >= behaviors.length ? (
        <DoneButton
          testID="activity-done"
          label={`أَحْسَنْت! ${correct}/${behaviors.length} صحيح 🌟 تابع`}
          color={color}
          onPress={finish.fire}
          disabled={finish.done}
        />
      ) : null}
    </View>
  );
}

export const BehaviorActivity = withAttemptReset(Behavior, "BehaviorActivity");

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardRight: { borderColor: colors.success, borderWidth: 2, backgroundColor: colors.successSoft },
  cardWrong: { borderColor: colors.danger, borderWidth: 2, backgroundColor: colors.dangerSoft },
  emoji: { fontSize: 30, flexShrink: 0 },
  text: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.text, lineHeight: 20, textAlign: "right" },
  resultIcon: { fontSize: 24, flexShrink: 0 },
  buttons: { flexDirection: "row", gap: 8, flexShrink: 0 },
  round: { width: touchTarget, height: touchTarget, borderRadius: touchTarget / 2, alignItems: "center", justifyContent: "center" },
  check: { backgroundColor: colors.successSoft },
  cross: { backgroundColor: colors.dangerSoft },
  checkText: { fontSize: 22, color: colors.successText, fontWeight: "900" },
  crossText: { fontSize: 22, color: colors.dangerText, fontWeight: "900" },
});
