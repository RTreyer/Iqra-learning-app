/**
 * Hudhud's letter at the end of a unit's path (content/story.ts). The sandstorm blew its
 * letters away: each lesson done brings some of them back into their places on the paper,
 * and once the whole unit is done the letter is complete, sealed and shining.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Circle, Path, Svg } from "react-native-svg";

import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { touchTarget, yemen } from "@/theme/tokens";

type Props = {
  /** What the letter says: the unit's letters (or numbers), back in place one by one. */
  symbols: string[];
  /** Share of the unit done, 0 to 1. */
  share: number;
  /** Hudhud's line about the letter, said when it is tapped. */
  line: string;
  testID?: string;
};

/** How many of the symbols are back on the paper at this share of the unit. */
export function symbolsBack(count: number, share: number): number {
  if (share >= 1) return count;
  return Math.min(count - 1, Math.floor(share * count));
}

export function LetterGoal({ symbols, share, line, testID = "unit-letter" }: Props) {
  const complete = share >= 1;
  const back = symbolsBack(symbols.length, share);
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
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      {complete ? <View style={styles.glow} /> : null}
      <View style={[styles.paper, complete ? styles.paperDone : styles.paperOpen]}>
        <View style={styles.symbols}>
          {symbols.map((symbol, i) =>
            i < back ? (
              <Text key={`${symbol}-${i}`} style={styles.symbol}>
                {symbol}
              </Text>
            ) : (
              // A gap where a letter is still missing, blown away by the storm.
              <View key={`${symbol}-${i}`} style={styles.gap} />
            ),
          )}
        </View>
        <View style={styles.lines}>
          <View style={styles.line} />
          <View style={[styles.line, styles.lineShort]} />
        </View>
        {complete ? (
          <View style={styles.seal}>
            <Svg width={34} height={34} viewBox="0 0 34 34">
              <Circle cx={17} cy={17} r={15} fill={yemen.red} />
              <Circle cx={17} cy={17} r={10} fill="none" stroke="#E98B7E" strokeWidth={2} />
              <Path
                d="M11 17.5l4 4 8-9"
                stroke="#FFFFFF"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 168,
    minHeight: touchTarget * 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  glow: {
    position: "absolute",
    width: 196,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#F4C14B",
    opacity: 0.35,
  },
  paper: {
    width: 160,
    minHeight: 104,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 18,
    gap: 8,
    transform: [{ rotate: "-3deg" }],
  },
  paperOpen: {
    backgroundColor: "#FFF8EA",
    borderWidth: 2,
    borderColor: "#D9C7A7",
    borderStyle: "dashed",
  },
  paperDone: {
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: yemen.gold,
    boxShadow: `0 5px 0 ${yemen.goldEdge}`,
  },
  symbols: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
  },
  symbol: { fontSize: 22, fontWeight: "900", color: yemen.ink, minWidth: 18, textAlign: "center" },
  gap: {
    width: 18,
    height: 26,
    borderBottomWidth: 2,
    borderColor: "#CDB79A",
    borderStyle: "dotted",
  },
  lines: { gap: 6, alignItems: "center" },
  line: { width: "86%", height: 2, borderRadius: 1, backgroundColor: "#E6D6BC" },
  lineShort: { width: "60%" },
  seal: { position: "absolute", bottom: -14, left: -10 },
});
