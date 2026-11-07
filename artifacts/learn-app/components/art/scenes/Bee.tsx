/**
 * أقرأ وأتعلم Part 1, p. 175 (8-2 لَطِيفَةُ وَالنَّحْلَةُ): Latifa, in a blue headscarf, blue jacket
 * and skirt, runs away in fright with a stick in her hand; a bee flies after her from a big
 * pink flower. Red flowers grow by a tree; behind her a house with an arched coloured window.
 */

import React from "react";
import { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";

import { Face, Hand, Headscarf, INK, SKIN, WHITE, WOOD, WOOD_DARK } from "./parts";

const SCARF = "#1565C0";
const JACKET = "#1E88E5";
const SKIRT = "#0D47A1";

/** Arched window with coloured glass in the top, as in Yemeni houses. */
function ArchedWindow() {
  const wedges = ["#E53935", "#FDD835", "#43A047", "#1E88E5", "#E53935"];
  return (
    <G>
      <Path d="M22,46 L22,30 A12,12 0 0 1 46,30 L46,46 Z" fill={WHITE} />
      {wedges.map((fill, i) => {
        const a0 = Math.PI + (i * Math.PI) / wedges.length;
        const a1 = Math.PI + ((i + 1) * Math.PI) / wedges.length;
        const r = 10;
        return (
          <Path
            key={i}
            d={`M34,30 L${34 + r * Math.cos(a0)},${30 + r * Math.sin(a0)} A${r},${r} 0 0 1 ${34 + r * Math.cos(a1)},${30 + r * Math.sin(a1)} Z`}
            fill={fill}
            stroke={WHITE}
            strokeWidth={0.6}
          />
        );
      })}
      <Rect x={24} y={31} width={20} height={13} fill="#81D4FA" />
      <Line x1={34} y1={31} x2={34} y2={44} stroke={WHITE} strokeWidth={1} />
      <Rect x={20} y={45} width={28} height={2} fill="#D7CCC8" />
    </G>
  );
}

function House() {
  return (
    <G>
      <Rect x={0} y={6} width={68} height={66} fill="#E8D5B0" />
      <Rect x={0} y={6} width={68} height={2.4} fill={WHITE} />
      {[20, 34, 48, 62].map((y) => (
        <Line key={y} x1={0} y1={y} x2={68} y2={y} stroke="#D9C49A" strokeWidth={0.3} />
      ))}
      <ArchedWindow />
      <Path d="M52,72 L52,52 Q58,46 64,52 L64,72 Z" fill={WOOD} />
      <Circle cx={61.6} cy={62} r={0.7} fill="#FDD835" />
    </G>
  );
}

function Tree() {
  return (
    <G>
      <Path d="M142,90 Q146,64 144,36 L152,36 Q150,64 156,90 Z" fill={WOOD} />
      <Path d="M147,64 L147,80" stroke={WOOD_DARK} strokeWidth={0.6} />
      <Circle cx={148} cy={22} r={18} fill="#388E3C" />
      <Circle cx={132} cy={30} r={11} fill="#43A047" />
      <Circle cx={140} cy={8} r={10} fill="#4CAF50" />
    </G>
  );
}

function PinkFlower() {
  return (
    <G>
      <Path d="M120,92 Q122,72 120,52" stroke="#558B2F" strokeWidth={1.2} fill="none" />
      <Path d="M121,76 Q128,70 130,74 Q125,78 121,76 Z" fill="#7CB342" />
      <Path d="M120,68 Q112,62 110,66 Q115,70 120,68 Z" fill="#7CB342" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <Ellipse
          key={a}
          cx={120 + 4.4 * Math.cos((a * Math.PI) / 180)}
          cy={47 + 4.4 * Math.sin((a * Math.PI) / 180)}
          rx={3.6}
          ry={2.4}
          fill="#F48FB1"
          stroke="#EC407A"
          strokeWidth={0.4}
          transform={`rotate(${a} ${120 + 4.4 * Math.cos((a * Math.PI) / 180)} ${47 + 4.4 * Math.sin((a * Math.PI) / 180)})`}
        />
      ))}
      <Circle cx={120} cy={47} r={2.6} fill="#FDD835" />
    </G>
  );
}

function RedFlower({ x, y }: { x: number; y: number }) {
  return (
    <G>
      <Line x1={x} y1={y} x2={x} y2={y + 6} stroke="#558B2F" strokeWidth={0.6} />
      {[0, 72, 144, 216, 288].map((a) => (
        <Circle
          key={a}
          cx={x + 1.4 * Math.cos((a * Math.PI) / 180)}
          cy={y + 1.4 * Math.sin((a * Math.PI) / 180)}
          r={1.1}
          fill="#E53935"
        />
      ))}
      <Circle cx={x} cy={y} r={0.7} fill="#FDD835" />
    </G>
  );
}

/** The bee, flying to the left toward Latifa, its path dotted from the flower. */
function FlyingBee() {
  return (
    <G>
      <Path
        d="M116,44 Q110,30 104,38 Q100,44 96,40"
        stroke="#795548"
        strokeWidth={0.5}
        strokeDasharray="1,1.4"
        fill="none"
      />
      <Ellipse
        cx={93}
        cy={34.6}
        rx={2.2}
        ry={3}
        fill={WHITE}
        opacity={0.85}
        transform="rotate(-25 93 34.6)"
      />
      <Ellipse
        cx={96}
        cy={34.4}
        rx={2}
        ry={2.8}
        fill={WHITE}
        opacity={0.85}
        transform="rotate(20 96 34.4)"
      />
      <Ellipse
        cx={93.6}
        cy={38.6}
        rx={3.8}
        ry={2.6}
        fill="#FDD835"
        stroke={INK}
        strokeWidth={0.3}
      />
      <Path d="M93,36.1 L93,41.1 M95.2,36.4 L95.2,40.8" stroke={INK} strokeWidth={0.9} />
      <Path d="M97.3,38.6 L99,38.6" stroke={INK} strokeWidth={0.6} strokeLinecap="round" />
      <Circle cx={90.4} cy={38.2} r={1.4} fill={INK} />
      <Path
        d="M90,37 q-1,-2 -2,-2.4 M90.6,36.9 q0,-2 -0.6,-2.8"
        stroke={INK}
        strokeWidth={0.3}
        fill="none"
      />
    </G>
  );
}

function Latifa() {
  return (
    <G>
      {/* Running to the left: one leg forward, one behind. */}
      <Path d="M66,76 L60,89" stroke={SKIN} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M73,76 L80,87" stroke={SKIN} strokeWidth={2.4} strokeLinecap="round" />
      <Ellipse cx={58.8} cy={90} rx={2.6} ry={1.3} fill="#212121" />
      <Ellipse
        cx={81.4}
        cy={88.4}
        rx={2.6}
        ry={1.3}
        fill="#212121"
        transform="rotate(30 81.4 88.4)"
      />
      <Path d="M63,62 L77,62 L81,78 L59,78 Z" fill={SKIRT} />
      <Path d="M66,64 L64,77 M74,64 L76,77" stroke="#1A237E" strokeWidth={0.5} />
      <Path d="M64,63 Q63,50 70,48 Q77,50 76,63 Z" fill={JACKET} />
      <Path d="M70,50 L70,62" stroke="#1565C0" strokeWidth={0.6} />
      {/* Front arm reaching ahead, back arm holding the stick up behind her. */}
      <Path
        d="M65,53 Q60,56 56,60"
        stroke={JACKET}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Hand cx={55.4} cy={60.6} r={1.7} />
      <Line x1={79} y1={50} x2={88} y2={36} stroke={WOOD} strokeWidth={1.2} strokeLinecap="round" />
      <Path
        d="M75,53 Q80,52 81,48"
        stroke={JACKET}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Hand cx={80.6} cy={47.4} r={1.7} />
      <Headscarf cx={70} cy={40} r={5.6} fill={SCARF} edge="#0D47A1" />
      <Face cx={70} cy={40} r={5.6} mood="open" />
      {/* Fright marks. */}
      <Path
        d="M61,32 l-2.6,-2 M60,37 l-3,-0.4 M63.6,29 l-1,-2.8"
        stroke="#E53935"
        strokeWidth={0.7}
        strokeLinecap="round"
      />
    </G>
  );
}

export function Bee() {
  return (
    <G>
      <Rect x={0} y={0} width={160} height={72} fill="#C8E6C9" />
      <House />
      <Rect x={0} y={70} width={160} height={30} fill="#9CCC65" />
      <Path d="M0,76 Q40,72 80,76 Q120,80 160,74" stroke="#8BC34A" strokeWidth={1.2} fill="none" />
      <Tree />
      <PinkFlower />
      {[
        [128, 84],
        [134, 90],
        [140, 82],
        [104, 88],
        [96, 82],
        [30, 88],
        [40, 84],
      ].map(([x, y]) => (
        <RedFlower key={`${x}-${y}`} x={x} y={y} />
      ))}
      <Latifa />
      <FlyingBee />
    </G>
  );
}
