import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Path, Svg } from "react-native-svg";
import { UiText } from "@/components/UiText";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { ProgressDots } from "./shared/ProgressDots";
import { ADVANCE_MS } from "./shared/useQuiz";
import { withAttemptReset } from "./shared/withAttemptReset";
import { PAD_FALLBACK, PAD_MAX, trace, webPad } from "./trace/styles";
import { strokeToPath, validateTracing, type Stroke } from "./trace/validate";
import type { ActivityProps } from "./types";

const ERROR_VISIBLE_MS = 3000;
const PLATFORM_PAD = Platform.OS === "web" ? webPad : null;

function Trace({ lesson, color, onComplete }: ActivityProps<"trace">) {
  const { targets } = lesson;
  const [targetIndex, setTargetIndex] = useState(0);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [livePath, setLivePath] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [padError, setPadError] = useState(false);
  const [passed, setPassed] = useState(false);
  const [padSize, setPadSize] = useState(PAD_FALLBACK);
  const [shake] = useState(() => new Animated.Value(0));
  /** Stroke being drawn; mutated per pointer move, flushed to `livePath` once per frame. */
  const current = useRef<Stroke | null>(null);
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
      setLivePath(current.current ? strokeToPath(current.current) : "");
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
        if (locked.current) return;
        current.current = [{ x: e.x, y: e.y }];
        setPadError(false);
        schedule();
      })
      .onUpdate((e) => {
        if (!current.current) return;
        current.current.push({ x: e.x, y: e.y });
        schedule();
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

  const paths = useMemo(() => strokes.map(strokeToPath), [strokes]);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const next = Math.min(PAD_MAX, Math.floor(e.nativeEvent.layout.width));
    if (next > 0) setPadSize((prev) => (prev === next ? prev : next));
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
    const result = validateTracing(strokes, { width: padSize, height: padSize }, target.strokeCount ?? 1);
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
    speak("أحسنت!");
    advanceTimer.current = setTimeout(() => {
      if (targetIndex + 1 >= targets.length) {
        onComplete({ correct: 0, total: 0 });
        return;
      }
      locked.current = false;
      setStrokes([]);
      setPassed(false);
      setTargetIndex(targetIndex + 1);
    }, ADVANCE_MS);
  }, [strokes, padSize, target.strokeCount, shake, targetIndex, targets.length, onComplete]);

  const translateX = shake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const padDims = { width: padSize, height: padSize };
  const guideFont = { color, fontSize: Math.round(padSize * 0.55), lineHeight: Math.round(padSize * 0.75) };

  return (
    <View style={trace.container}>
      <ProgressDots count={targets.length} current={targetIndex} color={color} />
      <View style={trace.header}>
        {target.emoji ? <Text style={trace.emoji}>{target.emoji}</Text> : null}
        <Text style={[trace.label, { color }]}>{target.label}</Text>
      </View>
      {error ? (
        <Animated.View style={[trace.errorBanner, { transform: [{ translateX }] }]} accessibilityLiveRegion="polite">
          <Text testID="trace-error" style={trace.errorText}>
            {error}
          </Text>
        </Animated.View>
      ) : null}
      <View style={trace.measure} onLayout={handleLayout}>
        <GestureDetector gesture={gesture}>
          <View
            testID="trace-pad"
            collapsable={false}
            style={[trace.pad, padDims, padError && trace.padError, passed && trace.padPassed, PLATFORM_PAD]}
          >
            <Text style={[trace.guide, guideFont]}>{target.guide}</Text>
            <Svg style={StyleSheet.absoluteFill} width={padSize} height={padSize}>
              {paths.map((d, i) => (
                <Path key={i} d={d} stroke={color} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ))}
              {livePath ? (
                <Path d={livePath} stroke={color} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ) : null}
            </Svg>
          </View>
        </GestureDetector>
        <View style={trace.controls}>
          <Pressable testID="trace-clear" accessibilityRole="button" style={[trace.button, trace.clear]} onPress={handleClear}>
            <UiText style={trace.clearText}>مسح</UiText>
          </Pressable>
          <Pressable
            testID="trace-done"
            accessibilityRole="button"
            style={[trace.button, { backgroundColor: color }]}
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
