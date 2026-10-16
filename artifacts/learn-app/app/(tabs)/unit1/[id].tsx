/**
 * الوحدة الأولى — individual activity lesson screen.
 * Handles 5 activity types: naming, listen_pick, behavior, matching, drawing.
 */

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
import { ScreenBackground } from "@/components/ScreenBackground";
import { unit1Lessons } from "@/constants/unit1Lessons";
import { useProgress } from "@/context/ProgressContext";
import { useLessonAttempt } from "@/hooks/useLessonAttempt";

let Speech: { speak: (text: string, options?: object) => void; stop: () => void } | null = null;
try { Speech = require("expo-speech"); } catch { Speech = null; }

function speakArabic(text: string) {
  if (!Speech) return;
  try {
    Speech.stop();
    Speech.speak(text, { language: "ar", rate: 0.8 });
  } catch {}
}

// ── Naming Activity ──────────────────────────────────────────────────────────

function NamingActivity({
  items,
  color,
  onComplete,
}: {
  items: { emoji: string; word: string }[];
  color: string;
  onComplete: () => void;
}) {
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const scales = useRef(items.map(() => new Animated.Value(1))).current;

  const handleTap = useCallback(
    (index: number, word: string) => {
      speakArabic(word);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTapped((prev) => new Set(prev).add(index));
      Animated.sequence([
        Animated.spring(scales[index], { toValue: 1.25, useNativeDriver: true, speed: 30 }),
        Animated.spring(scales[index], { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]).start();
    },
    [scales]
  );

  const allTapped = tapped.size >= items.length;

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.activityInstruction}>اضغط على كل صورة لتسمع اسمها 🔊</Text>
      <View style={styles.namingGrid}>
        {items.map((item, i) => (
          <Animated.View key={i} style={{ transform: [{ scale: scales[i] }] }}>
            <Pressable
              style={[
                styles.namingCard,
                tapped.has(i) && { borderColor: color, borderWidth: 3, backgroundColor: color + "18" },
              ]}
              onPress={() => handleTap(i, item.word)}
            >
              <Text style={styles.namingEmoji}>{item.emoji}</Text>
              <Text style={[styles.namingWord, tapped.has(i) && { color }]}>
                {item.word}
              </Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
      {allTapped && (
        <Pressable style={[styles.doneButton, { backgroundColor: color }]} onPress={onComplete}>
          <UiText style={styles.doneButtonText}>أَحْسَنْت! 🌟 تابع</UiText>
        </Pressable>
      )}
      {!allTapped && (
        <Text style={styles.hintText}>
          {items.length - tapped.size} صورة متبقية — اضغط عليها!
        </Text>
      )}
    </View>
  );
}

// ── Listen & Pick Activity ───────────────────────────────────────────────────

function ListenPickActivity({
  questions,
  color,
  onComplete,
}: {
  questions: { word: string; choices: { emoji: string; word: string }[]; correctIndex: number }[];
  color: string;
  onComplete: () => void;
}) {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const q = questions[qIndex];

  const handleListen = useCallback(() => {
    speakArabic(q.word);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(bounceAnim, { toValue: 1.2, useNativeDriver: true, speed: 30 }),
      Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  }, [q.word, bounceAnim]);

  useEffect(() => {
    const t = setTimeout(() => speakArabic(q.word), 400);
    return () => clearTimeout(t);
  }, [qIndex, q.word]);

  const handleChoice = useCallback(
    (idx: number) => {
      if (showResult) return;
      setSelected(idx);
      setShowResult(true);
      const correct = idx === q.correctIndex;
      if (correct) {
        setScore((s) => s + 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        speakArabic("أحسنت!");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        speakArabic(q.choices[q.correctIndex].word);
      }
    },
    [showResult, q]
  );

  const handleNext = useCallback(() => {
    if (qIndex + 1 >= questions.length) {
      onComplete();
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setShowResult(false);
    }
  }, [qIndex, questions.length, onComplete]);

  return (
    <View style={styles.activityContainer}>
      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {questions.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < qIndex && { backgroundColor: color },
              i === qIndex && { backgroundColor: color, width: 24 },
              i > qIndex && { backgroundColor: "#E2E8F0" },
            ]}
          />
        ))}
      </View>

      <Text style={styles.activityInstruction}>
        سؤال {qIndex + 1} من {questions.length}
      </Text>

      {/* Listen button */}
      <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
        <Pressable
          style={[styles.listenButton, { backgroundColor: color }]}
          onPress={handleListen}
        >
          <Text style={styles.listenButtonEmoji}>🔊</Text>
          <Text style={styles.listenButtonText}>{q.word}</Text>
          <UiText style={styles.listenButtonHint}>اضغط للاستماع</UiText>
        </Pressable>
      </Animated.View>

      {/* Choices */}
      <View style={styles.choicesRow}>
        {q.choices.map((choice, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === q.correctIndex;
          let bg = "#F8FAFC";
          let border = "#E2E8F0";
          if (showResult && isCorrect) { bg = "#D1FAE5"; border = "#059669"; }
          else if (showResult && isSelected && !isCorrect) { bg = "#FEE2E2"; border = "#EF4444"; }

          return (
            <Pressable
              key={idx}
              style={[styles.choiceCard, { backgroundColor: bg, borderColor: border, borderWidth: 2 }]}
              onPress={() => handleChoice(idx)}
            >
              <Text style={styles.choiceEmoji}>{choice.emoji}</Text>
              <Text style={styles.choiceWord}>{choice.word}</Text>
              {showResult && isCorrect && <Text style={styles.resultIcon}>✅</Text>}
              {showResult && isSelected && !isCorrect && <Text style={styles.resultIcon}>❌</Text>}
            </Pressable>
          );
        })}
      </View>

      {showResult && (
        <Pressable style={[styles.doneButton, { backgroundColor: color }]} onPress={handleNext}>
          <UiText style={styles.doneButtonText}>
            {qIndex + 1 >= questions.length ? `أَحْسَنْت! ${score}/${questions.length} 🌟 تابع` : "التالي ←"}
          </UiText>
        </Pressable>
      )}
    </View>
  );
}

// ── Behavior Activity ────────────────────────────────────────────────────────

function BehaviorActivity({
  behaviors,
  color,
  onComplete,
}: {
  behaviors: { emoji: string; description: string; isCorrect: boolean }[];
  color: string;
  onComplete: () => void;
}) {
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});

  const handleAnswer = useCallback(
    (index: number, answer: boolean, description: string) => {
      if (answers[index] !== undefined) return;
      const correct = answer === behaviors[index].isCorrect;
      setAnswers((prev) => ({ ...prev, [index]: answer }));
      if (correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        speakArabic("أحسنت!");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        speakArabic("حاول مرة أخرى");
      }
    },
    [answers, behaviors]
  );

  const allAnswered = Object.keys(answers).length >= behaviors.length;
  const correctCount = Object.entries(answers).filter(
    ([i, a]) => a === behaviors[Number(i)].isCorrect
  ).length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.behaviorScroll}>
      <Text style={styles.activityInstruction}>
        اضغط ✓ للسلوك الصحيح و ✗ للسلوك الخطأ
      </Text>
      {behaviors.map((item, i) => {
        const answered = answers[i] !== undefined;
        const userAnswer = answers[i];
        const isCorrectAnswer = userAnswer === item.isCorrect;

        return (
          <View
            key={i}
            style={[
              styles.behaviorCard,
              answered && isCorrectAnswer && { borderColor: "#059669", borderWidth: 2, backgroundColor: "#D1FAE5" },
              answered && !isCorrectAnswer && { borderColor: "#EF4444", borderWidth: 2, backgroundColor: "#FEE2E2" },
            ]}
          >
            <Text style={styles.behaviorEmoji}>{item.emoji}</Text>
            <Text style={styles.behaviorText}>{item.description}</Text>
            {answered && (
              <Text style={styles.behaviorResultIcon}>
                {isCorrectAnswer ? "✅" : "❌"}
              </Text>
            )}
            {!answered && (
              <View style={styles.behaviorButtons}>
                <Pressable
                  style={styles.checkButton}
                  onPress={() => handleAnswer(i, true, item.description)}
                >
                  <Text style={styles.checkButtonText}>✓</Text>
                </Pressable>
                <Pressable
                  style={styles.crossButton}
                  onPress={() => handleAnswer(i, false, item.description)}
                >
                  <Text style={styles.crossButtonText}>✗</Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}
      {allAnswered && (
        <Pressable style={[styles.doneButton, { backgroundColor: color }]} onPress={onComplete}>
          <UiText style={styles.doneButtonText}>
            أَحْسَنْت! {correctCount}/{behaviors.length} صحيح 🌟 تابع
          </UiText>
        </Pressable>
      )}
    </ScrollView>
  );
}

// ── Matching Activity ────────────────────────────────────────────────────────

function MatchingActivity({
  pairs,
  color,
  onComplete,
}: {
  pairs: { left: { emoji: string; word: string }; right: { emoji: string; word: string } }[];
  color: string;
  onComplete: () => void;
}) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Record<number, number>>({});

  const rightOrder = useRef(
    pairs.map((_, i) => i).sort(() => Math.random() - 0.5)
  ).current;

  const handleLeft = useCallback(
    (i: number) => {
      if (matched[i] !== undefined) return;
      setSelectedLeft(i);
    },
    [matched]
  );

  const handleRight = useCallback(
    (rightShuffledIdx: number) => {
      const originalPairIdx = rightOrder[rightShuffledIdx];
      if (selectedLeft === null) return;
      if (Object.values(matched).includes(originalPairIdx)) return;

      if (selectedLeft === originalPairIdx) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        speakArabic("أحسنت!");
        setMatched((prev) => ({ ...prev, [selectedLeft]: originalPairIdx }));
        setSelectedLeft(null);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setSelectedLeft(null);
      }
    },
    [selectedLeft, matched, rightOrder]
  );

  const allMatched = Object.keys(matched).length >= pairs.length;

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.activityInstruction}>
        اضغط على شيء في اليمين ثم ما يناسبه في اليسار
      </Text>
      <View style={styles.matchingGrid}>
        {/* Left column */}
        <View style={styles.matchingColumn}>
          {pairs.map((pair, i) => {
            const isMatched = matched[i] !== undefined;
            const isSelected = selectedLeft === i;
            return (
              <Pressable
                key={i}
                style={[
                  styles.matchingItem,
                  isSelected && { borderColor: color, borderWidth: 3 },
                  isMatched && { backgroundColor: color + "22", borderColor: color, borderWidth: 2 },
                ]}
                onPress={() => handleLeft(i)}
              >
                <Text style={styles.matchingEmoji}>{pair.left.emoji}</Text>
                <Text style={styles.matchingWord}>{pair.left.word}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Arrow divider */}
        <View style={styles.matchingArrow}>
          {pairs.map((_, i) => (
            <Text key={i} style={styles.arrowIcon}>↔</Text>
          ))}
        </View>

        {/* Right column (shuffled) */}
        <View style={styles.matchingColumn}>
          {rightOrder.map((originalIdx, shuffledIdx) => {
            const isMatched = Object.values(matched).includes(originalIdx);
            return (
              <Pressable
                key={shuffledIdx}
                style={[
                  styles.matchingItem,
                  isMatched && { backgroundColor: "#D1FAE5", borderColor: "#059669", borderWidth: 2 },
                ]}
                onPress={() => handleRight(shuffledIdx)}
              >
                <Text style={styles.matchingEmoji}>{pairs[originalIdx].right.emoji}</Text>
                <Text style={styles.matchingWord}>{pairs[originalIdx].right.word}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {allMatched && (
        <Pressable style={[styles.doneButton, { backgroundColor: color }]} onPress={onComplete}>
          <UiText style={styles.doneButtonText}>أَحْسَنْت! 🌟 تابع</UiText>
        </Pressable>
      )}
    </View>
  );
}

// ── Drawing Activity ─────────────────────────────────────────────────────────

function DrawingActivity({
  shapes,
  color,
  onComplete,
}: {
  shapes: { label: string; emoji: string; instruction: string }[];
  color: string;
  onComplete: () => void;
}) {
  const [currentShape, setCurrentShape] = useState(0);
  const [done, setDone] = useState(false);
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const shape = shapes[currentShape];

  const handleDone = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    speakArabic("أحسنت!");
    Animated.sequence([
      Animated.spring(bounceAnim, { toValue: 1.2, useNativeDriver: true, speed: 40 }),
      Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start(() => {
      if (currentShape + 1 >= shapes.length) {
        setDone(true);
      } else {
        setCurrentShape((i) => i + 1);
      }
    });
  }, [currentShape, shapes.length, bounceAnim]);

  if (done) {
    return (
      <View style={styles.activityContainer}>
        <Text style={styles.doneAllEmoji}>🎨</Text>
        <Text style={styles.doneAllTitle}>أَحْسَنْت!</Text>
        <Text style={styles.doneAllText}>رسمت جميع الخطوط</Text>
        <Pressable style={[styles.doneButton, { backgroundColor: color }]} onPress={onComplete}>
          <UiText style={styles.doneButtonText}>تابع 🌟</UiText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.activityContainer}>
      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {shapes.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < currentShape && { backgroundColor: color },
              i === currentShape && { backgroundColor: color, width: 24 },
              i > currentShape && { backgroundColor: "#E2E8F0" },
            ]}
          />
        ))}
      </View>

      <Text style={styles.activityInstruction}>
        {currentShape + 1} / {shapes.length}
      </Text>

      {/* Shape display */}
      <Animated.View style={[styles.shapeBox, { borderColor: color, transform: [{ scale: bounceAnim }] }]}>
        <Text style={styles.shapeEmoji}>{shape.emoji}</Text>
        <Text style={[styles.shapeLabel, { color }]}>{shape.label}</Text>
        <Text style={styles.shapeInstruction}>{shape.instruction}</Text>

        {/* Dashed line visualizer */}
        <View style={styles.dashedLine}>
          {[...Array(8)].map((_, i) => (
            <View
              key={i}
              style={[styles.dash, { backgroundColor: color + "55" }]}
            />
          ))}
        </View>
        <View style={styles.arrowEnds}>
          <Text style={styles.arrowEnd}>▶</Text>
        </View>
      </Animated.View>

      <Pressable style={[styles.doneButton, { backgroundColor: color }]} onPress={handleDone}>
        <UiText style={styles.doneButtonText}>تَتَبَّعْتُ الْخَط ✓</UiText>
      </Pressable>
    </View>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function Unit1LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { completeLesson } = useProgress();

  const lesson = unit1Lessons.find((l) => l.id === id);
  const { completed, completeAttempt, restartAttempt, activityKey } = useLessonAttempt(id ?? "");

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  const currentIndex = lesson ? unit1Lessons.findIndex((l) => l.id === id) : -1;
  const nextLesson = currentIndex >= 0 && currentIndex + 1 < unit1Lessons.length
    ? unit1Lessons[currentIndex + 1]
    : null;

  useEffect(() => {
    if (lesson) {
      const t = setTimeout(() => speakArabic(lesson.title), 500);
      return () => clearTimeout(t);
    }
  }, [lesson]);

  const handleComplete = useCallback(() => {
    if (!lesson) return;
    completeLesson(lesson.id, 3);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    speakArabic("أحسنت! لقد أتممت الدرس");
    completeAttempt();
  }, [lesson, completeLesson, completeAttempt]);

  if (!lesson) {
    return (
      <ScreenBackground variant="home" style={styles.centered}>
        <UiText style={{ fontSize: 18, color: "#64748B" }}>الدرس غير موجود</UiText>
      </ScreenBackground>
    );
  }

  if (completed) {
    return (
      <ScreenBackground
        variant="home"
        style={[styles.completedScreen, { paddingTop: topPad, paddingBottom: botPad + 16 }]}
      >
        <View style={styles.header}>
          <BackButton />
          <View style={{ flex: 1 }} />
        </View>

        <View style={styles.completedContent}>
          <Text style={styles.completedStar}>🌟</Text>
          <Text style={styles.completedTitle}>أَحْسَنْت!</Text>
          <Text style={styles.completedSubtitle}>{lesson.title}</Text>
          <Text style={styles.completedText}>لقد أتممت هذا النشاط بنجاح</Text>

          <Pressable
            testID="repeat-lesson"
            style={[styles.nextButton, { backgroundColor: lesson.color }]}
            onPress={restartAttempt}
          >
            <UiText style={styles.nextButtonText}>إعادة الدرس</UiText>
          </Pressable>

          {nextLesson ? (
            <Pressable
              style={[styles.nextButton, { backgroundColor: lesson.color }]}
              onPress={() => {
                router.replace(`/(tabs)/unit1/${nextLesson.id}` as any);
              }}
            >
              <UiText style={styles.nextButtonText}>النشاط التالي: {nextLesson.title} ←</UiText>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.nextButton, { backgroundColor: "#059669" }]}
              onPress={() => router.back()}
            >
              <UiText style={styles.nextButtonText}>🎉 أتممت الوحدة الأولى!</UiText>
            </Pressable>
          )}

          {!nextLesson ? (
            <Pressable
              testID="repeat-unit"
              style={[styles.nextButton, { backgroundColor: lesson.color }]}
              onPress={() => router.replace(`/(tabs)/unit1/${unit1Lessons[0].id}` as any)}
            >
              <UiText style={styles.nextButtonText}>إعادة الوحدة</UiText>
            </Pressable>
          ) : null}

          <Pressable style={styles.backLink} onPress={() => router.back()}>
            <UiText style={styles.backLinkText}>العودة إلى القائمة</UiText>
          </Pressable>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground
      variant="reading"
      style={[styles.screen, { paddingTop: topPad, paddingBottom: botPad + 16 }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerCenter}>
          <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
          <Text style={styles.lessonTitle} numberOfLines={1}>{lesson.title}</Text>
        </View>
        <View style={[styles.numberPill, { backgroundColor: lesson.color }]}>
          <Text style={styles.numberPillText}>{lesson.number} / {unit1Lessons.length}</Text>
        </View>
      </View>

      {/* Activity content */}
      <ScrollView
        key={activityKey}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {lesson.type === "naming" && (
          <NamingActivity items={lesson.items} color={lesson.color} onComplete={handleComplete} />
        )}
        {lesson.type === "listen_pick" && (
          <ListenPickActivity questions={lesson.questions} color={lesson.color} onComplete={handleComplete} />
        )}
        {lesson.type === "behavior" && (
          <BehaviorActivity behaviors={lesson.behaviors} color={lesson.color} onComplete={handleComplete} />
        )}
        {lesson.type === "matching" && (
          <MatchingActivity pairs={lesson.pairs} color={lesson.color} onComplete={handleComplete} />
        )}
        {lesson.type === "drawing" && (
          <DrawingActivity shapes={lesson.shapes} color={lesson.color} onComplete={handleComplete} />
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  completedScreen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  lessonEmoji: { fontSize: 22 },
  lessonTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B", flexShrink: 1 },
  numberPill: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  numberPillText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },

  scrollContent: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 24 },

  activityContainer: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    gap: 16,
  },
  activityInstruction: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
    textAlign: "center",
    marginBottom: 4,
  },

  // Naming
  namingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    width: "100%",
  },
  namingCard: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  namingEmoji: { fontSize: 40 },
  namingWord: { fontSize: 12, fontWeight: "700", color: "#475569", textAlign: "center" },
  hintText: { fontSize: 13, color: "#94A3B8", textAlign: "center" },

  // Listen & Pick
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listenButton: {
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 20,
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    width: 220,
  },
  listenButtonEmoji: { fontSize: 40 },
  listenButtonText: { fontSize: 28, fontWeight: "900", color: "#FFFFFF" },
  listenButtonHint: { fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: "500" },
  choicesRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
    width: "100%",
  },
  choiceCard: {
    width: 100,
    height: 100,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  choiceEmoji: { fontSize: 36 },
  choiceWord: { fontSize: 12, fontWeight: "700", color: "#475569", textAlign: "center" },
  resultIcon: { position: "absolute", top: -8, right: -8, fontSize: 20 },

  // Behavior
  behaviorScroll: { flexGrow: 1, gap: 12, paddingTop: 8, paddingBottom: 24, alignItems: "center", width: "100%" },
  behaviorCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  behaviorEmoji: { fontSize: 30, flexShrink: 0 },
  behaviorText: { flex: 1, fontSize: 14, fontWeight: "600", color: "#1E293B", lineHeight: 20 },
  behaviorResultIcon: { fontSize: 24, flexShrink: 0 },
  behaviorButtons: { flexDirection: "row", gap: 8, flexShrink: 0 },
  checkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  checkButtonText: { fontSize: 22, color: "#059669", fontWeight: "900" },
  crossButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  crossButtonText: { fontSize: 22, color: "#EF4444", fontWeight: "900" },

  // Matching
  matchingGrid: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  matchingColumn: { flex: 1, gap: 10 },
  matchingItem: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    gap: 4,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  matchingEmoji: { fontSize: 30 },
  matchingWord: { fontSize: 11, fontWeight: "700", color: "#475569", textAlign: "center" },
  matchingArrow: { gap: 10, alignItems: "center" },
  arrowIcon: { fontSize: 20, color: "#94A3B8", height: 68, textAlignVertical: "center", lineHeight: 68 },

  // Drawing
  shapeBox: {
    borderRadius: 24,
    borderWidth: 2,
    padding: 28,
    alignItems: "center",
    gap: 10,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  shapeEmoji: { fontSize: 52 },
  shapeLabel: { fontSize: 22, fontWeight: "900" },
  shapeInstruction: { fontSize: 14, color: "#64748B", textAlign: "center", fontWeight: "600" },
  dashedLine: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    alignItems: "center",
  },
  dash: { width: 16, height: 4, borderRadius: 2 },
  arrowEnds: { alignItems: "flex-end", width: "100%", paddingRight: 8 },
  arrowEnd: { fontSize: 16, color: "#94A3B8" },
  doneAllEmoji: { fontSize: 72, textAlign: "center" },
  doneAllTitle: { fontSize: 32, fontWeight: "900", color: "#1E293B" },
  doneAllText: { fontSize: 16, color: "#64748B", textAlign: "center" },

  // Shared
  doneButton: {
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 8,
  },
  doneButtonText: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },

  // Completed screen
  completedContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  completedStar: { fontSize: 80 },
  completedTitle: { fontSize: 36, fontWeight: "900", color: "#1E293B" },
  completedSubtitle: { fontSize: 20, fontWeight: "700", color: "#475569" },
  completedText: { fontSize: 16, color: "#64748B", textAlign: "center" },
  nextButton: {
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonText: { fontSize: 17, fontWeight: "800", color: "#FFFFFF" },
  backLink: { marginTop: 8, padding: 8 },
  backLinkText: { fontSize: 15, color: "#94A3B8", fontWeight: "600" },
});
