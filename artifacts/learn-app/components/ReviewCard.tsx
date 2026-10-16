import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { UiChevron } from "@/components/UiChevron";
import { UiText } from "@/components/UiText";
import { useLanguage } from "@/context/LanguageContext";
import { itemsLabel } from "@/lib/labels";
import { colors, radius, shadow, touchTarget } from "@/theme/tokens";

type Props = { count: number; onPress: () => void };

/** Home guidance: today's due review items. Shown only when something is due. */
export function ReviewCard({ count, onPress }: Props) {
  const { t, language } = useLanguage();
  const items = itemsLabel(count, language);
  return (
    <Pressable
      testID="review-card"
      accessibilityRole="button"
      accessibilityLabel={`${t("مُرَاجَعَة الْيَوْم")} · ${items}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { flexDirection: language === "en" ? "row" : "row-reverse" },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>🔁</Text>
      </View>
      <View style={[styles.info, { alignItems: language === "en" ? "flex-start" : "flex-end" }]}>
        <UiText style={styles.title}>مُرَاجَعَة الْيَوْم</UiText>
        <UiText style={styles.count}>{items}</UiText>
      </View>
      <UiChevron size={24} color={colors.starText} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: touchTarget + 32,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: colors.star,
    backgroundColor: colors.starSoft,
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    ...shadow.card,
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  emojiWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  emoji: { fontSize: 28 },
  info: { flex: 1, gap: 2 },
  title: { fontSize: 20, fontWeight: "900", color: colors.text },
  count: { fontSize: 16, fontWeight: "800", color: colors.starText },
});
