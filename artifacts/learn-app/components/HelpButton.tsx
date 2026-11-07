import React from "react";
import { Pressable, StyleSheet } from "react-native";

import { Icon } from "@/components/world/Icon";

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
      <Icon name="hand" size={30} color="#7A3418" />
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
});
