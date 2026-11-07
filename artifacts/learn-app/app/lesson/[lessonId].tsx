/**
 * The single lesson engine: every lesson type plays here through its activity component.
 */

import { useLocalSearchParams } from "expo-router";
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
import { estimateSpeechMs, speak, stopSpeaking } from "@/lib/speech";
import { newSticker, type Sticker } from "@/lib/stickers";
import { StoryGoal } from "@/components/world/StoryGoal";
import { GOAL_LINES, finishLine, giftLine } from "@/content/story";
import { goalKind, storyStep, type StoryStep } from "@/lib/storyProgress";
import type { GoalKind } from "@/content/types";

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
  const ready = useLessonIntro(lessonId, found?.lesson.title, instruction);

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
          ? finishLine(unit, kind)
          : step.fresh !== null
            ? GOAL_LINES[kind].beat
            : ""
        : "";
    // A sticker is a thank-you gift from the people Hudhud and the child help.
    const praise = won ? `أَحْسَنْت! ${giftLine(won.name)}` : "أحسنت! لقد أتممت الدرس";
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
                  <View style={showDemo ? styles.hidden : styles.activity}>
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
            )}
          </ScrollView>
        </StorySymbolContext.Provider>
      </GuideProvider>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
  activity: { flexGrow: 1 },
  hidden: { display: "none" },
});
