/**
 * Book screen: the units as stations on a path. The station to go to next breathes and Hudhud
 * stands on it; a ring shows how much of each unit is done.
 */

import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { BackButton } from "@/components/BackButton";
import { NotFoundCard } from "@/components/NotFoundCard";
import { ScreenBackground } from "@/components/ScreenBackground";
import { StarBadge } from "@/components/StarBadge";
import { UiText } from "@/components/UiText";
import { Guide } from "@/components/world/Guide";
import { PathMap, type Stop } from "@/components/world/PathMap";
import { getBook, unitLessonIds } from "@/content";
import { SUBJECT_LINES } from "@/content/story";
import { useLanguage } from "@/context/LanguageContext";
import { useProgress } from "@/context/ProgressContext";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import { firstParam } from "@/lib/params";
import { routes } from "@/lib/routes";
import { yemen } from "@/theme/tokens";

export default function BookScreen() {
  const bookId = firstParam(useLocalSearchParams<{ bookId?: string | string[] }>().bookId);
  const { progress, getUnitProgress } = useProgress();
  const { t, language, digits } = useLanguage();
  const pad = useScreenPadding();

  const book = getBook(bookId ?? "");
  if (!book) return <NotFoundCard message="الكتاب غير موجود" />;

  const units = book.units.map((unit) => ({
    unit,
    progress: getUnitProgress(unitLessonIds(unit)),
  }));
  const currentIndex = units.findIndex(({ progress: p }) => p.done < p.total);
  const stops: Stop[] = units.map(({ unit, progress: p }, i) => ({
    key: unit.id,
    testID: `unit-${unit.id}`,
    accessibilityLabel: `${t(unit.title)}، ${digits(`${p.done} / ${p.total}`)}`,
    state: p.total > 0 && p.done >= p.total ? "done" : i === currentIndex ? "current" : "open",
    ring: p.total ? p.done / p.total : 0,
    caption: digits(`${p.done} / ${p.total}`),
    picture: (_color, size) => <Text style={{ fontSize: size }}>{unit.emoji}</Text>,
    aside: unit.letters ? (
      <View style={styles.letters}>
        {unit.letters.map((letter) => (
          <View key={letter} style={styles.letter}>
            <Text style={styles.letterText}>{letter}</Text>
          </View>
        ))}
      </View>
    ) : (
      <View style={styles.label}>
        <UiText style={styles.labelText}>{unit.badgeLabel}</UiText>
      </View>
    ),
  }));

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
      <Guide
        text={SUBJECT_LINES[book.subject] ?? SUBJECT_LINES.arabic}
        speakOnMount
        birdSize={64}
        style={styles.guide}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: 56, paddingBottom: pad.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <PathMap
          stops={stops}
          color={book.color}
          onPress={(unitId) => router.push(routes.unit(unitId))}
        />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 6,
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
  bookTitle: { fontSize: 18, fontWeight: "800", color: yemen.ink, flexShrink: 1 },
  guide: { paddingHorizontal: 16 },
  scroll: { flex: 1, width: "100%" },
  letters: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 4, justifyContent: "center" },
  letter: {
    minWidth: 30,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  letterText: { fontSize: 20, fontWeight: "800", color: yemen.ink },
  label: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  labelText: { fontSize: 14, fontWeight: "700", color: yemen.ink },
});
