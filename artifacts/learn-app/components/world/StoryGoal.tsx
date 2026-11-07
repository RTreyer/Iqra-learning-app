/**
 * What waits at the end of a unit's path in Hudhud's story (content/story.ts, GoalKind):
 * - Arabic: the writing page of the preparation unit, then Hudhud's letters, their letters (or
 *   vowel marks) coming back, each letter delivered to someone from the unit's stories;
 * - maths: the trader's market day in Mocha, one station per unit. Sort the goods into baskets,
 *   count the sacks, add the sacks the camel brings, carry sacks to the ship, pack the goods.
 *   Only after packing, at the end of the last unit, does the ship sail.
 * Every place fills from the same state as the rest of the screen (lib/storyProgress.ts).
 */

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Circle, Ellipse, Path, Rect, Svg } from "react-native-svg";

import { Picture } from "@/components/pictures/Picture";
import { goalLine } from "@/content/story";
import type { GoalKind, Recipient } from "@/content/types";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import type { GoalState } from "@/lib/storyProgress";
import { touchTarget, yemen } from "@/theme/tokens";
import { LetterGoal, WritingGoal } from "./LetterGoal";
import { StickerArt } from "./StickerArt";

type Props = {
  unit: { letters?: string[]; recipient?: Recipient };
  kind: GoalKind;
  state: GoalState;
  /** Index of the place this lesson just filled, shown shining. */
  fresh?: number | null;
  /** Smaller, for the finish card. */
  compact?: boolean;
  testID?: string;
};

export function StoryGoal({ unit, kind, state, fresh = null, compact = false, testID }: Props) {
  const line = goalLine(unit, kind, state.complete);
  const common = { complete: state.complete, line, fresh, compact, testID };
  if (kind === "letters" || kind === "vowels")
    return (
      <LetterGoal
        {...common}
        letters={unit.letters ?? []}
        back={state.back}
        vowels={kind === "vowels"}
        recipient={unit.recipient?.pictures}
      />
    );
  if (kind === "writing") return <WritingGoal {...common} back={state.back} />;
  return <MarketGoal {...common} kind={kind} back={state.back} />;
}

const NUMBERS = ["١", "٢", "٣", "٤", "٥"];
/** What the trader sorts into his baskets: honey, raisins, coffee. */
const GOODS = ["🍯", "🍇", "☕"];
/** The parcels packed for the journey, one per solid of the unit. */
const PARCELS = ["📦", "🥫", "🎲", "⚽"];

function SackIcon({ size, filled, fresh }: { size: number; filled: boolean; fresh: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      {fresh ? <Circle cx={20} cy={22} r={19} fill="#F4C14B" opacity={0.55} /> : null}
      <Path
        d="M9 11 Q20 5 31 11 L35 35 Q20 40 5 35 Z"
        fill={filled ? "#B58A5A" : "#EFE4D2"}
        stroke={filled ? "#7A5530" : "#B9A58E"}
        strokeWidth={2}
        strokeDasharray={filled ? undefined : "3 2"}
      />
      <Path
        d="M12 11 Q20 15 28 11"
        stroke={filled ? "#7A5530" : "#B9A58E"}
        strokeWidth={2}
        fill="none"
      />
      {filled ? <Ellipse cx={14} cy={33} rx={2.4} ry={3} fill="#5E3220" /> : null}
    </Svg>
  );
}

function Basket({
  size,
  filled,
  fresh,
  good,
}: {
  size: number;
  filled: boolean;
  fresh: boolean;
  good: string;
}) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "flex-end" }}>
      {filled ? (
        <View style={styles.basketGood}>
          <Picture emoji={good} size={size * 0.62} />
        </View>
      ) : null}
      <Svg width={size} height={size * 0.6} viewBox="0 0 40 24">
        {fresh ? (
          <Rect x={0} y={0} width={40} height={24} rx={8} fill="#F4C14B" opacity={0.55} />
        ) : null}
        <Path
          d="M3 4 H37 L33 22 H7 Z"
          fill={filled ? "#E3B36A" : "#EFE4D2"}
          stroke={filled ? "#9C6B2E" : "#B9A58E"}
          strokeWidth={2}
          strokeDasharray={filled ? undefined : "3 2"}
        />
        {filled ? (
          <Path
            d="M7 12 l4 -4 l4 4 l4 -4 l4 4 l4 -4 l4 4 l4 -4"
            stroke={yemen.red}
            strokeWidth={2}
            fill="none"
          />
        ) : null}
      </Svg>
    </View>
  );
}

function Parcel({
  size,
  filled,
  fresh,
  item,
}: {
  size: number;
  filled: boolean;
  fresh: boolean;
  item: string;
}) {
  return (
    <View
      style={[
        styles.parcel,
        { width: size, height: size },
        filled ? styles.parcelDone : styles.parcelOpen,
        fresh && styles.parcelFresh,
      ]}
    >
      {filled ? <Picture emoji={item} size={size * 0.78} /> : null}
    </View>
  );
}

/** One station of the trader's market day. */
function MarketGoal({
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
  // With the camel beside them, the sacks are a little smaller so they stay in one row.
  const size = kind === "add" ? (compact ? 17 : 20) : compact ? 22 : 26;
  const carried = back.filter(Boolean).length;
  const places = back.map((filled, i) => {
    const shine = fresh === i;
    switch (kind) {
      case "sort":
        return <Basket key={i} size={size + 10} filled={filled} fresh={shine} good={GOODS[i]} />;
      case "pack":
        return <Parcel key={i} size={size + 4} filled={filled} fresh={shine} item={PARCELS[i]} />;
      case "carry":
        // A sack carried to the ship leaves the quay: only an outline stays.
        return <SackIcon key={i} size={size} filled={!filled} fresh={shine} />;
      case "count":
        return (
          <View key={i} style={styles.sack}>
            <SackIcon size={size} filled={filled} fresh={shine} />
            <Text style={[styles.sackNumber, filled ? styles.counted : styles.uncounted]}>
              {filled ? NUMBERS[i] : "؟"}
            </Text>
          </View>
        );
      case "add":
        return (
          <View key={i} style={styles.sack}>
            <SackIcon size={size} filled={filled} fresh={shine} />
            <Text style={[styles.sackNumber, filled ? styles.added : styles.uncounted]}>
              {filled ? "+" : ""}
            </Text>
          </View>
        );
    }
  });
  const ship = kind === "carry" || kind === "pack";
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
      <View style={[styles.market, complete ? styles.marketDone : styles.marketOpen]}>
        <View style={styles.row}>
          {kind === "add" ? <Picture emoji="🐪" size={compact ? 26 : 28} /> : null}
          <View style={styles.places}>{places}</View>
        </View>
        {ship ? (
          <View
            testID={kind === "pack" && complete ? "ship-sailing" : "ship-docked"}
            style={[styles.ship, kind === "pack" && complete && styles.shipSailing]}
          >
            <StickerArt id="dhow" size={compact ? 48 : 58} />
            {kind === "carry" && carried > 0 ? (
              // The sacks already on board, on the deck.
              <View style={styles.deck}>
                {Array.from({ length: carried }, (_, i) => (
                  <View key={i} style={styles.deckSack} />
                ))}
              </View>
            ) : null}
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
  market: {
    width: "100%",
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 2,
    alignItems: "center",
    backgroundColor: "#E7F0FA",
  },
  marketOpen: { borderWidth: 2, borderColor: "#B9CDE3", borderStyle: "dashed" },
  marketDone: {
    borderWidth: 3,
    borderColor: yemen.gold,
    boxShadow: `0 5px 0 ${yemen.goldEdge}`,
  },
  row: { flexDirection: "row-reverse", alignItems: "flex-end", gap: 4 },
  places: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 2,
    flexShrink: 1,
  },
  sack: { alignItems: "center" },
  sackNumber: { fontSize: 15, fontWeight: "900", marginTop: -4, minHeight: 18 },
  counted: { color: yemen.ink },
  added: { color: yemen.green },
  uncounted: { color: "#A8977F" },
  basketGood: { position: "absolute", top: -2 },
  parcel: { borderRadius: 6, alignItems: "center", justifyContent: "center" },
  parcelOpen: {
    borderWidth: 2,
    borderColor: "#B9A58E",
    borderStyle: "dashed",
    backgroundColor: "#EFE4D2",
  },
  parcelDone: { backgroundColor: "#FFFFFF" },
  parcelFresh: { backgroundColor: "#F4C14B" },
  ship: { alignSelf: "flex-start" },
  shipSailing: { transform: [{ translateX: -4 }, { rotate: "-4deg" }] },
  deck: { position: "absolute", top: 26, left: 12, flexDirection: "row", gap: 1 },
  deckSack: { width: 6, height: 7, borderRadius: 2, backgroundColor: "#B58A5A" },
});
