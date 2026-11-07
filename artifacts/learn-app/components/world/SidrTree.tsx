/**
 * The sidr tree from Rasha's seed (content/story.ts), drawn at its stage of growth: 0 a seed in
 * the earth, 1 a sprout, then more and more leaves, 5 a full tree with birds in it. On the maths
 * book path it grows with every maths unit the child finishes.
 */

import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Circle, Ellipse, Path, Svg } from "react-native-svg";

import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { touchTarget, yemen } from "@/theme/tokens";

const LEAF = "#3F8A4E";
const LEAF_LIGHT = "#5BA05F";
const TRUNK = "#8E5A36";

/** Crowns of the tree: more of them at every stage. */
const CROWNS: [number, number, number, string][] = [
  [50, 46, 18, LEAF],
  [34, 54, 14, LEAF_LIGHT],
  [66, 54, 14, LEAF_LIGHT],
  [40, 36, 15, LEAF_LIGHT],
  [60, 36, 15, LEAF],
  [50, 26, 16, LEAF],
];

export function SidrTreeArt({ stage, size = 120 }: { stage: number; size?: number }) {
  const s = Math.max(0, Math.min(5, stage));
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Ellipse cx={50} cy={90} rx={40} ry={8} fill="#8E6A4A" />
      {s === 0 ? (
        <Ellipse cx={50} cy={86} rx={6} ry={4} fill="#6B3A1E" />
      ) : s === 1 ? (
        <>
          <Path d="M50 88 V70" stroke={LEAF} strokeWidth={3} strokeLinecap="round" />
          <Path d="M50 74 Q40 72 38 64 Q48 64 50 74 Z" fill={LEAF_LIGHT} />
          <Path d="M50 72 Q60 70 62 62 Q52 62 50 72 Z" fill={LEAF} />
        </>
      ) : (
        <>
          <Path
            d={`M50 90 V${74 - s * 6} M50 ${78 - s * 4} L${38 - s} ${66 - s * 4} M50 ${76 - s * 4} L${62 + s} ${64 - s * 4}`}
            stroke={TRUNK}
            strokeWidth={2 + s}
            strokeLinecap="round"
          />
          {CROWNS.slice(0, s + 1).map(([x, y, r, c], i) => (
            <Circle key={i} cx={x} cy={y + (5 - s) * 6} r={r * (0.55 + s * 0.09)} fill={c} />
          ))}
          {s >= 4
            ? [36, 58, 48].map((x, i) => (
                <Circle key={`f${i}`} cx={x} cy={(i === 2 ? 30 : 44) + (5 - s) * 6} r={2.5} fill="#E9A81E" />
              ))
            : null}
          {s === 5 ? (
            <>
              <Path d="M24 40 q4 -4 8 0 q4 -4 8 0" stroke={yemen.ink} strokeWidth={2} fill="none" />
              <Path d="M66 28 q4 -4 8 0 q4 -4 8 0" stroke={yemen.ink} strokeWidth={2} fill="none" />
            </>
          ) : null}
        </>
      )}
    </Svg>
  );
}

/** The tree as the goal at the end of the maths book's path. */
export function SidrTreeGoal({ stage, line }: { stage: number; line: string }) {
  return (
    <Pressable
      testID="sidr-tree"
      accessibilityRole="button"
      accessibilityLabel={line}
      accessibilityState={{ checked: stage >= 5 }}
      accessibilityValue={{ min: 0, max: 5, now: stage }}
      onPress={() => {
        haptics.tap();
        speak(line);
      }}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      {stage >= 5 ? <View style={styles.glow} /> : null}
      <SidrTreeArt stage={stage} size={130} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 168, minHeight: touchTarget * 2, alignItems: "center", justifyContent: "center" },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  glow: {
    position: "absolute",
    width: 170,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#F4C14B",
    opacity: 0.35,
  },
});
