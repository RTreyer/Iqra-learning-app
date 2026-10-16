import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { UiText } from "@/components/UiText";
import { useLanguage } from "@/context/LanguageContext";
import { colors, pillPlate, touchTarget } from "@/theme/tokens";

type Props = { label: string; color: string; onPress: () => void; testID?: string; disabled?: boolean };

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
      style={[styles.btn, { backgroundColor: color }, disabled && styles.disabled]}
      onPress={onPress}
    >
      <View style={styles.plate}>
        <UiText style={styles.text}>{label}</UiText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    minHeight: touchTarget,
  },
  plate: pillPlate,
  disabled: { opacity: 0.6 },
  text: { fontSize: 16, fontWeight: "800", color: colors.text, textAlign: "center" },
});
