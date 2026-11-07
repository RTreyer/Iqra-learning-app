/**
 * Home: one big play button that opens the next lesson, the subjects as picture islands,
 * today's qamariya window, the sticker album and, when due, today's review. Hudhud speaks;
 * nothing here needs reading. Grade, language and sound live in the parents' corner.
 */

import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenBackground } from "@/components/ScreenBackground";
import { StarBadge } from "@/components/StarBadge";
import { UiText } from "@/components/UiText";
import { EmblemDisc } from "@/components/world/Emblem";
import { Guide, Pulse } from "@/components/world/Guide";
import { AlbumArt } from "@/components/world/AlbumArt";
import { Icon } from "@/components/world/Icon";
import { QamariyaGoal } from "@/components/world/QamariyaGoal";
import { Skyline } from "@/components/world/Skyline";
import { StickerArt } from "@/components/world/StickerArt";
import { books, unitLessonIds, type Book } from "@/content";
import { SUBJECT_DONE, chapterFor } from "@/content/story";
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
import { readableFill, shadow, yemen } from "@/theme/tokens";

const GREETING = "بِسْمِ اللهِ! هَيَّا نَتَعَلَّمُ";
/** Before the story has been told: the play button starts it. */
const STORY_INVITE = "اِضْغَطْ عَلَى الزِّرِّ، وَاسْمَعْ قِصَّتِي!";
const LESSONS_LEFT = ["", "دَرْسٌ وَاحِدٌ", "دَرْسَانِ", "ثَلَاثَةُ دُرُوسٍ"];

/** What Hudhud says about today's window. */
export function windowLine(done: number): string {
  if (done >= DAILY_GOAL) return "أَضَاءَتِ الْقَمَرِيَّةُ الْيَوْمَ!";
  return `${LESSONS_LEFT[DAILY_GOAL - done]}، وَتُضِيءُ الْقَمَرِيَّةُ!`;
}

/** The subject on the play button: the first letter or number the child meets there. */
function subjectGlyph(book: Book, digits: (v: string) => string): string {
  return book.subject === "math" ? digits("1") : "أ";
}

export default function HomeScreen() {
  const { t, digits, language, loaded: languageLoaded } = useLanguage();
  const { progress, getDueItemIds, getUnitProgress } = useProgress();
  const { settings, loaded, update } = useSettings();
  const pad = useScreenPadding();
  // The subject the child chose in the story or on an island; Arabic until then.
  const current =
    books.find((book) => book.available && book.id === settings.bookId) ??
    books.find((book) => book.available);
  const next = useMemo(() => nextLesson(progress, books, current?.id), [progress, current?.id]);
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
                if (story || !next) router.push(routes.intro());
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

        <View
          style={[styles.islands, { flexDirection: language === "en" ? "row" : "row-reverse" }]}
        >
          {islands.map(({ book, share }) => (
            <Pressable
              key={book.id}
              testID={`book-${book.id}`}
              accessibilityRole="button"
              accessibilityLabel={`${t(book.title)}، ${t(book.subtitle)}`}
              accessibilityState={{ selected: !story && book.id === current?.id }}
              // Choosing an island makes it the subject the play button continues in.
              onPress={tap(() => {
                update({ bookId: book.id });
                // The first time the child helps with this job, Hudhud tells it first.
                const job = chapterFor(book.subject);
                router.push(
                  job && !settings.chaptersSeen.includes(job)
                    ? routes.intro(job)
                    : routes.book(book.id),
                );
              })}
              style={({ pressed }) => [
                styles.island,
                { backgroundColor: readableFill(book.color) },
                !story && book.id === current?.id && styles.islandOn,
                pressed && styles.pressed,
              ]}
            >
              <EmblemDisc id={book.emblem} size={68} />
              <View style={styles.islandTrack}>
                <View style={[styles.islandFill, { width: `${Math.round(share * 100)}%` }]} />
              </View>
              <UiText style={styles.islandCaption} numberOfLines={1}>
                {book.title}
              </UiText>
            </Pressable>
          ))}
        </View>

        <View style={[styles.tiles, { flexDirection: language === "en" ? "row" : "row-reverse" }]}>
          <Pressable
            testID="daily-window"
            accessibilityRole="button"
            accessibilityLabel={windowLine(today)}
            onPress={tap(() => speak(windowLine(today)))}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          >
            <QamariyaGoal filled={today} width={104} />
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
  islands: { width: "100%", paddingHorizontal: 16, gap: 16, marginTop: 6 },
  island: {
    flex: 1,
    minHeight: 136,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    ...shadow.card,
  },
  islandOn: { borderWidth: 5, borderColor: yemen.gold },
  islandTrack: {
    width: "70%",
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
    flexDirection: "row-reverse",
  },
  islandFill: { height: 10, borderRadius: 5, backgroundColor: "#F4C14B", minWidth: 10 },
  islandCaption: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
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
