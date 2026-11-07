/**
 * The pictures of the books and units: small flat drawings of Yemeni life that say what a unit
 * is about (a Sana'a house for the family, an ibriq for washing, terraces for the village, the
 * trader's coffee sacks for counting). They replace the emoji, which look different on every
 * phone and are foreign to the child's world. Drawn in a 100 × 100 box, like components/art.
 */

import React from "react";
import { View } from "react-native";
import { Circle, Ellipse, G, Path, Rect, Svg, Text as SvgText } from "react-native-svg";

import { Art } from "@/components/art/Art";
import type { EmblemId } from "@/content/types";
import { yemen } from "@/theme/tokens";

const INK = "#2B1D14";
const WOOD = "#8E5A36";
const WOOD_DARK = "#5E3220";
const BRASS = "#C98A3A";
const BRASS_LIGHT = "#E3B36A";
const PAPER = "#FFF8EC";
const SKIN = "#C68A5B";
const SKIN_SHADE = "#A86F45";
const LEAF = "#3F8A4E";
const LEAF_LIGHT = "#5BA05F";
const WATER = "#4F8FD6";
const REED = "#C9A16B";

function Letter({
  x,
  y,
  text,
  fill,
  size = 26,
}: {
  x: number;
  y: number;
  text: string;
  fill: string;
  size?: number;
}) {
  return (
    <SvgText x={x} y={y} fontSize={size} fontWeight="900" fill={fill} textAnchor="middle">
      {text}
    </SvgText>
  );
}

/** Arabic book: an open book with its first letters. */
function BookArabic() {
  return (
    <>
      <Path d="M8 32 L50 40 L92 32 L92 80 L50 88 L8 80 Z" fill={yemen.blue} />
      <Path
        d="M13 26 Q32 21 50 32 L50 82 Q32 72 13 76 Z"
        fill={PAPER}
        stroke="#D9C7A8"
        strokeWidth={2}
      />
      <Path
        d="M87 26 Q68 21 50 32 L50 82 Q68 72 87 76 Z"
        fill={PAPER}
        stroke="#D9C7A8"
        strokeWidth={2}
      />
      <Letter x={69} y={64} text="أ" fill={yemen.red} size={30} />
      <Letter x={31} y={62} text="ب" fill={yemen.green} size={30} />
      <Path d="M58 84 v12 l4 -4 l4 4 v-13" fill={yemen.gold} />
    </>
  );
}

/** "My Arabic language": an inkwell and a reed pen (qalam). */
function BookLughati() {
  return (
    <>
      <Path d="M54 50 L84 10" stroke={REED} strokeWidth={7} strokeLinecap="round" />
      <Path d="M84 10 L88 6" stroke={WOOD_DARK} strokeWidth={4} strokeLinecap="round" />
      <Path d="M26 60 h48 v18 a10 10 0 0 1 -10 10 h-28 a10 10 0 0 1 -10 -10 z" fill={yemen.blue} />
      <Rect x={26} y={66} width={48} height={5} fill={yemen.gold} />
      <Rect x={38} y={48} width={24} height={13} fill={yemen.blueDeep} />
      <Ellipse cx={50} cy={48} rx={14} ry={4.5} fill={INK} />
      <Path
        d="M32 76 q0 6 6 8"
        stroke="#FFFFFF"
        strokeOpacity={0.5}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

/** Maths book: a wooden counting frame. */
function BookMath() {
  const rows: [number, string, number][] = [
    [32, yemen.red, 3],
    [50, yemen.gold, 2],
    [68, yemen.blue, 4],
  ];
  return (
    <>
      <Path d="M20 82 l-6 12 M80 82 l6 12" stroke={WOOD} strokeWidth={6} strokeLinecap="round" />
      <Rect
        x={14}
        y={16}
        width={72}
        height={68}
        rx={8}
        fill={PAPER}
        stroke={WOOD}
        strokeWidth={7}
      />
      {rows.map(([y, fill, count]) => (
        <G key={y}>
          <Path d={`M18 ${y} H82`} stroke="#B9A58E" strokeWidth={3} />
          {Array.from({ length: count }, (_, i) => (
            <Ellipse
              key={i}
              cx={76 - i * 12}
              cy={y}
              rx={5.5}
              ry={7}
              fill={fill}
              stroke={INK}
              strokeOpacity={0.25}
              strokeWidth={1.5}
            />
          ))}
        </G>
      ))}
    </>
  );
}

/** Science book: a leaf under a magnifying glass. */
function BookScience() {
  return (
    <>
      <Path d="M18 80 Q14 32 66 20 Q76 66 18 80 Z" fill={LEAF} />
      <Path d="M18 80 Q42 54 66 20" stroke="#1C5534" strokeWidth={3} fill="none" />
      <Path d="M71 69 L88 86" stroke={WOOD} strokeWidth={10} strokeLinecap="round" />
      <Circle
        cx={58}
        cy={56}
        r={19}
        fill="#FFFFFF"
        fillOpacity={0.45}
        stroke={WOOD_DARK}
        strokeWidth={6}
      />
    </>
  );
}

/** Getting ready to write: a wooden board (lawh) with a wavy line to trace, and a reed pen. */
function Lawh() {
  return (
    <>
      <Path d="M40 24 v-8 a10 10 0 0 1 20 0 v8" fill="#D9A866" stroke={WOOD} strokeWidth={3} />
      <Circle cx={50} cy={16} r={3} fill={WOOD} />
      <Path
        d="M20 24 h60 v60 a6 6 0 0 1 -6 6 h-48 a6 6 0 0 1 -6 -6 z"
        fill="#D9A866"
        stroke={WOOD}
        strokeWidth={3}
      />
      <Path
        d="M28 46 q8 -10 16 0 t16 0 t16 0"
        stroke={INK}
        strokeWidth={3.5}
        strokeDasharray="0.5 7"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M28 66 q8 -10 16 0 t16 0"
        stroke={yemen.blue}
        strokeWidth={4.5}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M62 70 L90 38" stroke={REED} strokeWidth={6} strokeLinecap="round" />
      <Path d="M62 70 L59 74" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    </>
  );
}

/** Caring for others (the teacher, a sick brother, the orphanage): a heart held in two hands. */
function CaringHands() {
  return (
    <>
      <Path
        d="M50 60 C28 47 24 30 37 23 C44 19 50 24 50 30 C50 24 56 19 63 23 C76 30 72 47 50 60 Z"
        fill={yemen.red}
      />
      <Path
        d="M38 30 q-5 3 -4 9"
        stroke="#FFFFFF"
        strokeOpacity={0.55}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M8 58 L20 50 L28 62 L16 70 Z" fill={yemen.blue} />
      <Path d="M92 58 L80 50 L72 62 L84 70 Z" fill={yemen.green} />
      <Path d="M20 54 Q26 76 50 82 L50 72 Q36 70 30 56 Q26 50 20 54 Z" fill={SKIN} />
      <Path d="M80 54 Q74 76 50 82 L50 72 Q64 70 70 56 Q74 50 80 54 Z" fill={SKIN_SHADE} />
    </>
  );
}

/** "A house of sand": a little Sana'a tower built of sand on the beach. */
function SandHouse() {
  return (
    <>
      <Circle cx={84} cy={16} r={8} fill={yemen.gold} />
      <Path d="M0 66 Q25 60 50 66 T100 66 V100 H0 Z" fill={WATER} />
      <Path
        d="M0 74 Q25 68 50 74 T100 74"
        stroke="#FFFFFF"
        strokeOpacity={0.6}
        strokeWidth={2.5}
        fill="none"
      />
      <Path d="M0 82 Q50 70 100 84 V100 H0 Z" fill="#E8C690" />
      <Path
        d="M30 32 h4 v-6 h6 v6 h6 v-6 h6 v6 h6 v-6 h6 v6 h4 v48 h-38 z"
        fill="#D9B077"
        stroke="#B48A50"
        strokeWidth={2}
      />
      <Path d="M44 46 a6 6 0 0 1 12 0 z" fill={yemen.red} />
      <Rect x={44} y={46} width={12} height={9} fill="#9C7444" />
      <Path d="M43 80 v-10 a7 7 0 0 1 14 0 v10 z" fill="#9C7444" />
      <Path d="M74 72 h16 l-2.5 14 h-11 z" fill={yemen.red} />
      <Path d="M75 72 q7 -10 14 0" stroke={INK} strokeWidth={2} fill="none" />
    </>
  );
}

/** "Saber and the bulbul": the bulbul, a songbird of Yemen's gardens, on a branch. */
function Bulbul() {
  return (
    <>
      <Path
        d="M6 72 Q50 62 94 74"
        stroke={WOOD}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
      <Ellipse cx={16} cy={66} rx={8} ry={4} fill={LEAF} transform="rotate(-25 16 66)" />
      <Ellipse cx={86} cy={66} rx={8} ry={4} fill={LEAF_LIGHT} transform="rotate(20 86 66)" />
      <Path d="M44 66 v6 M54 66 v6" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M64 50 L90 40 L88 52 L68 60 Z" fill="#6E5B48" />
      <Ellipse cx={50} cy={52} rx={21} ry={15} fill="#A08C76" />
      <Ellipse cx={45} cy={58} rx={13} ry={8} fill="#EFE5D3" />
      <Ellipse cx={66} cy={62} rx={6} ry={4} fill="#F4C14B" />
      <Path d="M46 44 Q63 41 69 54 Q55 59 46 44 Z" fill="#7A6650" />
      <Circle cx={34} cy={36} r={12} fill={INK} />
      <Path d="M30 26 L27 15 L38 24 Z" fill={INK} />
      <Circle cx={30} cy={35} r={3.5} fill="#FFFFFF" />
      <Circle cx={29.5} cy={35} r={1.8} fill={INK} />
      <Path d="M23 38 L13 40 L23 43 Z" fill={INK} />
    </>
  );
}

/** Cleanliness: a brass ibriq pouring water, and soap bubbles. */
function Ibriq() {
  return (
    <>
      <Path
        d="M16 40 q-4 14 0 30"
        stroke={WATER}
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M10 78 q2 4 4 0 M20 82 q2 4 4 0"
        stroke={WATER}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M36 58 Q22 52 15 36 L20 34 Q26 48 38 51 Z"
        fill={BRASS}
        stroke={WOOD}
        strokeWidth={2}
      />
      <Path
        d="M66 46 Q86 54 68 76"
        stroke={WOOD}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M36 44 Q24 64 34 86 h32 Q76 64 64 44 Z" fill={BRASS} stroke={WOOD} strokeWidth={2} />
      <Path d="M30 64 h40" stroke={yemen.red} strokeWidth={4} />
      <Path d="M31 70 h38" stroke={yemen.gold} strokeWidth={2} />
      <Rect x={41} y={32} width={18} height={13} fill={BRASS} stroke={WOOD} strokeWidth={2} />
      <Path d="M38 33 h24 l-5 -8 h-14 z" fill={yemen.clay} />
      <Circle cx={50} cy={22} r={3.5} fill={yemen.clay} />
      <Path
        d="M42 50 q-6 12 -2 26"
        stroke="#FFFFFF"
        strokeOpacity={0.45}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Circle
        cx={80}
        cy={24}
        r={8}
        fill="#FFFFFF"
        fillOpacity={0.85}
        stroke={WATER}
        strokeWidth={2}
      />
      <Circle
        cx={90}
        cy={38}
        r={4.5}
        fill="#FFFFFF"
        fillOpacity={0.85}
        stroke={WATER}
        strokeWidth={2}
      />
      <Circle
        cx={72}
        cy={11}
        r={3.5}
        fill="#FFFFFF"
        fillOpacity={0.85}
        stroke={WATER}
        strokeWidth={2}
      />
    </>
  );
}

/** "In the village": green terraces up a mountain, a tower house on top. */
function Terraces() {
  const bands: [string, string][] = [
    ["M4 90 h92 l-9 -13 h-74 z", LEAF],
    ["M13 77 h74 l-9 -13 h-56 z", LEAF_LIGHT],
    ["M22 64 h56 l-9 -13 h-38 z", LEAF],
    ["M31 51 h38 l-8 -11 h-22 z", LEAF_LIGHT],
  ];
  return (
    <>
      <Circle cx={84} cy={16} r={8} fill={yemen.gold} />
      {bands.map(([d, fill]) => (
        <Path key={d} d={d} fill={fill} />
      ))}
      <Path d="M13 77 h74 M22 64 h56 M31 51 h38" stroke="#A0764A" strokeWidth={2.5} />
      <Rect x={41} y={16} width={18} height={25} fill="#A55B34" />
      <Path d="M41 16 v-4 h4 v4 h3 v-4 h4 v4 h3 v-4 h4 v4" fill="#A55B34" />
      <Rect x={41} y={23} width={18} height={2.5} fill="#F7F0E1" />
      <Path d="M45 32 a5 5 0 0 1 10 0 z" fill={yemen.red} />
      <Rect x={45} y={32} width={10} height={5} fill="#F7F0E1" />
    </>
  );
}

/** Sorting and patterns: a woven palm basket with zigzag bands, and beads in a pattern. */
function Basket() {
  const zig = (y: number, h: number) =>
    `M20 ${y} ${Array.from({ length: 10 }, (_, i) => `l6 ${i % 2 === 0 ? -h : h}`).join(" ")}`;
  return (
    <>
      <Circle cx={26} cy={30} r={9} fill={yemen.red} />
      <Circle cx={50} cy={27} r={9} fill={yemen.gold} />
      <Circle cx={74} cy={30} r={9} fill={yemen.red} />
      <Path
        d="M16 46 h68 l-8 38 a6 6 0 0 1 -6 5 h-40 a6 6 0 0 1 -6 -5 z"
        fill={BRASS_LIGHT}
        stroke="#9C6B2E"
        strokeWidth={2}
      />
      <Path d={zig(62, 8)} stroke={yemen.red} strokeWidth={4} strokeLinejoin="round" fill="none" />
      <Path
        d={zig(77, 6)}
        stroke={yemen.green}
        strokeWidth={4}
        strokeLinejoin="round"
        fill="none"
        transform="translate(2 0) scale(0.96 1)"
      />
      <Rect x={12} y={40} width={76} height={10} rx={5} fill={BRASS} />
    </>
  );
}

function Sack({ cx, w, h, n }: { cx: number; w: number; h: number; n: string }) {
  const base = 88;
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const top = base - h;
  return (
    <G>
      <Path
        d={`M${x0} ${base} Q${x0 - 5} ${top + h * 0.35} ${cx - w * 0.22} ${top + 8} H${cx + w * 0.22} Q${x1 + 5} ${top + h * 0.35} ${x1} ${base} Z`}
        fill={REED}
        stroke={WOOD}
        strokeWidth={2}
      />
      <Path
        d={`M${cx - 7} ${top + 8} L${cx - 9} ${top} L${cx} ${top + 4} L${cx + 9} ${top} L${cx + 7} ${top + 8} Z`}
        fill={REED}
        stroke={WOOD}
        strokeWidth={2}
      />
      <Path
        d={`M${cx - w * 0.24} ${top + 10} H${cx + w * 0.24}`}
        stroke={yemen.red}
        strokeWidth={3}
      />
      <Letter x={cx} y={base - h * 0.2} text={n} fill={WOOD_DARK} size={24} />
    </G>
  );
}

/** Numbers: the Mocha trader's coffee sacks, counted one, two, three. */
function CoffeeSacks() {
  return (
    <>
      <Sack cx={79} w={32} h={50} n="١" />
      <Sack cx={21} w={32} h={50} n="٣" />
      <Sack cx={50} w={36} h={66} n="٢" />
      <Ellipse cx={14} cy={93} rx={3} ry={2} fill={WOOD_DARK} />
      <Ellipse cx={86} cy={94} rx={3} ry={2} fill={WOOD_DARK} />
    </>
  );
}

function DateFruit({ x, y, r = 0 }: { x: number; y: number; r?: number }) {
  return (
    <Ellipse
      cx={x}
      cy={y}
      rx={5.5}
      ry={9}
      fill="#7A3418"
      stroke="#4A1E0C"
      strokeWidth={1.2}
      transform={`rotate(${r} ${x} ${y})`}
    />
  );
}

function Badge({ sign, fill }: { sign: "+" | "-"; fill: string }) {
  return (
    <G>
      <Circle cx={82} cy={20} r={13} fill={fill} stroke="#FFFFFF" strokeWidth={3} />
      <Path
        d={sign === "+" ? "M75 20 h14 M82 13 v14" : "M75 20 h14"}
        stroke="#FFFFFF"
        strokeWidth={4}
        strokeLinecap="round"
      />
    </G>
  );
}

/** Adding: dates on a brass tray, and one more coming. */
function DatesTray() {
  return (
    <>
      <Ellipse cx={46} cy={72} rx={40} ry={15} fill={BRASS} stroke={WOOD} strokeWidth={2} />
      <Ellipse cx={46} cy={70} rx={31} ry={10} fill={BRASS_LIGHT} />
      <DateFruit x={34} y={64} r={-20} />
      <DateFruit x={46} y={66} r={10} />
      <DateFruit x={60} y={40} r={30} />
      <Path
        d="M66 30 q8 4 6 14 M58 28 q-6 2 -6 8"
        stroke={WOOD}
        strokeOpacity={0.5}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
      <Badge sign="+" fill={yemen.green} />
    </>
  );
}

function Pomegranate({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <G>
      <Circle cx={x} cy={y} r={r} fill={yemen.red} />
      <Path d={`M${x - 5} ${y - r + 2} l1 -7 l3 4 l1 -5 l1 5 l3 -4 l1 7 z`} fill="#8E2A1F" />
      <Circle cx={x - r * 0.4} cy={y - r * 0.35} r={r * 0.22} fill="#FFFFFF" fillOpacity={0.45} />
    </G>
  );
}

/** Taking away: pomegranates on a plate, one rolls away. */
function Pomegranates() {
  return (
    <>
      <Ellipse cx={38} cy={76} rx={32} ry={11} fill={BRASS} stroke={WOOD} strokeWidth={2} />
      <Pomegranate x={28} y={62} r={13} />
      <Pomegranate x={50} y={62} r={13} />
      <Path d="M62 86 h8 M60 79 h6" stroke="#B9A58E" strokeWidth={3} strokeLinecap="round" />
      <Pomegranate x={84} y={82} r={10} />
      <Badge sign="-" fill={yemen.clay} />
    </>
  );
}

/** Shapes and fractions: a Sana'a window, its qamariya split in two halves over a square pane. */
function ShapesWindow() {
  return (
    <>
      <Path
        d="M18 92 V46 a32 32 0 0 1 64 0 V92 Z"
        fill="#F7F0E1"
        stroke="#D9C7A8"
        strokeWidth={2.5}
      />
      <Path d="M50 46 L23 46 A27 27 0 0 1 50 19 Z" fill={yemen.red} />
      <Path d="M50 46 L50 19 A27 27 0 0 1 77 46 Z" fill={yemen.blue} />
      <Path d="M50 19 V46 M23 46 H77" stroke="#F7F0E1" strokeWidth={3} />
      <Rect x={24} y={52} width={52} height={34} fill={WOOD} />
      <Path d="M38 81 l12 -24 l12 24 z" fill={yemen.gold} />
    </>
  );
}

/** Science, my body: an open hand. */
function Hand() {
  return (
    <>
      <Rect x={30} y={22} width={10} height={32} rx={5} fill={SKIN} />
      <Rect x={42} y={14} width={10} height={40} rx={5} fill={SKIN} />
      <Rect x={54} y={16} width={10} height={38} rx={5} fill={SKIN} />
      <Rect x={66} y={26} width={9} height={30} rx={4.5} fill={SKIN} />
      <Rect x={16} y={46} width={10} height={26} rx={5} fill={SKIN} transform="rotate(-40 21 59)" />
      <Path d="M30 44 h45 v16 a22 22 0 0 1 -22 22 h-1 a22 22 0 0 1 -22 -22 z" fill={SKIN} />
      <Path
        d="M44 62 q8 6 16 0"
        stroke={SKIN_SHADE}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
      <Rect x={36} y={80} width={32} height={14} rx={3} fill={yemen.blue} />
    </>
  );
}

/** Science, animals: a camel with a woven saddle cloth. */
function Camel() {
  return (
    <>
      <Path
        d="M30 58 v28 M40 60 v26 M62 60 v26 M72 58 v28"
        stroke="#B48A50"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <Path
        d="M80 52 q8 4 6 14"
        stroke="#B48A50"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M26 60 Q24 44 38 44 Q50 18 66 40 Q80 42 80 56 Q60 66 26 60 Z" fill={REED} />
      <Path
        d="M30 54 Q18 46 18 26"
        stroke={REED}
        strokeWidth={10}
        strokeLinecap="round"
        fill="none"
      />
      <Ellipse cx={14} cy={24} rx={10} ry={6.5} fill={REED} />
      <Circle cx={14} cy={21} r={1.8} fill={INK} />
      <Path d="M44 40 h20 v12 h-20 z" fill={yemen.red} />
      <Path d="M44 46 h20" stroke={yemen.gold} strokeWidth={2.5} />
    </>
  );
}

/** Science, plants and water: a coffee seedling with red cherries, and a drop of water. */
function Seedling() {
  return (
    <>
      <Ellipse cx={46} cy={86} rx={32} ry={8} fill={WOOD} />
      <Path d="M46 86 V46" stroke={LEAF} strokeWidth={4} strokeLinecap="round" />
      <Path d="M46 62 Q26 60 20 42 Q40 38 46 62 Z" fill={LEAF} />
      <Path d="M46 52 Q66 50 72 32 Q52 28 46 52 Z" fill={LEAF_LIGHT} />
      <Circle cx={52} cy={70} r={4.5} fill={yemen.red} />
      <Circle cx={58} cy={66} r={4.5} fill={yemen.red} />
      <Path d="M82 10 Q72 24 72 30 a10 10 0 0 0 20 0 Q92 24 82 10 Z" fill={WATER} />
      <Path
        d="M78 28 q0 5 4 6"
        stroke="#FFFFFF"
        strokeOpacity={0.6}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

const DRAWN: Partial<Record<EmblemId, () => React.JSX.Element>> = {
  book_arabic: BookArabic,
  book_lughati: BookLughati,
  book_math: BookMath,
  book_science: BookScience,
  lawh: Lawh,
  caring_hands: CaringHands,
  sand_house: SandHouse,
  bulbul: Bulbul,
  ibriq: Ibriq,
  terraces: Terraces,
  basket: Basket,
  coffee_sacks: CoffeeSacks,
  dates_tray: DatesTray,
  pomegranates: Pomegranates,
  hand: Hand,
  camel: Camel,
  seedling: Seedling,
  shapes_window: ShapesWindow,
};

/** Emblems that reuse the Yemeni illustrations of components/art. */
const FROM_ART: Partial<Record<EmblemId, "house" | "school">> = {
  house: "house",
  school: "school",
};

export function Emblem({ id, size = 44 }: { id: EmblemId; size?: number }) {
  const art = FROM_ART[id];
  if (art) return <Art art={art} size={size} />;
  const Drawing = DRAWN[id];
  if (!Drawing) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Drawing />
    </Svg>
  );
}

/** An emblem on a round paper disc, so its colours read on any coloured tile or stop. */
export function EmblemDisc({ id, size }: { id: EmblemId; size: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: PAPER,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Emblem id={id} size={size * 0.84} />
    </View>
  );
}
