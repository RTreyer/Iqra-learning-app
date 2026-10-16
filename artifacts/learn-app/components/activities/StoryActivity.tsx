import React, { useCallback, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { UiText } from "@/components/UiText";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { colors, touchTarget } from "@/theme/tokens";
import { DoneButton } from "./shared/DoneButton";
import { act } from "./shared/styles";
import { useOnce } from "./shared/useOnce";
import { useBounce } from "./shared/useQuiz";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";

function Story({ lesson, color, onComplete }: ActivityProps<"story">) {
  const { lines } = lesson;
  const [heard, setHeard] = useState<ReadonlySet<number>>(() => new Set());
  const { values, bounce } = useBounce(lines.length);

  const handleLine = useCallback(
    (i: number) => {
      speak(lines[i].text);
      haptics.tap();
      setHeard((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
      bounce(i, 1.04);
    },
    [lines, bounce],
  );

  const remaining = lines.length - heard.size;
  const finish = useOnce(useCallback(() => onComplete({ correct: 0, total: 0 }), [onComplete]));

  return (
    <View style={act.container}>
      <Text style={styles.title}>{lesson.storyTitle}</Text>
      <UiText style={act.instruction}>اضغط على كل جملة لتسمعها 🔊</UiText>
      <View style={act.fullWidth}>
        {lines.map((line, i) => {
          const done = heard.has(i);
          return (
            <Animated.View key={i} style={{ transform: [{ scale: values[i] }] }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={line.text}
                accessibilityState={{ selected: done }}
                style={[styles.line, done && { borderColor: color, borderWidth: 2, backgroundColor: color + "12" }]}
                onPress={() => handleLine(i)}
              >
                <Text style={styles.emoji}>{line.emoji}</Text>
                <Text style={styles.text}>{line.text}</Text>
                {done ? <Text style={styles.check}>✓</Text> : null}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
      {remaining <= 0 ? (
        <DoneButton testID="activity-done" label="أَحْسَنْت! 🌟 تابع" color={color} onPress={finish.fire} disabled={finish.done} />
      ) : (
        <UiText style={act.hint}>{`${remaining} جملة متبقية`}</UiText>
      )}
    </View>
  );
}

export const StoryActivity = withAttemptReset(Story, "StoryActivity");

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "900", color: colors.text, textAlign: "center", marginBottom: 4 },
  line: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    minHeight: touchTarget,
  },
  emoji: { fontSize: 22, flexShrink: 0 },
  text: { flex: 1, fontSize: 18, fontWeight: "700", color: colors.text, textAlign: "right" },
  check: { fontSize: 16, color: colors.successText },
});
