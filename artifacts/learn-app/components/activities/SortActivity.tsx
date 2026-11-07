import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLine } from "@/components/Gloss";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Pressable } from "@/components/demo/DemoPressable";
import { picLabel } from "@/content/math/picLabel";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { colors, touchTarget } from "@/theme/tokens";
import { MathPic } from "./math/MathPic";
import { useInstruction } from "./math/useInstruction";
import { ListenButton } from "./shared/ListenButton";
import { PRAISE } from "./shared/strings";
import { act } from "./shared/styles";
import { useLatest } from "./shared/useLatest";
import { ADVANCE_MS } from "./shared/useQuiz";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";
import { useGuide } from "@/components/world/LessonGuide";

/**
 * Tap an item, then the box it belongs in. A wrong box keeps the item in place; only an
 * item's first placement counts. The lesson ends when every item is in its box.
 */
function Sort({ lesson, color, onComplete }: ActivityProps<"sort">) {
  const line = useLine();
  const guide = useGuide();
  const [selected, setSelected] = useState<number | null>(null);
  const [placed, setPlaced] = useState<boolean[]>(() => lesson.items.map(() => false));
  const missed = useRef<Set<number>>(new Set());
  const [wrongBox, setWrongBox] = useState<number | null>(null);
  const [shakes] = useState(() => [new Animated.Value(0), new Animated.Value(0)]);
  const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbacks = useLatest({ onComplete });
  useInstruction(lesson.prompt);

  const done = placed.every(Boolean);
  useEffect(() => {
    if (!done) return;
    speak(PRAISE);
    const total = lesson.items.length;
    const t = setTimeout(
      () => callbacks.current.onComplete({ correct: total - missed.current.size, total }),
      ADVANCE_MS,
    );
    return () => clearTimeout(t);
  }, [done, lesson.items.length, callbacks]);

  useEffect(
    () => () => {
      if (wrongTimer.current) clearTimeout(wrongTimer.current);
    },
    [],
  );

  const flagWrong = useCallback(
    (box: number) => {
      setWrongBox(box);
      if (wrongTimer.current) clearTimeout(wrongTimer.current);
      wrongTimer.current = setTimeout(() => setWrongBox(null), WRONG_MS);
      const x = shakes[box];
      Animated.sequence([
        Animated.timing(x, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(x, { toValue: -8, duration: 100, useNativeDriver: true }),
        Animated.timing(x, { toValue: 8, duration: 100, useNativeDriver: true }),
        Animated.timing(x, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    },
    [shakes],
  );

  const handleBox = useCallback(
    (box: 0 | 1) => {
      if (selected === null) return;
      if (lesson.items[selected].box !== box) {
        missed.current.add(selected);
        haptics.error();
        guide.react("wrong");
        flagWrong(box);
        return;
      }
      haptics.success();
      guide.react("right");
      setPlaced((p) => p.map((v, i) => v || i === selected));
      setSelected(null);
    },
    [selected, lesson.items, flagWrong, guide],
  );

  return (
    <View style={act.container}>
      <ListenButton text={lesson.prompt} color={color} showText />
      <View style={styles.boxes}>
        {lesson.boxes.map((box, b) => (
          <Animated.View
            key={b}
            style={[styles.boxWrap, { transform: [{ translateX: shakes[b] }] }]}
          >
            <Pressable
              testID={`sort-box-${b}`}
              accessibilityRole="button"
              accessibilityLabel={line(box.label)}
              onPress={() => handleBox(b as 0 | 1)}
              style={[
                styles.box,
                selected !== null && { borderColor: color },
                wrongBox === b && { borderColor: colors.danger },
              ]}
            >
              {box.pic ? <MathPic pic={box.pic} decorative /> : null}
              <Text style={styles.boxLabel}>{line(box.label)}</Text>
              <View style={styles.inBox}>
                {lesson.items.map((item, i) =>
                  placed[i] && item.box === b ? (
                    <MathPic key={i} pic={{ ...item.pic, size: "small" }} decorative />
                  ) : null,
                )}
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </View>
      <View style={styles.items}>
        {lesson.items.map((item, i) =>
          placed[i] ? null : (
            <Pressable
              key={i}
              testID={`sort-item-${i}`}
              accessibilityRole="button"
              accessibilityLabel={picLabel(item.pic)}
              accessibilityState={{ selected: selected === i }}
              onPress={() => {
                haptics.tap();
                setSelected(i);
              }}
              style={[
                styles.item,
                selected === i && { borderColor: color, backgroundColor: colors.successSoft },
              ]}
            >
              <MathPic pic={item.pic} decorative />
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}

export const SortActivity = withAttemptReset(Sort, "SortActivity");

const WRONG_MS = 600;

const styles = StyleSheet.create({
  boxWrap: { flex: 1 },
  boxes: { flexDirection: "row-reverse", gap: 12, width: "100%" },
  box: {
    flex: 1,
    minHeight: 160,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    padding: 10,
    gap: 6,
  },
  boxLabel: { fontSize: 20, fontWeight: "800", color: colors.text },
  inBox: { flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "center", gap: 4 },
  items: { flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "center", gap: 12 },
  item: {
    minWidth: touchTarget * 1.5,
    minHeight: touchTarget * 1.5,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});
