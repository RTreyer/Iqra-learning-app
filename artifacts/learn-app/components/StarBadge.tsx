import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useLanguage } from "@/context/LanguageContext";
import type { UiLanguage } from "@/content/ui-translations";
import { colors, withAlpha } from "@/theme/tokens";

/** Spoken star count for screen readers, with Arabic dual and plural forms. */
export function starsLabel(count: number, language: UiLanguage): string {
  if (language === "en") return `${count} ${count === 1 ? "star" : "stars"}`;
  if (count === 1) return "نجمة واحدة";
  if (count === 2) return "نجمتان";
  if (count >= 3 && count <= 10) return `${count} نجوم`;
  return `${count} نجمة`;
}

/** Total stars earned, shown in screen headers. */
export function StarBadge({ stars }: { stars: number }) {
  const { language } = useLanguage();
  return (
    <View style={styles.row} testID="star-badge" accessible accessibilityLabel={starsLabel(stars, language)}>
      <Text style={styles.emoji}>⭐</Text>
      <Text style={styles.count}>{stars}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: withAlpha(colors.white, 0.55),
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  emoji: { fontSize: 20 },
  count: { fontSize: 22, fontWeight: "700", color: colors.starText },
});
