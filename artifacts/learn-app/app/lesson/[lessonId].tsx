/**
 * The single lesson engine: every lesson type plays here through its activity component.
 */

import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ActivityHost } from "@/components/ActivityHost";
import { BackButton } from "@/components/BackButton";
import { LessonCompleteCard } from "@/components/LessonCompleteCard";
import { NotFoundCard } from "@/components/NotFoundCard";
import { ScreenBackground } from "@/components/ScreenBackground";
import { InstructionButton } from "@/components/InstructionButton";
import { getLesson } from "@/content";
import { instructionFor } from "@/content/instructions";
import { useLanguage } from "@/context/LanguageContext";
import { useProgress } from "@/context/ProgressContext";
import { useLessonAttempt } from "@/hooks/useLessonAttempt";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import * as haptics from "@/lib/haptics";
import { firstParam } from "@/lib/params";
import { routes } from "@/lib/routes";
import { starsForScore, type Score } from "@/lib/scoring";
import { estimateSpeechMs, speak, stopSpeaking } from "@/lib/speech";
import { colors, touchTarget } from "@/theme/tokens";

/** The activity mounts when the title has been spoken, or after this at the latest. */
const INTRO_FALLBACK_MS = 1500;

/**
 * Speaks the title, then the instruction, then reports the lesson as ready. Activities speak
 * their own first prompt, and speak() stops current speech, so they must not mount before the
 * intro has finished. Each step moves on when speech reports back, or after a fallback timer.
 */
function useLessonIntro(
  lessonId: string,
  title: string | undefined,
  instruction: string | undefined,
): boolean {
  const [readyFor, setReadyFor] = useState<string | null>(null);
  useEffect(() => {
    if (!title) return;
    const steps: [string, number][] = [[title, INTRO_FALLBACK_MS]];
    if (instruction) steps.push([instruction, estimateSpeechMs(instruction)]);
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const next = (step: number) => {
      if (settled) return;
      clearTimeout(timer);
      if (step >= steps.length) {
        settled = true;
        setReadyFor(lessonId);
        return;
      }
      // speak() stops the previous utterance, which may report back late: only move on once.
      let moved = false;
      const done = () => {
        if (moved) return;
        moved = true;
        next(step + 1);
      };
      const [text, fallbackMs] = steps[step];
      timer = setTimeout(done, fallbackMs);
      speak(text, { onDone: done });
    };
    next(0);
    return () => {
      settled = true;
      clearTimeout(timer);
      stopSpeaking();
    };
  }, [lessonId, title, instruction]);
  return readyFor === lessonId;
}

export default function LessonScreen() {
  const lessonId =
    firstParam(useLocalSearchParams<{ lessonId?: string | string[] }>().lessonId) ?? "";
  const { completeLesson, recordRoundResult } = useProgress();
  const pad = useScreenPadding();
  const { language } = useLanguage();

  const found = getLesson(lessonId);
  const { completed, stars, completeAttempt, restartAttempt, activityKey } = useLessonAttempt(
    found ? found.lesson.id : "",
  );
  const instruction = found ? instructionFor(found.lesson) : undefined;
  const ready = useLessonIntro(lessonId, found?.lesson.title, instruction);

  if (!found) return <NotFoundCard message="الدرس غير موجود" />;
  const { book, unit, lesson, next } = found;

  const onComplete = (score: Score) => {
    const earned = starsForScore(score);
    completeLesson(lesson.id, earned);
    haptics.success();
    speak("أحسنت! لقد أتممت الدرس");
    completeAttempt(earned);
  };

  return (
    <ScreenBackground
      subject={book.subject}
      style={[styles.screen, { paddingTop: pad.top, paddingBottom: pad.bottom + 16 }]}
    >
      <View style={[styles.header, { flexDirection: language === "en" ? "row" : "row-reverse" }]}>
        <BackButton fallback={routes.unit(unit.id)} />
        <View style={styles.headerCenter}>
          <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
          <View style={styles.headerText}>
            <Text style={styles.lessonTitle} numberOfLines={1}>
              {lesson.title}
            </Text>
            <Text style={styles.lessonSubtitle} numberOfLines={1}>
              {lesson.subtitle}
            </Text>
          </View>
        </View>
        {instruction ? (
          <InstructionButton instruction={instruction} />
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>
      <ScrollView
        key={activityKey}
        scrollEnabled={lesson.type !== "trace"}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {completed ? (
          <LessonCompleteCard
            stars={stars}
            onRepeat={restartAttempt}
            next={next}
            backTo={routes.unit(unit.id)}
            color={unit.color}
          />
        ) : ready ? (
          <ActivityHost
            lesson={lesson}
            color={unit.color}
            attemptKey={activityKey}
            onComplete={onComplete}
            onRoundResult={recordRoundResult}
          />
        ) : null}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
  headerText: { alignItems: "center", flexShrink: 1 },
  headerSpacer: { width: touchTarget },
  lessonEmoji: { fontSize: 22 },
  lessonTitle: { fontSize: 17, fontWeight: "800", color: colors.text, flexShrink: 1 },
  lessonSubtitle: { fontSize: 12, fontWeight: "500", color: colors.mutedStrong, flexShrink: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
});
