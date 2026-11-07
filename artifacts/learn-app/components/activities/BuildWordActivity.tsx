import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Picture } from "@/components/pictures/Picture";
import { StarIcon } from "@/components/world/Icon";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Pressable } from "@/components/demo/DemoPressable";
import { Circle, Path, Svg } from "react-native-svg";
import type { BuildWordRound } from "@/content/types";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { colors, readableFill, touchTarget, withAlpha } from "@/theme/tokens";
import { ListenButton } from "./shared/ListenButton";
import { StoryProgress } from "./shared/StoryProgress";
import { seedFor, shuffleWithSeed } from "./shared/shuffle";
import { PRAISE } from "./shared/strings";
import { act } from "./shared/styles";
import { PROMPT_DELAY_MS, useBounce, useQuiz } from "./shared/useQuiz";
import { useLatest } from "./shared/useLatest";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";
import { useGuide } from "@/components/world/LessonGuide";

/** From the last syllable placed to the next round: Hudhud's letter flies off with the word. */
export const DEPART_MS = 2000;
const SHAKE_MS = 60;

/** Book syllables carry a tatweel (يُـ) to show they join the next letter; it is never spoken. */
export const spokenSyllable = (syllable: string) => syllable.replace(/ـ/g, "");

/**
 * Syllables for Hudhud's letter: the child hears a word and writes its syllables into the gaps
 * of his letter, right to left as Arabic is read. When the word is whole, the letter flies off
 * to its reader. A round counts as correct when no wrong tile was tapped.
 */
function BuildWord({
  lesson,
  color,
  attemptKey,
  onComplete,
  onRoundResult,
}: ActivityProps<"build_word">) {
  const { rounds } = lesson;
  const quiz = useQuiz({
    lesson,
    total: rounds.length,
    onComplete,
    onRoundResult,
    autoAdvanceMs: DEPART_MS,
    // The letter already lets the child retry tile by tile; it reports the whole round once.
    retry: false,
  });
  const { pick } = quiz;
  const handleDone = useCallback((correct: boolean) => pick(0, correct), [pick]);

  return (
    <View style={act.container}>
      <StoryProgress count={rounds.length} current={quiz.roundIndex} color={color} />
      <LetterRound
        key={quiz.roundIndex}
        round={rounds[quiz.roundIndex]}
        color={color}
        seed={seedFor(attemptKey, quiz.roundIndex)}
        onDone={handleDone}
      />
    </View>
  );
}

export const BuildWordActivity = withAttemptReset(BuildWord, "BuildWordActivity");

/** A sentence round places whole words (ذَهَبَ / جُبْرَانُ / ...), drawn smaller to fit the letter. */
const isSentence = (round: BuildWordRound) => round.word.includes(" ");

type RoundProps = {
  round: BuildWordRound;
  color: string;
  seed: number;
  onDone: (correct: boolean) => void;
};

function LetterRound({ round, color, seed, onDone }: RoundProps) {
  const guide = useGuide();
  const { word, syllables, given } = round;
  const sentence = isSentence(round);
  /** Gaps the child fills, in reading order; given syllables are already written. */
  const open = useMemo(
    () => syllables.map((_, i) => i).filter((i) => !given?.includes(i)),
    [syllables, given],
  );
  const tiles = useMemo(
    () => shuffleWithSeed([...open.map((i) => syllables[i]), ...round.extras], 0, seed).items,
    [open, syllables, round.extras, seed],
  );
  /** How many of the gaps are filled. */
  const [loaded, setLoaded] = useState(0);
  const [used, setUsed] = useState<ReadonlySet<number>>(() => new Set());
  const [missed, setMissed] = useState(false);
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [shake] = useState(() => new Animated.Value(0));
  const [drive] = useState(() => new Animated.Value(0));
  const { values: slotScale, bounce } = useBounce(syllables.length);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const done = loaded === open.length;
  const isFull = (i: number) => !open.includes(i) || open.indexOf(i) < loaded;
  const latestDone = useLatest(onDone);

  useEffect(() => {
    const t = setTimeout(() => speak(word), PROMPT_DELAY_MS);
    return () => clearTimeout(t);
  }, [word]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const handleTile = useCallback(
    (index: number) => {
      if (done || used.has(index)) return;
      const syllable = tiles[index];
      const expected = syllables[open[loaded]];
      if (syllable !== expected) {
        setMissed(true);
        setWrongTile(index);
        haptics.error();
        guide.react("wrong");
        speak(spokenSyllable(expected));
        Animated.sequence(
          [1, -1, 1, 0].map((toValue) =>
            Animated.timing(shake, { toValue, duration: SHAKE_MS, useNativeDriver: true }),
          ),
        ).start();
        return;
      }
      const next = loaded + 1;
      setWrongTile(null);
      setUsed((prev) => new Set(prev).add(index));
      setLoaded(next);
      bounce(open[loaded], 1.12);
      if (next < open.length) {
        haptics.tap();
        speak(spokenSyllable(syllable));
        return;
      }
      // Whole word written: say it, praise, and let Hudhud's letter fly off to the left.
      latestDone.current(!missed);
      speak(`${word}، ${PRAISE}`);
      timer.current = setTimeout(() => {
        Animated.timing(drive, {
          toValue: 1,
          duration: DEPART_MS - 900,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }).start();
      }, 500);
    },
    [
      done,
      used,
      tiles,
      syllables,
      open,
      loaded,
      missed,
      word,
      shake,
      bounce,
      drive,
      latestDone,
      guide,
    ],
  );

  const flyX = drive.interpolate({ inputRange: [0, 1], outputRange: [0, -600] });
  const flyY = drive.interpolate({ inputRange: [0, 1], outputRange: [0, -90] });
  const flyTurn = drive.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-14deg"] });
  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] });
  const hint = missed && !done ? syllables[open[loaded]] : null;

  return (
    <View style={styles.round}>
      <View style={styles.prompt}>
        {round.emoji ? <Picture emoji={round.emoji} size={72} /> : null}
        <ListenButton text={word} color={color} />
      </View>

      <View style={styles.track}>
        <Animated.View
          testID="letter-paper"
          style={[
            styles.paper,
            { transform: [{ translateX: flyX }, { translateY: flyY }, { rotate: flyTurn }] },
          ]}
        >
          <View style={styles.slots}>
            {syllables.map((syllable, i) => (
              <Animated.View
                key={i}
                testID={`slot-${i}`}
                accessible
                accessibilityLabel={isFull(i) ? syllable : "؟"}
                style={[
                  styles.slot,
                  isFull(i)
                    ? { borderColor: "transparent" }
                    : { borderColor: withAlpha(color, 0.6) },
                  { transform: [{ scale: slotScale[i] }] },
                ]}
              >
                <Text
                  style={[
                    styles.slotText,
                    sentence && styles.slotWord,
                    { color: readableFill(color) },
                  ]}
                >
                  {isFull(i) ? syllable : ""}
                </Text>
              </Animated.View>
            ))}
          </View>
          <View style={styles.rule} />
          <View style={styles.seal}>
            <Svg width={26} height={26} viewBox="0 0 26 26">
              <Circle cx={13} cy={13} r={11} fill={colors.danger} />
              <Path
                d="M8 10 L13 14 L18 10 M8 10 H18 V17 H8 Z"
                stroke="#FFFFFF"
                strokeWidth={1.6}
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </View>
        </Animated.View>
      </View>

      {done ? (
        <View style={styles.result} accessibilityLiveRegion="polite">
          <Text style={[styles.word, sentence && styles.sentence, { color: readableFill(color) }]}>
            {word}
          </Text>
          <StarIcon size={44} dim={missed} />
        </View>
      ) : (
        <View style={styles.tiles}>
          {tiles.map((syllable, i) => {
            const gone = used.has(i);
            const wrong = wrongTile === i;
            return (
              <Animated.View
                key={i}
                style={wrong ? { transform: [{ translateX: shakeX }] } : undefined}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={syllable}
                  accessibilityState={{ disabled: gone }}
                  accessibilityElementsHidden={gone}
                  importantForAccessibility={gone ? "no-hide-descendants" : "auto"}
                  disabled={gone}
                  onPress={() => handleTile(i)}
                  style={[
                    styles.tile,
                    gone && styles.tileGone,
                    wrong && styles.tileWrong,
                    !gone && syllable === hint && { borderColor: colors.star, borderWidth: 4 },
                  ]}
                >
                  <Text style={[styles.tileText, sentence && styles.tileWord]}>{syllable}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  round: { width: "100%", alignItems: "center", gap: 18 },
  prompt: { flexDirection: "row", alignItems: "center", gap: 16 },
  track: { width: "100%", alignItems: "center", paddingTop: 8 },
  // Hudhud's letter: a sheet of paper with gaps for the syllables, sealed in the corner.
  paper: {
    minWidth: 220,
    maxWidth: "100%",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    borderRadius: 14,
    backgroundColor: "#FFF8EC",
    borderWidth: 2,
    borderColor: "#E6D3B8",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 5px 0 #E6D3B8",
  },
  // row-reverse: the first syllable is on the right, as Arabic is read.
  slots: { flexDirection: "row-reverse", alignItems: "flex-end", gap: 6 },
  slot: {
    minWidth: 58,
    height: 56,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 3,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  slotText: { fontSize: 30, fontWeight: "900", lineHeight: 42 },
  slotWord: { fontSize: 18, lineHeight: 28 },
  rule: { alignSelf: "stretch", height: 2, borderRadius: 1, backgroundColor: "#E6D3B8" },
  seal: { position: "absolute", top: -10, left: -10 },
  tiles: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    maxWidth: 340,
  },
  tile: {
    minWidth: 72,
    minHeight: Math.max(touchTarget, 72),
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#D97706",
    backgroundColor: colors.starSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  tileGone: { opacity: 0 },
  tileWrong: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  tileText: { fontSize: 32, fontWeight: "900", color: colors.starText, lineHeight: 46 },
  tileWord: { fontSize: 24, lineHeight: 38 },
  result: { flexDirection: "row", alignItems: "center", gap: 12 },
  word: { fontSize: 48, fontWeight: "900", lineHeight: 72 },
  sentence: { fontSize: 28, lineHeight: 44, flexShrink: 1, textAlign: "center" },
});
