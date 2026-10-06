/**
 * الوحدة الأولى — lesson list screen.
 * Shows 5 pre-reading activity cards (naming, listen/pick, behavior, matching, drawing).
 */

import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "@/components/BackButton";
import { UiText } from "@/components/UiText";
import { ScreenBackground } from "@/components/ScreenBackground";
import { unit1Lessons } from "@/constants/unit1Lessons";
import { useProgress } from "@/context/ProgressContext";

const ACTIVITY_LABELS: Record<string, string> = {
  naming: "تَسْمِيَة الصُّوَر",
  listen_pick: "اسْتِمَاع وَاخْتِيَار",
  behavior: "السُّلُوك",
  matching: "مُطَابَقَة",
  drawing: "رَسْم الْخُطُوط",
};

export default function Unit1IndexScreen() {
  const insets = useSafeAreaInsets();
  const { getLessonProgress } = useProgress();

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  const doneCount = unit1Lessons.filter((l) => getLessonProgress(l.id).completed).length;

  return (
    <ScreenBackground variant="reading" style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerCenter}>
          <UiText style={styles.title}>الْوَحْدَةُ الأُولَى</UiText>
          <View style={styles.badge}>
            <UiText style={styles.badgeText}>تَمْهِيدِيَّة</UiText>
          </View>
        </View>
        <Text style={styles.headerEmoji}>🌱</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <UiText style={styles.progressLabel}>{doneCount} / {unit1Lessons.length} مكتمل</UiText>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${(doneCount / unit1Lessons.length) * 100}%` as any },
            ]}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {unit1Lessons.map((lesson) => {
          const prog = getLessonProgress(lesson.id);

          return (
            <Pressable
              key={lesson.id}
              style={({ pressed }) => [
                styles.card,
                { borderLeftColor: lesson.color, borderLeftWidth: 5 },
                pressed && styles.cardPressed,
              ]}
              onPress={() => router.push(`/(tabs)/unit1/${lesson.id}` as any)}
              accessibilityLabel={lesson.title}
            >
              {/* Number badge */}
              <View style={[styles.numberBadge, { backgroundColor: lesson.color + "22" }]}>
                <Text style={[styles.numberText, { color: lesson.color }]}>{lesson.number}</Text>
              </View>

              {/* Center */}
              <View style={styles.cardCenter}>
                <Text style={styles.cardTitle}>{lesson.title}</Text>
                <View style={[styles.activityTag, { backgroundColor: lesson.color + "18" }]}>
                  <UiText style={[styles.activityLabel, { color: lesson.color }]}>
                    {ACTIVITY_LABELS[lesson.type]}
                  </UiText>
                </View>
                <Text style={styles.cardSubtitle}>{lesson.subtitle}</Text>
              </View>

              {/* Right */}
              <View style={styles.cardRight}>
                <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
                {prog.completed ? (
                  <View style={[styles.completedBadge, { backgroundColor: lesson.color }]}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                ) : (
                  <UiText style={styles.arrowText}>‹</UiText>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
  title: { fontSize: 22, fontWeight: "800", color: "#1E293B" },
  badge: {
    backgroundColor: "#059669",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#FFFFFF" },
  headerEmoji: { fontSize: 26 },

  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 6,
  },
  progressLabel: { fontSize: 13, color: "#64748B", fontWeight: "600", textAlign: "right" },
  progressTrack: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    backgroundColor: "#059669",
    borderRadius: 3,
    minWidth: 6,
  },

  list: { paddingHorizontal: 16, paddingTop: 4, gap: 12 },

  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 20,
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
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  numberBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    flexShrink: 0,
  },
  numberText: { fontSize: 18, fontWeight: "800" },
  cardCenter: { flex: 1, alignItems: "center", gap: 4, paddingHorizontal: 8 },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B", textAlign: "center" },
  activityTag: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  activityLabel: { fontSize: 11, fontWeight: "700" },
  cardSubtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "500",
  },
  cardRight: { alignItems: "center", gap: 6, marginRight: 4, flexShrink: 0 },
  lessonEmoji: { fontSize: 28 },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: { fontSize: 16, color: "#FFFFFF", fontWeight: "800" },
  arrowText: { fontSize: 24, color: "#CBD5E1", fontWeight: "300" },
});
