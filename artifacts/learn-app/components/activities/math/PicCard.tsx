import React from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { groupLabel } from "@/content/math/picLabel";
import type { MathPic } from "@/content/types";
import { colors, touchTarget } from "@/theme/tokens";
import type { ChoiceState } from "../shared/ChoiceCard";
import { PicGroup } from "./MathPic";

const ICON: Record<ChoiceState, string | null> = { idle: null, correct: "✅", wrong: "❌" };
const SPOKEN: Record<ChoiceState, string> = { idle: "", correct: "، صحيح", wrong: "، خطأ" };

type Props = {
  index: number;
  pics: MathPic[];
  state: ChoiceState;
  selected: boolean;
  locked: boolean;
  onPick: (index: number) => void;
  scale?: Animated.Value;
};

/** A tappable card holding one picture or a group, with the same feedback as ChoiceCard. */
export function PicCard({ index, pics, state, selected, locked, onPick, scale }: Props) {
  return (
    <Animated.View style={scale ? { transform: [{ scale }] } : undefined}>
      <Pressable
        testID={`pic-card-${index}`}
        accessibilityRole="button"
        accessibilityLabel={groupLabel(pics) + SPOKEN[state]}
        accessibilityState={{ disabled: locked, selected }}
        disabled={locked}
        onPress={() => onPick(index)}
        style={[styles.card, stateStyles[state]]}
      >
        <PicGroup pics={pics} decorative />
        {ICON[state] ? <Text style={styles.icon}>{ICON[state]}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: touchTarget * 2,
    minHeight: touchTarget * 2,
    borderRadius: 16,
    borderWidth: 3,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { position: "absolute", top: -8, right: -8, fontSize: 18 },
});

const stateStyles = StyleSheet.create({
  idle: { backgroundColor: colors.surface, borderColor: colors.border },
  correct: { backgroundColor: colors.successSoft, borderColor: colors.success },
  wrong: { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
});
