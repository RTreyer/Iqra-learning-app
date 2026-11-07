import React, { useEffect, useState } from "react";
import { Picture } from "@/components/pictures/Picture";
import { Animated, StyleSheet, Text } from "react-native";
import { Pressable } from "@/components/demo/DemoPressable";
import { colors, shadow, touchTarget } from "@/theme/tokens";

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

const ICON: Record<ChoiceState, string | null> = { idle: null, correct: "✓", wrong: "✗" };
/** Number cards are solid coloured, so a plain glyph keeps the feedback visible without colour. */
const GLYPH: Record<ChoiceState, string | null> = { idle: null, correct: "✓", wrong: "✗" };
const SPOKEN: Record<ChoiceState, string> = { idle: "", correct: "، صحيح", wrong: "، خطأ" };

export function ChoiceCard({
  index,
  word,
  emoji,
  state,
  selected,
  locked,
  variant,
  onPick,
  scale,
}: Props) {
  const solid = variant === "number";
  const icon = variant === "letter" ? null : solid ? GLYPH[state] : ICON[state];
  const shake = useShake(state === "wrong");
  // A wrong option stays greyed out and cannot be tapped again while the child tries again.
  const disabled = locked || state === "wrong";
  return (
    <Animated.View style={{ transform: [...(scale ? [{ scale }] : []), { translateX: shake }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={word + SPOKEN[state]}
        accessibilityState={{ disabled, selected }}
        disabled={disabled}
        onPress={() => onPick(index)}
        style={[styles.base, cardStyles[variant], (solid ? solidStates : softStates)[state]]}
      >
        {emoji ? <Picture emoji={emoji} size={44} /> : null}
        <Text
          style={[
            textStyles[variant],
            // A picture card without a picture shows a syllable or letter: make it large.
            variant === "picture" && !emoji && styles.textOnly,
            (solid ? solidText : softText)[state],
          ]}
        >
          {word}
        </Text>
        {icon ? <Text style={iconStyles[variant]}>{icon}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

/** A short sideways shake when `active` turns on: "not this one", without alarm. */
export function useShake(active: boolean): Animated.Value {
  const [x] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!active) return;
    const anim = Animated.sequence(
      [-8, 7, -5, 3, 0].map((toValue) =>
        Animated.timing(x, { toValue, duration: 60, useNativeDriver: true }),
      ),
    );
    anim.start();
    return () => anim.stop();
  }, [active, x]);
  return x;
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget,
    minWidth: touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  textOnly: { fontSize: 32, fontWeight: "900", lineHeight: 48 },
});

const iconStyles = StyleSheet.create({
  letter: {},
  word: { fontSize: 18 },
  picture: { position: "absolute", top: -8, right: -8, fontSize: 18 },
  number: {
    position: "absolute",
    top: 4,
    right: 8,
    fontSize: 20,
    fontWeight: "900",
    color: colors.white,
  },
});

const cardStyles = StyleSheet.create({
  // Big letter cards, as in the design: easy to hit, easy to see.
  letter: { width: 96, height: 104, borderRadius: 22, borderWidth: 4, ...shadow.card },
  word: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 2,
    width: "100%",
  },
  picture: { minWidth: 90, borderRadius: 16, padding: 12, gap: 4, borderWidth: 2 },
  number: {
    width: 88,
    height: 88,
    borderRadius: 20,
    borderWidth: 2,
    ...shadow.card,
  },
});

const textStyles = StyleSheet.create({
  letter: { fontSize: 54, fontWeight: "900", color: colors.text, lineHeight: 74 },
  word: { fontSize: 22, fontWeight: "800", color: colors.text, textAlign: "center" },
  picture: { fontSize: 15, fontWeight: "700", color: colors.text, textAlign: "center" },
  number: { fontSize: 36, fontWeight: "800", color: colors.successText },
});

const softStates = StyleSheet.create({
  idle: { backgroundColor: colors.surface, borderColor: colors.border },
  correct: { backgroundColor: colors.successSoft, borderColor: colors.success },
  // Greyed out, not alarm red: the child simply tries another one.
  wrong: { backgroundColor: "#EFEAE3", borderColor: "#D6CBBB", opacity: 0.7 },
});

const softText = StyleSheet.create({
  idle: {},
  correct: { color: colors.successText },
  wrong: { color: "#8A7D6C" },
});

const solidStates = StyleSheet.create({
  idle: { backgroundColor: "rgba(255,255,255,0.85)", borderColor: "#CBD5E1" },
  correct: { backgroundColor: colors.successText, borderColor: colors.successText },
  wrong: { backgroundColor: "#8A7D6C", borderColor: "#8A7D6C", opacity: 0.7 },
});

const solidText = StyleSheet.create({
  idle: {},
  correct: { color: colors.white },
  wrong: { color: colors.white },
});
