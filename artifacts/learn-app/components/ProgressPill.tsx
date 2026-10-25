import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useLanguage } from "@/context/LanguageContext";
import type { UnitProgress } from "@/context/ProgressContext";
import { colors } from "@/theme/tokens";

/** "done / total" plus earned stars, readable on any colored card. */
export function ProgressPill({ done, total, stars }: UnitProgress) {
  const { digits } = useLanguage();
  return (
    <View style={styles.pill} accessibilityLabel={digits(`${done} / ${total}, ${stars} ⭐`)}>
      <Text style={styles.text}>{digits(`${done} / ${total}`)}</Text>
      <Text style={styles.text}>{`⭐ ${digits(stars)}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.pill,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: { fontSize: 13, fontWeight: "700", color: colors.text },
});
