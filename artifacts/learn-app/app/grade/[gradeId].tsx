/**
 * Grade screen: one large card per book (subject) of the grade.
 */

import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { BackButton } from "@/components/BackButton";
import { BookCard } from "@/components/BookCard";
import { NotFoundCard } from "@/components/NotFoundCard";
import { ScreenBackground } from "@/components/ScreenBackground";
import { StarBadge } from "@/components/StarBadge";
import { UiText } from "@/components/UiText";
import { getGrade } from "@/content";
import { useLanguage } from "@/context/LanguageContext";
import { useProgress } from "@/context/ProgressContext";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import { firstParam } from "@/lib/params";
import { routes } from "@/lib/routes";
import { colors } from "@/theme/tokens";

export default function GradeScreen() {
  const gradeId = firstParam(useLocalSearchParams<{ gradeId?: string | string[] }>().gradeId);
  const { progress } = useProgress();
  const { language } = useLanguage();
  const pad = useScreenPadding();

  const grade = getGrade(Number(gradeId));
  if (!grade || grade.books.length === 0) return <NotFoundCard message="الصف غير موجود" />;

  return (
    <ScreenBackground style={[styles.container, { paddingTop: pad.top + 4 }]}>
      <View style={[styles.header, { flexDirection: language === "en" ? "row" : "row-reverse" }]}>
        <BackButton fallback={routes.home()} />
        <View style={styles.headerCenter}>
          <Text style={styles.emoji}>{grade.emoji}</Text>
          <UiText testID="grade-title" style={styles.title} numberOfLines={1}>
            {grade.title}
          </UiText>
        </View>
        <StarBadge stars={progress.totalStars} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.list, { paddingBottom: pad.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <UiText style={styles.subtitle}>اختَر الكتاب</UiText>
        {grade.books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onPress={() => {
              if (book.available) router.push(routes.book(book.id));
            }}
          />
        ))}
        <UiText style={styles.footer}>هيّا نتعلّم! 🌟</UiText>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, alignItems: "center" },
  header: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  emoji: { fontSize: 24 },
  title: { fontSize: 22, fontWeight: "900", color: colors.text, flexShrink: 1 },
  scroll: { width: "100%" },
  list: { gap: 16, paddingTop: 4 },
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
