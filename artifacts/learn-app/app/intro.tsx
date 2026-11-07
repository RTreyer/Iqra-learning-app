/**
 * Hudhud's story (content/story.ts): a few scenes, each told by the voice, then the child
 * chooses how to help, which picks the subject the play button continues in. Shown on the
 * first play; the home screen can play it again. A tap moves on, Skip jumps to the choice.
 */

import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { goBackOr } from "@/components/BackButton";
import { ScreenBackground } from "@/components/ScreenBackground";
import { UiText } from "@/components/UiText";
import { Icon } from "@/components/world/Icon";
import { Envelope, Sack, StoryPicture } from "@/components/world/StoryScenes";
import { books, type Book } from "@/content";
import { INTRO_STORY, SUBJECT_LINES } from "@/content/story";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import * as haptics from "@/lib/haptics";
import { routes } from "@/lib/routes";
import { estimateSpeechMs, speak, stopSpeaking } from "@/lib/speech";
import { readableFill, touchTarget, yemen } from "@/theme/tokens";

/** Pause after a line before the next scene, so a child can look at the picture. */
const LINGER_MS = 900;
const LAST = INTRO_STORY.length - 1;

/** The picture on a choice card: a message with letters, or a sack with numbers. */
function ChoicePicture({ book }: { book: Book }) {
  if (book.subject === "math")
    return (
      <View style={styles.choicePicture}>
        <View style={styles.sackBox}>
          <Sack x={0} size={64} />
        </View>
        <Text style={styles.choiceGlyph}>١ ٢ ٣</Text>
      </View>
    );
  return (
    <View style={styles.choicePicture}>
      <Envelope size={64} />
      <Text style={styles.choiceGlyph}>أ ب ت</Text>
    </View>
  );
}

export default function IntroScreen() {
  const { t, language } = useLanguage();
  const { update } = useSettings();
  const pad = useScreenPadding();
  const [index, setIndex] = useState(0);
  const scene = INTRO_STORY[index];
  const choosing = index === LAST;
  const choices = books.filter((book) => book.available);

  // Tell the scene; move on when the voice is done (or after a fallback), except on the choice.
  useEffect(() => {
    let moved = false;
    let linger: ReturnType<typeof setTimeout> | undefined;
    const shownAt = Date.now();
    const done = () => {
      if (moved || choosing) return;
      moved = true;
      // Stay at least as long as the scene's picture needs (the storm), then a short pause.
      const wait = Math.max(LINGER_MS, (scene.minMs ?? 0) - (Date.now() - shownAt));
      linger = setTimeout(() => setIndex((i) => Math.min(LAST, i + 1)), wait);
    };
    const fallback = setTimeout(done, estimateSpeechMs(scene.line));
    speak(scene.line, { onDone: done });
    return () => {
      moved = true;
      clearTimeout(fallback);
      clearTimeout(linger);
    };
  }, [scene.line, scene.minMs, choosing]);

  useEffect(() => () => stopSpeaking(), []);

  const next = () => {
    haptics.tap();
    setIndex((i) => Math.min(LAST, i + 1));
  };

  const choose = (book: Book) => {
    haptics.success();
    update({ introSeen: true, bookId: book.id });
    // The book's path greets with this subject's line (app/book/[bookId].tsx).
    router.replace(routes.book(book.id));
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
          {INTRO_STORY.map((s, i) => (
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
            onPress={() => setIndex(LAST)}
            style={styles.skip}
          >
            <UiText style={styles.skipText}>تخطَّ</UiText>
          </Pressable>
        )}
      </View>

      <Pressable
        testID="intro-next"
        accessibilityRole="button"
        accessibilityLabel={scene.line}
        disabled={choosing}
        onPress={next}
        style={styles.stage}
      >
        <View testID={`intro-scene-${scene.id}`} style={styles.picture}>
          <StoryPicture id={scene.id} />
        </View>
        <View style={styles.bubble}>
          <Icon name="speaker" size={22} color={yemen.clay} />
          <Text style={styles.line}>{scene.line}</Text>
        </View>
      </Pressable>

      {choosing ? (
        <View
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
        </View>
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
  picture: { width: "100%" },
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
  sackBox: { width: 64, height: 64 },
  choiceGlyph: { fontSize: 30, fontWeight: "900", color: "#FFFFFF" },
  choiceCaption: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  pressed: { opacity: 0.88, transform: [{ scale: 0.96 }] },
});
