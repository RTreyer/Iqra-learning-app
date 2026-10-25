/**
 * أقرأ وأتعلم Part 1, p. 131 (6-2 صَابِرٌ وَالْبُلْبُلُ): a smiling boy in a light blue hoodie
 * holds a wooden birdcage with a yellow bulbul inside; musical notes float around the
 * singing bird. A window behind shows the sea of Aden.
 */

import React from "react";
import { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";

import { Face, Hand, ShortHair, WHITE, WOOD, WOOD_DARK } from "./parts";

const HOODIE = "#90CAF9";
const HOODIE_SHADE = "#64B5F6";

function Note({ x, y, fill, double }: { x: number; y: number; fill: string; double?: boolean }) {
  return (
    <G>
      <Ellipse cx={x} cy={y} rx={2.6} ry={1.9} fill={fill} transform={`rotate(-20 ${x} ${y})`} />
      <Line x1={x + 2.3} y1={y - 0.6} x2={x + 2.3} y2={y - 10} stroke={fill} strokeWidth={0.9} />
      {double ? (
        <G>
          <Ellipse
            cx={x + 7}
            cy={y - 1.5}
            rx={2.6}
            ry={1.9}
            fill={fill}
            transform={`rotate(-20 ${x + 7} ${y - 1.5})`}
          />
          <Line
            x1={x + 9.3}
            y1={y - 2.1}
            x2={x + 9.3}
            y2={y - 11.5}
            stroke={fill}
            strokeWidth={0.9}
          />
          <Path
            d={`M${x + 2.3},${y - 10} L${x + 9.3},${y - 11.5} L${x + 9.3},${y - 9.5} L${x + 2.3},${y - 8} Z`}
            fill={fill}
          />
        </G>
      ) : (
        <Path
          d={`M${x + 2.3},${y - 10} Q${x + 6.5},${y - 8} ${x + 5},${y - 4}`}
          stroke={fill}
          strokeWidth={1}
          fill="none"
        />
      )}
    </G>
  );
}

function Window() {
  return (
    <G>
      <Rect x={8} y={8} width={30} height={34} rx={2} fill="#81D4FA" />
      <Rect x={8} y={30} width={30} height={12} fill="#0288D1" />
      <Path d="M8,30 Q16,28 23,30 Q30,32 38,30" stroke="#B3E5FC" strokeWidth={0.8} fill="none" />
      <Circle cx={31} cy={15} r={3.4} fill="#FFE082" />
      <Path d="M12,29 L18,23 L24,29 Z" fill="#8D6E63" />
      <Rect
        x={8}
        y={8}
        width={30}
        height={34}
        rx={2}
        fill="none"
        stroke="#F7F0E1"
        strokeWidth={2.2}
      />
      <Line x1={23} y1={8} x2={23} y2={42} stroke="#F7F0E1" strokeWidth={1.6} />
    </G>
  );
}

function Boy() {
  return (
    <G>
      <Path d="M30,100 Q31,56 58,50 Q85,56 86,100 Z" fill={HOODIE} />
      {/* Hood down on the shoulders, behind the neck. */}
      <Path d="M44,58 Q42,46 58,45 Q74,46 72,58 Q58,54 44,58 Z" fill={HOODIE_SHADE} />
      <Path d="M46,84 L70,84 L67,96 L49,96 Z" fill={HOODIE_SHADE} />
      <Path d="M58,52 L58,100" stroke={HOODIE_SHADE} strokeWidth={0.8} />
      <Line x1={54} y1={52} x2={53} y2={64} stroke={WHITE} strokeWidth={0.9} />
      <Line x1={62} y1={52} x2={63} y2={64} stroke={WHITE} strokeWidth={0.9} />
      <Ellipse cx={53} cy={65} rx={0.9} ry={1.4} fill={WHITE} />
      <Ellipse cx={63} cy={65} rx={0.9} ry={1.4} fill={WHITE} />
      <Rect x={54} y={44} width={8} height={7} fill="#A86F45" />
      <Face cx={58} cy={32} r={12} mood="smile" />
      <ShortHair cx={58} cy={32} r={12} />
      {/* Arms holding the cage in front of him. */}
      <Path
        d="M36,64 Q42,86 70,88"
        stroke={HOODIE}
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M80,60 Q100,66 106,84"
        stroke={HOODIE}
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
      />
    </G>
  );
}

function Cage() {
  const bars = [74, 80, 86, 92, 98, 104];
  return (
    <G>
      <Circle cx={89} cy={30} r={2.6} fill="none" stroke={WOOD_DARK} strokeWidth={1.2} />
      <Path d="M71,50 Q89,24 107,50" stroke={WOOD} strokeWidth={1.6} fill="none" />
      {[78, 84, 94, 100].map((x) => (
        <Line key={x} x1={x} y1={50} x2={89} y2={33} stroke={WOOD_DARK} strokeWidth={0.9} />
      ))}
      <Rect x={70} y={49} width={38} height={2.4} rx={1} fill={WOOD} />
      {bars.map((x) => (
        <Line key={x} x1={x} y1={51} x2={x} y2={84} stroke={WOOD_DARK} strokeWidth={1} />
      ))}
      <Line x1={71} y1={51} x2={71} y2={84} stroke={WOOD} strokeWidth={1.6} />
      <Line x1={107} y1={51} x2={107} y2={84} stroke={WOOD} strokeWidth={1.6} />
      <Line x1={76} y1={73} x2={102} y2={73} stroke={WOOD} strokeWidth={1.4} />
      <Rect
        x={98}
        y={78}
        width={6}
        height={4}
        fill="#4FC3F7"
        stroke={WOOD_DARK}
        strokeWidth={0.4}
      />
      {/* The bulbul, singing. */}
      <Path d="M80,70 L74,74 L77,68 Z" fill="#F9A825" />
      <Ellipse cx={86} cy={66} rx={8} ry={5.6} fill="#FDD835" />
      <Ellipse cx={85} cy={66} rx={4.6} ry={3} fill="#F9A825" transform="rotate(-15 85 66)" />
      <Circle cx={93} cy={59.5} r={4.6} fill="#FDD835" />
      <Path d="M96,57 Q94,53.5 91,55" fill="#5D4037" />
      <Circle cx={94.4} cy={58.6} r={0.9} fill="#212121" />
      <Path d="M97.2,58.6 L101.6,57 L97.6,59.8 Z" fill="#FB8C00" />
      <Path d="M97.6,60.4 L101.6,61.8 L97.4,61.2 Z" fill="#FB8C00" />
      <Line x1={85} y1={71.5} x2={84} y2={73} stroke="#FB8C00" strokeWidth={0.8} />
      <Line x1={88} y1={71.5} x2={88.5} y2={73} stroke="#FB8C00" strokeWidth={0.8} />
      <Rect x={68} y={84} width={42} height={5} rx={1.2} fill={WOOD} />
      <Rect x={68} y={88} width={42} height={1.4} fill={WOOD_DARK} />
    </G>
  );
}

export function Birdcage() {
  return (
    <G>
      <Rect x={0} y={0} width={160} height={100} fill="#FFF3E0" />
      <Rect x={0} y={90} width={160} height={10} fill="#E6CFA8" />
      <Window />
      <Boy />
      <Cage />
      <Hand cx={71} cy={88} r={3.2} />
      <Hand cx={107} cy={86} r={3.2} />
      <Note x={114} y={36} fill="#7E57C2" />
      <Note x={124} y={52} fill="#EC407A" double />
      <Note x={136} y={30} fill="#26A69A" />
      <Note x={146} y={50} fill="#7E57C2" />
      <Note x={118} y={20} fill="#FFA000" double />
    </G>
  );
}
