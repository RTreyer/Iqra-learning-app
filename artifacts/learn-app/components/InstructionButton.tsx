import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { useLanguage } from "@/context/LanguageContext";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { shadow, touchTarget } from "@/theme/tokens";

/** Header button that speaks the lesson instruction again, for a child who cannot read it. */
export function InstructionButton({ instruction }: { instruction: string }) {
  const { t } = useLanguage();
  return (
    <Pressable
      testID="instruction-button"
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      onPress={() => {
        haptics.tap();
        speak(instruction);
      }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`${t("اسمع المطلوب")}: ${instruction}`}
    >
      <Text style={styles.icon}>🗣️</Text>
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
  pressed: { opacity: 0.7, transform: [{ scale: 0.95 }] },
  icon: { fontSize: 22 },
});
