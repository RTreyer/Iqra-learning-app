import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { UiChevron } from "@/components/UiChevron";
import { UiText } from "@/components/UiText";
import type { Book } from "@/content/types";
import { useLanguage } from "@/context/LanguageContext";

type Props = { book: Book; onPress: () => void };

/** Large colored home card; unavailable books show "قريباً" and do not respond. */
export function BookCard({ book, onPress }: Props) {
  const { t } = useLanguage();
  return (
    <Pressable
      testID={`book-${book.id}`}
      accessibilityRole="button"
      accessibilityLabel={t(book.title)}
      accessibilityState={{ disabled: !book.available }}
      disabled={!book.available}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: book.color },
        !book.available && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.emoji}>{book.emoji}</Text>
      <View style={styles.info}>
        <UiText style={styles.title}>{book.title}</UiText>
        <UiText style={styles.subtitle}>{book.subtitle}</UiText>
      </View>
      {book.available ? (
        <UiChevron size={28} color="rgba(255,255,255,0.9)" />
      ) : (
        <View style={styles.soonBadge}>
          <UiText style={styles.soonText}>قريباً</UiText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 120,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 22,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  emoji: { fontSize: 48 },
  info: { flex: 1, gap: 4 },
  title: { fontSize: 26, fontWeight: "900", color: "#FFFFFF" },
  subtitle: { fontSize: 14, fontWeight: "700", color: "rgba(255,255,255,0.85)" },
  soonBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  soonText: { fontSize: 13, fontWeight: "800", color: "#FFFFFF" },
});
