/**
 * Unit screen: the lessons as a path. Each kind of activity has its own picture, done lessons
 * are gold with their stars, the next lesson breathes with Hudhud on it. Later lessons look
 * quieter but stay open. Hudhud says the unit's theme; the letters of the unit say themselves.
 */

import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useRef, type ComponentRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BackButton } from "@/components/BackButton";
import { NotFoundCard } from "@/components/NotFoundCard";
import { ScreenBackground } from "@/components/ScreenBackground";
import { StarBadge } from "@/components/StarBadge";
import { UiText } from "@/components/UiText";
import { LetterGoal } from "@/components/world/LetterGoal";
import { lessonPicture } from "@/components/world/lessonPicture";
import { LETTER_LINES } from "@/content/story";
import { PathMap, type Stop } from "@/components/world/PathMap";
import { books, getUnit, unitLessonIds } from "@/content";
import { useLanguage } from "@/context/LanguageContext";
import { useProgress } from "@/context/ProgressContext";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import * as haptics from "@/lib/haptics";
import { firstParam } from "@/lib/params";
import { routes } from "@/lib/routes";
import { speak } from "@/lib/speech";
import { readableFill, touchTarget, yemen } from "@/theme/tokens";

/** What Hudhud's letter says in a unit without letters of its own: numbers in maths. */
const LETTER_NUMBERS = ["١", "٢", "٣", "٤", "٥"];
const LETTER_FIRST = ["أ", "ب", "ت", "ث", "ج"];

export default function UnitScreen() {
  const unitId = firstParam(useLocalSearchParams<{ unitId?: string | string[] }>().unitId);
  const { progress, hydrated, loadSettled, getLessonProgress, getUnitProgress } = useProgress();
  const progressReady = hydrated || loadSettled;
  const pad = useScreenPadding();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  // Open the path where Hudhud stands, with some of the way behind him in view.
  const scrollToGuide = useCallback(
    (y: number) => scroll.current?.scrollTo({ y: Math.max(0, y - 220), animated: false }),
    [],
  );
  const { language, digits } = useLanguage();

  const unit = getUnit(unitId ?? "");
  const summary = useMemo(
    () => (unit ? getUnitProgress(unitLessonIds(unit)) : null),
    [unit, getUnitProgress],
  );

  if (!unit || !summary) return <NotFoundCard message="الوحدة غير موجودة" />;
  const book = books.find((candidate) => candidate.units.includes(unit));

  const statuses = unit.lessons.map((lesson) => getLessonProgress(lesson.id));
  const current = statuses.findIndex((status) => !status.completed);
  const stops: Stop[] = unit.lessons.map((lesson, i) => {
    const status = statuses[i];
    const newSection = lesson.section && lesson.section !== unit.lessons[i - 1]?.section;
    return {
      key: lesson.id,
      testID: `lesson-row-${lesson.id}`,
      accessibilityLabel: status.completed
        ? `${lesson.title}، ${digits(status.stars)} ⭐`
        : lesson.title,
      state: status.completed ? "done" : i === current ? "current" : "open",
      stars: status.stars,
      doneTestID: `lesson-done-${lesson.id}`,
      picture: (color, size) => lessonPicture(lesson.type, color, size),
      aside: newSection ? (
        <View style={[styles.section, { borderColor: unit.color }]}>
          <Text
            style={[styles.sectionText, { color: readableFill(unit.color) }]}
            accessibilityRole="header"
          >
            {lesson.section}
          </Text>
        </View>
      ) : undefined,
      asideTestID: newSection ? `section-${lesson.id}` : undefined,
    };
  });

  return (
    <ScreenBackground subject={book?.subject} style={[styles.container, { paddingTop: pad.top }]}>
      <View style={[styles.header, { flexDirection: language === "en" ? "row" : "row-reverse" }]}>
        <BackButton fallback={book ? routes.book(book.id) : routes.home()} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>{unit.emoji}</Text>
          <UiText style={styles.title} numberOfLines={1}>
            {unit.title}
          </UiText>
        </View>
        <StarBadge stars={progress.totalStars} />
      </View>

      {unit.letters ? (
        <View style={styles.lettersRow}>
          {unit.letters.map((letter) => (
            <Pressable
              key={letter}
              accessibilityRole="button"
              accessibilityLabel={letter}
              onPress={() => {
                haptics.tap();
                speak(letter);
              }}
              style={({ pressed }) => [
                styles.letterChip,
                { borderColor: unit.color },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.letterChipText}>{letter}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <UiText style={styles.progressLabel}>{`${summary.done} / ${summary.total} مكتمل`}</UiText>

      <ScrollView
        ref={scroll}
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: 56, paddingBottom: pad.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <PathMap
          stops={stops}
          color={unit.color}
          onPress={(lessonId) => router.push(routes.lesson(lessonId))}
          // Hudhud appears once the stored progress is known, so he flies to the right stop.
          guide={progressReady ? unit.theme : undefined}
          onGuideY={scrollToGuide}
          pathKey={unit.id}
          goal={{
            done: summary.done >= summary.total,
            node: (
              <LetterGoal
                symbols={unit.letters ?? (book?.subject === "math" ? LETTER_NUMBERS : LETTER_FIRST)}
                share={summary.total ? summary.done / summary.total : 0}
                line={summary.done >= summary.total ? LETTER_LINES.complete : LETTER_LINES.missing}
              />
            ),
          }}
        />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "800", color: yemen.ink, flexShrink: 1 },
  headerEmoji: { fontSize: 26 },
  lettersRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 12,
  },
  letterChip: {
    minWidth: touchTarget,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  letterChipText: { fontSize: 24, fontWeight: "900", color: yemen.ink },
  pressed: { opacity: 0.85, transform: [{ scale: 0.95 }] },
  progressLabel: {
    fontSize: 12,
    color: yemen.inkSoft,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 6,
  },
  scroll: { flex: 1 },
  section: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sectionText: { fontSize: 16, fontWeight: "900", writingDirection: "rtl", textAlign: "center" },
});
