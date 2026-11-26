/**
 * The single lesson engine: every lesson type plays here through its activity component.
 */

import { useLocalSearchParams } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ActivityHost } from "@/components/ActivityHost";
import { LessonCompleteCard } from "@/components/LessonCompleteCard";
import { NotFoundCard } from "@/components/NotFoundCard";
import { ScreenBackground } from "@/components/ScreenBackground";
import { DemoPlayer } from "@/components/demo/DemoPlayer";
import { HelpButton } from "@/components/HelpButton";
import { lessonPicture } from "@/components/world/lessonPicture";
import { WorldHeader } from "@/components/world/WorldHeader";
import { StorySymbolContext } from "@/components/activities/shared/StoryProgress";
import { GuideProvider, LessonGuide, useGuideState } from "@/components/world/LessonGuide";
import { getLesson, unitLessonIds } from "@/content";
import { demoIdFor } from "@/content/demos";
import { instructionFor } from "@/content/instructions";
import { useProgress } from "@/context/ProgressContext";
import { useDemoSeen } from "@/hooks/useDemoSeen";
import { useLessonAttempt } from "@/hooks/useLessonAttempt";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import { lessonsToday } from "@/lib/daily";
import * as haptics from "@/lib/haptics";
import { firstParam } from "@/lib/params";
import { routes } from "@/lib/routes";
import { starsForScore, type Score } from "@/lib/scoring";
import { speak, speakThen, stopSpeaking } from "@/lib/speech";
import { SUBJECT_SPOKEN } from "@/components/world/SubjectLabel";
import { newSticker, type Sticker } from "@/lib/stickers";
import { StoryGoal } from "@/components/world/StoryGoal";
import { GOAL_LINES, finishLine, giftLine } from "@/content/story";
import { goalKind, storyStep, type StoryStep } from "@/lib/storyProgress";
import type { GoalKind } from "@/content/types";

/**
 * Speaks the subject (for the parents in the room: Arabic or maths), the title, then the
 * instruction, then reports the lesson as ready. Activities speak their own first prompt, and
 * speak() stops current speech, so they must not mount before the intro has finished. Each
 * line is spoken to its real end with a short pause after it (speakThen): a slow or late voice
 * is never cut by a fixed timer.
 */
function useLessonIntro(
  lessonId: string,
  subject: string | undefined,
  title: string | undefined,
  instruction: string | undefined,
  /** The menu language is known, so the title is spoken in the right language. */
  languageLoaded = true,
): boolean {
  const [readyFor, setReadyFor] = useState<string | null>(null);
  useEffect(() => {
    if (!title || !languageLoaded) return;
    const lines = [subject, title, instruction].filter((line): line is string => !!line);
    let cancel = () => {};
    const next = (i: number) => {
      if (i >= lines.length) {
        setReadyFor(lessonId);
        return;
      }
      cancel = speakThen(lines[i], () => next(i + 1));
    };
    next(0);
    return () => {
      cancel();
      stopSpeaking();
    };
  }, [lessonId, subject, title, instruction, languageLoaded]);
  return readyFor === lessonId;
}

export default function LessonScreen() {
  const lessonId =
    firstParam(useLocalSearchParams<{ lessonId?: string | string[] }>().lessonId) ?? "";
  const { progress, completeLesson, recordRoundResult, getLessonProgress } = useProgress();
  const today = useMemo(() => lessonsToday(progress), [progress]);
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const [story, setStory] = useState<{ kind: GoalKind; step: StoryStep } | null>(null);
  const pad = useScreenPadding();

  const found = getLesson(lessonId);
  const { completed, stars, completeAttempt, restartAttempt, activityKey } = useLessonAttempt(
    found ? found.lesson.id : "",
  );
  const instruction = found ? instructionFor(found.lesson) : undefined;
  // Hudhud tells the task above the activity and reacts to the child's answers.
  const guide = useGuideState();
  const { loaded: languageLoaded } = useLanguage();
  const ready = useLessonIntro(
    lessonId,
    found ? SUBJECT_SPOKEN[found.book.subject] : undefined,
    found?.lesson.title,
    instruction,
    languageLoaded,
  );

  // Worked example: shown on the first lesson of each activity type, and again on request.
  const { seen, markSeen } = useDemoSeen();
  const [replay, setReplay] = useState<{ lessonId: string; run: number } | null>(null);
  const demoId = found ? demoIdFor(found.lesson) : undefined;
  const replaying = replay?.lessonId === lessonId;
  const decided = ready && seen !== null && demoId !== undefined;
  const showDemo = decided && (replaying || !seen.has(demoId));
  // During a replay the activity stays mounted, hidden, so the child keeps its place.
  const showActivity = decided && (!showDemo || replaying);
  const finishDemo = () => {
    if (demoId) markSeen(demoId);
    setReplay(null);
  };

  if (!found) return <NotFoundCard message="الدرس غير موجود" />;
  const { book, unit, lesson, next } = found;

  const onComplete = (score: Score) => {
    const earned = starsForScore(score);
    // Stars only grow by beating the lesson's best, so this is the new total.
    const before = progress.totalStars;
    const gained = Math.max(0, earned - getLessonProgress(lesson.id).stars);
    const won = newSticker(before, before + gained);
    setSticker(won);
    // What the lesson brings to the unit's goal in Hudhud's story (lib/storyProgress.ts): a
    // letter back, a line written, a sack counted; the last lesson seals and delivers the letter
    // or finishes the market station.
    const kind = goalKind(unit, book.subject);
    const step = kind
      ? storyStep(unit, kind, (l) => getLessonProgress(l.id).completed, lesson.id)
      : null;
    setStory(kind && step ? { kind, step } : null);
    completeLesson(lesson.id, earned);
    haptics.success();
    const beat =
      kind && step
        ? step.completed
          ? finishLine(unit.id, kind)
          : step.fresh !== null
            ? GOAL_LINES[kind].beat
            : ""
        : "";
    // A sticker is a thank-you gift from the people Hudhud and the child help. The last
    // round has just been praised ("أَحْسَنْت!"), so the lesson's line does not say it again
    // (VOICE-06); it comes once that praise has ended (useQuiz waits for it).
    const praise = won ? giftLine(won.name) : "لَقَدْ أَتْمَمْتَ الدَّرْسَ!";
    speak(
      step?.completed
        ? won
          ? `${beat} ${giftLine(won.name)}`
          : beat
        : beat
          ? `${praise} ${beat}`
          : praise,
    );
    completeAttempt(earned);
  };

  // The completion card scrolls on every lesson, a trace lesson's too.
  const drawing = lesson.type === "trace" && !completed;
  const body = completed ? (
    <LessonCompleteCard
      stars={stars}
      onRepeat={restartAttempt}
      next={next}
      backTo={routes.unit(unit.id)}
      today={today}
      sticker={sticker}
      story={
        story ? (
          <StoryGoal
            unit={unit}
            kind={story.kind}
            state={story.step}
            fresh={story.step.completed ? null : story.step.fresh}
            compact
            testID="lesson-story"
          />
        ) : null
      }
    />
  ) : (
    <>
      {showDemo ? (
        <DemoPlayer
          key={`${lessonId}-${replay?.run ?? 0}`}
          id={demoIdFor(lesson)}
          color={unit.color}
          preface={replaying ? instruction : undefined}
          onDone={finishDemo}
        />
      ) : null}
      {showActivity ? (
        <View style={showDemo ? styles.hidden : drawing ? styles.fill : styles.activity}>
          <ActivityHost
            lesson={lesson}
            color={unit.color}
            attemptKey={activityKey}
            onComplete={onComplete}
            onRoundResult={recordRoundResult}
          />
        </View>
      ) : null}
    </>
  );

  return (
    <ScreenBackground
      subject={book.subject}
      style={[styles.screen, { paddingTop: pad.top, paddingBottom: pad.bottom + 16 }]}
    >
      <WorldHeader
        up={{ fallback: routes.unit(unit.id), icon: "map" }}
        picture={lessonPicture(lesson.type, "#FFFFFF", 32)}
        name={lesson.title}
        detail={lesson.subtitle}
        color={unit.color}
        subject={book}
        end={
          completed ? undefined : (
            <HelpButton
              disabled={!decided || showDemo}
              onPress={() => setReplay({ lessonId, run: (replay?.run ?? 0) + 1 })}
            />
          )
        }
      />
      {completed ? null : (
        <LessonGuide text={guide.line ?? instruction ?? lesson.subtitle} mood={guide.mood} />
      )}
      <GuideProvider api={guide.api}>
        <StorySymbolContext.Provider value={book.subject === "math" ? "sack" : "letter"}>
          {drawing ? (
            // Tracing: the pad sizes itself to the screen and a drag draws, so nothing scrolls.
            <View key={activityKey} style={styles.fixed}>
              {body}
            </View>
          ) : (
            <ScrollView
              key={activityKey}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {body}
            </ScrollView>
          )}
        </StorySymbolContext.Provider>
      </GuideProvider>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
  fixed: { flex: 1, paddingBottom: 24 },
  fill: { flex: 1 },
  activity: { flexGrow: 1 },
  hidden: { display: "none" },
});
