/**
 * Right or wrong behaviour, for children who cannot read yet: one behaviour at a time, as a big
 * picture that shows the deed, and its sentence read aloud (again on tapping the picture or the
 * speaker). The child answers with a big ✓ or ✗. After a wrong answer the voice says which it
 * was, so the child learns from it; the answer still counts once. Answered behaviours stay
 * above as small rows with their result.
 */

import React, { useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { BehaviorScene } from "@/components/art/behavior/BehaviorScene";
import { Gloss } from "@/components/Gloss";
import { DemoContext } from "@/components/demo/DemoContext";
import { Pressable } from "@/components/demo/DemoPressable";
import { Picture } from "@/components/pictures/Picture";
import { useGuide } from "@/components/world/LessonGuide";
import { useLanguage } from "@/context/LanguageContext";
import type { BehaviorItem } from "@/content/types";
import * as haptics from "@/lib/haptics";
import { speak, speakLater } from "@/lib/speech";
import { colors, shadow, touchTarget } from "@/theme/tokens";

import { ListenButton } from "./shared/ListenButton";
import { PRAISE } from "./shared/strings";
import { DoneButton } from "./shared/DoneButton";
import { act } from "./shared/styles";
import { useOnce } from "./shared/useOnce";
import { PROMPT_DELAY_MS } from "./shared/useQuiz";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";

/** Said after a wrong answer: what the behaviour really was. */
export const WAS_RIGHT = "هٰذَا سُلُوكٌ صَحِيحٌ.";
export const WAS_WRONG = "هٰذَا سُلُوكٌ خَاطِئٌ.";

function BehaviorPicture({ item, size }: { item: BehaviorItem; size: "big" | "small" }) {
  if (item.scene)
    return size === "big" ? (
      <BehaviorScene id={item.scene} />
    ) : (
      <View style={styles.thumbArt}>
        <BehaviorScene id={item.scene} />
      </View>
    );
  return <Picture emoji={item.emoji} size={size === "big" ? 120 : 34} />;
}

function Behavior({ lesson, color, onComplete }: ActivityProps<"behavior">) {
  const guide = useGuide();
  const { behaviors } = lesson;
  const { t } = useLanguage();
  // In a worked example the hand and its voice lead; nothing is read out on its own.
  const inDemo = useContext(DemoContext) !== null;
  /** index -> whether the single answer matched `isCorrect`. */
  const [results, setResults] = useState<Readonly<Record<number, boolean>>>({});
  const current = behaviors.findIndex((_, i) => results[i] === undefined);
  const item = current >= 0 ? behaviors[current] : null;

  // The first behaviour is read out once the lesson's own intro is over (the activity mounts then).
  useEffect(() => {
    if (inDemo) return;
    // Not after the child has already answered (or heard something else): VOICE-05.
    return speakLater(behaviors[0].description, PROMPT_DELAY_MS);
  }, [inDemo, behaviors]);

  const handleAnswer = useCallback(
    (index: number, answer: boolean) => {
      if (results[index] !== undefined) return;
      const right = answer === behaviors[index].isCorrect;
      setResults((prev) => (prev[index] !== undefined ? prev : { ...prev, [index]: right }));
      if (right) {
        haptics.success();
        guide.react("right");
      } else {
        haptics.error();
        guide.react("wrong");
      }
      const feedback = right ? PRAISE : behaviors[index].isCorrect ? WAS_RIGHT : WAS_WRONG;
      const next = behaviors.find((_, i) => i !== index && results[i] === undefined);
      // Then the next behaviour is read out.
      speak(feedback, inDemo || !next ? {} : { onDone: () => speak(next.description) });
    },
    [results, behaviors, guide, inDemo],
  );

  const answered = Object.keys(results).length;
  const correct = Object.values(results).filter(Boolean).length;
  const finish = useOnce(
    useCallback(
      () => onComplete({ correct, total: behaviors.length }),
      [onComplete, correct, behaviors.length],
    ),
  );

  return (
    <View style={act.container}>
      {/* Answered behaviours: a row of small pictures with their result, in reading order. */}
      {answered > 0 ? (
        <View style={styles.strip}>
          {behaviors.map((done, i) => {
            const result = results[i];
            if (result === undefined) return null;
            return (
              <View
                key={i}
                accessible
                accessibilityLabel={`${done.description}، ${t(result ? "إجابة صحيحة" : "إجابة خطأ")}`}
                accessibilityState={{ selected: true, disabled: true }}
                style={[styles.thumb, result ? styles.cardRight : styles.cardWrong]}
              >
                <BehaviorPicture item={done} size="small" />
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: result ? colors.success : colors.danger },
                  ]}
                >
                  <Text style={styles.badgeText}>{result ? "✓" : "✗"}</Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {item ? (
        <View key={current} style={styles.card}>
          <Pressable
            testID={`behavior-picture-${current}`}
            accessibilityRole="button"
            accessibilityLabel={`${t("اضغط للاستماع")}: ${item.description}`}
            onPress={() => {
              haptics.tap();
              speak(item.description);
            }}
            style={styles.picture}
          >
            <BehaviorPicture item={item} size="big" />
          </Pressable>
          <ListenButton text={item.description} color={color} showText />
          <Gloss text={item.description} style={styles.gloss} />
          <View style={styles.buttons}>
            <Pressable
              testID={`behavior-right-${current}`}
              accessibilityRole="button"
              accessibilityLabel={`${t("سلوك صحيح")}: ${item.description}`}
              style={[styles.round, styles.check]}
              onPress={() => handleAnswer(current, true)}
            >
              <Text style={styles.checkText}>✓</Text>
            </Pressable>
            <Pressable
              testID={`behavior-wrong-${current}`}
              accessibilityRole="button"
              accessibilityLabel={`${t("سلوك خطأ")}: ${item.description}`}
              style={[styles.round, styles.cross]}
              onPress={() => handleAnswer(current, false)}
            >
              <Text style={styles.crossText}>✗</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {answered >= behaviors.length ? (
        <DoneButton
          testID="activity-done"
          label={`أَحْسَنْت! ${correct}/${behaviors.length} صحيح 🌟 تابع`}
          color={color}
          onPress={finish.fire}
          disabled={finish.done}
        />
      ) : null}
    </View>
  );
}

export const BehaviorActivity = withAttemptReset(Behavior, "BehaviorActivity");

const BIG = 76;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 22,
    padding: 12,
    alignItems: "center",
    gap: 12,
    width: "100%",
    ...shadow.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  picture: {
    width: "100%",
    minHeight: touchTarget,
    alignItems: "center",
    borderRadius: 16,
    overflow: "hidden",
  },
  gloss: { textAlign: "center" },
  strip: { flexDirection: "row-reverse", gap: 8, justifyContent: "center", flexWrap: "wrap" },
  thumb: {
    width: 62,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbArt: { width: 56, borderRadius: 7, overflow: "hidden" },
  badge: {
    position: "absolute",
    bottom: -6,
    left: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  cardRight: { borderColor: colors.success, backgroundColor: colors.successSoft },
  cardWrong: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  buttons: { flexDirection: "row", gap: 32, justifyContent: "center" },
  round: {
    width: BIG,
    height: BIG,
    borderRadius: BIG / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  check: { backgroundColor: colors.successSoft, borderColor: colors.success },
  cross: { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
  checkText: { fontSize: 38, color: colors.successText, fontWeight: "900" },
  crossText: { fontSize: 38, color: colors.dangerText, fontWeight: "900" },
});
