/**
 * Book screen — module selector (Reading / Math / Writing).
 * Passes bookId as query param to reading/index so it shows the right lessons.
 * Books with no modules yet show a "coming soon" card.
 */

import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "@/components/BackButton";
import { UiText } from "@/components/UiText";
import { ScreenBackground } from "@/components/ScreenBackground";
import { grades } from "@/constants/grades";
import { mathLessons, readingLessons, writingLessons } from "@/constants/lessons";
import { part2ReadingLessons } from "@/constants/lessons-part2";
import { useProgress } from "@/context/ProgressContext";
import { useLanguage } from "@/context/LanguageContext";

type ModuleConfig = {
  key: string;
  label: string;
  color: string;
  route: string;
  done: number;
  total: number;
  emoji: string;
};

export default function BookScreen() {
  const { t } = useLanguage();
  const { grade: gradeId, bookId } = useLocalSearchParams<{ grade: string; bookId: string }>();
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();

  const grade = grades.find((g) => g.id === gradeId);
  const book = grade?.books.find((b) => b.id === bookId);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  if (!grade || !book) {
    return (
      <ScreenBackground variant="home" style={styles.centered}>
        <UiText style={{ fontSize: 18, color: "#64748B" }}>الكتاب غير موجود</UiText>
      </ScreenBackground>
    );
  }

  // Pick the right reading lesson set based on bookId
  const isPartTwo = bookId === "arabic-1-part2";
  const bookReadingLessons = isPartTwo ? part2ReadingLessons : readingLessons;

  // Build module list from book definition
  const modules: ModuleConfig[] = [];

  if (book.modules.includes("reading")) {
    modules.push({
      key: "reading",
      label: "قِرَاءَة",
      color: "#2563EB",
      route: `/(tabs)/reading?bookId=${bookId}`,
      done: bookReadingLessons.filter((l) => progress.lessons[l.id]?.completed).length,
      total: bookReadingLessons.length,
      emoji: "📖",
    });
  }
  if (book.modules.includes("writing")) {
    modules.push({
      key: "writing",
      label: "كِتَابَة",
      color: "#7C3AED",
      route: "/(tabs)/writing",
      done: writingLessons.filter((l) => progress.lessons[l.id]?.completed).length,
      total: writingLessons.length,
      emoji: "✏️",
    });
  }
  if (book.modules.includes("math")) {
    modules.push({
      key: "math",
      label: "حِسَاب",
      color: "#059669",
      route: "/(tabs)/math",
      done: mathLessons.filter((l) => progress.lessons[l.id]?.completed).length,
      total: mathLessons.length,
      emoji: "🔢",
    });
  }
  if (book.modules.includes("unit1")) {
    const { unit1Lessons } = require("@/constants/unit1Lessons");
    modules.push({
      key: "unit1",
      label: "الوحدة الأولى",
      color: "#059669",
      route: "/(tabs)/unit1",
      done: (unit1Lessons as Array<{ id: string }>).filter((l) => progress.lessons[l.id]?.completed).length,
      total: (unit1Lessons as Array<{ id: string }>).length,
      emoji: "🌱",
    });
  }
  // Units 2–8 — dynamic lookup from allUnitsLessons
  {
    const { allUnitsLessons } = require("@/constants/allUnitsLessons") as { allUnitsLessons: Array<{ id: string; title: string; emoji: string; color: string; lessons: Array<{ id: string }> }> };
    for (let n = 2; n <= 8; n++) {
      const key = `unit${n}` as "unit2" | "unit3" | "unit4" | "unit5" | "unit6" | "unit7" | "unit8";
      if (book.modules.includes(key)) {
        const unit = allUnitsLessons.find((u) => u.id === String(n));
        if (unit) {
          const done = unit.lessons.filter((l) => progress.lessons[l.id]?.completed).length;
          modules.push({ key, label: unit.title, color: unit.color, route: `/(tabs)/unit/${n}`, done, total: unit.lessons.length, emoji: unit.emoji });
        }
      }
    }
  }

  const hasModules = modules.length > 0;

  return (
    <ScreenBackground
      variant="home"
      style={[styles.container, { paddingTop: topPad + 4, paddingBottom: botPad + 16 }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerCenter}>
          <Text style={styles.bookEmoji}>{book.emoji}</Text>
          <UiText style={styles.bookTitle} numberOfLines={1}>{book.title}</UiText>
        </View>
        <View style={styles.starsRow}>
          <Text style={styles.starEmoji}>⭐</Text>
          <Text style={styles.starsCount}>{progress.totalStars}</Text>
        </View>
      </View>

      {/* Book info card */}
      <View style={[styles.bookBanner, { backgroundColor: book.color }]}>
        <Text style={styles.bannerEmoji}>{book.emoji}</Text>
        <View style={styles.bannerText}>
          <UiText style={styles.bannerSubject}>{book.subtitle}</UiText>
          <UiText style={styles.bannerTitle}>{book.title}</UiText>
          <Text style={styles.bannerGrade}>{grade.label}</Text>
        </View>
      </View>

      {hasModules ? (
        <>
          <UiText style={styles.subtitle}>اختَر ماذا تريد أن تتعلّم اليوم</UiText>

          {/* Module buttons */}
          <View style={styles.buttonsContainer}>
            {modules.map((mod) => (
              <Pressable
                key={mod.key}
                style={({ pressed }) => [
                  styles.moduleButton,
                  { backgroundColor: mod.color },
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => router.push(mod.route as any)}
                accessibilityLabel={t(mod.label)}
              >
                <Text style={styles.moduleButtonEmoji}>{mod.emoji}</Text>
                <UiText style={styles.moduleLabel}>{mod.label}</UiText>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressText}>
                    {mod.done} / {mod.total}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          <UiText style={styles.footer}>هيّا نتعلّم! 🌟</UiText>
        </>
      ) : (
        <View style={styles.comingSoonBox}>
          <Text style={styles.comingSoonEmoji}>🚀</Text>
          <UiText style={styles.comingSoonTitle}>قريباً!</UiText>
          <UiText style={styles.comingSoonText}>
            سيتوفر محتوى هذا الكتاب قريباً، تابع معنا!
          </UiText>
        </View>
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, alignItems: "center" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  bookEmoji: { fontSize: 22 },
  bookTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B", flexShrink: 1 },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  starEmoji: { fontSize: 18 },
  starsCount: { fontSize: 18, fontWeight: "700", color: "#92400E" },
  bookBanner: {
    width: "100%",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  bannerEmoji: { fontSize: 52 },
  bannerText: { flex: 1, gap: 2 },
  bannerSubject: { fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: "600" },
  bannerTitle: { fontSize: 22, fontWeight: "900", color: "#FFFFFF", lineHeight: 28 },
  bannerGrade: { fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: "600" },
  subtitle: {
    fontSize: 15,
    color: "#5C4A00",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "700",
  },
  buttonsContainer: {
    flex: 1,
    width: "100%",
    gap: 14,
    justifyContent: "center",
    maxHeight: 380,
  },
  moduleButton: {
    flex: 1,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
    position: "relative",
  },
  buttonPressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  moduleButtonEmoji: { fontSize: 32 },
  moduleLabel: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },
  progressBadge: {
    position: "absolute",
    bottom: 12,
    right: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  progressText: { fontSize: 13, fontWeight: "600", color: "#FFFFFF" },
  footer: {
    fontSize: 18,
    color: "#78350F",
    marginTop: 14,
    textAlign: "center",
    fontWeight: "700",
  },
  comingSoonBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  comingSoonEmoji: { fontSize: 64 },
  comingSoonTitle: { fontSize: 28, fontWeight: "900", color: "#1E293B" },
  comingSoonText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "500",
  },
});
