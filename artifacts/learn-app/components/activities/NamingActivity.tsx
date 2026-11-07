import React, { useCallback, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Pressable } from "@/components/demo/DemoPressable";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { colors, readableFill, withAlpha } from "@/theme/tokens";
import { DoneButton } from "./shared/DoneButton";
import { act } from "./shared/styles";
import { useOnce } from "./shared/useOnce";
import { useBounce } from "./shared/useQuiz";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";
import { ProgressDots } from "./shared/ProgressDots";

function Naming({ lesson, color, onComplete }: ActivityProps<"naming">) {
  const { items } = lesson;
  const [tapped, setTapped] = useState<ReadonlySet<number>>(() => new Set());
  const { values, bounce } = useBounce(items.length);

  const handleTap = useCallback(
    (i: number) => {
      speak(items[i].word);
      haptics.tap();
      setTapped((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
      bounce(i, 1.25);
    },
    [items, bounce],
  );

  const remaining = items.length - tapped.size;
  const finish = useOnce(useCallback(() => onComplete({ correct: 0, total: 0 }), [onComplete]));

  return (
    <View style={act.container}>
      {/* Each word heard fills a wagon; Hudhud says what to do. */}
      <ProgressDots count={items.length} current={tapped.size} color={color} />
      <View style={styles.grid}>
        {items.map((item, i) => {
          const done = tapped.has(i);
          return (
            <Animated.View key={i} style={{ transform: [{ scale: values[i] }] }}>
              <Pressable
                testID={`naming-item-${i}`}
                accessibilityRole="button"
                accessibilityLabel={item.word}
                accessibilityState={{ selected: done }}
                style={[
                  styles.card,
                  done && {
                    borderColor: color,
                    borderWidth: 3,
                    backgroundColor: withAlpha(color, 0.09),
                  },
                ]}
                onPress={() => handleTap(i)}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={[styles.word, done && { color: readableFill(color) }]}>
                  {item.word}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
      {remaining <= 0 ? (
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

export const NamingActivity = withAttemptReset(Naming, "NamingActivity");

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    width: "100%",
  },
  card: {
    width: 100,
    height: 100,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.border,
    gap: 4,
  },
  emoji: { fontSize: 34 },
  word: { fontSize: 15, fontWeight: "700", color: colors.text, textAlign: "center" },
});
