import { router, type Href } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { goBackOr } from "@/components/BackButton";
import { UiText } from "@/components/UiText";
import type { Lesson } from "@/content/types";
import { useLanguage } from "@/context/LanguageContext";
import { routes } from "@/lib/routes";
import { colors, pillPlate, touchTarget } from "@/theme/tokens";

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
  const { language, t } = useLanguage();
  return (
    <View style={styles.content} testID="lesson-complete">
      <View style={styles.starsRow} accessible accessibilityLabel={`${stars} / ${MAX_STARS} ⭐`}>
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
        accessibilityLabel={t("إعادة الدرس")}
        style={({ pressed }) => [styles.button, { backgroundColor: color }, pressed && styles.pressed]}
        onPress={onRepeat}
      >
        <View style={styles.plate}>
          <UiText style={styles.buttonText}>إعادة الدرس</UiText>
        </View>
      </Pressable>

      {next ? (
        <Pressable
          testID="next-lesson"
          accessibilityRole="button"
          accessibilityLabel={`${t("النشاط التالي:")} ${next.title}`}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: color },
            pressed && styles.pressed,
          ]}
          onPress={() => router.replace(routes.lesson(next.id))}
        >
          {/* Arabic reads right to left: label first on the right, arrow last on the left. */}
          <View style={[styles.plate, styles.nextRow, { flexDirection: language === "en" ? "row" : "row-reverse" }]}>
            <UiText style={styles.buttonText}>النشاط التالي:</UiText>
            <Text style={styles.buttonText}>{next.title}</Text>
            <Text style={styles.buttonText}>{language === "en" ? "→" : "←"}</Text>
          </View>
        </Pressable>
      ) : (
        <UiText testID="unit-finished" style={styles.celebration}>
          🎉 أتممت الوحدة!
        </UiText>
      )}

      <Pressable testID="back-to-list" accessibilityRole="button" accessibilityLabel={t("العودة إلى القائمة")} style={styles.backLink} onPress={() => goBackOr(backTo)}>
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
  text: { fontSize: 15, color: colors.mutedStrong, textAlign: "center" },
  button: { borderRadius: 16, paddingVertical: 10, paddingHorizontal: 20, alignItems: "center", justifyContent: "center", marginTop: 16, minHeight: touchTarget },
  plate: pillPlate,
  nextRow: { gap: 6, flexWrap: "wrap", justifyContent: "center" },
  buttonText: { fontSize: 16, fontWeight: "800", color: colors.text, textAlign: "center" },
  celebration: { fontSize: 22, fontWeight: "900", color: colors.text, textAlign: "center", marginTop: 16 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  backLink: { marginTop: 8, paddingHorizontal: 8, minHeight: touchTarget, justifyContent: "center" },
  backLinkText: { fontSize: 14, color: colors.text, fontWeight: "600" },
});
