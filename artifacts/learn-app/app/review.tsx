/**
 * Today's review: plays the items due today once each, repeats wrong ones once at the end,
 * and records only the first answer of every item.
 */

import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ReviewRound } from "@/components/activities/ReviewRound";
import { ProgressDots } from "@/components/activities/shared/ProgressDots";
import { BackButton } from "@/components/BackButton";
import { ReviewCompleteCard } from "@/components/ReviewCompleteCard";
import { ScreenBackground } from "@/components/ScreenBackground";
import { UiText } from "@/components/UiText";
import { useProgress } from "@/context/ProgressContext";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import { routes } from "@/lib/routes";
import { allItems, type ReviewItem } from "@/lib/reviewItems";
import { colors } from "@/theme/tokens";

type Session = {
  /** Items to play in order; wrong first answers are appended once. */
  queue: ReviewItem[];
  /** Number of distinct items in the session (the score denominator). */
  total: number;
  index: number;
  /** First answers that were right. */
  correct: number;
  /** Ids already appended for a repeat. */
  repeated: ReadonlySet<string>;
};

function toItems(ids: string[]): ReviewItem[] {
  const catalog = allItems();
  return ids.flatMap((id) => {
    const item = catalog.get(id);
    return item ? [item] : [];
  });
}

function startSession(ids: string[]): Session {
  const queue = toItems(ids);
  return { queue, total: queue.length, index: 0, correct: 0, repeated: new Set() };
}

export default function ReviewScreen() {
  const { getDueItemIds, recordReview } = useProgress();
  const pad = useScreenPadding();
  const dueNow = getDueItemIds(new Date());
  const [session, setSession] = useState(() => startSession(dueNow));

  // The queue is fixed once it has items. Until then, adopt the due list once stored progress has loaded.
  if (session.total === 0 && dueNow.length > 0) {
    const loaded = startSession(dueNow);
    if (loaded.total > 0) setSession(loaded);
  }

  const { queue, total, index } = session;
  const current = queue[index];

  const onAnswer = (correct: boolean) => {
    if (!current) return;
    const firstAnswer = index < total;
    if (firstAnswer) recordReview(current.id, correct);
    setSession((s) => {
      const repeat = firstAnswer && !correct && !s.repeated.has(current.id);
      return {
        ...s,
        queue: repeat ? [...s.queue, current] : s.queue,
        repeated: repeat ? new Set([...s.repeated, current.id]) : s.repeated,
        correct: s.correct + (firstAnswer && correct ? 1 : 0),
        index: s.index + 1,
      };
    });
  };

  return (
    <ScreenBackground subject="home" style={[styles.screen, { paddingTop: pad.top, paddingBottom: pad.bottom + 16 }]}>
      <View style={styles.header}>
        <BackButton fallback={routes.home()} />
        <View style={styles.headerCenter}>
          <UiText style={styles.title} numberOfLines={1} accessibilityRole="header">
            مُرَاجَعَة الْيَوْم
          </UiText>
          {total > 0 ? (
            <UiText style={styles.subtitle} numberOfLines={1}>
              {total} عناصر
            </UiText>
          ) : null}
        </View>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {current ? (
          <View style={styles.round}>
            <ProgressDots count={queue.length} current={index} color={colors.success} />
            <ReviewRound item={current} attemptKey={`review:${index}`} onAnswer={onAnswer} />
          </View>
        ) : (
          <ReviewCompleteCard score={total > 0 ? { correct: session.correct, total } : undefined} />
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
  headerCenter: { alignItems: "center", flex: 1 },
  headerSpacer: { width: 44 },
  title: { fontSize: 17, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 12, fontWeight: "500", color: colors.muted },
  scrollContent: { flexGrow: 1, justifyContent: "center", paddingBottom: 24, gap: 16 },
  round: { flex: 1, gap: 16, paddingTop: 8 },
});
