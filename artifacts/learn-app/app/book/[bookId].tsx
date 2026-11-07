/**
 * Book screen: the units as stations on a path. The station to go to next breathes and Hudhud
 * stands on it; a ring shows how much of each unit is done.
 */

import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, type ComponentRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { NotFoundCard } from "@/components/NotFoundCard";
import { UiText } from "@/components/UiText";
import { ScreenBackground } from "@/components/ScreenBackground";
import { PathMap, type Stop } from "@/components/world/PathMap";
import { WorldHeader } from "@/components/world/WorldHeader";
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
  const { progress, hydrated, loadSettled, getUnitProgress } = useProgress();
  const progressReady = hydrated || loadSettled;
  const { t, digits } = useLanguage();
  const pad = useScreenPadding();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  // Open the path where Hudhud stands, with some of the way behind him in view.
  const scrollToGuide = useCallback(
    (y: number) => scroll.current?.scrollTo({ y: Math.max(0, y - 220), animated: false }),
    [],
  );

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
      <WorldHeader
        up={{ fallback: routes.home(), icon: "home" }}
        picture={<Text style={styles.bookEmoji}>{book.emoji}</Text>}
        name={t(book.title)}
        detail={t(book.subtitle)}
        color={book.color}
        stars={progress.totalStars}
      />
      <ScrollView
        ref={scroll}
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: 56, paddingBottom: pad.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <PathMap
          stops={stops}
          color={book.color}
          onPress={(unitId) => router.push(routes.unit(unitId))}
          // Hudhud appears once the stored progress is known, so he flies to the right stop.
          guide={progressReady ? (SUBJECT_LINES[book.subject] ?? SUBJECT_LINES.arabic) : undefined}
          onGuideY={scrollToGuide}
          pathKey={book.id}
        />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bookEmoji: { fontSize: 34, color: "#FFFFFF" },
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
