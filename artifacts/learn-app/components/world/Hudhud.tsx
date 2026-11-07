/**
 * Hudhud, the hoopoe who guides the child. In Surat an-Naml the hoopoe brings the news from
 * Saba, from Yemen. Flat inline SVG, two poses, a gentle hop that can be switched off.
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

export type HudhudPose = "stand" | "cheer";

type Props = {
  size?: number;
  pose?: HudhudPose;
  /** Looks to the right instead of the left (the reading direction). */
  mirrored?: boolean;
  /** A slow hop; off for still pictures. */
  hop?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Hudhud({ size = 120, pose = "stand", mirrored = false, hop = true, style }: Props) {
  const [lift] = useState(() => new Animated.Value(0));
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
        {pose === "cheer" ? (
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
        <Path
          d="M66 106 L64 121 M80 106 L82 121 M58 121 L68 121 M78 121 L88 121"
          stroke={LEGS}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}
