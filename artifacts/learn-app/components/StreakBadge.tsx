import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useLanguage } from "@/context/LanguageContext";
import { colors, withAlpha } from "@/theme/tokens";

/** Consecutive active days, shown beside the star badge. */
export function StreakBadge({ days }: { days: number }) {
  const { t } = useLanguage();
  return (
    <View style={styles.row} testID="streak-badge" accessible accessibilityLabel={t(`${days} يَوْم مُتَتَالٍ`)}>
      <Text style={styles.count}>{`🔥 ${days}`}</Text>
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
  },
  count: { fontSize: 22, fontWeight: "700", color: colors.starText },
});
