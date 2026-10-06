/**
 * Math lesson screen.
 * Counting: grid of emoji objects — tap the correct count.
 * Addition / Subtraction: dot groups + operator — tap the result.
 */

import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "@/components/BackButton";
import { UiText } from "@/components/UiText";
import { UiChevron } from "@/components/UiChevron";
import { ScreenBackground } from "@/components/ScreenBackground";
import { mathLessons } from "@/constants/lessons";
import { useProgress } from "@/context/ProgressContext";

let Speech: { speak: (text: string, options?: object) => void } | null = null;
try { Speech = require("expo-speech"); } catch { Speech = null; }

function speakArabic(text: string) {
  if (!Speech) return;
  try { Speech.speak(text, { language: "ar", rate: 0.85 }); } catch {}
}

function DotGroup({ count, color }: { count: number; color: string }) {
  return (
    <View style={styles.dotGroup}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.dot, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

export default function MathLessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { completeLesson, getLessonProgress } = useProgress();

  const lesson = mathLessons.find((l) => l.id === id);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const prog = getLessonProgress(id ?? "");
  const isCorrect = selected === lesson?.answer;

  useEffect(() => {
    if (lesson) {
      const t = setTimeout(() => speakArabic(lesson.ttsLearn), 500);
      return () => clearTimeout(t);
    }
  }, [lesson]);

  const handleAnswer = useCallback(
    (opt: number) => {
      if (selected !== null || !lesson) return;
      setSelected(opt);
      setShowResult(true);
      Animated.timing(feedbackAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      if (opt === lesson.answer) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        speakArabic("أحسنت! ممتاز!");
        completeLesson(id!, lesson.stars);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        speakArabic("حاول مجدداً");
      }
    },
    [selected, lesson, id, completeLesson, feedbackAnim]
  );

  const handleNext = useCallback(() => {
    const idx = mathLessons.findIndex((l) => l.id === id);
    const next = mathLessons[idx + 1];
    if (next) router.replace(`/(tabs)/math/${next.id}`);
    else router.push("/(tabs)/math");
  }, [id]);

  const handleRetry = useCallback(() => {
    setSelected(null);
    setShowResult(false);
    feedbackAnim.setValue(0);
    if (lesson) speakArabic(lesson.ttsQuestion);
  }, [lesson, feedbackAnim]);

  if (!lesson) return <View style={styles.centered}><Text>Lesson not found</Text></View>;

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  return (
    <ScreenBackground
      variant="math"
      style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}
    >
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        {prog.completed
          ? <Feather name="check-circle" size={24} color="#10B981" />
          : <View style={{ width: 24 }} />}
      </View>

      {/* Visual content */}
      <View style={styles.visualArea}>
        {lesson.type === "counting" && (
          <View style={styles.countingGrid}>
            {Array.from({ length: lesson.count ?? 0 }).map((_, i) => (
              <Text key={i} style={styles.countEmoji}>{lesson.countEmoji}</Text>
            ))}
          </View>
        )}
        {(lesson.type === "addition" || lesson.type === "subtraction") && (
          <View style={styles.arithmeticVisual}>
            <DotGroup count={lesson.num1 ?? 0} color="#059669" />
            <Text style={styles.operatorSymbol}>{lesson.operator}</Text>
            <DotGroup count={lesson.num2 ?? 0} color="#F59E0B" />
            <Text style={styles.operatorSymbol}>=</Text>
            <Text style={styles.questionMark}>؟</Text>
          </View>
        )}
      </View>

      {/* Question */}
      <Pressable style={styles.questionRow} onPress={() => speakArabic(lesson.ttsQuestion)}>
        <Feather name="volume-2" size={22} color="#059669" />
        <Text style={styles.questionText}>{lesson.ttsQuestion}</Text>
      </Pressable>

      {/* Options */}
      <View style={styles.optionsRow}>
        {lesson.options.map((opt) => {
          let btnStyle = styles.optionBtn;
          let textStyle = styles.optionText;
          if (selected !== null) {
            if (opt === lesson.answer) {
              btnStyle = { ...styles.optionBtn, ...styles.optionCorrect };
              textStyle = { ...styles.optionText, color: "#FFFFFF" };
            } else if (opt === selected) {
              btnStyle = { ...styles.optionBtn, ...styles.optionWrong };
              textStyle = { ...styles.optionText, color: "#FFFFFF" };
            }
          }
          return (
            <Pressable
              key={opt}
              style={({ pressed }) => [btnStyle, pressed && selected === null && styles.optionPressed]}
              onPress={() => handleAnswer(opt)}
              disabled={selected !== null}
            >
              <Text style={textStyle}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>

      {showResult && (
        <Animated.View style={[styles.feedbackArea, { opacity: feedbackAnim }]}>
          {isCorrect ? (
            <View style={styles.successFeedback}>
              <Text style={styles.feedbackEmoji}>🌟🌟🌟</Text>
              <Text style={styles.feedbackTextSuccess}>أحسنت!</Text>
              <Pressable style={styles.nextBtn} onPress={handleNext}>
                <UiChevron size={26} color="#FFFFFF" />
                <UiText style={styles.nextBtnText}>
                  {mathLessons.findIndex((l) => l.id === id) < mathLessons.length - 1
                    ? "الدرس التالي" : "العودة"}
                </UiText>
              </Pressable>
            </View>
          ) : (
            <View style={styles.retryFeedback}>
              <Text style={styles.feedbackTextRetry}>حاول مجدداً 💪</Text>
              <Pressable style={styles.retryBtn} onPress={handleRetry}>
                <Feather name="refresh-cw" size={20} color="#FFFFFF" />
                <UiText style={styles.retryBtnText}>مرة أخرى</UiText>
              </Pressable>
            </View>
          )}
        </Animated.View>
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  lessonTitle: { fontSize: 22, fontWeight: "700", color: "#1E293B" },
  visualArea: {
    flex: 1, alignItems: "center", justifyContent: "center",
    minHeight: 160, maxHeight: 220,
  },
  countingGrid: {
    flexDirection: "row", flexWrap: "wrap",
    justifyContent: "center", gap: 12, maxWidth: 240,
  },
  countEmoji: { fontSize: 52 },
  arithmeticVisual: {
    flexDirection: "row", alignItems: "center",
    gap: 12, flexWrap: "wrap", justifyContent: "center",
  },
  dotGroup: {
    flexDirection: "row", flexWrap: "wrap",
    gap: 8, maxWidth: 100, justifyContent: "center",
  },
  dot: { width: 28, height: 28, borderRadius: 14 },
  operatorSymbol: { fontSize: 40, fontWeight: "800", color: "#475569" },
  questionMark: { fontSize: 52, fontWeight: "800", color: "#059669" },
  questionRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(209,250,229,0.9)", borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20,
  },
  questionText: { fontSize: 20, fontWeight: "600", color: "#065F46", flex: 1 },
  optionsRow: { flexDirection: "row", justifyContent: "center", gap: 16, marginBottom: 20 },
  optionBtn: {
    width: 88, height: 88, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 2, borderColor: "#CBD5E1",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  optionPressed: { transform: [{ scale: 0.95 }], opacity: 0.85 },
  optionCorrect: { backgroundColor: "#10B981", borderColor: "#10B981" },
  optionWrong: { backgroundColor: "#F87171", borderColor: "#F87171" },
  optionText: { fontSize: 36, fontWeight: "800", color: "#059669" },
  feedbackArea: { alignItems: "center", marginBottom: 8 },
  successFeedback: { alignItems: "center", gap: 8 },
  feedbackEmoji: { fontSize: 36 },
  feedbackTextSuccess: { fontSize: 28, fontWeight: "800", color: "#059669" },
  nextBtn: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#059669",
    borderRadius: 18, paddingHorizontal: 24, paddingVertical: 14, gap: 8,
    shadowColor: "#059669", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  nextBtnText: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
  retryFeedback: { alignItems: "center", gap: 12 },
  feedbackTextRetry: { fontSize: 22, fontWeight: "700", color: "#D97706" },
  retryBtn: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#F59E0B",
    borderRadius: 16, paddingHorizontal: 22, paddingVertical: 12, gap: 8,
  },
  retryBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
});
