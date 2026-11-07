/**
 * Hudhud's story (content/story.ts), scene by scene, each told by the voice. Without a chapter:
 * who Hudhud is (a day worker with a dream), ending in the choice of today's job, which picks
 * the subject the play button continues in; then that job's chapter. With a chapter
 * (`?chapter=arabic|math`): only that job, told the first time the child helps with it, then
 * its path opens. A tap moves on; Skip jumps to the choice, or past the chapter.
 */

import { router, useLocalSearchParams } from "expo-router";
import { useLine } from "@/components/Gloss";
import React, { useEffect, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";

import { goBackOr } from "@/components/BackButton";
import { ScreenBackground } from "@/components/ScreenBackground";
import { UiText } from "@/components/UiText";
import { Icon } from "@/components/world/Icon";
import { BowlArt } from "@/components/world/Bowl";
import { SidrTreeArt } from "@/components/world/SidrTree";
import { StoryPicture } from "@/components/world/StoryScenes";
import { books, type Book } from "@/content";
import {
  CHAPTERS,
  INTRO_STORY,
  SUBJECT_LINES,
  chapterFor,
  stationScenes,
  type ChapterId,
  type StoryScene,
} from "@/content/story";
import { firstParam } from "@/lib/params";
import { useLatest } from "@/components/activities/shared/useLatest";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import * as haptics from "@/lib/haptics";
import { routes } from "@/lib/routes";
import { estimateSpeechMs, speak, stopSpeaking } from "@/lib/speech";
import { readableFill, touchTarget, yemen } from "@/theme/tokens";

/** Milliseconds now, read in effects and timers (never during render). */
const clock = () => Date.now();

/** Pause after a line before the next scene, so a child can look at the picture. */
const LINGER_MS = 900;
/** How long one scene takes to give way to the next, like turning a page. */
const TURN_MS = 700;
/** How far a scene glides while it comes in or goes (px). */
const GLIDE = 40;

/**
 * The scene pictures with page-turn transitions: the old scene stays alive (its animation
 * keeps playing) while it fades and glides out to the right, and the new one fades and glides
 * in from the left, the way pages of an Arabic book turn.
 */
function SceneStage({ scenes, index }: { scenes: readonly StoryScene[]; index: number }) {
  const [current, setCurrent] = useState(index);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [turn] = useState(() => new Animated.Value(1));
  // A new scene: the one on show starts leaving (adjusting state while rendering, as React
  // recommends for state derived from a changed prop).
  if (index !== current) {
    setLeaving(current);
    setCurrent(index);
  }
  useEffect(() => {
    turn.setValue(0);
    const anim = Animated.timing(turn, {
      toValue: 1,
      duration: TURN_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start(({ finished }) => {
      if (finished) setLeaving(null);
    });
    return () => anim.stop();
  }, [current, turn]);

  const turning = leaving !== null;
  return (
    <View style={styles.picture}>
      {turning ? (
        <Animated.View
          key={`${leaving}-${scenes[leaving].id}`}
          pointerEvents="none"
          style={[
            styles.layer,
            {
              opacity: turn.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
              transform: [
                { translateX: turn.interpolate({ inputRange: [0, 1], outputRange: [0, GLIDE] }) },
                { scale: turn.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] }) },
              ],
            },
          ]}
        >
          <StoryPicture scene={scenes[leaving]} />
        </Animated.View>
      ) : null}
      <Animated.View
        key={`${current}-${scenes[current].id}`}
        testID={`intro-scene-${scenes[current].id}`}
        style={[
          styles.layer,
          turning
            ? {
                opacity: turn.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 0.2, 1] }),
                transform: [
                  {
                    translateX: turn.interpolate({ inputRange: [0, 1], outputRange: [-GLIDE, 0] }),
                  },
                  { scale: turn.interpolate({ inputRange: [0, 1], outputRange: [1.04, 1] }) },
                ],
              }
            : null,
        ]}
      >
        <StoryPicture scene={scenes[current]} />
      </Animated.View>
    </View>
  );
}

/** Fades and lifts its content in when it appears (the spoken line, the choices). */
function Appear({
  children,
  delay = 0,
  rise = 10,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  rise?: number;
  style?: React.ComponentProps<typeof View>["style"];
}) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const anim = Animated.timing(v, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [v, delay]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [rise, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** The picture on a choice card: Rasha's bowl with letters, or her seed with numbers. */
function ChoicePicture({ book }: { book: Book }) {
  if (book.subject === "math")
    return (
      <View style={styles.choicePicture}>
        <SidrTreeArt stage={1} size={64} />
        <Text style={styles.choiceGlyph}>١ ٢ ٣</Text>
      </View>
    );
  return (
    <View style={styles.choicePicture}>
      <BowlArt width={70} level={0.4} />
      <Text style={styles.choiceGlyph}>أ ب ت</Text>
    </View>
  );
}

export default function IntroScreen() {
  const param = firstParam(useLocalSearchParams<{ chapter?: string | string[] }>().chapter);
  // A chapter of the story (the two threads, the end), or a unit's station.
  const chapter = param && (param in CHAPTERS || stationScenes(param)) ? param : null;
  // A new part is a new story: start it from its first scene.
  return <Story key={chapter ?? "intro"} chapter={chapter} />;
}

/** The scenes of a part of the story: chapter 1, a chapter, or a station. */
function scenesOf(part: string | null): readonly StoryScene[] {
  if (!part) return INTRO_STORY;
  return CHAPTERS[part as ChapterId] ?? stationScenes(part) ?? INTRO_STORY;
}

/** Where a told part leads: a thread to its book's path, a station to its unit, the end home. */
function afterPart(part: string, bookId: string | null) {
  if (part === "end") return routes.home();
  if (!(part in CHAPTERS)) return routes.unit(part);
  const chosen = books.find((book) => book.id === bookId);
  const book =
    chosen && chapterFor(chosen.subject) === part
      ? chosen
      : books.find((b) => b.available && chapterFor(b.subject) === part);
  return book ? routes.book(book.id) : routes.home();
}

function Story({ chapter }: { chapter: string | null }) {
  const { t, language, loaded: languageLoaded } = useLanguage();
  const line = useLine();
  const { settings, update } = useSettings();
  const pad = useScreenPadding();
  const scenes = scenesOf(chapter);
  const LAST = scenes.length - 1;
  const [index, setIndex] = useState(0);
  const scene = scenes[index];
  const choosing = !chapter && index === LAST;
  const choices = books.filter((book) => book.available);

  /**
   * The part is told: remember it, then go on. A thread opens its book's path (the book the
   * child chose, if it fits), a station its unit's path, the end goes home.
   */
  const finishChapter = () => {
    if (!chapter) return;
    update({ chaptersSeen: [...new Set([...settings.chaptersSeen, chapter])] });
    router.replace(afterPart(chapter, settings.bookId));
  };
  const finishRef = useLatest(finishChapter);

  // Tell the scene; move on when the voice is done (or after a fallback), except on the choice.
  useEffect(() => {
    // Wait for the menu language, so the first line is told in the chosen language.
    if (!languageLoaded) return;
    let moved = false;
    let linger: ReturnType<typeof setTimeout> | undefined;
    const shownAt = clock();
    const done = () => {
      if (moved || choosing) return;
      moved = true;
      // Stay at least as long as the scene's picture needs (the storm), then a short pause.
      const wait = Math.max(LINGER_MS, (scene.minMs ?? 0) - (clock() - shownAt));
      linger = setTimeout(() => {
        // The last scene of a chapter opens the job's path.
        if (index === LAST) finishRef.current();
        else setIndex((i) => Math.min(LAST, i + 1));
      }, wait);
    };
    const fallback = setTimeout(done, estimateSpeechMs(scene.line));
    speak(scene.line, { onDone: done });
    return () => {
      moved = true;
      clearTimeout(fallback);
      clearTimeout(linger);
    };
  }, [scene.line, scene.minMs, choosing, languageLoaded, index, LAST]);

  useEffect(() => () => stopSpeaking(), []);

  const next = () => {
    haptics.tap();
    if (chapter && index === LAST) finishChapter();
    else setIndex((i) => Math.min(LAST, i + 1));
  };

  const choose = (book: Book) => {
    haptics.success();
    update({ introSeen: true, bookId: book.id });
    // Today's job: its chapter is told next, then its path opens (app/book/[bookId].tsx).
    const job = chapterFor(book.subject);
    router.replace(job ? routes.intro(job) : routes.book(book.id));
  };

  return (
    <ScreenBackground style={[styles.screen, { paddingTop: pad.top + 8 }]}>
      <View style={[styles.header, { flexDirection: language === "en" ? "row" : "row-reverse" }]}>
        <Pressable
          testID="intro-close"
          accessibilityRole="button"
          accessibilityLabel={t("رجوع")}
          onPress={() => goBackOr(routes.home())}
          style={styles.headerButton}
        >
          <Icon name="home" size={26} color={yemen.clay} />
        </Pressable>
        <View style={styles.dots} accessible accessibilityLabel={`${index + 1} / ${LAST + 1}`}>
          {scenes.map((s, i) => (
            <View
              key={s.id}
              style={[styles.dot, i === index && styles.dotOn, i < index && styles.dotDone]}
            />
          ))}
        </View>
        {choosing ? (
          <View style={styles.headerSpacer} />
        ) : (
          <Pressable
            testID="intro-skip"
            accessibilityRole="button"
            accessibilityLabel={t("تخطَّ")}
            onPress={() => (chapter ? finishChapter() : setIndex(LAST))}
            style={styles.skip}
          >
            <UiText style={styles.skipText}>تخطَّ</UiText>
          </Pressable>
        )}
      </View>

      <Pressable
        testID="intro-next"
        accessibilityRole="button"
        accessibilityLabel={line(scene.line)}
        disabled={choosing}
        onPress={next}
        style={styles.stage}
      >
        <SceneStage scenes={scenes} index={index} />
        {/* A new line appears as the new scene comes in. */}
        <Appear key={scene.id} delay={TURN_MS / 3} style={styles.bubble}>
          <View style={styles.speaker}>
            <Icon name="speaker" size={22} color={yemen.clay} />
          </View>
          <Text style={styles.line}>{line(scene.line)}</Text>
        </Appear>
      </Pressable>

      {choosing ? (
        <Appear
          delay={TURN_MS}
          rise={40}
          style={[
            styles.choices,
            {
              flexDirection: language === "en" ? "row" : "row-reverse",
              paddingBottom: pad.bottom + 16,
            },
          ]}
        >
          {choices.map((book) => (
            <Pressable
              key={book.id}
              testID={`choose-${book.id}`}
              accessibilityRole="button"
              accessibilityLabel={`${t(book.title)}، ${SUBJECT_LINES[book.subject] ?? ""}`}
              onPress={() => choose(book)}
              style={({ pressed }) => [
                styles.choice,
                { backgroundColor: readableFill(book.color) },
                pressed && styles.pressed,
              ]}
            >
              <ChoicePicture book={book} />
              <UiText style={styles.choiceCaption} numberOfLines={1}>
                {book.title}
              </UiText>
            </Pressable>
          ))}
        </Appear>
      ) : null}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: touchTarget / 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: { width: touchTarget, height: touchTarget },
  dots: { flexDirection: "row-reverse", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: yemen.paneEmpty },
  dotOn: { width: 26, backgroundColor: yemen.clay },
  dotDone: { backgroundColor: yemen.gold },
  skip: {
    minWidth: touchTarget,
    minHeight: touchTarget,
    paddingHorizontal: 14,
    borderRadius: touchTarget / 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: { fontSize: 15, fontWeight: "700", color: yemen.inkSoft },
  stage: { flex: 1, minHeight: touchTarget, paddingHorizontal: 16, gap: 14 },
  picture: { width: "100%", height: 300 },
  layer: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  bubble: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    boxShadow: `0 4px 0 ${yemen.sandShadow}`,
  },
  speaker: { flexShrink: 0 },
  line: {
    flex: 1,
    fontSize: 21,
    fontWeight: "700",
    color: yemen.ink,
    textAlign: "center",
    writingDirection: "rtl",
    lineHeight: 34,
  },
  choices: { paddingHorizontal: 16, gap: 14 },
  choice: {
    flex: 1,
    minHeight: 150,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    boxShadow: `0 7px 0 ${yemen.clayDeep}`,
  },
  choicePicture: { alignItems: "center", gap: 4 },
  choiceGlyph: { fontSize: 30, fontWeight: "900", color: "#FFFFFF" },
  choiceCaption: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  pressed: { opacity: 0.88, transform: [{ scale: 0.96 }] },
});
