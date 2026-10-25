/**
 * أقرأ وأتعلم Part 1, p. 159 (7-3 جَارُ الْمَسْجِدِ): a bedroom with pink curtains and a
 * hanging lantern. Jubran, his head bandaged, lies smiling in bed under a blue blanket;
 * Muhammad in a white robe sits beside him and talks to him (a morning visit, so the window
 * shows daylight); a green prayer mat lies on
 * the pink carpet.
 */

import React from "react";
import { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";

import { Face, Hand, HAIR, ShortHair, WHITE, WOOD, WOOD_DARK } from "./parts";

function Window() {
  return (
    <G>
      <Rect x={14} y={12} width={26} height={30} fill="#81D4FA" />
      <Circle cx={32} cy={20} r={3} fill="#FFD54F" />
      <Path d="M14,36 Q20,31 26,35 Q32,30 40,34 L40,42 L14,42 Z" fill="#A5D6A7" />
      <Ellipse cx={22} cy={20} rx={4} ry={1.6} fill={WHITE} opacity={0.9} />
      <Rect x={14} y={12} width={26} height={30} fill="none" stroke="#F7F0E1" strokeWidth={1.8} />
      <Line x1={10} y1={10} x2={44} y2={10} stroke={WOOD_DARK} strokeWidth={1.4} />
      <Path d="M10,10 L19,10 Q16,28 20,46 L10,46 Z" fill="#F48FB1" />
      <Path d="M44,10 L35,10 Q38,28 34,46 L44,46 Z" fill="#F48FB1" />
      <Path
        d="M13,12 L13,44 M16,12 L16.6,44 M41,12 L41,44 M38,12 L37.4,44"
        stroke="#EC407A"
        strokeWidth={0.4}
      />
    </G>
  );
}

function Lantern() {
  return (
    <G>
      <Line x1={84} y1={0} x2={84} y2={10} stroke="#8D6E63" strokeWidth={0.6} />
      <Ellipse cx={84} cy={22} rx={9} ry={9} fill="#FFE082" opacity={0.35} />
      <Path d="M80,11 L88,11 L86,13 L82,13 Z" fill="#B8860B" />
      <Path
        d="M81,13 L87,13 L88.6,24 L79.4,24 Z"
        fill="#FFD54F"
        stroke="#B8860B"
        strokeWidth={0.6}
      />
      <Line x1={84} y1={13} x2={84} y2={24} stroke="#B8860B" strokeWidth={0.5} />
      <Path d="M79.4,24 L88.6,24 L86.6,27 L81.4,27 Z" fill="#B8860B" />
    </G>
  );
}

function Bed() {
  return (
    <G>
      <Rect x={146} y={40} width={6} height={50} rx={1} fill={WOOD} />
      <Rect x={72} y={66} width={4} height={24} fill={WOOD_DARK} />
      <Rect x={72} y={70} width={80} height={10} fill={WOOD} />
      <Rect x={74} y={62} width={74} height={8} rx={2} fill="#ECEFF1" />
      {/* Pillow and Jubran's head on it. */}
      <Ellipse cx={134} cy={58} rx={12} ry={5} fill={WHITE} stroke="#CFD8DC" strokeWidth={0.5} />
      <Face cx={132} cy={52} r={6.4} mood="smile" />
      <ShortHair cx={132} cy={52} r={6.4} />
      <Path
        d="M128.4,57.6 Q132,61.6 135.6,57.6 Q135,60.4 132,61 Q129,60.4 128.4,57.6 Z"
        fill={HAIR}
      />
      {/* Bandage around the forehead. */}
      <Path
        d="M125.6,47.6 Q132,44.4 138.4,47.6 L138.2,50.4 Q132,47.4 125.8,50.4 Z"
        fill={WHITE}
        stroke="#CFD8DC"
        strokeWidth={0.4}
      />
      <Path d="M138,48 l3,-1.6 l-0.4,3 Z" fill={WHITE} stroke="#CFD8DC" strokeWidth={0.3} />
      {/* Blue blanket over his body. */}
      <Path d="M78,62 Q80,55 96,55 L124,55 Q130,56 128,62 L128,70 L78,70 Z" fill="#1E88E5" />
      <Path d="M84,60 L122,60" stroke="#64B5F6" strokeWidth={0.8} />
      <Rect x={78} y={62} width={50} height={8} fill="#1976D2" />
      <Hand cx={124} cy={60} r={2.2} />
    </G>
  );
}

function Muhammad() {
  return (
    <G>
      <Rect x={50} y={80} width={16} height={3} rx={1} fill={WOOD} />
      <Line x1={52} y1={83} x2={52} y2={92} stroke={WOOD_DARK} strokeWidth={1.4} />
      <Line x1={64} y1={83} x2={64} y2={92} stroke={WOOD_DARK} strokeWidth={1.4} />
      <Path
        d="M48,84 Q48,58 58,55 Q68,58 68,84 Z"
        fill={WHITE}
        stroke="#E0E0E0"
        strokeWidth={0.6}
      />
      <Path d="M58,56 L58,70" stroke="#E0E0E0" strokeWidth={0.6} />
      <Path d="M56,84 L56,92 M61,84 L61,92" stroke="#ECEFF1" strokeWidth={4} />
      <Ellipse cx={56} cy={93} rx={2.6} ry={1.2} fill="#5D4037" />
      <Ellipse cx={61.4} cy={93} rx={2.6} ry={1.2} fill="#5D4037" />
      {/* Hand raised as he talks to Jubran. */}
      <Path
        d="M66,62 Q74,62 76,55"
        stroke={WHITE}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      <Hand cx={76.4} cy={54} r={2} />
      <Face cx={58} cy={47} r={6.6} mood="open" />
      <ShortHair cx={58} cy={47} r={6.6} />
    </G>
  );
}

function PrayerMat() {
  return (
    <G>
      <Path d="M8,96 L16,82 L42,82 L36,96 Z" fill="#2E7D32" />
      <Path
        d="M12.6,93.6 L18.4,84 L38.6,84 L33.6,93.6 Z"
        fill="none"
        stroke="#FDD835"
        strokeWidth={0.6}
      />
      <Path d="M22,90 Q27,84 32,90" stroke="#FDD835" strokeWidth={0.6} fill="none" />
    </G>
  );
}

export function Sickbed() {
  return (
    <G>
      <Rect x={0} y={0} width={160} height={80} fill="#FDEFE4" />
      <Rect x={0} y={78} width={160} height={22} fill="#BCAAA4" />
      <Ellipse cx={80} cy={92} rx={78} ry={9} fill="#F8BBD0" />
      <Ellipse cx={80} cy={92} rx={72} ry={7} fill="none" stroke="#F06292" strokeWidth={0.6} />
      <Window />
      <Lantern />
      <PrayerMat />
      <Bed />
      <Muhammad />
    </G>
  );
}
