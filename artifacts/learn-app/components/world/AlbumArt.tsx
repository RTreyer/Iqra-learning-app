/**
 * The sticker album as a picture: an open book, a gold star sticker on one page and an empty
 * dashed place on the other, waiting for the next sticker. Replaces the abstract album icon.
 */

import React from "react";
import { Path, Polygon, Rect, Svg } from "react-native-svg";

import { yemen } from "@/theme/tokens";

export function AlbumArt({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M4 17 V56 Q18 51 32 56 Q46 51 60 56 V17" fill={yemen.green} />
      <Path
        d="M6 14 Q19 9 31 14 V53 Q19 48 6 53 Z"
        fill="#FFF8EC"
        stroke="#D9C7A8"
        strokeWidth={1.5}
      />
      <Path
        d="M58 14 Q45 9 33 14 V53 Q45 48 58 53 Z"
        fill="#FFF8EC"
        stroke="#D9C7A8"
        strokeWidth={1.5}
      />
      <Path d="M32 14 V54" stroke={yemen.greenDeep} strokeWidth={2} />
      <Rect
        x={11}
        y={22}
        width={15}
        height={17}
        rx={3}
        fill="none"
        stroke="#B9A58E"
        strokeWidth={2}
        strokeDasharray="3 2.5"
      />
      <Rect
        x={37}
        y={20}
        width={17}
        height={19}
        rx={3}
        fill="#FFFFFF"
        stroke={yemen.goldEdge}
        strokeWidth={1.5}
        transform="rotate(-6 45.5 29.5)"
      />
      <Polygon
        points="45.5,22.5 47.6,27 52.5,27.6 48.9,30.9 49.9,35.8 45.5,33.4 41.1,35.8 42.1,30.9 38.5,27.6 43.4,27"
        fill={yemen.gold}
        transform="rotate(-6 45.5 29.5)"
      />
    </Svg>
  );
}
