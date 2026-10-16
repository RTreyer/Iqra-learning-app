/**
 * Today's review: plays the items due today once each, repeats wrong ones once at the end,
 * and records only the first answer of every item.
 */

import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ReviewRound } from "@/components/activities/ReviewRound";
import { ProgressDots } from "@/components/activities/shared/ProgressDots";
import { BackButton } from "@/components/BackButton";
import { ReviewCompleteCard } from "@/components/ReviewCompleteCard";
import { ScreenBackground } from "@/components/ScreenBackground";
import { UiText } from "@/components/UiText";
import { useLanguage } from "@/context/LanguageContext";
import { useProgress } from "@/context/ProgressContext";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import { itemsLabel } from "@/lib/labels";
import { routes } from "@/lib/routes";
import { allItems, type ReviewItem } from "@/lib/reviewItems";
import { colors, touchTarget } from "@/theme/tokens";

type Session = {
  /** Items to play in order; a wrong first answer appends its item once (due ids are unique). */
  queue: ReviewItem[];
  /** Number of distinct items in the session: the score denominator and the progress goal. */
  total: number;
  index: number;
  /** First answers that were right. */
  correct: number;
};

function startSession(ids: string[]): Session {
  const catalog = allItems();
  const queue = ids.flatMap((id) => {
    const item = catalog.get(id);
    return item ? [item] : [];
  });
  return { queue, total: queue.length, index: 0, correct: 0 };
}

function ReviewSession({ initialIds }: { initialIds: string[] }) {
  const { recordReview } = useProgress();
  const { language } = useLanguage();
  // Built once: later changes to the due list (answers recorded here) do not reshuffle the session.
  const [session, setSession] = useState(() => startSession(initialIds));
  const { queue, total, index } = session;
  const current = queue[index];

  // Recorded at the tap, so leaving during the advance delay keeps the answer.
  const onFirstTap = (correct: boolean) => {
    if (!current || index >= total) return;
    recordReview(current.id, correct);
    setSession((s) => ({
      ...s,
      queue: correct ? s.queue : [...s.queue, current],
      correct: s.correct + (correct ? 1 : 0),
    }));
  };
  const onAdvance = () => setSession((s) => ({ ...s, index: s.index + 1 }));

  return (
    <>
      {total > 0 ? (
        <Text style={styles.count} numberOfLines={1}>
          {itemsLabel(total, language)}
        </Text>
      ) : null}
      {current ? (
        <View style={styles.round}>
          <ProgressDots count={total} current={Math.min(index, total - 1)} color={colors.success} />
          <ReviewRound item={current} attemptKey={`review:${index}`} onFirstTap={onFirstTap} onAdvance={onAdvance} />
        </View>
      ) : (
        <ReviewCompleteCard score={total > 0 ? { correct: session.correct, total } : undefined} />
      )}
    </>
  );
}

export default function ReviewScreen() {
  const { getDueItemIds, hydrated, loadSettled } = useProgress();
  const pad = useScreenPadding();
  const { language } = useLanguage();

  return (
    <ScreenBackground subject="home" style={[styles.screen, { paddingTop: pad.top, paddingBottom: pad.bottom + 16 }]}>
      <View style={[styles.header, { flexDirection: language === "en" ? "row" : "row-reverse" }]}>
        <BackButton fallback={routes.home()} />
        <UiText style={styles.title} numberOfLines={1} accessibilityRole="header">
          مُرَاجَعَة الْيَوْم
        </UiText>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Wait for stored progress; a load that failed for good still ends in the session (from memory). */}
        {hydrated || loadSettled ? <ReviewSession initialIds={getDueItemIds(new Date())} /> : null}
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
  headerSpacer: { width: touchTarget },
  title: { flex: 1, fontSize: 17, fontWeight: "800", color: colors.text, textAlign: "center" },
  count: { fontSize: 13, fontWeight: "600", color: colors.mutedStrong, textAlign: "center" },
  scrollContent: { flexGrow: 1, justifyContent: "center", paddingBottom: 24, gap: 16 },
  round: { flex: 1, gap: 16, paddingTop: 8 },
});
