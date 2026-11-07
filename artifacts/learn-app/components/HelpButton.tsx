import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { useLanguage } from "@/context/LanguageContext";
import * as haptics from "@/lib/haptics";
import { shadow, touchTarget } from "@/theme/tokens";

/** Header button: hear the task again and watch the worked example. */
export function HelpButton({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  const { t } = useLanguage();
  return (
    <Pressable
      testID="help-button"
      style={({ pressed }) => [styles.btn, disabled && styles.disabled, pressed && styles.pressed]}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t("شاهد مثالاً")}
      accessibilityState={{ disabled: !!disabled }}
    >
      <Text style={styles.icon}>👆</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: touchTarget / 2,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.95 }] },
  icon: { fontSize: 22 },
});
