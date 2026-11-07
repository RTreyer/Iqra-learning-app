/**
 * ScreenBackground: the warm sand backdrop of the child's world, with a breath of the subject
 * colour at the top. Drawings, not emoji, decorate the screens themselves.
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
  // Home draws Old Sana'a instead (components/world/Skyline).
  decos: [],
};

const READING: Config = {
  start: { x: 0.5, y: 0 },
  end: { x: 0.5, y: 1 },
  // No floating emoji: the world is drawn (paths, palms, Hudhud), as in the design.
  decos: [],
};

const NUMBERS: Config = {
  start: { x: 0.5, y: 0 },
  end: { x: 0.5, y: 1 },
  // No floating emoji: the world is drawn (paths, palms, Hudhud), as in the design.
  decos: [],
};

const SUBJECT_STYLE: Record<BgSubject, Config> = {
  home: HOME,
  arabic: READING,
  lughati: READING,
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
      {/* Floating decorative emoji, purely visual */}
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
