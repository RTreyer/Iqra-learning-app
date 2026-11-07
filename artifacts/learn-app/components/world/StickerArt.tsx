/** The pictures of the sticker album (lib/stickers.ts). Locked stickers show a grey outline. */

import React from "react";
import { Circle, Ellipse, Path, Rect, Svg } from "react-native-svg";

import { Art } from "@/components/art/Art";
import type { StickerId } from "@/lib/stickers";

const LOCKED = "#CDBFAE";

function Coffee({ c }: { c: (fill: string) => string }) {
  return (
    <>
      <Path
        d="M28 24q-4-6 0-12M38 24q-4-6 0-12"
        stroke={c("#B9A58E")}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M16 32h38v16a15 15 0 0 1-15 15h-8a15 15 0 0 1-15-15z"
        fill={c("#FFFFFF")}
        stroke={c("#5E3220")}
        strokeWidth={3}
      />
      <Path d="M54 37h4a7 7 0 0 1 0 14h-4" stroke={c("#5E3220")} strokeWidth={3} fill="none" />
      <Ellipse cx={35} cy={33} rx={17} ry={3} fill={c("#6B3A1E")} />
      <Ellipse cx={62} cy={68} rx={5} ry={7} fill={c("#6B3A1E")} transform="rotate(-30 62 68)" />
      <Ellipse cx={18} cy={70} rx={5} ry={7} fill={c("#6B3A1E")} transform="rotate(30 18 70)" />
    </>
  );
}

function Dhow({ c }: { c: (fill: string) => string }) {
  return (
    <>
      <Path d="M40 10V50" stroke={c("#5E3220")} strokeWidth={3} />
      <Path
        d="M42 10 Q64 24 66 46 L24 46 Z"
        fill={c("#FFFFFF")}
        stroke={c("#C9B79E")}
        strokeWidth={2}
      />
      <Path d="M8 52 Q40 68 72 50 L66 46 L14 48 Z" fill={c("#8E4A2F")} />
      <Path
        d="M4 66q8-6 16 0t16 0t16 0t16 0t16 0"
        stroke={c("#1F5FA8")}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
    </>
  );
}

function Honey({ c }: { c: (fill: string) => string }) {
  return (
    <>
      <Rect x={20} y={20} width={40} height={10} rx={3} fill={c("#8E5A36")} />
      <Path
        d="M22 30h36v34a6 6 0 0 1-6 6H28a6 6 0 0 1-6-6z"
        fill={c("#E9A81E")}
        stroke={c("#9A6A00")}
        strokeWidth={3}
      />
      <Path d="M30 30v8a3 3 0 0 0 6 0v-8" fill={c("#C98A0A")} />
      <Ellipse
        cx={66}
        cy={18}
        rx={6}
        ry={4.5}
        fill={c("#F4C14B")}
        stroke={c("#2B1D14")}
        strokeWidth={1.5}
      />
      <Path d="M64 14v8M68 14v8" stroke={c("#2B1D14")} strokeWidth={1.5} />
      <Ellipse cx={64} cy={11} rx={4} ry={3} fill={c("#FFFFFF")} />
      <Ellipse cx={70} cy={11} rx={4} ry={3} fill={c("#FFFFFF")} />
    </>
  );
}

function DragonTree({ c }: { c: (fill: string) => string }) {
  return (
    <>
      <Path
        d="M40 72V46M40 52L28 38M40 50L53 36M40 46V32"
        stroke={c("#8E5A36")}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M8 36 Q40 4 72 36 Q40 27 8 36Z" fill={c("#3F8A4E")} />
      <Rect x={10} y={70} width={60} height={5} rx={2} fill={c("#D9B98C")} />
    </>
  );
}

function BintAlSahn({ c }: { c: (fill: string) => string }) {
  return (
    <>
      <Ellipse cx={40} cy={62} rx={34} ry={8} fill={c("#E9DCC8")} />
      <Path d="M12 50 a28 10 0 0 0 56 0 v-12 a28 10 0 0 0 -56 0z" fill={c("#E3B36A")} />
      <Path d="M12 44 a28 10 0 0 0 56 0" stroke={c("#C98A3A")} strokeWidth={2} fill="none" />
      <Ellipse cx={40} cy={38} rx={28} ry={10} fill={c("#F2CB7E")} />
      <Path
        d="M28 36q2 9 4 0M46 38q2 11 4 0"
        stroke={c("#C98A0A")}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx={36} cy={36} r={1.5} fill={c("#2B1D14")} />
      <Circle cx={44} cy={39} r={1.5} fill={c("#2B1D14")} />
      <Circle cx={50} cy={35} r={1.5} fill={c("#2B1D14")} />
    </>
  );
}

const DRAWN: Partial<Record<StickerId, React.ComponentType<{ c: (fill: string) => string }>>> = {
  coffee: Coffee,
  dhow: Dhow,
  honey: Honey,
  dragon_tree: DragonTree,
  bint_al_sahn: BintAlSahn,
};

/** Stickers that reuse the app's Yemeni illustrations (components/art). */
const FROM_ART: Partial<Record<StickerId, "house" | "qamariya" | "palm" | "dates">> = {
  house: "house",
  qamariya: "qamariya",
  palm: "palm",
  dates: "dates",
};

export function StickerArt({
  id,
  size = 80,
  locked = false,
}: {
  id: StickerId;
  size?: number;
  locked?: boolean;
}) {
  const art = FROM_ART[id];
  if (art) {
    if (!locked) return <Art art={art} size={size} />;
    return (
      <Svg width={size} height={size} viewBox="0 0 80 80">
        <Circle cx={40} cy={40} r={30} fill={LOCKED} />
      </Svg>
    );
  }
  const Drawing = DRAWN[id];
  if (!Drawing) return null;
  const c = (fill: string) => (locked ? LOCKED : fill);
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Drawing c={c} />
    </Svg>
  );
}
