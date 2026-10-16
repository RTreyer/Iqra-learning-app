/**
 * Generic unit lesson-list screen — works for all units 2–8.
 * Route: /(tabs)/unit/[unitId]
 */

import { router, useLocalSearchParams } from "expo-router";
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
import { getUnitById } from "@/constants/allUnitsLessons";
import { useProgress } from "@/context/ProgressContext";

const ACTIVITY_LABELS: Record<string, string> = {
  story: "قِرَاءَة الْقِصَّة",
  naming: "الْمُفْرَدَات",
  letter_pick: "الْحُرُوف",
  word_read: "قِرَاءَة الْكَلِمَات",
  listen_pick: "الْفَهْم وَالاسْتِيعَاب",
};

export default function UnitIndexScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const insets = useSafeAreaInsets();
  const { getLessonProgress } = useProgress();

  const unit = getUnitById(unitId ?? "");

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  if (!unit) {
    return (
      <ScreenBackground variant="reading" style={styles.centered}>
        <UiText style={{ fontSize: 18, color: "#64748B" }}>الوحدة غير موجودة</UiText>
      </ScreenBackground>
    );
  }

  const doneCount = unit.lessons.filter((l) => getLessonProgress(l.id).completed).length;

  return (
    <ScreenBackground variant="reading" style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerCenter}>
          <UiText style={styles.title}>{unit.title}</UiText>
          <View style={[styles.badge, { backgroundColor: unit.color }]}>
            <Text style={styles.badgeText}>{unit.badgeLabel}</Text>
          </View>
        </View>
        <Text style={styles.headerEmoji}>{unit.emoji}</Text>
      </View>

      {/* Theme & letters */}
      <View style={styles.themeRow}>
        <Text style={[styles.themeText, { color: unit.color }]}>{unit.theme}</Text>
        <View style={styles.lettersRow}>
          {unit.letters.map((l) => (
            <View key={l} style={[styles.letterChip, { backgroundColor: unit.color + "18" }]}>
              <Text style={[styles.letterChipText, { color: unit.color }]}>{l}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <UiText style={styles.progressLabel}>{doneCount} / {unit.lessons.length} مكتمل</UiText>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${(doneCount / unit.lessons.length) * 100}%` as any, backgroundColor: unit.color },
            ]}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {unit.lessons.map((lesson) => {
          const prog = getLessonProgress(lesson.id);
          return (
            <Pressable
              key={lesson.id}
              style={({ pressed }) => [
                styles.card,
                { borderLeftColor: lesson.color, borderLeftWidth: 5 },
                pressed && styles.cardPressed,
              ]}
              onPress={() => router.push(`/(tabs)/unit/${unitId}/${lesson.id}` as any)}
              accessibilityLabel={lesson.title}
            >
              <View style={[styles.numberBadge, { backgroundColor: lesson.color + "22" }]}>
                <Text style={[styles.numberText, { color: lesson.color }]}>{lesson.number}</Text>
              </View>
              <View style={styles.cardCenter}>
                <Text style={styles.cardTitle}>{lesson.title}</Text>
                <View style={[styles.activityTag, { backgroundColor: lesson.color + "18" }]}>
                  <UiText style={[styles.activityLabel, { color: lesson.color }]}>
                    {ACTIVITY_LABELS[lesson.type]}
                  </UiText>
                </View>
                <Text style={styles.cardSubtitle}>{lesson.subtitle}</Text>
              </View>
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
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12,
  },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, justifyContent: "center" },
  title: { fontSize: 19, fontWeight: "800", color: "#1E293B" },
  badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#FFFFFF" },
  headerEmoji: { fontSize: 26 },

  themeRow: { alignItems: "center", paddingHorizontal: 20, marginBottom: 8, gap: 6 },
  themeText: { fontSize: 18, fontWeight: "700" },
  lettersRow: { flexDirection: "row", gap: 8 },
  letterChip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  letterChipText: { fontSize: 20, fontWeight: "900" },

  progressContainer: { paddingHorizontal: 20, marginBottom: 10, gap: 4 },
  progressLabel: { fontSize: 12, color: "#64748B", fontWeight: "600", textAlign: "right" },
  progressTrack: { height: 6, backgroundColor: "#E2E8F0", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3, minWidth: 6 },

  list: { paddingHorizontal: 16, paddingTop: 4, gap: 12 },
  card: {
    backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 20, padding: 16,
    flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3, marginHorizontal: 2,
  },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  numberBadge: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginLeft: 10, flexShrink: 0 },
  numberText: { fontSize: 17, fontWeight: "800" },
  cardCenter: { flex: 1, alignItems: "center", gap: 3, paddingHorizontal: 8 },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "#1E293B", textAlign: "center" },
  activityTag: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  activityLabel: { fontSize: 11, fontWeight: "700" },
  cardSubtitle: { fontSize: 11, color: "#64748B", textAlign: "center", fontWeight: "500" },
  cardRight: { alignItems: "center", gap: 6, marginRight: 4, flexShrink: 0 },
  lessonEmoji: { fontSize: 26 },
  completedBadge: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  checkMark: { fontSize: 14, color: "#FFFFFF", fontWeight: "800" },
  arrowText: { fontSize: 22, color: "#CBD5E1", fontWeight: "300" },
});
