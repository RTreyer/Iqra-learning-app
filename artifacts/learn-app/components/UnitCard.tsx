import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ProgressPill } from "@/components/ProgressPill";
import { UiText } from "@/components/UiText";
import type { Unit } from "@/content/types";
import type { UnitProgress } from "@/context/ProgressContext";
import { useLanguage } from "@/context/LanguageContext";

type Props = { unit: Unit; progress: UnitProgress; onPress: () => void };

/** Colored unit button on the book screen, ported from the legacy module buttons. */
export function UnitCard({ unit, progress, onPress }: Props) {
  const { t } = useLanguage();
  return (
    <Pressable
      testID={`unit-${unit.id}`}
      accessibilityRole="button"
      accessibilityLabel={t(unit.title)}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: unit.color }, pressed && styles.pressed]}
    >
      <Text style={styles.emoji}>{unit.emoji}</Text>
      <View style={styles.info}>
        <UiText style={styles.title}>{unit.title}</UiText>
        <Text style={styles.theme}>{unit.theme}</Text>
        <View style={styles.footer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unit.badgeLabel}</Text>
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
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  emoji: { fontSize: 40 },
  info: { flex: 1, gap: 4 },
  title: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  theme: { fontSize: 16, fontWeight: "700", color: "rgba(255,255,255,0.9)" },
  footer: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 4 },
  badge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
});
