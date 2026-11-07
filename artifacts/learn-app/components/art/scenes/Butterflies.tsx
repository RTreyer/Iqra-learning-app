/**
 * أقرأ وأتعلم Part 1, p. 169 (8-1 رَشِيدَةُ وَالْفَرَاشَاتُ): Rashida, in a white headscarf and a
 * light blue school dress, sits smiling on the grass under a big tree with a butterfly on
 * her hand; colourful butterflies around her, a pink school bag beside her, red flowers.
 * Behind: the school with the Yemeni flag, a domed building, a brick house, brown hills.
 */

import React from "react";
import { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";

import { Face, Hand, Headscarf, INK, WHITE, WOOD, WOOD_DARK } from "./parts";

const DRESS = "#81D4FA";
const DRESS_SHADE = "#4FC3F7";

/** A butterfly seen from above, wings open, turned by `rot` degrees. */
function Butterfly({
  x,
  y,
  fill,
  spot,
  s = 1,
  rot = 0,
}: {
  x: number;
  y: number;
  fill: string;
  spot: string;
  s?: number;
  rot?: number;
}) {
  return (
    <G transform={`rotate(${rot} ${x} ${y})`}>
      <Ellipse cx={x - 1.7 * s} cy={y - 1 * s} rx={1.9 * s} ry={1.5 * s} fill={fill} />
      <Ellipse cx={x + 1.7 * s} cy={y - 1 * s} rx={1.9 * s} ry={1.5 * s} fill={fill} />
      <Ellipse cx={x - 1.3 * s} cy={y + 1.2 * s} rx={1.2 * s} ry={1 * s} fill={spot} />
      <Ellipse cx={x + 1.3 * s} cy={y + 1.2 * s} rx={1.2 * s} ry={1 * s} fill={spot} />
      <Circle cx={x - 1.9 * s} cy={y - 1.1 * s} r={0.5 * s} fill={WHITE} opacity={0.8} />
      <Circle cx={x + 1.9 * s} cy={y - 1.1 * s} r={0.5 * s} fill={WHITE} opacity={0.8} />
      <Line
        x1={x}
        y1={y - 1.6 * s}
        x2={x}
        y2={y + 2 * s}
        stroke={INK}
        strokeWidth={0.6 * s}
        strokeLinecap="round"
      />
      <Path
        d={`M${x},${y - 1.6 * s} q-0.6,-1.4 -1.4,-1.8 M${x},${y - 1.6 * s} q0.6,-1.4 1.4,-1.8`}
        stroke={INK}
        strokeWidth={0.3 * s}
        fill="none"
      />
    </G>
  );
}

function Flower({ x, y }: { x: number; y: number }) {
  return (
    <G>
      <Line x1={x} y1={y} x2={x} y2={y + 5} stroke="#558B2F" strokeWidth={0.6} />
      {[0, 72, 144, 216, 288].map((a) => (
        <Circle
          key={a}
          cx={x + 1.3 * Math.cos((a * Math.PI) / 180)}
          cy={y + 1.3 * Math.sin((a * Math.PI) / 180)}
          r={1}
          fill="#E53935"
        />
      ))}
      <Circle cx={x} cy={y} r={0.7} fill="#FDD835" />
    </G>
  );
}

function School() {
  return (
    <G>
      <Rect x={4} y={38} width={40} height={22} fill="#FFF3E0" stroke="#D7CCC8" strokeWidth={0.5} />
      <Rect x={2} y={35} width={44} height={3.4} fill="#BCAAA4" />
      {[8, 17, 26, 35].map((x) => (
        <Rect
          key={x}
          x={x}
          y={42}
          width={5}
          height={6}
          fill="#4FC3F7"
          stroke={WHITE}
          strokeWidth={0.6}
        />
      ))}
      <Path d="M21,60 L21,52 Q24,49 27,52 L27,60 Z" fill={WOOD} />
      {/* The Yemeni flag: red, white, black. */}
      <Line x1={48} y1={18} x2={48} y2={60} stroke="#9E9E9E" strokeWidth={0.8} />
      <Rect x={48.4} y={19} width={11} height={2.4} fill="#CE1126" />
      <Rect x={48.4} y={21.4} width={11} height={2.4} fill={WHITE} />
      <Rect x={48.4} y={23.8} width={11} height={2.4} fill="#000000" />
    </G>
  );
}

function DomedBuilding() {
  return (
    <G>
      <Rect
        x={54}
        y={46}
        width={14}
        height={14}
        fill="#F5F5F5"
        stroke="#D7CCC8"
        strokeWidth={0.5}
      />
      <Path d="M54.6,46 A6.4,6.4 0 0 1 67.4,46 Z" fill="#E0E0E0" />
      <Line x1={61} y1={39.6} x2={61} y2={37} stroke="#B8860B" strokeWidth={0.5} />
      <Path d="M59.4,60 L59.4,53 Q61,51 62.6,53 L62.6,60 Z" fill="#8D6E63" />
    </G>
  );
}

function BrickHouse() {
  return (
    <G>
      <Rect x={71} y={42} width={16} height={18} fill="#B5653F" />
      {[46, 50, 54].map((y) => (
        <Line key={y} x1={71} y1={y} x2={87} y2={y} stroke="#9A5233" strokeWidth={0.3} />
      ))}
      <Rect x={70} y={41} width={18} height={1.6} fill={WHITE} />
      <Rect x={74} y={46} width={4} height={5} fill={WHITE} />
      <Rect x={74.6} y={46.6} width={2.8} height={3.8} fill="#5D4037" />
      <Rect x={80} y={46} width={4} height={5} fill={WHITE} />
      <Rect x={80.6} y={46.6} width={2.8} height={3.8} fill="#5D4037" />
    </G>
  );
}

function Tree() {
  return (
    <G>
      <Path d="M126,92 Q130,70 128,40 L136,40 Q134,70 140,92 Z" fill={WOOD} />
      <Path
        d="M130,56 Q120,48 110,44"
        stroke={WOOD}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M131,70 L131,84 M135,60 L134,76" stroke={WOOD_DARK} strokeWidth={0.6} />
      <Circle cx={132} cy={26} r={20} fill="#388E3C" />
      <Circle cx={114} cy={34} r={13} fill="#43A047" />
      <Circle cx={150} cy={34} r={14} fill="#2E7D32" />
      <Circle cx={124} cy={12} r={12} fill="#4CAF50" />
      <Circle cx={146} cy={12} r={12} fill="#43A047" />
      <Circle cx={104} cy={42} r={8} fill="#4CAF50" />
    </G>
  );
}

function SchoolBag() {
  return (
    <G>
      <Rect x={112} y={78} width={11} height={10} rx={2} fill="#F06292" />
      <Path
        d="M112,81 Q117.5,84 123,81 L123,79.6 Q123,78 121,78 L114,78 Q112,78 112,79.6 Z"
        fill="#EC407A"
      />
      <Path d="M115,78 Q117.5,74 120,78" stroke="#AD1457" strokeWidth={0.8} fill="none" />
      <Circle cx={117.5} cy={83} r={0.7} fill="#FDD835" />
    </G>
  );
}

function Rashida() {
  return (
    <G>
      {/* Dress spread on the grass, shoes peeping out. */}
      <Ellipse cx={96} cy={89.6} rx={2.4} ry={1.3} fill="#212121" />
      <Ellipse cx={104} cy={89.6} rx={2.4} ry={1.3} fill="#212121" />
      <Path d="M86,88 Q88,74 100,72 Q112,74 114,88 Q100,91 86,88 Z" fill={DRESS} />
      <Path
        d="M92,87 Q96,80 100,78 M108,87 Q104,80 100,78"
        stroke={DRESS_SHADE}
        strokeWidth={0.6}
        fill="none"
      />
      <Path d="M93,76 Q92,62 100,60 Q108,62 107,76 Z" fill={DRESS} />
      {/* Left hand rests on her lap. */}
      <Path
        d="M106,64 Q110,70 105,76"
        stroke={DRESS}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Hand cx={104.4} cy={76.4} r={1.6} />
      {/* Right hand raised, a butterfly on it. */}
      <Path
        d="M94,64 Q88,64 86,57"
        stroke={DRESS}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Hand cx={85.8} cy={55.8} r={1.7} />
      <Butterfly x={85.6} y={51.6} fill="#FFB300" spot="#FB8C00" s={0.9} rot={-10} />
      <Headscarf cx={100} cy={51} r={5.4} />
      <Face cx={100} cy={51} r={5.4} mood="smile" />
    </G>
  );
}

export function Butterflies() {
  return (
    <G>
      <Rect x={0} y={0} width={160} height={62} fill="#B3E5FC" />
      <Path
        d="M0,56 Q18,42 38,50 Q58,38 80,48 Q100,40 118,48 Q140,40 160,46 L160,62 L0,62 Z"
        fill="#A1887F"
      />
      <Rect x={0} y={60} width={160} height={40} fill="#9CCC65" />
      <Path d="M0,66 Q40,62 80,66 Q120,70 160,64" stroke="#8BC34A" strokeWidth={1.2} fill="none" />
      <School />
      <DomedBuilding />
      <BrickHouse />
      <Tree />
      {[
        [14, 84],
        [24, 90],
        [36, 82],
        [48, 92],
        [66, 86],
        [142, 90],
        [152, 82],
      ].map(([x, y]) => (
        <Flower key={`${x}-${y}`} x={x} y={y} />
      ))}
      <SchoolBag />
      <Rashida />
      <Butterfly x={72} y={66} fill="#E91E63" spot="#F48FB1" rot={15} />
      <Butterfly x={78} y={42} fill="#7E57C2" spot="#B39DDB" s={0.9} rot={-20} />
      <Butterfly x={94} y={34} fill="#29B6F6" spot="#81D4FA" s={0.8} rot={10} />
      <Butterfly x={114} y={58} fill="#FF7043" spot="#FFCC80" rot={-15} />
      <Butterfly x={148} y={66} fill="#FDD835" spot="#FFF59D" s={0.9} rot={20} />
      <Butterfly x={58} y={76} fill="#26A69A" spot="#80CBC4" s={0.8} rot={-5} />
      <Butterfly x={22} y={70} fill="#EC407A" spot="#F8BBD0" s={0.8} rot={25} />
    </G>
  );
}
