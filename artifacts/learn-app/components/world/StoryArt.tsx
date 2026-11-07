/**
 * Drawings for chapter 1 of Hudhud's story (StoryScenes.tsx): Rasha as a whole figure, her
 * water jug, the sun, the mountains around Sana'a, dry summer earth, the night sky, and the
 * pick-up her family leaves with (bundles and rolled mattresses, as families move in Yemen).
 * Flat inline SVG, like the rest of the app's world.
 */

import React from "react";
import { Animated } from "react-native";
import { Circle, Ellipse, G, Path, Rect, Svg } from "react-native-svg";

import { CLAY, CLAY_DARK } from "./Bowl";
import { key, useCycle } from "./motion";

const SKIN = "#C68B5E";
const DRESS = "#E7558A";
const GOLD = "#F4C14B";

export type RashaPose = "stand" | "reach" | "wave";

/**
 * Rasha, a girl of about eight: white headscarf, long pink dress with gold embroidery.
 * "reach" holds her hands out to the right (the jug is drawn on its own), "wave" lifts one hand.
 */
export function Rasha({
  size = 140,
  pose = "stand",
  sad = false,
  ownArm = false,
  dress = DRESS,
  walking = false,
}: {
  size?: number;
  pose?: RashaPose;
  /** The dress colour: another girl wears another colour. */
  dress?: string;
  /** Brows raised in the middle, the mouth turned down, a tear. */
  sad?: boolean;
  /** "wave" without its raised arm: RashaArm draws it, so the arm can move. */
  ownArm?: boolean;
  /** Walks: bobs and sways with every step. */
  walking?: boolean;
}) {
  // Like a cartoon: she breathes, blinks now and then, and bobs as she walks.
  const breath = useCycle(!walking, 2600);
  const step = useCycle(walking, 520);
  const blink = useCycle(true, 3900, 1500);
  const lid = key(blink, [0, 0.9, 0.93, 0.97, 1], [0, 0, 1, 0, 0]);
  const width = (size * 70) / 130;
  const eyelid = (x: number) => (
    <Animated.View
      style={{
        position: "absolute",
        left: ((x - 2.2) * size) / 130,
        top: (26.6 * size) / 130,
        width: (4.4 * size) / 130,
        height: (4.6 * size) / 130,
        borderRadius: size,
        backgroundColor: SKIN,
        transformOrigin: "50% 0%",
        transform: [{ scaleY: lid }],
      }}
    />
  );
  const sleeve = { stroke: dress, strokeWidth: 7, strokeLinecap: "round" as const, fill: "none" };
  return (
    <Animated.View
      style={{
        width,
        height: size,
        transformOrigin: "50% 100%",
        transform: walking
          ? [
              { translateY: key(step, [0, 0.25, 0.5, 0.75, 1], [0, -3, 0, -3, 0]) },
              { rotate: key(step, [0, 0.5, 1], ["-3deg", "3deg", "-3deg"]) },
            ]
          : [{ scaleY: key(breath, [0, 0.5, 1], [1, 1.015, 1]) }],
      }}
    >
      <Svg width={width} height={size} viewBox="0 0 70 130">
        <Ellipse cx={27} cy={125} rx={6} ry={3} fill="#4A2C20" />
        <Ellipse cx={43} cy={125} rx={6} ry={3} fill="#4A2C20" />
        <Path d="M24 50 Q35 45 46 50 L56 122 Q35 128 14 122 Z" fill={dress} />
        <Path d="M15 117 Q35 123 55 117" stroke={GOLD} strokeWidth={3} fill="none" />
        <Path d="M30 60 L35 66 L40 60" stroke={GOLD} strokeWidth={2} fill="none" />
        {/* Arms: the far one first, so the near one is in front. */}
        {pose === "reach" ? (
          <>
            <Path d="M24 56 Q40 72 60 70" {...sleeve} />
            <Circle cx={62} cy={70} r={3.6} fill={SKIN} />
            <Path d="M46 54 Q56 60 63 62" {...sleeve} />
            <Circle cx={65} cy={62} r={3.6} fill={SKIN} />
          </>
        ) : (
          <>
            <Path d="M24 54 Q18 70 20 84" {...sleeve} />
            <Circle cx={20} cy={87} r={3.6} fill={SKIN} />
            {pose === "wave" ? (
              ownArm ? null : (
                <WaveArm />
              )
            ) : (
              <>
                <Path d="M46 54 Q52 70 50 84" {...sleeve} />
                <Circle cx={50} cy={87} r={3.6} fill={SKIN} />
              </>
            )}
          </>
        )}
        <Path
          d="M20 34 Q19 12 35 10 Q51 12 50 34 Q50 50 46 54 Q35 58 24 54 Q20 50 20 34 Z"
          fill="#FFFFFF"
          stroke="#E2DCD3"
          strokeWidth={1}
        />
        <Circle cx={35} cy={30} r={11} fill={SKIN} />
        <Circle cx={31} cy={29} r={1.5} fill="#2B1D16" />
        <Circle cx={39} cy={29} r={1.5} fill="#2B1D16" />
        <Circle cx={28} cy={33} r={1.8} fill="#E58B7B" opacity={0.6} />
        <Circle cx={42} cy={33} r={1.8} fill="#E58B7B" opacity={0.6} />
        {sad ? (
          <>
            <Path d="M28 26 L33 24.2 M42 26 L37 24.2" stroke="#2B1D16" strokeWidth={1.1} />
            <Path d="M30.5 32 Q28.6 36 30.5 37.6 Q32.4 36 30.5 32 Z" fill="#7FB8E8" />
          </>
        ) : null}
        <Path
          d={sad ? "M31 36 Q35 33 39 36" : "M31 34 Q35 37.5 39 34"}
          stroke="#7A3418"
          strokeWidth={1.4}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
      {sad ? null : (
        <>
          {eyelid(31)}
          {eyelid(39)}
        </>
      )}
    </Animated.View>
  );
}

/** Rasha's raised arm, in her own coordinates. */
function WaveArm() {
  return (
    <>
      <Path
        d="M46 54 Q57 44 58 30"
        stroke={DRESS}
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={58} cy={26} r={4} fill={SKIN} />
    </>
  );
}

/**
 * Rasha's waving arm on its own, for `<Rasha pose="wave" ownArm />` at the same size. Its box
 * is centred on her shoulder, so turning it (an Animated.View) swings the arm from the shoulder:
 * place its centre at RASHA_SHOULDER × size / 130 from her top left.
 */
export function RashaArm({ size = 140 }: { size?: number }) {
  const box = (72 * size) / 130;
  return (
    <Svg width={box} height={box} viewBox="10 18 72 72">
      <WaveArm />
    </Svg>
  );
}

/** Where her shoulder is in Rasha's drawing (x, y of 70 × 130). */
export const RASHA_SHOULDER = { x: 46, y: 54 };

/** A clay water jug with a spout on the right; tilted, it pours. */
export function JugArt({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Path d="M14 20 Q2 22 8 34" stroke={CLAY_DARK} strokeWidth={3} fill="none" />
      <Path d="M36 22 L48 14 L46 20 L38 29 Z" fill={CLAY} />
      <Path d="M15 17 Q4 30 12 44 Q25 50 38 44 Q46 30 35 17 Z" fill={CLAY} />
      <Rect x={18} y={8} width={14} height={11} fill={CLAY} />
      <Ellipse cx={25} cy={8} rx={9} ry={3} fill={CLAY_DARK} />
      <Path d="M10 32 Q25 37 40 32" stroke="#F3DCC7" strokeWidth={2} fill="none" />
      <Path d="M14 24 Q12 32 16 40" stroke="#D9805A" strokeWidth={2.5} fill="none" opacity={0.7} />
    </Svg>
  );
}

/** The sun with its rays; `hot` makes it larger and paler, the summer sun. */
export function SunArt({ size = 120, hot = false }: { size?: number; hot?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 130 130">
      {Array.from({ length: 12 }, (_, i) => (
        <Rect
          key={i}
          x={62}
          y={hot ? 0 : 4}
          width={6}
          height={hot ? 26 : 20}
          rx={3}
          fill={hot ? "#FFF3C4" : GOLD}
          opacity={0.75}
          transform={`rotate(${i * 30} 65 65)`}
        />
      ))}
      <Circle cx={65} cy={65} r={hot ? 38 : 34} fill={hot ? "#FFE08A" : "#F6B73C"} />
      <Circle cx={65} cy={65} r={hot ? 30 : 26} fill={hot ? "#FFF6D6" : "#FBD46E"} />
    </Svg>
  );
}

/** The mountains around Sana'a, pale in the distance (fills its box). */
export function HillsArt({ color = "#E9CFA9" }: { color?: string }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 360 140" preserveAspectRatio="none">
      <Path
        d="M0 90 L36 62 L70 78 L118 30 L160 64 L200 40 L246 76 L292 50 L336 72 L360 60 L360 140 L0 140 Z"
        fill={color}
      />
      <Path d="M108 40 L118 30 L128 40 L122 44 L114 42 Z" fill="#FFFFFF" opacity={0.5} />
    </Svg>
  );
}

/** Dry, cracked summer earth with a wilted plant (fills its box). */
export function DryGroundArt() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 360 100" preserveAspectRatio="none">
      <Rect x={0} y={0} width={360} height={100} fill="#D9A86A" />
      <Path
        d="M20 30 L50 44 L44 70 M50 44 L86 38 M130 20 L150 52 L132 80 M150 52 L190 60 L210 40 M250 26 L262 58 L300 66 M262 58 L246 88 M310 30 L340 48"
        stroke="#A9733C"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
      <Path d="M0 0 L360 0" stroke="#C99256" strokeWidth={4} />
    </Svg>
  );
}

/** A plant that dried in the heat. */
export function WiltedPlantArt({ size = 60 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      <Path d="M30 58 Q30 36 34 22 Q36 16 42 18" stroke="#8C6A3A" strokeWidth={3} fill="none" />
      <Path d="M31 44 Q20 42 16 52" stroke="#9C7A44" strokeWidth={3} fill="none" />
      <Path d="M42 18 Q48 22 46 32" stroke="#9C7A44" strokeWidth={3} fill="none" />
      <Ellipse cx={30} cy={58} rx={12} ry={3} fill="#A9733C" />
    </Svg>
  );
}

/** Stars and a crescent moon for the night sky (fills its box). */
export function NightSkyArt() {
  const stars: [number, number, number][] = [
    [30, 30, 2],
    [80, 60, 1.5],
    [140, 24, 2.2],
    [200, 50, 1.6],
    [250, 20, 2],
    [320, 44, 1.8],
    [170, 90, 1.4],
  ];
  return (
    <Svg width="100%" height="100%" viewBox="0 0 360 140" preserveAspectRatio="none">
      {stars.map(([x, y, r]) => (
        <Circle key={x} cx={x} cy={y} r={r} fill="#FFF6D6" />
      ))}
      {/* A crescent of its own, so it sits on any evening sky. */}
      <Path d="M290 54 A16 16 0 0 0 290 86 A9 16 0 0 1 290 54 Z" fill="#FFF1C2" />
    </Svg>
  );
}

/**
 * The family's pick-up, facing left (it drives away to the left): rolled mattresses, a bundle
 * and a water can tied on the back.
 */
export function TruckArt({
  width = 200,
  layer = "all",
}: {
  width?: number;
  /** Draw only the load or only the truck, to put someone between them. */
  layer?: "all" | "load" | "body";
}) {
  const load = layer !== "body";
  const body = layer !== "load";
  return (
    <Svg width={width} height={(width * 90) / 170} viewBox="0 0 170 90">
      {load ? <TruckLoad /> : null}
      {body ? <TruckBody /> : null}
    </Svg>
  );
}

function TruckLoad() {
  return (
    <>
      <Rect x={68} y={26} width={36} height={18} rx={9} fill="#3E7CB1" />
      <Path d="M80 26 L80 44 M92 26 L92 44" stroke="#2C5E8A" strokeWidth={2} />
      <Rect x={98} y={18} width={34} height={26} rx={11} fill="#E9A81E" />
      <Path d="M108 18 L108 44 M120 18 L120 44" stroke="#C98B12" strokeWidth={2} />
      <Circle cx={146} cy={32} r={13} fill="#C8402F" />
      <Path d="M141 20 L146 14 L151 20" stroke="#8E2A1F" strokeWidth={3} fill="none" />
      <Path d="M64 34 L160 40" stroke="#6B4A2E" strokeWidth={1.5} />
    </>
  );
}

function TruckBody() {
  return (
    <>
      <Rect
        x={60}
        y={44}
        width={102}
        height={22}
        fill="#E9E4DA"
        stroke="#B9B2A6"
        strokeWidth={1.5}
      />
      <Path
        d="M8 66 L8 46 Q10 40 18 38 L28 22 Q30 18 36 18 L60 18 L60 66 Z"
        fill="#F2EEE6"
        stroke="#B9B2A6"
        strokeWidth={1.5}
      />
      <Path d="M32 24 L55 24 L55 39 L24 39 Z" fill="#9CC3E0" />
      <Rect x={4} y={54} width={8} height={7} rx={2} fill={GOLD} />
      <Rect x={6} y={62} width={158} height={6} fill="#8A8378" />
      {[36, 136].map((x) => (
        <G key={x}>
          <Circle cx={x} cy={70} r={12} fill="#2B2B2B" />
          <Circle cx={x} cy={70} r={5} fill="#C9C9C9" />
        </G>
      ))}
    </>
  );
}
