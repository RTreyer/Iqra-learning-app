/**
 * Shared pieces of the story scenes: people seen from the front, drawn in the
 * same palette as components/art/Art.tsx, sized by the height of the head.
 */

import React from "react";
import { Circle, Ellipse, G, Path } from "react-native-svg";

export const SKIN = "#C68A5B";
export const SKIN_SHADE = "#A86F45";
export const INK = "#3B2A20";
export const HAIR = "#2B1D16";
export const WOOD = "#8B5A2B";
export const WOOD_DARK = "#6B3F1F";
export const WHITE = "#FFFFFF";

type FaceProps = {
  cx: number;
  cy: number;
  r: number;
  mood?: "smile" | "open" | "worried" | "calm";
};

/** Round face with eyes, cheeks and a mouth for the mood. */
export function Face({ cx, cy, r, mood = "smile" }: FaceProps) {
  const mouthY = cy + r * 0.42;
  const mouth = {
    smile: `M${cx - r * 0.3},${mouthY} Q${cx},${mouthY + r * 0.3} ${cx + r * 0.3},${mouthY}`,
    calm: `M${cx - r * 0.22},${mouthY + r * 0.05} Q${cx},${mouthY + r * 0.15} ${cx + r * 0.22},${mouthY + r * 0.05}`,
    worried: `M${cx - r * 0.25},${mouthY + r * 0.15} Q${cx},${mouthY - r * 0.05} ${cx + r * 0.25},${mouthY + r * 0.15}`,
    open: "",
  }[mood];
  return (
    <G>
      <Ellipse
        cx={cx - r * 0.98}
        cy={cy + r * 0.05}
        rx={r * 0.16}
        ry={r * 0.24}
        fill={SKIN_SHADE}
      />
      <Ellipse
        cx={cx + r * 0.98}
        cy={cy + r * 0.05}
        rx={r * 0.16}
        ry={r * 0.24}
        fill={SKIN_SHADE}
      />
      <Ellipse cx={cx} cy={cy} rx={r} ry={r * 1.1} fill={SKIN} />
      <Ellipse cx={cx - r * 0.36} cy={cy - r * 0.08} rx={r * 0.11} ry={r * 0.14} fill={INK} />
      <Ellipse cx={cx + r * 0.36} cy={cy - r * 0.08} rx={r * 0.11} ry={r * 0.14} fill={INK} />
      <Circle cx={cx - r * 0.33} cy={cy - r * 0.12} r={r * 0.035} fill={WHITE} />
      <Circle cx={cx + r * 0.39} cy={cy - r * 0.12} r={r * 0.035} fill={WHITE} />
      {mood === "worried" ? (
        <G>
          <Path
            d={`M${cx - r * 0.58},${cy - r * 0.3} L${cx - r * 0.2},${cy - r * 0.44}`}
            stroke={INK}
            strokeWidth={r * 0.07}
            strokeLinecap="round"
          />
          <Path
            d={`M${cx + r * 0.58},${cy - r * 0.3} L${cx + r * 0.2},${cy - r * 0.44}`}
            stroke={INK}
            strokeWidth={r * 0.07}
            strokeLinecap="round"
          />
        </G>
      ) : null}
      <Path
        d={`M${cx},${cy + r * 0.02} Q${cx + r * 0.12},${cy + r * 0.22} ${cx - r * 0.04},${cy + r * 0.24}`}
        stroke={SKIN_SHADE}
        strokeWidth={r * 0.06}
        fill="none"
        strokeLinecap="round"
      />
      <Ellipse
        cx={cx - r * 0.6}
        cy={cy + r * 0.28}
        rx={r * 0.15}
        ry={r * 0.09}
        fill="#E39A84"
        opacity={0.6}
      />
      <Ellipse
        cx={cx + r * 0.6}
        cy={cy + r * 0.28}
        rx={r * 0.15}
        ry={r * 0.09}
        fill="#E39A84"
        opacity={0.6}
      />
      {mood === "open" ? (
        <Ellipse cx={cx} cy={mouthY + r * 0.08} rx={r * 0.16} ry={r * 0.12} fill="#7A2E2E" />
      ) : (
        <Path d={mouth} stroke={INK} strokeWidth={r * 0.08} fill="none" strokeLinecap="round" />
      )}
    </G>
  );
}

/** Short dark hair cap over a face of radius `r`. */
export function ShortHair({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <Path
      d={`M${cx - r * 1.02},${cy - r * 0.05} Q${cx - r * 1.1},${cy - r * 1.25} ${cx},${cy - r * 1.18} Q${cx + r * 1.1},${cy - r * 1.25} ${cx + r * 1.02},${cy - r * 0.05} Q${cx + r * 0.7},${cy - r * 0.6} ${cx + r * 0.1},${cy - r * 0.62} Q${cx - r * 0.5},${cy - r * 0.62} ${cx - r * 1.02},${cy - r * 0.05} Z`}
      fill={HAIR}
    />
  );
}

/** Hand as a small skin coloured oval. */
export function Hand({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <Ellipse
      cx={cx}
      cy={cy}
      rx={r}
      ry={r * 0.85}
      fill={SKIN}
      stroke={SKIN_SHADE}
      strokeWidth={r * 0.15}
    />
  );
}
