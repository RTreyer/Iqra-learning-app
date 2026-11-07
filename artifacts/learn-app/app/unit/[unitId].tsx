/**
 * Unit screen, as in the design and the story: the lessons as a path to Hudhud's letter (in
 * Arabic) or to the trader's ship (in maths). Each kind of activity has its own picture, done
 * lessons are gold with their stars, the next one glows with Hudhud beside it. A small letter
 * flag marks where each letter's lessons begin. Above the path, the letters of the unit: the
 * ones collected back (all their lessons done) are filled. Nothing here needs reading.
 */

import { router, useLocalSearchParams } from "expo-router";
import { useLine } from "@/components/Gloss";
import React, { useCallback, useMemo, useRef, type ComponentRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { NotFoundCard } from "@/components/NotFoundCard";
import { ScreenBackground } from "@/components/ScreenBackground";
import { EmblemDisc } from "@/components/world/Emblem";
import { lessonPicture } from "@/components/world/lessonPicture";
import { PathMap, type Stop } from "@/components/world/PathMap";
import { StoryGoal } from "@/components/world/StoryGoal";
import { WorldHeader } from "@/components/world/WorldHeader";
import { books, getUnit, unitLessonIds, type Lesson, type Unit } from "@/content";
import { SUBJECT_LINES, pathLine } from "@/content/story";
import { useLanguage } from "@/context/LanguageContext";
import { useProgress, type LessonStatus } from "@/context/ProgressContext";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import * as haptics from "@/lib/haptics";
import { firstParam } from "@/lib/params";
import { routes } from "@/lib/routes";
import { speak } from "@/lib/speech";
import { goalKind, goalState, sectionLetter } from "@/lib/storyProgress";
import { readableFill, touchTarget, yemen } from "@/theme/tokens";

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
  const line = useLine();

  const unit = getUnit(unitId ?? "");
  const summary = useMemo(
    () => (unit ? getUnitProgress(unitLessonIds(unit)) : null),
    [unit, getUnitProgress],
  );

  if (!unit || !summary) return <NotFoundCard message="الوحدة غير موجودة" />;
  const book = books.find((candidate) => candidate.units.includes(unit));
  const subject = book?.subject ?? "arabic";

  const statuses = new Map<string, LessonStatus>(
    unit.lessons.map((lesson) => [lesson.id, getLessonProgress(lesson.id)]),
  );
  const isDone = (lesson: Lesson) => statuses.get(lesson.id)?.completed === true;
  // One state for the letters above the path and the goal at its end, so they always agree.
  const kind = goalKind(unit, subject);
  const goal = kind ? goalState(unit as Unit, kind, isDone) : null;
  const vowels = kind === "vowels";
  const current = unit.lessons.findIndex((lesson) => !isDone(lesson));
  const stops: Stop[] = unit.lessons.map((lesson, i) => {
    const status = statuses.get(lesson.id)!;
    const newSection = lesson.section && lesson.section !== unit.lessons[i - 1]?.section;
    const flag = newSection ? sectionLetter(lesson.section) : null;
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
      // Where a letter's lessons begin: a small flag with the letter on the stop (design).
      badge:
        newSection && flag
          ? { text: flag, label: lesson.section!, testID: `section-${lesson.id}` }
          : undefined,
      // Other sections (exercises, the test) keep a small sign beside the path.
      aside:
        newSection && !flag ? (
          <View style={[styles.section, { borderColor: unit.color }]}>
            <Text
              style={[styles.sectionText, { color: readableFill(unit.color) }]}
              accessibilityRole="header"
            >
              {line(lesson.section!)}
            </Text>
          </View>
        ) : undefined,
      asideTestID: newSection && !flag ? `section-${lesson.id}` : undefined,
    };
  });

  return (
    <ScreenBackground subject={subject} style={[styles.container, { paddingTop: pad.top }]}>
      <WorldHeader
        up={{ fallback: book ? routes.book(book.id) : routes.home(), icon: "map" }}
        picture={<EmblemDisc id={unit.emblem} size={50} />}
        name={unit.theme}
        detail={digits(`${unit.title}، ${summary.done} / ${summary.total}`)}
        color={unit.color}
        stars={progress.totalStars}
      />

      {unit.letters ? (
        <View
          style={[styles.lettersRow, { flexDirection: language === "en" ? "row" : "row-reverse" }]}
        >
          {unit.letters.map((letter, i) => {
            const back = goal?.back[i] ?? false;
            return (
              <Pressable
                key={letter}
                testID={`letter-${letter}`}
                accessibilityRole="button"
                accessibilityLabel={letter}
                accessibilityState={{ checked: back }}
                onPress={() => {
                  haptics.tap();
                  speak(letter);
                }}
                style={({ pressed }) => [
                  styles.letterChip,
                  back
                    ? {
                        backgroundColor: readableFill(unit.color),
                        borderColor: readableFill(unit.color),
                      }
                    : styles.letterMissing,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.letterChipText, back && styles.letterBackText]}>
                  {/* In a vowels unit a letter collected back wears its mark again. */}
                  {back && vowels ? letter + "\u064F" : letter}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

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
          guide={
            progressReady
              ? kind
                ? pathLine(unit.id, kind)
                : (SUBJECT_LINES[subject] ?? SUBJECT_LINES.arabic)
              : undefined
          }
          onGuideY={scrollToGuide}
          pathKey={unit.id}
          goal={
            kind && goal
              ? { done: goal.complete, node: <StoryGoal unit={unit} kind={kind} state={goal} /> }
              : undefined
          }
        />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  lettersRow: {
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  letterChip: {
    minWidth: touchTarget,
    minHeight: touchTarget,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  letterMissing: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CDB79A",
    borderStyle: "dashed",
  },
  letterChipText: { fontSize: 24, fontWeight: "900", color: yemen.lockedInk, lineHeight: 34 },
  letterBackText: { color: "#FFFFFF" },
  pressed: { opacity: 0.85, transform: [{ scale: 0.95 }] },
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
