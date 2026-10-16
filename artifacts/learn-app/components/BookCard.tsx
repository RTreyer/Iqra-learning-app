import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { UiChevron } from "@/components/UiChevron";
import { UiText } from "@/components/UiText";
import type { Book } from "@/content/types";
import { useLanguage } from "@/context/LanguageContext";
import { colors, readableFill, touchTarget, withAlpha } from "@/theme/tokens";

type Props = { book: Book; onPress: () => void };

/** Large colored home card; unavailable books show "قريباً" and do not respond. */
export function BookCard({ book, onPress }: Props) {
  const { t, language } = useLanguage();
  return (
    <Pressable
      testID={`book-${book.id}`}
      accessibilityRole="button"
      accessibilityLabel={book.available ? t(book.title) : `${t(book.title)}، ${t("قريباً")}`}
      accessibilityState={{ disabled: !book.available }}
      disabled={!book.available}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: readableFill(book.color), flexDirection: language === "en" ? "row" : "row-reverse" },
        !book.available && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.emoji}>{book.emoji}</Text>
      <View style={[styles.info, { alignItems: language === "en" ? "flex-start" : "flex-end" }]}>
        <UiText style={styles.title}>{book.title}</UiText>
        <View style={styles.label}>
          <UiText style={styles.labelText}>{book.subtitle}</UiText>
        </View>
      </View>
      {book.available ? (
        <UiChevron size={28} color={withAlpha(colors.white, 0.9)} />
      ) : (
        <View style={styles.label}>
          <UiText style={styles.labelText}>قريباً</UiText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: Math.max(120, touchTarget),
    borderRadius: 28,
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 22,
    paddingVertical: 18,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  emoji: { fontSize: 48 },
  info: { flex: 1, gap: 6 },
  title: { fontSize: 26, fontWeight: "900", color: colors.white },
  label: { backgroundColor: colors.pill, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  labelText: { fontSize: 13, fontWeight: "800", color: colors.text },
});
