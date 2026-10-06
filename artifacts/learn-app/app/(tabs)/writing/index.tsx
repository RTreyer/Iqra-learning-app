/**
 * Writing module — list of letter-writing lessons.
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
import { writingLessons } from "@/constants/lessons";
import { useProgress } from "@/context/ProgressContext";

export default function WritingIndexScreen() {
  const insets = useSafeAreaInsets();
  const { getLessonProgress } = useProgress();

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  return (
    <ScreenBackground variant="writing" style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <BackButton />
        <UiText style={styles.title}>كِتَابَة</UiText>
        <Feather name="edit-3" size={28} color="#7C3AED" />
      </View>

      <View style={styles.hintRow}>
        <Feather name="info" size={16} color="#7C3AED" />
        <Text style={styles.hintText}>تَعَلَّم كيف تكتب الحرف بأصبعك أو على الورق</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {writingLessons.map((lesson, index) => {
          const prog = getLessonProgress(lesson.id);
          return (
            <Pressable
              key={lesson.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => router.push(`/(tabs)/writing/${lesson.id}`)}
            >
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.bigLetter}>{lesson.letter}</Text>
                <View style={styles.textGroup}>
                  <Text style={styles.cardTitle}>{lesson.title}</Text>
                  <Text style={styles.strokeHint}>
                    {lesson.strokeCount === 1 ? "خط واحد" : `${lesson.strokeCount} خطوط`}
                  </Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.emoji}>{lesson.emoji}</Text>
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
  hintRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: "rgba(237,233,254,0.85)", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  hintText: { fontSize: 14, color: "#5B21B6", flex: 1, textAlign: "right" },
  list: { paddingHorizontal: 20, paddingTop: 4, gap: 16 },
  card: {
    backgroundColor: "rgba(255,255,255,0.82)", borderRadius: 20, padding: 20,
    flexDirection: "row", alignItems: "center",
    shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  numberBadge: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#EDE9FE",
    alignItems: "center", justifyContent: "center", marginLeft: 12,
  },
  numberText: { fontSize: 18, fontWeight: "700", color: "#7C3AED" },
  cardContent: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 12,
  },
  bigLetter: { fontSize: 48, fontWeight: "800", color: "#7C3AED", lineHeight: 60 },
  textGroup: { alignItems: "flex-end", gap: 3 },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#1E293B", textAlign: "right" },
  strokeHint: { fontSize: 13, color: "#7C3AED", fontWeight: "600" },
  cardRight: { alignItems: "center", gap: 8, marginRight: 4 },
  emoji: { fontSize: 28 },
  completedBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#10B981", alignItems: "center", justifyContent: "center",
  },
});
