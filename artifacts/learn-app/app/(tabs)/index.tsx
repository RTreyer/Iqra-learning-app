/**
 * Home screen — grade selector (Klasse 1–6).
 * Children tap their grade to see available books.
 */

import { router } from "expo-router";
import React, { useState } from "react";
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenBackground } from "@/components/ScreenBackground";
import { grades } from "@/constants/grades";
import { useProgress } from "@/context/ProgressContext";
import { UiText } from "@/components/UiText";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useLanguage } from "@/context/LanguageContext";

const GRID_GAP = 14;
/** Card size the emoji/number/label font sizes were designed for. */
const DESIGN_CARD_SIZE = 180;

export default function HomeScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  // Size cards from the space the grid actually has, so all six fit both
  // narrow phones and short landscape/desktop windows without overlapping.
  const [gridBox, setGridBox] = useState<{ width: number; height: number } | null>(null);
  const onGridLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setGridBox((prev) =>
      prev && prev.width === width && prev.height === height ? prev : { width, height },
    );
  };
  // Pick 2 or 3 columns, whichever gives bigger cards in the available box.
  const { cardSize, columns } = (() => {
    if (!gridBox) return { cardSize: 0, columns: 2 };
    let best = { cardSize: 0, columns: 2 };
    for (const cols of [2, 3]) {
      const rows = Math.ceil(grades.length / cols);
      const size = Math.floor(
        Math.min(
          ((gridBox.width - GRID_GAP * (cols - 1)) / cols) * 0.92,
          (gridBox.height - GRID_GAP * (rows - 1)) / rows,
        ),
      );
      if (size > best.cardSize) best = { cardSize: size, columns: cols };
    }
    return best;
  })();
  const gridWidth = columns * cardSize + (columns - 1) * GRID_GAP;
  const fontScale = Math.min(1, cardSize / DESIGN_CARD_SIZE);

  return (
    <ScreenBackground
      variant="home"
      style={[styles.container, { paddingTop: topPad + 8, paddingBottom: botPad + 16 }]}
    >
      {/* Header */}
      <LanguageSwitch />
      <View style={styles.header}>
        <View style={styles.starsRow}>
          <Text style={styles.starEmoji}>⭐</Text>
          <Text style={styles.starsCount}>{progress.totalStars}</Text>
        </View>
        <View style={styles.userRow}>
          <Text style={styles.userName} numberOfLines={1}>
            {t("أهلاً")}
          </Text>
          <Text style={styles.appTitle}>أَقْرَأُ وَأَتَعَلَّمُ</Text>
        </View>
      </View>

      {/* Subtitle */}
      <UiText style={styles.subtitle}>اختَر صفّك</UiText>

      {/* Grade grid */}
      <View style={styles.gridArea} onLayout={onGridLayout}>
        <View style={[styles.grid, { width: gridWidth }]}>
          {cardSize > 0 && grades.map((grade) => (
            <Pressable
              key={grade.id}
              style={({ pressed }) => [
                styles.gradeCard,
                { width: cardSize, height: cardSize, backgroundColor: grade.color },
                pressed && styles.cardPressed,
              ]}
              onPress={() => router.push(`/(tabs)/grade/${grade.id}` as any)}
              accessibilityLabel={t(grade.label)}
            >
              <Text style={[styles.gradeEmoji, { fontSize: 40 * fontScale }]}>{grade.emoji}</Text>
              <Text
                style={[
                  styles.gradeNumber,
                  { fontSize: 48 * fontScale, lineHeight: 52 * fontScale },
                ]}
              >
                {grade.id}
              </Text>
              <UiText style={[styles.gradeLabel, { fontSize: Math.max(12, 15 * fontScale) }]}>
                {grade.label}
              </UiText>
            </Pressable>
          ))}
        </View>
      </View>

      <UiText style={styles.footer}>أنت رائع! 🌟</UiText>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "right",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  starEmoji: { fontSize: 20 },
  starsCount: { fontSize: 22, fontWeight: "700", color: "#92400E" },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    maxWidth: 80,
  },
  subtitle: {
    fontSize: 16,
    color: "#5C4A00",
    textAlign: "center",
    marginBottom: 16,
    marginTop: 4,
    fontWeight: "700",
  },
  gridArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
    justifyContent: "center",
  },
  gradeCard: {
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.96 }] },
  gradeEmoji: { fontSize: 40 },
  gradeNumber: {
    fontSize: 48,
    fontWeight: "900",
    color: "rgba(255,255,255,0.95)",
    lineHeight: 52,
  },
  gradeLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  footer: {
    fontSize: 18,
    color: "#78350F",
    marginTop: 12,
    textAlign: "center",
    fontWeight: "700",
  },
});
