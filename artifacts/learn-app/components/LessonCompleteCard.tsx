import { router, type Href } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { goBackOr } from "@/components/BackButton";
import { UiText } from "@/components/UiText";
import type { Lesson } from "@/content/types";
import { useLanguage } from "@/context/LanguageContext";
import { routes } from "@/lib/routes";
import { colors, touchTarget } from "@/theme/tokens";

const MAX_STARS = 3;

type Props = {
  /** Stars earned by this attempt, 1 to 3. */
  stars: number;
  onRepeat: () => void;
  /** Next lesson in the unit, or null when the unit is finished. */
  next: Lesson | null;
  /** The unit list, used when "back" has no history (web deep link). */
  backTo: Href;
  color?: string;
};

export function LessonCompleteCard({ stars, onRepeat, next, backTo, color = colors.success }: Props) {
  const { language } = useLanguage();
  return (
    <View style={styles.content} testID="lesson-complete">
      <View style={styles.starsRow} accessibilityLabel={`${stars} / ${MAX_STARS} ⭐`}>
        {Array.from({ length: MAX_STARS }, (_, i) => (
          <Text
            key={i}
            testID={i < stars ? "star-earned" : "star-dimmed"}
            style={[styles.star, i >= stars && styles.starDimmed]}
          >
            ⭐
          </Text>
        ))}
      </View>
      <UiText style={styles.title}>أَحْسَنْت!</UiText>
      <UiText style={styles.text}>لقد أتممت هذا النشاط بنجاح</UiText>

      <Pressable
        testID="repeat-lesson"
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, { backgroundColor: color }, pressed && styles.pressed]}
        onPress={onRepeat}
      >
        <UiText style={styles.buttonText}>إعادة الدرس</UiText>
      </Pressable>

      {next ? (
        <Pressable
          testID="next-lesson"
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            styles.nextRow,
            // Arabic reads right to left: label first on the right, arrow last on the left.
            { backgroundColor: color, flexDirection: language === "en" ? "row" : "row-reverse" },
            pressed && styles.pressed,
          ]}
          onPress={() => router.replace(routes.lesson(next.id))}
        >
          <UiText style={styles.buttonText}>النشاط التالي:</UiText>
          <Text style={styles.buttonText}>{next.title}</Text>
          <Text style={styles.buttonText}>{language === "en" ? "→" : "←"}</Text>
        </Pressable>
      ) : (
        <UiText testID="unit-finished" style={styles.celebration}>
          🎉 أتممت الوحدة!
        </UiText>
      )}

      <Pressable testID="back-to-list" accessibilityRole="button" style={styles.backLink} onPress={() => goBackOr(backTo)}>
        <UiText style={styles.backLinkText}>العودة إلى القائمة</UiText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 12 },
  starsRow: { flexDirection: "row", gap: 8 },
  star: { fontSize: 56 },
  starDimmed: { opacity: 0.2 },
  title: { fontSize: 36, fontWeight: "900", color: colors.text },
  text: { fontSize: 15, color: colors.muted, textAlign: "center" },
  button: { borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28, alignItems: "center", marginTop: 16 },
  nextRow: { gap: 6, flexWrap: "wrap", justifyContent: "center" },
  buttonText: { fontSize: 16, fontWeight: "800", color: colors.white, textAlign: "center" },
  celebration: { fontSize: 22, fontWeight: "900", color: colors.text, textAlign: "center", marginTop: 16 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  backLink: { marginTop: 8, paddingHorizontal: 8, minHeight: touchTarget, justifyContent: "center" },
  backLinkText: { fontSize: 14, color: colors.muted, fontWeight: "600" },
});
