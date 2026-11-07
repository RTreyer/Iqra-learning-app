/**
 * Today's qamariya: the half-round stained-glass window of Sana'a houses. Each lesson of the
 * day colours one pane; with all panes coloured the window glows. It never empties as a
 * punishment: a new day just starts with clear glass.
 */

import React from "react";
import { Path, Svg } from "react-native-svg";

import { DAILY_GOAL } from "@/lib/daily";
import { yemen } from "@/theme/tokens";

const PANES = [yemen.red, yemen.blue, yemen.green];

function wedge(i: number, count: number): string {
  const cx = 50;
  const cy = 52;
  const r = 40;
  const a0 = Math.PI + (i * Math.PI) / count;
  const a1 = Math.PI + ((i + 1) * Math.PI) / count;
  const p = (a: number) =>
    `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  return `M${cx} ${cy} L${p(a0)} A${r} ${r} 0 0 1 ${p(a1)} Z`;
}

type Props = {
  /** Lessons done today; panes beyond the goal stay full. */
  filled: number;
  width?: number;
  /** Frame colour: brown on light ground, white on the dark wall of the finish screen. */
  frame?: string;
};

export function QamariyaGoal({ filled, width = 112, frame = yemen.clayDeep }: Props) {
  const lit = Math.min(filled, DAILY_GOAL);
  const glowing = lit >= DAILY_GOAL;
  return (
    <Svg width={width} height={(width * 60) / 100} viewBox="0 0 100 60">
      {glowing ? <Path d="M2 54 A48 48 0 0 1 98 54 Z" fill="#F4C14B" opacity={0.45} /> : null}
      {Array.from({ length: DAILY_GOAL }, (_, i) => (
        <Path
          key={i}
          d={wedge(i, DAILY_GOAL)}
          fill={i < lit ? PANES[i % PANES.length] : yemen.paneEmpty}
          stroke="#FFFFFF"
          strokeWidth={3}
        />
      ))}
      <Path d="M36 52 A14 14 0 0 1 64 52 Z" fill={glowing ? "#FFF3C4" : "#FFFFFF"} />
      <Path d="M6 52 A44 44 0 0 1 94 52 Z" fill="none" stroke={frame} strokeWidth={3} />
      <Path d="M4 54h92" stroke={frame} strokeWidth={4} strokeLinecap="round" />
    </Svg>
  );
}
