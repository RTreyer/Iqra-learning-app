import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ProgressPill } from "@/components/ProgressPill";
import { UiText } from "@/components/UiText";
import type { Unit } from "@/content/types";
import type { UnitProgress } from "@/context/ProgressContext";
import { useLanguage } from "@/context/LanguageContext";
import { colors, pillPlate, touchTarget } from "@/theme/tokens";

type Props = { unit: Unit; progress: UnitProgress; onPress: () => void };

/** Colored unit button on the book screen, ported from the legacy module buttons. */
export function UnitCard({ unit, progress, onPress }: Props) {
  const { t, language } = useLanguage();
  const row = language === "en" ? "row" : "row-reverse";
  return (
    <Pressable
      testID={`unit-${unit.id}`}
      accessibilityRole="button"
      accessibilityLabel={t(unit.title)}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: unit.color, flexDirection: row }, pressed && styles.pressed]}
    >
      <Text style={styles.emoji}>{unit.emoji}</Text>
      <View style={[styles.info, { alignItems: language === "en" ? "flex-start" : "flex-end" }]}>
        <View style={styles.titlePlate}>
          <UiText style={styles.title}>{unit.title}</UiText>
        </View>
        <View style={[styles.footer, { flexDirection: row }]}>
          <View style={styles.label}>
            <Text style={styles.labelText}>{unit.theme}</Text>
          </View>
          <View style={styles.label}>
            <Text style={styles.labelText}>{unit.badgeLabel}</Text>
          </View>
          <ProgressPill {...progress} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: touchTarget,
    borderRadius: 24,
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  emoji: { fontSize: 40 },
  info: { flex: 1, gap: 6 },
  titlePlate: pillPlate,
  title: { fontSize: 22, fontWeight: "800", color: colors.text },
  footer: { alignItems: "center", gap: 8, flexWrap: "wrap" },
  label: { backgroundColor: colors.pill, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  labelText: { fontSize: 13, fontWeight: "700", color: colors.text },
});
