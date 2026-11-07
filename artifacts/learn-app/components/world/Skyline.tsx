/** Old Sana'a: clay tower houses with gypsum bands and qamariya windows, along the bottom of home. */

import React from "react";
import { Path, Rect, Svg } from "react-native-svg";

const TOWERS: [number, number, number, string][] = [
  [0, 40, 72, "#A85F3E"],
  [64, 8, 82, "#8E4A2F"],
  [150, 56, 92, "#B4704C"],
  [234, 20, 80, "#9A5636"],
  [306, 46, 84, "#AE6744"],
];
const WINDOWS: [number, number][] = [
  [14, 98],
  [44, 98],
  [80, 70],
  [116, 70],
  [80, 108],
  [116, 108],
  [166, 108],
  [212, 108],
  [250, 84],
  [284, 84],
  [322, 104],
  [358, 104],
];
const GLASS = ["#C8402F", "#1F5FA8", "#E9A81E"];

export function Skyline({ width = 390 }: { width?: number }) {
  return (
    <Svg
      width={width}
      height={(width * 150) / 390}
      viewBox="0 0 390 150"
      preserveAspectRatio="none"
    >
      {TOWERS.map(([x, y, w, fill]) => (
        <React.Fragment key={x}>
          <Rect x={x} y={y} width={w} height={150 - y} fill={fill} />
          <Path d={`M${x} ${y}h${w}`} stroke="#FFFFFF" strokeWidth={5} />
          <Path d={`M${x} ${y + 38}h${w}`} stroke="#FFFFFF" strokeWidth={3} strokeDasharray="6 4" />
        </React.Fragment>
      ))}
      {WINDOWS.map(([x, y], i) => (
        <React.Fragment key={`${x}-${y}`}>
          <Rect
            x={x}
            y={y}
            width={14}
            height={22}
            fill="#3B2418"
            stroke="#FFFFFF"
            strokeWidth={2}
          />
          <Path
            d={`M${x} ${y - 2}a7 7 0 0 1 14 0z`}
            fill={GLASS[i % GLASS.length]}
            stroke="#FFFFFF"
            strokeWidth={1.5}
          />
        </React.Fragment>
      ))}
    </Svg>
  );
}
