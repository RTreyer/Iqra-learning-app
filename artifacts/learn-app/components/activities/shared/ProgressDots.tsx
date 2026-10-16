import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "@/theme/tokens";

type Props = { count: number; current: number; color: string };

export function ProgressDots({ count, current, color }: Props) {
  const dots = [];
  for (let i = 0; i < count; i++) {
    const done = i <= current;
    dots.push(
      <View
        key={i}
        style={[
          styles.dot,
          i === current && styles.active,
          { backgroundColor: done ? color : colors.border },
        ]}
      />,
    );
  }
  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: count, now: current + 1 }}
    >
      {dots}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, justifyContent: "center" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  active: { width: 24 },
});
