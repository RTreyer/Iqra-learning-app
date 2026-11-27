import React, { useCallback, useState } from "react";
import { Gloss } from "@/components/Gloss";
import { Picture } from "@/components/pictures/Picture";
import { StyleSheet, Text, View } from "react-native";
import { Pressable } from "@/components/demo/DemoPressable";
import { useLanguage } from "@/context/LanguageContext";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { colors, shadow, touchTarget, withAlpha } from "@/theme/tokens";
import { PRAISE } from "./shared/strings";
import { DoneButton } from "./shared/DoneButton";
import { act } from "./shared/styles";
import { useOnce } from "./shared/useOnce";
import { useShuffled } from "./shared/useShuffled";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";
import { useGuide } from "@/components/world/LessonGuide";

type State = {
  selectedLeft: number | null;
  /** Pair indices matched so far. */
  matched: ReadonlySet<number>;
  /** Pair indices whose first right tap was wrong. */
  missed: ReadonlySet<number>;
};

const INITIAL: State = { selectedLeft: null, matched: new Set(), missed: new Set() };

/** The book prints a split word as "مُـ / رَا / دُ" (content/arabic/lessonKit.ts `split`). */
const SPLIT = " / ";

/** What the voice says for a card: a split word syllable by syllable, with a pause between. */
const spokenCard = (word: string) =>
  word.includes(SPLIT) ? word.split(SPLIT).map((s) => s.replace(/ـ/g, "")).join("، ") : word;

/**
 * A card's text. A split word shows each syllable as its own chip, right to left as it is
 * read, so no slash can be read as an alif or a lam (CONT-01: "بُـ / يُو / تُ" was read as
 * "بـ يو لت").
 */
function CardText({ word, withPicture }: { word: string; withPicture: boolean }) {
  if (!word.includes(SPLIT))
    return <Text style={[styles.word, !withPicture && styles.wordOnly]}>{word}</Text>;
  return (
    <View style={styles.chips} testID="split-word">
      {word.split(SPLIT).map((syllable, i) => (
        <Text key={i} style={styles.chip}>
          {syllable}
        </Text>
      ))}
    </View>
  );
}

function Matching({ lesson, color, attemptKey, onComplete }: ActivityProps<"matching">) {
  const guide = useGuide();
  const { pairs } = lesson;
  const { language } = useLanguage();
  const [state, setState] = useState<State>(INITIAL);
  // Shuffle the right column per attempt; only the order array is used.
  const right = useShuffled(pairs, 0, attemptKey, "match");

  const handleLeft = useCallback(
    (i: number) => {
      if (state.matched.has(i)) return;
      haptics.tap();
      // The child cannot read yet: the card is read out (CONT-09).
      speak(spokenCard(pairs[i].left.word));
      setState((s) => ({ ...s, selectedLeft: i }));
    },
    [state.matched, pairs],
  );

  const handleRight = useCallback(
    (pairIdx: number) => {
      const left = state.selectedLeft;
      if (state.matched.has(pairIdx)) return;
      if (left === null) {
        // Nothing chosen on the other side yet: the word is read out, nothing is scored.
        speak(spokenCard(pairs[pairIdx].right.word));
        return;
      }
      if (left === pairIdx) {
        haptics.success();
        guide.react("right");
        speak(PRAISE);
        setState((s) => ({ ...s, selectedLeft: null, matched: new Set(s.matched).add(pairIdx) }));
      } else {
        haptics.error();
        guide.react("wrong");
        speak(spokenCard(pairs[pairIdx].right.word));
        setState((s) => ({ ...s, selectedLeft: null, missed: new Set(s.missed).add(left) }));
      }
    },
    [state, guide, pairs],
  );

  const allMatched = state.matched.size >= pairs.length;
  const correct = pairs.length - state.missed.size;
  const finish = useOnce(
    useCallback(
      () => onComplete({ correct, total: pairs.length }),
      [onComplete, correct, pairs.length],
    ),
  );

  return (
    <View style={act.container}>
      {/* Mirrored in Arabic so the first column sits on the right, as the hint says. */}
      <View
        testID="match-grid"
        style={[styles.grid, { flexDirection: language === "en" ? "row" : "row-reverse" }]}
      >
        <View style={styles.column}>
          {pairs.map((pair, i) => (
            <Pressable
              key={i}
              testID={`match-left-${i}`}
              accessibilityRole="button"
              accessibilityLabel={pair.left.word}
              accessibilityState={{
                selected: state.selectedLeft === i || state.matched.has(i),
                disabled: state.matched.has(i),
              }}
              style={[
                styles.item,
                !pair.left.emoji && styles.itemTextOnly,
                state.selectedLeft === i && { borderColor: color, borderWidth: 3 },
                state.matched.has(i) && {
                  backgroundColor: withAlpha(color, 0.13),
                  borderColor: color,
                  borderWidth: 2,
                },
              ]}
              onPress={() => handleLeft(i)}
            >
              {pair.left.emoji ? <Picture emoji={pair.left.emoji} size={40} /> : null}
              <CardText word={pair.left.word} withPicture={!!pair.left.emoji} />
              <Gloss text={pair.left.word} />
            </Pressable>
          ))}
        </View>
        <View
          style={styles.arrows}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {pairs.map((_, i) => (
            <Text key={i} style={styles.arrow}>
              ↔
            </Text>
          ))}
        </View>
        <View style={styles.column}>
          {right.order.map((pairIdx) => (
            <Pressable
              key={pairIdx}
              testID={`match-right-${pairIdx}`}
              accessibilityRole="button"
              accessibilityLabel={pairs[pairIdx].right.word}
              accessibilityState={{
                selected: state.matched.has(pairIdx),
                disabled: state.matched.has(pairIdx),
              }}
              style={[
                styles.item,
                !pairs[pairIdx].right.emoji && styles.itemTextOnly,
                state.matched.has(pairIdx) && styles.itemMatched,
              ]}
              onPress={() => handleRight(pairIdx)}
            >
              {pairs[pairIdx].right.emoji ? (
                <Picture emoji={pairs[pairIdx].right.emoji} size={40} />
              ) : null}
              <CardText
                word={pairs[pairIdx].right.word}
                withPicture={!!pairs[pairIdx].right.emoji}
              />
              <Gloss text={pairs[pairIdx].right.word} />
            </Pressable>
          ))}
        </View>
      </View>
      {allMatched ? (
        <DoneButton
          testID="activity-done"
          label="أَحْسَنْت! 🌟 تابع"
          color={color}
          onPress={finish.fire}
          disabled={finish.done}
        />
      ) : null}
    </View>
  );
}

export const MatchingActivity = withAttemptReset(Matching, "MatchingActivity");

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  column: { flex: 1, gap: 10 },
  item: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    gap: 4,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadow.card,
    minHeight: touchTarget,
  },
  /** Same pitch as the arrows column (68 high) when a card has no picture. */
  itemTextOnly: { minHeight: 68, justifyContent: "center", paddingHorizontal: 6 },
  itemMatched: { backgroundColor: colors.successSoft, borderColor: colors.success, borderWidth: 2 },
  word: { fontSize: 15, fontWeight: "700", color: colors.mutedStrong, textAlign: "center" },
  /** Syllables and words without a picture are what the child reads: make them large. */
  wordOnly: { fontSize: 22, fontWeight: "800", color: colors.text, lineHeight: 34 },
  // Three syllables side by side in a card of a 360 px phone (they wrapped 2 + 1, CONT-R2-03).
  chips: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 3,
  },
  chip: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    lineHeight: 32,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "#FFF6DD",
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: "hidden",
  },
  arrows: { gap: 10, alignItems: "center" },
  arrow: {
    fontSize: 20,
    color: colors.mutedStrong,
    height: 68,
    textAlignVertical: "center",
    lineHeight: 68,
  },
});
