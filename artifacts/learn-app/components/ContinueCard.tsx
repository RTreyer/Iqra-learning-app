import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { UiChevron } from "@/components/UiChevron";
import { UiText } from "@/components/UiText";
import { useLanguage } from "@/context/LanguageContext";
import type { NextLesson } from "@/lib/nextLesson";
import { colors, radius, shadow, subjects, touchTarget, withAlpha } from "@/theme/tokens";

type Props = { next: NextLesson; onPress: () => void };

/** Home guidance: the next lesson below three stars, tinted with its subject color. */
export function ContinueCard({ next, onPress }: Props) {
  const { t, language } = useLanguage();
  const { book, unit, lesson } = next;
  const accent = subjects[book.subject];
  const detail = `${t(unit.title)} · ${t(lesson.title)}`;
  const row = language === "en" ? "row" : "row-reverse";
  const align = language === "en" ? "flex-start" : "flex-end";
  return (
    <Pressable
      testID="continue-card"
      accessibilityRole="button"
      accessibilityLabel={`${t("تَابِعْ:")} ${detail}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: accent, flexDirection: row },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.emojiWrap, { backgroundColor: withAlpha(accent, 0.15) }]}>
        <Text style={styles.emoji}>{lesson.emoji}</Text>
      </View>
      <View style={[styles.info, { alignItems: align }]}>
        <UiText style={styles.label}>تَابِعْ:</UiText>
        <Text
          style={[styles.detail, { textAlign: language === "en" ? "left" : "right" }]}
          numberOfLines={2}
        >
          {detail}
        </Text>
      </View>
      <UiChevron size={24} color={accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: touchTarget + 40,
    borderRadius: radius.lg,
    borderWidth: 3,
    backgroundColor: colors.white,
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    ...shadow.card,
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  emojiWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 34 },
  info: { flex: 1, gap: 4 },
  label: { fontSize: 18, fontWeight: "900", color: colors.text },
  detail: { fontSize: 20, fontWeight: "800", color: colors.text },
});
