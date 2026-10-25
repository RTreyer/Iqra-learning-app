/**
 * أقرأ وأتعلم Part 1, p. 147 (7-1 النَّظَافَةُ): a classroom with pupils in green uniforms.
 * The teacher (glasses, blue jumper, a red book) stands in the aisle; a boy with a red
 * scarf kneels and sweeps pomegranate seeds into a yellow bucket with a dustpan; a girl
 * in a white headscarf kneels at the back and wipes an ink stain off the floor.
 */

import React from "react";
import { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";

import { Face, Hand, ShortHair, WHITE, WOOD, WOOD_DARK } from "./parts";

const UNIFORM = "#2E7D32";
const UNIFORM_LIGHT = "#43A047";

/** A pupil sitting behind a desk: head and shoulders above the desk top. */
function SeatedPupil({ x, y, girl }: { x: number; y: number; girl?: boolean }) {
  return (
    <G>
      <Path
        d={`M${x - 7},${y + 14} Q${x - 7},${y + 6} ${x},${y + 5} Q${x + 7},${y + 6} ${x + 7},${y + 14} Z`}
        fill={UNIFORM}
      />
      {girl ? (
        <Path
          d={`M${x - 6.4},${y + 6} Q${x - 7.4},${y - 7.4} ${x},${y - 7.6} Q${x + 7.4},${y - 7.4} ${x + 6.4},${y + 6} Q${x},${y + 8} ${x - 6.4},${y + 6} Z`}
          fill={WHITE}
          stroke="#E0E0E0"
          strokeWidth={0.4}
        />
      ) : null}
      <Face cx={x} cy={y} r={4.6} mood="smile" />
      {girl ? null : <ShortHair cx={x} cy={y} r={4.6} />}
    </G>
  );
}

function Desk({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <G>
      <Rect x={x} y={y} width={w} height={2.6} rx={0.6} fill={WOOD} />
      <Rect x={x + 1} y={y + 2.6} width={w - 2} height={7} fill="#A1673A" />
      <Line x1={x + 2} y1={y + 9.6} x2={x + 2} y2={y + 14} stroke={WOOD_DARK} strokeWidth={1.2} />
      <Line
        x1={x + w - 2}
        y1={y + 9.6}
        x2={x + w - 2}
        y2={y + 14}
        stroke={WOOD_DARK}
        strokeWidth={1.2}
      />
    </G>
  );
}

function Teacher() {
  return (
    <G>
      <Rect x={74.5} y={74} width={5} height={18} fill="#455A64" />
      <Rect x={80.5} y={74} width={5} height={18} fill="#455A64" />
      <Ellipse cx={76.5} cy={93} rx={4} ry={1.6} fill="#212121" />
      <Ellipse cx={83.5} cy={93} rx={4} ry={1.6} fill="#212121" />
      <Path d="M70,76 Q69,48 80,45 Q91,48 90,76 Z" fill="#1E5AA8" />
      <Path d="M76,45.5 L80,51 L84,45.5" fill={WHITE} />
      <Path
        d="M71.5,52 Q68,62 70,70"
        stroke="#1E5AA8"
        strokeWidth={4.4}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M88.5,52 Q93,60 92,67"
        stroke="#1E5AA8"
        strokeWidth={4.4}
        strokeLinecap="round"
        fill="none"
      />
      <Hand cx={70} cy={71} r={2.2} />
      {/* The red book under his hand. */}
      <Rect
        x={89}
        y={62}
        width={8}
        height={10}
        rx={0.8}
        fill="#C62828"
        transform="rotate(12 93 67)"
      />
      <Rect
        x={89.6}
        y={62.8}
        width={1.2}
        height={8.6}
        fill="#8E0000"
        transform="rotate(12 93 67)"
      />
      <Hand cx={92} cy={68} r={2.2} />
      <Rect x={77.5} y={40} width={5} height={5.6} fill="#A86F45" />
      <Face cx={80} cy={34} r={7} mood="smile" />
      <ShortHair cx={80} cy={34} r={7} />
      {/* Glasses. */}
      <Circle cx={77.4} cy={33.4} r={2.2} fill="none" stroke="#212121" strokeWidth={0.6} />
      <Circle cx={82.6} cy={33.4} r={2.2} fill="none" stroke="#212121" strokeWidth={0.6} />
      <Line x1={79.6} y1={33.2} x2={80.4} y2={33.2} stroke="#212121" strokeWidth={0.6} />
    </G>
  );
}

function SweepingBoy() {
  const seeds: [number, number][] = [
    [96, 92],
    [99, 94],
    [102, 91.5],
    [93, 95],
    [105, 94.5],
  ];
  return (
    <G>
      {seeds.map(([cx, cy], i) => (
        <Ellipse key={i} cx={cx} cy={cy} rx={1} ry={1.3} fill="#C2185B" />
      ))}
      {/* Kneeling: knees on the floor, body leaning forward. */}
      <Path d="M112,94 Q118,86 124,94 Z" fill="#1B5E20" />
      <Path d="M108,90 Q107,76 116,73 Q123,75 124,90 Z" fill={UNIFORM_LIGHT} />
      <Path
        d="M110.5,77 Q105,84 104,90"
        stroke={UNIFORM_LIGHT}
        strokeWidth={3.4}
        strokeLinecap="round"
        fill="none"
      />
      {/* Dustpan with seeds. */}
      <Path d="M97,93 L105,93 L106,89 L98,89 Z" fill="#78909C" />
      <Line x1={106} y1={91} x2={110} y2={88} stroke="#546E7A" strokeWidth={1.2} />
      <Circle cx={101} cy={91} r={0.9} fill="#C2185B" />
      <Circle cx={103} cy={90.6} r={0.9} fill="#C2185B" />
      <Hand cx={104.5} cy={90} r={1.8} />
      {/* Red scarf. */}
      <Path d="M111.5,73.5 Q116,77 121,73.5 L121,76 Q116,79.5 111.5,76 Z" fill="#D32F2F" />
      <Path d="M119,76 L121,83 L117.5,82 Z" fill="#B71C1C" />
      <Face cx={115} cy={67} r={5.6} mood="smile" />
      <ShortHair cx={115} cy={67} r={5.6} />
      {/* Yellow bucket. */}
      <Path d="M126,82 L136,82 L134.5,94 L127.5,94 Z" fill="#FBC02D" />
      <Ellipse cx={131} cy={82} rx={5} ry={1.4} fill="#F9A825" />
      <Path d="M126.4,82 Q131,75 135.6,82" stroke="#757575" strokeWidth={0.6} fill="none" />
    </G>
  );
}

function WipingGirl() {
  return (
    <G>
      <Ellipse cx={42} cy={73.4} rx={6} ry={2} fill="#1A237E" opacity={0.85} />
      <Path d="M50,74 Q55,67 60,74 Z" fill="#1B5E20" />
      <Path d="M47,71 Q46,59 53,57 Q59,59 60,71 Z" fill={UNIFORM_LIGHT} />
      <Path
        d="M48.5,61 Q45,66 44.5,71"
        stroke={UNIFORM_LIGHT}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Rect x={40.5} y={70.4} width={5} height={2.6} rx={0.6} fill="#FFEB3B" />
      <Hand cx={44.6} cy={71} r={1.6} />
      <Path
        d="M47.4,58 Q46.2,44.8 53,44.4 Q59.8,44.8 58.6,58 Q53,60 47.4,58 Z"
        fill={WHITE}
        stroke="#E0E0E0"
        strokeWidth={0.4}
      />
      <Face cx={53} cy={51.4} r={4.6} mood="calm" />
    </G>
  );
}

export function Classroom() {
  return (
    <G>
      <Rect x={0} y={0} width={160} height={70} fill="#F3E9D2" />
      <Rect x={0} y={68} width={160} height={32} fill="#D7CCC8" />
      {[10, 30, 50, 70, 90, 110, 130, 150].map((x) => (
        <Line key={x} x1={x} y1={68} x2={x - 6} y2={100} stroke="#BCAAA4" strokeWidth={0.4} />
      ))}
      <Rect
        x={44}
        y={6}
        width={72}
        height={22}
        rx={1}
        fill="#2E5E4E"
        stroke={WOOD}
        strokeWidth={1.6}
      />
      <SvgText x={80} y={19.6} fontSize={5.6} fill="#F1F8E9" textAnchor="middle">
        النَّظَافَةُ مِنَ الإِيمَانِ
      </SvgText>
      <Rect x={6} y={10} width={22} height={24} fill="#B3E5FC" stroke={WOOD} strokeWidth={1.4} />
      <Line x1={17} y1={10} x2={17} y2={34} stroke={WOOD} strokeWidth={1} />
      <Rect x={132} y={10} width={22} height={24} fill="#B3E5FC" stroke={WOOD} strokeWidth={1.4} />
      <Line x1={143} y1={10} x2={143} y2={34} stroke={WOOD} strokeWidth={1} />
      {/* Back row. */}
      <SeatedPupil x={12} y={42} />
      <SeatedPupil x={26} y={42} girl />
      <Desk x={4} y={50} w={32} />
      <SeatedPupil x={134} y={42} girl />
      <SeatedPupil x={148} y={42} />
      <Desk x={126} y={50} w={32} />
      {/* Front row. */}
      <SeatedPupil x={14} y={60} girl />
      <SeatedPupil x={28} y={60} />
      <Desk x={4} y={68} w={34} />
      <SeatedPupil x={136} y={60} />
      <SeatedPupil x={150} y={60} girl />
      <Desk x={126} y={68} w={34} />
      <WipingGirl />
      <Teacher />
      <SweepingBoy />
    </G>
  );
}
