/**
 * Hudhud's letter at the end of a unit's path (content/story.ts). The storm blew its letters
 * and their vowel marks away. In a letters unit each letter comes back into its place once its
 * lessons are done; in a vowels unit (damma, kasra, sukun, long vowels) the letters are there
 * but bare, and get their marks back. The exercises at the end seal the letter, and Hudhud
 * brings it to the person shown below it, someone from the unit's stories.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Circle, Path, Svg } from "react-native-svg";

import { Picture } from "@/components/pictures/Picture";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { touchTarget, yemen } from "@/theme/tokens";

const DAMMA = "ُ";

type Props = {
  /** The unit's letters, in reading order. */
  letters: string[];
  /** Per letter: back in the letter (or, in a vowels unit, has its marks back). */
  back: boolean[];
  /** The whole unit is done: the letter is sealed and delivered. */
  complete: boolean;
  /** The letters are already there and get their vowel marks back. */
  vowels?: boolean;
  /** Pictures of whom the letter is for. */
  recipient?: string[];
  /** Hudhud's line about the letter, said when it is tapped. */
  line: string;
  /** Index of the letter this lesson just brought back, shown shining. */
  fresh?: number | null;
  /** Smaller, for the finish card. */
  compact?: boolean;
  testID?: string;
};

export function LetterGoal({
  letters,
  back,
  complete,
  vowels = false,
  recipient = [],
  line,
  fresh = null,
  compact = false,
  testID = "unit-letter",
}: Props) {
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
      <View style={[styles.paper, complete ? styles.paperDone : styles.paperOpen]}>
        <View style={styles.symbols}>
          {letters.map((letter, i) =>
            back[i] ? (
              <Text
                key={`${letter}-${i}`}
                testID={`goal-letter-${i}`}
                style={[styles.symbol, fresh === i && styles.fresh]}
              >
                {vowels ? letter + DAMMA : letter}
              </Text>
            ) : vowels ? (
              // Still bare: the letter is there, its vowel mark blown away.
              <Text key={`${letter}-${i}`} style={[styles.symbol, styles.bare]}>
                {letter}
              </Text>
            ) : (
              // A gap where a letter is still missing, blown away by the storm.
              <View key={`${letter}-${i}`} style={styles.gap} />
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
      {recipient.length ? (
        // Whom the letter is for: faint on the way, bright once it is delivered.
        <View
          testID="goal-recipient"
          style={[styles.recipient, complete ? styles.recipientDone : styles.recipientOpen]}
        >
          {recipient.map((emoji) => (
            <Picture key={emoji} emoji={emoji} size={compact ? 26 : 30} />
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

/**
 * The preparation unit, before any letter: Hudhud teaches the child to write. A blank page
 * whose lines fill with writing as the lessons are done; with the unit done, his reed pen.
 */
export function WritingGoal({
  back,
  complete,
  line,
  fresh = null,
  compact = false,
  testID = "unit-letter",
}: Omit<Props, "letters" | "vowels" | "recipient">) {
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
      <View style={[styles.paper, complete ? styles.paperDone : styles.paperOpen]}>
        {back.map((written, i) => (
          <View key={i} testID={written ? `goal-line-${i}` : undefined} style={styles.writeRow}>
            {written ? (
              <Svg width={120} height={14} viewBox="0 0 120 14">
                {fresh === i ? <Path d="M0 7 H120" stroke="#F4C14B" strokeWidth={12} /> : null}
                <Path
                  d="M4 8 q6 -8 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0"
                  stroke={yemen.blue}
                  strokeWidth={2.6}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
            ) : null}
            <View style={styles.rule} />
          </View>
        ))}
        {complete ? (
          <View style={styles.pen}>
            <Svg width={40} height={40} viewBox="0 0 40 40">
              <Path d="M8 34 L32 6" stroke="#C9A16B" strokeWidth={5} strokeLinecap="round" />
              <Path d="M8 34 L5 38" stroke={yemen.ink} strokeWidth={3.5} strokeLinecap="round" />
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
    gap: 8,
  },
  compact: { width: 150 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  fresh: { backgroundColor: "#F4C14B", borderRadius: 8, overflow: "hidden", color: yemen.clayDeep },
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
  symbol: {
    fontSize: 22,
    fontWeight: "900",
    color: yemen.ink,
    minWidth: 18,
    textAlign: "center",
    lineHeight: 34,
  },
  bare: { color: "#C9B79E" },
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
  recipient: {
    flexDirection: "row-reverse",
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },
  recipientOpen: { opacity: 0.6, borderWidth: 2, borderColor: "#E6D6BC", borderStyle: "dashed" },
  recipientDone: { borderWidth: 3, borderColor: yemen.gold },
  writeRow: { height: 16, justifyContent: "flex-end", alignItems: "center" },
  rule: { width: "100%", height: 2, borderRadius: 1, backgroundColor: "#E6D6BC" },
  pen: { position: "absolute", bottom: -12, left: -12 },
});
