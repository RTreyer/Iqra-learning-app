import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { UiChevron } from "@/components/UiChevron";
import type { Lesson } from "@/content/types";
import type { LessonStatus } from "@/context/ProgressContext";

type Props = { lesson: Lesson; status: LessonStatus; onPress: () => void };

/** One lesson in the unit list: number, title, subtitle, emoji and a tick plus stars once done. */
export function LessonRow({ lesson, status, onPress }: Props) {
  return (
    <Pressable
      testID={`lesson-row-${lesson.id}`}
      accessibilityRole="button"
      accessibilityLabel={lesson.title}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { borderLeftColor: lesson.color }, pressed && styles.pressed]}
    >
      <View style={[styles.numberBadge, { backgroundColor: lesson.color + "22" }]}>
        <Text style={[styles.numberText, { color: lesson.color }]}>{lesson.number}</Text>
      </View>
      <View style={styles.center}>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.subtitle}>{lesson.subtitle}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.emoji}>{lesson.emoji}</Text>
        {status.completed ? (
          <View style={styles.done} testID={`lesson-done-${lesson.id}`}>
            <View style={[styles.tick, { backgroundColor: lesson.color }]}>
              <Text style={styles.tickMark}>✓</Text>
            </View>
            <Text style={styles.stars}>{"⭐".repeat(status.stars)}</Text>
          </View>
        ) : (
          <UiChevron size={22} color="#CBD5E1" />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 20,
    borderLeftWidth: 5,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginHorizontal: 2,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    flexShrink: 0,
  },
  numberText: { fontSize: 17, fontWeight: "800" },
  center: { flex: 1, alignItems: "center", gap: 3, paddingHorizontal: 8 },
  title: { fontSize: 17, fontWeight: "800", color: "#1E293B", textAlign: "center" },
  subtitle: { fontSize: 11, color: "#64748B", textAlign: "center", fontWeight: "500" },
  right: { alignItems: "center", gap: 6, marginRight: 4, flexShrink: 0 },
  emoji: { fontSize: 26 },
  done: { alignItems: "center", gap: 2 },
  tick: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  tickMark: { fontSize: 14, color: "#FFFFFF", fontWeight: "800" },
  stars: { fontSize: 10 },
});
