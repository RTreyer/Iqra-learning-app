/**
 * Book screen: one colored card per unit with its progress.
 */

import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { BackButton } from "@/components/BackButton";
import { NotFoundCard } from "@/components/NotFoundCard";
import { ScreenBackground } from "@/components/ScreenBackground";
import { StarBadge } from "@/components/StarBadge";
import { UiText } from "@/components/UiText";
import { UnitCard } from "@/components/UnitCard";
import { getBook, unitLessonIds } from "@/content";
import { useLanguage } from "@/context/LanguageContext";
import { useProgress } from "@/context/ProgressContext";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import { firstParam } from "@/lib/params";
import { routes } from "@/lib/routes";
import { colors, readableFill, shadow } from "@/theme/tokens";

export default function BookScreen() {
  const bookId = firstParam(useLocalSearchParams<{ bookId?: string | string[] }>().bookId);
  const { progress, getUnitProgress } = useProgress();
  const { language } = useLanguage();
  const pad = useScreenPadding();

  const book = getBook(bookId ?? "");
  const units = useMemo(
    () =>
      book
        ? book.units.map((unit) => ({ unit, progress: getUnitProgress(unitLessonIds(unit)) }))
        : [],
    [book, getUnitProgress],
  );

  if (!book) return <NotFoundCard message="الكتاب غير موجود" />;

  return (
    <ScreenBackground
      subject={book.subject}
      style={[styles.container, { paddingTop: pad.top + 4 }]}
    >
      <View style={[styles.header, { flexDirection: language === "en" ? "row" : "row-reverse" }]}>
        <BackButton fallback={routes.home()} />
        <View style={styles.headerCenter}>
          <Text style={styles.bookEmoji}>{book.emoji}</Text>
          <UiText style={styles.bookTitle} numberOfLines={1}>
            {book.title}
          </UiText>
        </View>
        <StarBadge stars={progress.totalStars} />
      </View>

      <View
        style={[
          styles.banner,
          {
            backgroundColor: readableFill(book.color),
            flexDirection: language === "en" ? "row" : "row-reverse",
          },
        ]}
      >
        <Text style={styles.bannerEmoji}>{book.emoji}</Text>
        <View
          style={[styles.bannerText, { alignItems: language === "en" ? "flex-start" : "flex-end" }]}
        >
          <View style={styles.bannerLabel}>
            <UiText style={styles.bannerSubject}>{book.subtitle}</UiText>
          </View>
          <UiText style={styles.bannerTitle}>{book.title}</UiText>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.list, { paddingBottom: pad.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <UiText style={styles.subtitle}>اختَر ماذا تريد أن تتعلّم اليوم</UiText>
        {units.map(({ unit, progress: unitProgress }) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            progress={unitProgress}
            onPress={() => router.push(routes.unit(unit.id))}
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
  bookEmoji: { fontSize: 22 },
  bookTitle: { fontSize: 18, fontWeight: "800", color: colors.text, flexShrink: 1 },
  banner: {
    width: "100%",
    borderRadius: 22,
    padding: 18,
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
    ...shadow.card,
  },
  bannerEmoji: { fontSize: 52 },
  bannerText: { flex: 1, gap: 6 },
  bannerLabel: {
    backgroundColor: colors.pill,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bannerSubject: { fontSize: 13, color: colors.text, fontWeight: "700" },
  bannerTitle: { fontSize: 22, fontWeight: "900", color: colors.white, lineHeight: 28 },
  scroll: { width: "100%" },
  list: { gap: 14, paddingTop: 4 },
  subtitle: {
    fontSize: 15,
    color: colors.warmText,
    textAlign: "center",
    marginBottom: 2,
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
