/**
 * أقرأ وأتعلم Part 1, p. 153 (7-2 أَسْنَانُ وَسِيمٍ): a boy in a green striped jumper stands
 * at a blue bathroom sink, holding his cheek and crying; the mirror shows a decayed tooth
 * with a cavity (the teeth that speak in the story); a toothbrush cup on the sink and a
 * pink towel on the rail.
 */

import React from "react";
import { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";

import { Face, Hand, ShortHair, WHITE } from "./parts";

const JUMPER = "#43A047";
const STRIPE = "#2E7D32";

function Mirror() {
  return (
    <G>
      <Rect x={78} y={8} width={40} height={38} rx={4} fill="#B0BEC5" />
      <Rect x={80.5} y={10.5} width={35} height={33} rx={3} fill="#E3F2FD" />
      <Path d="M84,14 L92,14 L84,22 Z" fill={WHITE} opacity={0.7} />
      {/* The decayed tooth, sad, with a brown cavity. */}
      <Path
        d="M88,18 Q98,13 108,18 Q111,26 107,33 Q105,40 102.5,40 Q100.5,40 99.6,34 Q98,31.5 96.4,34 Q95.5,40 93.5,40 Q91,40 89,33 Q85,26 88,18 Z"
        fill={WHITE}
        stroke="#B0BEC5"
        strokeWidth={0.7}
      />
      <Ellipse cx={103.6} cy={20.6} rx={2.8} ry={2.2} fill="#6D4C41" />
      <Ellipse cx={103.2} cy={20.2} rx={1.4} ry={1} fill="#3E2723" />
      <Circle cx={94.6} cy={25} r={0.9} fill="#37474F" />
      <Circle cx={100.6} cy={25} r={0.9} fill="#37474F" />
      <Path
        d="M95.4,29.6 Q97.6,27.8 99.8,29.6"
        stroke="#37474F"
        strokeWidth={0.7}
        fill="none"
        strokeLinecap="round"
      />
    </G>
  );
}

function Sink() {
  return (
    <G>
      <Rect x={92} y={70} width={12} height={24} fill="#90CAF9" />
      <Path d="M74,60 L122,60 Q121,72 98,72 Q75,72 74,60 Z" fill="#42A5F5" />
      <Rect x={72} y={57.5} width={52} height={3.6} rx={1.4} fill="#64B5F6" />
      <Ellipse cx={98} cy={61} rx={18} ry={2} fill="#1E88E5" />
      <Path d="M96,57.5 L96,52 Q96,50 98,50 L103,50 L103,52 L98.6,52 L98.6,57.5 Z" fill="#B0BEC5" />
      <Circle cx={93} cy={55.5} r={1.4} fill="#CFD8DC" />
      {/* Toothbrush cup. */}
      <Rect x={110} y={51} width={5.4} height={6.6} rx={0.8} fill="#FFCA28" />
      <Line x1={112} y1={51} x2={110.6} y2={43} stroke="#26C6DA" strokeWidth={1} />
      <Rect x={109.2} y={41} width={2} height={3} rx={0.4} fill={WHITE} />
      <Line x1={113.6} y1={51} x2={115.6} y2={44} stroke="#EC407A" strokeWidth={1} />
      <Rect x={115} y={42} width={2} height={3} rx={0.4} fill={WHITE} />
    </G>
  );
}

function Towel() {
  return (
    <G>
      <Line
        x1={130}
        y1={40}
        x2={154}
        y2={40}
        stroke="#90A4AE"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path d="M133,40 L151,40 L150,66 L134,66 Z" fill="#F48FB1" />
      <Rect x={134} y={60} width={16} height={2} fill="#EC407A" />
      <Rect x={134} y={63} width={16} height={1} fill="#EC407A" />
    </G>
  );
}

function Boy() {
  const stripes = [66, 72, 78, 84, 90];
  return (
    <G>
      <Path d="M30,100 Q30,62 50,58 Q70,62 70,100 Z" fill={JUMPER} />
      {stripes.map((y) => (
        <Rect key={y} x={30.6} y={y} width={38.8} height={2.2} fill={STRIPE} />
      ))}
      <Path d="M44,58.6 Q50,63 56,58.6" stroke={STRIPE} strokeWidth={1.4} fill="none" />
      {/* Hand on the aching cheek. */}
      <Path
        d="M65,66 Q72,60 62,48"
        stroke={JUMPER}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M34,68 Q31,80 34,92"
        stroke={JUMPER}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
      <Hand cx={34.4} cy={93} r={3} />
      <Rect x={46.5} y={52} width={7} height={7} fill="#A86F45" />
      <Face cx={50} cy={42} r={11} mood="cry" />
      <ShortHair cx={50} cy={42} r={11} />
      <Hand cx={60.6} cy={46} r={3.6} />
      {/* "آحْ": pain marks. */}
      <Path
        d="M66,32 l4,-3 M67,37 l5,-1 M66,42 l4,1"
        stroke="#E53935"
        strokeWidth={1}
        strokeLinecap="round"
      />
    </G>
  );
}

export function Toothache() {
  const tiles = [12, 24, 36, 48, 60, 72, 84, 96, 108, 120, 132, 144, 156];
  return (
    <G>
      <Rect x={0} y={0} width={160} height={94} fill="#E1F5FE" />
      {tiles.map((x) => (
        <Line key={x} x1={x} y1={0} x2={x} y2={94} stroke="#B3E5FC" strokeWidth={0.5} />
      ))}
      {[12, 24, 36, 48, 60, 72, 84].map((y) => (
        <Line key={y} x1={0} y1={y} x2={160} y2={y} stroke="#B3E5FC" strokeWidth={0.5} />
      ))}
      <Rect x={0} y={94} width={160} height={6} fill="#90A4AE" />
      <Mirror />
      <Towel />
      <Sink />
      <Boy />
    </G>
  );
}
