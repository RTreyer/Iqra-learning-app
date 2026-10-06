/**
 * Writing lesson screen.
 * Shows letter + stroke instructions + a free-draw tracing pad.
 *
 * Validation (on "Done" tap) — all four must pass:
 *  1. Stroke count  — must draw at least lesson.strokeCount distinct strokes.
 *  2. Path length   — total pixel distance drawn ≥ 50 % of the shorter pad side.
 *  3. Bounding box  — bounding box must be adequate in at least one dimension:
 *                     bbW ≥ 20 % of pad width  OR  bbH ≥ 15 % of pad height.
 *  4. Centroid      — mean (x,y) of all points must be within 35 % of pad centre
 *                     in each axis (ensures the drawing is over the guide letter,
 *                     not scribbled in a corner).
 *
 * If any check fails the lesson is NOT completed; an animated error banner is shown
 * and the student must keep trying until the drawing passes all four checks.
 */

import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Path, Svg } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "@/components/BackButton";
import { UiText } from "@/components/UiText";
import { UiChevron } from "@/components/UiChevron";
import { ScreenBackground } from "@/components/ScreenBackground";
import { writingLessons } from "@/constants/lessons";
import { useProgress } from "@/context/ProgressContext";

let Speech: { speak: (text: string, options?: object) => void } | null = null;
try { Speech = require("expo-speech"); } catch { Speech = null; }

function speakArabic(text: string) {
  if (!Speech) return;
  try { Speech.speak(text, { language: "ar", rate: 0.85 }); } catch {}
}

// ── Path parsing ───────────────────────────────────────────────────────────────

type Point = { x: number; y: number };

/** Extract all M/L coordinate pairs from an SVG path data string. */
function parsePoints(d: string): Point[] {
  const pts: Point[] = [];
  const tokens = d.split(/\s+/);
  for (let i = 0; i < tokens.length - 2; i++) {
    const cmd = tokens[i];
    if (cmd === "M" || cmd === "L") {
      const x = parseFloat(tokens[i + 1]);
      const y = parseFloat(tokens[i + 2]);
      if (!isNaN(x) && !isNaN(y)) pts.push({ x, y });
    }
  }
  return pts;
}

// ── Validation ─────────────────────────────────────────────────────────────────

type ValidationResult = { valid: true } | { valid: false; msg: string };

function validateTracing(
  paths: string[],
  strokeCount: number,
  padW: number,
  padH: number
): ValidationResult {
  // 1 — enough distinct strokes?
  if (paths.length < strokeCount) {
    return {
      valid: false,
      msg:
        strokeCount === 1
          ? "اِرسم خطاً واحداً على الأقل ✏️"
          : `اِرسم ${strokeCount} خطوط على الأقل ✏️`,
    };
  }

  // Parse all points from every completed stroke
  const all: Point[] = paths.flatMap(parsePoints);
  if (all.length < 10) {
    return { valid: false, msg: "اِرسم الحرف بشكل أكبر 📏" };
  }

  // 2 — total path length: sum of Euclidean distances between consecutive points.
  //     Must be at least 50 % of the shorter pad dimension.
  let totalLen = 0;
  for (const d of paths) {
    const pts = parsePoints(d);
    for (let i = 1; i < pts.length; i++) {
      totalLen += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    }
  }
  const minLen = Math.min(padW, padH) * 0.5;
  if (totalLen < minLen) {
    return { valid: false, msg: "اِرسم الحرف بشكل أكبر 📏" };
  }

  // 3 — bounding box: at least one dimension must be adequate.
  const xs = all.map((p) => p.x);
  const ys = all.map((p) => p.y);
  const bbW = Math.max(...xs) - Math.min(...xs);
  const bbH = Math.max(...ys) - Math.min(...ys);

  if (bbW < padW * 0.2 && bbH < padH * 0.15) {
    return { valid: false, msg: "اِرسم الحرف بشكل أكبر 📏" };
  }

  // 4 — centroid must be within 35 % of pad centre in each axis.
  //     This catches drawings scribbled in a corner far from the guide letter.
  const meanX = all.reduce((s, p) => s + p.x, 0) / all.length;
  const meanY = all.reduce((s, p) => s + p.y, 0) / all.length;
  const offX = Math.abs(meanX - padW / 2) / padW;   // 0 = perfect centre, 0.5 = edge
  const offY = Math.abs(meanY - padH / 2) / padH;

  if (offX > 0.35 || offY > 0.35) {
    return { valid: false, msg: "اِرسم الحرف في وسط المساحة 🎯" };
  }

  return { valid: true };
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function WritingLessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { completeLesson, getLessonProgress } = useProgress();

  const lesson = writingLessons.find((l) => l.id === id);

  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [isDone, setIsDone] = useState(false);
  const [hasDrew, setHasDrew] = useState(false);
  const [padLayout, setPadLayout] = useState({ width: 300, height: 300 });

  // Error feedback state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [padError, setPadError] = useState(false);      // flashes pad border red
  const errorAnim = useRef(new Animated.Value(0)).current;

  // Success animation
  const celebAnim = useRef(new Animated.Value(0)).current;

  const prog = getLessonProgress(id ?? "");

  useEffect(() => {
    if (lesson) {
      const t = setTimeout(() => speakArabic(lesson.ttsLearn), 500);
      return () => clearTimeout(t);
    }
  }, [lesson]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        if (isDone) return;
        const { locationX, locationY } = e.nativeEvent;
        setCurrentPath(`M ${locationX.toFixed(1)} ${locationY.toFixed(1)}`);
        setHasDrew(true);
        // Clear any error flash when user starts drawing again
        setPadError(false);
      },
      onPanResponderMove: (e) => {
        if (isDone) return;
        const { locationX, locationY } = e.nativeEvent;
        setCurrentPath((prev) =>
          `${prev} L ${locationX.toFixed(1)} ${locationY.toFixed(1)}`
        );
      },
      onPanResponderRelease: () => {
        if (isDone) return;
        setCurrentPath((prev) => {
          if (prev) setPaths((ps) => [...ps, prev]);
          return "";
        });
      },
    })
  ).current;

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPadLayout({ width, height });
  }, []);

  const handleClear = useCallback(() => {
    setPaths([]);
    setCurrentPath("");
    setHasDrew(false);
    setErrorMsg(null);
    setPadError(false);
    errorAnim.setValue(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [errorAnim]);

  const showError = useCallback(
    (msg: string) => {
      setErrorMsg(msg);
      setPadError(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      speakArabic("حاول مجدداً! اِرسم الحرف بشكل صحيح");

      // Shake animation on the error banner
      errorAnim.setValue(0);
      Animated.sequence([
        Animated.timing(errorAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(errorAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(errorAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(errorAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();

      // Dismiss error banner after 3 seconds but keep pad error styling until user draws again
      setTimeout(() => setErrorMsg(null), 3000);
    },
    [errorAnim]
  );

  const handleDone = useCallback(() => {
    if (!lesson || isDone) return;

    const result = validateTracing(
      paths,
      lesson.strokeCount,
      padLayout.width,
      padLayout.height
    );

    if (!result.valid) {
      showError(result.msg);
      return; // 🚫 Do NOT mark complete
    }

    // ✅ All checks passed — celebrate!
    setIsDone(true);
    setPadError(false);
    setErrorMsg(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    speakArabic("أحسنت! لقد كتبتَ الحرف بنجاح!");
    completeLesson(id!, lesson.stars);
    Animated.spring(celebAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 6,
    }).start();
  }, [lesson, isDone, paths, padLayout, showError, id, completeLesson, celebAnim]);

  const handleNext = useCallback(() => {
    const idx = writingLessons.findIndex((l) => l.id === id);
    const next = writingLessons[idx + 1];
    if (next) router.replace(`/(tabs)/writing/${next.id}`);
    else router.push("/(tabs)/writing");
  }, [id]);

  if (!lesson) {
    return (
      <View style={styles.centered}>
        <Text>Lesson not found</Text>
      </View>
    );
  }

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad =
    Platform.OS === "web" ? Math.max(insets.bottom, 34) : insets.bottom;

  const celebScale = celebAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1.2, 1],
  });

  const errorShake = errorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  return (
    <ScreenBackground
      variant="writing"
      style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        {prog.completed
          ? <Feather name="check-circle" size={24} color="#10B981" />
          : <View style={{ width: 24 }} />}
      </View>

      {/* Letter + stroke guide */}
      <View style={styles.topRow}>
        <Pressable style={styles.letterCard} onPress={() => speakArabic(lesson.ttsLearn)}>
          <Text style={styles.bigLetter}>{lesson.letter}</Text>
          <Text style={styles.letterEmoji}>{lesson.emoji}</Text>
        </Pressable>
        <View style={styles.strokesPanel}>
          <Text style={styles.strokesHeader}>طريقة الكتابة:</Text>
          {lesson.strokes.map((step, i) => (
            <View key={i} style={styles.strokeRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
          <View style={styles.paperNote}>
            <Feather name="file-text" size={14} color="#6D28D9" />
            <Text style={styles.paperNoteText}>يمكنك التدرُّب على الورق أيضاً</Text>
          </View>
        </View>
      </View>

      {/* Tracing pad */}
      <View style={styles.padContainer}>
        <Text style={styles.padLabel}>تَتَبَّع الحرف بأصبعك ✏️</Text>

        {/* Error banner — shown on validation failure */}
        {errorMsg && (
          <Animated.View
            style={[
              styles.errorBanner,
              { transform: [{ translateX: errorShake }] },
            ]}
          >
            <Feather name="alert-circle" size={18} color="#FFFFFF" />
            <Text style={styles.errorBannerText}>{errorMsg}</Text>
          </Animated.View>
        )}

        <View
          style={[
            styles.tracingPad,
            padError && !isDone && styles.tracingPadError,
          ]}
          onLayout={handleLayout}
          {...panResponder.panHandlers}
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.guideLetter}>{lesson.letter}</Text>
          <Svg style={StyleSheet.absoluteFillObject}>
            {paths.map((d, i) => (
              <Path
                key={i}
                d={d}
                stroke="#7C3AED"
                strokeWidth={10}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {currentPath ? (
              <Path
                d={currentPath}
                stroke="#7C3AED"
                strokeWidth={10}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
          </Svg>
          {!hasDrew && !isDone && (
            <Text style={styles.padHint}>اِرسم هنا بأصبعك</Text>
          )}
        </View>

        {!isDone && (
          <View style={styles.controls}>
            <Pressable style={[styles.controlBtn, styles.clearBtn]} onPress={handleClear}>
              <Feather name="trash-2" size={20} color="#7C3AED" />
              <UiText style={styles.clearBtnText}>مسح</UiText>
            </Pressable>
            <Pressable
              style={[
                styles.controlBtn,
                styles.doneBtn,
                !hasDrew && styles.doneBtnDisabled,
              ]}
              onPress={handleDone}
              disabled={!hasDrew}
            >
              <Feather name="check" size={22} color="#FFFFFF" />
              <UiText style={styles.doneBtnText}>أنهيتُ</UiText>
            </Pressable>
          </View>
        )}
      </View>

      {/* Celebration overlay — only shown after validation passes */}
      {isDone && (
        <Animated.View
          style={[
            styles.celebration,
            {
              transform: [{ scale: celebScale }],
              opacity: celebAnim,
            },
          ]}
        >
          <Text style={styles.celebEmoji}>🌟🌟🌟</Text>
          <Text style={styles.celebText}>رائع! كتبتَ الحرف!</Text>
          <Pressable style={styles.nextBtn} onPress={handleNext}>
            <UiChevron size={26} color="#FFFFFF" />
            <UiText style={styles.nextBtnText}>
              {writingLessons.findIndex((l) => l.id === id) <
              writingLessons.length - 1
                ? "الحرف التالي"
                : "العودة"}
            </UiText>
          </Pressable>
        </Animated.View>
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
  lessonTitle: { fontSize: 22, fontWeight: "700", color: "#1E293B" },
  topRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
    marginBottom: 14,
  },
  letterCard: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20,
    padding: 14,
    alignItems: "center",
    gap: 6,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 90,
  },
  bigLetter: { fontSize: 60, fontWeight: "800", color: "#7C3AED", lineHeight: 74 },
  letterEmoji: { fontSize: 28 },
  strokesPanel: {
    flex: 1,
    backgroundColor: "rgba(237,233,254,0.85)",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  strokesHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: "#5B21B6",
    textAlign: "right",
    marginBottom: 2,
  },
  strokeRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNumber: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  stepText: {
    fontSize: 14,
    color: "#3B0764",
    flex: 1,
    textAlign: "right",
    lineHeight: 20,
  },
  paperNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#DDD6FE",
    paddingTop: 8,
  },
  paperNoteText: { fontSize: 12, color: "#6D28D9", flex: 1, textAlign: "right" },
  padContainer: { flex: 1, gap: 8 },
  padLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5B21B6",
    textAlign: "center",
  },
  // ── Error banner ─────────────────────────────────────────────────────────────
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
  },
  errorBannerText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  // ── Tracing pad ──────────────────────────────────────────────────────────────
  tracingPad: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#C4B5FD",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    minHeight: 160,
  },
  tracingPadError: {
    borderColor: "#EF4444",
    borderWidth: 3,
    backgroundColor: "rgba(254,242,242,0.90)",
  },
  guideLetter: {
    fontSize: 160,
    fontWeight: "800",
    color: "#EDE9FE",
    lineHeight: 200,
    textAlign: "center",
  },
  padHint: { position: "absolute", bottom: 16, fontSize: 14, color: "#A78BFA" },
  // ── Controls ─────────────────────────────────────────────────────────────────
  controls: { flexDirection: "row", gap: 12, justifyContent: "space-between" },
  controlBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
  },
  clearBtn: {
    backgroundColor: "rgba(237,233,254,0.9)",
    borderWidth: 2,
    borderColor: "#C4B5FD",
  },
  clearBtnText: { fontSize: 17, fontWeight: "700", color: "#7C3AED" },
  doneBtn: {
    backgroundColor: "#7C3AED",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  doneBtnDisabled: { backgroundColor: "#C4B5FD" },
  doneBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
  // ── Celebration ───────────────────────────────────────────────────────────────
  celebration: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 10,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  celebEmoji: { fontSize: 36 },
  celebText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#5B21B6",
    textAlign: "center",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  nextBtnText: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
});
