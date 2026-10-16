import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { starsLabel } from "@/components/StarBadge";
import { UiChevron } from "@/components/UiChevron";
import type { Lesson } from "@/content/types";
import type { LessonStatus } from "@/context/ProgressContext";
import { useLanguage } from "@/context/LanguageContext";
import { colors, shadow, touchTarget, withAlpha } from "@/theme/tokens";

type Props = { lesson: Lesson; status: LessonStatus; onPress: () => void };

/** One lesson in the unit list: number, title, subtitle, emoji and a tick plus stars once done. */
export function LessonRow({ lesson, status, onPress }: Props) {
  const { language } = useLanguage();
  const en = language === "en";
  const label = status.completed
    ? en
      ? `${lesson.title}, completed, ${starsLabel(status.stars, language)}`
      : `${lesson.title}، مكتمل، ${starsLabel(status.stars, language)}`
    : lesson.title;
  return (
    <Pressable
      testID={`lesson-row-${lesson.id}`}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        // The accent border sits on the reading start side: left in English, right in Arabic.
        en
          ? { flexDirection: "row", borderLeftWidth: 5, borderLeftColor: lesson.color }
          : { flexDirection: "row-reverse", borderRightWidth: 5, borderRightColor: lesson.color },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.numberBadge, { backgroundColor: withAlpha(lesson.color, 0.18) }]}>
        <Text style={styles.numberText}>{lesson.number}</Text>
      </View>
      <View style={styles.center}>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.subtitle}>{lesson.subtitle}</Text>
      </View>
      <View style={styles.side}>
        <Text style={styles.emoji}>{lesson.emoji}</Text>
        {status.completed ? (
          <View style={styles.done} testID={`lesson-done-${lesson.id}`}>
            <View style={[styles.tick, { backgroundColor: colors.successText }]}>
              <Text style={styles.tickMark}>✓</Text>
            </View>
            <Text style={styles.stars}>{"⭐".repeat(status.stars)}</Text>
          </View>
        ) : (
          <UiChevron size={22} color={colors.subtle} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: withAlpha(colors.white, 0.92),
    minHeight: touchTarget,
    borderRadius: 20,
    padding: 16,
    gap: 10,
    alignItems: "center",
    ...shadow.card,
    marginHorizontal: 2,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  numberText: { fontSize: 17, fontWeight: "800", color: colors.text },
  center: { flex: 1, alignItems: "center", gap: 3 },
  title: { fontSize: 17, fontWeight: "800", color: colors.text, textAlign: "center" },
  subtitle: { fontSize: 12, color: colors.muted, textAlign: "center", fontWeight: "500" },
  side: { alignItems: "center", gap: 6, flexShrink: 0 },
  emoji: { fontSize: 26 },
  done: { alignItems: "center", gap: 2 },
  tick: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  tickMark: { fontSize: 14, color: colors.white, fontWeight: "800" },
  stars: { fontSize: 10 },
});
