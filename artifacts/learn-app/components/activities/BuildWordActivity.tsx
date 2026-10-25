import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { Circle, Path, Rect, Svg } from "react-native-svg";
import { UiText } from "@/components/UiText";
import type { BuildWordRound } from "@/content/types";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { colors, readableFill, touchTarget, withAlpha } from "@/theme/tokens";
import { ListenButton } from "./shared/ListenButton";
import { ProgressDots } from "./shared/ProgressDots";
import { seedFor, shuffleWithSeed } from "./shared/shuffle";
import { PRAISE } from "./shared/strings";
import { act } from "./shared/styles";
import { PROMPT_DELAY_MS, useBounce, useQuiz } from "./shared/useQuiz";
import { useLatest } from "./shared/useLatest";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";

/** From the last syllable loaded to the next round: the train whistles and leaves. */
export const DEPART_MS = 2000;
const SHAKE_MS = 60;

/** Book syllables carry a tatweel (يُـ) to show they join the next letter; it is never spoken. */
export const spokenSyllable = (syllable: string) => syllable.replace(/ـ/g, "");

/**
 * "قِطَارُ الْمَقَاطِعِ": the child hears a word and loads its syllables into the wagons,
 * right to left as Arabic is read. A round counts as correct when no wrong tile was tapped.
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
  });
  const { pick } = quiz;
  const handleDone = useCallback((correct: boolean) => pick(0, correct), [pick]);

  return (
    <View style={act.container}>
      <ProgressDots count={rounds.length} current={quiz.roundIndex} color={color} />
      <UiText style={act.instruction}>{`سؤال ${quiz.roundIndex + 1} من ${rounds.length}`}</UiText>
      <UiText style={act.hint}>
        {isSentence(rounds[quiz.roundIndex])
          ? "رتّب الكلمات في القطار 🚂"
          : rounds[quiz.roundIndex].given
            ? "أكمل القطار بالمقطع الناقص 🚂"
            : "رتّب المقاطع في القطار 🚂"}
      </UiText>
      <TrainRound
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

/** A sentence round loads whole words (ذَهَبَ / جُبْرَانُ / ...), drawn smaller to fit the train. */
const isSentence = (round: BuildWordRound) => round.word.includes(" ");

type RoundProps = {
  round: BuildWordRound;
  color: string;
  seed: number;
  onDone: (correct: boolean) => void;
};

function TrainRound({ round, color, seed, onDone }: RoundProps) {
  const { word, syllables, given } = round;
  const sentence = isSentence(round);
  /** Wagons the child loads, in reading order; given wagons start full. */
  const open = useMemo(
    () => syllables.map((_, i) => i).filter((i) => !given?.includes(i)),
    [syllables, given],
  );
  const tiles = useMemo(
    () => shuffleWithSeed([...open.map((i) => syllables[i]), ...round.extras], 0, seed).items,
    [open, syllables, round.extras, seed],
  );
  /** How many of the open wagons are loaded. */
  const [loaded, setLoaded] = useState(0);
  const [used, setUsed] = useState<ReadonlySet<number>>(() => new Set());
  const [missed, setMissed] = useState(false);
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [shake] = useState(() => new Animated.Value(0));
  const [drive] = useState(() => new Animated.Value(0));
  const { values: wagonScale, bounce } = useBounce(syllables.length);
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
      // Whole word loaded: say it, praise, and let the train leave to the left.
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
    [done, used, tiles, syllables, open, loaded, missed, word, shake, bounce, drive, latestDone],
  );

  const trainX = drive.interpolate({ inputRange: [0, 1], outputRange: [0, -600] });
  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] });
  const hint = missed && !done ? syllables[open[loaded]] : null;

  return (
    <View style={styles.round}>
      <View style={styles.prompt}>
        {round.emoji ? <Text style={styles.picture}>{round.emoji}</Text> : null}
        <ListenButton text={word} color={color} />
      </View>

      <View style={styles.track}>
        <Animated.View
          testID="train"
          style={[styles.train, { transform: [{ translateX: trainX }] }]}
        >
          {syllables.map((syllable, i) => (
            <Animated.View
              key={i}
              testID={`wagon-${i}`}
              accessible
              accessibilityLabel={isFull(i) ? syllable : "؟"}
              style={[
                styles.wagon,
                { borderColor: color, transform: [{ scale: wagonScale[i] }] },
                isFull(i) && { backgroundColor: withAlpha(color, 0.12) },
              ]}
            >
              <Text
                style={[
                  styles.wagonText,
                  sentence && styles.wagonWord,
                  { color: readableFill(color) },
                ]}
              >
                {isFull(i) ? syllable : ""}
              </Text>
              <View style={styles.wheels}>
                <View style={styles.wheel} />
                <View style={styles.wheel} />
              </View>
            </Animated.View>
          ))}
          <View style={styles.engine}>
            {done ? <Text style={styles.smoke}>💨</Text> : null}
            <Engine color={color} />
          </View>
        </Animated.View>
        <View style={styles.rail} />
      </View>

      {done ? (
        <View style={styles.result} accessibilityLiveRegion="polite">
          <Text style={[styles.word, sentence && styles.sentence, { color: readableFill(color) }]}>
            {word}
          </Text>
          <Text style={styles.cheer}>{missed ? "👏" : "🎉"}</Text>
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

/** A small locomotive facing left, the direction the word is read. */
function Engine({ color }: { color: string }) {
  const fill = readableFill(color);
  return (
    <Svg width={64} height={50} viewBox="0 0 64 50">
      <Rect x={12} y={6} width={8} height={12} rx={2} fill={colors.text} />
      <Rect x={6} y={17} width={36} height={18} rx={5} fill={fill} />
      <Rect x={38} y={6} width={22} height={29} rx={3} fill={fill} />
      <Rect x={43} y={11} width={12} height={10} rx={2} fill={colors.starSoft} />
      <Path d="M6 33 L0 43 L12 43 Z" fill={colors.text} />
      <Circle cx={4} cy={24} r={3} fill={colors.star} />
      {[16, 32, 50].map((cx) => (
        <Circle
          key={cx}
          cx={cx}
          cy={42}
          r={6}
          fill={colors.text}
          stroke={colors.white}
          strokeWidth={2}
        />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  round: { width: "100%", alignItems: "center", gap: 18 },
  prompt: { flexDirection: "row", alignItems: "center", gap: 16 },
  picture: { fontSize: 56 },
  track: { width: "100%", alignItems: "center", overflow: "hidden", paddingTop: 8 },
  // row-reverse: the first syllable is the rightmost wagon, the engine pulls to the left.
  train: { flexDirection: "row-reverse", alignItems: "flex-end", gap: 4 },
  engine: { alignItems: "center" },
  smoke: { position: "absolute", top: -22, left: 4, fontSize: 22 },
  wagon: {
    minWidth: 58,
    height: 56,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 3,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  wagonText: { fontSize: 28, fontWeight: "900", lineHeight: 40 },
  wagonWord: { fontSize: 17, lineHeight: 28 },
  wheels: {
    position: "absolute",
    bottom: -9,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
  },
  wheel: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.text },
  rail: { width: "100%", height: 4, borderRadius: 2, backgroundColor: colors.subtle },
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
  cheer: { fontSize: 40 },
});
