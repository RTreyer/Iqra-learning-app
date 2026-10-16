/**
 * ScreenBackground — gradient backdrop with floating decorative emoji.
 *
 * Used on every screen to create a warm, inviting atmosphere.
 * Decorations are subtle (very low opacity) so they don't distract.
 */

import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleProp, StyleSheet, Text, ViewStyle } from "react-native";

import { gradients, type Subject } from "@/theme/tokens";

export type BgSubject = Subject | "home";

type DecoItem = {
  emoji: string;
  size: number;
  opacity: number;
  rotate: string;
  top?: `${number}%`;
  bottom?: `${number}%`;
  left?: `${number}%`;
  right?: `${number}%`;
};

type Config = {
  start: { x: number; y: number };
  end: { x: number; y: number };
  decos: DecoItem[];
};

const HOME: Config = {
  start: { x: 0.1, y: 0 },
  end: { x: 0.9, y: 1 },
  decos: [
    { emoji: "⭐", size: 110, opacity: 0.12, rotate: "20deg", top: "4%", left: "2%" },
    { emoji: "🌟", size: 80,  opacity: 0.09, rotate: "-15deg", top: "16%", right: "3%" },
    { emoji: "🌟", size: 90,  opacity: 0.09, rotate: "15deg",  bottom: "8%", left: "5%" },
    { emoji: "✨", size: 65,  opacity: 0.10, rotate: "-30deg", bottom: "6%", right: "8%" },
  ],
};

const READING: Config = {
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
  decos: [
    { emoji: "📖", size: 100, opacity: 0.10, rotate: "15deg",  top: "3%",  right: "2%" },
    { emoji: "✨", size: 80,  opacity: 0.10, rotate: "-20deg", top: "22%", left: "1%" },
    { emoji: "📚", size: 110, opacity: 0.08, rotate: "10deg",  top: "52%", right: "1%" },
    { emoji: "⭐", size: 85,  opacity: 0.10, rotate: "-25deg", bottom: "18%", left: "2%" },
  ],
};

const NUMBERS: Config = {
  start: { x: 0.1, y: 0 },
  end: { x: 0.9, y: 1 },
  decos: [
    { emoji: "⭐", size: 100, opacity: 0.10, rotate: "20deg",  top: "4%",  left: "2%" },
    { emoji: "✨", size: 75,  opacity: 0.09, rotate: "-15deg", top: "20%", right: "2%" },
    { emoji: "🔢", size: 105, opacity: 0.07, rotate: "10deg",  top: "52%", left: "1%" },
    { emoji: "🌟", size: 85,  opacity: 0.10, rotate: "-20deg", bottom: "18%", right: "2%" },
  ],
};

const SUBJECT_STYLE: Record<BgSubject, Config> = {
  home: HOME,
  arabic: READING,
  math: NUMBERS,
  science: NUMBERS,
};

type Props = {
  /** Token based gradient keyed by subject. Defaults to "home". */
  subject?: BgSubject;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ScreenBackground({ subject = "home", children, style }: Props) {
  const cfg = SUBJECT_STYLE[subject];

  return (
    <LinearGradient
      colors={gradients[subject]}
      start={cfg.start}
      end={cfg.end}
      style={[styles.base, style]}
    >
      {/* Floating decorative emoji — purely visual */}
      {cfg.decos.map((d, i) => (
        <Text
          key={i}
          style={[
            styles.deco,
            {
              fontSize: d.size,
              opacity: d.opacity,
              transform: [{ rotate: d.rotate }],
              top: d.top,
              bottom: d.bottom,
              left: d.left,
              right: d.right,
            },
          ]}
          pointerEvents="none"
        >
          {d.emoji}
        </Text>
      ))}

      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  deco: {
    position: "absolute",
    lineHeight: undefined,
    // Prevent any layout interference
    includeFontPadding: false,
  },
});
