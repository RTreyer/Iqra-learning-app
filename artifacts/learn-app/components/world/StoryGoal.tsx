/**
 * What waits at the end of a unit, by subject, as in Hudhud's story (content/story.ts):
 * in Arabic his letter, whose letters come back one by one; in maths the trader's coffee
 * sacks in the market of Mocha, counted one by one, until the ship can sail.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Circle, Ellipse, Path, Svg } from "react-native-svg";

import { LETTER_LINES, MARKET_LINES, storySymbols } from "@/content/story";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { touchTarget, yemen } from "@/theme/tokens";
import { symbolsBack } from "@/lib/storyProgress";
import { LetterGoal } from "./LetterGoal";
import { StickerArt } from "./StickerArt";

type Props = {
  unit: { letters?: string[] };
  subject: string;
  /** Share of the unit done, 0 to 1. */
  share: number;
  /** Index of the letter or sack this lesson just brought back, shown shining. */
  fresh?: number | null;
  /** Smaller, for the finish card. */
  compact?: boolean;
  testID?: string;
};

export function StoryGoal({ unit, subject, share, fresh = null, compact = false, testID }: Props) {
  const symbols = storySymbols(unit, subject);
  if (subject === "math")
    return (
      <MarketGoal symbols={symbols} share={share} fresh={fresh} compact={compact} testID={testID} />
    );
  return (
    <LetterGoal
      symbols={symbols}
      share={share}
      fresh={fresh}
      compact={compact}
      line={share >= 1 ? LETTER_LINES.complete : LETTER_LINES.missing}
      testID={testID}
    />
  );
}

function SackIcon({ size, counted, fresh }: { size: number; counted: boolean; fresh: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      {fresh ? <Circle cx={20} cy={22} r={19} fill="#F4C14B" opacity={0.55} /> : null}
      <Path
        d="M9 11 Q20 5 31 11 L35 35 Q20 40 5 35 Z"
        fill={counted ? "#B58A5A" : "#D9C7A7"}
        stroke={counted ? "#7A5530" : "#B9A58E"}
        strokeWidth={2}
      />
      <Path
        d="M12 11 Q20 15 28 11"
        stroke={counted ? "#7A5530" : "#B9A58E"}
        strokeWidth={2}
        fill="none"
      />
      {counted ? <Ellipse cx={14} cy={33} rx={2.4} ry={3} fill="#5E3220" /> : null}
    </Svg>
  );
}

/** The trader's sacks: each lesson done counts one more; with the unit done the ship sails. */
function MarketGoal({
  symbols,
  share,
  fresh,
  compact,
  testID = "unit-letter",
}: {
  symbols: string[];
  share: number;
  fresh: number | null;
  compact: boolean;
  testID?: string;
}) {
  const complete = share >= 1;
  const counted = symbolsBack(symbols.length, share);
  const line = complete ? MARKET_LINES.complete : MARKET_LINES.missing;
  const sack = compact ? 22 : 26;
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
        <View style={styles.sacks}>
          {symbols.map((symbol, i) => (
            <View key={`${symbol}-${i}`} style={styles.sack}>
              <SackIcon size={sack} counted={i < counted} fresh={fresh === i} />
              <Text style={[styles.sackNumber, i < counted ? styles.counted : styles.uncounted]}>
                {i < counted ? symbol : "؟"}
              </Text>
            </View>
          ))}
        </View>
        <View style={[styles.ship, complete && styles.shipSailing]}>
          <StickerArt id="dhow" size={compact ? 48 : 58} />
        </View>
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
  sacks: { flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "center", gap: 1 },
  sack: { alignItems: "center" },
  sackNumber: { fontSize: 15, fontWeight: "900", marginTop: -4 },
  counted: { color: yemen.ink },
  uncounted: { color: "#A8977F" },
  ship: { alignSelf: "flex-start" },
  shipSailing: { transform: [{ translateX: -4 }, { rotate: "-4deg" }] },
});
