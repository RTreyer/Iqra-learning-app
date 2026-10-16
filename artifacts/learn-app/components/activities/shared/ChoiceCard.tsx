import React from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { colors, touchTarget } from "@/theme/tokens";

export type ChoiceState = "idle" | "correct" | "wrong";
export type ChoiceVariant = "letter" | "word" | "picture" | "number";

type Props = {
  index: number;
  /** Visible text and accessibility label. */
  word: string;
  emoji?: string;
  state: ChoiceState;
  /** True only for the option the child tapped. */
  selected: boolean;
  locked: boolean;
  variant: ChoiceVariant;
  onPick: (index: number) => void;
  scale?: Animated.Value;
};

const ICON: Record<ChoiceState, string | null> = { idle: null, correct: "✅", wrong: "❌" };
/** Number cards are solid coloured, so a plain glyph keeps the feedback visible without colour. */
const GLYPH: Record<ChoiceState, string | null> = { idle: null, correct: "✓", wrong: "✗" };
const SPOKEN: Record<ChoiceState, string> = { idle: "", correct: "، صحيح", wrong: "، خطأ" };

export function ChoiceCard({ index, word, emoji, state, selected, locked, variant, onPick, scale }: Props) {
  const solid = variant === "number";
  const icon = variant === "letter" ? null : solid ? GLYPH[state] : ICON[state];
  return (
    <Animated.View style={scale ? { transform: [{ scale }] } : undefined}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={word + SPOKEN[state]}
        accessibilityState={{ disabled: locked, selected }}
        disabled={locked}
        onPress={() => onPick(index)}
        style={[styles.base, cardStyles[variant], (solid ? solidStates : softStates)[state]]}
      >
        {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
        <Text style={[textStyles[variant], (solid ? solidText : softText)[state]]}>{word}</Text>
        {icon ? <Text style={iconStyles[variant]}>{icon}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: touchTarget, minWidth: touchTarget, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 32 },
});

const iconStyles = StyleSheet.create({
  letter: {},
  word: { fontSize: 18 },
  picture: { position: "absolute", top: -8, right: -8, fontSize: 18 },
  number: { position: "absolute", top: 4, right: 8, fontSize: 20, fontWeight: "900", color: colors.white },
});

const cardStyles = StyleSheet.create({
  letter: { width: 80, height: 80, borderRadius: 16, borderWidth: 3 },
  word: { flexDirection: "row", borderRadius: 16, padding: 16, gap: 8, borderWidth: 2, width: "100%" },
  picture: { minWidth: 90, borderRadius: 16, padding: 12, gap: 4, borderWidth: 2 },
  number: {
    width: 88,
    height: 88,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});

const textStyles = StyleSheet.create({
  letter: { fontSize: 40, fontWeight: "900", color: colors.text },
  word: { fontSize: 22, fontWeight: "800", color: colors.text, textAlign: "center" },
  picture: { fontSize: 15, fontWeight: "700", color: colors.text, textAlign: "center" },
  number: { fontSize: 36, fontWeight: "800", color: colors.success },
});

const softStates = StyleSheet.create({
  idle: { backgroundColor: colors.surface, borderColor: colors.border },
  correct: { backgroundColor: colors.successSoft, borderColor: colors.success },
  wrong: { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
});

const softText = StyleSheet.create({
  idle: {},
  correct: { color: colors.success },
  wrong: {},
});

const solidStates = StyleSheet.create({
  idle: { backgroundColor: "rgba(255,255,255,0.85)", borderColor: "#CBD5E1" },
  correct: { backgroundColor: "#10B981", borderColor: "#10B981" },
  wrong: { backgroundColor: "#F87171", borderColor: "#F87171" },
});

const solidText = StyleSheet.create({
  idle: {},
  correct: { color: colors.white },
  wrong: { color: colors.white },
});
