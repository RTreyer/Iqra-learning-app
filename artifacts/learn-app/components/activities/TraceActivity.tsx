import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Path, Svg } from "react-native-svg";
import { UiText } from "@/components/UiText";
import { useLanguage } from "@/context/LanguageContext";
import * as haptics from "@/lib/haptics";
import { readableFill } from "@/theme/tokens";
import { speak } from "@/lib/speech";
import { PRAISE } from "./shared/strings";
import { ProgressDots } from "./shared/ProgressDots";
import { useLatest } from "./shared/useLatest";
import { ADVANCE_MS } from "./shared/useQuiz";
import { withAttemptReset } from "./shared/withAttemptReset";
import { PAD_FALLBACK, PAD_MAX, trace, webPad } from "./trace/styles";
import { addPoint, startStroke, type DrawnStroke } from "./trace/path";
import { validateTracing } from "./trace/validate";
import type { ActivityProps } from "./types";

const ERROR_VISIBLE_MS = 3000;

/** Guide size as a share of the pad: a letter fills it, a whole word (يبني) shrinks to fit. */
export function guideScale(guide: string): number {
  const letters = guide.replace(/[ً-ْـ\s]/g, "").length;
  return letters <= 2 ? 0.55 : Math.max(0.2, 1.1 / letters);
}
const PLATFORM_PAD = Platform.OS === "web" ? webPad : null;

function Trace({ lesson, color, onComplete }: ActivityProps<"trace">) {
  const { targets } = lesson;
  const { t } = useLanguage();
  const [targetIndex, setTargetIndex] = useState(0);
  const [strokes, setStrokes] = useState<DrawnStroke[]>([]);
  const [livePath, setLivePath] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [padError, setPadError] = useState(false);
  const [passed, setPassed] = useState(false);
  const [padSize, setPadSize] = useState(PAD_FALLBACK);
  const [shake] = useState(() => new Animated.Value(0));
  /** Stroke being drawn; mutated per pointer move, flushed to `livePath` once per frame. */
  const current = useRef<DrawnStroke | null>(null);
  /** Strokes are only accepted once the pad has been measured, since validation depends on its size. */
  const measuredSize = useRef<number | null>(null);
  const completeRef = useLatest(onComplete);
  const frame = useRef<number | null>(null);
  const locked = useRef(false);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const target = targets[targetIndex];

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      if (errorTimer.current) clearTimeout(errorTimer.current);
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    },
    [],
  );

  useEffect(() => {
    speak(target.tts);
  }, [target.tts, targetIndex]);

  const gesture = useMemo(() => {
    const flush = () => {
      frame.current = null;
      setLivePath(current.current ? current.current.d : "");
    };
    const schedule = () => {
      if (frame.current === null) frame.current = requestAnimationFrame(flush);
    };
    return Gesture.Pan()
      .minDistance(0)
      .shouldCancelWhenOutside(false)
      .runOnJS(true)
      .withTestId("trace-pad")
      .onBegin((e) => {
        if (locked.current || measuredSize.current === null) return;
        if (!Number.isFinite(e.x) || !Number.isFinite(e.y)) return;
        current.current = startStroke({ x: e.x, y: e.y });
        setPadError(false);
        schedule();
      })
      .onUpdate((e) => {
        if (current.current && addPoint(current.current, { x: e.x, y: e.y })) schedule();
      })
      .onFinalize(() => {
        const stroke = current.current;
        current.current = null;
        if (frame.current !== null) cancelAnimationFrame(frame.current);
        frame.current = null;
        setLivePath("");
        if (stroke) setStrokes((prev) => [...prev, stroke]);
      });
  }, []);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const next = Math.min(PAD_MAX, Math.floor(e.nativeEvent.layout.width));
    if (!(next > 0) || next === measuredSize.current) return;
    // Strokes drawn at another size would be judged against the wrong pad: start over.
    const resized = measuredSize.current !== null;
    measuredSize.current = next;
    setPadSize(next);
    if (resized) {
      current.current = null;
      setLivePath("");
      setStrokes([]);
    }
  }, []);

  const handleClear = useCallback(() => {
    if (locked.current) return;
    haptics.tap();
    setStrokes([]);
    setError(null);
    setPadError(false);
  }, []);

  const handleDone = useCallback(() => {
    if (locked.current) return;
    const points = strokes.map((s) => s.points);
    const result = validateTracing(
      points,
      { width: padSize, height: padSize },
      target.strokeCount ?? 1,
    );
    if (!result.valid) {
      setError(result.msg);
      setPadError(true);
      haptics.warning();
      speak("حاول مرة أخرى");
      shake.setValue(0);
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
      if (errorTimer.current) clearTimeout(errorTimer.current);
      errorTimer.current = setTimeout(() => setError(null), ERROR_VISIBLE_MS);
      return;
    }
    locked.current = true;
    setPassed(true);
    setError(null);
    setPadError(false);
    haptics.success();
    speak(PRAISE);
    advanceTimer.current = setTimeout(() => {
      if (targetIndex + 1 >= targets.length) {
        completeRef.current({ correct: 0, total: 0 });
        return;
      }
      locked.current = false;
      setStrokes([]);
      setPassed(false);
      setTargetIndex(targetIndex + 1);
    }, ADVANCE_MS);
  }, [strokes, padSize, target.strokeCount, shake, targetIndex, targets.length, completeRef]);

  const translateX = shake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const padDims = { width: padSize, height: padSize };
  const guideFont = {
    color,
    fontSize: Math.round(padSize * guideScale(target.guide)),
    lineHeight: Math.round(padSize * 0.75),
  };

  return (
    <View style={trace.container}>
      <ProgressDots count={targets.length} current={targetIndex} color={color} />
      {lesson.sentence ? (
        <Text testID="trace-sentence" style={trace.sentence} accessibilityLabel={lesson.sentence}>
          {lesson.sentence.split(" ").map((word, i, all) => (
            <Text
              key={i}
              style={
                i < targetIndex || (passed && i === targetIndex)
                  ? { color: readableFill(color) }
                  : i === targetIndex
                    ? [trace.sentenceCurrent, { textDecorationColor: color }]
                    : trace.sentenceLater
              }
            >
              {word}
              {i < all.length - 1 ? " " : ""}
            </Text>
          ))}
        </Text>
      ) : null}
      <View style={trace.header}>
        {target.emoji ? <Text style={trace.emoji}>{target.emoji}</Text> : null}
        <Text style={[trace.label, { color: readableFill(color) }]}>{target.label}</Text>
      </View>
      {error ? (
        <Animated.View
          style={[trace.errorBanner, { transform: [{ translateX }] }]}
          accessibilityLiveRegion="polite"
        >
          <Text testID="trace-error" style={trace.errorText}>
            {error}
          </Text>
        </Animated.View>
      ) : null}
      <View testID="trace-measure" style={trace.measure} onLayout={handleLayout}>
        <GestureDetector gesture={gesture}>
          <View
            testID="trace-pad"
            accessible
            accessibilityRole="image"
            accessibilityLabel={target.label}
            accessibilityHint={t("ارسم بإصبعك")}
            collapsable={false}
            style={[
              trace.pad,
              padDims,
              padError && trace.padError,
              passed && trace.padPassed,
              PLATFORM_PAD,
            ]}
          >
            <Text style={[trace.guide, guideFont]}>{target.guide}</Text>
            <Svg style={StyleSheet.absoluteFill} width={padSize} height={padSize}>
              {strokes.map((s, i) => (
                <Path
                  key={i}
                  d={s.d}
                  stroke={color}
                  strokeWidth={10}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {livePath ? (
                <Path
                  d={livePath}
                  stroke={color}
                  strokeWidth={10}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
            </Svg>
          </View>
        </GestureDetector>
        <View style={trace.controls}>
          <Pressable
            testID="trace-clear"
            accessibilityRole="button"
            accessibilityLabel={t("مسح")}
            style={[trace.button, trace.clear]}
            onPress={handleClear}
          >
            <UiText style={trace.clearText}>مسح</UiText>
          </Pressable>
          <Pressable
            testID="trace-done"
            accessibilityRole="button"
            accessibilityLabel={t("تم")}
            style={[trace.button, { backgroundColor: readableFill(color) }]}
            onPress={handleDone}
          >
            <UiText style={trace.doneText}>تم</UiText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export const TraceActivity = withAttemptReset(Trace, "TraceActivity");
