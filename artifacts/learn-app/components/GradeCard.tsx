import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { UiText } from "@/components/UiText";
import type { Grade } from "@/content/types";
import { useLanguage } from "@/context/LanguageContext";
import { colors, readableFill, shadow, touchTarget } from "@/theme/tokens";

type Props = { grade: Grade; onPress: () => void };

/** Square home card for one grade; a grade without books shows "قريباً" and does not respond. */
export function GradeCard({ grade, onPress }: Props) {
  const { t, digits } = useLanguage();
  const open = grade.books.length > 0;
  return (
    <Pressable
      testID={`grade-${grade.number}`}
      accessibilityRole="button"
      accessibilityLabel={open ? t(grade.title) : `${t(grade.title)}، ${t("قريباً")}`}
      accessibilityState={{ disabled: !open }}
      disabled={!open}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: readableFill(grade.color) },
        pressed && styles.pressed,
      ]}
    >
      {!open && (
        <View style={styles.soon}>
          <UiText style={styles.soonText}>قريباً</UiText>
        </View>
      )}
      <Text style={styles.emoji}>{grade.emoji}</Text>
      <Text style={styles.number}>{digits(grade.number)}</Text>
      <UiText style={styles.title}>{grade.title}</UiText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "47%",
    minHeight: Math.max(170, touchTarget),
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    ...shadow.card,
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.96 }] },
  soon: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: colors.pill,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  soonText: { fontSize: 12, fontWeight: "800", color: colors.text },
  emoji: { fontSize: 40 },
  number: { fontSize: 52, fontWeight: "900", color: colors.white, lineHeight: 62 },
  title: { fontSize: 17, fontWeight: "800", color: colors.white, textAlign: "center" },
});
