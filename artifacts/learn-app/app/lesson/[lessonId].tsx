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
import { getLesson } from "@/content";
import { useProgress } from "@/context/ProgressContext";
import { useLessonAttempt } from "@/hooks/useLessonAttempt";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import * as haptics from "@/lib/haptics";
import { firstParam } from "@/lib/params";
import { routes } from "@/lib/routes";
import { starsForScore, type Score } from "@/lib/scoring";
import { speak, stopSpeaking } from "@/lib/speech";
import { colors } from "@/theme/tokens";

/** The activity mounts when the title has been spoken, or after this at the latest. */
const INTRO_FALLBACK_MS = 1500;

/**
 * Speaks the title, then reports the lesson as ready. Activities speak their own first prompt,
 * and speak() stops current speech, so they must not mount before the title has finished.
 */
function useLessonIntro(lessonId: string, title: string | undefined): boolean {
  const [readyFor, setReadyFor] = useState<string | null>(null);
  useEffect(() => {
    if (!title) return;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      setReadyFor(lessonId);
    };
    const timer = setTimeout(finish, INTRO_FALLBACK_MS);
    speak(title, { onDone: finish });
    return () => {
      settled = true;
      clearTimeout(timer);
      stopSpeaking();
    };
  }, [lessonId, title]);
  return readyFor === lessonId;
}

export default function LessonScreen() {
  const lessonId = firstParam(useLocalSearchParams<{ lessonId?: string | string[] }>().lessonId) ?? "";
  const { completeLesson } = useProgress();
  const pad = useScreenPadding();

  const found = getLesson(lessonId);
  const { completed, stars, completeAttempt, restartAttempt, activityKey } = useLessonAttempt(found ? found.lesson.id : "");
  const ready = useLessonIntro(lessonId, found?.lesson.title);

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
    <ScreenBackground subject={book.subject} style={[styles.screen, { paddingTop: pad.top, paddingBottom: pad.bottom + 16 }]}>
      <View style={styles.header}>
        <BackButton fallback={routes.unit(unit.id)} />
        <View style={styles.headerCenter}>
          <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
          <View style={styles.headerText}>
            <Text style={styles.lessonTitle} numberOfLines={1}>{lesson.title}</Text>
            <Text style={styles.lessonSubtitle} numberOfLines={1}>{lesson.subtitle}</Text>
          </View>
        </View>
        <View style={styles.headerSpacer} />
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
            // TODO(5.3): onRoundResult={recordRoundResult}
          />
        ) : null}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, justifyContent: "center" },
  headerText: { alignItems: "center", flexShrink: 1 },
  headerSpacer: { width: 44 },
  lessonEmoji: { fontSize: 22 },
  lessonTitle: { fontSize: 17, fontWeight: "800", color: colors.text, flexShrink: 1 },
  lessonSubtitle: { fontSize: 12, fontWeight: "500", color: colors.muted, flexShrink: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
});
