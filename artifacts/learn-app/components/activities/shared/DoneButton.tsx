import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { UiText } from "@/components/UiText";
import { useLanguage } from "@/context/LanguageContext";
import { colors, readableFill, touchTarget } from "@/theme/tokens";

type Props = {
  label: string;
  color: string;
  onPress: () => void;
  testID?: string;
  disabled?: boolean;
};

/** Continue button; the label is interface chrome and goes through UiText. */
export function DoneButton({ label, color, onPress, testID, disabled }: Props) {
  const { t } = useLanguage();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={t(label)}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={[styles.btn, { backgroundColor: readableFill(color) }, disabled && styles.disabled]}
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
  disabled: { opacity: 0.6 },
  text: { fontSize: 16, fontWeight: "800", color: colors.white, textAlign: "center" },
});
