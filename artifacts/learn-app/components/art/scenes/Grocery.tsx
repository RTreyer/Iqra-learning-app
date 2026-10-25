/**
 * أقرأ وأتعلم Part 1, p. 125 (6-1 مُنِيرٌ وَالْقِرَاءَةُ): Luqman's grocery. The shopkeeper
 * in a white shirt with a jambiya at his belt spreads his hands behind the counter; shelves
 * of bread, packets and pots; crates of tomatoes, onions and potatoes; Munir in a yellow
 * jumper holds out his mother's note; a boy in a red cap stands on the right.
 */

import React from "react";
import { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";

import { Face, Hand, HAIR, ShortHair, WHITE, WOOD, WOOD_DARK } from "./parts";

function Crate({ x, fill, shade }: { x: number; fill: string; shade: string }) {
  const items = [0, 1, 2, 3].map((i) => x + 3 + i * 4);
  return (
    <G>
      {items.map((cx, i) => (
        <Circle key={`b${i}`} cx={cx} cy={74} r={2.6} fill={shade} />
      ))}
      {items.slice(0, 3).map((cx, i) => (
        <Circle key={`t${i}`} cx={cx + 2} cy={71.5} r={2.6} fill={fill} />
      ))}
      <Rect x={x} y={74} width={18} height={14} rx={1} fill="#B07A45" />
      {[77.5, 81.5, 85.5].map((y) => (
        <Line key={y} x1={x} y1={y} x2={x + 18} y2={y} stroke={WOOD_DARK} strokeWidth={0.6} />
      ))}
      <Rect
        x={x}
        y={74}
        width={18}
        height={14}
        rx={1}
        fill="none"
        stroke={WOOD_DARK}
        strokeWidth={0.8}
      />
    </G>
  );
}

function Shelves() {
  const loaves = [40, 50, 60];
  const packets: [number, string][] = [
    [100, "#E53935"],
    [106, "#1E88E5"],
    [112, "#FDD835"],
    [118, "#43A047"],
  ];
  return (
    <G>
      <Rect x={34} y={16} width={92} height={44} fill="#DCC7A1" />
      <Rect x={34} y={16} width={2.5} height={44} fill={WOOD_DARK} />
      <Rect x={123.5} y={16} width={2.5} height={44} fill={WOOD_DARK} />
      {[29.5, 44, 58].map((y) => (
        <Rect key={y} x={34} y={y} width={92} height={2.2} fill={WOOD_DARK} />
      ))}
      {loaves.map((cx) => (
        <G key={cx}>
          <Ellipse cx={cx} cy={26.6} rx={4.6} ry={2.8} fill="#D99A4E" />
          <Path
            d={`M${cx - 2.5},25.6 l1,1.6 M${cx},25.2 l1,1.6 M${cx + 2.5},25.6 l1,1.6`}
            stroke="#A86A2C"
            strokeWidth={0.5}
          />
        </G>
      ))}
      {packets.map(([x, fill]) => (
        <G key={x}>
          <Rect x={x} y={20.5} width={5} height={9} rx={0.6} fill={fill} />
          <Rect x={x + 0.8} y={23.5} width={3.4} height={2.6} fill={WHITE} opacity={0.85} />
        </G>
      ))}
      {[38, 45, 52, 59].map((x) => (
        <G key={x}>
          <Rect x={x} y={37} width={5} height={7} rx={0.5} fill="#B0BEC5" />
          <Rect x={x} y={39} width={5} height={2.6} fill="#EF6C00" />
        </G>
      ))}
      {[103, 115].map((cx) => (
        <G key={cx}>
          <Ellipse cx={cx} cy={40} rx={5.5} ry={4} fill="#546E7A" />
          <Rect x={cx - 5.5} y={36} width={11} height={4} fill="#546E7A" />
          <Ellipse cx={cx} cy={36} rx={5.5} ry={1.4} fill="#78909C" />
          <Circle cx={cx} cy={34.8} r={0.9} fill="#37474F" />
        </G>
      ))}
      {[40, 48, 56].map((x) => (
        <Rect
          key={x}
          x={x}
          y={50}
          width={6}
          height={8}
          rx={2}
          fill="#F5F5F5"
          stroke="#BDBDBD"
          strokeWidth={0.4}
        />
      ))}
      {[104, 112].map((x) => (
        <Rect key={x} x={x} y={49} width={7} height={9} rx={1} fill="#8D6E63" />
      ))}
    </G>
  );
}

function Shopkeeper() {
  return (
    <G>
      <Rect x={77} y={31} width={6} height={5} fill="#A86F45" />
      <Path
        d="M66,62 Q65,38 80,35 Q95,38 94,62 Z"
        fill={WHITE}
        stroke="#DADADA"
        strokeWidth={0.6}
      />
      <Path d="M76,35.5 L80,41 L84,35.5" fill="none" stroke="#DADADA" strokeWidth={0.6} />
      {/* Arms spread wide, palms up: "here is the money, read me the note". */}
      <Path
        d="M68.5,40 Q60,44 56,49"
        stroke={WHITE}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M91.5,40 Q100,44 104,49"
        stroke={WHITE}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      <Hand cx={54.5} cy={50} r={2.6} />
      <Hand cx={105.5} cy={50} r={2.6} />
      <Rect x={66} y={54} width={28} height={3.4} fill="#2E7D32" />
      {/* Jambiya: horn handle above the belt, curved sheath. */}
      <Rect
        x={78.2}
        y={49}
        width={3.6}
        height={5.4}
        rx={1}
        fill="#E8D7A9"
        stroke="#B9A06A"
        strokeWidth={0.4}
      />
      <Path
        d="M78,57.4 L82,57.4 Q83,60 86,61.5 L82,62 Q78.5,60.5 78,57.4 Z"
        fill="#B88A2E"
        stroke="#7A5A1A"
        strokeWidth={0.5}
      />
      <Face cx={80} cy={25} r={7} mood="calm" />
      <ShortHair cx={80} cy={25} r={7} />
      <Path d="M75.5,29.6 Q80,27.6 84.5,29.6 Q82,31 80,30.4 Q78,31 75.5,29.6 Z" fill={HAIR} />
    </G>
  );
}

function Counter() {
  return (
    <G>
      <Rect x={46} y={62} width={68} height={24} fill="#9C5B32" />
      <Rect x={50} y={66} width={28} height={16} fill="none" stroke="#7A4322" strokeWidth={0.8} />
      <Rect x={82} y={66} width={28} height={16} fill="none" stroke="#7A4322" strokeWidth={0.8} />
      <Rect x={44} y={59.6} width={72} height={3} rx={0.8} fill={WOOD_DARK} />
      {/* Scale on the counter. */}
      <Rect
        x={47}
        y={55}
        width={9}
        height={4.6}
        rx={0.8}
        fill="#ECEFF1"
        stroke="#90A4AE"
        strokeWidth={0.5}
      />
      <Ellipse cx={51.5} cy={54.6} rx={5} ry={1.2} fill="#B0BEC5" />
      <Circle cx={51.5} cy={57.4} r={1.2} fill="#FFFFFF" stroke="#90A4AE" strokeWidth={0.3} />
    </G>
  );
}

function Munir() {
  return (
    <G>
      <Rect x={95} y={86} width={6.5} height={10} fill="#283593" />
      <Rect x={102.5} y={86} width={6.5} height={10} fill="#283593" />
      <Ellipse cx={97.5} cy={97} rx={4} ry={1.6} fill="#212121" />
      <Ellipse cx={106.5} cy={97} rx={4} ry={1.6} fill="#212121" />
      <Path d="M93,88 Q93,62 102,60 Q111,62 111,88 Z" fill="#F2B705" />
      <Path d="M98,60.6 Q102,64 106,60.6" stroke="#D99E00" strokeWidth={1} fill="none" />
      <Path
        d="M109.5,66 Q112,76 110,84"
        stroke="#F2B705"
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      <Hand cx={110} cy={85} r={2} />
      {/* Arm held out to the shopkeeper with the note. */}
      <Path
        d="M95,65 Q92,59 91,53.5"
        stroke="#F2B705"
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      <G transform="rotate(-10 91 49)">
        <Rect
          x={86}
          y={43.5}
          width={10}
          height={11}
          fill={WHITE}
          stroke="#B0BEC5"
          strokeWidth={0.4}
        />
        {[46.5, 49, 51.5].map((y) => (
          <Line key={y} x1={87.5} y1={y} x2={94.5} y2={y} stroke="#1E88E5" strokeWidth={0.6} />
        ))}
      </G>
      <Hand cx={91} cy={53.5} r={2} />
      <Face cx={102} cy={52} r={6.5} mood="worried" />
      <ShortHair cx={102} cy={52} r={6.5} />
    </G>
  );
}

function RedCapBoy() {
  return (
    <G>
      <Rect x={142} y={86} width={5.5} height={10} fill="#5D4037" />
      <Rect x={149} y={86} width={5.5} height={10} fill="#5D4037" />
      <Ellipse cx={144.5} cy={97} rx={3.6} ry={1.4} fill="#212121" />
      <Ellipse cx={152} cy={97} rx={3.6} ry={1.4} fill="#212121" />
      <Path d="M140,88 Q140,64 148,62 Q156,64 156,88 Z" fill="#1E88E5" />
      <Path
        d="M141.5,68 Q139.5,76 141,84"
        stroke="#1E88E5"
        strokeWidth={3.6}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M154.5,68 Q156.5,76 155,84"
        stroke="#1E88E5"
        strokeWidth={3.6}
        strokeLinecap="round"
        fill="none"
      />
      <Hand cx={141} cy={85} r={1.8} />
      <Hand cx={155} cy={85} r={1.8} />
      <Face cx={148} cy={55} r={6} mood="smile" />
      <Path d="M141.6,53 Q141,45 148,44.4 Q155,45 154.4,53 Z" fill="#D32F2F" />
      <Path d="M141.6,52.6 L135.5,53.8 Q138,51.4 142,51.2 Z" fill="#B71C1C" />
      <Circle cx={148} cy={44.6} r={0.9} fill="#B71C1C" />
    </G>
  );
}

export function Grocery() {
  return (
    <G>
      <Rect x={0} y={0} width={160} height={86} fill="#EFE2C8" />
      <Rect x={0} y={84} width={160} height={16} fill="#C7A882" />
      {[20, 50, 80, 110, 140].map((x) => (
        <Line key={x} x1={x} y1={84} x2={x - 8} y2={100} stroke="#B29270" strokeWidth={0.5} />
      ))}
      <Line x1={0} y1={92} x2={160} y2={92} stroke="#B29270" strokeWidth={0.5} />
      <Rect x={48} y={2.5} width={64} height={11} rx={2} fill="#2E7D6B" />
      <SvgText x={80} y={10.6} fontSize={6.4} fontWeight="bold" fill={WHITE} textAnchor="middle">
        بَقَالَةُ لُقْمَانَ
      </SvgText>
      <Shelves />
      <Rect
        x={8}
        y={20}
        width={20}
        height={26}
        rx={1}
        fill="#B3E5FC"
        stroke={WOOD}
        strokeWidth={1.4}
      />
      <Line x1={18} y1={20} x2={18} y2={46} stroke={WOOD} strokeWidth={1} />
      <Shopkeeper />
      <Counter />
      <Crate x={2} fill="#E53935" shade="#C62828" />
      <Crate x={21} fill="#9C4F7A" shade="#7B3B60" />
      <Crate x={118} fill="#D4AE72" shade="#B98F55" />
      <Munir />
      <RedCapBoy />
    </G>
  );
}
