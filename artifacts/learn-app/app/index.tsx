/**
 * Home screen: one large card per book of the Grade 1 catalog.
 */

import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { BookCard } from "@/components/BookCard";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { ScreenBackground } from "@/components/ScreenBackground";
import { StarBadge } from "@/components/StarBadge";
import { UiText } from "@/components/UiText";
import { books } from "@/content";
import { useLanguage } from "@/context/LanguageContext";
import { useProgress } from "@/context/ProgressContext";
import { useScreenPadding } from "@/hooks/useScreenPadding";
import { routes } from "@/lib/routes";
import { colors } from "@/theme/tokens";

export default function HomeScreen() {
  const { t } = useLanguage();
  const { progress } = useProgress();
  const pad = useScreenPadding();

  return (
    <ScreenBackground style={[styles.container, { paddingTop: pad.top + 8 }]}>
      <LanguageSwitch />
      <View style={styles.header}>
        <View style={styles.badges}>
          <StarBadge stars={progress.totalStars} />
          {/* Task 5.5: StreakBadge goes here, beside the star badge. */}
        </View>
        <View style={styles.userRow}>
          <Text style={styles.userName} numberOfLines={1}>
            {t("أهلاً")}
          </Text>
          <Text style={styles.appTitle}>أَقْرَأُ وَأَتَعَلَّمُ</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.list, { paddingBottom: pad.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Task 5.5: ContinueCard and ReviewCard go here, above the book cards. */}
        <UiText style={styles.subtitle}>اختَر الكتاب</UiText>
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onPress={() => {
              if (book.available) router.push(routes.book(book.id));
            }}
          />
        ))}
        <UiText style={styles.footer}>أنت رائع! 🌟</UiText>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, alignItems: "center" },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  badges: { flexDirection: "row", alignItems: "center", gap: 8 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  userName: { fontSize: 16, fontWeight: "700", color: colors.text, maxWidth: 80 },
  appTitle: { fontSize: 24, fontWeight: "800", color: colors.text, textAlign: "right" },
  scroll: { width: "100%" },
  list: { gap: 16, paddingTop: 4 },
  subtitle: { fontSize: 16, color: colors.warmText, textAlign: "center", marginTop: 4, fontWeight: "700" },
  footer: { fontSize: 18, color: colors.warmDeep, marginTop: 4, textAlign: "center", fontWeight: "700" },
});
