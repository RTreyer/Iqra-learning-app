/**
 * أقرأ وأتعلم Part 1, p. 137 (6-3 مِصْيَدَةُ مُفِيدٍ): a kitchen in chaos. A grey mouse leaps
 * through the air; red bowls, a pot, a cup and spoons fall from the open cupboard;
 * broken dishes lie on the floor; a gas cooker on the left; the wooden mousetrap waits.
 */

import React from "react";
import { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";

import { WHITE, WOOD, WOOD_DARK } from "./parts";

const RED = "#D32F2F";
const RED_DARK = "#B71C1C";

function Bowl({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <G transform={`rotate(${rot} ${x} ${y})`}>
      <Path d={`M${x - 6},${y} A6,4.4 0 0 0 ${x + 6},${y} Z`} fill={RED} />
      <Ellipse cx={x} cy={y} rx={6} ry={1.4} fill={RED_DARK} />
      <Path d={`M${x - 2},${y + 4.2} L${x + 2},${y + 4.2}`} stroke={RED_DARK} strokeWidth={1} />
    </G>
  );
}

function Spoon({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <G transform={`rotate(${rot} ${x} ${y})`}>
      <Line
        x1={x}
        y1={y}
        x2={x + 9}
        y2={y}
        stroke="#9E9E9E"
        strokeWidth={1}
        strokeLinecap="round"
      />
      <Ellipse cx={x - 1.6} cy={y} rx={2.2} ry={1.4} fill="#BDBDBD" />
    </G>
  );
}

/** Short arcs that show something is falling or moving. */
function Motion({ x, y }: { x: number; y: number }) {
  return (
    <G>
      <Path
        d={`M${x},${y} q2,-3 0,-6`}
        stroke="#90A4AE"
        strokeWidth={0.7}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d={`M${x + 3},${y + 1} q2,-3 0,-6`}
        stroke="#90A4AE"
        strokeWidth={0.7}
        fill="none"
        strokeLinecap="round"
      />
    </G>
  );
}

function Cooker() {
  return (
    <G>
      <Rect
        x={6}
        y={52}
        width={36}
        height={36}
        rx={1.4}
        fill="#ECEFF1"
        stroke="#90A4AE"
        strokeWidth={0.8}
      />
      <Rect x={4} y={49.6} width={40} height={3} rx={0.8} fill="#B0BEC5" />
      <Ellipse cx={14} cy={49.4} rx={5} ry={1.3} fill="#37474F" />
      <Ellipse cx={33} cy={49.4} rx={5} ry={1.3} fill="#37474F" />
      {/* Pot on the right burner. */}
      <Rect x={26} y={40} width={14} height={9} rx={1.4} fill="#6D4C41" />
      <Ellipse cx={33} cy={40} rx={7.6} ry={1.6} fill="#8D6E63" />
      <Circle cx={33} cy={38.4} r={1.1} fill="#4E342E" />
      <Line x1={24} y1={43} x2={26} y2={43} stroke="#4E342E" strokeWidth={1.4} />
      <Line x1={40} y1={43} x2={42} y2={43} stroke="#4E342E" strokeWidth={1.4} />
      {[12, 19, 26, 33].map((x) => (
        <Circle key={x} cx={x} cy={56.5} r={1.5} fill="#546E7A" />
      ))}
      <Rect
        x={10}
        y={61}
        width={28}
        height={23}
        rx={1}
        fill="#CFD8DC"
        stroke="#90A4AE"
        strokeWidth={0.6}
      />
      <Rect x={14} y={66} width={20} height={11} rx={1} fill="#455A64" />
      <Rect x={14} y={62.6} width={20} height={1.4} rx={0.7} fill="#78909C" />
    </G>
  );
}

function Cupboard() {
  return (
    <G>
      <Rect x={96} y={4} width={54} height={38} fill={WOOD} />
      <Rect x={99} y={7} width={48} height={32} fill="#4E342E" />
      <Rect x={99} y={22} width={48} height={1.6} fill={WOOD} />
      {/* What is still on the shelves. */}
      <Path d="M103,21.8 A4,3 0 0 0 111,21.8 Z" fill={RED} />
      <Rect x={130} y={14} width={5} height={7.8} rx={0.6} fill={WHITE} />
      <Rect x={130} y={16} width={5} height={1.6} fill={RED} />
      <Ellipse cx={140} cy={37.4} rx={5} ry={1.4} fill="#ECEFF1" />
      <Path d="M114,38.8 A4,3 0 0 0 122,38.8 Z" fill={RED} />
      {/* Doors swung open. */}
      <Path d="M96,4 L85,9 L85,39 L96,42 Z" fill="#A1673A" stroke={WOOD_DARK} strokeWidth={0.6} />
      <Path
        d="M150,4 L158,8 L158,39 L150,42 Z"
        fill="#A1673A"
        stroke={WOOD_DARK}
        strokeWidth={0.6}
      />
      <Circle cx={88} cy={24} r={0.9} fill="#E0B44C" />
      <Circle cx={155.5} cy={24} r={0.9} fill="#E0B44C" />
    </G>
  );
}

function Mouse() {
  return (
    <G transform="rotate(-14 62 34)">
      <Path
        d="M70,34 Q82,24 90,31 Q95,36 101,29"
        stroke="#BCAAA4"
        strokeWidth={1.3}
        fill="none"
        strokeLinecap="round"
      />
      <Line
        x1={56}
        y1={36.5}
        x2={48}
        y2={41}
        stroke="#757575"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <Line
        x1={58}
        y1={37}
        x2={51}
        y2={42.5}
        stroke="#757575"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <Line
        x1={67}
        y1={37}
        x2={76}
        y2={42}
        stroke="#757575"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <Line
        x1={69}
        y1={36}
        x2={78}
        y2={39.5}
        stroke="#757575"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <Ellipse cx={62} cy={34} rx={9.5} ry={5.4} fill="#9E9E9E" />
      <Ellipse cx={63} cy={36} rx={6} ry={2.6} fill="#BDBDBD" />
      <Path d="M54,30 Q48,31 45.5,33.6 Q49,36 55,37 Z" fill="#9E9E9E" />
      <Circle cx={55.5} cy={28.2} r={3.4} fill="#9E9E9E" />
      <Circle cx={55.5} cy={28.2} r={2} fill="#F8BBD0" />
      <Circle cx={50.6} cy={32.2} r={0.9} fill="#212121" />
      <Circle cx={45.6} cy={33.6} r={0.9} fill="#EC407A" />
      <Line x1={46} y1={34} x2={41} y2={32.4} stroke="#616161" strokeWidth={0.3} />
      <Line x1={46} y1={34.4} x2={41} y2={35.4} stroke="#616161" strokeWidth={0.3} />
    </G>
  );
}

function Trap() {
  return (
    <G>
      <Rect
        x={54}
        y={88}
        width={26}
        height={5}
        rx={0.8}
        fill="#D7B27A"
        stroke={WOOD_DARK}
        strokeWidth={0.5}
      />
      <Path d="M58,88 L58,83.6 L75,83.6 L75,88" stroke="#9E9E9E" strokeWidth={1} fill="none" />
      <Circle cx={66.5} cy={87.4} r={1.6} fill="none" stroke="#757575" strokeWidth={0.8} />
      <Path d="M70,88 L77,88 L77,84.4 Z" fill="#FDD835" />
      <Circle cx={74.5} cy={86.6} r={0.6} fill="#F9A825" />
    </G>
  );
}

function Shards() {
  const pieces: [string, string][] = [
    ["M94,92 l4,-2 l2,3 l-3,2 Z", RED],
    ["M104,95 l3,-3 l3,2 l-1,3 Z", WHITE],
    ["M112,91 l5,0 l-2,3 Z", RED],
    ["M122,94 l3,-2 l4,1 l-2,3 Z", RED_DARK],
    ["M132,92 l4,1 l-1,3 l-4,-1 Z", WHITE],
    ["M141,95 l3,-3 l2,3 Z", RED],
  ];
  return (
    <G>
      {pieces.map(([d, fill], i) => (
        <Path key={i} d={d} fill={fill} stroke="#9E9E9E" strokeWidth={0.3} />
      ))}
    </G>
  );
}

export function Kitchen() {
  const tiles = [50, 58, 66, 74, 82];
  return (
    <G>
      <Rect x={0} y={0} width={160} height={86} fill="#E0F2F1" />
      {tiles.map((y) => (
        <Line key={y} x1={0} y1={y} x2={160} y2={y} stroke="#B2DFDB" strokeWidth={0.5} />
      ))}
      {[8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128, 136, 144, 152].map(
        (x) => (
          <Line key={x} x1={x} y1={46} x2={x} y2={86} stroke="#B2DFDB" strokeWidth={0.5} />
        ),
      )}
      <Rect x={0} y={86} width={160} height={14} fill="#A1887F" />
      {[20, 60, 100, 140].map((x) => (
        <Line key={x} x1={x} y1={86} x2={x} y2={100} stroke="#8D6E63" strokeWidth={0.5} />
      ))}
      <Cooker />
      <Cupboard />
      <Bowl x={108} y={52} rot={28} />
      <Motion x={112} y={46} />
      <Bowl x={134} y={62} rot={-34} />
      <Motion x={138} y={55} />
      <G transform="rotate(16 122 74)">
        <Rect x={115} y={70} width={14} height={9} rx={1.4} fill="#546E7A" />
        <Ellipse cx={122} cy={70} rx={7.4} ry={1.6} fill="#78909C" />
        <Line
          x1={129}
          y1={73}
          x2={134}
          y2={72}
          stroke="#37474F"
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      </G>
      <G transform="rotate(-40 98 66)">
        <Rect
          x={95}
          y={62}
          width={6}
          height={8}
          rx={0.8}
          fill={WHITE}
          stroke="#BDBDBD"
          strokeWidth={0.4}
        />
        <Rect x={95} y={64} width={6} height={1.6} fill={RED} />
      </G>
      <Spoon x={142} y={48} rot={60} />
      <Spoon x={88} y={56} rot={-20} />
      <Ellipse
        cx={148}
        cy={78}
        rx={6}
        ry={1.8}
        fill="#ECEFF1"
        stroke="#BDBDBD"
        strokeWidth={0.4}
        transform="rotate(-25 148 78)"
      />
      <Shards />
      <Mouse />
      <Trap />
    </G>
  );
}
