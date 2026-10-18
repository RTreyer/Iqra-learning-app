/**
 * Home screen: guidance (continue, today's review, streak) above grades 1 to 6.
 * A grade with books lists one large card per book; a grade without books shows "قريباً".
 */

import { router } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { BookCard } from "@/components/BookCard";
import { ContinueCard } from "@/components/ContinueCard";
import { GradeSoonCard } from "@/components/GradeSoonCard";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { ReviewCard } from "@/components/ReviewCard";
import { ScreenBackground } from "@/components/ScreenBackground";
import { StarBadge } from "@/components/StarBadge";
import { StreakBadge } from "@/components/StreakBadge";
import { UiText } from "@/components/UiText";
import { grades } from "@/content";
import { useLanguage } from "@/context/LanguageContext";
import { useProgress } from "@/context/ProgressContext";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import { nextLesson } from "@/lib/nextLesson";
import { routes } from "@/lib/routes";
import { currentStreak } from "@/lib/streak";
import { colors } from "@/theme/tokens";

export default function HomeScreen() {
  const { t, language } = useLanguage();
  const row = { flexDirection: language === "en" ? "row" : "row-reverse" } as const;
  const { progress, getDueItemIds } = useProgress();
  const pad = useScreenPadding();
  const next = useMemo(() => nextLesson(progress), [progress]);
  // Recomputed only on progress changes or remount, so a day rollover while open waits for the next change.
  const streak = useMemo(() => currentStreak(progress.activity.days, new Date()), [progress]);
  const dueCount = getDueItemIds().length;

  return (
    <ScreenBackground style={[styles.container, { paddingTop: pad.top + 8 }]}>
      <LanguageSwitch />
      <View style={styles.header}>
        <View style={styles.badges}>
          <StarBadge stars={progress.totalStars} />
          {streak >= 2 && <StreakBadge days={streak} />}
        </View>
        <View style={[styles.userRow, row]}>
          <Text style={styles.userName} numberOfLines={1}>
            {t("أهلاً")}
          </Text>
          <Text style={styles.appTitle}>أَقْرَأُ وَأَتَعَلَّمُ</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.list, { paddingBottom: pad.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {next && (
          <ContinueCard next={next} onPress={() => router.push(routes.lesson(next.lesson.id))} />
        )}
        {dueCount > 0 && (
          <ReviewCard count={dueCount} onPress={() => router.push(routes.review())} />
        )}
        <UiText style={styles.subtitle}>اختَر الكتاب</UiText>
        {grades.map((grade) =>
          grade.books.length === 0 ? (
            <GradeSoonCard key={grade.number} grade={grade} />
          ) : (
            <View key={grade.number} style={styles.grade}>
              <UiText testID={`grade-${grade.number}-title`} style={styles.gradeTitle}>
                {grade.title}
              </UiText>
              {grade.books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onPress={() => {
                    if (book.available) router.push(routes.book(book.id));
                  }}
                />
              ))}
            </View>
          ),
        )}
        <UiText style={styles.footer}>أنت رائع! 🌟</UiText>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, alignItems: "center" },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  badges: { flexDirection: "row", alignItems: "center", gap: 8 },
  userRow: { alignItems: "center", gap: 8 },
  userName: { fontSize: 16, fontWeight: "700", color: colors.text, maxWidth: 80 },
  appTitle: { fontSize: 24, fontWeight: "800", color: colors.text, textAlign: "right" },
  scroll: { width: "100%" },
  list: { gap: 16, paddingTop: 4 },
  grade: { gap: 16 },
  gradeTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.warmDeep,
    textAlign: "right",
  },
  subtitle: {
    fontSize: 16,
    color: colors.warmText,
    textAlign: "center",
    marginTop: 4,
    fontWeight: "700",
  },
  footer: {
    fontSize: 18,
    color: colors.warmDeep,
    marginTop: 4,
    textAlign: "center",
    fontWeight: "700",
  },
});
