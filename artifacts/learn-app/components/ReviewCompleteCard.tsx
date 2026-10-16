import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { goBackOr } from "@/components/BackButton";
import { UiText } from "@/components/UiText";
import { routes } from "@/lib/routes";
import { colors, radius, shadow, spacing, touchTarget } from "@/theme/tokens";

type Props = {
  /** First answers that were right; omit for the "nothing due" card. */
  score?: { correct: number; total: number };
};

/** End of a review session, or the card shown when nothing is due. No stars: review is practice. */
export function ReviewCompleteCard({ score }: Props) {
  return (
    <View style={styles.card} testID={score ? "review-complete" : "review-empty"}>
      <Text style={styles.emoji}>{score ? "🎉" : "🌙"}</Text>
      <UiText style={styles.title}>
        {score ? "أَحْسَنْت! مُرَاجَعَة الْيَوْم مُكْتَمِلَة" : "لا شَيْءَ لِلْمُرَاجَعَةِ الْيَوْم"}
      </UiText>
      {score ? (
        <Text style={styles.score} accessibilityLabel={`${score.correct} / ${score.total}`}>
          {`${score.correct}/${score.total}`}
        </Text>
      ) : null}
      <Pressable
        testID="review-back"
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={() => goBackOr(routes.home())}
      >
        <UiText style={styles.buttonText}>{score ? "تَابِعْ" : "العودة إلى الرئيسية"}</UiText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "center",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    ...shadow.card,
  },
  emoji: { fontSize: 56 },
  title: { fontSize: 22, fontWeight: "900", color: colors.text, textAlign: "center" },
  score: { fontSize: 36, fontWeight: "900", color: colors.success },
  button: {
    marginTop: spacing.md,
    minHeight: touchTarget,
    justifyContent: "center",
    borderRadius: 16,
    paddingHorizontal: 28,
    backgroundColor: colors.success,
  },
  buttonText: { fontSize: 16, fontWeight: "800", color: colors.white, textAlign: "center" },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
});
