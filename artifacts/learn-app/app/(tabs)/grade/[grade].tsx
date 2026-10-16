/**
 * Grade screen — lists available books for a grade.
 * Books without content show a "coming soon" badge.
 */

import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "@/components/BackButton";
import { UiText } from "@/components/UiText";
import { UiChevron } from "@/components/UiChevron";
import { ScreenBackground } from "@/components/ScreenBackground";
import { grades } from "@/constants/grades";

export default function GradeScreen() {
  const { grade: gradeId } = useLocalSearchParams<{ grade: string }>();
  const insets = useSafeAreaInsets();

  const grade = grades.find((g) => g.id === gradeId);
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  if (!grade) {
    return (
      <ScreenBackground variant="home" style={styles.container}>
        <UiText style={styles.notFound}>الصف غير موجود</UiText>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground
      variant="home"
      style={[styles.container, { paddingTop: topPad }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerCenter}>
          <Text style={styles.gradeEmoji}>{grade.emoji}</Text>
          <UiText style={styles.gradeLabel}>{grade.label}</UiText>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <UiText style={styles.subtitle}>اختَر الكتاب</UiText>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: botPad + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {grade.books.map((book) => (
          <Pressable
            key={book.id}
            style={({ pressed }) => [
              styles.bookCard,
              !book.available && styles.bookCardDisabled,
              pressed && book.available && styles.cardPressed,
            ]}
            onPress={() => {
              if (book.available) {
                router.push(`/(tabs)/book/${grade.id}/${book.id}` as any);
              }
            }}
            disabled={!book.available}
          >
            {/* Book cover area */}
            <View style={[styles.bookCover, { backgroundColor: book.color }]}>
              <Text style={styles.bookEmoji}>{book.emoji}</Text>
            </View>

            {/* Book info */}
            <View style={styles.bookInfo}>
              <UiText style={styles.bookSubject}>{book.subtitle}</UiText>
              <UiText style={styles.bookTitle}>{book.title}</UiText>
              <UiText style={styles.gradeTag}>{grade.label}</UiText>
              <View style={styles.modulesRow}>
                {book.modules.includes("reading") && (
                  <View style={[styles.moduleBadge, { backgroundColor: "#DBEAFE" }]}>
                    <UiText style={[styles.moduleBadgeText, { color: "#1D4ED8" }]}>قراءة</UiText>
                  </View>
                )}
                {book.modules.includes("writing") && (
                  <View style={[styles.moduleBadge, { backgroundColor: "#EDE9FE" }]}>
                    <UiText style={[styles.moduleBadgeText, { color: "#6D28D9" }]}>كتابة</UiText>
                  </View>
                )}
                {book.modules.includes("math") && (
                  <View style={[styles.moduleBadge, { backgroundColor: "#D1FAE5" }]}>
                    <UiText style={[styles.moduleBadgeText, { color: "#065F46" }]}>حساب</UiText>
                  </View>
                )}
                {book.modules.includes("islamic") && (
                  <View style={[styles.moduleBadge, { backgroundColor: "#FEF3C7" }]}>
                    <UiText style={[styles.moduleBadgeText, { color: "#92400E" }]}>إسلامية</UiText>
                  </View>
                )}
              </View>
            </View>

            {/* Arrow or coming soon */}
            <View style={styles.bookRight}>
              {book.available ? (
                <UiChevron size={28} color="#94A3B8" />
              ) : (
                <View style={styles.soonBadge}>
                  <UiText style={styles.soonText}>قريباً</UiText>
                </View>
              )}
            </View>
          </Pressable>
        ))}

        {/* Encouragement for coming soon */}
        {grade.books.every((b) => !b.available) && (
          <View style={styles.comingSoonBox}>
            <Text style={styles.comingSoonEmoji}>🚀</Text>
            <UiText style={styles.comingSoonTitle}>قريباً!</UiText>
            <UiText style={styles.comingSoonText}>
              سيتوفر محتوى هذا الصف قريباً، تابع معنا!
            </UiText>
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, textAlign: "center", fontSize: 18, marginTop: 60, color: "#64748B" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { padding: 4 },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  gradeEmoji: { fontSize: 28 },
  gradeLabel: { fontSize: 22, fontWeight: "800", color: "#1E293B" },
  subtitle: {
    fontSize: 15,
    color: "#5C4A00",
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 2,
  },
  list: { paddingHorizontal: 20, gap: 18, paddingTop: 4 },
  bookCard: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  bookCardDisabled: { opacity: 0.6 },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  bookCover: {
    width: 90,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 130,
  },
  bookEmoji: { fontSize: 42 },
  bookInfo: { flex: 1, padding: 16, gap: 4 },
  bookSubject: { fontSize: 12, fontWeight: "600", color: "#64748B" },
  bookTitle: { fontSize: 20, fontWeight: "800", color: "#1E293B", lineHeight: 28 },
  gradeTag: { fontSize: 12, color: "#94A3B8", fontWeight: "500" },
  modulesRow: { flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" },
  moduleBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  moduleBadgeText: { fontSize: 12, fontWeight: "700" },
  bookRight: { paddingRight: 16, paddingLeft: 8 },
  soonBadge: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  soonText: { fontSize: 13, fontWeight: "700", color: "#94A3B8" },
  comingSoonBox: {
    alignItems: "center",
    marginTop: 24,
    padding: 32,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 24,
    gap: 8,
  },
  comingSoonEmoji: { fontSize: 48 },
  comingSoonTitle: { fontSize: 24, fontWeight: "800", color: "#1E293B" },
  comingSoonText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
  },
});
