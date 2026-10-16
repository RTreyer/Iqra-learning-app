import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { UiText } from "@/components/UiText";
import { colors, touchTarget } from "@/theme/tokens";

type Props = { label: string; color: string; onPress: () => void; testID?: string };

/** Continue button; the label is interface chrome and goes through UiText. */
export function DoneButton({ label, color, onPress, testID }: Props) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      style={[styles.btn, { backgroundColor: color }]}
      onPress={onPress}
    >
      <UiText style={styles.text}>{label}</UiText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    minHeight: touchTarget,
  },
  text: { fontSize: 16, fontWeight: "800", color: colors.white, textAlign: "center" },
});
