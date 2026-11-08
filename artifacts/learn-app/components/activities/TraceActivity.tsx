import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
} from "react";
import { useLine } from "@/components/Gloss";
import { Picture } from "@/components/pictures/Picture";
import { Animated, Platform, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { Pressable } from "@/components/demo/DemoPressable";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import { Path, Svg } from "react-native-svg";
import { measureNode, useDemoEntry, type DemoEntry } from "@/components/demo/DemoContext";
import { useLanguage } from "@/context/LanguageContext";
import * as haptics from "@/lib/haptics";
import { readableFill } from "@/theme/tokens";
import { speak } from "@/lib/speech";
import { PRAISE } from "./shared/strings";
import { StoryProgress } from "./shared/StoryProgress";
import { useLatest } from "./shared/useLatest";
import { ADVANCE_MS } from "./shared/useQuiz";
import { withAttemptReset } from "./shared/withAttemptReset";
import { CONTROLS_FALLBACK, PAD_FALLBACK, PAD_GAP, PAD_MAX, trace, webPad } from "./trace/styles";
import { densify, guidePath } from "./trace/guidePath";
import { addPoint, startStroke, type DrawnStroke } from "./trace/path";
import { decodeMask, validateOnGuide, validateTracing } from "./trace/validate";
import { TRACE_GRID, traceGuides } from "@/content/generated/traceGuides";
import type { ActivityProps } from "./types";
import { useGuide } from "@/components/world/LessonGuide";
import { Icon } from "@/components/world/Icon";

const ERROR_VISIBLE_MS = 3000;
/** Smallest pad, however short the screen. */
const PAD_MIN = 120;
/** Distance between the points of a demo line, in pixels. */
const DEMO_STEP = 6;

/** Two letters or more (يد، بيت): a word, for the wording of hints. */
const isWord = (guide: string) => guide.replace(/[ً-ْـ\s]/g, "").length > 1;

/** Text guides only (a guide without a generated outline): a letter fills the pad, a word shrinks to fit. */
export function guideScale(guide: string): number {
  const letters = guide.replace(/[ً-ْـ\s]/g, "").length;
  return letters <= 2 ? 0.55 : Math.max(0.2, 1.1 / letters);
}
const PLATFORM_PAD = Platform.OS === "web" ? webPad : null;

type LiveStrokeHandle = { set: (d: string) => void };

/**
 * The stroke under the finger, in its own layer: a finger move redraws only this, not the
 * guide, the finished strokes or the rest of the screen.
 */
function LiveStroke({
  ref,
  color,
  size,
}: {
  ref: React.Ref<LiveStrokeHandle>;
  color: string;
  size: number;
}) {
  const [d, setD] = useState("");
  useImperativeHandle(ref, () => ({ set: setD }), []);
  if (!d) return null;
  return (
    <Svg style={StyleSheet.absoluteFill} width={size} height={size}>
      <Path
        d={d}
        stroke={color}
        strokeWidth={10}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Trace({ lesson, color, onComplete }: ActivityProps<"trace">) {
  const line = useLine();
  const guide = useGuide();
  const { targets } = lesson;
  const { t } = useLanguage();
  const [targetIndex, setTargetIndex] = useState(0);
  const [strokes, setStrokes] = useState<DrawnStroke[]>([]);
  const live = useRef<LiveStrokeHandle | null>(null);
  const setLivePath = useCallback((d: string) => live.current?.set(d), []);
  const [error, setError] = useState<string | null>(null);
  const [padError, setPadError] = useState(false);
  const [passed, setPassed] = useState(false);
  const [padSize, setPadSize] = useState(PAD_FALLBACK);
  const [shake] = useState(() => new Animated.Value(0));
  /** Stroke being drawn; mutated per pointer move, flushed to the live layer once per frame. */
  const current = useRef<DrawnStroke | null>(null);
  /** Strokes are only accepted once the pad has been measured, since validation depends on its size. */
  const measuredSize = useRef<number | null>(null);
  /** Room for the pad and the buttons below it, and the buttons' height, as last measured. */
  const room = useRef<{ width: number; height: number } | null>(null);
  const controlsHeight = useRef(CONTROLS_FALLBACK);
  const completeRef = useLatest(onComplete);
  const frame = useRef<number | null>(null);
  const locked = useRef(false);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const target = targets[targetIndex];
  /** Outline and mask of the guide (letters, words and the line drawings of unit 1). */
  const shape = traceGuides[target.guide];

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

  /** In a demo the hand follows the guide's centre line and the stroke appears under it. */
  const padNode = useRef<ComponentRef<typeof View> | null>(null);
  const demoEntry = useMemo<DemoEntry>(
    () => ({
      testID: "trace-pad",
      measure: () => measureNode(padNode.current),
      tracePath: (relative) =>
        relative
          ? densify(
              relative.map((p) => ({ x: p.x * padSize, y: p.y * padSize })),
              DEMO_STEP,
            )
          : shape
            ? guidePath(decodeMask(shape.mask, TRACE_GRID), padSize)
            : null,
      draw: (points, final) => {
        if (points.length === 0) return;
        const stroke = startStroke(points[0]);
        for (const p of points.slice(1)) addPoint(stroke, p);
        if (!final) return setLivePath(stroke.d);
        setLivePath("");
        setStrokes([stroke]);
      },
    }),
    [shape, padSize, setLivePath],
  );
  useDemoEntry(demoEntry);

  /** Draws the stroke in progress at most once per frame. */
  const scheduleFlush = () => {
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      setLivePath(current.current ? current.current.d : "");
    });
  };

  const gesture = usePanGesture({
    minDistance: 0,
    shouldCancelWhenOutside: false,
    runOnJS: true,
    testID: "trace-pad",
    // One finger draws; a second one (a palm, another child) must not jump the stroke.
    maxPointers: 1,
    onBegin: (e) => {
      if (locked.current || measuredSize.current === null) return;
      if (!Number.isFinite(e.x) || !Number.isFinite(e.y)) return;
      current.current = startStroke({ x: e.x, y: e.y });
      setPadError(false);
      scheduleFlush();
    },
    onUpdate: (e) => {
      if (current.current && addPoint(current.current, { x: e.x, y: e.y })) scheduleFlush();
    },
    onFinalize: () => {
      const stroke = current.current;
      current.current = null;
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
      setLivePath("");
      if (stroke) setStrokes((prev) => [...prev, stroke]);
    },
  });

  /** Sizes the pad to the room: as wide as it can be, but never pushing the buttons off screen. */
  const fit = useCallback(() => {
    if (!room.current) return;
    const { width, height } = room.current;
    // Without a height (not laid out yet) only the width counts; a pad stays big enough to draw on.
    const tall =
      height > 0 ? Math.max(PAD_MIN, height - controlsHeight.current - PAD_GAP) : Infinity;
    const next = Math.floor(Math.min(PAD_MAX, width, tall));
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
  }, [setLivePath]);

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      room.current = { width, height };
      fit();
    },
    [fit],
  );

  const handleControlsLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { height } = e.nativeEvent.layout;
      if (!(height > 0) || height === controlsHeight.current) return;
      controlsHeight.current = height;
      fit();
    },
    [fit],
  );

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
    const pad = { width: padSize, height: padSize };
    // With a letter to trace, its size is judged against the letter, not the pad.
    let result = validateTracing(points, pad, target.strokeCount ?? 1, Boolean(shape));
    // Arabic guides: the drawing must also lie on the letter and cover half of it.
    if (result.valid && shape)
      result = validateOnGuide(
        points,
        pad,
        decodeMask(shape.mask, TRACE_GRID),
        isWord(target.guide),
      );
    if (!result.valid) {
      setError(result.msg);
      setPadError(true);
      haptics.warning();
      guide.react("wrong");
      speak("حاول مرة أخرى");
      shake.setValue(0);
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
      if (errorTimer.current) clearTimeout(errorTimer.current);
      errorTimer.current = setTimeout(() => {
        setError(null);
        setPadError(false);
      }, ERROR_VISIBLE_MS);
      return;
    }
    locked.current = true;
    setPassed(true);
    setError(null);
    setPadError(false);
    haptics.success();
    guide.react("right");
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
  }, [
    strokes,
    padSize,
    target.strokeCount,
    target.guide,
    shape,
    shake,
    targetIndex,
    targets.length,
    completeRef,
    guide,
  ]);

  const translateX = shake.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const padDims = { width: padSize, height: padSize };
  // Memoised: they stay as they are while the finger moves.
  const guideArt = useMemo(
    () =>
      shape ? (
        <Svg
          testID="trace-guide"
          style={StyleSheet.absoluteFill}
          width={padSize}
          height={padSize}
          viewBox="0 0 100 100"
        >
          <Path d={shape.d} fill={color} opacity={0.18} />
        </Svg>
      ) : (
        <Text
          style={[
            trace.guide,
            {
              color,
              fontSize: Math.round(padSize * guideScale(target.guide)),
              lineHeight: Math.round(padSize * 0.75),
            },
          ]}
        >
          {target.guide}
        </Text>
      ),
    [shape, padSize, color, target.guide],
  );
  const drawn = useMemo(
    () => (
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
      </Svg>
    ),
    [strokes, padSize, color],
  );

  return (
    <View style={trace.container}>
      <StoryProgress count={targets.length} current={targetIndex} color={color} />
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
        {target.emoji ? <Picture emoji={target.emoji} size={44} /> : null}
        <Text style={[trace.label, { color: readableFill(color) }]}>{line(target.label)}</Text>
      </View>
      <View testID="trace-measure" style={trace.measure} onLayout={handleLayout}>
        <GestureDetector gesture={gesture}>
          <View
            ref={padNode}
            testID="trace-pad"
            accessible
            accessibilityRole="image"
            accessibilityLabel={line(target.label)}
            accessibilityHint={t("ارسم بإصبعك")}
            collapsable={false}
            style={[trace.pad, padDims, padError && trace.padError, PLATFORM_PAD]}
          >
            {guideArt}
            {drawn}
            <LiveStroke ref={live} color={color} size={padSize} />
            <View
              pointerEvents="none"
              style={[
                trace.padBorder,
                padError && trace.padBorderError,
                passed && trace.padBorderPassed,
              ]}
            />
          </View>
        </GestureDetector>
        <View testID="trace-controls" style={trace.controls} onLayout={handleControlsLayout}>
          <Pressable
            testID="trace-clear"
            accessibilityRole="button"
            accessibilityLabel={t("مسح")}
            style={[trace.button, trace.clear]}
            onPress={handleClear}
          >
            <Icon name="replay" size={28} color="#7C3AED" strokeWidth={2.6} />
          </Pressable>
          <Pressable
            testID="trace-done"
            accessibilityRole="button"
            accessibilityLabel={t("تم")}
            style={[trace.button, { backgroundColor: readableFill(color) }]}
            onPress={handleDone}
          >
            <Icon name="check" size={34} color="#FFFFFF" strokeWidth={3} />
          </Pressable>
        </View>
        {error ? (
          // Over the pad, so the pad keeps its size (and the drawing) while it shows.
          <View style={trace.errorOverlay} pointerEvents="none">
            <Animated.View
              style={[trace.errorBanner, { transform: [{ translateX }] }]}
              accessibilityLiveRegion="polite"
            >
              <Text testID="trace-error" style={trace.errorText}>
                {error}
              </Text>
            </Animated.View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export const TraceActivity = withAttemptReset(Trace, "TraceActivity");
