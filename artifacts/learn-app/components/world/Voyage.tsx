/**
 * The coffee trader's ship in Mocha (content/story.ts), the goal at the end of the maths path.
 * One more sack of coffee goes on board for every maths unit finished; with all five the sail
 * is set, the ship sails, and on the pier the trader has put out a bowl of water for the birds.
 */

import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ellipse, G, Path, Rect, Svg } from "react-native-svg";

import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { touchTarget } from "@/theme/tokens";

const JUTE = "#C9A26B";
const JUTE_DARK = "#A8834F";
const WOOD = "#8E5A36";
const WOOD_DARK = "#5E3220";
const SAIL = "#F7F0E1";
const SEA = "#4F8FD6";

/** A small jute sack of coffee, in a 24 × 26 box at (x, y). */
export function SackShape({
  x = 0,
  y = 0,
  scale = 1,
  empty = false,
}: {
  x?: number;
  y?: number;
  scale?: number;
  empty?: boolean;
}) {
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`}>
      <Path
        d="M5 6 Q2 16 4 24 Q12 27 20 24 Q22 16 19 6 Z"
        fill={empty ? "#EFE4D2" : JUTE}
        stroke={empty ? "#B9A58E" : JUTE_DARK}
        strokeWidth={1.6}
        strokeDasharray={empty ? "3 2" : undefined}
      />
      {empty ? null : (
        <>
          <Ellipse cx={12} cy={6} rx={7} ry={2.4} fill={WOOD_DARK} />
          <Path d="M4 8 Q12 11 20 8" stroke="#7A5418" strokeWidth={1.6} fill="none" />
          <Path d="M7 15 Q12 17 17 15" stroke={JUTE_DARK} strokeWidth={1.2} fill="none" />
        </>
      )}
    </G>
  );
}

/** The trader's dhow at the pier of Mocha, with `stage` sacks on board (0 to 5). */
export function DhowArt({ stage, size = 130 }: { stage: number; size?: number }) {
  const s = Math.max(0, Math.min(5, stage));
  const sailing = s >= 5;
  return (
    <Svg width={size} height={(size * 100) / 120} viewBox="0 0 120 100">
      {/* The pier, and on it, once the ship sails, the trader's bowl of water for the birds. */}
      <Rect x={0} y={64} width={30} height={8} fill={WOOD} />
      <Rect x={6} y={72} width={4} height={18} fill={WOOD_DARK} />
      <Rect x={20} y={72} width={4} height={18} fill={WOOD_DARK} />
      {sailing ? (
        <G>
          <Path d="M6 58 Q8 66 15 66 Q22 66 24 58 Z" fill="#B5522E" />
          <Ellipse cx={15} cy={58} rx={9} ry={2.6} fill={SEA} />
          <Path d="M10 52 q3 -3 6 0 q3 -3 6 0" stroke="#2B1D14" strokeWidth={1.6} fill="none" />
        </G>
      ) : null}
      <Rect x={0} y={78} width={120} height={22} fill={SEA} />
      <Path
        d="M4 84 q6 -4 12 0 t12 0 M60 90 q6 -4 12 0 t12 0 M92 82 q6 -4 12 0"
        stroke="#FFFFFF"
        strokeWidth={1.6}
        fill="none"
        opacity={0.7}
      />
      <G transform={sailing ? "translate(6 0)" : undefined}>
        <Rect x={70} y={10} width={3} height={58} fill={WOOD_DARK} />
        {sailing ? (
          // The lateen sail, set: the ship sails.
          <Path d="M44 18 L110 50 L72 60 Z" fill={SAIL} stroke="#C2AE8E" strokeWidth={1.5} />
        ) : (
          // Furled along its yard while the ship is loaded.
          <Path d="M48 20 L102 46" stroke={SAIL} strokeWidth={5} strokeLinecap="round" />
        )}
        {Array.from({ length: s }, (_, i) => (
          <SackShape key={i} x={38 + i * 12} y={i % 2 ? 44 : 46} scale={0.62} />
        ))}
        <Path d="M32 62 L108 60 L98 78 Q68 86 42 78 Z" fill={WOOD} />
        <Path d="M36 66 L104 64" stroke="#E9A81E" strokeWidth={2.5} />
        <Path d="M108 60 L114 54" stroke={WOOD} strokeWidth={4} strokeLinecap="round" />
      </G>
    </Svg>
  );
}

/** The ship as the goal at the end of the maths book's path. */
export function VoyageGoal({ stage, line }: { stage: number; line: string }) {
  return (
    <Pressable
      testID="voyage"
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
      <DhowArt stage={stage} size={150} />
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
