/**
 * Home: one big play button that opens the next lesson, the subjects as places on the map of
 * Yemen (Hudhud's journey: Mukalla for reading, Mocha for counting, Socotra still to come),
 * today's bowl (Rasha's, filled by the day's lessons), the sticker album and, when due,
 * today's review. Hudhud speaks;
 * nothing here needs reading. Grade, language and sound live in the parents' corner.
 */

import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenBackground } from "@/components/ScreenBackground";
import { StarBadge } from "@/components/StarBadge";
import { UiText } from "@/components/UiText";
import { Guide, Pulse } from "@/components/world/Guide";
import { AlbumArt } from "@/components/world/AlbumArt";
import { Icon } from "@/components/world/Icon";
import { BowlGoal } from "@/components/world/Bowl";
import { Skyline } from "@/components/world/Skyline";
import { StickerArt } from "@/components/world/StickerArt";
import { YemenMap, type MapPin } from "@/components/world/YemenMap";
import { books, unitLessonIds, type Book } from "@/content";
import { SOON_LINE, SUBJECT_DONE, bowlLine, chapterFor } from "@/content/story";
import { useLine } from "@/components/Gloss";
import { useLanguage } from "@/context/LanguageContext";
import { useProgress } from "@/context/ProgressContext";
import { useSettings } from "@/context/SettingsContext";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import { DAILY_GOAL, lessonsToday } from "@/lib/daily";
import * as haptics from "@/lib/haptics";
import { itemsLabel } from "@/lib/labels";
import { nextLesson } from "@/lib/nextLesson";
import { routes } from "@/lib/routes";
import { speak } from "@/lib/speech";
import { STICKERS, stickersEarned } from "@/lib/stickers";
import { readableFill, yemen } from "@/theme/tokens";

const GREETING = "بِسْمِ اللهِ! هَيَّا نَتَعَلَّمُ";
/** Before the story has been told: the play button starts it. */
const STORY_INVITE = "اِضْغَطْ عَلَى الزِّرِّ، وَاسْمَعْ قِصَّتِي!";
/** What Hudhud says about today's bowl. */
export function windowLine(done: number): string {
  return bowlLine(done, DAILY_GOAL);
}

/** The subject on the play button: the first letter or number the child meets there. */
function subjectGlyph(book: Book, digits: (v: string) => string): string {
  return book.subject === "math" ? digits("1") : "أ";
}

export default function HomeScreen() {
  const { t, digits, language, loaded: languageLoaded } = useLanguage();
  const { progress, getDueItemIds, getUnitProgress } = useProgress();
  const { settings, loaded, update } = useSettings();
  const line = useLine();
  const pad = useScreenPadding();
  // The subject the child chose in the story or on an island; Arabic until then.
  const current =
    books.find((book) => book.available && book.id === settings.bookId) ??
    books.find((book) => book.available);
  const next = useMemo(() => nextLesson(progress, books, current?.id), [progress, current?.id]);
  // Every lesson of every subject done: the end of the story is told, once.
  const storyEnds =
    settings.introSeen &&
    !settings.chaptersSeen.includes("end") &&
    books
      .filter((book) => book.available)
      .every((book) =>
        book.units.every((unit) => unit.lessons.every((l) => progress.lessons[l.id]?.completed)),
      );
  const story = !settings.introSeen;
  const today = useMemo(() => lessonsToday(progress), [progress]);
  const dueCount = getDueItemIds().length;
  const earned = stickersEarned(progress.totalStars);
  const islands = useMemo(
    () =>
      books
        .filter((book) => book.available)
        .map((book) => {
          const { done, total } = getUnitProgress(book.units.flatMap(unitLessonIds));
          return { book, share: total ? done / total : 0 };
        }),
    [getUnitProgress],
  );

  const tap = (go: () => void) => () => {
    haptics.tap();
    go();
  };

  return (
    <ScreenBackground style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: pad.top + 10 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.topStart}>
            <StarBadge stars={progress.totalStars} />
            {story ? null : (
              <Pressable
                testID="intro-button"
                accessibilityRole="button"
                accessibilityLabel={t("قصة هدهد")}
                onPress={tap(() => router.push(routes.intro()))}
                style={styles.storyButton}
              >
                <Icon name="book" size={24} color={yemen.clay} />
              </Pressable>
            )}
          </View>
          <Pressable
            testID="parents-button"
            accessibilityRole="button"
            accessibilityLabel={t("ركن الأهل")}
            onPress={tap(() => router.push(routes.parents()))}
            hitSlop={8}
            style={styles.gear}
          >
            <Icon name="gear" size={24} color={yemen.lockedInk} strokeWidth={1.8} />
          </Pressable>
        </View>

        <Guide
          text={
            story
              ? STORY_INVITE
              : next
                ? GREETING
                : // The end of the story in the chosen subject: letters delivered, the ship gone.
                  (SUBJECT_DONE[current?.subject ?? "arabic"] ?? SUBJECT_DONE.arabic)
          }
          layout="stack"
          birdSize={112}
          speakOnMount={loaded && languageLoaded}
        />

        {story || next ? (
          <Pulse style={styles.playWrap}>
            <Pressable
              testID="continue-card"
              accessibilityRole="button"
              accessibilityLabel={
                story || !next
                  ? t("قصة هدهد")
                  : `${t("تَابِعْ:")} ${t(next.unit.title)}: ${next.lesson.title}`
              }
              onPress={tap(() => {
                if (!loaded) return;
                if (storyEnds) router.push(routes.intro("end"));
                else if (story || !next) router.push(routes.intro());
                else router.push(routes.lesson(next.lesson.id));
              })}
              style={({ pressed }) => [styles.play, pressed && styles.pressed]}
            >
              <View style={styles.playIcon}>
                <Icon name="play" size={72} color="#FFFFFF" />
              </View>
            </Pressable>
            {!story && current ? (
              <View
                testID="play-subject"
                style={[styles.playSubject, { backgroundColor: readableFill(current.color) }]}
              >
                <Text style={styles.playSubjectText}>{subjectGlyph(current, digits)}</Text>
              </View>
            ) : null}
          </Pulse>
        ) : null}

        {/* The subjects are places on Hudhud's map; the chosen one is ringed in gold. */}
        <View style={styles.map}>
          <YemenMap
            bird={false}
            pins={[
              ...islands.flatMap(({ book, share }): MapPin[] => {
                const thread = chapterFor(book.subject);
                if (!thread) return [];
                return [
                  {
                    place: thread,
                    testID: `book-${book.id}`,
                    accessibilityLabel: `${t(book.title)}، ${t(book.subtitle)}`,
                    selected: !story && book.id === current?.id,
                    share,
                    caption: (
                      <UiText style={styles.placeCaption} numberOfLines={1}>
                        {book.title}
                      </UiText>
                    ),
                    // Choosing a place makes it the subject the play button continues in.
                    onPress: () => {
                      // Wait for the stored settings: chaptersSeen decides where it goes.
                      if (!loaded) return;
                      update({ bookId: book.id });
                      // The first time the child helps there, Hudhud tells it first.
                      router.push(
                        !settings.chaptersSeen.includes(thread)
                          ? routes.intro(thread)
                          : routes.book(book.id),
                      );
                    },
                  },
                ];
              }),
              // Still being made: tapping it, Hudhud says so.
              {
                place: "socotra",
                testID: "place-socotra",
                accessibilityLabel: line(SOON_LINE),
                onPress: () => speak(SOON_LINE),
              },
            ]}
          />
        </View>

        <View style={[styles.tiles, { flexDirection: language === "en" ? "row" : "row-reverse" }]}>
          <Pressable
            testID="daily-window"
            accessibilityRole="button"
            accessibilityLabel={windowLine(today)}
            onPress={tap(() => speak(windowLine(today)))}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          >
            <BowlGoal filled={today} goal={DAILY_GOAL} width={104} />
          </Pressable>
          <Pressable
            testID="album-button"
            accessibilityRole="button"
            accessibilityLabel={t("ألبوم الملصقات")}
            onPress={tap(() => router.push(routes.album()))}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          >
            {earned > 0 ? (
              <StickerArt id={STICKERS[earned - 1].id} size={62} />
            ) : (
              <AlbumArt size={58} />
            )}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{digits(earned)}</Text>
            </View>
          </Pressable>
          {dueCount > 0 ? (
            <Pressable
              testID="review-card"
              accessibilityRole="button"
              accessibilityLabel={`${t("مُرَاجَعَة الْيَوْم")}: ${itemsLabel(dueCount, language)}`}
              onPress={tap(() => router.push(routes.review()))}
              style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
            >
              <Icon name="mail" size={40} color={yemen.clay} />
              <UiText style={styles.tileCaption}>مُرَاجَعَة الْيَوْم</UiText>
              <UiText style={styles.tileCaption}>{itemsLabel(dueCount, language)}</UiText>
            </Pressable>
          ) : null}
        </View>

        <View style={[styles.skyline, { paddingBottom: pad.bottom }]} pointerEvents="none">
          <Skyline />
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1, alignItems: "center", gap: 14 },
  topBar: {
    width: "100%",
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topStart: { flexDirection: "row", alignItems: "center", gap: 8 },
  storyButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  gear: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  playWrap: { marginTop: -6 },
  play: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: yemen.clay,
    borderWidth: 7,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0 8px 0 ${yemen.clayDeep}`,
  },
  playIcon: { marginLeft: 10 },
  playSubject: {
    position: "absolute",
    top: 0,
    right: -4,
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  playSubjectText: { color: "#FFFFFF", fontSize: 22, fontWeight: "900", lineHeight: 30 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.96 }] },
  map: { width: "100%", height: 280, paddingHorizontal: 16, marginTop: 6 },
  placeCaption: { fontSize: 11, fontWeight: "700", color: "#FFFFFF", lineHeight: 16 },
  tiles: { width: "100%", paddingHorizontal: 16, gap: 14 },
  tile: {
    flex: 1,
    minHeight: 92,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    boxShadow: `0 5px 0 ${yemen.sandShadow}`,
  },
  tileCaption: { fontSize: 12, fontWeight: "700", color: yemen.inkSoft, textAlign: "center" },
  badge: {
    position: "absolute",
    top: 8,
    left: 10,
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 6,
    backgroundColor: yemen.clay,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  skyline: { width: "100%", marginTop: "auto" },
});
