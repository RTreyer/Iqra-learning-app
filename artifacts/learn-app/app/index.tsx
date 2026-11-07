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
import { Guide, Pulse } from "@/components/world/Guide";
import { Icon } from "@/components/world/Icon";
import { QamariyaGoal } from "@/components/world/QamariyaGoal";
import { Skyline } from "@/components/world/Skyline";
import { StickerArt } from "@/components/world/StickerArt";
import { books, unitLessonIds, type Book } from "@/content";
import { useLanguage } from "@/context/LanguageContext";
import { useProgress } from "@/context/ProgressContext";
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
const ALL_DONE = "مَا شَاءَ اللهُ! أَتْمَمْتَ كُلَّ الدُّرُوسِ";
const LESSONS_LEFT = ["", "دَرْسٌ وَاحِدٌ", "دَرْسَانِ", "ثَلَاثَةُ دُرُوسٍ"];

/** What Hudhud says about today's window. */
export function windowLine(done: number): string {
  if (done >= DAILY_GOAL) return "أَضَاءَتِ الْقَمَرِيَّةُ الْيَوْمَ!";
  return `${LESSONS_LEFT[DAILY_GOAL - done]}، وَتُضِيءُ الْقَمَرِيَّةُ!`;
}

/** Picture on a subject island: the first letters or numbers the child meets there. */
function islandGlyph(book: Book, digits: (v: string) => string): string {
  if (book.subject === "math") return digits("1 2 3");
  if (book.subject === "arabic" || book.subject === "lughati") return "أ ب ت";
  return book.emoji;
}

export default function HomeScreen() {
  const { t, digits, language } = useLanguage();
  const { progress, getDueItemIds, getUnitProgress } = useProgress();
  const pad = useScreenPadding();
  const next = useMemo(() => nextLesson(progress), [progress]);
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
          <StarBadge stars={progress.totalStars} />
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

        <Guide text={next ? GREETING : ALL_DONE} layout="stack" birdSize={112} speakOnMount />

        {next ? (
          <Pulse style={styles.playWrap}>
            <Pressable
              testID="continue-card"
              accessibilityRole="button"
              accessibilityLabel={`${t("تَابِعْ:")} ${t(next.unit.title)}: ${next.lesson.title}`}
              onPress={tap(() => router.push(routes.lesson(next.lesson.id)))}
              style={({ pressed }) => [styles.play, pressed && styles.pressed]}
            >
              <View style={styles.playIcon}>
                <Icon name="play" size={72} color="#FFFFFF" />
              </View>
            </Pressable>
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
              onPress={tap(() => router.push(routes.book(book.id)))}
              style={({ pressed }) => [
                styles.island,
                { backgroundColor: readableFill(book.color) },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.islandGlyph}>{islandGlyph(book, digits)}</Text>
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
              <Icon name="album" size={44} color={yemen.green} />
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
  islandGlyph: { fontSize: 40, fontWeight: "800", color: "#FFFFFF", lineHeight: 56 },
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
