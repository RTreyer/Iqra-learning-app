/**
 * Rasha's clay bowl (content/story.ts), the heart of Hudhud's story:
 * - `BowlArt`: the bowl itself, with water up to a level;
 * - `BowlGoal`: the daily ritual on the home screen and the finish card: every lesson of the day
 *   fills it a little; with three, it is full and the birds come to drink (no streak, no loss);
 * - `Note`: the sheet of paper Rasha tucked under the bowl, folded once;
 * - `BowlMessage`: the bowl with her note clamped under it, «اِسْقِ الطُّيُورَ» and her name.
 *   Each letter lights up once the child has learnt it; the rest stays pale.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Ellipse, Path, Svg } from "react-native-svg";

import { MESSAGE } from "@/content/story";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { touchTarget } from "@/theme/tokens";
import { Hudhud } from "./Hudhud";

const CLAY = "#B5522E";
const CLAY_DARK = "#7A3418";
const CLAY_LIGHT = "#D9805A";
const WATER = "#4F8FD6";
/** Rasha's ink on the note, and the paper. */
const INK = "#2F3A6E";
const PAPER = "#FBF3DF";

/** The clay bowl seen a little from above, with water from 0 (empty) to 1 (full). */
export function BowlArt({ width = 120, level = 0 }: { width?: number; level?: number }) {
  const fill = Math.max(0, Math.min(1, level));
  // The water's surface sinks into the bowl as it empties.
  const surfaceY = 24 + (1 - fill) * 18;
  const surfaceRx = 44 - (1 - fill) * 12;
  return (
    <Svg width={width} height={(width * 64) / 100} viewBox="0 0 100 64">
      <Path d="M6 22 Q8 58 50 60 Q92 58 94 22 Z" fill={CLAY} />
      <Path d="M14 30 Q22 52 50 54" stroke={CLAY_LIGHT} strokeWidth={3} fill="none" opacity={0.6} />
      <Ellipse cx={50} cy={22} rx={44} ry={10} fill={CLAY_DARK} />
      <Ellipse cx={50} cy={22} rx={40} ry={8} fill="#5E2A14" />
      {fill > 0 ? (
        <>
          <Ellipse cx={50} cy={surfaceY} rx={surfaceRx} ry={6} fill={WATER} />
          <Ellipse
            cx={42}
            cy={surfaceY - 1.5}
            rx={surfaceRx / 3}
            ry={1.6}
            fill="#FFFFFF"
            opacity={0.5}
          />
        </>
      ) : null}
      <Path d="M6 22 Q50 34 94 22" stroke={CLAY_DARK} strokeWidth={2} fill="none" />
    </Svg>
  );
}

type GoalProps = {
  /** Lessons done today. */
  filled: number;
  /** Lessons that fill the bowl. */
  goal?: number;
  width?: number;
};

/** The daily bowl: three lessons fill it, then Hudhud and a sparrow drink. */
export function BowlGoal({ filled, goal = 3, width = 104 }: GoalProps) {
  const full = filled >= goal;
  return (
    <View
      style={[styles.daily, { width }]}
      testID="daily-bowl"
      accessibilityValue={{ min: 0, max: goal, now: Math.min(filled, goal) }}
    >
      {full ? (
        <View style={styles.drinkers}>
          <Hudhud size={width * 0.42} hop={false} />
        </View>
      ) : null}
      <BowlArt width={width} level={Math.min(filled, goal) / goal} />
    </View>
  );
}

/** Letters of the message the child may already read: those learnt, and alif from the start. */
function readable(letter: string, learnt: ReadonlySet<string>): boolean {
  return letter === "ا" || learnt.has(letter);
}

/** The base letters of a vocalised word, in reading order. */
export function messageLetters(word: string): string[] {
  return [...word.replace(/[ً-ْٰ]/g, "")];
}

/** Rasha's note: a sheet of paper, folded once, with a pale crease across it. */
export function Note({
  children,
  width,
  style,
}: {
  children: React.ReactNode;
  width?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.note, width ? { width } : null, style]}>
      <View style={styles.crease} />
      {children}
    </View>
  );
}

/** The message's letters on the note, one row per word: readable letters in ink, the rest pale. */
export function NoteLetters({
  readable: isReadable,
  size = 22,
}: {
  readable: (letter: string) => boolean;
  size?: number;
}) {
  const words = [...MESSAGE.words, MESSAGE.name];
  return (
    <>
      {words.map((w, i) => (
        <View
          key={w}
          style={[styles.letters, { gap: size * 0.22 }, i === words.length - 1 && styles.signature]}
        >
          {messageLetters(w).map((l, k) => (
            <Text
              key={k}
              testID={isReadable(l) ? "bowl-letter-lit" : "bowl-letter-faint"}
              style={[
                styles.letter,
                { fontSize: size, lineHeight: size * 1.45, minWidth: size * 0.65 },
                isReadable(l) ? styles.lit : styles.faint,
              ]}
            >
              {l}
            </Text>
          ))}
        </View>
      ))}
    </>
  );
}

/**
 * The bowl with Rasha's note clamped under it. The letters stand apart (not yet joined into
 * words): learnt letters in ink, the others pale. With every letter learnt it reads as a whole.
 */
export function BowlMessage({
  learnt,
  compact = false,
  testID = "bowl-message",
}: {
  learnt: ReadonlySet<string>;
  compact?: boolean;
  testID?: string;
}) {
  const words = [...MESSAGE.words, MESSAGE.name];
  const all = words.every((w) => messageLetters(w).every((l) => readable(l, learnt)));
  const line = all
    ? `${MESSAGE.words.join(" ")}. ${MESSAGE.name}.`
    : "تَحْتَ الصَّحْنِ وَرَقَةٌ مِنْ رَشَا. كُلُّ حَرْفٍ نَتَعَلَّمُهُ يُضِيءُ!";
  const bowlWidth = compact ? 112 : 132;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={line}
      accessibilityState={{ checked: all }}
      onPress={() => {
        haptics.tap();
        speak(line);
      }}
      style={({ pressed }) => [
        styles.message,
        compact && styles.compact,
        pressed && styles.pressed,
      ]}
    >
      {all ? <View style={styles.glow} /> : null}
      <View style={styles.onTop}>
        <BowlArt width={bowlWidth} level={all ? 1 : 0.35} />
      </View>
      {/* The note is clamped under the bowl: its top edge hides beneath the bowl's foot. */}
      <Note width={compact ? 140 : 160} style={[styles.tucked, { marginTop: -bowlWidth * 0.14 }]}>
        {all ? (
          // Whole: the message reads joined, as Rasha wrote it.
          <>
            <Text style={[styles.word, styles.lit]}>{MESSAGE.words.join(" ")}</Text>
            <Text style={[styles.name, styles.lit]}>{MESSAGE.name}</Text>
          </>
        ) : (
          <NoteLetters readable={(l) => readable(l, learnt)} />
        )}
      </Note>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  daily: { alignItems: "center", justifyContent: "flex-end" },
  drinkers: { marginBottom: -12 },
  message: { width: 176, minHeight: touchTarget * 2, alignItems: "center", gap: 2 },
  compact: { width: 150 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  glow: {
    position: "absolute",
    top: 0,
    width: 196,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#F4C14B",
    opacity: 0.35,
  },
  note: {
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 8,
    borderRadius: 4,
    backgroundColor: PAPER,
    borderWidth: 1,
    borderColor: "#E2CFA4",
    shadowColor: "#5E3220",
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  crease: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 1,
    backgroundColor: "#E8DAB8",
  },
  // Behind the bowl, a little askew, as if pushed under it in a hurry.
  tucked: { transform: [{ rotate: "-3deg" }] },
  onTop: { zIndex: 1 },
  letters: { flexDirection: "row-reverse" },
  signature: { marginTop: 2 },
  letter: { fontWeight: "900", textAlign: "center" },
  lit: { color: INK },
  faint: { color: "#D8CBAE" },
  word: { fontSize: 24, fontWeight: "900", lineHeight: 36 },
  name: { fontSize: 18, fontWeight: "800", lineHeight: 28 },
});

export { CLAY, CLAY_DARK, INK, PAPER, WATER };
