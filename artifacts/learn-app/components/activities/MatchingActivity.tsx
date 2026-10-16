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
import { useShuffled } from "./shared/useShuffled";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";

type State = {
  selectedLeft: number | null;
  /** Pair indices matched so far. */
  matched: ReadonlySet<number>;
  /** Pair indices whose first right tap was wrong. */
  missed: ReadonlySet<number>;
};

const INITIAL: State = { selectedLeft: null, matched: new Set(), missed: new Set() };

function Matching({ lesson, color, attemptKey, onComplete }: ActivityProps<"matching">) {
  const { pairs } = lesson;
  const { language } = useLanguage();
  const [state, setState] = useState<State>(INITIAL);
  // Shuffle the right column per attempt; only the order array is used.
  const right = useShuffled(pairs, 0, attemptKey, "match");

  const handleLeft = useCallback(
    (i: number) => {
      if (state.matched.has(i)) return;
      haptics.tap();
      setState((s) => ({ ...s, selectedLeft: i }));
    },
    [state.matched],
  );

  const handleRight = useCallback(
    (pairIdx: number) => {
      const left = state.selectedLeft;
      if (left === null || state.matched.has(pairIdx)) return;
      if (left === pairIdx) {
        haptics.success();
        speak(PRAISE);
        setState((s) => ({ ...s, selectedLeft: null, matched: new Set(s.matched).add(pairIdx) }));
      } else {
        haptics.error();
        setState((s) => ({ ...s, selectedLeft: null, missed: new Set(s.missed).add(left) }));
      }
    },
    [state],
  );

  const allMatched = state.matched.size >= pairs.length;
  const correct = pairs.length - state.missed.size;
  const finish = useOnce(
    useCallback(() => onComplete({ correct, total: pairs.length }), [onComplete, correct, pairs.length]),
  );

  return (
    <View style={act.container}>
      <UiText style={act.instruction}>اضغط على شيء في اليمين ثم ما يناسبه في اليسار</UiText>
      {/* Mirrored in Arabic so the first column sits on the right, as the hint says. */}
      <View style={[styles.grid, { flexDirection: language === "en" ? "row" : "row-reverse" }]}>
        <View style={styles.column}>
          {pairs.map((pair, i) => (
            <Pressable
              key={i}
              testID={`match-left-${i}`}
              accessibilityRole="button"
              accessibilityLabel={pair.left.word}
              accessibilityState={{ selected: state.selectedLeft === i || state.matched.has(i), disabled: state.matched.has(i) }}
              style={[
                styles.item,
                state.selectedLeft === i && { borderColor: color, borderWidth: 3 },
                state.matched.has(i) && { backgroundColor: color + "22", borderColor: color, borderWidth: 2 },
              ]}
              onPress={() => handleLeft(i)}
            >
              <Text style={styles.emoji}>{pair.left.emoji}</Text>
              <Text style={styles.word}>{pair.left.word}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.arrows} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {pairs.map((_, i) => (
            <Text key={i} style={styles.arrow}>
              ↔
            </Text>
          ))}
        </View>
        <View style={styles.column}>
          {right.order.map((pairIdx) => (
            <Pressable
              key={pairIdx}
              testID={`match-right-${pairIdx}`}
              accessibilityRole="button"
              accessibilityLabel={pairs[pairIdx].right.word}
              accessibilityState={{ selected: state.matched.has(pairIdx), disabled: state.matched.has(pairIdx) }}
              style={[styles.item, state.matched.has(pairIdx) && styles.itemMatched]}
              onPress={() => handleRight(pairIdx)}
            >
              <Text style={styles.emoji}>{pairs[pairIdx].right.emoji}</Text>
              <Text style={styles.word}>{pairs[pairIdx].right.word}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {allMatched ? <DoneButton testID="activity-done" label="أَحْسَنْت! 🌟 تابع" color={color} onPress={finish.fire} disabled={finish.done} /> : null}
    </View>
  );
}

export const MatchingActivity = withAttemptReset(Matching, "MatchingActivity");

const styles = StyleSheet.create({
  grid: { flexDirection: "row", gap: 8, alignItems: "center", width: "100%", justifyContent: "center" },
  column: { flex: 1, gap: 10 },
  item: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    gap: 4,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    minHeight: touchTarget,
  },
  itemMatched: { backgroundColor: colors.successSoft, borderColor: colors.success, borderWidth: 2 },
  emoji: { fontSize: 30 },
  word: { fontSize: 15, fontWeight: "700", color: colors.mutedStrong, textAlign: "center" },
  arrows: { gap: 10, alignItems: "center" },
  arrow: { fontSize: 20, color: colors.mutedStrong, height: 68, textAlignVertical: "center", lineHeight: 68 },
});
