/**
 * Hudhud, the hoopoe who guides the child. In Surat an-Naml the hoopoe brings the news from
 * Saba, from Yemen. Flat inline SVG in moving parts, three poses (standing, cheering, sad), a
 * gentle hop that can be switched off. In his
 * story he is the postman of Yemen and wears a leather mail bag across his chest, letters
 * peeking out of it.
 */

import React, { useEffect, useState } from "react";
import { Animated, View, type StyleProp, type ViewStyle } from "react-native";
import { Circle, Ellipse, G, Path, Svg } from "react-native-svg";
import { key, useCycle } from "./motion";

const BODY = "#DD8C44";
const HEAD = "#E8A05A";
const INK = "#2B1D14";
const STRIPE = "#FFF6E8";
const LEGS = "#3A2A20";
const CHEEK = "#F2A98A";
const TEAR = "#7FB8E8";

const CREST = [-50, -25, 0, 25, 50];
/** Laid back along the neck: how a hoopoe carries its crest when it is low. */
const CREST_DOWN = [58, 68, 78, 88, 98];
/** The bowed head turns about the neck. */
const BOW = "rotate(-20 62 66)";
const LEATHER = "#9A5B2C";
const LEATHER_DARK = "#74401C";
const LEATHER_EDGE = "#4E2A12";
const PAPER = "#FFFFFF";
const PAPER_CREAM = "#FFF1CF";
const PAPER_EDGE = "#B9A58E";
const SEAL = "#C8402F";
/** Wing beats per second while flying. */
const FLAP_MS = 180;

/** "sad": crest laid back, head bowed, eyes half shut, a tear (the night he waits in vain). */
export type HudhudPose = "stand" | "cheer" | "sad";

type Props = {
  size?: number;
  pose?: HudhudPose;
  /** Looks to the right instead of the left (the reading direction). */
  mirrored?: boolean;
  /** A slow hop; off for still pictures. */
  hop?: boolean;
  /**
   * The postman's mail bag, with this many letters (0 to 3) peeking out over its rim. Leave it
   * out for no bag. After the storm in his story the bag is empty (0).
   */
  bag?: number;
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

/** Where the letters stand in the bag; the last one listed is taken first by the wind. */
const IN_BAG = [
  { x: 64, y: 85, angle: 1, cream: false },
  { x: 73, y: 87, angle: 10, cream: true },
  { x: 55, y: 87, angle: -9, cream: false },
];

/**
 * The bag on the bird's side, with the strap across the chest. The letters only peek over the
 * rim (a third of each shows), so they never reach up into the bird.
 */
function Bag({ letters }: { letters: number }) {
  return (
    <G>
      {IN_BAG.slice(0, Math.max(0, Math.min(IN_BAG.length, letters))).map((l) => (
        <Letter key={l.x} x={l.x} y={l.y} angle={l.angle} cream={l.cream} />
      ))}
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

/**
 * Whether Hudhud is telling something right now (the story's voice is speaking): his beak moves.
 * The story (app/intro.tsx) provides it; elsewhere he is quiet.
 */
export const HudhudTalking = React.createContext(false);

/** Where the parts turn, as a share of the 140 × 130 drawing: the neck, the beak's root. */
const NECK = "41% 52%";
const BEAK_ROOT = "25% 45%";

/**
 * Hudhud is drawn in parts, like a cartoon character: body and tail, the wing, the bag, the
 * head with crest, eye and beak, the legs. The parts move on their own:
 * - he hops with squash and stretch (crouch, stretch up, land and squash, settle);
 * - his head nods and tilts now and then, his eye blinks;
 * - while the story's voice speaks, his beak opens and closes;
 * - flying, the wing beats.
 */
export function Hudhud({
  size = 120,
  pose = "stand",
  mirrored = false,
  hop = true,
  bag,
  flap = false,
  style,
}: Props) {
  const talking = React.useContext(HudhudTalking);
  const [wingUp, setWingUp] = useState(false);
  useEffect(() => {
    if (!flap) return;
    const beat = setInterval(() => setWingUp((up) => !up), FLAP_MS);
    return () => clearInterval(beat);
  }, [flap]);
  const raised = flap ? wingUp : pose === "cheer";
  const cheer = pose === "cheer";
  // One hop: crouch, take off stretched, land squashed, settle, rest.
  const hopCycle = useCycle(hop, cheer ? 760 : 2200);
  const height = Math.round((size * 130) / 140);
  const lift = cheer ? -14 : -6;
  const bounce = {
    transformOrigin: "50% 100%",
    transform: [
      { translateY: key(hopCycle, [0, 0.12, 0.3, 0.48, 0.56, 0.66, 1], [0, 0, lift, 0, 0, 0, 0]) },
      {
        scaleX: key(hopCycle, [0, 0.1, 0.18, 0.48, 0.54, 0.64, 1], [1, 1.07, 0.95, 1, 1.08, 1, 1]),
      },
      { scaleY: key(hopCycle, [0, 0.1, 0.18, 0.48, 0.54, 0.64, 1], [1, 0.92, 1.07, 1, 0.9, 1, 1]) },
    ],
  };
  // The head: now a little nod (as if pecking at a thought), then a curious tilt.
  const still = pose === "sad";
  const look = useCycle(!still, 5200, 600);
  const head = {
    transformOrigin: NECK,
    transform: [
      {
        rotate: key(
          look,
          [0, 0.18, 0.24, 0.3, 0.36, 0.6, 0.68, 0.84, 0.92, 1],
          ["0deg", "0deg", "-7deg", "0deg", "-4deg", "0deg", "6deg", "6deg", "0deg", "0deg"],
        ),
      },
    ],
  };
  // The eye blinks (an eyelid closes over it for a moment), only while it is open.
  const blink = useCycle(pose === "stand", 3400, 900);
  const lid = key(blink, [0, 0.9, 0.93, 0.97, 1], [0, 0, 1, 0, 0]);
  // The lower beak opens and closes while he talks.
  const chatter = useCycle(talking, 260);
  const jaw = {
    transformOrigin: BEAK_ROOT,
    transform: [{ rotate: key(chatter, [0, 0.5, 1], ["0deg", "-11deg", "0deg"]) }],
  };
  const layer = { position: "absolute" as const, top: 0, left: 0, width: size, height };
  const svg = (children: React.ReactNode) => (
    <Svg width={size} height={height} viewBox="0 0 140 130">
      {children}
    </Svg>
  );
  const legs = (
    <Path
      d="M66 106 L64 121 M80 106 L82 121 M58 121 L68 121 M78 121 L88 121"
      stroke={LEGS}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
  );

  return (
    <Animated.View pointerEvents="none" style={[{ width: size, height }, bounce, style]}>
      <Animated.View style={[layer, mirrored ? { transform: [{ scaleX: -1 }] } : null]}>
        {/* Tail, body, neck and the strap's back: they move with the whole bird. */}
        <View style={layer}>
          {svg(
            <>
              <Path d="M96 82 L130 68 L132 84 L100 95 Z" fill={INK} />
              <Path d="M112 76 L115 90" stroke={STRIPE} strokeWidth={4} />
              <Ellipse cx={74} cy={84} rx={32} ry={24} fill={BODY} />
              <Ellipse cx={58} cy={70} rx={14} ry={13} fill={HEAD} />
              {bag !== undefined ? <BagStrapBack /> : null}
            </>,
          )}
        </View>
        {/* The wing: folded, or raised (cheering, and every other beat when flying). */}
        <View style={layer}>
          {svg(
            raised ? (
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
            ),
          )}
        </View>
        {bag !== undefined ? (
          <View style={layer}>
            {svg(
              <>
                {legs}
                <Bag letters={bag} />
              </>,
            )}
          </View>
        ) : null}
        {/* The head with its crest, eye and beak turns about the neck. */}
        <Animated.View style={[layer, head]}>
          {svg(
            <G transform={pose === "sad" ? BOW : undefined}>
              {(pose === "sad" ? CREST_DOWN : CREST).map((angle) => (
                <G key={angle} transform={`rotate(${angle} 52 46)`}>
                  <Ellipse cx={52} cy={30} rx={5.5} ry={14} fill={HEAD} />
                  <Ellipse cx={52} cy={23} rx={5.5} ry={2} fill={STRIPE} />
                  <Ellipse cx={52} cy={19} rx={4.5} ry={4} fill={INK} />
                </G>
              ))}
              <Circle cx={50} cy={56} r={17} fill={HEAD} />
              {/* The upper beak; the lower one is its own part, to open while talking. */}
              <Path
                d="M35 57.5 Q21 61 8 72"
                stroke={LEGS}
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
              />
              {pose === "sad" ? (
                <G>
                  <Path
                    d="M39 54 Q44 57.5 49 54"
                    stroke={INK}
                    strokeWidth={3}
                    strokeLinecap="round"
                    fill="none"
                  />
                  <Path d="M38 47 L47 49.5" stroke={INK} strokeWidth={2} strokeLinecap="round" />
                  <Path d="M43 59 Q40.5 64 43 66 Q45.5 64 43 59 Z" fill={TEAR} />
                </G>
              ) : cheer ? (
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
            </G>,
          )}
          {pose === "stand" ? (
            // The eyelid, in the head's colour, closes over the eye for a blink.
            <Animated.View
              style={{
                position: "absolute",
                left: (39.5 * size) / 140,
                top: (48.6 * height) / 130,
                width: (9 * size) / 140,
                height: (9 * height) / 130,
                borderRadius: size,
                backgroundColor: HEAD,
                transformOrigin: "50% 0%",
                transform: [{ scaleY: lid }],
              }}
            />
          ) : null}
          <Animated.View style={[layer, jaw]}>
            {svg(
              <G transform={pose === "sad" ? BOW : undefined}>
                <Path
                  d="M35 60 Q22 64 9 74"
                  stroke={LEGS}
                  strokeWidth={2.6}
                  strokeLinecap="round"
                  fill="none"
                />
              </G>,
            )}
          </Animated.View>
        </Animated.View>
        {bag !== undefined ? null : <View style={layer}>{svg(legs)}</View>}
      </Animated.View>
    </Animated.View>
  );
}
