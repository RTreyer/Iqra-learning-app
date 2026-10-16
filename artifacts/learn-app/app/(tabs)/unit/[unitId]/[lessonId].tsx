/**
 * Generic unit lesson screen — works for all units 2–8.
 * Activity types: story, naming, letter_pick, word_read, listen_pick.
 * Route: /(tabs)/unit/[unitId]/[lessonId]
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
import { getUnitById } from "@/constants/allUnitsLessons";
import { useProgress } from "@/context/ProgressContext";
import { useLessonAttempt } from "@/hooks/useLessonAttempt";

let Speech: { speak: (t: string, o?: object) => void; stop: () => void } | null = null;
try { Speech = require("expo-speech"); } catch { Speech = null; }

function speakArabic(text: string) {
  if (!Speech) return;
  try { Speech.stop(); Speech.speak(text, { language: "ar", rate: 0.8 }); } catch {}
}

// ── Story ─────────────────────────────────────────────────────────────────────

function StoryActivity({ storyTitle, lines, color, onComplete }: {
  storyTitle: string;
  lines: { text: string; emoji: string }[];
  color: string;
  onComplete: () => void;
}) {
  const [heard, setHeard] = useState<Set<number>>(new Set());
  const scales = useRef(lines.map(() => new Animated.Value(1))).current;

  const handleLine = useCallback((i: number, text: string) => {
    speakArabic(text);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHeard((p) => new Set(p).add(i));
    Animated.sequence([
      Animated.spring(scales[i], { toValue: 1.04, useNativeDriver: true, speed: 30 }),
      Animated.spring(scales[i], { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  }, [scales]);

  const allHeard = heard.size >= lines.length;

  return (
    <View style={act.container}>
      <Text style={act.storyTitle}>{storyTitle}</Text>
      <Text style={act.instruction}>اضغط على كل جملة لتسمعها 🔊</Text>
      <View style={{ width: "100%", gap: 10 }}>
        {lines.map((line, i) => (
          <Animated.View key={i} style={{ transform: [{ scale: scales[i] }] }}>
            <Pressable
              style={[act.storyLine, heard.has(i) && { borderColor: color, borderWidth: 2, backgroundColor: color + "12" }]}
              onPress={() => handleLine(i, line.text)}
            >
              <Text style={act.storyLineEmoji}>{line.emoji}</Text>
              <Text style={[act.storyLineText, heard.has(i) && { color }]}>{line.text}</Text>
              {heard.has(i) && <Text style={{ fontSize: 16, color: "#059669" }}>✓</Text>}
            </Pressable>
          </Animated.View>
        ))}
      </View>
      {allHeard
        ? <Pressable style={[act.doneBtn, { backgroundColor: color }]} onPress={onComplete}><UiText style={act.doneBtnText}>أَحْسَنْت! 🌟 تابع</UiText></Pressable>
        : <Text style={act.hint}>{lines.length - heard.size} جملة متبقية</Text>}
    </View>
  );
}

// ── Naming ────────────────────────────────────────────────────────────────────

function NamingActivity({ items, color, onComplete }: {
  items: { emoji: string; word: string }[];
  color: string;
  onComplete: () => void;
}) {
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const scales = useRef(items.map(() => new Animated.Value(1))).current;

  const handleTap = useCallback((i: number, word: string) => {
    speakArabic(word);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTapped((p) => new Set(p).add(i));
    Animated.sequence([
      Animated.spring(scales[i], { toValue: 1.25, useNativeDriver: true, speed: 30 }),
      Animated.spring(scales[i], { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  }, [scales]);

  const allTapped = tapped.size >= items.length;

  return (
    <View style={act.container}>
      <Text style={act.instruction}>اضغط على كل كلمة لتسمعها 🔊</Text>
      <View style={act.namingGrid}>
        {items.map((item, i) => (
          <Animated.View key={i} style={{ transform: [{ scale: scales[i] }] }}>
            <Pressable
              style={[act.namingCard, tapped.has(i) && { borderColor: color, borderWidth: 3, backgroundColor: color + "18" }]}
              onPress={() => handleTap(i, item.word)}
            >
              <Text style={act.namingEmoji}>{item.emoji}</Text>
              <Text style={[act.namingWord, tapped.has(i) && { color }]}>{item.word}</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
      {allTapped
        ? <Pressable style={[act.doneBtn, { backgroundColor: color }]} onPress={onComplete}><UiText style={act.doneBtnText}>أَحْسَنْت! 🌟 تابع</UiText></Pressable>
        : <Text style={act.hint}>{items.length - tapped.size} كلمة متبقية</Text>}
    </View>
  );
}

// ── Letter Pick ───────────────────────────────────────────────────────────────

function LetterPickActivity({ rounds, color, onComplete }: {
  rounds: { targetLetter: string; letters: string[]; correctIndex: number }[];
  color: string;
  onComplete: () => void;
}) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const bounceAnims = useRef(rounds[0].letters.map(() => new Animated.Value(1))).current;

  const round = rounds[roundIndex];

  useEffect(() => {
    const t = setTimeout(() => speakArabic(round.targetLetter), 400);
    return () => clearTimeout(t);
  }, [roundIndex, round.targetLetter]);

  const handlePick = useCallback((idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === round.correctIndex;
    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speakArabic("أحسنت!");
      Animated.sequence([
        Animated.spring(bounceAnims[idx], { toValue: 1.4, useNativeDriver: true, speed: 30 }),
        Animated.spring(bounceAnims[idx], { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]).start();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speakArabic(round.targetLetter);
    }
    setTimeout(() => {
      if (roundIndex + 1 >= rounds.length) {
        onComplete();
      } else {
        setRoundIndex((i) => i + 1);
        setSelected(null);
      }
    }, 900);
  }, [selected, round, roundIndex, rounds.length, onComplete, bounceAnims]);

  return (
    <View style={act.container}>
      <View style={act.dotsRow}>
        {rounds.map((_, i) => (
          <View key={i} style={[act.dot, i < roundIndex && { backgroundColor: color }, i === roundIndex && { backgroundColor: color, width: 24 }, i > roundIndex && { backgroundColor: "#E2E8F0" }]} />
        ))}
      </View>

      <View style={[act.letterDisplay, { borderColor: color }]}>
        <Text style={act.letterDisplayHint}>ابحث عن الحرف</Text>
        <Text style={[act.letterDisplayBig, { color }]}>{round.targetLetter}</Text>
      </View>

      <Text style={act.instruction}>سؤال {roundIndex + 1} من {rounds.length}</Text>

      <View style={act.letterChoicesRow}>
        {round.letters.map((letter, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === round.correctIndex;
          let bg = "#F8FAFC"; let border = "#E2E8F0";
          if (selected !== null && isCorrect) { bg = "#D1FAE5"; border = "#059669"; }
          else if (isSelected && !isCorrect) { bg = "#FEE2E2"; border = "#EF4444"; }
          return (
            <Animated.View key={idx} style={{ transform: [{ scale: bounceAnims[idx] }] }}>
              <Pressable style={[act.letterChoice, { backgroundColor: bg, borderColor: border, borderWidth: 3 }]} onPress={() => handlePick(idx)}>
                <Text style={[act.letterChoiceText, selected !== null && isCorrect && { color: "#059669" }]}>{letter}</Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

// ── Word Read ─────────────────────────────────────────────────────────────────

function WordReadActivity({ rounds, color, onComplete }: {
  rounds: { word: string; choices: string[]; correctIndex: number }[];
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

  const handleChoice = useCallback((idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === round.correctIndex;
    if (correct) { setScore((s) => s + 1); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); speakArabic("أحسنت!"); }
    else { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); speakArabic(round.choices[round.correctIndex]); }
  }, [selected, round]);

  const handleNext = useCallback(() => {
    if (roundIndex + 1 >= rounds.length) onComplete();
    else { setRoundIndex((i) => i + 1); setSelected(null); }
  }, [roundIndex, rounds.length, onComplete]);

  return (
    <View style={act.container}>
      <View style={act.dotsRow}>
        {rounds.map((_, i) => (
          <View key={i} style={[act.dot, i < roundIndex && { backgroundColor: color }, i === roundIndex && { backgroundColor: color, width: 24 }, i > roundIndex && { backgroundColor: "#E2E8F0" }]} />
        ))}
      </View>
      <Text style={act.instruction}>سؤال {roundIndex + 1} من {rounds.length} — اضغط للاستماع ثم اختر</Text>
      <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
        <Pressable style={[act.listenBtn, { backgroundColor: color }]} onPress={handleListen}>
          <Text style={{ fontSize: 36 }}>🔊</Text>
          <UiText style={act.listenHint}>اضغط للاستماع</UiText>
        </Pressable>
      </Animated.View>
      <View style={act.wordChoicesCol}>
        {round.choices.map((choice, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === round.correctIndex;
          let bg = "#F8FAFC"; let border = "#E2E8F0";
          if (selected !== null && isCorrect) { bg = "#D1FAE5"; border = "#059669"; }
          else if (isSelected && !isCorrect) { bg = "#FEE2E2"; border = "#EF4444"; }
          return (
            <Pressable key={idx} style={[act.wordChoice, { backgroundColor: bg, borderColor: border, borderWidth: 2 }]} onPress={() => handleChoice(idx)}>
              <Text style={[act.wordChoiceText, selected !== null && isCorrect && { color: "#059669" }]}>{choice}</Text>
              {selected !== null && isCorrect && <Text style={{ fontSize: 18 }}>✅</Text>}
              {isSelected && !isCorrect && <Text style={{ fontSize: 18 }}>❌</Text>}
            </Pressable>
          );
        })}
      </View>
      {selected !== null && (
        <Pressable style={[act.doneBtn, { backgroundColor: color }]} onPress={handleNext}>
          <UiText style={act.doneBtnText}>{roundIndex + 1 >= rounds.length ? `أَحْسَنْت! ${score}/${rounds.length} 🌟 تابع` : "التالي ←"}</UiText>
        </Pressable>
      )}
    </View>
  );
}

// ── Listen & Pick ─────────────────────────────────────────────────────────────

function ListenPickActivity({ questions, color, onComplete }: {
  questions: { word: string; choices: { emoji: string; word: string }[]; correctIndex: number }[];
  color: string;
  onComplete: () => void;
}) {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const q = questions[qIndex];

  useEffect(() => {
    const t = setTimeout(() => speakArabic(q.word), 400);
    return () => clearTimeout(t);
  }, [qIndex, q.word]);

  const handleListen = useCallback(() => {
    speakArabic(q.word);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(bounceAnim, { toValue: 1.2, useNativeDriver: true, speed: 30 }),
      Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  }, [q.word, bounceAnim]);

  const handleChoice = useCallback((idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correctIndex) { setScore((s) => s + 1); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); speakArabic("أحسنت!"); }
    else { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); speakArabic(q.choices[q.correctIndex].word); }
  }, [selected, q]);

  const handleNext = useCallback(() => {
    if (qIndex + 1 >= questions.length) onComplete();
    else { setQIndex((i) => i + 1); setSelected(null); }
  }, [qIndex, questions.length, onComplete]);

  return (
    <View style={act.container}>
      <View style={act.dotsRow}>
        {questions.map((_, i) => (
          <View key={i} style={[act.dot, i < qIndex && { backgroundColor: color }, i === qIndex && { backgroundColor: color, width: 24 }, i > qIndex && { backgroundColor: "#E2E8F0" }]} />
        ))}
      </View>
      <Text style={act.instruction}>سؤال {qIndex + 1} من {questions.length}</Text>
      <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
        <Pressable style={[act.listenBtn, { backgroundColor: color }]} onPress={handleListen}>
          <Text style={{ fontSize: 32 }}>🔊</Text>
          <Text style={act.listenBtnText}>{q.word}</Text>
          <UiText style={act.listenHint}>اضغط للاستماع</UiText>
        </Pressable>
      </Animated.View>
      <View style={act.choicesRow}>
        {q.choices.map((choice, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === q.correctIndex;
          let bg = "#F8FAFC"; let border = "#E2E8F0";
          if (selected !== null && isCorrect) { bg = "#D1FAE5"; border = "#059669"; }
          else if (isSelected && !isCorrect) { bg = "#FEE2E2"; border = "#EF4444"; }
          return (
            <Pressable key={idx} style={[act.choiceCard, { backgroundColor: bg, borderColor: border, borderWidth: 2 }]} onPress={() => handleChoice(idx)}>
              <Text style={act.choiceEmoji}>{choice.emoji}</Text>
              <Text style={act.choiceWord}>{choice.word}</Text>
              {selected !== null && isCorrect && <Text style={{ fontSize: 16 }}>✅</Text>}
              {isSelected && !isCorrect && <Text style={{ fontSize: 16 }}>❌</Text>}
            </Pressable>
          );
        })}
      </View>
      {selected !== null && (
        <Pressable style={[act.doneBtn, { backgroundColor: color }]} onPress={handleNext}>
          <UiText style={act.doneBtnText}>{qIndex + 1 >= questions.length ? `أَحْسَنْت! ${score}/${questions.length} 🌟 تابع` : "التالي ←"}</UiText>
        </Pressable>
      )}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function UnitLessonScreen() {
  const { unitId, lessonId } = useLocalSearchParams<{ unitId: string; lessonId: string }>();
  const insets = useSafeAreaInsets();
  const { completeLesson } = useProgress();

  const unit = getUnitById(unitId ?? "");
  const lesson = unit?.lessons.find((l) => l.id === lessonId);
  const { completed, completeAttempt, restartAttempt, activityKey } = useLessonAttempt(`${unitId ?? ""}:${lessonId ?? ""}`);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  const currentIndex = unit && lesson ? unit.lessons.findIndex((l) => l.id === lessonId) : -1;
  const nextLesson = unit && currentIndex >= 0 && currentIndex + 1 < unit.lessons.length ? unit.lessons[currentIndex + 1] : null;

  useEffect(() => {
    if (lesson) { const t = setTimeout(() => speakArabic(lesson.title), 500); return () => clearTimeout(t); }
  }, [lesson]);

  const handleComplete = useCallback(() => {
    if (!lesson) return;
    completeLesson(lesson.id, 3);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    speakArabic("أحسنت! لقد أتممت الدرس");
    completeAttempt();
  }, [lesson, completeLesson, completeAttempt]);

  if (!unit || !lesson) {
    return (
      <ScreenBackground variant="home" style={styles.centered}>
        <UiText style={{ fontSize: 18, color: "#64748B" }}>الدرس غير موجود</UiText>
      </ScreenBackground>
    );
  }

  if (completed) {
    return (
      <ScreenBackground variant="home" style={[styles.completedScreen, { paddingTop: topPad, paddingBottom: botPad + 16 }]}>
        <View style={styles.header}><BackButton /><View style={{ flex: 1 }} /></View>
        <View style={styles.completedContent}>
          <Text style={styles.completedStar}>🌟</Text>
          <Text style={styles.completedTitle}>أَحْسَنْت!</Text>
          <Text style={styles.completedSubtitle}>{lesson.title}</Text>
          <Text style={styles.completedText}>لقد أتممت هذا النشاط بنجاح</Text>
          <Pressable testID="repeat-lesson" style={[styles.nextButton, { backgroundColor: lesson.color }]} onPress={restartAttempt}>
            <UiText style={styles.nextButtonText}>إعادة الدرس</UiText>
          </Pressable>
          {nextLesson ? (
            <Pressable style={[styles.nextButton, { backgroundColor: lesson.color }]} onPress={() => router.replace(`/(tabs)/unit/${unitId}/${nextLesson.id}` as any)}>
              <UiText style={styles.nextButtonText}>النشاط التالي: {nextLesson.title} ←</UiText>
            </Pressable>
          ) : (
            <Pressable style={[styles.nextButton, { backgroundColor: unit.color }]} onPress={() => router.back()}>
              <UiText style={styles.nextButtonText}>🎉 أتممت {unit.title}!</UiText>
            </Pressable>
          )}
          {!nextLesson ? (
            <Pressable testID="repeat-unit" style={[styles.nextButton, { backgroundColor: lesson.color }]} onPress={() => router.replace(`/(tabs)/unit/${unitId}/${unit.lessons[0].id}` as any)}>
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
      case "story":    return <StoryActivity storyTitle={lesson.storyTitle} lines={lesson.lines} color={lesson.color} onComplete={handleComplete} />;
      case "naming":   return <NamingActivity items={lesson.items} color={lesson.color} onComplete={handleComplete} />;
      case "letter_pick": return <LetterPickActivity rounds={lesson.rounds} color={lesson.color} onComplete={handleComplete} />;
      case "word_read":   return <WordReadActivity rounds={lesson.rounds} color={lesson.color} onComplete={handleComplete} />;
      case "listen_pick": return <ListenPickActivity questions={lesson.questions} color={lesson.color} onComplete={handleComplete} />;
    }
  };

  return (
    <ScreenBackground variant="reading" style={[styles.screen, { paddingTop: topPad, paddingBottom: botPad + 16 }]}>
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerCenter}>
          <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
          <Text style={styles.lessonTitle} numberOfLines={1}>{lesson.title}</Text>
        </View>
        <View style={[styles.numberPill, { backgroundColor: lesson.color }]}>
          <Text style={styles.numberPillText}>{lesson.number} / {unit.lessons.length}</Text>
        </View>
      </View>
      <ScrollView key={activityKey} contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {renderActivity()}
      </ScrollView>
    </ScreenBackground>
  );
}

// ── Activity styles ───────────────────────────────────────────────────────────

const act = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingHorizontal: 20, paddingTop: 8, gap: 16 },
  instruction: { fontSize: 14, color: "#475569", fontWeight: "600", textAlign: "center" },
  hint: { fontSize: 13, color: "#94A3B8", textAlign: "center", fontWeight: "500" },
  dotsRow: { flexDirection: "row", gap: 6, justifyContent: "center" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  doneBtn: { borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32, alignItems: "center", marginTop: 8 },
  doneBtnText: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },

  storyTitle: { fontSize: 26, fontWeight: "900", color: "#1E293B", textAlign: "center", marginBottom: 4 },
  storyLine: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#E2E8F0", gap: 10 },
  storyLineEmoji: { fontSize: 22, flexShrink: 0 },
  storyLineText: { flex: 1, fontSize: 18, fontWeight: "700", color: "#1E293B", textAlign: "right" },

  namingGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12, width: "100%" },
  namingCard: { width: 100, height: 100, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#E2E8F0", gap: 4 },
  namingEmoji: { fontSize: 34 },
  namingWord: { fontSize: 13, fontWeight: "700", color: "#1E293B", textAlign: "center" },

  letterDisplay: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 20, padding: 16, borderWidth: 3, width: "75%", gap: 2 },
  letterDisplayHint: { fontSize: 13, color: "#64748B", fontWeight: "600" },
  letterDisplayBig: { fontSize: 72, fontWeight: "900", lineHeight: 88 },
  letterChoicesRow: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 8 },
  letterChoice: { width: 80, height: 80, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  letterChoiceText: { fontSize: 40, fontWeight: "900", color: "#1E293B" },

  wordChoicesCol: { width: "100%", gap: 12 },
  wordChoice: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 16, padding: 16, gap: 8 },
  wordChoiceText: { fontSize: 22, fontWeight: "800", color: "#1E293B", textAlign: "center" },

  listenBtn: { borderRadius: 20, padding: 20, alignItems: "center", gap: 6, minWidth: 200 },
  listenBtnText: { fontSize: 24, fontWeight: "900", color: "#FFFFFF" },
  listenHint: { fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: "600" },

  choicesRow: { flexDirection: "row", justifyContent: "center", gap: 10, flexWrap: "wrap", width: "100%" },
  choiceCard: { minWidth: 90, borderRadius: 16, padding: 12, alignItems: "center", gap: 4 },
  choiceEmoji: { fontSize: 32 },
  choiceWord: { fontSize: 13, fontWeight: "700", color: "#1E293B", textAlign: "center" },
});

// ── Screen styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12 },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, justifyContent: "center" },
  lessonEmoji: { fontSize: 22 },
  lessonTitle: { fontSize: 17, fontWeight: "800", color: "#1E293B", flexShrink: 1 },
  numberPill: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  numberPillText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },
  completedScreen: { flex: 1 },
  completedContent: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 12 },
  completedStar: { fontSize: 72 },
  completedTitle: { fontSize: 36, fontWeight: "900", color: "#1E293B" },
  completedSubtitle: { fontSize: 20, fontWeight: "700", color: "#475569", textAlign: "center" },
  completedText: { fontSize: 15, color: "#64748B", textAlign: "center" },
  nextButton: { borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28, alignItems: "center", marginTop: 16 },
  nextButtonText: { fontSize: 16, fontWeight: "800", color: "#FFFFFF", textAlign: "center" },
  backLink: { marginTop: 8, padding: 8 },
  backLinkText: { fontSize: 14, color: "#94A3B8", fontWeight: "600" },
});
