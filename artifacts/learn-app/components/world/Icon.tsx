/**
 * Picture icons for a child who cannot read: inline stroke SVG, no icon font, same on every
 * platform. Each icon is drawn in a 24 × 24 box.
 */

import React from "react";
import { Circle, Path, Rect, Svg } from "react-native-svg";

export type IconName =
  | "home"
  | "map"
  | "play"
  | "replay"
  | "speaker"
  | "gear"
  | "lock"
  | "book"
  | "pencil"
  | "eye"
  | "ear"
  | "hand"
  | "check"
  | "mail"
  | "album";

type Props = { name: IconName; size?: number; color?: string; strokeWidth?: number };

export function Icon({ name, size = 24, color = "#2B1D14", strokeWidth = 2.2 }: Props) {
  const stroke = {
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === "home" ? (
        <>
          <Path d="M3 11l9-8 9 8" {...stroke} />
          <Path d="M5 10v10h14V10" {...stroke} />
          <Path d="M10 20v-6h4v6" {...stroke} />
        </>
      ) : null}
      {name === "map" ? (
        <>
          <Path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" {...stroke} />
          <Path d="M9 4v14M15 6v14" {...stroke} />
        </>
      ) : null}
      {name === "play" ? (
        <Path
          d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z"
          fill={color}
        />
      ) : null}
      {name === "replay" ? (
        <>
          <Path d="M3 12a9 9 0 1 0 3-6.7" {...stroke} />
          <Path d="M3 4v5h5" {...stroke} />
        </>
      ) : null}
      {name === "speaker" ? (
        <>
          <Path
            d="M11 5L6 9H2v6h4l5 4V5z"
            fill={color}
            stroke={color}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          <Path d="M15.5 8.5a5 5 0 0 1 0 7" {...stroke} />
          <Path d="M19 5a10 10 0 0 1 0 14" {...stroke} />
        </>
      ) : null}
      {name === "gear" ? (
        <>
          <Circle cx={12} cy={12} r={3} {...stroke} />
          <Path
            d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"
            {...stroke}
          />
        </>
      ) : null}
      {name === "lock" ? (
        <>
          <Rect x={5} y={11} width={14} height={10} rx={2} {...stroke} />
          <Path d="M8 11V8a4 4 0 0 1 8 0v3" {...stroke} />
        </>
      ) : null}
      {name === "book" ? (
        <>
          <Path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2z" {...stroke} />
          <Path d="M22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" {...stroke} />
        </>
      ) : null}
      {name === "pencil" ? (
        <>
          <Path d="M15 4l5 5L9 20H4v-5z" {...stroke} />
          <Path d="M13 6l5 5" {...stroke} />
        </>
      ) : null}
      {name === "eye" ? (
        <>
          <Path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" {...stroke} />
          <Circle cx={12} cy={12} r={3} {...stroke} />
        </>
      ) : null}
      {name === "ear" ? (
        <>
          <Path d="M6 9a6 6 0 1 1 12 0c0 3-2 4-3 5.5S14 18 12 19.5 8 20 8 18" {...stroke} />
          <Path d="M10 9a2 2 0 1 1 4 0c0 1.5-2 2-2 3.5" {...stroke} />
        </>
      ) : null}
      {name === "hand" ? (
        <Path
          d="M9 11V4.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.2a6 6 0 0 1-4.9-2.6L3.6 15a1.5 1.5 0 0 1 2.4-1.8L9 16V11"
          fill="#FFE2C4"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
      {name === "check" ? <Path d="M5 12.5l4.5 4.5L19 7" {...stroke} /> : null}
      {name === "mail" ? (
        <>
          <Rect x={3} y={5} width={18} height={14} rx={2} {...stroke} />
          <Path d="M3 7l9 6 9-6" {...stroke} />
        </>
      ) : null}
      {name === "album" ? (
        <>
          <Rect x={3} y={4} width={18} height={16} rx={2} {...stroke} />
          <Path d="M12 4v16" {...stroke} />
          <Path d="M6 9h3v3H6zM15 13h3v3h-3z" {...stroke} />
        </>
      ) : null}
    </Svg>
  );
}

/** Filled star, the one reward the child counts. */
export function StarIcon({ size = 24, dim = false }: { size?: number; dim?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"
        fill={dim ? "#E7DCCB" : "#E9A81E"}
        stroke={dim ? "#D6C8B2" : "#B57F0A"}
        strokeWidth={1.1}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
