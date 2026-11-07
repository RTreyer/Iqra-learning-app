/**
 * أقرأ وأتعلم Part 1, p. 181 (8-3 زِيَارَةُ جَدِّي): a living room with a fridge and an arched
 * coloured-glass window. The window glass is broken and the pink curtain blows outside; a
 * blue football lies among the glass pieces. Ziyad in a green shirt raises his hands in shock;
 * by the door stand the grandfather (white robe and cap, walking stick) and Zayd in a
 * red and white striped jumper.
 */

import React from "react";
import { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";

import { Face, Hand, ShortHair, WHITE, WOOD, WOOD_DARK } from "./parts";

const GLASS = "#B3E5FC";
const SHIRT = "#43A047";

function Fridge() {
  return (
    <G>
      <Rect
        x={6}
        y={22}
        width={18}
        height={56}
        rx={2}
        fill="#ECEFF1"
        stroke="#B0BEC5"
        strokeWidth={0.6}
      />
      <Line x1={6} y1={40} x2={24} y2={40} stroke="#B0BEC5" strokeWidth={0.6} />
      <Rect x={20.6} y={28} width={1.4} height={8} rx={0.6} fill="#90A4AE" />
      <Rect x={20.6} y={44} width={1.4} height={12} rx={0.6} fill="#90A4AE" />
    </G>
  );
}

function Window() {
  const wedges = ["#E53935", "#FDD835", "#43A047", "#1E88E5", "#E53935"];
  return (
    <G>
      <Path d="M36,52 L36,28 A16,16 0 0 1 68,28 L68,52 Z" fill={WHITE} />
      {wedges.map((fill, i) => {
        const a0 = Math.PI + (i * Math.PI) / wedges.length;
        const a1 = Math.PI + ((i + 1) * Math.PI) / wedges.length;
        const r = 14;
        return (
          <Path
            key={i}
            d={`M52,28 L${52 + r * Math.cos(a0)},${28 + r * Math.sin(a0)} A${r},${r} 0 0 1 ${52 + r * Math.cos(a1)},${28 + r * Math.sin(a1)} Z`}
            fill={fill}
            stroke={WHITE}
            strokeWidth={0.7}
          />
        );
      })}
      <Rect x={38} y={29} width={28} height={21} fill={GLASS} />
      {/* The broken pane: a jagged hole with cracks around it. */}
      <Path
        d="M44,33 L49,36 L52,31 L55,37 L61,34 L58,40 L63,44 L56,44 L54,49 L50,44 L43,46 L46,40 Z"
        fill="#5D8AA8"
      />
      <Path
        d="M44,33 L40,30 M61,34 L65,31 M63,44 L66,47 M43,46 L39,49 M52,31 L52,29"
        stroke="#78909C"
        strokeWidth={0.4}
      />
      <Line x1={52} y1={29} x2={52} y2={31} stroke={WHITE} strokeWidth={1} />
      <Rect x={34} y={51} width={36} height={2.4} fill="#D7CCC8" />
      {/* The pink curtain, blown out through the hole. */}
      <Line x1={32} y1={12} x2={72} y2={12} stroke={WOOD_DARK} strokeWidth={1.2} />
      <Path d="M32,12 L40,12 Q38,30 41,52 L32,52 Z" fill="#F48FB1" />
      <Path
        d="M66,12 L72,12 L72,22 Q64,26 58,36 Q55,40 52,38 Q57,30 60,24 Q63,18 66,12 Z"
        fill="#F48FB1"
        stroke="#EC407A"
        strokeWidth={0.4}
      />
      <Path d="M35,14 L35,50 M38,14 L38.6,50" stroke="#EC407A" strokeWidth={0.4} />
    </G>
  );
}

function BallAndGlass() {
  const shards: [string, string][] = [
    ["M44,90 l4,-2 l1,3 Z", GLASS],
    ["M50,95 l3,-3 l2,3 l-2,1 Z", WHITE],
    ["M66,92 l4,-1 l-1,3 Z", GLASS],
    ["M70,96 l3,-2 l3,2 Z", WHITE],
    ["M40,96 l3,-1 l1,2 l-3,1 Z", GLASS],
    ["M62,97 l2,-3 l3,2 Z", GLASS],
  ];
  return (
    <G>
      {shards.map(([d, fill], i) => (
        <Path key={i} d={d} fill={fill} stroke="#78909C" strokeWidth={0.3} />
      ))}
      <Circle cx={58} cy={88} r={4.4} fill="#1E88E5" />
      <Path d="M56,85.4 L60,85.4 L61.2,88.6 L58,90.8 L54.8,88.6 Z" fill="#0D47A1" />
      <Path
        d="M54.6,85.6 Q56,84 58,83.6 M61.4,85.6 Q62.4,87 62.4,88.6"
        stroke={WHITE}
        strokeWidth={0.4}
        fill="none"
      />
    </G>
  );
}

/** Ziyad, hands raised in shock. */
function Ziyad() {
  return (
    <G>
      <Path d="M82.6,74 L82,90 M89.4,74 L90,90" stroke="#546E7A" strokeWidth={3.6} />
      <Ellipse cx={81.6} cy={91.4} rx={2.4} ry={1.2} fill="#212121" />
      <Ellipse cx={90.4} cy={91.4} rx={2.4} ry={1.2} fill="#212121" />
      <Path d="M79,76 Q78,58 86,56 Q94,58 93,76 Z" fill={SHIRT} />
      <Path d="M83,56.6 L86,60 L89,56.6" stroke="#2E7D32" strokeWidth={0.6} fill="none" />
      <Path
        d="M80.6,60 Q75,54 76,45"
        stroke={SHIRT}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M91.4,60 Q97,54 96,45"
        stroke={SHIRT}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Hand cx={76} cy={43.6} r={1.9} />
      <Hand cx={96} cy={43.6} r={1.9} />
      <Face cx={86} cy={48} r={6} mood="open" />
      <ShortHair cx={86} cy={48} r={6} />
      <Path
        d="M76.6,36 l-1.4,-2.6 M86,33.4 l0,-3 M95.4,36 l1.4,-2.6"
        stroke="#E53935"
        strokeWidth={0.7}
        strokeLinecap="round"
      />
    </G>
  );
}

function Door() {
  return (
    <G>
      <Rect x={116} y={14} width={38} height={64} fill={WOOD_DARK} />
      <Rect x={119} y={17} width={32} height={61} fill="#FFE0B2" />
      <Path d="M119,78 L119,17 L110,21 L110,80 Z" fill={WOOD} />
      <Circle cx={112} cy={50} r={0.8} fill="#FDD835" />
    </G>
  );
}

/** The grandfather in a white robe and cap, leaning on his stick. */
function Grandfather() {
  return (
    <G>
      <Line
        x1={142.6}
        y1={58}
        x2={144.6}
        y2={92}
        stroke={WOOD}
        strokeWidth={1.1}
        strokeLinecap="round"
      />
      <Path
        d="M124,92 Q123,50 133,46 Q143,50 142,92 Z"
        fill={WHITE}
        stroke="#E0E0E0"
        strokeWidth={0.6}
      />
      <Path d="M133,47 L133,64" stroke="#E0E0E0" strokeWidth={0.6} />
      <Ellipse cx={129} cy={93} rx={2.6} ry={1.2} fill="#5D4037" />
      <Ellipse cx={137} cy={93} rx={2.6} ry={1.2} fill="#5D4037" />
      <Path
        d="M140,52 Q143,54 142.6,58"
        stroke={WHITE}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Hand cx={142.6} cy={58.6} r={1.8} />
      <Face cx={133} cy={36} r={6.2} mood="calm" />
      {/* Grey beard and white cap. */}
      <Path
        d="M127.6,39.6 Q128,47.6 133,48.6 Q138,47.6 138.4,39.6 Q136,42.6 133,42.4 Q130,42.6 127.6,39.6 Z"
        fill="#E0E0E0"
      />
      <Path
        d="M126.8,32 Q127,25 133,24.6 Q139,25 139.2,32 Q133,30 126.8,32 Z"
        fill={WHITE}
        stroke="#E0E0E0"
        strokeWidth={0.4}
      />
    </G>
  );
}

/** Zayd in a red and white striped jumper, sorry for the ball. */
function Zayd() {
  const stripes = [64, 68, 72, 76];
  return (
    <G>
      <Path d="M147,80 L147,91 M153,80 L153,91" stroke="#37474F" strokeWidth={3} />
      <Ellipse cx={146.6} cy={92.2} rx={2.2} ry={1.1} fill="#212121" />
      <Ellipse cx={153.4} cy={92.2} rx={2.2} ry={1.1} fill="#212121" />
      <Path d="M144,81 Q143,63 150,61 Q157,63 156,81 Z" fill="#E53935" />
      {stripes.map((y) => (
        <Rect key={y} x={144} y={y} width={12} height={1.6} fill={WHITE} />
      ))}
      <Hand cx={144.6} cy={80.6} r={1.5} />
      <Hand cx={155.4} cy={80.6} r={1.5} />
      <Face cx={150} cy={54} r={5.2} mood="worried" />
      <ShortHair cx={150} cy={54} r={5.2} />
    </G>
  );
}

export function BrokenWindow() {
  return (
    <G>
      <Rect x={0} y={0} width={160} height={78} fill="#FFF8E1" />
      <Rect x={0} y={76} width={160} height={24} fill="#D7CCC8" />
      {[20, 40, 60, 80, 100, 120, 140].map((x) => (
        <Line key={x} x1={x} y1={76} x2={x - 6} y2={100} stroke="#BCAAA4" strokeWidth={0.4} />
      ))}
      <Ellipse cx={82} cy={92} rx={40} ry={6} fill="#C5E1A5" opacity={0.7} />
      <Fridge />
      <Window />
      <Door />
      <G transform="translate(-4 0)">
        <Grandfather />
      </G>
      <Zayd />
      <BallAndGlass />
      <Ziyad />
    </G>
  );
}
