/**
 * Unit screen: the unit's lessons in order, with completion ticks and stars.
 */

import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { BackButton } from "@/components/BackButton";
import { LessonRow } from "@/components/LessonRow";
import { NotFoundCard } from "@/components/NotFoundCard";
import { ScreenBackground } from "@/components/ScreenBackground";
import { UiText } from "@/components/UiText";
import { books, getUnit, unitLessonIds } from "@/content";
import { useProgress } from "@/context/ProgressContext";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import { firstParam } from "@/lib/params";
import { routes } from "@/lib/routes";
import { colors, withAlpha } from "@/theme/tokens";

export default function UnitScreen() {
  const unitId = firstParam(useLocalSearchParams<{ unitId?: string | string[] }>().unitId);
  const { getLessonProgress, getUnitProgress } = useProgress();
  const pad = useScreenPadding();

  const unit = getUnit(unitId ?? "");
  const rows = useMemo(
    () => (unit ? unit.lessons.map((lesson) => ({ lesson, status: getLessonProgress(lesson.id) })) : []),
    [unit, getLessonProgress],
  );
  const summary = useMemo(() => (unit ? getUnitProgress(unitLessonIds(unit)) : null), [unit, getUnitProgress]);

  if (!unit || !summary) return <NotFoundCard message="الوحدة غير موجودة" />;

  const book = books.find((candidate) => candidate.units.includes(unit));

  return (
    <ScreenBackground subject={book?.subject} style={[styles.container, { paddingTop: pad.top }]}>
      <View style={styles.header}>
        <BackButton fallback={book ? routes.book(book.id) : routes.home()} />
        <View style={styles.headerCenter}>
          <UiText style={styles.title}>{unit.title}</UiText>
          <View style={[styles.badge, { borderColor: unit.color }]}>
            <Text style={styles.badgeText}>{unit.badgeLabel}</Text>
          </View>
        </View>
        <Text style={styles.headerEmoji}>{unit.emoji}</Text>
      </View>

      <View style={styles.themeRow}>
        <Text style={styles.themeText}>{unit.theme}</Text>
        {unit.letters ? (
          <View style={styles.lettersRow}>
            {unit.letters.map((letter) => (
              <View key={letter} style={[styles.letterChip, { backgroundColor: withAlpha(unit.color, 0.18) }]}>
                <Text style={styles.letterChipText}>{letter}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.progressContainer}>
        <UiText style={styles.progressLabel}>{`${summary.done} / ${summary.total} مكتمل`}</UiText>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${summary.total ? (summary.done / summary.total) * 100 : 0}%`, backgroundColor: unit.color },
            ]}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: pad.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {rows.map(({ lesson, status }) => (
          <LessonRow key={lesson.id} lesson={lesson} status={status} onPress={() => router.push(routes.lesson(lesson.id))} />
        ))}
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
    paddingVertical: 12,
  },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, justifyContent: "center" },
  title: { fontSize: 19, fontWeight: "800", color: colors.text },
  badge: { backgroundColor: colors.pill, borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: "700", color: colors.text },
  headerEmoji: { fontSize: 26 },
  themeRow: { alignItems: "center", paddingHorizontal: 20, marginBottom: 8, gap: 6 },
  themeText: { fontSize: 18, fontWeight: "700", color: colors.text },
  lettersRow: { flexDirection: "row", gap: 8 },
  letterChip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  letterChipText: { fontSize: 20, fontWeight: "900", color: colors.text },
  progressContainer: { paddingHorizontal: 20, marginBottom: 10, gap: 4 },
  progressLabel: { fontSize: 12, color: colors.muted, fontWeight: "600", textAlign: "right" },
  progressTrack: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3, minWidth: 6 },
  list: { paddingHorizontal: 16, paddingTop: 4, gap: 12 },
});
