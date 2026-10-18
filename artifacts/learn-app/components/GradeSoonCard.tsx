import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { UiText } from "@/components/UiText";
import type { Grade } from "@/content/types";
import { useLanguage } from "@/context/LanguageContext";
import { colors, shadow, touchTarget, withAlpha } from "@/theme/tokens";

type Props = { grade: Grade };

/** Home card for a grade without books yet: shows the grade name and "قريباً", no tap action. */
export function GradeSoonCard({ grade }: Props) {
  const { t, language } = useLanguage();
  return (
    <View
      testID={`grade-${grade.number}`}
      accessible
      accessibilityLabel={`${t(grade.title)}، ${t("قريباً")}`}
      accessibilityState={{ disabled: true }}
      style={[styles.card, { flexDirection: language === "en" ? "row" : "row-reverse" }]}
    >
      <Text style={styles.emoji}>🎒</Text>
      <UiText style={styles.title}>{grade.title}</UiText>
      <View style={styles.label}>
        <UiText style={styles.labelText}>قريباً</UiText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: touchTarget + 16,
    borderRadius: 20,
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: withAlpha(colors.white, 0.7),
    borderWidth: 1,
    borderColor: colors.subtle,
    ...shadow.card,
  },
  emoji: { fontSize: 28 },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: colors.mutedStrong,
    textAlign: "right",
  },
  label: {
    backgroundColor: colors.starSoft,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  labelText: { fontSize: 13, fontWeight: "800", color: colors.starText },
});
