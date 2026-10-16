import React from "react";
import { StyleSheet, Text, View } from "react-native";

/** Total stars earned, shown in screen headers. */
export function StarBadge({ stars }: { stars: number }) {
  return (
    <View style={styles.row} testID="star-badge">
      <Text style={styles.emoji}>⭐</Text>
      <Text style={styles.count}>{stars}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  emoji: { fontSize: 20 },
  count: { fontSize: 22, fontWeight: "700", color: "#92400E" },
});
