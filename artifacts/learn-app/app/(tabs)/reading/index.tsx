/**
 * Reading module index — lessons grouped by book unit.
 * Filters by ?bookId= query param to show Part 1 or Part 2 lessons.
 */

import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "@/components/BackButton";
import { UiText } from "@/components/UiText";
import { UiChevron } from "@/components/UiChevron";
import { ScreenBackground } from "@/components/ScreenBackground";
import { readingLessons } from "@/constants/lessons";
import { part2ReadingLessons } from "@/constants/lessons-part2";
import { useProgress } from "@/context/ProgressContext";

// ── Unit display config ────────────────────────────────────────────────────────

const UNIT_META_P1: Record<string, { color: string; bg: string; emoji: string }> = {
  "الوحدة الثانية":  { color: "#2563EB", bg: "#DBEAFE", emoji: "🌱" },
  "الوحدة الثالثة": { color: "#059669", bg: "#D1FAE5", emoji: "🌿" },
  "الوحدة الرابعة":  { color: "#7C3AED", bg: "#EDE9FE", emoji: "🌸" },
  "الوحدة الخامسة": { color: "#D97706", bg: "#FEF3C7", emoji: "🌟" },
  "الوحدة السادسة": { color: "#DB2777", bg: "#FCE7F3", emoji: "🌺" },
  "الوحدة السابعة": { color: "#0891B2", bg: "#E0F2FE", emoji: "🌊" },
  "الوحدة الثامنة": { color: "#EA580C", bg: "#FFEDD5", emoji: "🍂" },
  "مراجعة":          { color: "#475569", bg: "#F1F5F9", emoji: "📝" },
};

const UNIT_META_P2: Record<string, { color: string; bg: string; emoji: string }> = {
  "الوحدة الأولى":   { color: "#059669", bg: "#D1FAE5", emoji: "🔄" },
  "الوحدة الثانية":  { color: "#2563EB", bg: "#DBEAFE", emoji: "🔤" },
  "الوحدة الثالثة": { color: "#7C3AED", bg: "#EDE9FE", emoji: "✦" },
  "الوحدة الرابعة":  { color: "#D97706", bg: "#FEF3C7", emoji: "ّ" },
  "الوحدة الخامسة": { color: "#DB2777", bg: "#FCE7F3", emoji: "ة" },
  "الوحدة السادسة": { color: "#0891B2", bg: "#E0F2FE", emoji: "ى" },
  "الوحدة السابعة": { color: "#EA580C", bg: "#FFEDD5", emoji: "📖" },
};

export default function ReadingIndexScreen() {
  const insets = useSafeAreaInsets();
  const { getLessonProgress } = useProgress();
  const { bookId } = useLocalSearchParams<{ bookId?: string }>();

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  const isPart2 = bookId === "arabic-1-part2";
  const lessons = isPart2 ? part2ReadingLessons : readingLessons;
  const unitMeta = isPart2 ? UNIT_META_P2 : UNIT_META_P1;
  const bookLabel = isPart2 ? "الجُزْء الثَّانِي" : "الجُزْء الأَوَّل";

  // Group lessons by unit preserving order
  const units: string[] = [];
  const byUnit: Record<string, typeof lessons> = {};
  for (const lesson of lessons) {
    if (!byUnit[lesson.unit]) {
      byUnit[lesson.unit] = [];
      units.push(lesson.unit);
    }
    byUnit[lesson.unit].push(lesson);
  }

  return (
    <ScreenBackground variant="reading" style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerCenter}>
          <UiText style={styles.title}>قِرَاءَة</UiText>
          <View style={[styles.partBadge, { backgroundColor: isPart2 ? "#059669" : "#2563EB" }]}>
            <UiText style={styles.partBadgeText}>{bookLabel}</UiText>
          </View>
        </View>
        <Feather name="book-open" size={26} color={isPart2 ? "#059669" : "#2563EB"} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {units.map((unitKey) => {
          const meta = unitMeta[unitKey] ?? { color: "#64748B", bg: "#F1F5F9", emoji: "📖" };
          const unitLessons = byUnit[unitKey];
          const doneCount = unitLessons.filter((l) => getLessonProgress(l.id).completed).length;

          return (
            <View key={unitKey} style={styles.unitSection}>
              {/* Unit header */}
              <View style={[styles.unitHeader, { backgroundColor: meta.bg, borderColor: meta.color + "44" }]}>
                <Text style={styles.unitEmoji}>{meta.emoji}</Text>
                <View style={styles.unitHeaderText}>
                  <UiText style={[styles.unitLabel, { color: meta.color }]}>{unitKey}</UiText>
                  <UiText style={styles.unitProgress}>{doneCount} / {unitLessons.length} مكتمل</UiText>
                </View>
                <View style={styles.unitProgressBar}>
                  <View
                    style={[
                      styles.unitProgressFill,
                      {
                        backgroundColor: meta.color,
                        width: `${(doneCount / unitLessons.length) * 100}%` as any,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Lesson cards */}
              {unitLessons.map((lesson, _index) => {
                const prog = getLessonProgress(lesson.id);
                const globalIndex = lessons.findIndex((l) => l.id === lesson.id);

                return (
                  <Pressable
                    key={lesson.id}
                    style={({ pressed }) => [
                      styles.card,
                      { borderLeftColor: meta.color, borderLeftWidth: 4 },
                      pressed && styles.cardPressed,
                    ]}
                    onPress={() => router.push(`/(tabs)/reading/${lesson.id}`)}
                  >
                    <View style={[styles.numberBadge, { backgroundColor: meta.bg }]}>
                      <Text style={[styles.numberText, { color: meta.color }]}>{globalIndex + 1}</Text>
                    </View>

                    <View style={styles.cardCenter}>
                      <Text style={[styles.bigLetter, { color: meta.color }]}>{lesson.letter}</Text>
                      <Text style={styles.cardTitle}>{lesson.title}</Text>
                      {lesson.vocabulary.length > 0 && (
                        <Text style={styles.cardVocab}>
                          {lesson.vocabulary.map((v) => v.emoji).join("  ")}
                        </Text>
                      )}
                    </View>

                    <View style={styles.cardRight}>
                      <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
                      {prog.completed ? (
                        <View style={[styles.completedBadge, { backgroundColor: meta.color }]}>
                          <Feather name="check" size={14} color="#FFFFFF" />
                        </View>
                      ) : (
                        <UiChevron size={22} color="#CBD5E1" />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
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
  backBtn: { padding: 4 },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800", color: "#1E293B" },
  partBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  partBadgeText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },
  list: { paddingHorizontal: 16, paddingTop: 4, gap: 6 },

  unitSection: { marginBottom: 14, gap: 6 },
  unitHeader: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    position: "relative",
    overflow: "hidden",
  },
  unitEmoji: { fontSize: 26 },
  unitHeaderText: { flex: 1 },
  unitLabel: { fontSize: 17, fontWeight: "800" },
  unitProgress: { fontSize: 12, color: "#64748B", fontWeight: "500", marginTop: 1 },
  unitProgressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  unitProgressFill: { height: 3, borderRadius: 2, minWidth: 4 },

  card: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 3,
    marginHorizontal: 2,
  },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  numberText: { fontSize: 16, fontWeight: "700" },
  cardCenter: { flex: 1, alignItems: "center", gap: 2 },
  bigLetter: { fontSize: 36, fontWeight: "800", lineHeight: 44 },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#475569", textAlign: "center" },
  cardVocab: { fontSize: 16, marginTop: 2 },
  cardRight: { alignItems: "center", gap: 6, marginRight: 4 },
  lessonEmoji: { fontSize: 24 },
  completedBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
});
