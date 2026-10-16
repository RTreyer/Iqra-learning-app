/**
 * The single lesson engine: every lesson type plays here through its activity component.
 */

import { useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
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
import { starsForScore, type Score } from "@/lib/scoring";
import { speak } from "@/lib/speech";

const TITLE_SPEECH_DELAY_MS = 500;

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { completeLesson } = useProgress();
  const pad = useScreenPadding();

  const found = getLesson(lessonId ?? "");
  const { completed, stars, completeAttempt, restartAttempt, activityKey } = useLessonAttempt(found ? found.lesson.id : "");

  const title = found?.lesson.title;
  useEffect(() => {
    if (!title) return;
    const timer = setTimeout(() => speak(title), TITLE_SPEECH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [title]);

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
        <BackButton />
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
          <LessonCompleteCard stars={stars} onRepeat={restartAttempt} next={next} color={unit.color} />
        ) : (
          <ActivityHost
            lesson={lesson}
            color={unit.color}
            attemptKey={activityKey}
            onComplete={onComplete}
            // TODO(5.3): onRoundResult={recordRoundResult}
          />
        )}
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
  lessonTitle: { fontSize: 17, fontWeight: "800", color: "#1E293B", flexShrink: 1 },
  lessonSubtitle: { fontSize: 12, fontWeight: "500", color: "#64748B", flexShrink: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
});
