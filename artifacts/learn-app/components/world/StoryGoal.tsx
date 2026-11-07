/**
 * What waits at the end of a unit's path in Hudhud's story (content/story.ts, GoalKind):
 * - Arabic: the clue of the unit's station (a door sign, Rasha's notebook, a letter), whose
 *   letters Hudhud learns one section after another; who holds it is shown below it;
 * - maths: a station of the sidr seed's journey: sort the seeds into baskets, count the water
 *   jars, add the drops the birds bring, give fish away and see what is left, build a ring of
 *   stones around the seedling.
 * Every place fills from the same state as the rest of the screen (lib/storyProgress.ts).
 */

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Circle, Ellipse, Path, Polygon, Rect, Svg } from "react-native-svg";

import { Picture } from "@/components/pictures/Picture";
import { STATIONS, goalLine } from "@/content/story";
import type { GoalKind } from "@/content/types";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import type { GoalState } from "@/lib/storyProgress";
import { touchTarget, yemen } from "@/theme/tokens";
import { LetterGoal, WritingGoal } from "./LetterGoal";

type Props = {
  unit: { id: string; letters?: string[] };
  kind: GoalKind;
  state: GoalState;
  /** Index of the place this lesson just filled, shown shining. */
  fresh?: number | null;
  /** Smaller, for the finish card. */
  compact?: boolean;
  testID?: string;
};

export function StoryGoal({ unit, kind, state, fresh = null, compact = false, testID }: Props) {
  const line = goalLine(unit.id, kind, state.complete);
  const common = { complete: state.complete, line, fresh, compact, testID };
  if (kind === "letters" || kind === "vowels") {
    const person = STATIONS[unit.id]?.person;
    return (
      <LetterGoal
        {...common}
        letters={unit.letters ?? []}
        back={state.back}
        vowels={kind === "vowels"}
        recipient={person ? [person] : undefined}
      />
    );
  }
  if (kind === "writing") return <WritingGoal {...common} back={state.back} />;
  return <SeedGoal {...common} kind={kind} back={state.back} />;
}

const NUMBERS = ["١", "٢", "٣", "٤", "٥"];
const SEED_COLOURS = ["#8E5A36", "#2B1D14", "#C9A16B"];
const STONES: ("circle" | "square" | "triangle")[] = ["circle", "square", "triangle", "circle"];

function Basket({ size, filled, fresh, colour }: { size: number; filled: boolean; fresh: boolean; colour: string }) {
  return (
    <Svg width={size} height={size * 0.8} viewBox="0 0 40 32">
      {fresh ? <Rect x={0} y={0} width={40} height={32} rx={8} fill="#F4C14B" opacity={0.55} /> : null}
      {filled
        ? [8, 14, 20, 26, 32, 11, 17, 23, 29].map((x, i) => (
            <Ellipse key={i} cx={x} cy={i < 5 ? 12 : 8} rx={3} ry={2.2} fill={colour} />
          ))
        : null}
      <Path
        d="M3 12 H37 L33 30 H7 Z"
        fill={filled ? "#E3B36A" : "#EFE4D2"}
        stroke={filled ? "#9C6B2E" : "#B9A58E"}
        strokeWidth={2}
        strokeDasharray={filled ? undefined : "3 2"}
      />
      {filled ? (
        <Path d="M7 20 l4 -4 l4 4 l4 -4 l4 4 l4 -4 l4 4 l4 -4" stroke={yemen.red} strokeWidth={2} fill="none" />
      ) : null}
    </Svg>
  );
}

function Jar({ size, filled, fresh, n }: { size: number; filled: boolean; fresh: boolean; n: string }) {
  return (
    <View style={styles.place}>
      <Svg width={size} height={size} viewBox="0 0 40 40">
        {fresh ? <Circle cx={20} cy={22} r={19} fill="#F4C14B" opacity={0.55} /> : null}
        <Path
          d="M14 6 H26 V10 Q34 16 32 28 Q30 37 20 37 Q10 37 8 28 Q6 16 14 10 Z"
          fill={filled ? yemen.clay : "#EFE4D2"}
          stroke={filled ? yemen.clayDeep : "#B9A58E"}
          strokeWidth={2}
          strokeDasharray={filled ? undefined : "3 2"}
        />
        {filled ? <Path d="M11 22 Q20 26 29 22" stroke="#4F8FD6" strokeWidth={3} fill="none" /> : null}
      </Svg>
      <Text style={[styles.number, filled ? styles.counted : styles.uncounted]}>
        {filled ? n : "؟"}
      </Text>
    </View>
  );
}

function Drop({ size, filled, fresh }: { size: number; filled: boolean; fresh: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      {fresh ? <Circle cx={20} cy={22} r={18} fill="#F4C14B" opacity={0.55} /> : null}
      <Path
        d="M20 5 Q9 20 9 26 a11 11 0 0 0 22 0 Q31 20 20 5 Z"
        fill={filled ? "#4F8FD6" : "#EFE4D2"}
        stroke={filled ? "#1F5FA8" : "#B9A58E"}
        strokeWidth={2}
        strokeDasharray={filled ? undefined : "3 2"}
      />
    </Svg>
  );
}

function Fish({ size, given, fresh }: { size: number; given: boolean; fresh: boolean }) {
  return (
    <Svg width={size} height={size * 0.7} viewBox="0 0 40 28">
      {fresh ? <Rect x={0} y={0} width={40} height={28} rx={8} fill="#F4C14B" opacity={0.55} /> : null}
      <Path
        d="M4 14 Q16 2 30 14 Q16 26 4 14 Z M30 14 L38 6 V22 Z"
        fill={given ? "#EFE4D2" : "#4F8FD6"}
        stroke={given ? "#B9A58E" : "#1F5FA8"}
        strokeWidth={2}
        strokeDasharray={given ? "3 2" : undefined}
      />
      {given ? null : <Circle cx={11} cy={12} r={1.8} fill={yemen.ink} />}
    </Svg>
  );
}

function Stone({ size, shape, placed, fresh }: { size: number; shape: "circle" | "square" | "triangle"; placed: boolean; fresh: boolean }) {
  const paint = {
    fill: placed ? "#A99A88" : "#EFE4D2",
    stroke: placed ? "#6E5B48" : "#B9A58E",
    strokeWidth: 2,
    strokeDasharray: placed ? undefined : "3 2",
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30">
      {fresh ? <Circle cx={15} cy={15} r={14} fill="#F4C14B" opacity={0.55} /> : null}
      {shape === "circle" ? <Circle cx={15} cy={15} r={10} {...paint} /> : null}
      {shape === "square" ? <Rect x={6} y={6} width={18} height={18} rx={2} {...paint} /> : null}
      {shape === "triangle" ? <Polygon points="15,4 26,25 4,25" {...paint} /> : null}
    </Svg>
  );
}

/** One station of the seed's journey. */
function SeedGoal({
  kind,
  back,
  complete,
  line,
  fresh,
  compact,
  testID = "unit-letter",
}: {
  kind: Exclude<GoalKind, "writing" | "letters" | "vowels">;
  back: boolean[];
  complete: boolean;
  line: string;
  fresh: number | null;
  compact: boolean;
  testID?: string;
}) {
  const size = compact ? 22 : 26;
  const given = back.filter(Boolean).length;
  const places = back.map((filled, i) => {
    const shine = fresh === i;
    switch (kind) {
      case "seeds":
        return <Basket key={i} size={size + 12} filled={filled} fresh={shine} colour={SEED_COLOURS[i]} />;
      case "jars":
        return <Jar key={i} size={size} filled={filled} fresh={shine} n={NUMBERS[i]} />;
      case "drops":
        return <Drop key={i} size={size} filled={filled} fresh={shine} />;
      case "give":
        return <Fish key={i} size={size + 6} given={filled} fresh={shine} />;
      case "stones":
        return <Stone key={i} size={size + 2} shape={STONES[i]} placed={filled} fresh={shine} />;
    }
  });
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={line}
      accessibilityState={{ checked: complete }}
      onPress={() => {
        haptics.tap();
        speak(line);
      }}
      style={({ pressed }) => [styles.wrap, compact && styles.compact, pressed && styles.pressed]}
    >
      {complete ? <View style={styles.glow} /> : null}
      <View style={[styles.box, complete ? styles.boxDone : styles.boxOpen]}>
        <View style={styles.row}>
          {kind === "drops" ? <Picture emoji="🕊" size={compact ? 26 : 30} /> : null}
          {kind === "stones" ? (
            // The ring of stones around the seedling: it grows with the last stone.
            <View style={styles.ring}>
              <View style={styles.ringStones}>{places.slice(0, 2)}</View>
              <Picture emoji="🌱" size={complete ? 40 : 30} />
              <View style={styles.ringStones}>{places.slice(2)}</View>
            </View>
          ) : (
            <View style={styles.places}>{places}</View>
          )}
        </View>
        {kind === "give" ? (
          // The neighbours, with the fish given to them.
          <View style={styles.neighbours} testID="goal-neighbours">
            <Picture emoji="🏘" size={compact ? 30 : 36} />
            <Text style={styles.given}>{given > 0 ? `+${given}` : ""}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 168, minHeight: touchTarget * 2, alignItems: "center", justifyContent: "center" },
  compact: { width: 150 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  glow: {
    position: "absolute",
    width: 196,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#F4C14B",
    opacity: 0.35,
  },
  box: {
    width: "100%",
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
    alignItems: "center",
    backgroundColor: "#EEF6E8",
  },
  boxOpen: { borderWidth: 2, borderColor: "#C9DDB8", borderStyle: "dashed" },
  boxDone: {
    borderWidth: 3,
    borderColor: yemen.gold,
    boxShadow: `0 5px 0 ${yemen.goldEdge}`,
  },
  row: { flexDirection: "row-reverse", alignItems: "center", gap: 4 },
  places: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 2,
    flexShrink: 1,
  },
  place: { alignItems: "center" },
  number: { fontSize: 15, fontWeight: "900", marginTop: -4, minHeight: 18 },
  counted: { color: yemen.ink },
  uncounted: { color: "#A8977F" },
  ring: { flexDirection: "row-reverse", alignItems: "center", gap: 4 },
  ringStones: { gap: 2 },
  neighbours: { flexDirection: "row-reverse", alignItems: "center", gap: 6 },
  given: { fontSize: 16, fontWeight: "900", color: yemen.green },
});
