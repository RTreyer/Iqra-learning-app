import React from "react";
import { StyleSheet, View } from "react-native";
import { Path, Rect, Svg, Circle } from "react-native-svg";

import { readableFill, yemen } from "@/theme/tokens";

type Props = { count: number; current: number; color: string };

const WAGON = 30;
const GAP = 4;

/**
 * Round progress as a little train, like the syllable train: the engine leads in reading
 * direction, the wagons behind it fill one by one. A picture, not "question 2 of 5".
 */
export function ProgressDots({ count, current, color }: Props) {
  const fill = readableFill(color);
  // Many rounds: the wagons shrink so the train fits a phone.
  const wagon = count > 8 ? Math.max(14, Math.floor((8 * WAGON) / count)) : WAGON;
  return (
    <View
      testID="progress-train"
      style={styles.row}
      accessibilityRole="progressbar"
      aria-valuemin={0}
      aria-valuemax={count}
      aria-valuenow={current + 1}
    >
      {Array.from({ length: count }, (_, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <Svg key={i} width={wagon} height={24} viewBox="0 0 30 24">
            <Rect
              x={1}
              y={2}
              width={28}
              height={14}
              rx={4}
              fill={done ? fill : now ? "#FFFFFF" : yemen.paneEmpty}
              stroke={now ? fill : "#9C8468"}
              strokeWidth={now ? 3 : 1.5}
            />
            <Circle cx={8} cy={19} r={3.5} fill="#3B2A1E" />
            <Circle cx={22} cy={19} r={3.5} fill="#3B2A1E" />
          </Svg>
        );
      })}
      <Svg width={36} height={26} viewBox="0 0 36 26">
        <Rect x={2} y={8} width={26} height={12} rx={3} fill={yemen.clay} />
        <Rect x={2} y={1} width={12} height={10} rx={2} fill={yemen.clayDeep} />
        <Rect x={20} y={2} width={5} height={7} fill="#5E3220" />
        <Path d="M28 20 L35 24 L28 24 Z" fill="#5E3220" />
        <Circle cx={9} cy={21} r={4} fill="#3B2A1E" />
        <Circle cx={22} cy={21} r={4} fill="#3B2A1E" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  // Arabic reads right to left: the wagons come first on the right, the engine leads on the left.
  row: {
    flexDirection: "row-reverse",
    gap: GAP,
    justifyContent: "center",
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
});
