/**
 * Pictures for the "right or wrong behaviour" exercise (activity type behavior). A child who
 * cannot read yet must see what happens: who does what, and how the others feel about it.
 * Wide 160 × 100 pictures, drawn in the style of the story scenes. They never show the answer
 * (no tick or cross), only the deed and its effect: litter that smells, a classmate who cries.
 */

import React from "react";
import { View } from "react-native";
import { Circle, Ellipse, G, Line, Path, Rect, Svg } from "react-native-svg";

import type { BehaviorSceneId } from "@/content/types";

import { Face, ShortHair, WOOD, WOOD_DARK } from "../scenes/parts";
import { Arm, Bin, Litter, Person, SanaaHouse } from "./figures";

/** A child reading a book on the floor cushion of the majlis, smiling. */
function Reading() {
  return (
    <G>
      <Rect x={0} y={0} width={160} height={74} fill="#F3E9D2" />
      <Rect x={0} y={74} width={160} height={26} fill="#B5543F" />
      {[12, 36, 60, 84, 108, 132, 156].map((x) => (
        <Path key={x} d={`M${x - 8},87 l4,-4 l4,4 l-4,4 Z`} fill="#E9C46A" opacity={0.7} />
      ))}
      {/* Shelf with books. */}
      <Rect x={8} y={20} width={30} height={54} fill={WOOD} />
      {[26, 44, 62].map((y) => (
        <G key={y}>
          <Rect x={10} y={y - 2} width={26} height={2} fill={WOOD_DARK} />
          {["#1E88E5", "#E53935", "#43A047", "#FDD835", "#8E24AA"].map((c, i) => (
            <Rect key={c} x={11 + i * 5} y={y - 13} width={4} height={11} fill={c} />
          ))}
        </G>
      ))}
      {/* Window with a qamariya. */}
      <Rect x={122} y={20} width={24} height={26} fill="#B3E5FC" stroke={WOOD} strokeWidth={1.6} />
      <Path d="M122,20 Q134,8 146,20 Z" fill="#FFCC80" stroke={WOOD} strokeWidth={1.2} />
      {/* Floor cushion. */}
      <Rect x={46} y={62} width={68} height={16} rx={4} fill="#8E3B46" />
      <Rect x={46} y={66} width={68} height={2} fill="#E9C46A" opacity={0.8} />
      {/* The boy, sitting cross-legged. */}
      <Ellipse cx={80} cy={86} rx={17} ry={5.5} fill="#FFFFFF" stroke="#D9D4CC" strokeWidth={0.6} />
      <Path
        d="M69,86 Q68,64 80,60 Q92,64 91,86 Z"
        fill="#FFFFFF"
        stroke="#D9D4CC"
        strokeWidth={0.6}
      />
      <Rect x={78.4} y={55} width={3.2} height={6} fill="#C68A5B" />
      <Face cx={80} cy={50} r={6.5} mood="smile" />
      <ShortHair cx={80} cy={50} r={6.5} />
      <Arm from={[72, 65]} to={[67, 73]} color="#FFFFFF" />
      <Arm from={[88, 65]} to={[93, 73]} color="#FFFFFF" />
      {/* The open book in both hands. */}
      <Path d="M80,67 Q71,64 64,67 L64,79 Q71,76 80,79 Z" fill="#C62828" />
      <Path d="M80,67 Q89,64 96,67 L96,79 Q89,76 80,79 Z" fill="#C62828" />
      <Path d="M80,68 Q72,65.5 66,68 L66,77.5 Q72,75 80,77.5 Z" fill="#FFFFFF" />
      <Path d="M80,68 Q88,65.5 94,68 L94,77.5 Q88,75 80,77.5 Z" fill="#FFFFFF" />
      {[70.5, 73, 75.5].map((y) => (
        <G key={y}>
          <Line x1={68} y1={y} x2={78} y2={y + 0.6} stroke="#90A4AE" strokeWidth={0.6} />
          <Line x1={82} y1={y + 0.6} x2={92} y2={y} stroke="#90A4AE" strokeWidth={0.6} />
        </G>
      ))}
    </G>
  );
}

/** Flies and stink lines over litter. */
function Smell({ x, y }: { x: number; y: number }) {
  return (
    <G>
      {[0, 6, 12].map((dx) => (
        <Path
          key={dx}
          d={`M${x + dx},${y} q-2,-3 0,-6 q2,-3 0,-6`}
          stroke="#7CB342"
          strokeWidth={1}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      {[
        [x - 4, y - 14],
        [x + 16, y - 10],
      ].map(([fx, fy]) => (
        <G key={fx}>
          <Ellipse cx={fx - 1.2} cy={fy - 1.2} rx={1.3} ry={0.8} fill="#ECEFF1" />
          <Ellipse cx={fx + 1.2} cy={fy - 1.2} rx={1.3} ry={0.8} fill="#ECEFF1" />
          <Circle cx={fx} cy={fy} r={1.1} fill="#263238" />
        </G>
      ))}
    </G>
  );
}

/** A boy drops rubbish on the street, right next to an empty bin; the street smells. */
function Littering() {
  return (
    <G>
      <Rect x={0} y={0} width={160} height={70} fill="#CFE8F7" />
      <SanaaHouse x={4} y={14} w={34} h={56} />
      <SanaaHouse x={118} y={20} w={38} h={50} />
      <Rect x={0} y={70} width={160} height={30} fill="#CDBFA6" />
      <Rect x={0} y={70} width={160} height={3} fill="#B0A28A" />
      <Bin x={132} y={74} />
      <Person x={64} feet={94} kind="boy" mood="calm" right={[84, 64]} />
      {/* Falling from his hand onto the street. */}
      <Path
        d="M87,68 l3,-2 l3,1 l1,2.4 l-2.4,1.4 l-3.2,-0.4 Z"
        fill="#ECEFF1"
        stroke="#90A4AE"
        strokeWidth={0.5}
      />
      <Rect
        x={88}
        y={78}
        width={6}
        height={3.2}
        rx={1.4}
        fill="#1E88E5"
        transform="rotate(40 91 79.6)"
      />
      <Path d="M85,74 l2,4 M93,72 l1,4" stroke="#90A4AE" strokeWidth={0.6} strokeLinecap="round" />
      <Litter x={84} y={91} />
      <Litter x={18} y={94} />
      <Smell x={92} y={86} />
      <Smell x={26} y={89} />
    </G>
  );
}

/** A girl and her mother carry the basket home together, smiling; a heart between them. */
function HelpMother() {
  return (
    <G>
      <Rect x={0} y={0} width={160} height={70} fill="#F3E9D2" />
      <Rect x={0} y={70} width={160} height={30} fill="#E0C9A6" />
      {[20, 60, 100, 140].map((x) => (
        <Line key={x} x1={x} y1={70} x2={x - 6} y2={100} stroke="#CBB28B" strokeWidth={0.5} />
      ))}
      {/* Door of the house. */}
      <Rect x={124} y={22} width={24} height={48} fill={WOOD} />
      <Path d="M124,22 Q136,10 148,22 Z" fill="#FFCC80" stroke={WOOD_DARK} strokeWidth={1} />
      <Circle cx={143} cy={48} r={1.2} fill="#FDD835" />
      {/* The basket they carry between them. */}
      <Path d="M67,72 Q79,62 91,72" stroke="#8D6E63" strokeWidth={1.4} fill="none" />
      <Circle cx={74} cy={70} r={3} fill="#E53935" />
      <Circle cx={80} cy={69} r={3} fill="#EF5350" />
      <Path d="M84,70 l6,-6" stroke="#FB8C00" strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M76,67 q2,-6 5,-6 q-1,4 -5,6 Z" fill="#43A047" />
      <Path d="M65,71 L93,71 L89,85 L69,85 Z" fill="#C8A165" />
      {[74, 78, 82].map((y) => (
        <Line key={y} x1={66.5} y1={y} x2={91.5} y2={y} stroke="#A07C45" strokeWidth={0.8} />
      ))}
      <Person
        x={104}
        feet={94}
        s={1.25}
        kind="woman"
        mood="smile"
        left={[88, 72]}
        right={[116, 72]}
      />
      <Person x={54} feet={94} kind="girl" mood="smile" right={[70, 72]} />
      {/* A heart: they are glad. */}
      <Path
        d="M79,46 c-3,-4 -9,-1 -6,4 l6,6 l6,-6 c3,-5 -3,-8 -6,-4 Z"
        fill="#EC407A"
        opacity={0.9}
      />
    </G>
  );
}

function Sparkle({ x, y, r = 3 }: { x: number; y: number; r?: number }) {
  return (
    <Path
      d={`M${x},${y - r} Q${x + r * 0.2},${y - r * 0.2} ${x + r},${y} Q${x + r * 0.2},${y + r * 0.2} ${x},${y + r} Q${x - r * 0.2},${y + r * 0.2} ${x - r},${y} Q${x - r * 0.2},${y - r * 0.2} ${x},${y - r} Z`}
      fill="#FFD54F"
    />
  );
}

/** In the school yard a boy throws paper into the bin and a girl sweeps; the yard shines. */
function CleanSchool() {
  return (
    <G>
      <Rect x={0} y={0} width={160} height={66} fill="#CFE8F7" />
      {/* The school, with the flag of Yemen. */}
      <SanaaHouse x={18} y={20} w={124} h={46} />
      <Rect x={70} y={44} width={20} height={22} fill="#5D4037" />
      <Path d="M70,44 Q80,36 90,44 Z" fill="#FFCC80" />
      <Line x1={80} y1={20} x2={80} y2={4} stroke="#757575" strokeWidth={1} />
      <Rect x={80.5} y={4} width={12} height={2.4} fill="#CE1126" />
      <Rect x={80.5} y={6.4} width={12} height={2.4} fill="#FFFFFF" />
      <Rect x={80.5} y={8.8} width={12} height={2.4} fill="#000000" />
      <Rect x={0} y={66} width={160} height={34} fill="#E8D9B5" />
      <Bin x={94} y={76} open />
      {/* The paper on its way into the bin. */}
      <Path
        d="M91,66 l3,-2 l3,1 l1,2.4 l-2.4,1.4 l-3.2,-0.4 Z"
        fill="#ECEFF1"
        stroke="#90A4AE"
        strokeWidth={0.5}
      />
      <Path d="M94,70 l0,3" stroke="#90A4AE" strokeWidth={0.6} strokeLinecap="round" />
      <Person x={66} feet={95} kind="boy" mood="smile" right={[86, 64]} />
      {/* A girl sweeps with a palm broom. */}
      <Line x1={124} y1={70} x2={136} y2={92} stroke="#8D6E63" strokeWidth={1.4} />
      <Path d="M133,90 L141,90 L144,96 L130,96 Z" fill="#C9A16B" />
      <Person
        x={124}
        feet={95}
        kind="girl"
        color="#00897B"
        mood="smile"
        left={[124, 74]}
        right={[131, 82]}
      />
      <Sparkle x={30} y={84} />
      <Sparkle x={48} y={92} r={2.4} />
      <Sparkle x={108} y={90} r={2.6} />
      <Sparkle x={150} y={82} r={2.2} />
    </G>
  );
}

function Desk({ x, w }: { x: number; w: number }) {
  return (
    <G>
      <Rect x={x} y={72} width={w} height={3} rx={0.8} fill={WOOD} />
      <Rect x={x + 1.5} y={75} width={w - 3} height={12} fill="#A1673A" />
      <Line x1={x + 3} y1={87} x2={x + 3} y2={96} stroke={WOOD_DARK} strokeWidth={1.4} />
      <Line x1={x + w - 3} y1={87} x2={x + w - 3} y2={96} stroke={WOOD_DARK} strokeWidth={1.4} />
    </G>
  );
}

/** A boy grabs his classmate's pen from his desk; the classmate cries. */
function TakePen() {
  return (
    <G>
      <Rect x={0} y={0} width={160} height={76} fill="#F3E9D2" />
      <Rect x={0} y={76} width={160} height={24} fill="#D7CCC8" />
      <Rect
        x={50}
        y={8}
        width={60}
        height={22}
        rx={1}
        fill="#2E5E4E"
        stroke={WOOD}
        strokeWidth={1.6}
      />
      <Person x={58} feet={100} kind="boy" mood="calm" left={[50, 70]} right={[96, 69]} />
      <Person x={118} feet={100} kind="boy" mood="cry" left={[108, 54]} right={[128, 54]} />
      <Desk x={38} w={40} />
      <Desk x={92} w={52} />
      {/* The classmate's pencil case and the pen the boy takes. */}
      <Rect x={118} y={68} width={16} height={5} rx={2} fill="#F06292" />
      <Rect x={121} y={66.6} width={10} height={1.6} fill="#FDD835" />
      <G transform="rotate(-20 98 69)">
        <Rect x={92} y={67.6} width={12} height={2.6} fill="#1E88E5" />
        <Path d="M104,67.6 L107,68.9 L104,70.2 Z" fill="#263238" />
      </G>
      {/* The classmate's raised hands: "my pen!". */}
      <Path
        d="M104,47 l-3,-3 M131,47 l3,-3"
        stroke="#3B2A20"
        strokeWidth={0.8}
        strokeLinecap="round"
      />
    </G>
  );
}

const SCENES: Record<BehaviorSceneId, () => React.JSX.Element> = {
  reading: Reading,
  littering: Littering,
  helpmother: HelpMother,
  cleanschool: CleanSchool,
  takepen: TakePen,
};

/** Fills the width of its parent at 16:10. */
export function BehaviorScene({ id }: { id: BehaviorSceneId }) {
  const Drawing = SCENES[id];
  return (
    <View testID={`behavior-scene-${id}`} style={{ width: "100%", aspectRatio: 1.6 }}>
      <Svg width="100%" height="100%" viewBox="0 0 160 100">
        <Drawing />
      </Svg>
    </View>
  );
}
