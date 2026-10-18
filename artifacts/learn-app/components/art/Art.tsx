/**
 * Small flat illustrations of Yemeni life, drawn as inline SVG so they work
 * offline and on every platform. Each drawing uses a 100 × 100 view box.
 */

import React from "react";
import { Circle, Ellipse, G, Line, Path, Rect, Svg } from "react-native-svg";

import type { ArtId } from "@/content/types";

const SKIN = "#C68A5B";
const SKIN_SHADE = "#A86F45";
const INK = "#3B2A20";
const GYPSUM = "#F7F0E1";
const BRICK = "#A55B34";
const STONE = "#6E4B33";
const WOOD = "#6B3F1F";
const GLASS = ["#D7263D", "#F4B400", "#1E88E5"];

type Props = { art: ArtId; size?: number; accessibilityLabel?: string };

export function Art({ art, size = 44, accessibilityLabel }: Props) {
  const Drawing = DRAWINGS[art];
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
    >
      <Drawing />
    </Svg>
  );
}

/** Semicircular stained glass window, centred on (cx, baseY). */
function QamariyaArch({ cx, baseY, r }: { cx: number; baseY: number; r: number }) {
  const wedges = GLASS.map((fill, i) => {
    const a0 = Math.PI + (i * Math.PI) / 3;
    const a1 = Math.PI + ((i + 1) * Math.PI) / 3;
    const x0 = cx + r * Math.cos(a0);
    const y0 = baseY + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = baseY + r * Math.sin(a1);
    return (
      <Path key={i} d={`M${cx},${baseY} L${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1} Z`} fill={fill} />
    );
  });
  return (
    <G>
      <Path
        d={`M${cx - r - 1.5},${baseY} A${r + 1.5},${r + 1.5} 0 0 1 ${cx + r + 1.5},${baseY} Z`}
        fill={GYPSUM}
      />
      {wedges}
      <Circle cx={cx} cy={baseY} r={r * 0.28} fill={GYPSUM} />
    </G>
  );
}

/** Rectangular window with a gypsum frame and a qamariya above it. */
function TowerWindow({ x, y }: { x: number; y: number }) {
  return (
    <G>
      <QamariyaArch cx={x + 5} baseY={y} r={5} />
      <Rect x={x - 1.2} y={y - 0.2} width={12.4} height={11.4} fill={GYPSUM} />
      <Rect x={x + 0.8} y={y + 1.6} width={8.4} height={8} fill="#3E2C22" />
      <Line x1={x + 5} y1={y + 1.6} x2={x + 5} y2={y + 9.6} stroke={GYPSUM} strokeWidth={1} />
    </G>
  );
}

/** Sana'a tower house: stone base, brick upper floors, gypsum bands and qamariya windows. */
function House() {
  const crenels = [24, 32, 40, 48, 56, 64, 72];
  return (
    <G>
      <Rect x={20} y={12} width={60} height={86} fill={BRICK} />
      <Rect x={20} y={70} width={60} height={28} fill={STONE} />
      {crenels.map((x) => (
        <Path key={x} d={`M${x - 3},12 L${x},6 L${x + 3},12 Z`} fill={GYPSUM} />
      ))}
      <Rect x={20} y={11} width={60} height={2.5} fill={GYPSUM} />
      <Rect x={20} y={38} width={60} height={2.5} fill={GYPSUM} />
      <Rect x={20} y={60} width={60} height={2.5} fill={GYPSUM} />
      <Path
        d="M20,42.5 l4,4 l4,-4 l4,4 l4,-4 l4,4 l4,-4 l4,4 l4,-4 l4,4 l4,-4 l4,4 l4,-4 l4,4 l4,-4"
        stroke={GYPSUM}
        strokeWidth={1.2}
        fill="none"
      />
      <TowerWindow x={28} y={22} />
      <TowerWindow x={61} y={22} />
      <TowerWindow x={28} y={49} />
      <TowerWindow x={61} y={49} />
      <QamariyaArch cx={50} baseY={30} r={6} />
      <Path d="M42,98 L42,82 A8,8 0 0 1 58,82 L58,98 Z" fill={GYPSUM} />
      <Path d="M44,98 L44,82.5 A6,6 0 0 1 56,82.5 L56,98 Z" fill={WOOD} />
      <Circle cx={53.5} cy={90} r={1} fill="#E0B44C" />
    </G>
  );
}

function Qamariya() {
  return (
    <G>
      <Rect x={14} y={52} width={72} height={40} fill={GYPSUM} />
      <QamariyaArch cx={50} baseY={52} r={34} />
      <Rect x={20} y={58} width={60} height={30} fill="#3E2C22" />
      <Line x1={50} y1={58} x2={50} y2={88} stroke={GYPSUM} strokeWidth={2.5} />
      <Line x1={20} y1={73} x2={80} y2={73} stroke={GYPSUM} strokeWidth={2.5} />
    </G>
  );
}

/** Arched wooden door with studs, framed in gypsum. */
function Door() {
  const studs = [30, 42, 54, 66, 78];
  return (
    <G>
      <Rect x={14} y={6} width={72} height={92} fill={BRICK} />
      <Path d="M24,98 L24,40 A26,26 0 0 1 76,40 L76,98 Z" fill={GYPSUM} />
      <Path d="M29,98 L29,41 A21,21 0 0 1 71,41 L71,98 Z" fill={WOOD} />
      <QamariyaArch cx={50} baseY={41} r={15} />
      <Line x1={50} y1={41} x2={50} y2={98} stroke="#4A2A12" strokeWidth={1.5} />
      {studs.map((y) => (
        <G key={y}>
          <Circle cx={39} cy={y} r={1.5} fill="#E0B44C" />
          <Circle cx={61} cy={y} r={1.5} fill="#E0B44C" />
        </G>
      ))}
      <Circle cx={46} cy={70} r={2.4} fill="none" stroke="#E0B44C" strokeWidth={1.4} />
    </G>
  );
}

/** White mosque with a slender banded minaret and a dome. */
function Mosque() {
  return (
    <G>
      <Rect x={10} y={56} width={64} height={40} fill={GYPSUM} stroke="#D8CDB6" strokeWidth={1} />
      <Path d="M22,56 A20,20 0 0 1 62,56 Z" fill="#FFFFFF" stroke="#D8CDB6" strokeWidth={1} />
      <Line x1={42} y1={36} x2={42} y2={29} stroke="#C9A227" strokeWidth={1.5} />
      <Path d="M44,26 A3.5,3.5 0 1 1 44,32 A2.6,2.6 0 1 0 44,26 Z" fill="#C9A227" />
      {[20, 36, 52].map((x) => (
        <Path
          key={x}
          d={`M${x},96 L${x},80 A6,6 0 0 1 ${x + 12},80 L${x + 12},96 Z`}
          fill="#2E7D6B"
        />
      ))}
      <Rect x={76} y={22} width={12} height={74} fill={GYPSUM} stroke="#D8CDB6" strokeWidth={1} />
      <Rect x={73} y={40} width={18} height={4} fill="#FFFFFF" stroke="#D8CDB6" strokeWidth={1} />
      <Rect x={73} y={62} width={18} height={4} fill="#FFFFFF" stroke="#D8CDB6" strokeWidth={1} />
      <Rect x={76} y={50} width={12} height={2} fill="#2E7D6B" />
      <Path d="M76,22 L82,8 L88,22 Z" fill="#2E7D6B" />
      <Line x1={82} y1={8} x2={82} y2={3} stroke="#C9A227" strokeWidth={1.5} />
    </G>
  );
}

/** School building with the Yemeni flag on its pole. */
function School() {
  return (
    <G>
      <Rect x={8} y={44} width={84} height={52} fill="#EADCC2" stroke="#C9B48F" strokeWidth={1} />
      <Rect x={8} y={44} width={84} height={5} fill="#2E7D6B" />
      {[16, 34, 58, 76].map((x) => (
        <Rect
          key={x}
          x={x}
          y={56}
          width={10}
          height={12}
          fill="#7FB3D5"
          stroke={GYPSUM}
          strokeWidth={1.5}
        />
      ))}
      <Path d="M43,96 L43,74 A7,7 0 0 1 57,74 L57,96 Z" fill={WOOD} />
      <Line x1={50} y1={44} x2={50} y2={6} stroke="#8D8D8D" strokeWidth={2} />
      <Rect x={51} y={7} width={26} height={6} fill="#CE1126" />
      <Rect x={51} y={13} width={26} height={6} fill="#FFFFFF" stroke="#D0D0D0" strokeWidth={0.4} />
      <Rect x={51} y={19} width={26} height={6} fill="#000000" />
    </G>
  );
}

function Face({ cx, cy, r, smile = true }: { cx: number; cy: number; r: number; smile?: boolean }) {
  return (
    <G>
      <Ellipse cx={cx} cy={cy} rx={r} ry={r * 1.1} fill={SKIN} />
      <Circle cx={cx - r * 0.38} cy={cy - r * 0.1} r={r * 0.11} fill={INK} />
      <Circle cx={cx + r * 0.38} cy={cy - r * 0.1} r={r * 0.11} fill={INK} />
      <Ellipse
        cx={cx - r * 0.62}
        cy={cy + r * 0.3}
        rx={r * 0.16}
        ry={r * 0.1}
        fill="#E39A84"
        opacity={0.7}
      />
      <Ellipse
        cx={cx + r * 0.62}
        cy={cy + r * 0.3}
        rx={r * 0.16}
        ry={r * 0.1}
        fill="#E39A84"
        opacity={0.7}
      />
      {smile ? (
        <Path
          d={`M${cx - r * 0.32},${cy + r * 0.38} Q${cx},${cy + r * 0.66} ${cx + r * 0.32},${cy + r * 0.38}`}
          stroke={INK}
          strokeWidth={r * 0.09}
          fill="none"
          strokeLinecap="round"
        />
      ) : null}
    </G>
  );
}

/** Mother in a long headscarf (maroon with a light inner band) and a green dress. */
function Mother() {
  return (
    <G>
      <Path d="M14,100 Q16,66 50,62 Q84,66 86,100 Z" fill="#2E7D32" />
      <Path d="M24,66 Q20,22 50,16 Q80,22 76,66 Q66,80 50,80 Q34,80 24,66 Z" fill="#8E244D" />
      <Ellipse cx={50} cy={44} rx={19} ry={22} fill="#F3D9E3" />
      <Face cx={50} cy={46} r={15} />
    </G>
  );
}

/** Girl in a white headscarf and a pink dress. */
function Girl() {
  return (
    <G>
      <Path d="M20,100 Q22,72 50,68 Q78,72 80,100 Z" fill="#E7558A" />
      <Path
        d="M27,70 Q24,30 50,24 Q76,30 73,70 Q63,82 50,82 Q37,82 27,70 Z"
        fill="#FFFFFF"
        stroke="#E2DCD3"
        strokeWidth={1}
      />
      <Face cx={50} cy={50} r={15} />
    </G>
  );
}

/** Boy with short dark hair and a yellow shirt. */
function Boy() {
  return (
    <G>
      <Path d="M18,100 Q20,72 50,68 Q80,72 82,100 Z" fill="#F2B705" />
      <Path d="M42,68 L50,78 L58,68 Z" fill="#FFFFFF" />
      <Face cx={50} cy={46} r={18} />
      <Path d="M32,42 Q30,22 50,22 Q70,22 68,42 Q62,32 50,31 Q38,32 32,42 Z" fill="#2B1D16" />
    </G>
  );
}

/** Father in a white thobe and dark jacket, red check head cloth and a jambiya at the belt. */
function Father() {
  return (
    <G>
      <Path d="M10,100 Q12,70 50,64 Q88,70 90,100 Z" fill="#4E5A65" />
      <Path d="M40,66 L50,100 L60,66 Q50,70 40,66 Z" fill="#FFFFFF" />
      <Rect x={22} y={88} width={56} height={6} fill="#2E7D32" />
      <Path
        d="M50,85 Q46,85 46,89 L46,93 Q46,99 56,100 Q50,95 52,90 Q53,86 50,85 Z"
        fill="#B88A2E"
        stroke="#7A5A1A"
        strokeWidth={0.8}
      />
      <Rect x={47.5} y={80} width={5} height={6} rx={1.5} fill="#E8D7A9" />
      <Face cx={50} cy={44} r={16} />
      <Path d="M41,53 Q50,49 59,53 Q55,56 50,55 Q45,56 41,53 Z" fill="#2B1D16" />
      <Path d="M31,40 Q30,18 50,16 Q70,18 69,40 Q60,30 50,30 Q40,30 31,40 Z" fill="#FFFFFF" />
      <Path d="M33,32 Q50,24 67,32" stroke="#C62828" strokeWidth={2.2} fill="none" />
      <Path d="M32,37 Q50,29 68,37" stroke="#C62828" strokeWidth={1.6} fill="none" />
      <Path d="M36,24 Q50,17 64,24" stroke="#C62828" strokeWidth={1.6} fill="none" />
      <Path
        d="M66,34 Q76,40 72,58 Q68,48 64,42 Z"
        fill="#FFFFFF"
        stroke="#E0E0E0"
        strokeWidth={0.6}
      />
      <Ellipse cx={50} cy={47} rx={2} ry={1.4} fill={SKIN_SHADE} />
    </G>
  );
}

/** Plate of Yemeni dates. */
function Dates() {
  const dates: [number, number, number][] = [
    [34, 56, -20],
    [48, 52, 10],
    [62, 56, 30],
    [40, 64, 40],
    [56, 64, -30],
    [48, 44, 0],
    [68, 64, 15],
  ];
  return (
    <G>
      <Ellipse cx={50} cy={68} rx={42} ry={16} fill="#2E7D6B" />
      <Ellipse cx={50} cy={65} rx={36} ry={12} fill="#E8D7A9" />
      {dates.map(([x, y, rot], i) => (
        <G key={i} transform={`rotate(${rot} ${x} ${y})`}>
          <Ellipse cx={x} cy={y} rx={8} ry={4.6} fill="#7B3F1D" />
          <Ellipse cx={x - 2} cy={y - 1.6} rx={3.2} ry={1.2} fill="#B36A3C" />
        </G>
      ))}
    </G>
  );
}

/** Date palm with hanging clusters. */
function Palm() {
  return (
    <G>
      <Path d="M46,98 Q44,70 50,40 Q56,70 56,98 Z" fill="#8B5A2B" />
      {[90, 80, 70, 60, 50].map((y) => (
        <Line key={y} x1={45} y1={y} x2={56} y2={y - 2} stroke="#6B4423" strokeWidth={1.2} />
      ))}
      <Path d="M50,38 Q30,26 10,40 Q30,32 50,40 Z" fill="#2E8B3E" />
      <Path d="M50,38 Q70,26 90,40 Q70,32 50,40 Z" fill="#2E8B3E" />
      <Path d="M50,36 Q34,12 16,16 Q34,20 50,38 Z" fill="#3FA34D" />
      <Path d="M50,36 Q66,12 84,16 Q66,20 50,38 Z" fill="#3FA34D" />
      <Path d="M50,36 Q48,14 52,4 Q54,18 51,38 Z" fill="#2E8B3E" />
      {[40, 44, 56, 60].map((x, i) => (
        <G key={x}>
          <Circle cx={x} cy={46 + (i % 2) * 3} r={3} fill="#C0662B" />
          <Circle cx={x + (x < 50 ? 3 : -3)} cy={50 + (i % 2) * 3} r={3} fill="#A44E1E" />
        </G>
      ))}
    </G>
  );
}

const DRAWINGS: Record<ArtId, () => React.JSX.Element> = {
  house: House,
  qamariya: Qamariya,
  door: Door,
  mosque: Mosque,
  school: School,
  mother: Mother,
  father: Father,
  boy: Boy,
  girl: Girl,
  dates: Dates,
  palm: Palm,
};
