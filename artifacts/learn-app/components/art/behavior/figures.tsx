/**
 * People for the behaviour pictures, seen from the front in the palette of the story scenes:
 * boys in a white thobe, girls and women with a headscarf and a long dress. A person is placed
 * by the point between its feet and sized with `s` (1 = a child about 46 units tall).
 */

import React from "react";
import { Ellipse, G, Path, Rect } from "react-native-svg";

import { Face, Hand, Headscarf, SKIN, ShortHair, WHITE } from "../scenes/parts";

export type Pt = [number, number];
export type Mood = "smile" | "open" | "worried" | "calm" | "cry";

const THOBE_EDGE = "#D9D4CC";
const SANDAL = "#6D4C41";

/** An arm from the shoulder to the hand; a white sleeve gets a thin edge so it shows on white. */
export function Arm({ from, to, color, s = 1 }: { from: Pt; to: Pt; color: string; s?: number }) {
  const d = `M${from[0]},${from[1]} L${to[0]},${to[1]}`;
  return (
    <G>
      {color === WHITE ? (
        <Path d={d} stroke={THOBE_EDGE} strokeWidth={4.4 * s} strokeLinecap="round" />
      ) : null}
      <Path d={d} stroke={color} strokeWidth={3.4 * s} strokeLinecap="round" />
      <Hand cx={to[0]} cy={to[1]} r={1.9 * s} />
    </G>
  );
}

type PersonProps = {
  x: number;
  feet: number;
  s?: number;
  kind: "boy" | "girl" | "woman";
  mood?: Mood;
  /** Where the hands are; by default they hang down. Left and right as seen on the picture. */
  left?: Pt;
  right?: Pt;
  /** Dress (girl, woman) or thobe colour (boy, white by default). */
  color?: string;
  scarf?: string;
  /** Drawn between the body and the arms, e.g. a basket held in front. */
  children?: React.ReactNode;
};

export function Person({
  x,
  feet,
  s = 1,
  kind,
  mood = "smile",
  left,
  right,
  color,
  scarf,
  children,
}: PersonProps) {
  const body = color ?? (kind === "boy" ? WHITE : kind === "girl" ? "#7E57C2" : "#2F3B52");
  const headR = 5.5 * s;
  const headY = feet - 40 * s;
  const shoulderY = feet - 31 * s;
  const lShoulder: Pt = [x - 6 * s, shoulderY];
  const rShoulder: Pt = [x + 6 * s, shoulderY];
  const lHand = left ?? [x - 8.5 * s, feet - 17 * s];
  const rHand = right ?? [x + 8.5 * s, feet - 17 * s];
  return (
    <G>
      <Ellipse cx={x - 3.5 * s} cy={feet} rx={3 * s} ry={1.3 * s} fill={SANDAL} />
      <Ellipse cx={x + 3.5 * s} cy={feet} rx={3 * s} ry={1.3 * s} fill={SANDAL} />
      <Path
        d={`M${x - 6 * s},${feet - 33 * s} Q${x - 8 * s},${feet - 15 * s} ${x - 9.5 * s},${feet - 1.5 * s} L${x + 9.5 * s},${feet - 1.5 * s} Q${x + 8 * s},${feet - 15 * s} ${x + 6 * s},${feet - 33 * s} Q${x},${feet - 36 * s} ${x - 6 * s},${feet - 33 * s} Z`}
        fill={body}
        stroke={body === WHITE ? THOBE_EDGE : "none"}
        strokeWidth={0.6 * s}
      />
      {children}
      <Arm from={lShoulder} to={lHand} color={body} s={s} />
      <Arm from={rShoulder} to={rHand} color={body} s={s} />
      {kind === "boy" ? (
        <Rect x={x - 1.6 * s} y={feet - 36.5 * s} width={3.2 * s} height={3 * s} fill={SKIN} />
      ) : (
        <Headscarf
          cx={x}
          cy={headY}
          r={headR}
          fill={scarf ?? (kind === "girl" ? WHITE : body)}
          edge={kind === "girl" ? "#E0E0E0" : "#1F2838"}
        />
      )}
      <Face cx={x} cy={headY} r={headR} mood={mood} />
      {kind === "boy" ? <ShortHair cx={x} cy={headY} r={headR} /> : null}
    </G>
  );
}

/** A Sana'a house front: brown stone, white bands and window frames, a qamariya on top. */
export function SanaaHouse({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const rows = Math.max(1, Math.floor(h / 16));
  return (
    <G>
      <Rect x={x} y={y} width={w} height={h} fill="#A0623A" />
      {Array.from({ length: rows }, (_, r) => (
        <G key={r}>
          <Rect x={x} y={y + r * 16 + 13} width={w} height={1.6} fill="#F5EBDD" />
          {[0.25, 0.75].map((f) => (
            <G key={f}>
              <Rect
                x={x + w * f - 3}
                y={y + r * 16 + 4}
                width={6}
                height={7}
                fill="#3E2723"
                stroke="#F5EBDD"
                strokeWidth={1}
              />
              <Path
                d={`M${x + w * f - 3},${y + r * 16 + 4} Q${x + w * f},${y + r * 16} ${x + w * f + 3},${y + r * 16 + 4} Z`}
                fill="#FFCC80"
                stroke="#F5EBDD"
                strokeWidth={0.8}
              />
            </G>
          ))}
        </G>
      ))}
    </G>
  );
}

/** A green street bin with a lid. */
export function Bin({ x, y, open = false }: { x: number; y: number; open?: boolean }) {
  return (
    <G>
      <Path
        d={`M${x - 7},${y} L${x + 7},${y} L${x + 5.5},${y + 17} L${x - 5.5},${y + 17} Z`}
        fill="#2E7D32"
      />
      <Path
        d={`M${x - 4},${y + 4} L${x - 3.4},${y + 14} M${x},${y + 4} L${x},${y + 14} M${x + 4},${y + 4} L${x + 3.4},${y + 14}`}
        stroke="#1B5E20"
        strokeWidth={1}
      />
      {open ? (
        <Rect
          x={x - 8}
          y={y - 6}
          width={16}
          height={2.4}
          rx={1}
          fill="#388E3C"
          transform={`rotate(-28 ${x - 8} ${y - 2})`}
        />
      ) : (
        <Rect x={x - 8} y={y - 2.4} width={16} height={2.4} rx={1} fill="#388E3C" />
      )}
    </G>
  );
}

/** Litter on the ground: a crumpled paper, a can and a banana peel. */
export function Litter({ x, y }: { x: number; y: number }) {
  return (
    <G>
      <Path
        d={`M${x},${y} l3,-2.4 l3,1.2 l1.4,2.6 l-2.6,1.6 l-3.6,-0.4 Z`}
        fill="#ECEFF1"
        stroke="#90A4AE"
        strokeWidth={0.5}
      />
      <Rect
        x={x + 10}
        y={y - 2.4}
        width={6}
        height={3.2}
        rx={1.4}
        fill="#E53935"
        transform={`rotate(12 ${x + 13} ${y - 0.8})`}
      />
      <Path
        d={`M${x + 20},${y + 0.6} q2,-4 4,0 q2,-4 4,0 q-4,1.6 -8,0 Z`}
        fill="#FDD835"
        stroke="#C6A700"
        strokeWidth={0.5}
      />
    </G>
  );
}
