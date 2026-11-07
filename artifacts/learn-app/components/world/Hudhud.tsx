/**
 * Hudhud, the hoopoe who guides the child. In Surat an-Naml the hoopoe brings the news from
 * Saba, from Yemen. Flat inline SVG, two poses, a gentle hop that can be switched off. In his
 * story he is the postman of Yemen and wears a leather mail bag across his chest, letters
 * peeking out of it.
 */

import React, { useEffect, useState } from "react";
import { Animated, Easing, type StyleProp, type ViewStyle } from "react-native";
import { Circle, Ellipse, G, Path, Svg } from "react-native-svg";

const BODY = "#DD8C44";
const HEAD = "#E8A05A";
const INK = "#2B1D14";
const STRIPE = "#FFF6E8";
const LEGS = "#3A2A20";
const CHEEK = "#F2A98A";

const CREST = [-50, -25, 0, 25, 50];
const LEATHER = "#9A5B2C";
const LEATHER_DARK = "#74401C";
const LEATHER_EDGE = "#4E2A12";
const PAPER = "#FFFFFF";
const PAPER_CREAM = "#FFF1CF";
const PAPER_EDGE = "#B9A58E";
const SEAL = "#C8402F";
/** Wing beats per second while flying. */
const FLAP_MS = 180;

export type HudhudPose = "stand" | "cheer";

type Props = {
  size?: number;
  pose?: HudhudPose;
  /** Looks to the right instead of the left (the reading direction). */
  mirrored?: boolean;
  /** A slow hop; off for still pictures. */
  hop?: boolean;
  /** The postman's mail bag: letters peek out ("closed"), or are pulled up by the wind ("open"). */
  bag?: "closed" | "open";
  /** Beats the wing, for flying. */
  flap?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** One letter (envelope) in the bag, drawn around its centre and tilted. */
function Letter({ x, y, angle, cream }: { x: number; y: number; angle: number; cream?: boolean }) {
  return (
    <G transform={`rotate(${angle} ${x} ${y})`}>
      <Path
        d={`M${x - 10} ${y - 7} h20 v14 h-20 Z`}
        fill={cream ? PAPER_CREAM : PAPER}
        stroke={PAPER_EDGE}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <Path
        d={`M${x - 10} ${y - 7} L${x} ${y} L${x + 10} ${y - 7}`}
        stroke={PAPER_EDGE}
        strokeWidth={1.2}
        fill="none"
      />
      <Circle cx={x} cy={y + 0.5} r={2.2} fill={SEAL} />
    </G>
  );
}

/** Strap over the shoulder and down the back; the wing covers most of it. */
function BagStrapBack() {
  return (
    <Path
      d="M64 62 Q90 70 80 90"
      stroke={LEATHER_DARK}
      strokeWidth={4}
      strokeLinecap="round"
      fill="none"
    />
  );
}

/** The bag on the bird's side with letters peeking out, and the strap across the chest. */
function Bag({ open }: { open: boolean }) {
  // The letters stand up out of the bag; the wind pulls them higher and tilts them.
  const lift = open ? -9 : 0;
  return (
    <G>
      <Letter x={53} y={82 + lift} angle={open ? -32 : -16} />
      <Letter x={74} y={80 + lift * 1.3} angle={open ? 28 : 14} cream />
      <Letter x={63} y={78 + lift * 1.6} angle={open ? -6 : 2} />
      <Path
        d="M46 90 h34 v15 q0 7 -7 7 h-20 q-7 0 -7 -7 Z"
        fill={LEATHER}
        stroke={LEATHER_EDGE}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path d="M46 90 h34" stroke={LEATHER_EDGE} strokeWidth={3} strokeLinecap="round" />
      <Path
        d="M50 92 H76 V99 Q63 107 50 99 Z"
        fill={LEATHER_DARK}
        stroke={LEATHER_EDGE}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path
        d="M60 99 h6 v6 h-6 Z"
        fill="#E9A81E"
        stroke="#9A6A00"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <Path
        d="M51 91 Q47 76 61 64"
        stroke={LEATHER_DARK}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
    </G>
  );
}

export function Hudhud({
  size = 120,
  pose = "stand",
  mirrored = false,
  hop = true,
  bag,
  flap = false,
  style,
}: Props) {
  const [lift] = useState(() => new Animated.Value(0));
  const [wingUp, setWingUp] = useState(false);
  useEffect(() => {
    if (!flap) return;
    const beat = setInterval(() => setWingUp((up) => !up), FLAP_MS);
    return () => clearInterval(beat);
  }, [flap]);
  const raised = flap ? wingUp : pose === "cheer";
  useEffect(() => {
    if (!hop) return;
    const height = pose === "cheer" ? -12 : -6;
    const half = pose === "cheer" ? 280 : 800;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(lift, {
          toValue: height,
          duration: half,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(lift, {
          toValue: 0,
          duration: half,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [hop, pose, lift]);

  const height = Math.round((size * 130) / 140);
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ width: size, height, transform: [{ translateY: lift }] }, style]}
    >
      <Svg
        width={size}
        height={height}
        viewBox="0 0 140 130"
        style={mirrored ? { transform: [{ scaleX: -1 }] } : undefined}
      >
        <Path d="M96 82 L130 68 L132 84 L100 95 Z" fill={INK} />
        <Path d="M112 76 L115 90" stroke={STRIPE} strokeWidth={4} />
        {CREST.map((angle) => (
          <G key={angle} transform={`rotate(${angle} 52 46)`}>
            <Ellipse cx={52} cy={30} rx={5.5} ry={14} fill={HEAD} />
            <Ellipse cx={52} cy={23} rx={5.5} ry={2} fill={STRIPE} />
            <Ellipse cx={52} cy={19} rx={4.5} ry={4} fill={INK} />
          </G>
        ))}
        <Ellipse cx={74} cy={84} rx={32} ry={24} fill={BODY} />
        <Ellipse cx={58} cy={70} rx={14} ry={13} fill={HEAD} />
        {bag ? <BagStrapBack /> : null}
        {raised ? (
          <G>
            <Path d="M64 76 Q80 40 104 46 Q100 70 70 90 Z" fill={INK} />
            <Path
              d="M74 70 L86 52 M82 76 L96 58 M90 80 L100 68"
              stroke={STRIPE}
              strokeWidth={3.5}
              strokeLinecap="round"
            />
          </G>
        ) : (
          <G>
            <Path d="M62 78 Q86 64 108 80 Q92 101 64 97 Z" fill={INK} />
            <Path
              d="M72 82 L77 96 M82 78 L87 96 M92 77 L96 93"
              stroke={STRIPE}
              strokeWidth={3.5}
              strokeLinecap="round"
            />
          </G>
        )}
        {bag ? (
          <Path
            d="M66 106 L64 121 M80 106 L82 121 M58 121 L68 121 M78 121 L88 121"
            stroke={LEGS}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        ) : null}
        {bag ? <Bag open={bag === "open"} /> : null}
        <Circle cx={50} cy={56} r={17} fill={HEAD} />
        <Path
          d="M35 58 Q21 62 8 73"
          stroke={LEGS}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
        />
        {pose === "cheer" ? (
          <Path
            d="M40 52 Q44 48 48 52"
            stroke={INK}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <G>
            <Circle cx={44} cy={53} r={3.8} fill={INK} />
            <Circle cx={45.3} cy={51.8} r={1.3} fill="#FFFFFF" />
          </G>
        )}
        <Circle cx={50} cy={62} r={3.5} fill={CHEEK} opacity={0.75} />
        {bag ? null : (
          <Path
            d="M66 106 L64 121 M80 106 L82 121 M58 121 L68 121 M78 121 L88 121"
            stroke={LEGS}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        )}
      </Svg>
    </Animated.View>
  );
}
