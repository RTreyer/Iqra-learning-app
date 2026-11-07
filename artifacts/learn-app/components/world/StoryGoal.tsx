/**
 * What waits at the end of a unit's path in Hudhud's story (content/story.ts, GoalKind):
 * - Arabic: the clue of the unit's station (a door sign, Rasha's notebook, a letter), whose
 *   letters Hudhud learns one section after another; who holds it is shown below it;
 * - maths: a station of the coffee trader's journey: sort the cherries into baskets, count the
 *   sacks, add the sacks the camel brings, give coffee to the neighbours and see what is left,
 *   load the ship with parcels of every shape.
 * Every place fills from the same state as the rest of the screen (lib/storyProgress.ts).
 */

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Circle, Path, Polygon, Rect, Svg } from "react-native-svg";

import { Picture } from "@/components/pictures/Picture";
import { STATIONS, goalLine } from "@/content/story";
import type { GoalKind } from "@/content/types";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import type { GoalState } from "@/lib/storyProgress";
import { touchTarget, yemen } from "@/theme/tokens";
import { LetterGoal, WritingGoal } from "./LetterGoal";
import { SackShape } from "./Voyage";

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
  return <CoffeeGoal {...common} kind={kind} back={state.back} />;
}

const NUMBERS = ["١", "٢", "٣", "٤", "٥"];
/** Ripe red cherries, unripe green ones, and the dried beans. */
const CHERRY_COLOURS = ["#C8402F", "#7FB14E", "#5E3220"];
const PARCELS: ("circle" | "square" | "triangle")[] = ["square", "circle", "triangle", "square"];

function Basket({
  size,
  filled,
  fresh,
  colour,
}: {
  size: number;
  filled: boolean;
  fresh: boolean;
  colour: string;
}) {
  return (
    <Svg width={size} height={size * 0.8} viewBox="0 0 40 32">
      {fresh ? (
        <Rect x={0} y={0} width={40} height={32} rx={8} fill="#F4C14B" opacity={0.55} />
      ) : null}
      {filled
        ? [8, 14, 20, 26, 32, 11, 17, 23, 29].map((x, i) => (
            <Circle key={i} cx={x} cy={i < 5 ? 12 : 8} r={2.8} fill={colour} />
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
        <Path
          d="M7 20 l4 -4 l4 4 l4 -4 l4 4 l4 -4 l4 4 l4 -4"
          stroke={yemen.red}
          strokeWidth={2}
          fill="none"
        />
      ) : null}
    </Svg>
  );
}

/** A sack of coffee, with its number once counted. */
function Sack({
  size,
  filled,
  fresh,
  n,
}: {
  size: number;
  filled: boolean;
  fresh: boolean;
  n?: string;
}) {
  return (
    <View style={styles.place}>
      <Svg width={size} height={size} viewBox="0 0 24 26">
        {fresh ? <Circle cx={12} cy={15} r={11.5} fill="#F4C14B" opacity={0.55} /> : null}
        <SackShape empty={!filled} />
      </Svg>
      {n !== undefined ? (
        <Text style={[styles.number, filled ? styles.counted : styles.uncounted]}>
          {filled ? n : "؟"}
        </Text>
      ) : null}
    </View>
  );
}

/** A parcel of coffee for the ship, wrapped in jute: a cube, a round bale, a cone. */
function Parcel({
  size,
  shape,
  placed,
  fresh,
}: {
  size: number;
  shape: "circle" | "square" | "triangle";
  placed: boolean;
  fresh: boolean;
}) {
  const paint = {
    fill: placed ? "#C9A26B" : "#EFE4D2",
    stroke: placed ? "#7A5418" : "#B9A58E",
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

/** One station of the coffee trader's journey. */
function CoffeeGoal({
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
      case "sort":
        return (
          <Basket
            key={i}
            size={size + 12}
            filled={filled}
            fresh={shine}
            colour={CHERRY_COLOURS[i]}
          />
        );
      case "count":
        return <Sack key={i} size={size} filled={filled} fresh={shine} n={NUMBERS[i]} />;
      case "add":
        return <Sack key={i} size={size} filled={filled} fresh={shine} />;
      case "give":
        // A sack given away to the neighbours leaves an empty place behind.
        return <Sack key={i} size={size + 2} filled={!filled} fresh={shine} />;
      case "ship":
        return <Parcel key={i} size={size + 2} shape={PARCELS[i]} placed={filled} fresh={shine} />;
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
          {/* The camel brings the new sacks. */}
          {kind === "add" ? <Picture emoji="🐪" size={compact ? 30 : 36} /> : null}
          <View style={styles.places}>{places}</View>
          {/* The parcels go on board; with the last one the ship sails. */}
          {kind === "ship" ? <Picture emoji="⛵" size={complete ? 40 : 32} /> : null}
        </View>
        {kind === "give" ? (
          // The neighbours, with the coffee given to them.
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
  neighbours: { flexDirection: "row-reverse", alignItems: "center", gap: 6 },
  given: { fontSize: 16, fontWeight: "900", color: yemen.green },
});
