/**
 * Reading lesson screen — works for both Part 1 (r*) and Part 2 (p2r*) lessons.
 * Phase 1 — Learn: letter → full story → vocabulary cards → quiz button.
 * Phase 2 — Quiz: choose the correct word from options.
 */

import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
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
import { readingLessons } from "@/constants/lessons";
import { part2ReadingLessons } from "@/constants/lessons-part2";
import { useProgress } from "@/context/ProgressContext";

let Speech: { speak: (text: string, options?: object) => void } | null = null;
try { Speech = require("expo-speech"); } catch { Speech = null; }

function speakArabic(text: string) {
  if (!Speech) return;
  try { Speech.speak(text, { language: "ar", rate: 0.82 }); } catch {}
}

// Combined pool: look up any lesson by id regardless of part
const allReadingLessons = [...readingLessons, ...part2ReadingLessons];

export default function ReadingLessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { completeLesson, getLessonProgress } = useProgress();

  const lesson = allReadingLessons.find((l) => l.id === id);

  // Determine which pool this lesson belongs to (for next-lesson navigation)
  const isPart2 = id?.startsWith("p2");
  const lessonPool = isPart2 ? part2ReadingLessons : readingLessons;

  const [phase, setPhase] = useState<"learn" | "quiz">("learn");
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const bounceAnim = useRef(new Animated.Value(1)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const prog = getLessonProgress(id ?? "");
  const isCorrect = selected === lesson?.answer;

  useEffect(() => {
    if (lesson) {
      const t = setTimeout(() => speakArabic(lesson.ttsLetter), 400);
      return () => clearTimeout(t);
    }
  }, [lesson]);

  const handleSpeakLetter = useCallback(() => {
    if (!lesson) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    speakArabic(lesson.ttsLetter);
    Animated.sequence([
      Animated.spring(bounceAnim, { toValue: 1.18, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [lesson, bounceAnim]);

  const handleGoToQuiz = useCallback(() => {
    setPhase("quiz");
    if (lesson) speakArabic(lesson.ttsQuestion);
  }, [lesson]);

  const handleAnswer = useCallback(
    (option: string) => {
      if (selected !== null) return;
      setSelected(option);
      setShowResult(true);
      Animated.timing(feedbackAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      if (option === lesson?.answer) {
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
    const idx = lessonPool.findIndex((l) => l.id === id);
    const next = lessonPool[idx + 1];
    if (next) {
      router.replace(`/(tabs)/reading/${next.id}`);
    } else {
      // Return to the reading index for the correct book
      router.push(isPart2 ? "/(tabs)/reading?bookId=arabic-1-part2" : "/(tabs)/reading");
    }
  }, [id, lessonPool, isPart2]);

  const handleRetry = useCallback(() => {
    setSelected(null);
    setShowResult(false);
    feedbackAnim.setValue(0);
    if (lesson) speakArabic(lesson.ttsQuestion);
  }, [lesson, feedbackAnim]);

  if (!lesson) return <View style={styles.centered}><Text>Lesson not found</Text></View>;

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  const isLastLesson = lessonPool.findIndex((l) => l.id === id) === lessonPool.length - 1;

  return (
    <ScreenBackground
      variant="reading"
      style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.lessonTitle} numberOfLines={1}>{lesson.title}</Text>
        {prog.completed
          ? <Feather name="check-circle" size={24} color="#10B981" />
          : <View style={{ width: 24 }} />}
      </View>

      {/* ── LEARN PHASE ── */}
      {phase === "learn" && (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.learnContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Big letter + speak */}
          <View style={styles.letterRow}>
            <View style={styles.letterCard}>
              <Text style={styles.bigLetter}>{lesson.letter}</Text>
            </View>
            <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
              <Pressable style={styles.speakBtn} onPress={handleSpeakLetter}>
                <Feather name="volume-2" size={30} color="#FFFFFF" />
              </Pressable>
            </Animated.View>
          </View>

          {/* Story card */}
          <Pressable
            style={styles.storyCard}
            onPress={() => speakArabic(lesson.fullStory)}
          >
            <View style={styles.storyHeader}>
              <Text style={styles.storyIcon}>📖</Text>
              <Text style={styles.storyLabel}>مِنَ القِصَّة</Text>
              <Feather name="volume-1" size={16} color="#6D28D9" />
            </View>
            <Text style={styles.storyText}>{lesson.fullStory}</Text>
          </Pressable>

          {/* Vocabulary cards */}
          <View style={styles.vocabSection}>
            <Text style={styles.vocabTitle}>كَلِمَات مُهِمَّة</Text>
            <View style={styles.vocabRow}>
              {lesson.vocabulary.map((v) => (
                <Pressable
                  key={v.word}
                  style={styles.vocabCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    speakArabic(v.word);
                  }}
                >
                  <Text style={styles.vocabEmoji}>{v.emoji}</Text>
                  <Text style={styles.vocabWord}>{v.word}</Text>
                  <Feather name="volume-1" size={12} color="#94A3B8" />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Example word card */}
          <Pressable style={styles.wordCard} onPress={() => speakArabic(lesson.ttsWord)}>
            <Text style={styles.wordEmoji}>{lesson.emoji}</Text>
            <Text style={styles.exampleWord}>{lesson.exampleWord}</Text>
            <View style={styles.wordSpeakHint}>
              <Feather name="volume-1" size={14} color="#64748B" />
              <UiText style={styles.wordSpeakHintText}>اِضغط للاستماع</UiText>
            </View>
          </Pressable>

          {/* Go to quiz */}
          <Pressable style={styles.nextBtn} onPress={handleGoToQuiz}>
            <UiChevron size={26} color="#FFFFFF" />
            <UiText style={styles.nextBtnText}>هيّا نختبر!</UiText>
          </Pressable>
        </ScrollView>
      )}

      {/* ── QUIZ PHASE ── */}
      {phase === "quiz" && (
        <View style={styles.quizContent}>
          <View style={styles.letterCardSmall}>
            <Text style={styles.bigLetter}>{lesson.letter}</Text>
          </View>

          <Pressable style={styles.questionRow} onPress={() => speakArabic(lesson.ttsQuestion)}>
            <Feather name="volume-2" size={20} color="#2563EB" />
            <Text style={styles.questionText}>{lesson.ttsQuestion}</Text>
          </Pressable>

          <View style={styles.optionsContainer}>
            {lesson.options.map((opt) => {
              let optStyle = styles.optionBtn;
              let optTextStyle = styles.optionText;
              if (selected !== null) {
                if (opt === lesson.answer) {
                  optStyle = { ...styles.optionBtn, ...styles.optionCorrect };
                  optTextStyle = { ...styles.optionText, color: "#FFFFFF" };
                } else if (opt === selected) {
                  optStyle = { ...styles.optionBtn, ...styles.optionWrong };
                  optTextStyle = { ...styles.optionText, color: "#FFFFFF" };
                }
              }
              return (
                <Pressable
                  key={opt}
                  style={({ pressed }) => [optStyle, pressed && selected === null && styles.optionPressed]}
                  onPress={() => handleAnswer(opt)}
                  disabled={selected !== null}
                >
                  <Text style={optTextStyle}>{opt}</Text>
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
                      {isLastLesson ? "العودة" : "الدرس التالي"}
                    </UiText>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.retryFeedback}>
                  <Text style={styles.feedbackTextRetry}>حاول مجدداً 💪</Text>
                  <Pressable style={styles.retryBtn} onPress={handleRetry}>
                    <Feather name="refresh-cw" size={20} color="#FFFFFF" />
                    <UiText style={styles.retryBtnText}>حاول مرة أخرى</UiText>
                  </Pressable>
                </View>
              )}
            </Animated.View>
          )}
        </View>
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  backBtn: { padding: 4 },
  lessonTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },

  // ── Learn phase ──
  scrollArea: { flex: 1 },
  learnContent: { gap: 16, paddingBottom: 32 },

  letterRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20 },
  letterCard: {
    width: 130,
    height: 130,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  bigLetter: { fontSize: 80, fontWeight: "800", color: "#2563EB", lineHeight: 100 },
  speakBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },

  storyCard: {
    backgroundColor: "rgba(237,233,254,0.92)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#C4B5FD",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  storyHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  storyIcon: { fontSize: 18 },
  storyLabel: { fontSize: 13, fontWeight: "700", color: "#6D28D9", flex: 1 },
  storyText: { fontSize: 19, fontWeight: "600", color: "#3B0764", textAlign: "right", lineHeight: 32 },

  vocabSection: { gap: 8 },
  vocabTitle: { fontSize: 14, fontWeight: "700", color: "#475569", textAlign: "center" },
  vocabRow: { flexDirection: "row", justifyContent: "center", gap: 10 },
  vocabCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 18,
    padding: 12,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  vocabEmoji: { fontSize: 30 },
  vocabWord: { fontSize: 18, fontWeight: "700", color: "#1E293B", textAlign: "center" },

  wordCard: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  wordEmoji: { fontSize: 40 },
  exampleWord: { fontSize: 32, fontWeight: "700", color: "#1E293B", textAlign: "center" },
  wordSpeakHint: { flexDirection: "row", alignItems: "center", gap: 4 },
  wordSpeakHintText: { fontSize: 12, color: "#64748B" },

  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 14,
    gap: 8,
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextBtnText: { fontSize: 19, fontWeight: "700", color: "#FFFFFF" },

  // ── Quiz phase ──
  quizContent: { flex: 1, alignItems: "center", justifyContent: "space-evenly", paddingVertical: 4 },
  letterCardSmall: {
    width: 100,
    height: 100,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(219,234,254,0.9)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  questionText: { fontSize: 19, fontWeight: "600", color: "#1E40AF" },
  optionsContainer: { flexDirection: "row", gap: 12, justifyContent: "center", flexWrap: "wrap" },
  optionBtn: {
    minWidth: 80,
    height: 80,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  optionPressed: { transform: [{ scale: 0.95 }], opacity: 0.85 },
  optionCorrect: { backgroundColor: "#10B981", borderColor: "#10B981" },
  optionWrong: { backgroundColor: "#F87171", borderColor: "#F87171" },
  optionText: { fontSize: 24, fontWeight: "800", color: "#2563EB", textAlign: "center" },
  feedbackArea: { width: "100%", alignItems: "center" },
  successFeedback: { alignItems: "center", gap: 10 },
  feedbackEmoji: { fontSize: 36 },
  feedbackTextSuccess: { fontSize: 26, fontWeight: "800", color: "#059669" },
  retryFeedback: { alignItems: "center", gap: 12 },
  feedbackTextRetry: { fontSize: 20, fontWeight: "700", color: "#D97706" },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B",
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
    gap: 8,
  },
  retryBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
});
