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
import { EmblemDisc } from "@/components/world/Emblem";
import { PathMap, type Stop } from "@/components/world/PathMap";
import { WorldHeader } from "@/components/world/WorldHeader";
import { getBook, unitLessonIds } from "@/content";
import { SUBJECT_DONE, SUBJECT_LINES, chapterFor, stationScenes } from "@/content/story";
import type { Lesson } from "@/content/types";
import { useSettings } from "@/context/SettingsContext";
import { learntLetters, voyageStage } from "@/lib/storyProgress";
import { BowlMessage } from "@/components/world/Bowl";
import { VoyageGoal } from "@/components/world/Voyage";
import { useLanguage } from "@/context/LanguageContext";
import { useProgress } from "@/context/ProgressContext";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import { firstParam } from "@/lib/params";
import { routes } from "@/lib/routes";
import { yemen } from "@/theme/tokens";

export default function BookScreen() {
  const bookId = firstParam(useLocalSearchParams<{ bookId?: string | string[] }>().bookId);
  const { progress, hydrated, loadSettled, getUnitProgress, getLessonProgress } = useProgress();
  const { settings } = useSettings();
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
  const isDone = (lesson: Lesson) => getLessonProgress(lesson.id).completed;
  // At the end of the way, the heart of each thread: Rasha's bowl, whose note lights up with
  // every letter learnt, or the coffee trader's ship, loaded with every maths unit.
  const thread = chapterFor(book.subject);
  const goal =
    thread === "arabic"
      ? {
          done: units.every(({ progress: p }) => p.done >= p.total),
          node: <BowlMessage learnt={learntLetters(book.units, isDone)} />,
        }
      : thread === "math"
        ? (() => {
            const stage = voyageStage(book.units, isDone);
            return {
              done: stage >= 5,
              node: (
                <VoyageGoal
                  stage={stage}
                  line={stage >= 5 ? SUBJECT_DONE.math : SUBJECT_LINES.math}
                />
              ),
            };
          })()
        : undefined;
  const stops: Stop[] = units.map(({ unit, progress: p }, i) => ({
    key: unit.id,
    testID: `unit-${unit.id}`,
    accessibilityLabel: `${t(unit.title)}، ${digits(`${p.done} / ${p.total}`)}`,
    state: p.total > 0 && p.done >= p.total ? "done" : i === currentIndex ? "current" : "open",
    ring: p.total ? p.done / p.total : 0,
    caption: digits(`${p.done} / ${p.total}`),
    // The unit's own drawing on a paper disc, so it reads on gold, the subject colour or sand.
    picture: (_color, size) => <EmblemDisc id={unit.emblem} size={Math.round(size * 1.7)} />,
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
        picture={<EmblemDisc id={book.emblem} size={50} />}
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
          // The first time a unit opens, Hudhud tells its station on his journey.
          onPress={(unitId) =>
            router.push(
              stationScenes(unitId) && !settings.chaptersSeen.includes(unitId)
                ? routes.intro(unitId)
                : routes.unit(unitId),
            )
          }
          // Hudhud appears once the stored progress is known, so he flies to the right stop.
          guide={progressReady ? (SUBJECT_LINES[book.subject] ?? SUBJECT_LINES.arabic) : undefined}
          onGuideY={scrollToGuide}
          pathKey={book.id}
          goal={goal}
        />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
