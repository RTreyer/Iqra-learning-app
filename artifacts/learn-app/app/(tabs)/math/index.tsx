/**
 * Math module — list of counting, addition, and subtraction lessons.
 */

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "@/components/BackButton";
import { UiText } from "@/components/UiText";
import { UiChevron } from "@/components/UiChevron";
import { ScreenBackground } from "@/components/ScreenBackground";
import { mathLessons } from "@/constants/lessons";
import { useProgress } from "@/context/ProgressContext";

const LESSON_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  counting: "list",
  addition: "plus",
  subtraction: "minus",
};

const TYPE_LABELS: Record<string, string> = {
  counting: "عدّ",
  addition: "جمع",
  subtraction: "طرح",
};

export default function MathIndexScreen() {
  const insets = useSafeAreaInsets();
  const { getLessonProgress } = useProgress();

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  return (
    <ScreenBackground variant="math" style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <BackButton />
        <UiText style={styles.title}>حِسَاب</UiText>
        <Feather name="hash" size={28} color="#059669" />
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {mathLessons.map((lesson, index) => {
          const prog = getLessonProgress(lesson.id);
          const icon = LESSON_ICONS[lesson.type] ?? "circle";
          const typeLabel = TYPE_LABELS[lesson.type] ?? "";
          return (
            <Pressable
              key={lesson.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => router.push(`/(tabs)/math/${lesson.id}`)}
            >
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Feather name={icon} size={28} color="#059669" />
                </View>
                <View style={styles.textGroup}>
                  <Text style={styles.cardTitle}>{lesson.title}</Text>
                  <UiText style={styles.typeLabel}>{typeLabel}</UiText>
                </View>
              </View>
              <View style={styles.cardRight}>
                {prog.completed ? (
                  <View style={styles.completedBadge}>
                    <Feather name="check" size={16} color="#FFFFFF" />
                  </View>
                ) : (
                  <UiChevron size={24} color="#CBD5E1" />
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 26, fontWeight: "800", color: "#1E293B" },
  list: { paddingHorizontal: 20, paddingTop: 8, gap: 16 },
  card: {
    backgroundColor: "rgba(255,255,255,0.82)", borderRadius: 20, padding: 20,
    flexDirection: "row", alignItems: "center",
    shadowColor: "#059669", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  numberBadge: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#D1FAE5",
    alignItems: "center", justifyContent: "center", marginLeft: 12,
  },
  numberText: { fontSize: 18, fontWeight: "700", color: "#059669" },
  cardContent: {
    flex: 1, flexDirection: "row", alignItems: "center",
    gap: 12, justifyContent: "center",
  },
  iconCircle: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: "#D1FAE5",
    alignItems: "center", justifyContent: "center",
  },
  textGroup: { alignItems: "flex-end", gap: 2 },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#1E293B", textAlign: "right" },
  typeLabel: { fontSize: 13, color: "#059669", fontWeight: "600" },
  cardRight: { marginRight: 4 },
  completedBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#10B981", alignItems: "center", justifyContent: "center",
  },
});
