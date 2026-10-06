/**
 * الوحدة الثانية — individual lesson screen.
 * Activity types: story, naming, letter_pick, word_read, listen_pick.
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
import { unit2Lessons } from "@/constants/unit2Lessons";
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

// ── Story Activity ────────────────────────────────────────────────────────────

function StoryActivity({
  storyTitle,
  lines,
  color,
  onComplete,
}: {
  storyTitle: string;
  lines: Array<{ text: string; emoji: string }>;
  color: string;
  onComplete: () => void;
}) {
  const [heard, setHeard] = useState<Set<number>>(new Set());
  const scales = useRef(lines.map(() => new Animated.Value(1))).current;

  const handleLine = useCallback(
    (index: number, text: string) => {
      speakArabic(text);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setHeard((prev) => new Set(prev).add(index));
      Animated.sequence([
        Animated.spring(scales[index], { toValue: 1.04, useNativeDriver: true, speed: 30 }),
        Animated.spring(scales[index], { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]).start();
    },
    [scales]
  );

  const allHeard = heard.size >= lines.length;

  return (
    <View style={styles.activityContainer}>
      <Text style={styles.storyTitle}>{storyTitle}</Text>
      <Text style={styles.activityInstruction}>اضغط على كل جملة لتسمعها 🔊</Text>
      <View style={styles.storyLines}>
        {lines.map((line, i) => (
          <Animated.View key={i} style={{ transform: [{ scale: scales[i] }] }}>
            <Pressable
              style={[
                styles.storyLine,
                heard.has(i) && { borderColor: color, borderWidth: 2, backgroundColor: color + "12" },
              ]}
              onPress={() => handleLine(i, line.text)}
            >
              <Text style={styles.storyLineEmoji}>{line.emoji}</Text>
              <Text style={[styles.storyLineText, heard.has(i) && { color }]}>
                {line.text}
              </Text>
              {heard.has(i) && <Text style={styles.heardCheck}>✓</Text>}
            </Pressable>
          </Animated.View>
        ))}
      </View>
      {allHeard ? (
        <Pressable style={[styles.doneButton, { backgroundColor: color }]} onPress={onComplete}>
          <UiText style={styles.doneButtonText}>أَحْسَنْت! 🌟 تابع</UiText>
        </Pressable>
      ) : (
        <Text style={styles.hintText}>{lines.length - heard.size} جملة متبقية</Text>
      )}
    </View>
  );
}

// ── Naming Activity ───────────────────────────────────────────────────────────

function NamingActivity({
  items,
  color,
  onComplete,
}: {
  items: Array<{ emoji: string; word: string }>;
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
      <Text style={styles.activityInstruction}>اضغط على كل كلمة لتسمعها 🔊</Text>
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
      {allTapped ? (
        <Pressable style={[styles.doneButton, { backgroundColor: color }]} onPress={onComplete}>
          <UiText style={styles.doneButtonText}>أَحْسَنْت! 🌟 تابع</UiText>
        </Pressable>
      ) : (
        <Text style={styles.hintText}>{items.length - tapped.size} كلمة متبقية</Text>
      )}
    </View>
  );
}

// ── Letter Pick Activity ──────────────────────────────────────────────────────

function LetterPickActivity({
  targetLetter,
  targetWord,
  rounds,
  color,
  onComplete,
}: {
  targetLetter: string;
  targetWord: string;
  rounds: Array<{ letters: string[]; correctIndex: number }>;
  color: string;
  onComplete: () => void;
}) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const bounceAnims = useRef(rounds[0].letters.map(() => new Animated.Value(1))).current;

  const round = rounds[roundIndex];

  useEffect(() => {
    const t = setTimeout(() => speakArabic(targetLetter), 400);
    return () => clearTimeout(t);
  }, [roundIndex, targetLetter]);

  const handlePick = useCallback(
    (idx: number) => {
      if (selected !== null) return;
      setSelected(idx);
      const correct = idx === round.correctIndex;
      if (correct) {
        setScore((s) => s + 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        speakArabic("أحسنت!");
        Animated.sequence([
          Animated.spring(bounceAnims[idx], { toValue: 1.4, useNativeDriver: true, speed: 30 }),
          Animated.spring(bounceAnims[idx], { toValue: 1, useNativeDriver: true, speed: 20 }),
        ]).start();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        speakArabic(targetLetter);
      }
      setTimeout(() => {
        if (roundIndex + 1 >= rounds.length) {
          onComplete();
        } else {
          setRoundIndex((i) => i + 1);
          setSelected(null);
        }
      }, 900);
    },
    [selected, round, roundIndex, rounds.length, onComplete, bounceAnims, targetLetter]
  );

  return (
    <View style={styles.activityContainer}>
      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {rounds.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < roundIndex && { backgroundColor: color },
              i === roundIndex && { backgroundColor: color, width: 24 },
              i > roundIndex && { backgroundColor: "#E2E8F0" },
            ]}
          />
        ))}
      </View>

      {/* Target letter display */}
      <View style={[styles.letterDisplay, { borderColor: color }]}>
        <Text style={styles.letterDisplayInstruction}>اختر الحرف</Text>
        <Text style={[styles.letterDisplayLetter, { color }]}>{targetLetter}</Text>
        <Text style={styles.letterDisplayWord}>{targetWord}</Text>
      </View>

      <Text style={styles.activityInstruction}>
        سؤال {roundIndex + 1} من {rounds.length}
      </Text>

      {/* Letter choices */}
      <View style={styles.letterChoicesRow}>
        {round.letters.map((letter, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === round.correctIndex;
          let bg = "#F8FAFC";
          let border = "#E2E8F0";
          if (selected !== null && isCorrect) { bg = "#D1FAE5"; border = "#059669"; }
          else if (isSelected && !isCorrect) { bg = "#FEE2E2"; border = "#EF4444"; }

          return (
            <Animated.View key={idx} style={{ transform: [{ scale: bounceAnims[idx] }] }}>
              <Pressable
                style={[styles.letterChoice, { backgroundColor: bg, borderColor: border, borderWidth: 3 }]}
                onPress={() => handlePick(idx)}
              >
                <Text style={[styles.letterChoiceText, selected !== null && isCorrect && { color: "#059669" }]}>
                  {letter}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

// ── Word Read Activity ────────────────────────────────────────────────────────

function WordReadActivity({
  rounds,
  color,
  onComplete,
}: {
  rounds: Array<{ word: string; choices: string[]; correctIndex: number }>;
  color: string;
  onComplete: () => void;
}) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const round = rounds[roundIndex];

  useEffect(() => {
    const t = setTimeout(() => speakArabic(round.word), 400);
    return () => clearTimeout(t);
  }, [roundIndex, round.word]);

  const handleListen = useCallback(() => {
    speakArabic(round.word);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(bounceAnim, { toValue: 1.2, useNativeDriver: true, speed: 30 }),
      Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  }, [round.word, bounceAnim]);

  const handleChoice = useCallback(
    (idx: number) => {
      if (selected !== null) return;
      setSelected(idx);
      const correct = idx === round.correctIndex;
      if (correct) {
        setScore((s) => s + 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        speakArabic("أحسنت!");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        speakArabic(round.choices[round.correctIndex]);
      }
    },
    [selected, round]
  );

  const handleNext = useCallback(() => {
    if (roundIndex + 1 >= rounds.length) {
      onComplete();
    } else {
      setRoundIndex((i) => i + 1);
      setSelected(null);
    }
  }, [roundIndex, rounds.length, onComplete]);

  return (
    <View style={styles.activityContainer}>
      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {rounds.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < roundIndex && { backgroundColor: color },
              i === roundIndex && { backgroundColor: color, width: 24 },
              i > roundIndex && { backgroundColor: "#E2E8F0" },
            ]}
          />
        ))}
      </View>

      <Text style={styles.activityInstruction}>
        سؤال {roundIndex + 1} من {rounds.length} — اضغط للاستماع ثم اختر الكلمة
      </Text>

      {/* Listen button */}
      <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
        <Pressable
          style={[styles.listenButton, { backgroundColor: color }]}
          onPress={handleListen}
        >
          <Text style={styles.listenButtonEmoji}>🔊</Text>
          <UiText style={styles.listenButtonHint}>اضغط للاستماع</UiText>
        </Pressable>
      </Animated.View>

      {/* Word choices (text only) */}
      <View style={styles.wordChoicesColumn}>
        {round.choices.map((choice, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === round.correctIndex;
          let bg = "#F8FAFC";
          let border = "#E2E8F0";
          if (selected !== null && isCorrect) { bg = "#D1FAE5"; border = "#059669"; }
          else if (isSelected && !isCorrect) { bg = "#FEE2E2"; border = "#EF4444"; }

          return (
            <Pressable
              key={idx}
              style={[styles.wordChoice, { backgroundColor: bg, borderColor: border, borderWidth: 2 }]}
              onPress={() => handleChoice(idx)}
            >
              <Text style={[styles.wordChoiceText, selected !== null && isCorrect && { color: "#059669" }]}>
                {choice}
              </Text>
              {selected !== null && isCorrect && <Text style={styles.resultIcon}>✅</Text>}
              {isSelected && !isCorrect && <Text style={styles.resultIcon}>❌</Text>}
            </Pressable>
          );
        })}
      </View>

      {selected !== null && (
        <Pressable style={[styles.doneButton, { backgroundColor: color }]} onPress={handleNext}>
          <UiText style={styles.doneButtonText}>
            {roundIndex + 1 >= rounds.length
              ? `أَحْسَنْت! ${score}/${rounds.length} 🌟 تابع`
              : "التالي ←"}
          </UiText>
        </Pressable>
      )}
    </View>
  );
}

// ── Listen & Pick Activity ────────────────────────────────────────────────────

function ListenPickActivity({
  questions,
  color,
  onComplete,
}: {
  questions: Array<{ word: string; choices: Array<{ emoji: string; word: string }>; correctIndex: number }>;
  color: string;
  onComplete: () => void;
}) {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
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
      if (selected !== null) return;
      setSelected(idx);
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
    [selected, q]
  );

  const handleNext = useCallback(() => {
    if (qIndex + 1 >= questions.length) {
      onComplete();
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  }, [qIndex, questions.length, onComplete]);

  return (
    <View style={styles.activityContainer}>
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

      <View style={styles.choicesRow}>
        {q.choices.map((choice, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === q.correctIndex;
          let bg = "#F8FAFC";
          let border = "#E2E8F0";
          if (selected !== null && isCorrect) { bg = "#D1FAE5"; border = "#059669"; }
          else if (isSelected && !isCorrect) { bg = "#FEE2E2"; border = "#EF4444"; }

          return (
            <Pressable
              key={idx}
              style={[styles.choiceCard, { backgroundColor: bg, borderColor: border, borderWidth: 2 }]}
              onPress={() => handleChoice(idx)}
            >
              <Text style={styles.choiceEmoji}>{choice.emoji}</Text>
              <Text style={styles.choiceWord}>{choice.word}</Text>
              {selected !== null && isCorrect && <Text style={styles.resultIcon}>✅</Text>}
              {isSelected && !isCorrect && <Text style={styles.resultIcon}>❌</Text>}
            </Pressable>
          );
        })}
      </View>

      {selected !== null && (
        <Pressable style={[styles.doneButton, { backgroundColor: color }]} onPress={handleNext}>
          <UiText style={styles.doneButtonText}>
            {qIndex + 1 >= questions.length
              ? `أَحْسَنْت! ${score}/${questions.length} 🌟 تابع`
              : "التالي ←"}
          </UiText>
        </Pressable>
      )}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function Unit2LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { completeLesson } = useProgress();

  const lesson = unit2Lessons.find((l) => l.id === id);
  const { completed, completeAttempt, restartAttempt, activityKey } = useLessonAttempt(id ?? "");

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  const currentIndex = lesson ? unit2Lessons.findIndex((l) => l.id === id) : -1;
  const nextLesson =
    currentIndex >= 0 && currentIndex + 1 < unit2Lessons.length
      ? unit2Lessons[currentIndex + 1]
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
              onPress={() => router.replace(`/(tabs)/unit2/${nextLesson.id}` as any)}
            >
              <UiText style={styles.nextButtonText}>النشاط التالي: {nextLesson.title} ←</UiText>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.nextButton, { backgroundColor: "#2563EB" }]}
              onPress={() => router.back()}
            >
              <UiText style={styles.nextButtonText}>🎉 أتممت الوحدة الثانية!</UiText>
            </Pressable>
          )}

          {!nextLesson ? (
            <Pressable
              testID="repeat-unit"
              style={[styles.nextButton, { backgroundColor: lesson.color }]}
              onPress={() => router.replace(`/(tabs)/unit2/${unit2Lessons[0].id}` as any)}
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

  const renderActivity = () => {
    switch (lesson.type) {
      case "story":
        return (
          <StoryActivity
            storyTitle={lesson.storyTitle}
            lines={lesson.lines}
            color={lesson.color}
            onComplete={handleComplete}
          />
        );
      case "naming":
        return (
          <NamingActivity
            items={lesson.items}
            color={lesson.color}
            onComplete={handleComplete}
          />
        );
      case "letter_pick":
        return (
          <LetterPickActivity
            targetLetter={lesson.targetLetter}
            targetWord={lesson.targetWord}
            rounds={lesson.rounds}
            color={lesson.color}
            onComplete={handleComplete}
          />
        );
      case "word_read":
        return (
          <WordReadActivity
            rounds={lesson.rounds}
            color={lesson.color}
            onComplete={handleComplete}
          />
        );
      case "listen_pick":
        return (
          <ListenPickActivity
            questions={lesson.questions}
            color={lesson.color}
            onComplete={handleComplete}
          />
        );
    }
  };

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
          <Text style={styles.numberPillText}>{lesson.number} / {unit2Lessons.length}</Text>
        </View>
      </View>

      <ScrollView
        key={activityKey}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderActivity()}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
  lessonEmoji: { fontSize: 24 },
  lessonTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B", flexShrink: 1 },
  numberPill: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  numberPillText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },

  scrollContent: { flexGrow: 1, paddingBottom: 24 },

  activityContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
  },
  activityInstruction: {
    fontSize: 15,
    color: "#475569",
    fontWeight: "600",
    textAlign: "center",
  },
  hintText: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    fontWeight: "500",
  },

  // Story
  storyTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 4,
  },
  storyLines: { width: "100%", gap: 10 },
  storyLine: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  storyLineEmoji: { fontSize: 24, flexShrink: 0 },
  storyLineText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "right",
  },
  heardCheck: { fontSize: 18, color: "#059669", flexShrink: 0 },

  // Naming grid
  namingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    width: "100%",
  },
  namingCard: {
    width: 100,
    height: 100,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    gap: 4,
  },
  namingEmoji: { fontSize: 36 },
  namingWord: { fontSize: 14, fontWeight: "700", color: "#1E293B", textAlign: "center" },

  // Letter pick
  letterDisplay: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    width: "80%",
    gap: 4,
  },
  letterDisplayInstruction: { fontSize: 13, color: "#64748B", fontWeight: "600" },
  letterDisplayLetter: { fontSize: 72, fontWeight: "900", lineHeight: 88 },
  letterDisplayWord: { fontSize: 18, color: "#475569", fontWeight: "700" },
  letterChoicesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
  },
  letterChoice: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  letterChoiceText: { fontSize: 40, fontWeight: "900", color: "#1E293B" },

  // Word read
  wordChoicesColumn: { width: "100%", gap: 12 },
  wordChoice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  wordChoiceText: { fontSize: 22, fontWeight: "800", color: "#1E293B", textAlign: "center" },

  // Listen button
  listenButton: {
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 6,
    minWidth: 200,
  },
  listenButtonEmoji: { fontSize: 36 },
  listenButtonText: { fontSize: 26, fontWeight: "900", color: "#FFFFFF" },
  listenButtonHint: { fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: "600" },

  // Choices row
  choicesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
    width: "100%",
  },
  choiceCard: {
    minWidth: 90,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  choiceEmoji: { fontSize: 36 },
  choiceWord: { fontSize: 14, fontWeight: "700", color: "#1E293B", textAlign: "center" },
  resultIcon: { fontSize: 18 },

  // Progress dots
  dotsRow: { flexDirection: "row", gap: 6, justifyContent: "center" },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Done button
  doneButton: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    marginTop: 8,
  },
  doneButtonText: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },

  // Completed screen
  completedScreen: { flex: 1 },
  completedContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  completedStar: { fontSize: 72 },
  completedTitle: { fontSize: 36, fontWeight: "900", color: "#1E293B" },
  completedSubtitle: { fontSize: 20, fontWeight: "700", color: "#475569", textAlign: "center" },
  completedText: { fontSize: 15, color: "#64748B", textAlign: "center" },
  nextButton: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
    marginTop: 16,
  },
  nextButtonText: { fontSize: 16, fontWeight: "800", color: "#FFFFFF", textAlign: "center" },
  backLink: { marginTop: 8, padding: 8 },
  backLinkText: { fontSize: 14, color: "#94A3B8", fontWeight: "600" },
});
